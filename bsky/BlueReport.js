/* Core application state management */
class BlueReportStore {
    constructor(options = {}) {
        const urlParams = new URLSearchParams(window.location.search);
        const savedSettings = this.loadSettings();
        
        this.db = null;
        this.lastUpdate = null;
        
        // Define supported languages first
        this.supportedLanguages = {
            'en': 'English',
            'no': 'Norwegian',
            'sv': 'Swedish',
            'da': 'Danish',
            'de': 'German'
        };
        
        // Parse update interval from URL (in seconds) or saved settings (in ms)
        const urlInterval = urlParams.get('interval');
        this.updateInterval = urlInterval ? 
            parseInt(urlInterval) * 1000 : 
            (savedSettings.updateInterval || 60000);
        
        // Parse language from URL or saved settings
        this.language = urlParams.get('lang') || 
                       savedSettings.language || 
                       'en';
        
        // Validate and potentially correct settings
        if (!this.supportedLanguages[this.language]) {
            this.language = 'en';
        }
        
        const validIntervals = [10000, 30000, 60000, 120000, 300000, 600000];
        if (!validIntervals.includes(this.updateInterval)) {
            this.updateInterval = 60000;
        }
        
        // Initialize other properties
        this.retentionPeriod = 24 * 60 * 60 * 1000;
        this.seenPosts = new Set();
        this.seenPostTimes = new Map();
        
        // Initialize language-specific stats
        this.stats = {};
        Object.keys(this.supportedLanguages).forEach(lang => {
            this.stats[lang] = {
                processedPosts: 0,
                uniqueUrls: new Set()
            };
        });
        
        // Ensure URL reflects actual settings
        this.updateURL();
    }

    updateURL() {
        const url = new URL(window.location);
        url.searchParams.set('interval', Math.floor(this.updateInterval / 1000));
        url.searchParams.set('lang', this.language);
        window.history.replaceState({}, '', url);
    }

    loadSettings() {
        try {
            return JSON.parse(localStorage.getItem('blueReportSettings')) || {};
        } catch (e) {
            return {};
        }
    }

    saveSettings() {
        localStorage.setItem('blueReportSettings', JSON.stringify({
            updateInterval: this.updateInterval,
            language: this.language
        }));
    }

    async init() {
        console.log('Initializing BlueReportStore...');
        this.db = await new Promise((resolve, reject) => {
            const request = indexedDB.open('BlueReport', 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                console.log('IndexedDB opened successfully');
                resolve(request.result);
            };

            request.onupgradeneeded = (event) => {
                console.log('Creating/upgrading IndexedDB stores...');
                const db = event.target.result;

                if (!db.objectStoreNames.contains('events')) {
                    const eventStore = db.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
                    eventStore.createIndex('timestamp', 'timestamp');
                    eventStore.createIndex('url', 'url');
                    eventStore.createIndex('did', 'did');
                    eventStore.createIndex('type', 'type');
                }

                if (!db.objectStoreNames.contains('links')) {
                    const linkStore = db.createObjectStore('links', { keyPath: 'url' });
                    linkStore.createIndex('score', 'score');
                }
            };
        });
    }

    async ingestData() {
        if (this.processingLock) {
            console.log('Ingestion already in progress, skipping...');
            return;
        }

        try {
            this.processingLock = true;
            console.log('Starting data ingestion...');
            const posts = await this.fetchPosts();
            if (!Array.isArray(posts)) {
                console.error('Failed to fetch posts or invalid response format');
                return;
            }
            console.log(`Fetched ${posts.length} posts`);

            const events = await this.processEvents(posts);
            if (!Array.isArray(events) || events.length === 0) {
                console.log('No new events to process');
                return;
            }
            console.log(`Processed into ${events.length} events`);

            await this.storeEvents(events);
            await this.aggregateData();
        } finally {
            this.processingLock = false;
        }
    }

    async fetchPosts() {
        console.log(`Fetching posts for language: ${this.language}`);
        const params = new URLSearchParams({
            q: 'https*',
            limit: '100',
            sort: 'latest',
            lang: this.language
        });

        try {
            const response = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?${params}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            const posts = data.posts || [];
            
            console.log(`Fetched ${posts.length} posts`);
            return posts;
            
        } catch (error) {
            console.error('Error fetching posts:', error);
            return [];
        }
    }
    
