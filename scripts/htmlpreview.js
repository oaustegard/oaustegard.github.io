(function () {
	// License © 2019 Jerzy Głowacki under Apache License 2.0.
	// https://github.com/htmlpreview/htmlpreview.github.com#license

	// edited by oaustegard to serve my own gists by guid and others via API
	var previewForm = document.getElementById('previewform');
	var url = location.search.substring(1);

	// Helper functions for loading/error display
	var showLoading = function(message) {
		var loadingDiv = document.getElementById('loading-display');
		var loadingMsg = document.getElementById('loading-message');
		if (loadingDiv && loadingMsg) {
			loadingMsg.innerText = message || 'Fetching content';
			loadingDiv.style.display = 'block';
		}
	};

	var hideLoading = function() {
		var loadingDiv = document.getElementById('loading-display');
		if (loadingDiv) {
			loadingDiv.style.display = 'none';
		}
	};

	var showError = function(error) {
		var errorDiv = document.getElementById('error-display');
		var errorMsg = document.getElementById('error-message');
		if (errorDiv && errorMsg) {
			errorMsg.innerText = error.message || error.toString();
			errorDiv.style.display = 'block';
		}
		hideLoading();
		console.error(error);
	};

	// Theme management
	var themeManager = {
		current: (function() {
			try {
				return localStorage.getItem('pv-theme') || 'auto';
			} catch(e) {
				console.warn('localStorage not available:', e);
				return 'auto';
			}
		})(),

		init: function() {
			console.log('[Theme] Initializing theme manager');
			this.apply();
			this.setupControls();
			console.log('[Theme] Theme manager initialized');
		},

		apply: function() {
			var theme = this.current;
			var effectiveTheme = theme;

			// Handle 'auto' theme
			if (theme === 'auto') {
				effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
			}

			// Apply to document
			if (effectiveTheme === 'dark') {
				document.documentElement.setAttribute('data-theme', 'dark');
			} else {
				document.documentElement.removeAttribute('data-theme');
			}

			// Update button states
			var buttons = document.querySelectorAll('#theme-controls button[data-theme]');
			buttons.forEach(function(btn) {
				if (btn.getAttribute('data-theme') === theme) {
					btn.classList.add('active');
				} else {
					btn.classList.remove('active');
				}
			});
		},

		set: function(theme) {
			this.current = theme;
			localStorage.setItem('pv-theme', theme);
			this.apply();
			// Re-inject theme styles if content is loaded
			if (!previewForm || previewForm.style.display === 'none') {
				this.injectThemeStyles();
			}
		},

		setupControls: function() {
			var self = this;
			var buttons = document.querySelectorAll('#theme-controls button[data-theme]');
			buttons.forEach(function(btn) {
				btn.addEventListener('click', function(e) {
					e.preventDefault();
					self.set(this.getAttribute('data-theme'));
				});
			});

			// Listen for system theme changes when in auto mode
			try {
				window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
					if (self.current === 'auto') {
						self.apply();
						self.injectThemeStyles();
					}
				});
			} catch(e) {
				// Ignore if addEventListener is not supported
				console.warn('Could not add theme change listener:', e);
			}
		},

		injectThemeStyles: function() {
			var theme = this.current;
			var effectiveTheme = theme;

			if (theme === 'auto') {
				effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
			}

			// Remove any existing injected theme styles
			var existingStyle = document.getElementById('pv-theme-override');
			if (existingStyle) {
				existingStyle.remove();
			}

			// Only inject if dark theme
			if (effectiveTheme === 'dark') {
				var style = document.createElement('style');
				style.id = 'pv-theme-override';
				style.innerHTML = `
					/* Theme override for loaded content */
					html, body {
						background-color: #1a1a1a !important;
						color: #e0e0e0 !important;
					}
					body * {
						background-color: transparent !important;
						color: inherit !important;
					}
					/* Preserve some intentional backgrounds */
					pre, code, table {
						background-color: #2a2a2a !important;
						color: #e0e0e0 !important;
					}
					a {
						color: #6db3f2 !important;
					}
					a:visited {
						color: #b19cd9 !important;
					}
					/* Ensure theme controls stay visible */
					#theme-controls, #theme-controls * {
						background-color: #2a2a2a !important;
						color: #e0e0e0 !important;
						border-color: #444 !important;
					}
					#theme-controls button.active {
						background-color: #9a9a9a !important;
						color: #1a1a1a !important;
					}
				`;
				document.head.appendChild(style);
			}
		}
	};

	// Initialize theme on page load (wait for DOM)
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function() {
			themeManager.init();
		});
	} else {
		themeManager.init();
	}

	var resolveUrl = function(inputUrl) {
		return new Promise(function(resolve, reject) {
			// Remove protocol if present to make matching easier
			var urlNormalized = inputUrl.replace(/^https?:\/\//, '');

			// Case 1: Gist ID or Gist ID/Filename
			// Matches: 32-char hex ID, optionally followed by /filename
			// Note: This regex avoids matching gist.github.com/... because it starts with hex char
			var idMatch = urlNormalized.match(/^([0-9a-f]{32})(?:\/(.+))?$/i);

			if (idMatch) {
				var gistId = idMatch[1];
				var filename = idMatch[2]; // can be undefined

				showLoading('Resolving Gist ID ' + gistId + '...');

				fetch('https://api.github.com/gists/' + gistId)
					.then(function(res) {
						if (!res.ok) {
							if (res.status === 404) throw new Error('Gist not found: ' + gistId);
							if (res.status === 403) throw new Error('GitHub API rate limit exceeded or access denied.');
							throw new Error('Error fetching Gist: ' + res.statusText);
						}
						return res.json();
					})
					.then(function(data) {
						var files = data.files;
						if (!files || Object.keys(files).length === 0) {
							throw new Error('No files found in Gist.');
						}

						var targetFile;
						if (filename) {
							// try to find exact match or URL decoded match
							var decodedFilename = decodeURIComponent(filename);
							targetFile = files[filename] || files[decodedFilename];

							// Try case-insensitive lookup
							if (!targetFile) {
								var lowerFilename = decodedFilename.toLowerCase();
								for (var key in files) {
									if (key.toLowerCase() === lowerFilename) {
										targetFile = files[key];
										break;
									}
								}
							}
						} else {
							// No filename specified, look for index.html or first html file
							targetFile = files['index.html'];
							if (!targetFile) {
								for (var key in files) {
									if (files[key].language === 'HTML') {
										targetFile = files[key];
										break;
									}
								}
							}
							// Fallback to first file
							if (!targetFile) {
								targetFile = files[Object.keys(files)[0]];
							}
						}

						if (!targetFile) {
							throw new Error('File not found in Gist: ' + (filename || 'default'));
						}

						resolve(targetFile.raw_url);
					})
					.catch(reject);
				return;
			}

			// Case 2: gist.github.com URLs
			// Format: gist.github.com/username/gistid or gist.github.com/username/gistid/filename.html
			var gistMatch = urlNormalized.match(/gist\.github\.com\/([^\/]+)\/([0-9a-f]+)(?:\/([^\/\?#]+))?/i);
			if (gistMatch) {
				var username = gistMatch[1];
				var gistId = gistMatch[2];
				var filename = gistMatch[3] || ''; // Optional filename

				// Build raw URL
				if (filename && !filename.includes('raw')) {
					// Specific file requested
					resolve("https://gist.githubusercontent.com/" + username + "/" + gistId + "/raw/" + filename);
				} else {
					// No specific file, return raw gist URL
					resolve("https://gist.githubusercontent.com/" + username + "/" + gistId + "/raw/");
				}
				return;
			}

			// Case 3: Already a raw.githubusercontent.com gist URL
			if (urlNormalized.includes('gist.githubusercontent.com')) {
				resolve('https://' + urlNormalized);
				return;
			}

			// Case 4: Regular GitHub URLs
			if (urlNormalized.includes('github.com')) {
				resolve('https://' + urlNormalized.replace(/\/\/github\.com/, '//raw.githubusercontent.com').replace(/\/blob\//, '/'));
				return;
			}

			// Case 5: Return as-is with protocol
			resolve(inputUrl.startsWith('http') ? inputUrl : 'https://' + inputUrl);
		});
	};

	var replaceAssets = function () {
		var frame, a, link, links = [], script, scripts = [], i, href, src;
		//Framesets
		if (document.querySelectorAll('frameset').length)
			return; //Don't replace CSS/JS if it's a frameset, because it will be erased by document.write()
		//Frames
		frame = document.querySelectorAll('iframe[src],frame[src]');
		for (i = 0; i < frame.length; ++i) {
			src = frame[i].src; //Get absolute URL
			if (src.indexOf('//raw.githubusercontent.com') > 0 || src.indexOf('//bitbucket.org') > 0) { //Check if it's from raw.github.com or bitbucket.org
				frame[i].src = '//' + location.hostname + location.pathname + '?' + src; //Then rewrite URL so it can be loaded using CORS proxy
			}
		}
		//Links
		a = document.querySelectorAll('a[href]');
		for (i = 0; i < a.length; ++i) {
			href = a[i].href; //Get absolute URL
			if (href.indexOf('#') > 0) { //Check if it's an anchor
				a[i].href = '//' + location.hostname + location.pathname + location.search + '#' + a[i].hash.substring(1); //Then rewrite URL with support for empty anchor
			} else if ((href.indexOf('//raw.githubusercontent.com') > 0 || href.indexOf('//bitbucket.org') > 0) && (href.indexOf('.html') > 0 || href.indexOf('.htm') > 0)) { //Check if it's from raw.github.com or bitbucket.org and to HTML files
				a[i].href = '//' + location.hostname + location.pathname + '?' + href; //Then rewrite URL so it can be loaded using CORS proxy
			}
		}
		//Stylesheets
		link = document.querySelectorAll('link[rel=stylesheet]');
		for (i = 0; i < link.length; ++i) {
			href = link[i].href; //Get absolute URL
			if (href.indexOf('//raw.githubusercontent.com') > 0 || href.indexOf('//bitbucket.org') > 0) { //Check if it's from raw.github.com or bitbucket.org
				links.push(fetchProxy(href, null, 0)); //Then add it to links queue and fetch using CORS proxy
			}
		}
		Promise.all(links).then(function (res) {
			for (i = 0; i < res.length; ++i) {
				loadCSS(res[i]);
			}
		});
		//Scripts
		script = document.querySelectorAll('script[type="text/htmlpreview"]');
		for (i = 0; i < script.length; ++i) {
			src = script[i].src; //Get absolute URL
			if (src.indexOf('//raw.githubusercontent.com') > 0 || src.indexOf('//bitbucket.org') > 0) { //Check if it's from raw.github.com or bitbucket.org
				scripts.push(fetchProxy(src, null, 0)); //Then add it to scripts queue and fetch using CORS proxy
			} else {
				script[i].removeAttribute('type');
				scripts.push(script[i].innerHTML); //Add inline script to queue to eval in order
			}
		}
		Promise.all(scripts).then(function (res) {
			for (i = 0; i < res.length; ++i) {
				loadJS(res[i]);
			}
			document.dispatchEvent(new Event('DOMContentLoaded', {bubbles: true, cancelable: true})); //Dispatch DOMContentLoaded event after loading all scripts
		});
	};

	var loadHTML = function (data) {
		if (data) {
			data = data.replace(/<head([^>]*)>/i, '<head$1><base href="' + url + '">').replace(/<script(\s*src=["'][^"']*["'])?(\s*type=["'](text|application)\/javascript["'])?/gi, '<script type="text/htmlpreview"$1'); //Add <base> just after <head> and replace <script type="text/javascript"> with <script type="text/htmlpreview">
			setTimeout(function () {
				document.open();
				document.write(data);
				document.close();
				replaceAssets();

				// Re-inject theme controls CSS and HTML after document.write()
				var themeCSS = document.createElement('style');
				themeCSS.innerHTML = `
					#theme-controls {
						position: fixed;
						top: 10px;
						right: 10px;
						z-index: 10000;
						display: flex;
						gap: 5px;
						background: #f0f0f0;
						border: 1px solid #ccc;
						border-radius: 5px;
						padding: 5px;
						box-shadow: 0 2px 5px rgba(0,0,0,0.2);
					}
					#theme-controls button {
						background: #f0f0f0;
						color: #333;
						border: 1px solid #ccc;
						border-radius: 3px;
						padding: 5px 10px;
						cursor: pointer;
						font-size: 11px;
					}
					#theme-controls button:hover {
						opacity: 0.8;
					}
					#theme-controls button.active {
						background: #666;
						color: #fff;
						font-weight: bold;
					}
					#back-button {
						margin-right: 10px;
					}
				`;
				document.head.appendChild(themeCSS);

				var themeControls = '<div id="theme-controls">' +
					'<button id="back-button" onclick="location.href=\'/pv.html\';return false;" title="Back to form">Back</button>' +
					'<button data-theme="light" title="Light theme">Light</button>' +
					'<button data-theme="auto" title="Auto (system preference)">Auto</button>' +
					'<button data-theme="dark" title="Dark theme">Dark</button>' +
					'</div>';

				document.body.insertAdjacentHTML('afterbegin', themeControls);

				// Re-initialize theme after content loads
				setTimeout(function() {
					themeManager.init();
					themeManager.injectThemeStyles();
				}, 50);
			}, 10); //Delay updating document to have it cleared before
		}
	};

	var loadCSS = function (data) {
		if (data) {
			var style = document.createElement('style');
			style.innerHTML = data;
			document.head.appendChild(style);
		}
	};

	var loadJS = function (data) {
		if (data) {
			var script = document.createElement('script');
			script.innerHTML = data;
			document.body.appendChild(script);
		}
	};
	
	var fetchProxy = function (url, options, i) {
		var proxy = [
			'', // try without proxy first
			'https://api.codetabs.com/v1/proxy/?quest='
		];
		return fetch(proxy[i] + url, options).then(function (res) {
			if (!res.ok) throw new Error('Cannot load ' + url + ': ' + res.status + ' ' + res.statusText);
			return res.text();
		}).catch(function (error) {
			if (i === proxy.length - 1)
				throw error;
			return fetchProxy(url, options, i + 1);
		})
	};

	if (url && url.indexOf(location.hostname) < 0) {
		showLoading('Resolving URL...');
		resolveUrl(url).then(function(resolvedUrl) {
			url = resolvedUrl;
			showLoading('Fetching content...');
			return fetchProxy(url, null, 0);
		}).then(function(html) {
			hideLoading();
			loadHTML(html);
			// Save successful URL to localStorage
			try {
				localStorage.setItem('pv-last-url', location.search.substring(1));
			} catch(e) {
				console.warn('Could not save last URL:', e);
			}
		}).catch(function (error) {
			showError(error);
			previewForm.style.display = 'block';
		});
	}
	else {
		previewForm.style.display = 'block';
		// Populate input with last successful URL if available
		var fileInput = document.getElementById('file');
		if (fileInput) {
			try {
				var lastUrl = localStorage.getItem('pv-last-url');
				if (lastUrl) {
					fileInput.value = lastUrl;
				}
			} catch(e) {
				console.warn('Could not load last URL:', e);
			}
		}
	}

})()