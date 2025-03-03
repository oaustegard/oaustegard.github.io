/* bsky-quote.js - Module for processing Bluesky quote posts */

import { 
    getPublicAgent, 
    processPost, 
    formatPostForOutput, 
    debugLog,
    resetProcessing
} from './bsky-core.js';

/* Process quotes by fetching actor profile first then quotes */
export async function processQuotes(postInfo) {
    debugLog.clear();
    debugLog.add('process_quotes_start', postInfo);
    
    /* Reset processing state */
    resetProcessing();
    
    try {
        const agent = getPublicAgent();
        
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