    /* Add these methods to BlueReportStore */
    calculateSamplingWindows() {
        const now = new Date().toISOString();
        const windows = [];
    
        // Language-specific window sizes (in milliseconds)
        const windowSizes = {
            en: 10000,      // 10 seconds for English
            default: 60000  // 1 minute for other languages
        };
    
        const windowSize = windowSizes[this.language] || windowSizes.default;
    
        // Never sample more than updateInterval span
        const maxSpan = Math.min(this.updateInterval, windowSize * 3);
    
        // Calculate windows based on mode and language
        switch (this.samplingMode) {
            case 'high':
                // Only available if we have enough time for 3 windows
                if (maxSpan >= windowSize * 3) {
                    windows.push(
                        { until: now },
                        { until: new Date(Date.now() - windowSize).toISOString() },
                        { until: new Date(Date.now() - (windowSize * 2)).toISOString() }
                    );
                } else {
                    console.log('Falling back to medium sampling - interval too short for high');
                    this.samplingMode = 'medium';
                }
                break;
    
            case 'medium':
                // Only available if we have enough time for 2 windows
                if (maxSpan >= windowSize * 2) {
                    windows.push(
                        { until: now },
                        { until: new Date(Date.now() - windowSize).toISOString() }
                    );
                } else {
                    console.log('Falling back to low sampling - interval too short for medium');
                    this.samplingMode = 'low';
                }
                break;
    
            case 'low':
            default:
                windows.push({ until: now });
                break;
        }
    
        console.log(`Created ${windows.length} sampling windows for ${this.samplingMode} mode`);
        return windows;
    }

