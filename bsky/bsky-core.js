/* bsky-core.js - Core module for Bluesky API interactions and common functionality */

/* Import BskyAgent from the API module */
let BskyAgent;

/* Global state for consistently anonymizing users across all operations */
const userMap = new Map();
let userCounter = 0;
let postCounter = 0;

/* Agent instances */
let publicAgent = null;  /* For unauthenticated public API access */
let authAgent = null;    /* For authenticated API calls */

/* Debug logging capabilities */
const debugLog = {
    add(type, data) {
        console.log(`[${new Date().toISOString()}] ${type}`, data);
    },
    clear() {
        console.clear();
    }
};

/* DOM Element References */
let elements = {};

/* Public API functions */
export async function initializeBskyCore() {
    try {
        const api = await import('https://esm.sh/@atproto/api@0.18.3');
        BskyAgent = api.BskyAgent;
        
        /* Initialize the public agent */
        publicAgent = new BskyAgent({
            service: 'https://public.api.bsky.app'
        });
        
        /* Cache DOM elements */
        cacheElements();
        
        /* Initialize tab handling */
        initializeTabs();
        
        /* Check for stored auth session */
        await checkStoredSession();
        
        /* Set up event handlers */
        setupEventHandlers();
        
        /* Prepare UI based on URL parameters */
        loadStateFromUrl();
        
        /* Show the app */
        document.getElementById('app').style.display = 'block';
        
        return true;
    } catch (err) {
        console.error('Failed to initialize Bluesky Core:', err);
        document.getElementById('module-error').style.display = 'block';
        return false;
    }
}

/* Reset processing state for a new operation */
export function resetProcessing() {
    userMap.clear();
    userCounter = 0;
    postCounter = 0;
}

/* Anonymize a user DID consistently */
export function anonymize(did) {
    if (!userMap.has(did)) {
        userMap.set(did, `p${++userCounter}`);
    }
    return userMap.get(did);
}

/* Format a post for consistent output */
export function formatPostForOutput(rawPost, rootTime = null) {
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

/* Calculate relative time between two timestamps */
export function getRelativeTime(baseTime, compareTime) {
    const diff = compareTime - baseTime;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'now';
}

/* Parse creation date from a post */
export function safeGetCreatedAt(post) {
    try {
        return new Date(post?.record?.createdAt || 0);
    } catch (e) {
        debugLog.add('date_error', { error: e.message, post });
        return new Date(0);
    }
}

/* Reconstruct text with full URLs from facets */
export function reconstructTextWithFacets(text, facets) {
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

/* Extract post info (handle and postId) from URL */
export function extractPostInfo(url) {
    const match = url.match(/bsky\.app\/profile\/([^/]+)\/post\/([^/?]+)/);
    if (!match) throw new Error('Invalid Bluesky post URL');
    return { handle: match[1], postId: match[2] };
}

/* Process a post to extract key fields */
export function processPost(post) {
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

/* URL parameter handling */
export function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

export function updateQueryParam(param, value) {
    const url = new URL(window.location);
    if (value) {
        url.searchParams.set(param, value);
    } else {
        url.searchParams.delete(param);
    }
    window.history.replaceState({}, '', url);
}

/* Authentication functions */
export function isAuthenticated() {
    return authAgent !== null;
}

/* Expose agent instances through getter functions */
export function getPublicAgent() {
    return publicAgent;
}

export function getAuthAgent() {
    return authAgent;
}

/* Display output with error handling */
export function displayOutput(data, isError = false) {
    if (isError) {
        elements.error.textContent = data;
        elements.error.style.display = 'block';
        elements.outputActions.style.display = 'none';
        debugLog.add('output_error', data);
    } else {
        elements.error.style.display = 'none';
        elements.output.textContent = JSON.stringify(data, null, 2);
        elements.outputActions.style.display = 'flex';
    }
}

/* UI helper to show/hide the loading state */
export function setLoading(buttonId, isLoading, loadingText = 'Processing...') {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    if (isLoading) {
        button.disabled = true;
        button._originalText = button.textContent;
        button.innerHTML = `<span class="loading"></span>${loadingText}`;
    } else {
        button.disabled = false;
        button.innerHTML = button._originalText || button.textContent;
    }
}

/* Private utility functions */
function cacheElements() {
    elements = {
        /* Common elements */
        error: document.getElementById('error'),
        output: document.getElementById('output'),
        outputActions: document.querySelector('.output-actions'),
        copyButton: document.getElementById('copy-button'),
        copyFeedback: document.getElementById('copy-feedback'),
        tabButtons: document.querySelectorAll('.tab-button'),
        tabContents: document.querySelectorAll('.tab-content'),
        
        /* Post processing elements */
        postForm: document.getElementById('processor-form'),
        urlInput: document.getElementById('url-input'),
        
        /* Search elements */
        searchForm: document.getElementById('search-form'),
        searchInput: document.getElementById('search-input'),
        limitInput: document.getElementById('limit-input'),
        sortTop: document.getElementById('sort-top'),
        sortLatest: document.getElementById('sort-latest'),
        paginationWarning: document.getElementById('pagination-warning'),
        
        /* Auth elements */
        searchAuthSection: document.getElementById('search-auth-section'),
        authButton: document.getElementById('auth-button'),
        handleInput: document.getElementById('handle-input'),
        passwordInput: document.getElementById('password-input'),
        authSuccess: document.getElementById('auth-success'),
        authError: document.getElementById('auth-error'),
        authInfo: document.getElementById('auth-info'),
        authAvatar: document.getElementById('auth-avatar'),
        authHandle: document.getElementById('auth-handle'),
        logoutButton: document.getElementById('logout-button')
    };
}

function initializeTabs() {
    elements.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            /* Update active tab button */
            elements.tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            /* Update active tab content */
            elements.tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
            
            /* Update URL */
            updateQueryParam('tab', tabId);
        });
    });
}

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

