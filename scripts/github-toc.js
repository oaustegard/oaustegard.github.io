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

    /* Styles live in one place so the error view keeps them too.
       Colours come from the site's custom properties (inherited into the shadow
       root); the fallbacks are system colours, so the list also reads correctly
       on a page that does not define them, in light and in dark. */
    styles() {
        return `
            <style>
                :host {
                    display: block;
                    font-family: var(--font-body, system-ui, -apple-system, sans-serif);
                    color: var(--ink, CanvasText);
                    --mark: var(--T, url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 12'%3E%3Cpath d='M0 0h10v3.200H6.600V12H3.400V3.200H0z'/%3E%3C/svg%3E"));
                }
                ul {
                    list-style: none;
                    padding: 0;
                    margin: 1.25rem 0;
                    border-top: 1px solid var(--ink, CanvasText);
                }
                ul:empty { border-top: 0; margin: 1.25rem 0; }
                ul:empty::before {
                    content: "Loading the list from GitHub\\2026";
                    font: 400 .75rem/1.4 var(--font-mono, ui-monospace, monospace);
                    color: var(--mute, GrayText);
                }
                li {
                    position: relative;
                    margin: 0;
                    padding: .7rem 0 .7rem 1.5rem;
                    border-bottom: 1px solid var(--hair, rgba(128, 128, 128, .3));
                }
                li::before {
                    content: "";
                    position: absolute;
                    left: 2px;
                    top: 1.2em;
                    width: 8px;
                    height: 10px;
                    background: var(--red, #a43a3a);
                    -webkit-mask: var(--mark) center/contain no-repeat;
                    mask: var(--mark) center/contain no-repeat;
                }
                li:hover::before, li:focus-within::before {
                    background: var(--ink, CanvasText);
                }
                a {
                    color: var(--ink, CanvasText);
                    font-weight: 600;
                    font-size: 1.0625rem;
                    text-decoration: none;
                }
                a:hover {
                    color: var(--link-hover, #a43a3a);
                    text-decoration: underline;
                    text-underline-offset: .2em;
                }
                a:focus-visible {
                    outline: 2px solid var(--focus, #a43a3a);
                    outline-offset: 3px;
                    border-radius: 2px;
                }
                .readme-link {
                    margin-left: .8em;
                    font: 400 .75rem/1.4 var(--font-mono, ui-monospace, monospace);
                    font-weight: 400;
                    color: var(--mute, GrayText);
                    text-decoration: none;
                }
                .readme-link:hover {
                    color: var(--link-hover, #a43a3a);
                    text-decoration: underline;
                }
                .error {
                    margin: 1.25rem 0;
                    padding: .7rem 0 .7rem .9rem;
                    border-left: 3px solid var(--red, #a43a3a);
                    color: var(--ink-2, CanvasText);
                    font-size: .9375rem;
                    line-height: 1.5;
                }
                .error a {
                    color: var(--link, LinkText);
                    font-size: inherit;
                    font-weight: 400;
                    text-decoration: underline;
                    text-decoration-thickness: 1px;
                    text-underline-offset: .2em;
                    text-decoration-color: var(--line, currentColor);
                }
                .error a:hover {
                    color: var(--link-hover, #a43a3a);
                    text-decoration-color: currentColor;
                }
            </style>`;
    }

    /* Render the basic structure */
    render() {
        this.shadowRoot.innerHTML = `
            ${this.styles()}
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

    /* Generate GitHub blob URL for a file by transforming repo-path */
    getFileUrl(repoPath, filename) {
        const baseUrl = repoPath.replace(/\/tree\//, '/blob/').replace(/\/$/, '');
        return `${baseUrl}/${filename}`;
    }

    /* Generate README URL for a given file */
    getReadmeUrl(repoPath, filename) {
        const baseName = filename.replace(/\.[^/.]+$/, '');
        const baseUrl = repoPath.replace(/\/tree\//, '/blob/').replace(/\/$/, '');
        return `${baseUrl}/${baseName}_README.md`;
    }

    /* Load content from GitHub API */
    async loadContent() {
        const repoPath = this.getAttribute('repo-path');
        const linkPrefix = this.getAttribute('link-prefix');
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
                    
                    /* Generate file URL: use link-prefix if provided, otherwise use GitHub blob URL */
                    const fileUrl = linkPrefix 
                        ? `${linkPrefix.replace(/\/$/, '')}/${item.name}`
                        : this.getFileUrl(repoPath, item.name);
                    
                    /* Check if this file has an associated README */
                    const baseName = item.name.replace(/\.[^/.]+$/, '');
                    const hasReadme = readmeFiles.includes(baseName);
                    const readmeLink = hasReadme ? 
                        `<a href="${this.getReadmeUrl(repoPath, item.name)}" class="readme-link">(readme)</a>` : 
                        '';
                    
                    return `
                        <li>
                            <a href="${fileUrl}">
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

    /* Display error message, with a plain link to the repository when there is one */
    showError(message) {
        const repoPath = this.getAttribute('repo-path') || '';
        const link = /^https:\/\/github\.com\//.test(repoPath)
            ? ` <a href="${repoPath.replace(/"/g, '&quot;')}">Open the repository on GitHub.</a>`
            : '';
        this.shadowRoot.innerHTML = `
            ${this.styles()}
            <div class="error">
                ${message}.${link}
            </div>
        `;
    }
}

/* Register the web component */
customElements.define('github-toc', GitHubToc);
