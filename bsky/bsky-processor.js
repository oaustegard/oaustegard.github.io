/* bsky-processor.js - External module for Bluesky Data Processing in engagement-data.html */

try {
    const { BskyAgent } = await import('https://esm.sh/@atproto/api');
    document.getElementById('app').style.display = 'block';

    /* ==========================
       Global State & Variables
    ========================== */
    
    /* Global user map for consistent anonymization across all processing modes */
    let userMap = new Map();
    let userCounter = 0;
    let postCounter = 0;
    
    /* Create the agent using the public endpoint – no authentication required. */
    const agent = new BskyAgent({
        service: 'https://public.api.bsky.app'
    });

    /* Agent for authenticated calls */
    let authAgent = null;

    const debugLog = {
        add(type, data) {
            console.log(`[${new Date().toISOString()}] ${type}`, data);
        },
        clear() {
            console.clear();
        }
    };

    /* DOM Elements */
    const postForm = document.getElementById('processor-form');
    const searchForm = document.getElementById('search-form');
    const urlInput = document.getElementById('url-input');
    const searchInput = document.getElementById('search-input');
    const limitInput = document.getElementById('limit-input');
    const error = document.getElementById('error');
    const output = document.getElementById('output');
    const copyButton = document.getElementById('copy-button');
    const copyFeedback = document.getElementById('copy-feedback');

    /* Auth elements */
    const searchAuthSection = document.getElementById('search-auth-section');
    const authButton = document.getElementById('auth-button');
    const handleInput = document.getElementById('handle-input');
    const passwordInput = document.getElementById('password-input');
    const authSuccess = document.getElementById('auth-success');
    const authError = document.getElementById('auth-error');
    const authInfo = document.getElementById('auth-info');
    const authAvatar = document.getElementById('auth-avatar');
    const authHandle = document.getElementById('auth-handle');
    const logoutButton = document.getElementById('logout-button');

    /* ==========================
       Tab Handling
    ========================== */
    
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            /* Update active tab button */
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            /* Update active tab content */
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });

            /* Update URL */
            updateQueryParam('tab', tabId);
        });
    });

    /* ==========================
       URL Parameter Handling
    ========================== */
    
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    function updateQueryParam(param, value) {
        const url = new URL(window.location);
        if (value) {
            url.searchParams.set(param, value);
        } else {
            url.searchParams.delete(param);
        }
        window.history.replaceState({}, '', url);
    }

    function autoProcessIfReady() {
        const currentTab = getQueryParam('tab') || 'post-tab';
        
        if (currentTab === 'post-tab') {
            const currentUrl = urlInput.value.trim();
            if (currentUrl) {
                const processType = getQueryParam('quotes') === 'true' ? 'process-quotes' : 'process-replies';
                const button = document.getElementById(processType);
                if (button && !button.disabled) {
                    postForm.dispatchEvent(new Event('submit'));
                }
            }
        } else if (currentTab === 'search-tab') {
            const currentQuery = searchInput.value.trim();
            if (currentQuery) {
                const button = document.getElementById('process-search');
                if (button && !button.disabled) {
                    searchForm.dispatchEvent(new Event('submit'));
                }
            }
        }
    }

    /* ==========================
       Anonymization & Formatting
    ========================== */
    
    /* Reset counters for new processing request */
    function resetProcessing() {
        userMap.clear();
        userCounter = 0;
        postCounter = 0;
    }
    
    /* Global function to anonymize user DIDs consistently */
    function anonymize(did) {
        if (!userMap.has(did)) {
            userMap.set(did, `p${++userCounter}`);
        }
        return userMap.get(did);
    }
    
    /* Format a post consistently for all outputs */
    function formatPostForOutput(rawPost, rootTime = null) {
        if (!rawPost) return null;
        
        /* Create the basic structure with anonymized author */
        const result = {
            id: rawPost.id,
            author: anonymize(rawPost.author),
            content: rawPost.content
        };
        
        /* Add engagement metrics if available */
        if (rawPost.likes > 0) {
            result.likes = rawPost.likes;
        }
        if (rawPost.reposts > 0) {
            result.reposts = rawPost.reposts;
        }
        
        /* Add relative time delay from root post if provided */
        if (rootTime && rawPost.createdAt && rawPost.createdAt > rootTime) {
            result.delay = getRelativeTime(rootTime, rawPost.createdAt);
        }
        
        return result;
    }

    /* ==========================
       Helper Functions
    ========================== */
    
    function getRelativeTime(baseTime, compareTime) {
        const diff = compareTime - baseTime;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days}d`;
        if (hours > 0) return `${hours}h`;
        if (minutes > 0) return `${minutes}m`;
        return 'now';
    }

    function safeGetCreatedAt(post) {
        try {
            return new Date(post?.record?.createdAt || 0);
        } catch (e) {
            debugLog.add('date_error', { error: e.message, post });
            return new Date(0);
        }
    }

    /* Reconstruct text with full URLs from facets. */
    function reconstructTextWithFacets(text, facets) {
        if (!facets || facets.length === 0) {
            return text;
        }
        facets.sort((a, b) => a.index.byteStart - b.index.byteStart);
        let reconstructedText = '';
        let lastIndex = 0;
        function byteToCharOffset(str, byteOffset) {
            let currentByte = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str[i];
                const charBytes = new TextEncoder().encode(char).length;
                if (currentByte + charBytes > byteOffset) {
                    return i;
                }
                currentByte += charBytes;
            }
            return str.length;
        }
        facets.forEach(facet => {
            if (facet.features && facet.features.length > 0) {
                const linkFeature = facet.features.find(feature => feature['$type'] === 'app.bsky.richtext.facet#link');
                if (linkFeature) {
                    const byteStart = facet.index.byteStart;
                    const byteEnd = facet.index.byteEnd;
                    const charStart = byteToCharOffset(text, byteStart);
                    const charEnd = byteToCharOffset(text, byteEnd);
                    reconstructedText += text.substring(lastIndex, charStart);
                    reconstructedText += linkFeature.uri;
                    lastIndex = charEnd;
                }
            }
        });
        reconstructedText += text.substring(lastIndex);
        return reconstructedText;
    }

    /* Extract post info (handle and postId) from the provided URL. */
    function extractPostInfo(url) {
        const match = url.match(/bsky\.app\/profile\/([^/]+)\/post\/([^/?]+)/);
        if (!match) throw new Error('Invalid Bluesky post URL');
        return { handle: match[1], postId: match[2] };
    }

    /* Process a post to extract key fields. */
    function processPost(post) {
        debugLog.add('process_post', post);
        if (!post?.record) return null;
        
        let content = post.record.text || '';
        if (post.record.facets && Array.isArray(post.record.facets)) {
            content = reconstructTextWithFacets(content, post.record.facets);
        }
        
        const result = {
            id: ++postCounter,
            author: post.author?.did || 'unknown',
            createdAt: post.record?.createdAt ? new Date(post.record.createdAt) : new Date(0),
            content: content
        };
        
        /* Add engagement metrics if available */
        if (post.likeCount > 0) {
            result.likes = parseInt(post.likeCount);
        }
        if (post.repostCount > 0) {
            result.reposts = parseInt(post.repostCount);
        }
        
        return result;
    }

    /* ==========================
       Main Processing Functions
    ========================== */
    
    /* Process thread in the default way (recursively processing replies) */
    async function processThread(postInfo) {
        debugLog.clear();
        debugLog.add('process_thread_start', postInfo);
        
        /* Reset processing state */
        resetProcessing();
        
        try {
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

    /* Process quotes by fetching actor profile first then quotes */
    async function processQuotes(postInfo) {
        debugLog.clear();
        debugLog.add('process_quotes_start', postInfo);
        
        /* Reset processing state */
        resetProcessing();
        
        try {
            /* Fetch the actor profile using the web handle. */
            const profileRes = await agent.api.app.bsky.actor.getProfile({
                actor: postInfo.handle
            });
            
            if (!profileRes.data || !profileRes.data.did) {
                throw new Error('Failed to fetch actor profile');
            }
            
            const did = profileRes.data.did;
            
            /* Construct the root post URI using the actor's DID. */
            const rootURI = `at://${did}/app.bsky.feed.post/${postInfo.postId}`;

            /* Fetch the root post (shallow fetch). */
            const threadData = await agent.getPostThread({ uri: rootURI, depth: 1 });
            
            if (!threadData?.data?.thread?.post) {
                throw new Error('Failed to fetch root post');
            }
            
            /* Process root post */
            const rawRootPost = processPost(threadData.data.thread.post);
            const rootPost = formatPostForOutput(rawRootPost);
            const rootTime = rawRootPost.createdAt;

            /* Fetch quotes using the public getQuotes API endpoint with limit 100. */
            const quotesData = await agent.api.app.bsky.feed.getQuotes({
                uri: rootURI,
                limit: 100
            });
            
            debugLog.add('quotes_data', quotesData);
            
            let quotePosts = [];
            
            if (quotesData.data && quotesData.data.posts) {
                for (const post of quotesData.data.posts) {
                    const rawProcessed = processPost(post);
                    
                    if (rawProcessed && rawProcessed.content) {
                        const processed = formatPostForOutput(rawProcessed, rootTime);
                        quotePosts.push(processed);
                    }
                }
            }
            
            return { root: rootPost, quotePosts: quotePosts };
        } catch (err) {
            debugLog.add('quotes_error', err);
            console.error('Quotes processing error:', err);
            throw new Error(`Failed to fetch quotes: ${err.message}`);
        }
    }

    /* Process search results with standard approach (up to 100 results) */
    async function processSearch(query, limit, sort) {
        debugLog.clear();
        debugLog.add('process_search_start', { query, limit, sort });
        
        /* Reset processing state */
        resetProcessing();
        
        if (!authAgent) {
            throw new Error('Authentication required for search');
        }
        
        try {
            /* Call the searchPosts API endpoint with authenticated agent */
            const searchData = await authAgent.api.app.bsky.feed.searchPosts({
                q: query,
                limit: limit,
                sort: sort
            });
            
            /* Log the cursor if available */
            if (searchData.data.cursor) {
                console.log('Search cursor:', searchData.data.cursor);
                debugLog.add('search_cursor', searchData.data.cursor);
            }
            
            debugLog.add('search_data', searchData);
            
            if (!searchData?.data?.posts) {
                throw new Error('No search results found');
            }
            
            const posts = [];
            
            /* Process each search result */
            for (const post of searchData.data.posts) {
                const rawProcessed = processPost(post);
                
                if (rawProcessed) {
                    const processed = formatPostForOutput(rawProcessed);
                    posts.push(processed);
                }
            }
            
            const result = {
                query: query,
                sort: sort,
                count: posts.length,
                posts: posts
            };
            
            /* Include cursor in result for reference */
            if (searchData.data.cursor) {
                result.cursor = searchData.data.cursor;
            }
            
            return result;
        } catch (err) {
            debugLog.add('search_error', err);
            console.error('Search processing error:', err);
            throw new Error(`Failed to fetch search results: ${err.message}`);
        }
    }
    
    /* Process search results with cursor-based pagination when available */
    async function processSearchWithPagination(query, maxResults, sort) {
        debugLog.clear();
        debugLog.add('process_search_pagination_start', { query, maxResults, sort });
        
        /* Reset processing state */
        resetProcessing();
        
        if (!authAgent) {
            throw new Error('Authentication required for search');
        }
        
        try {
            let allPosts = [];
            let cursor = null;
            let untilParam = null;
            
            /* Dynamic batch sizing based on sort order */
            const batchSize = sort === 'top' ? 25 : 100; // Smaller batches for 'top' sort
            
            let hasMore = true;
            let attempts = 0;
            const maxAttempts = Math.ceil(maxResults / batchSize) * 2; // Allow more attempts with smaller batches
            
            /* Rate limit tracking */
            let consecutiveEmptyResults = 0;
            let possibleRateLimit = false;
            
            /* Store cursors for debugging */
            let cursors = [];
            
            /* Update UI for pagination progress */
            const processButton = document.getElementById('process-search');
            const originalText = processButton.textContent;
            
            while (hasMore && allPosts.length < maxResults && attempts < maxAttempts) {
                attempts++;
                
                /* Update processing button to show progress */
                processButton.innerHTML = `<span class="loading"></span>Processing batch ${attempts}...`;
                
                /* Prepare search parameters */
                const searchParams = {
                    q: query,
                    limit: Math.min(batchSize, maxResults - allPosts.length),
                    sort: sort
                };
                
                /* Try cursor-based pagination first if available */
                if (cursor) {
                    searchParams.cursor = cursor;
                    console.log(`Using cursor for batch ${attempts}:`, cursor);
                } 
                /* Fall back to time-based pagination if no cursor */
                else if (untilParam) {
                    searchParams.until = untilParam;
                    console.log(`Using until param for batch ${attempts}:`, untilParam);
                }
                
                debugLog.add('search_batch_params', searchParams);
                
                try {
                    /* Call the searchPosts API endpoint with authenticated agent */
                    const searchData = await authAgent.api.app.bsky.feed.searchPosts(searchParams);
                    
                    /* Log and store the cursor if available */
                    if (searchData.data.cursor) {
                        cursor = searchData.data.cursor;
                        cursors.push(cursor);
                        console.log(`Batch ${attempts} cursor:`, cursor);
                        debugLog.add('batch_cursor', { batch: attempts, cursor: cursor });
                    } else {
                        cursor = null;
                        console.log(`Batch ${attempts}: No cursor returned`);
                    }
                    
                    debugLog.add('search_batch_data', searchData);
                    
                    /* If no posts are returned, we might be rate limited */
                    if (!searchData?.data?.posts || searchData.data.posts.length === 0) {
                        consecutiveEmptyResults++;
                        debugLog.add('empty_results', { consecutive: consecutiveEmptyResults });
                        
                        /* If we get multiple empty results in a row, it might be rate limiting */
                        if (consecutiveEmptyResults >= 2) {
                            possibleRateLimit = true;
                            debugLog.add('possible_rate_limit', { attempts, allPosts: allPosts.length });
                            break;
                        }
                        
                        /* Try with a longer backoff */
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        continue;
                    }
                    
                    /* Reset counter since we got results */
                    consecutiveEmptyResults = 0;
                    
                    /* Process posts in this batch */
                    const batchPosts = [];
                    for (const post of searchData.data.posts) {
                        const rawProcessed = processPost(post);
                        
                        if (rawProcessed) {
                            const processed = formatPostForOutput(rawProcessed);
                            
                            // Add batch information for transparency
                            processed.batch = attempts;
                            
                            batchPosts.push(processed);
                        }
                    }
                    
                    /* Add this batch to our collection */
                    allPosts = allPosts.concat(batchPosts);
                    
                    /* Check if we should continue fetching more */
                    if (searchData.data.posts.length < searchParams.limit || !cursor) {
                        /* If we get fewer posts than requested or no cursor, check if we can use time-based fallback */
                        if (!cursor) {
                            /* Find the oldest post's timestamp to use as 'until' for next batch */
                            let oldestPost = searchData.data.posts[searchData.data.posts.length - 1];
                            
                            /* Use indexedAt or createdAt for the timestamp */
                            const timestamp = oldestPost.indexedAt || 
                                            (oldestPost.record && oldestPost.record.createdAt) || 
                                            null;
                            
                            if (timestamp) {
                                /* Subtract 1 millisecond to avoid getting the same post again */
                                const date = new Date(timestamp);
                                date.setMilliseconds(date.getMilliseconds() - 1);
                                untilParam = date.toISOString();
                                hasMore = true; // Still try with timestamp
                                console.log(`No cursor, falling back to timestamp: ${untilParam}`);
                            } else {
                                hasMore = false; // Can't continue without cursor or timestamp
                            }
                        } else if (searchData.data.posts.length < searchParams.limit) {
                            /* End of results, even with cursor */
                            hasMore = false;
                        }
                    }
                    
                    /* Adaptive backoff delay between requests */
                    const delayTime = attempts > 3 ? 2000 : 500;
                    if (hasMore && allPosts.length < maxResults) {
                        await new Promise(resolve => setTimeout(resolve, delayTime));
                    }
                    
                } catch (err) {
                    debugLog.add('batch_error', err);
                    
                    /* Check for rate limit errors */
                    if (err.status === 429 || 
                        (err.message && err.message.includes('rate')) || 
                        (err.error && err.error.includes('rate'))) {
                        possibleRateLimit = true;
                        debugLog.add('confirmed_rate_limit', { attempts, allPosts: allPosts.length });
                        break;
                    }
                    
                    /* Other errors - try to continue with longer backoff */
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    
                    /* If we get too many errors, stop */
                    if (attempts >= 3) {
                        throw err;
                    }
                }
            }
            
            /* Restore original button text */
            processButton.innerHTML = originalText;
            
            /* Prepare result with pagination notes */
            const result = {
                query: query,
                sort: sort,
                count: allPosts.length,
                posts: allPosts,
                batches: attempts,
                batchSize: batchSize
            };
            
            /* Include cursors in the result for debugging */
            if (cursors.length > 0) {
                result.cursors = cursors;
                console.log('All cursors:', cursors);
            }
            
            /* Add rate limit warning if detected */
            if (possibleRateLimit) {
                result.rateLimitWarning = `Possible API rate limit detected after ${attempts} batches. Try again in a few minutes.`;
                console.warn(`Possible API rate limit hit after ${attempts} batches with ${allPosts.length} posts retrieved.`);
            }
            
            /* Add note about pagination method */
            if (sort === 'top') {
                result.paginationNote = `Results used optimized time-based pagination with 'top' sort order and smaller batch size (${batchSize}) to improve result quality.`;
            } else {
                result.paginationNote = `Results used time-based pagination with 'latest' sort order and standard batch size (${batchSize}).`;
            }
            
            /* Check if we got fewer than requested */
            if (allPosts.length < maxResults && !possibleRateLimit) {
                result.completionNote = `Retrieved ${allPosts.length} posts (requested ${maxResults}). This may be all available posts matching the query.`;
            }
            
            return result;
        } catch (err) {
            debugLog.add('search_error', err);
            console.error('Search processing error:', err);
            throw new Error(`Failed to fetch search results: ${err.message}`);
        }
    }

    /* ==========================
       Authentication Functions
    ========================== */
    
    /* Show authentication success UI */
    function showAuthSuccess(profile) {
        /* Hide auth section */
        searchAuthSection.style.display = 'none';
        
        /* Show auth info */
        authInfo.style.display = 'flex';
        authHandle.textContent = profile.handle;
        
        /* Set avatar if available */
        if (profile.avatar) {
            authAvatar.src = profile.avatar;
        } else {
            authAvatar.src = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\'%3e%3ccircle cx=\'10\' cy=\'10\' r=\'10\' fill=\'%23e5e7eb\'/%3e%3c/svg%3e';
        }
        
        /* Show search form */
        searchForm.style.display = 'block';
        
        /* Show success message temporarily */
        authSuccess.style.display = 'block';
        setTimeout(() => {
            authSuccess.style.display = 'none';
        }, 3000);
    }
    
    /* Show authentication error UI */
    function showAuthError(message) {
        authError.textContent = message;
        authError.style.display = 'block';
    }
    
    /* Check for stored session on page load */
    async function checkStoredSession() {
        try {
            const storedSession = localStorage.getItem('bsky_session');
            if (storedSession) {
                const sessionData = JSON.parse(storedSession);
                
                /* Create new authenticated agent */
                const newAuthAgent = new BskyAgent({
                    service: 'https://bsky.social'
                });
                
                /* Resume session */
                await newAuthAgent.resumeSession(sessionData);
                
                /* Fetch profile to verify auth works */
                const profile = await newAuthAgent.getProfile({
                    actor: sessionData.did
                });
                
                /* Set authenticated agent */
                authAgent = newAuthAgent;
                
                /* Show authenticated state */
                showAuthSuccess(profile.data);
            }
        } catch (err) {
            debugLog.add('session_resume_error', err);
            console.error('Failed to resume session:', err);
            
            /* Clear any stored session data */
            localStorage.removeItem('bsky_session');
        }
    }

    /* ==========================
       UI Helper Functions
    ========================== */
    
    /* Show/hide pagination warning based on sort and limit settings */
    function updatePaginationWarning() {
        const sortTop = document.getElementById('sort-top').checked;
        const limit = parseInt(document.getElementById('limit-input').value) || 100;
        const warningElement = document.getElementById('pagination-warning');
        
        if (sortTop && limit > 100) {
            warningElement.style.display = 'block';
        } else {
            warningElement.style.display = 'none';
        }
    }

    /* ==========================
       Event Handlers
    ========================== */
    
    /* Copy Button Handler */
    copyButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(output.textContent);
            copyFeedback.style.display = 'block';
            setTimeout(() => {
                copyFeedback.style.display = 'none';
            }, 2000);
        } catch (err) {
            error.textContent = 'Failed to copy to clipboard';
            error.style.display = 'block';
            debugLog.add('copy_error', err);
        }
    });

    /* Post Form Submit Handler */
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        error.style.display = 'none';
        output.textContent = '';
        document.querySelector('.output-actions').style.display = 'none';
        
        /* Disable both process buttons and show loading text. */
        const processButtons = document.querySelectorAll('#process-replies, #process-quotes');
        processButtons.forEach(btn => btn.disabled = true);
        const originalTexts = {};
        processButtons.forEach(btn => { 
            originalTexts[btn.id] = btn.textContent; 
            btn.innerHTML = '<span class="loading"></span>Processing...'; 
        });
        
        const currentInput = urlInput.value.trim();
        updateQueryParam('url', currentInput);
        
        let useQuotePosts;
        /* Determine mode based on which button was clicked (or URL param for auto-process). */
        if (e.submitter) {
            useQuotePosts = e.submitter.id === 'process-quotes';
            updateQueryParam('quotes', useQuotePosts ? 'true' : 'false');
        } else {
            useQuotePosts = getQueryParam('quotes') === 'true';
        }
        
        try {
            const postInfo = extractPostInfo(currentInput);
            let processedData;
            if (useQuotePosts) {
                processedData = await processQuotes(postInfo);
            } else {
                processedData = await processThread(postInfo);
            }
            output.textContent = JSON.stringify(processedData, null, 2);
            document.querySelector('.output-actions').style.display = 'flex';
        } catch (err) {
            error.textContent = err.message;
            error.style.display = 'block';
            debugLog.add('process_error', err);
        } finally {
            processButtons.forEach(btn => {
                btn.disabled = false;
                btn.innerHTML = originalTexts[btn.id];
            });
        }
    });

    /* Auth Button Handler */
    authButton.addEventListener('click', async () => {
        const handle = handleInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!handle || !password) {
            showAuthError('Please enter both handle and app password');
            return;
        }
        
        authButton.disabled = true;
        authButton.innerHTML = '<span class="loading"></span>Authenticating...';
        authError.style.display = 'none';
        
        try {
            /* Create new authenticated agent */
            const newAuthAgent = new BskyAgent({
                service: 'https://bsky.social'  /* Use main API for authentication */
            });
            
            /* Attempt to login */
            const loginResult = await newAuthAgent.login({
                identifier: handle,
                password: password
            });
            
            debugLog.add('login_result', loginResult);
            
            if (!loginResult.success) {
                throw new Error('Authentication failed');
            }
            
            /* Store authentication data */
            authAgent = newAuthAgent;
            const sessionData = {
                did: loginResult.data.did,
                handle: loginResult.data.handle,
                accessJwt: loginResult.data.accessJwt,
                refreshJwt: loginResult.data.refreshJwt,
            };
            
            /* Save session data to localStorage */
            try {
                localStorage.setItem('bsky_session', JSON.stringify(sessionData));
            } catch (err) {
                console.error('Failed to store session:', err);
            }
            
            /* Fetch and display profile */
            const profile = await authAgent.getProfile({
                actor: loginResult.data.did
            });
            
            debugLog.add('profile', profile);
            
            /* Show success state */
            showAuthSuccess(profile.data);
            
            /* Clear inputs */
            handleInput.value = '';
            passwordInput.value = '';
            
        } catch (err) {
            debugLog.add('auth_error', err);
            showAuthError(`Authentication failed: ${err.message}`);
            authAgent = null;
        } finally {
            authButton.disabled = false;
            authButton.innerHTML = 'Authenticate';
        }
    });

    /* Logout Button Handler */
    logoutButton.addEventListener('click', () => {
        /* Clear auth session */
        authAgent = null;
        localStorage.removeItem('bsky_session');
        
        /* Reset UI */
        searchAuthSection.style.display = 'block';
        authInfo.style.display = 'none';
        searchForm.style.display = 'none';
        authSuccess.style.display = 'none';
        authError.style.display = 'none';
    });

    /* Updated Search Form Submit Handler with automatic pagination */
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        error.style.display = 'none';
        output.textContent = '';
        document.querySelector('.output-actions').style.display = 'none';
        
        /* Disable process button and show loading text. */
        const processButton = document.getElementById('process-search');
        processButton.disabled = true;
        const originalText = processButton.textContent;
        processButton.innerHTML = '<span class="loading"></span>Processing...';
        
        const query = searchInput.value.trim();
        const limit = parseInt(limitInput.value) || 100;
        const sort = document.querySelector('input[name="sort"]:checked').value;
        
        /* Determine if pagination is needed based on limit */
        const needsPagination = limit > 100;
        
        /* Update URL parameters */
        updateQueryParam('q', query);
        updateQueryParam('limit', limit.toString());
        updateQueryParam('sort', sort);
        
        try {
            let processedData;
            
            if (needsPagination) {
                /* Use pagination for results > 100 */
                processedData = await processSearchWithPagination(query, limit, sort);
            } else {
                /* Use standard search for smaller requests */
                processedData = await processSearch(query, limit, sort);
            }
            
            output.textContent = JSON.stringify(processedData, null, 2);
            document.querySelector('.output-actions').style.display = 'flex';
        } catch (err) {
            error.textContent = err.message;
            error.style.display = 'block';
            debugLog.add('process_error', err);
        } finally {
            processButton.disabled = false;
            processButton.innerHTML = originalText;
        }
    });

    /* Sort and limit change handlers for pagination warning */
    document.getElementById('sort-top').addEventListener('change', updatePaginationWarning);
    document.getElementById('sort-latest').addEventListener('change', updatePaginationWarning);
    document.getElementById('limit-input').addEventListener('change', updatePaginationWarning);

    /* Handle browser back and forward navigation. */
    window.addEventListener('popstate', () => {
        const tab = getQueryParam('tab') || 'post-tab';
        const tabButton = document.querySelector(`.tab-button[data-tab="${tab}"]`);
        if (tabButton) {
            tabButton.click();
        }
        
        if (tab === 'post-tab') {
            const qspUrl = getQueryParam('url');
            if (qspUrl !== urlInput.value) {
                urlInput.value = qspUrl || '';
            }
        } else if (tab === 'search-tab') {
            const qspQuery = getQueryParam('q');
            if (qspQuery !== searchInput.value) {
                searchInput.value = qspQuery || '';
            }
            
            const qspLimit = getQueryParam('limit');
            if (qspLimit) {
                const option = document.querySelector(`#limit-input option[value="${qspLimit}"]`);
                if (option) {
                    option.selected = true;
                } else {
                    // Handle non-preset values
                    const limitValue = parseInt(qspLimit);
                    const presets = [25, 50, 100, 250, 500, 1000];
                    let closestPreset = 100; // Default
                    
                    for (const preset of presets) {
                        if (preset >= limitValue) {
                            closestPreset = preset;
                            break;
                        }
                    }
                    
                    document.querySelector(`#limit-input option[value="${closestPreset}"]`).selected = true;
                }
                
                updateQueryParam('limit', document.getElementById('limit-input').value);
            }
            
            const qspSort = getQueryParam('sort');
            if (qspSort) {
                const sortRadio = document.querySelector(`input[name="sort"][value="${qspSort}"]`);
                if (sortRadio) {
                    sortRadio.checked = true;
                }
            }
            
            // Update pagination warning after setting values
            updatePaginationWarning();
        }
        
        autoProcessIfReady();
    });

    /* ==========================
       Initialization
    ========================== */
    
    window.addEventListener('load', () => {
        /* Set active tab from URL */
        const tabParam = getQueryParam('tab');
        if (tabParam) {
            const tabButton = document.querySelector(`.tab-button[data-tab="${tabParam}"]`);
            if (tabButton) {
                tabButton.click();
            }
        }

        /* Set post URL from URL params */
        const qspUrl = getQueryParam('url');
        if (qspUrl) {
            urlInput.value = qspUrl;
            updateQueryParam('url', qspUrl);
        }

        /* Set search query from URL params */
        const qspQuery = getQueryParam('q');
        if (qspQuery) {
            searchInput.value = qspQuery;
            updateQueryParam('q', qspQuery);
        }

        /* Set limit from URL params */
        const qspLimit = getQueryParam('limit');
        if (qspLimit) {
            const option = document.querySelector(`#limit-input option[value="${qspLimit}"]`);
            if (option) {
                option.selected = true;
            }
            updateQueryParam('limit', document.getElementById('limit-input').value);
        }

        /* Set sort option from URL params */
        const qspSort = getQueryParam('sort');
        if (qspSort) {
            const sortRadio = document.querySelector(`input[name="sort"][value="${qspSort}"]`);
            if (sortRadio) {
                sortRadio.checked = true;
                updateQueryParam('sort', qspSort);
            }
        }

        /* Check for stored auth session */
        checkStoredSession();

        /* Initialize the pagination warning */
        updatePaginationWarning();

        autoProcessIfReady();
    });

} catch (err) {
    document.getElementById('module-error').style.display = 'block';
    console.error('Failed to load application:', err);
}
