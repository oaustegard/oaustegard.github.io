/* GitHub Table of Contents Web Component with README Support */
class GitHubToc extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    /* Define observed attributes for the component */
    static get observedAttributes() {
        return ['repo-path', 'link-prefix', 'exclude', 'include'];
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

    /* Check if a filename matches any include pattern */
    shouldInclude(filename) {
        const includeStr = this.getAttribute('include');
        if (!includeStr) return true; /* If no include patterns, include all files */

        /* Split by commas, trim whitespace, and filter empty strings */
        const patterns = includeStr
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
                .readme-link {
                    margin-left: 0.5em;
                    font-variant: small-caps;
                    font-size: 0.8em;
                    opacity: 0.8;
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

    /* Generate README URL for a given file */
    getReadmeUrl(params, filename) {
        const baseName = filename.replace(/\.[^/.]+$/, '');
        return `https://github.com/${params.owner}/${params.repo}/blob/${params.branch}/${params.path}/${baseName}_README.md`;
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

            /* Get all README files to check which files have associated READMEs */
            const readmeFiles = data
                .filter(item => item.name.endsWith('_README.md'))
                .map(item => item.name.replace('_README.md', ''));
            
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
                    !this.shouldExclude(item.name) &&
                    this.shouldInclude(item.name)
                )
                .map(item => {
                    const displayName = item.name
                        .replace(/\.[^/.]+$/, '')  /* Remove file extension */
                        .replace(/[-_]/g, ' ')     /* Replace hyphens and underscores with spaces */
                        .replace(/([a-z])([A-Z])/g, '$1 $2') /* Add space between camelCase */
                        .replace(/\s+/g, ' ')      /* Collapse spaces */
                        .toLowerCase()             /* Normalize to lower case for title casing */
                        .replace(/(?:^|\s)\w/g, c => c.toUpperCase()) /* Apply title case */
                        .trim();                   /* Trim whitespace */
                    
                    /* Check if this file has an associated README */
                    const baseName = item.name.replace(/\.[^/.]+$/, '');
                    const hasReadme = readmeFiles.includes(baseName);
                    const readmeLink = hasReadme ? 
                        `<a href="${this.getReadmeUrl(params, item.name)}" class="readme-link">(readme)</a>` : 
                        '';
                    
                    return `
                        <li>
                            <a href="${linkPrefix}/${item.name}">
                                ${displayName}
                            </a>
                            ${readmeLink}
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
