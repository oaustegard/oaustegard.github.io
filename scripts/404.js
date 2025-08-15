document.addEventListener("DOMContentLoaded", function() {
    fetch('/sitemap.xml')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text(); // Get XML as text, not JSON
        })
        .then(xmlText => {
            // Parse the XML
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            // Extract all <loc> elements (URLs)
            const locElements = xmlDoc.getElementsByTagName('loc');
            const fileList = [];
            
            // Convert XML URLs to relative paths
            for (let i = 0; i < locElements.length; i++) {
                const url = locElements[i].textContent;
                try {
                    const urlObj = new URL(url);
                    fileList.push(urlObj.pathname); // Extract just the path part
                } catch (e) {
                    // Skip invalid URLs
                    console.warn('Invalid URL in sitemap:', url);
                }
            }
            
            // Rest of your logic remains the same
            const path = window.location.pathname;
            const params = window.location.search;
            const filename = path.split('/').pop();

            if (filename) {
                const matches = fileList.filter(file => file.endsWith('/' + filename));
                if (matches.length > 0) {
                    const newPath = matches[0];
                    const message = document.getElementById('message');
                    if (message) {
                        message.innerHTML = `We found it! You are being redirected to <a href="${newPath}${params}">${newPath}</a>...`;
                    }
                    setTimeout(() => {
                        window.location.href = `${newPath}${params}`;
                    }, 3000);
                }
            }
        })
        .catch(error => {
            console.error('Error fetching or processing sitemap:', error);
            // The default "not found" message will remain.
        });
});