# Found Item QR Code System - Generator Documentation

## Overview

This system allows you to generate QR codes for personal items that, when scanned by a finder, enable them to easily notify you via a GitHub issue. The system prioritizes **ultra-short URLs** to create simple QR codes that scan reliably even when printed at small sizes.

## Architecture

### Components

1. **Generator** (`/found/generator.html`)
   - Browser-based QR code generator
   - One-time setup: encrypts GitHub PAT with a decryption key
   - Per-item generation: creates minimal URLs with item name
   - Stores decryption key in browser localStorage

2. **Found Page** (`/found/index.html`)
   - Public-facing page that QR codes link to
   - Receives: decryption key + item name via URL parameters
   - Decrypts the stored PAT and files a GitHub issue when finder submits
   - Supports location sharing and custom messages

3. **GitHub Issues** (external)
   - Serves as the notification backend
   - Issues contain: item name, finder's message, contact info, location

### Data Flow

```
[Setup - One Time]
Generator → Encrypt PAT with Key → Store encrypted PAT in found page → Commit to GitHub

[Per Item]
Generator → Generate URL: ?k=<key>&n=<itemName>&m=<message> → Print QR Code

[When Found]
Finder scans QR → Found page loads → Decrypts PAT with key from URL →
Finder fills form → Files GitHub issue → Owner notified
```

## URL Format

```
https://austegard.com/found?k=<decryption_key>&n=<item_name>&m=<optional_message>
```

**Example:**
```
https://austegard.com/found?k=AbCd123XyZ456&n=Blue%20Water%20Bottle&m=Text%20me%20anytime
```

**Length:** Typically 60-100 characters (vs. 200-250 in previous iterations)

## Security Model

### Threat Model & Constraints

**Primary concern:** Automated bots scanning GitHub repositories for API keys

**Constraints:**
1. Everything is stored in a public GitHub repository
2. The PAT is necessarily exposed in browser network traffic when filing issues
3. The PAT has limited scope: only `issues:write` on a single repository
4. Limited blast radius: worst case is spam issues in one repo

### Current Security Approach

**Goal: Obscurity sufficient to avoid automated bot detection**

1. **PAT Storage:**
   - Encrypted using AES-GCM with PBKDF2 key derivation
   - Stored as hex string in found page source
   - Variable name doesn't suggest its purpose (`ENCRYPTED_PAT`)

2. **Decryption Key:**
   - Stored in generator (localStorage + hardcoded in source)
   - Included in every QR code URL
   - Not immediately obvious that it decrypts a PAT

3. **Separation:**
   - Encrypted PAT lives in `/found/index.html`
   - Decryption key lives in `/found/generator.html`
   - Not stored together with obvious labels
   - Requires understanding the relationship to exploit

**Security Properties:**
- ✅ Protects against trivial automated scans for `ghp_*` patterns
- ✅ Requires attacker to understand the system architecture
- ✅ Real encryption (not just base64 encoding)
- ❌ Does NOT protect against determined attackers with physical QR access
- ❌ Does NOT protect against attackers who reverse-engineer the system

### Why This Is "Good Enough"

1. **Limited PAT scope** - only creates issues in one repo
2. **Observable in network traffic anyway** - anyone monitoring browser requests sees the PAT
3. **Better than alternatives:**
   - Base64 encoding → decoded by bots trivially
   - No protection → instantly detected by `ghp_` pattern matching
4. **Balanced trade-off** between security and URL length (primary goal)

## Design Evolution & Discarded Approaches

### Iteration 1: Fully Encrypted Payload (Discarded)
**Approach:** Encrypt everything (PAT, repo, item name) with per-item secret
```
URL: ?s=<secret>&d=<large_encrypted_blob>
Length: ~250 characters
```

**Why discarded:**
- URL too long → complex QR codes
- QR codes difficult to scan at small print sizes
- Item name doesn't need to be secret (visible in GitHub issue anyway)

### Iteration 2: Hardcoded Base64 PAT (Discarded)
**Approach:** Store PAT as base64 in found page, only pass item data in URL
```
Found page: ENCODED_PAT = 'Z2hwXzEyMzQ1...'
URL: ?k=<secret>&d=<encrypted_item_data>
```

**Why discarded:**
- Base64 is not encryption - trivially decoded
- Bots can easily detect and decode base64-encoded GitHub PATs
- Marginally better than plaintext

### Iteration 3: Split Key with HMAC Validation (Discarded)
**Approach:** Split decryption key into two parts
```
Part A (stored in found page) + Part B (in URL) = Master Key
Part B = Hash(ItemName) XOR Constant
```

