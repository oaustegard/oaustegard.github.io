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

### Encrypting Content

1. Visit [austegard.com/web-utilities/gist-encryption.html](https://austegard.com/web-utilities/gist-encryption.html)
2. Optionally enter a salt (metadata that won't be encrypted, like version or description)
3. Enter the text you want to encrypt
4. Click "🔒 Encrypt"
5. **Save the encryption key** - you won't be able to decrypt without it!
6. Copy the encrypted text (JSON format)
7. Create a new GitHub Gist and paste the encrypted text

### Sharing Encrypted Gists

After creating a gist with encrypted content:

1. Get your gist ID (e.g., `a1902d995b5c6157a9eaf69afa355723`)
2. Share using the pv.html viewer with the key in the URL fragment:
   ```
   https://austegard.com/pv.html?a1902d995b5c6157a9eaf69afa355723#key=YOUR_ENCRYPTION_KEY
   ```

The key after the `#` is never sent to any server - it stays in the browser only.

### Decrypting Content

**Option 1: Via pv.html (Automatic)**
- Visit the pv.html URL with the key fragment (as shown above)
- The content will be automatically decrypted and displayed

**Option 2: Manual Decryption**
1. Visit the gist-encryption tool
2. Scroll to the "Decrypt" section
3. Paste the encryption key
4. Paste the encrypted text (JSON)
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
  "salt": "optional metadata (plaintext)",
  "iv": "base64-encoded initialization vector",
  "data": "base64-encoded encrypted content"
}
```

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

## Inspiration

This tool was inspired by [agentexport](https://github.com/nicosuave/agentexport), which uses similar encryption techniques for sharing AI agent conversations.

## Privacy

- **All encryption/decryption happens in your browser**
- No data is sent to austegard.com servers
- No analytics or tracking
- Open source - inspect the code yourself

## Browser Support

Requires a modern browser with Web Crypto API support:
- Chrome 37+
- Firefox 34+
- Safari 11+
- Edge 12+

## License

Part of the oaustegard.github.io project. See repository for license details.
