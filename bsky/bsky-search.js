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