**Why discarded:**
- High complexity for marginal security gain
- Requires solving: `itemKey = Hash(ItemName) XOR PartB`
- Still doesn't protect against anyone with a single QR code
- URL length not significantly reduced
- Over-engineered for threat model

### Iteration 4: Current Approach ✓
**Approach:** Single decryption key in URL, encrypted PAT in found page
```
URL: ?k=<key>&n=<itemName>&m=<message>
Length: 60-100 characters
```

**Why chosen:**
- Minimal URL length (primary goal achieved)
- Real encryption (AES-GCM) prevents trivial bot detection
- Simple architecture, easy to understand
- Good enough for limited-scope PAT
- Optimal trade-off: security vs. simplicity vs. URL length

## Setup Instructions

### One-Time Setup

1. **Generate Decryption Key**
   - Open `/found/generator.html`
   - Expand "One-Time Setup" section
   - Click "Generate" to create a random 24-character key
   - Key is stored in browser localStorage

2. **Encrypt Your GitHub PAT**
   - Enter your GitHub PAT (with `issues:write` scope for the target repo)
   - Click "Encrypt PAT"
   - Copy the encrypted PAT hex string

3. **Update Found Page**
   - Edit `/found/index.html`
   - Find: `ENCRYPTED_PAT: 'REPLACE_WITH_ENCRYPTED_PAT_FROM_GENERATOR'`
   - Replace with: `ENCRYPTED_PAT: '<your_encrypted_pat_hex>'`
   - Commit and push to GitHub

4. **Verify Configuration**
   - Update `REPO` in both files if using a different repository
   - Update `BASE_URL` in generator if using a different domain

### Generating QR Codes

1. Open `/found/generator.html`
2. Enter item name (e.g., "Blue Water Bottle")
3. Optionally add an owner message
4. Click "Generate QR Code"
5. Print or save the generated QR code

### Testing

1. Generate a test QR code
2. Scan with your phone or navigate to the URL
3. Verify the found page loads correctly
4. Fill out the form and submit
5. Check that a GitHub issue was created

## Configuration

### Generator Config
Located at top of `/found/generator.html`:

```javascript
const APP_CONFIG = {
  REPO: 'oaustegard/found-item',
  BASE_URL: 'https://austegard.com/found',
};
```

### Found Page Config
Located at top of `/found/index.html`:

```javascript
const CONFIG = {
  ENCRYPTED_PAT: '<your_encrypted_pat>',
  REPO: 'oaustegard/found-item',
  DEFAULT_MESSAGE: 'If found, please use the form below...'
};
```

## Maintenance

### Rotating the PAT

If you need to rotate your GitHub PAT:

1. Create a new GitHub PAT
2. Open the generator
3. Re-encrypt the new PAT
4. Update the `ENCRYPTED_PAT` in `/found/index.html`
5. Commit and push
6. Existing QR codes continue to work (same decryption key)

### Rotating the Decryption Key

If you need to rotate the decryption key (e.g., if compromised):

1. Open the generator
2. Click "Regenerate" in the setup section
3. Re-encrypt your PAT with the new key
4. Update the `ENCRYPTED_PAT` in `/found/index.html`
5. **Important:** All previous QR codes will stop working
6. You'll need to regenerate and reprint all QR codes

## Technical Details

### Encryption

- **Algorithm:** AES-GCM (256-bit)
- **Key Derivation:** PBKDF2 with SHA-256 (100,000 iterations)
- **Salt:** Static (`found-item-salt-v1`) - acceptable since key is random
- **IV:** Random 12 bytes per encryption
- **Encoding:** Hex (for PAT), URL-safe for query parameters

### Browser Compatibility

- Requires Web Crypto API support (all modern browsers)
- Requires QRCode.js library (loaded from CDN)
- Requires geolocation API for optional location sharing

## Privacy Considerations

### Item Name
- Transmitted in plaintext in URL
- Visible in browser history, server logs, etc.
- Acceptable: will be in public GitHub issue anyway

### Owner Message
- Transmitted in plaintext in URL
- Should not contain sensitive information
- Will be visible in the GitHub issue

### Finder Data
- Submitted only when finder chooses to
- Stored in GitHub issue (visibility depends on repo settings)
- Location data: only if finder explicitly opts in

## Fork & Customize

To use this system for your own items:

1. Fork this repository
2. Update `REPO` in both generator and found page
3. Update `BASE_URL` to your domain
4. Run the one-time setup with your GitHub PAT
5. Customize styling, messages, etc. as desired

## License

This system is part of a personal website. If you fork it, please customize it for your own use and don't just copy the configuration values.
