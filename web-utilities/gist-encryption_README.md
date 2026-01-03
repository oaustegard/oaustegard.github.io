# Gist Encryption/Decryption Tool

A client-side encryption/decryption tool for securely sharing content via GitHub Gists. All encryption and decryption happens in your browser - no data is sent to any server.

## Features

- **AES-256-GCM Encryption**: Industry-standard encryption using the Web Crypto API
- **Client-Side Only**: All cryptographic operations happen in your browser
- **Gist Integration**: Designed to work seamlessly with GitHub Gists and the pv.html viewer
- **URL Fragment Keys**: Share decryption keys safely via URL fragments (never transmitted to servers)
- **Optional Salt**: Include unencrypted metadata with your encrypted content
- **Theme Support**: Light, dark, and auto themes

## How to Use

### Quick Start

1. **Encrypt**: Visit [gist-encryption.html](https://austegard.com/web-utilities/gist-encryption.html)
   - Enter your text
   - Click "🔒 Encrypt"
   - Copy the key (save it!)
   - Copy the encrypted JSON

2. **Share**: Create a [GitHub Gist](https://gist.github.com)
   - Paste the encrypted JSON as the gist content
   - Copy the gist ID from the URL

3. **Generate Link**: Back in the encryption tool
   - Paste the gist ID in step 3
   - Click "Generate Share URL"
   - Copy and share the URL

### How pv.html Decryption Works

When someone visits a URL like:
```
https://austegard.com/pv.html?GIST_ID#key=YOUR_KEY
```

Here's what happens:

1. **pv.html** fetches the gist content from GitHub
2. It detects if the content is encrypted (JSON with `iv` and `data` fields)
3. It extracts the decryption key from the URL fragment (`#key=...`)
4. It decrypts the content using the Web Crypto API
5. It displays the decrypted HTML/text

**Important**: The key in the URL fragment (`#key=...`) is never sent to any server - it stays in the browser only. This is a fundamental feature of URL fragments.

### Manual Decryption

If you prefer not to use pv.html, you can manually decrypt:

1. Open the gist-encryption tool
2. Scroll to the "Decrypt" section
3. Paste the encryption key
4. Paste the encrypted JSON
5. Click "🔓 Decrypt"

## Client-Side API

The tool supports programmatic encryption/decryption via the `postMessage` API, similar to the Claude Pruner tool.

### Encrypting via API

```javascript
// Open the tool in a hidden iframe or popup
const cryptoWindow = window.open('https://austegard.com/web-utilities/gist-encryption.html');

// Wait for it to load, then send encryption request
window.addEventListener('message', (event) => {
    if (event.data.type === 'gist-encrypt-result') {
        if (event.data.success) {
            console.log('Key:', event.data.key);
            console.log('Encrypted:', event.data.encrypted);
        } else {
            console.error('Encryption failed:', event.data.error);
        }
    }
});

cryptoWindow.postMessage({
    type: 'gist-encrypt',
    text: 'Your secret text here',
    salt: 'optional metadata'
}, 'https://austegard.com');
```

### Decrypting via API

```javascript
window.addEventListener('message', (event) => {
    if (event.data.type === 'gist-decrypt-result') {
        if (event.data.success) {
            console.log('Salt:', event.data.salt);
            console.log('Decrypted text:', event.data.text);
        } else {
            console.error('Decryption failed:', event.data.error);
        }
    }
});

cryptoWindow.postMessage({
    type: 'gist-decrypt',
    key: 'YOUR_ENCRYPTION_KEY',
    encrypted: {
        salt: 'metadata',
        iv: 'base64-encoded-iv',
        data: 'base64-encoded-ciphertext'
    }
}, 'https://austegard.com');
```

## Technical Details

### Encryption Algorithm

- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Size**: 256 bits
- **IV Size**: 96 bits (12 bytes)
- **Authentication**: Built-in with GCM mode

### Encrypted Format

Encrypted content is stored as JSON:

```json
{
  "iv": "base64-encoded initialization vector",
  "data": "base64-encoded encrypted content"
}
```

**What is the IV?** The Initialization Vector is a random 96-bit value that ensures the same plaintext encrypts to different ciphertext each time. It's safe to store publicly alongside the encrypted data.

### Security Considerations

✅ **Secure:**
- Uses industry-standard AES-256-GCM encryption
- Keys are randomly generated using `crypto.getRandomValues()`
- All operations use the Web Crypto API
- Keys in URL fragments are never sent to servers
- No server-side processing or storage

⚠️ **Important:**
- **The encryption key is not recoverable** - if you lose it, the data cannot be decrypted
- URL fragments can appear in browser history
- Anyone with the key can decrypt the content
- For highly sensitive data, consider additional security measures

## Workflow Example

1. **Create encrypted content:**
   ```
   Visit: https://austegard.com/web-utilities/gist-encryption.html
   Enter text: "My secret notes"
   Click: Encrypt
   Copy: Key and encrypted JSON
   ```

2. **Create a GitHub Gist:**
   ```
   Visit: https://gist.github.com
   Create new gist: paste encrypted JSON
   Note the gist ID: a1902d995b5c6157a9eaf69afa355723
   ```

3. **Share securely:**
   ```
   Share URL: https://austegard.com/pv.html?a1902d995b5c6157a9eaf69afa355723#key=Abc123...

   The recipient clicks the link and sees the decrypted content automatically!
   ```

## Self-Hosting

You can easily copy this tool to your own repository or use it locally. This is recommended if you don't want to rely on austegard.com or want to customize the functionality.

### Copy to Your Own GitHub Pages Repo

1. **Copy the files**:
   - `web-utilities/gist-encryption.html` (the encryption tool)
   - `pv.html` (the gist viewer)
   - `scripts/htmlpreview.js` (pv.html's JavaScript with decryption support)

2. **Commit to your repo**:
   ```bash
   git add web-utilities/gist-encryption.html pv.html scripts/htmlpreview.js
   git commit -m "Add gist encryption tools"
   git push
   ```

3. **Update the URLs**: Edit `gist-encryption.html` and change line 541:
   ```javascript
   // Change this:
   const url = `https://austegard.com/pv.html?${gistId}#key=${encodeURIComponent(key)}`;

   // To this (replace YOUR_USERNAME):
   const url = `https://YOUR_USERNAME.github.io/pv.html?${gistId}#key=${encodeURIComponent(key)}`;
   ```

4. **Deploy**: If you have GitHub Pages enabled, your tools will be available at:
   - `https://YOUR_USERNAME.github.io/web-utilities/gist-encryption.html`
   - `https://YOUR_USERNAME.github.io/pv.html`

### Use Locally (No Server Required)

1. **Download the files** from this repo
2. **Open `gist-encryption.html` directly** in your browser (file:// works fine)
3. **For decryption**:
   - You can use the manual decrypt section in the tool
   - Or set up a local server: `python -m http.server 8000`
   - Then use `http://localhost:8000/pv.html?GIST_ID#key=...`

**Note**: If using locally, you'll need to manually update the URL in step 3 of the encryption tool to point to your local pv.html.

### Why Self-Host?

- **Trust**: You control the code running in your browser
- **Privacy**: No reliance on third-party domains
- **Customization**: Modify the UI, add features, etc.
- **Offline**: Works without internet (after initial download)
- **Security**: Audit the code yourself to verify it's safe

The files are completely standalone - no build process, no dependencies beyond a modern browser.

## Inspiration

This tool was inspired by [agentexport](https://github.com/nicosuave/agentexport), which uses similar encryption techniques for sharing AI agent conversations.

## Privacy

- **All encryption/decryption happens in your browser**
- No data is sent to any server (austegard.com or otherwise)
- No analytics or tracking
- Open source - inspect the code yourself
- Self-hostable for maximum privacy

## Browser Support

Requires a modern browser with Web Crypto API support:
- Chrome 37+
- Firefox 34+
- Safari 11+
- Edge 12+

## License

Part of the oaustegard.github.io project. See repository for license details.
