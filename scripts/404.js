document.addEventListener("DOMContentLoaded", function() {
    fetch('/sitemap.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(fileList => {
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
