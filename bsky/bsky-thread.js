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
    updateQueryParam
} from './bsky-core.js';

/* Process thread in the default way (recursively processing replies) */
export async function processThread(postInfo) {
    debugLog.clear();
    debugLog.add('process_thread_start', postInfo);
    
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
        
        function processNode(node) {
            debugLog.add('process_node', node);
            
            if (!node?.post) {
                debugLog.add('invalid_node', node);
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
                        .map(reply => processNode(reply))
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
        const processButtonId = isQuoteProcessing ? 'process-quotes' : 'process-replies';
        
        /* Set loading state */
        setLoading('process-replies', true);
        setLoading('process-quotes', true);
        
        const currentInput = urlInput.value.trim();
        updateQueryParam('url', currentInput);
        updateQueryParam('quotes', isQuoteProcessing ? 'true' : 'false');
        
        try {
            if (!currentInput) {
                throw new Error('Please enter a Bluesky post URL');
            }
            
            const postInfo = extractPostInfo(currentInput);
            
            /* Process thread or quotes based on button clicked */
            if (isQuoteProcessing) {
                /* Import quote processing module dynamically */
                const quoteModule = await import('./bsky-quote.js');
                const processedData = await quoteModule.processQuotes(postInfo);
                displayOutput(processedData);
            } else {
                const processedData = await processThread(postInfo);
                displayOutput(processedData);
            }
        } catch (err) {
            displayOutput(err.message, true);
        } finally {
            setLoading('process-replies', false);
            setLoading('process-quotes', false);
        }
    });
}

/* Function to auto-process a thread if URL parameters are set */
export function autoProcessThread() {
    const urlInput = document.getElementById('url-input');
    const currentUrl = urlInput.value.trim();
    
    if (currentUrl) {
        const processType = location.search.includes('quotes=true') ? 'process-quotes' : 'process-replies';
        const button = document.getElementById(processType);
        
        if (button && !button.disabled) {
            document.getElementById('processor-form').dispatchEvent(new Event('submit'));
        }
    }
}