    async fetchPreviewsForTopLinks() {
        if (this.lastPreviewUpdate && Date.now() - this.lastPreviewUpdate < this.previewUpdateInterval) {
            return;
        }

        console.log('Fetching previews for top links...');
        const links = await this.getTopLinks();
        const tx = this.db.transaction('links', 'readwrite');
        const store = tx.objectStore('links');

        for (const link of links) {
            try {
                const preview = await this.fetchPreview(link.url);
                if (preview) {
                    link.preview = preview;
                    await new Promise((resolve, reject) => {
                        const request = store.put(link);
                        request.onsuccess = () => resolve();
                        request.onerror = () => reject(request.error);
                    });
                }
            } catch (error) {
                console.error('Error fetching preview for', link.url, error);
            }
        }

        this.lastPreviewUpdate = Date.now();
        return new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    async fetchPreview(url) {
        try {
            const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(url)}&format=json&no_html=1&skip_disambig=1`);
            const data = await response.json();
            
            if (data.Image || data.AbstractURL) {
                return {
                    title: data.Heading || url,
                    description: data.Abstract,
                    thumb: data.Image || null,
                    url: url
                };
            }
            return null;
        } catch (error) {
            console.error('Error fetching preview:', error);
            return null;
        }
    }

    extractUrl(post) {
        let url = null;
        let preview = null;

        // Check embeds
        if (post.embed?.external) {
            url = this.normalizeUrl(post.embed.external.uri);
            if (url) {
                preview = {
                    title: post.embed.external.title,
                    description: post.embed.external.description,
                    thumb: post.embed.external.thumb,
                    uri: url
                };
                console.log('Found URL and preview in embed:', url, preview);
                return { url, preview };
            }
        }

        // Check facets
        if (post.facets) {
            for (const facet of facet.features) {
                if (feature.$type === 'app.bsky.richtext.facet#link') {
                    url = this.normalizeUrl(feature.uri);
                    if (url) {
                        console.log('Found URL in facet:', url);
                        return { url, preview: null };
                    }
                }
            }
        }

        return null;
    }

    async expandUrl(url) {
        if (this.urlCache.has(url)) {
            return this.urlCache.get(url);
        }

        try {
            const response = await fetch(url, {
                method: 'HEAD',
                redirect: 'follow'
            });
            const expandedUrl = response.url;
            this.urlCache.set(url, expandedUrl);
            return expandedUrl;
        } catch (error) {
            console.warn('Failed to expand URL:', url, error);
            return url;
        }
    }

    async processEvents(posts) {
        if (!Array.isArray(posts)) {
            console.error('Invalid posts data:', posts);
            return [];
        }

        const newPosts = posts.filter(post => !this.seenPosts.has(post.cid));
        const currentStats = this.stats[this.language];
        if (!currentStats) {
            console.error('No stats found for language:', this.language);
            return [];
        }
        
        const now = Date.now();
        // Clean up old seen posts
        for (const [cid, timestamp] of this.seenPostTimes.entries()) {
            if (now - timestamp > 30 * 60 * 1000) {
                this.seenPosts.delete(cid);
                this.seenPostTimes.delete(cid);
            }
        }

        newPosts.forEach(post => {
            if (post && post.cid) {
                this.seenPosts.add(post.cid);
                this.seenPostTimes.set(post.cid, now);
            }
        });

        currentStats.processedPosts += newPosts.length;

        const events = [];
        for (const post of newPosts) {
            try {
                if (!post) continue;
                const urlData = this.extractUrl(post);
                if (!urlData) continue;
                
                const { url, preview } = urlData;
                currentStats.uniqueUrls.add(url);
                
                // Add post event with preview data
                events.push({
                    timestamp: new Date(post.indexedAt).getTime(),
                    did: post.author.did,
                    type: 0,
                    url: url,
                    preview: preview,
                    language: this.language
                });

                if (post.likeCount > 0) {
                    events.push({
                        timestamp: new Date(post.indexedAt).getTime(),
                        did: post.author.did,
                        type: 2,
                        url: url,
                        count: post.likeCount,
                        language: this.language
                    });
                }

                if (post.repostCount > 0) {
                    events.push({
                        timestamp: new Date(post.indexedAt).getTime(),
                        did: post.author.did,
                        type: 1,
                        url: url,
                        count: post.repostCount,
                        language: this.language
                    });
                }
            } catch (error) {
                console.error('Error processing post:', error, post);
            }
        }

        return events;
    }

    updateStats() {
        const currentStats = this.stats[this.language];
        if (!currentStats) return;

        const statsElem = document.getElementById('processed-posts');
        if (statsElem) {
            statsElem.textContent = `${currentStats.processedPosts} posts processed`;
        }
        const urlsElem = document.getElementById('unique-urls');
        if (urlsElem) {
            urlsElem.textContent = `${currentStats.uniqueUrls.size} unique URLs`;
        }
    }



    async storeEvents(events) {
        if (!Array.isArray(events) || events.length === 0) return;
        
        console.log(`Storing ${events.length} events...`);
        const tx = this.db.transaction('events', 'readwrite');
        const store = tx.objectStore('events');

        for (const event of events) {
            try {
                await new Promise((resolve, reject) => {
                    const request = store.add(event);
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(request.error);
                });
            } catch (error) {
                console.error('Error storing event:', error, event);
            }
        }

        return new Promise((resolve, reject) => {
            tx.oncomplete = () => {
                console.log('Events stored successfully');
                resolve();
            };
            tx.onerror = () => reject(tx.error);
        });
    }

    async aggregateData() {
        console.log('Aggregating data...');
        const tx = this.db.transaction(['events', 'links'], 'readwrite');
        const eventStore = tx.objectStore('events');
        const linkStore = tx.objectStore('links');

        try {
            const events = await new Promise((resolve, reject) => {
                const request = eventStore.getAll();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });

            console.log(`Aggregating ${events.length} events...`);

            // Aggregate by URL and language
            const aggregated = {};
            for (const event of events) {
                const key = `${event.url}-${event.language}`;
                if (!aggregated[key]) {
                    aggregated[key] = {
                        url: event.url,
                        language: event.language,
                        posts: 0,
                        reposts: 0,
                        likes: 0,
                        preview: event.preview
                    };
                }

                if (event.type === 0) aggregated[key].posts++;
                if (event.type === 1) aggregated[key].reposts += (event.count || 1);
                if (event.type === 2) aggregated[key].likes += (event.count || 1);
            }

            // Store aggregated data
            for (const data of Object.values(aggregated)) {
                const record = {
                    ...data,
                    score: this.calculateScore(data)
                };

                await new Promise((resolve, reject) => {
                    const request = linkStore.put(record);
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(request.error);
                });
            }

            await new Promise((resolve, reject) => {
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });

            this.lastUpdate = Date.now();
            console.log('Data aggregation complete');
        } catch (error) {
            console.error('Error during aggregation:', error);
            tx.abort();
            throw error;
        }
    }

    calculateScore(data) {
        return (data.posts * 10) + (data.reposts * 10) + data.likes;
    }
    

    async getTopLinks(n = 15) {
        console.log(`Getting top links for language: ${this.language}`);
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('links', 'readonly');
            const store = tx.objectStore('links');
            const index = store.index('score');
            const links = [];

            const request = index.openCursor(null, 'prev');

            request.onerror = () => reject(request.error);
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const link = cursor.value;
                    if (link.language === this.language) {
                        links.push(link);
                    }
                    if (links.length < n) {
                        cursor.continue();
                    } else {
                        console.log(`Retrieved ${links.length} top links`);
                        resolve(links);
                    }
                } else {
                    console.log(`Retrieved ${links.length} top links`);
                    resolve(links);
                }
            };
        });
    }
    
    /* Add language filter UI to controls section */
    async updateLanguageStats() {
        const tx = this.db.transaction('links', 'readonly');
        const store = tx.objectStore('links');
        const links = await new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    
        const stats = {};
        for (const link of links) {
            const lang = link.language || 'unknown';
            stats[lang] = (stats[lang] || 0) + 1;
        }
    
        return stats;
    }

    normalizeUrl(url) {
        try {
            const parsed = new URL(url);

            if (!parsed.protocol.startsWith('https')) return null;
            if (parsed.hostname === 'bsky.app') return null;
            if (/\.(gif|jpe?g|png)$/i.test(parsed.pathname)) return null;

            const allowedQueryParams = ['abcnews.go.com'];
            if (!allowedQueryParams.includes(parsed.hostname)) {
                parsed.search = '';
            }

            return parsed.toString();
        } catch (error) {
            console.error('Error normalizing URL:', error, url);
            return null;
        }
    }
}

class BlueReport {
    constructor(options = {}) {
        this.store = new BlueReportStore(options);
        this.running = false;
        this.updateTimer = null;
        this.updateInProgress = false;
        this.initializeControls();
    }

    initializeControls() {
        // Language selector initialization
        const langSelect = document.getElementById('language-select');
        if (langSelect) {
            // Populate language options
            Object.entries(this.store.supportedLanguages).forEach(([code, name]) => {
                const option = document.createElement('option');
                option.value = code;
                option.textContent = name;
                langSelect.appendChild(option);
            });
    
            // Set saved value
            langSelect.value = this.store.language;
    
            langSelect.addEventListener('change', (e) => {
                this.store.language = e.target.value;
                this.store.saveSettings();
                this.store.updateURL();
                
                // Force immediate update
                if (this.running) {
                    clearTimeout(this.updateTimer);
                    this.updateTimer = null;
                    this.updateInProgress = false;
                    this.scheduleUpdate();
                }
            });
        }
    
        // Interval selector initialization
        const intervalSelect = document.getElementById('update-interval');
        if (intervalSelect) {
            // Clear any existing options
            intervalSelect.innerHTML = '';
            
            // Add options with consistent short format
            const intervals = [
                { value: 10000, label: '10s' },
                { value: 30000, label: '30s' },
                { value: 60000, label: '1m' },
                { value: 120000, label: '2m' },
                { value: 300000, label: '5m' },
                { value: 600000, label: '10m' }
            ];
            
            intervals.forEach(({ value, label }) => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = label;
                intervalSelect.appendChild(option);
            });
            
            // Set saved value
            intervalSelect.value = this.store.updateInterval.toString();
            
            intervalSelect.addEventListener('change', (e) => {
                const newInterval = parseInt(e.target.value);
                console.log(`Changing update interval to ${newInterval}ms`);
                this.store.updateInterval = newInterval;
                this.store.saveSettings();
                this.store.updateURL();
                
                // Force immediate update
                if (this.running) {
                    clearTimeout(this.updateTimer);
                    this.updateTimer = null;
                    this.updateInProgress = false;
                    this.scheduleUpdate();
                }
            });
        }
    
        // Initialize pause button
        const toggleBtn = document.getElementById('toggle-updates');
        toggleBtn?.addEventListener('click', () => {
            if (this.running) {
                this.pause();
                toggleBtn.textContent = 'Resume Updates';
                toggleBtn.classList.add('paused');
            } else {
                this.start();
                toggleBtn.textContent = 'Pause Updates';
                toggleBtn.classList.remove('paused');
            }
        });
    }

    schedulePreviewUpdates() {
        if (!this.running) return;

        this.store.fetchPreviewsForTopLinks()
            .then(() => this.updateUI())
            .catch(error => console.error('Preview update failed:', error))
            .finally(() => {
                this.previewTimer = setTimeout(
                    () => this.schedulePreviewUpdates(), 
                    this.store.previewUpdateInterval
                );
            });
    }

    async scheduleUpdate() {
        if (!this.running || this.updateInProgress) return;

        try {
            this.updateInProgress = true;
            await this.store.ingestData();
            await this.updateUI();
            this.store.updateStats();
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            this.updateInProgress = false;
            if (this.running) {
                this.updateTimer = setTimeout(
                    () => this.scheduleUpdate(), 
                    this.store.updateInterval
                );
            }
        }
    }

    restartTimer() {
        console.log('Restarting timer...');
        if (this.updateTimer) {
            clearTimeout(this.updateTimer);
            this.updateTimer = null;
        }
        if (this.running && !this.updateInProgress) {
            this.updateTimer = setTimeout(() => this.scheduleUpdate(), this.store.updateInterval);
        }
    }

    
    async start() {
        if (this.running) return;
        console.log('Starting BlueReport...');
        this.running = true;
        await this.store.init();
        this.scheduleUpdate();
    }

    pause() {
        console.log('Pausing BlueReport...');
        this.running = false;
        if (this.updateTimer) {
            clearTimeout(this.updateTimer);
            this.updateTimer = null;
        }
        if (this.previewTimer) {
            clearTimeout(this.previewTimer);
            this.previewTimer = null;
        }
    }

    async updateUI() {
        if (!this.running) return;
        
        console.log('Updating UI...');
        const links = await this.store.getTopLinks();
        const container = document.querySelector('.link-group');
        if (!container) {
            console.error('Could not find .link-group container!');
            return;
        }
    
        container.innerHTML = links.map((link, index) => {
            const url = new URL(link.url);
            const faviconUrl = `https://icons.duckduckgo.com/ip3/${url.hostname}.ico`;
            
            let previewHtml;
            if (link.preview?.thumb) {
                previewHtml = `
                    <img src="${link.preview.thumb}" 
                         alt="${link.preview.title || url.hostname}"
                         class="preview-image"
                         style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <img src="${faviconUrl}" 
                         alt="${url.hostname}"
                         style="display: none; width: 32px; height: 32px;"
                         onerror="this.onerror=null; this.src='data:image/svg+xml,${encodeURIComponent(`
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                                <rect width="100" height="100" fill="#4286f4"/>
                                <text x="50" y="50" 
                                      font-family="system-ui, sans-serif" 
                                      font-size="50" 
                                      fill="white"
                                      text-anchor="middle" 
                                      dominant-baseline="central">
                                    ${url.hostname.replace('www.', '').charAt(0).toUpperCase()}
                                </text>
                            </svg>
                         `)}'">
                `;
            } else {
                previewHtml = `
                    <img src="${faviconUrl}" 
                         alt="${url.hostname}" 
                         style="width: 32px; height: 32px;"
                         onerror="this.onerror=null; this.src='data:image/svg+xml,${encodeURIComponent(`
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                                <rect width="100" height="100" fill="#4286f4"/>
                                <text x="50" y="50" 
                                      font-family="system-ui, sans-serif" 
                                      font-size="50" 
                                      fill="white"
                                      text-anchor="middle" 
                                      dominant-baseline="central">
                                    ${url.hostname.replace('www.', '').charAt(0).toUpperCase()}
                                </text>
                            </svg>
                         `)}'">
                `;
            }
    
            const description = link.preview?.description 
                ? `<p class="description">${link.preview.description}</p>` 
                : '';
    
            return `
            <div class="link">
                <a href="${link.url}" class="preview">
                    <div class="placeholder">
                        ${previewHtml}
                    </div>
                </a>
                <div class="content">
                    <p class="title">
                        <a href="${link.url}">
                            ${index + 1}. ${link.preview?.title || url.hostname.replace('www.', '') + url.pathname}
                        </a>
                    </p>
                    ${description}
                    <p class="metadata">
                        <span>${url.hostname.replace('www.', '')}</span>
                        <span class="bullet">•</span>
                        <span>${link.posts} ${link.posts === 1 ? 'post' : 'posts'}, 
                              ${link.reposts || 0} ${(link.reposts || 0) === 1 ? 'repost' : 'reposts'}, 
                              ${link.likes || 0} ${(link.likes || 0) === 1 ? 'like' : 'likes'}</span>
                    </p>
                </div>
            </div>
            `;
        }).join('');
    
        const lastUpdated = document.querySelector('.last-updated');
        if (lastUpdated) {
            lastUpdated.textContent = `Last updated ${new Date().toLocaleString()}`;
        }
    }
}