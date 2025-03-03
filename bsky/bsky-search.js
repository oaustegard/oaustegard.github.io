/* bsky-search.js - Module for processing Bluesky search results */

import { 
    getAuthAgent, 
    processPost, 
    formatPostForOutput, 
    debugLog, 
    resetProcessing,
    isAuthenticated,
    displayOutput,
    setLoading,
    updateQueryParam,
    getQueryParam
} from './bsky-core.js';

/* Process search results with standard approach (up to 100 results) */
async function processSearch(query, limit, sort) {
    debugLog.clear();
    debugLog.add('process_search_start', { query, limit, sort });
    
    /* Reset processing state */
    resetProcessing();
    
    if (!isAuthenticated()) {
        throw new Error('Authentication required for search');
    }
    
    try {
        const authAgent = getAuthAgent();
        
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
    
    if (!isAuthenticated()) {
        throw new Error('Authentication required for search');
    }
    
    try {
        const authAgent = getAuthAgent();
        let allPosts = [];
        let cursor = null;
        let untilParam = null;
        
        /* Dynamic batch sizing based on sort order */
        const batchSize = sort === 'top' ? 25 : 100;
        
        while (allPosts.length < maxResults) {
            /* Calculate remaining results to fetch */
            const remaining = maxResults - allPosts.length;
            const limit = Math.min(remaining, batchSize);
            
            /* Call the searchPosts API endpoint with authenticated agent */
            const searchData = await authAgent.api.app.bsky.feed.searchPosts({
                q: query,
                limit: limit,
                sort: sort,
                cursor: cursor
            });
            
            /* Log the cursor if available */
            if (searchData.data.cursor) {
                debugLog.add('search_cursor', searchData.data.cursor);
            }
            
            /* Process each search result */
            if (searchData?.data?.posts) {
                for (const post of searchData.data.posts) {
                    const rawProcessed = processPost(post);
                    
                    if (rawProcessed) {
                        const processed = formatPostForOutput(rawProcessed);
                        allPosts.push(processed);
                    }
                }
            }
            
            /* Check if we have a cursor for the next page */
            if (!searchData.data.cursor || searchData.data.posts.length < limit) {
                /* No more results or reached the end */
                break;
            }
            
            /* Update cursor for next page */
            cursor = searchData.data.cursor;
            
            /* Brief pause to avoid rate limiting */
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const result = {
            query: query,
            sort: sort,
            count: allPosts.length,
            posts: allPosts
        };
        
        return result;
    } catch (err) {
        debugLog.add('search_pagination_error', err);
        console.error('Search pagination processing error:', err);
        throw new Error(`Failed to fetch paginated search results: ${err.message}`);
    }
}

/* Initialize search processing functionality */
export function initializeSearchProcessing() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const limitInput = document.getElementById('limit-input');
    const sortTopRadio = document.getElementById('sort-top');
    
    /* Search Form Submit Handler */
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        displayOutput('', false); // Clear output
        
        /* Set loading state */
        setLoading('process-search', true);
        
        const query = searchInput.value.trim();
        const limit = parseInt(limitInput.value) || 100;
        const sort = sortTopRadio.checked ? 'top' : 'latest';
        
        /* Update URL parameters */
        updateQueryParam('q', query);
        updateQueryParam('limit', limit.toString());
        updateQueryParam('sort', sort);
        
        try {
            if (!query) {
                throw new Error('Please enter a search query');
            }
            
            /* Determine if we need pagination */
            let processedData;
            if (limit > 100) {
                /* Use pagination for larger result sets */
                processedData = await processSearchWithPagination(query, limit, sort);
            } else {
                /* Use standard search for smaller result sets */
                processedData = await processSearch(query, limit, sort);
            }
            
            displayOutput(processedData);
        } catch (err) {
            displayOutput(err.message, true);
        } finally {
            setLoading('process-search', false);
        }
    });
}

/* Function to auto-process a search if URL parameters are set */
export function autoProcessSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();
    
    if (query && isAuthenticated()) {
        const button = document.getElementById('process-search');
        
        if (button && !button.disabled) {
            document.getElementById('search-form').dispatchEvent(new Event('submit'));
        }
    }
}
