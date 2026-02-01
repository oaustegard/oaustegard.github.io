/* bsky-thread.js - Module for processing Bluesky thread data */

import {
    getPublicAgent,
    processPost,
    formatPostForOutput,
    safeGetCreatedAt,
    debugLog,
    resetProcessing,
    extractPostInfo,
    displayOutput,
    setLoading,
    updateQueryParam,
    getQueryParam
} from './bsky-core.js';

/* Process thread in the default way (recursively processing replies) */
export async function processThread(postInfo, filterMode = 'all') {
    debugLog.clear();
    debugLog.add('process_thread_start', postInfo);
    debugLog.add('filter_mode', filterMode);

    /* Reset processing state */
    resetProcessing();

    try {
        const agent = getPublicAgent();
        const threadData = await agent.getPostThread({
            uri: `at://${postInfo.handle}/app.bsky.feed.post/${postInfo.postId}`,
            depth: 100
        });

        debugLog.add('thread_data', threadData);

        if (!threadData?.data?.thread?.post) {
            throw new Error('Invalid thread data received');
        }

        const rootTime = safeGetCreatedAt(threadData.data.thread.post);
        const rootAuthorDid = threadData.data.thread.post.author.did;

        /* Helper to check if a post's author is the root author (P1) */
        function isP1Author(node) {
            return node?.post?.author?.did === rootAuthorDid;
        }

        /* Helper to check if any reply in a subtree contains a P1 response */
        function hasP1Response(node) {
            if (!node?.replies || !Array.isArray(node.replies)) {
                return false;
            }

            /* Check if any direct reply is from P1 */
            for (const reply of node.replies) {
                if (isP1Author(reply)) {
                    return true;
                }
                /* Recursively check nested replies */
                if (hasP1Response(reply)) {
                    return true;
                }
            }

            return false;
        }

        function processNode(node, parentIsP1 = true) {
            debugLog.add('process_node', node);

            if (!node?.post) {
                debugLog.add('invalid_node', node);
                return null;
            }

            const currentIsP1 = isP1Author(node);

            /* Apply filtering based on mode */
            if (filterMode === 'p1-only' && !currentIsP1) {
                /* Skip non-P1 posts in p1-only mode */
                return null;
            }

            if (filterMode === 'p1-exchanges' && !currentIsP1 && !hasP1Response(node)) {
                /* Skip non-P1 posts that don't have a P1 response in p1-exchanges mode */
                return null;
            }

            const rawPost = processPost(node.post);
            if (!rawPost) return null;

            const result = formatPostForOutput(rawPost, rootTime);

            if (Array.isArray(node.replies) && node.replies.length > 0) {
                const validReplies = node.replies.filter(reply => {
                    const hasContent = reply?.post?.record?.text || reply?.post?.record?.embed;
                    const hasTime = reply?.post?.record?.createdAt;
                    if (!hasContent || !hasTime) {
                        debugLog.add('invalid_reply', reply);
                    }
                    return hasContent && hasTime;
                });

                if (validReplies.length > 0) {
                    validReplies.sort((a, b) => {
                        const timeA = safeGetCreatedAt(a.post);
                        const timeB = safeGetCreatedAt(b.post);
                        return timeA - timeB;
                    });

                    const replies = validReplies
                        .map(reply => processNode(reply, currentIsP1))
                        .filter(Boolean);

                    if (replies.length > 0) {
                        result.replies = replies;
                    }
                }
            }

            return result;
        }

        return processNode(threadData.data.thread);
    } catch (err) {
        debugLog.add('thread_error', err);
        console.error('Thread processing error:', err);
        throw new Error(`Failed to fetch thread: ${err.message}`);
    }
}

