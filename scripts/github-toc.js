/* GitHub Table of Contents Web Component with Exclusion Support */
class GitHubToc extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    /* Define observed attributes for the component */
    static get observedAttributes() {
        return ['repo-path', 'link-prefix', 'exclude'];
    }

    /* Initialize the component when connected */
    connectedCallback() {
        this.render();
        this.loadContent();
    }

    /* Handle attribute changes */
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
            this.loadContent();
        }
    }

    /* Convert wildcard pattern to regex */
    wildcardToRegex(pattern) {
        return new RegExp('^' + pattern
            .split('*').map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('.*') + '$');
    }

    /* Check if a filename matches any exclude pattern */
    shouldExclude(filename) {
        const excludeStr = this.getAttribute('exclude');
        if (!excludeStr) return false;

        /* Split by commas, trim whitespace, and filter empty strings */
        const patterns = excludeStr
            .split(',')
            .map(p => p.trim())
            .filter(p => p);

        /* Convert patterns to RegExp and check for matches */
        return patterns.some(pattern => 
            this.wildcardToRegex(pattern).test(filename)
        );
    }

    /* Render the basic structure */
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: system-ui, -apple-system, sans-serif;
                }
                ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                li {
                    margin: 0.5em 0;
                }
                a {
                    color: #0066cc;
                    text-decoration: none;
                }
                a:hover {
                    text-decoration: underline;
                }
                .error {
                    color: #dc2626;
                    padding: 1em;
                }
            </style>
            <ul id="toc-list"></ul>
        `;
    }

    /* Parse GitHub URL to get API parameters */
    parseGitHubUrl(url) {
        const match = url.match(/github\.com\/([^/]+)\/([^/]+)(?:\/tree\/([^/]+))?\/?(.+)?/);
        if (!match) return null;
        
        const [, owner, repo, branch = 'main', path = ''] = match;
        return { owner, repo, branch, path };
    }

    /* Load content from GitHub API */
    async loadContent() {
        const repoPath = this.getAttribute('repo-path');
        const linkPrefix = this.getAttribute('link-prefix')?.replace(/\/$/, '') || '';
        const list = this.shadowRoot.getElementById('toc-list');
        
        if (!repoPath) {
            this.showError('No repo-path attribute provided');
            return;
        }

        const params = this.parseGitHubUrl(repoPath);
        if (!params) {
            this.showError('Invalid GitHub URL format');
            return;
        }

        try {
            const response = await fetch(
                `https://api.github.com/repos/${params.owner}/${params.repo}/contents/${params.path}?ref=${params.branch}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            /* Sort files: directories first, then regular files */
            const sortedData = data.sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'dir' ? -1 : 1;
            });

            /* Generate list items */
            list.innerHTML = sortedData
                .filter(item => 
                    !item.name.startsWith('.') && 
                    !item.name.startsWith('_') &&
                    !this.shouldExclude(item.name)
                )
                .map(item => {
                    const displayName = item.name
                        .replace(/\.[^/.]+$/, '')  /* Remove file extension */
                        .replace(/([A-Z])/g, ' $1') /* Add spaces before capitals */
                        .replace(/^./, str => str.toUpperCase()) /* Capitalize first letter */
                        .trim();
                    
                    return `
                        <li>
                            <a href="${linkPrefix}/${item.name}">
                                ${displayName}
                            </a>
                        </li>
                    `;
                })
                .join('');

        } catch (error) {
            this.showError(`Error loading content: ${error.message}`);
        }
    }

    /* Display error message */
    showError(message) {
        this.shadowRoot.innerHTML = `
            <div class="error">
                ${message}
            </div>
        `;
    }
}

/* Register the web component */
customElements.define('github-toc', GitHubToc);