function showAuthSuccess(profile) {
    /* Hide auth section */
    elements.searchAuthSection.style.display = 'none';
    
    /* Show auth info */
    elements.authInfo.style.display = 'flex';
    elements.authHandle.textContent = profile.handle;
    
    /* Set avatar if available */
    if (profile.avatar) {
        elements.authAvatar.src = profile.avatar;
    } else {
        elements.authAvatar.src = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\'%3e%3ccircle cx=\'10\' cy=\'10\' r=\'10\' fill=\'%23e5e7eb\'/%3e%3c/svg%3e';
    }
    
    /* Show search form */
    elements.searchForm.style.display = 'block';
    
    /* Show success message temporarily */
    elements.authSuccess.style.display = 'block';
    setTimeout(() => {
        elements.authSuccess.style.display = 'none';
    }, 3000);
}

function showAuthError(message) {
    elements.authError.textContent = message;
    elements.authError.style.display = 'block';
}

function setupEventHandlers() {
    /* Copy Button Handler */
    elements.copyButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(elements.output.textContent);
            elements.copyFeedback.style.display = 'block';
            setTimeout(() => {
                elements.copyFeedback.style.display = 'none';
            }, 2000);
        } catch (err) {
            elements.error.textContent = 'Failed to copy to clipboard';
            elements.error.style.display = 'block';
            debugLog.add('copy_error', err);
        }
    });
    
    /* Auth Button Handler */
    elements.authButton.addEventListener('click', async () => {
        const handle = elements.handleInput.value.trim();
        const password = elements.passwordInput.value.trim();
        
        if (!handle || !password) {
            showAuthError('Please enter both handle and app password');
            return;
        }
        
        elements.authButton.disabled = true;
        elements.authButton.innerHTML = '<span class="loading"></span>Authenticating...';
        elements.authError.style.display = 'none';
        
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
            elements.handleInput.value = '';
            elements.passwordInput.value = '';
            
        } catch (err) {
            debugLog.add('auth_error', err);
            showAuthError(`Authentication failed: ${err.message}`);
            authAgent = null;
        } finally {
            elements.authButton.disabled = false;
            elements.authButton.innerHTML = 'Authenticate';
        }
    });
    
    /* Logout Button Handler */
    elements.logoutButton.addEventListener('click', () => {
        /* Clear auth session */
        authAgent = null;
        localStorage.removeItem('bsky_session');
        
        /* Reset UI */
        elements.searchAuthSection.style.display = 'block';
        elements.authInfo.style.display = 'none';
        elements.searchForm.style.display = 'none';
        elements.authSuccess.style.display = 'none';
        elements.authError.style.display = 'none';
    });
    
    /* Sort and limit change handlers for pagination warning */
    elements.sortTop.addEventListener('change', updatePaginationWarning);
    elements.sortLatest.addEventListener('change', updatePaginationWarning);
    elements.limitInput.addEventListener('change', updatePaginationWarning);
    
    /* Handle browser back and forward navigation */
    window.addEventListener('popstate', () => {
        loadStateFromUrl();
    });
}

function updatePaginationWarning() {
    const sortTop = elements.sortTop.checked;
    const limit = parseInt(elements.limitInput.value) || 100;
    
    if (sortTop && limit > 100) {
        elements.paginationWarning.style.display = 'block';
    } else {
        elements.paginationWarning.style.display = 'none';
    }
}

function loadStateFromUrl() {
    const tab = getQueryParam('tab') || 'post-tab';
    const tabButton = document.querySelector(`.tab-button[data-tab="${tab}"]`);
    if (tabButton) {
        tabButton.click();
    }
    
    if (tab === 'post-tab') {
        const qspUrl = getQueryParam('url');
        if (qspUrl !== elements.urlInput.value) {
            elements.urlInput.value = qspUrl || '';
        }

        const qspSort = getQueryParam('sort');
        if (qspSort) {
            const sortRadio = document.querySelector(`input[name="quote-sort"][value="${qspSort}"]`);
            if (sortRadio) {
                sortRadio.checked = true;
            }
        }
    } else if (tab === 'search-tab') {
        const qspQuery = getQueryParam('q');
        if (qspQuery !== elements.searchInput.value) {
            elements.searchInput.value = qspQuery || '';
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
            
            updateQueryParam('limit', elements.limitInput.value);
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
}

/* Export debug object for development use */
export { debugLog };
