import os
import json

def generate_sitemap():
    """
    Generates a sitemap of all .html, .md, and .htm files in the repository,
    and saves it as sitemap.json in the root directory.
    """
    sitemap = []
    exclude_dirs = ['.git', '.well-known', 'scripts']
    exclude_files = ['404.md']

    for root, dirs, files in os.walk('.'):
        # Exclude specified directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]

        for file in files:
            if file in exclude_files:
                continue

            if file.endswith(('.html', '.md', '.htm')):
                # Construct the web path
                path = os.path.join(root, file)
                # Normalize path for web (e.g., './dir/file.html' -> '/dir/file.html')
                web_path = '/' + path.replace(os.path.sep, '/').lstrip('./')

                # Replace .md with .html for Jekyll-like behavior
                if web_path.endswith('.md'):
                    web_path = web_path[:-3] + '.html'

                sitemap.append(web_path)

    # Sort the list for consistency
    sitemap.sort()

    with open('sitemap.json', 'w') as f:
        json.dump(sitemap, f, indent=2)

    print(f"Sitemap generated successfully with {len(sitemap)} entries.")

if __name__ == '__main__':
    generate_sitemap()