/* Process a reverse thread - traverse from leaf node back to root, presented chronologically */
export async function processReverseThread(postInfo) {
    debugLog.clear();
    debugLog.add('process_reverse_thread_start', postInfo);

    /* Reset processing state */
    resetProcessing();

    try {
        const agent = getPublicAgent();
        const threadData = await agent.getPostThread({
            uri: `at://${postInfo.handle}/app.bsky.feed.post/${postInfo.postId}`,
            depth: 0, /* We don't need replies for reverse thread */
            parentHeight: 1000 /* Get full parent chain */
        });

        debugLog.add('reverse_thread_data', threadData);

        if (!threadData?.data?.thread?.post) {
            throw new Error('Invalid thread data received');
        }

        /* Collect all posts from leaf to root by walking up the parent chain */
        const posts = [];
        let currentNode = threadData.data.thread;

        while (currentNode?.post) {
            const rawPost = processPost(currentNode.post);
            if (rawPost) {
                posts.push(rawPost);
            }
            currentNode = currentNode.parent;
        }

        /* Reverse to get chronological order (root first, leaf last) */
        posts.reverse();

        if (posts.length === 0) {
            throw new Error('No posts found in thread');
        }

        /* Use the root post time as the base for relative delays */
        const rootTime = posts[0].createdAt;

        /* Format all posts for output */
        const result = posts.map(rawPost => formatPostForOutput(rawPost, rootTime));

        /* Return as a flat array representing the conversation branch */
        return {
            type: 'reverse_thread',
            postCount: result.length,
            posts: result
        };
    } catch (err) {
        debugLog.add('reverse_thread_error', err);
        console.error('Reverse thread processing error:', err);
        throw new Error(`Failed to fetch reverse thread: ${err.message}`);
    }
}

/* Initialize thread processing functionality */
export function initializeThreadProcessing() {
    const postForm = document.getElementById('processor-form');
    const urlInput = document.getElementById('url-input');
    
    /* Post Form Submit Handler */
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        displayOutput('', false); // Clear output

        /* Determine which button was clicked */
        const isQuoteProcessing = e.submitter?.id === 'process-quotes';
        const isReverseThread = e.submitter?.id === 'process-reverse';

        /* Set loading state on all buttons */
        setLoading('process-replies', true);
        setLoading('process-quotes', true);
        setLoading('process-reverse', true);

        const currentInput = urlInput.value.trim();
        updateQueryParam('url', currentInput);

        try {
            if (!currentInput) {
                throw new Error('Please enter a Bluesky post URL');
            }

            const postInfo = extractPostInfo(currentInput);

            /* Process based on button clicked */
            if (isQuoteProcessing) {
                updateQueryParam('mode', 'quotes');
                /* Get the selected sort order */
                const sortOrder = document.querySelector('input[name="quote-sort"]:checked')?.value || 'popular';
                updateQueryParam('sort', sortOrder);

                /* Import quote processing module dynamically */
                const quoteModule = await import('./bsky-quote.js');
                const processedData = await quoteModule.processQuotes(postInfo, sortOrder);
                displayOutput(processedData);
            } else if (isReverseThread) {
                updateQueryParam('mode', 'reverse');
                const processedData = await processReverseThread(postInfo);
                displayOutput(processedData);
            } else {
                updateQueryParam('mode', 'replies');
                /* Get the selected reply filter */
                const filterMode = document.querySelector('input[name="reply-filter"]:checked')?.value || 'all';
                updateQueryParam('filter', filterMode);

                const processedData = await processThread(postInfo, filterMode);
                displayOutput(processedData);
            }
        } catch (err) {
            displayOutput(err.message, true);
        } finally {
            setLoading('process-replies', false);
            setLoading('process-quotes', false);
            setLoading('process-reverse', false);
        }
    });
}

/* Function to auto-process a thread if URL parameters are set */
export function autoProcessThread() {
    const urlInput = document.getElementById('url-input');
    const currentUrl = urlInput.value.trim();

    if (currentUrl) {
        const mode = getQueryParam('mode');
        let processType = 'process-replies'; /* default */

        if (mode === 'quotes') {
            processType = 'process-quotes';
        } else if (mode === 'reverse') {
            processType = 'process-reverse';
        }

        const button = document.getElementById(processType);

        if (button && !button.disabled) {
            /* Click the button directly so the submitter is properly set */
            button.click();
        }
    }
}
