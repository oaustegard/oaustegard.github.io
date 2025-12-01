# 🦄 Unicorn Spotter PWA - Mobile Installation Guide

A magical Progressive Web App for tracking unicorn sightings! Fully installable on iOS and Android devices.

## Features

- 📱 **Installable as native app** - Add to home screen on any device
- 📍 **Location-based tracking** - See unicorn sightings within 5 miles
- 📋 **Detailed sightings list** - Tap the counter to see all nearby unicorns with addresses, distances, and directions
- 🔔 **Push notifications** - Get alerted when unicorns appear nearby
- ✨ **Offline capable** - Works without internet (after first load)
- 🌈 **Demo mode** - Test without backend (generates fake sightings)
- 🎯 **Real-time updates** - WebSocket support for live sighting updates
- 📳 **Haptic feedback** - Vibration on interactions (mobile)
- 🗺️ **Reverse geocoding** - Automatic address lookup for each sighting

## Quick Deploy

### Option 1: Static Hosting (Easiest)

Upload `unicorn-spotter.html` to any static host:
- **GitHub Pages**: Push to repo, enable Pages
- **Netlify**: Drag & drop file
- **Vercel**: Connect repo or upload
- **Cloudflare Pages**: Deploy from Git

### Option 2: Single File Server

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve .

# Access at http://localhost:8000/unicorn-spotter.html
```

## Mobile Installation

### iPhone/iPad (iOS/iPadOS)

1. Open Safari and navigate to your deployed URL
2. Tap the **Share** button (⬆️) at the bottom
3. Scroll down and tap **"Add to Home Screen"**
4. Edit the name if desired, tap **"Add"**
5. App appears on home screen with icon

**Important for iOS:**
- Must use Safari browser
- HTTPS required for service worker (or localhost)
- Notifications require iOS 16.4+

### Android (Chrome/Edge/Samsung Internet)

1. Open browser and navigate to your URL
2. Tap the **menu** (⋮) button
3. Select **"Add to Home Screen"** or **"Install App"**
4. Confirm installation
5. App appears in app drawer and home screen

**Alternatively:** Look for the install prompt banner that appears automatically.

## Permission Requests

On first launch, the app requests:

1. **📍 Location** - Required to:
   - Show your position on map
   - Calculate distances to sightings
   - Subscribe to nearby unicorn reports

2. **🔔 Notifications** - Required to:
   - Alert you of new sightings nearby
   - Work even when app is closed

**Both permissions are required for full functionality!**

## Using the App

### Viewing Sightings

**On Map:**
- Unicorn markers (🦄) appear at sighting locations
- Tap any marker to see details and time
- Markers auto-expire after 4 hours

**Sightings List:**
- Tap the **"N unicorns spotted nearby"** counter at the top
- See all nearby sightings sorted by distance
- Each entry shows:
  - Distance and compass direction (e.g., "2.3 mi NE")
  - Street address (auto-loaded)
  - Time of sighting
  - Optional details from reporter
- Tap any sighting to jump to it on the map

### Reporting Sightings

1. Tap **"🦄 Spotted a Unicorn!"** button
2. Tap the location on the map where you saw it
3. Optionally add details (color, horn sparkle level, etc.)
4. Submit!

**Rate Limiting:** You can only report once every 5 minutes to prevent spam.

## Configuration

Edit the `CONFIG` object in the HTML file:

```javascript
const CONFIG = {
    WS_URL: 'wss://api.unicornspotter.app/ws',  // Your WebSocket server
    API_URL: 'https://api.unicornspotter.app',  // Your REST API
    DEMO_MODE: true  // Set to false when backend is ready
};
```

### Demo Mode

- Enabled by default for testing
- Generates fake unicorn sightings
- No backend required
- Perfect for development/testing

### Production Mode

Set `DEMO_MODE: false` and provide backend URLs:

**WebSocket Messages (Server → Client):**
```json
{
  "type": "sighting_new",
  "sighting": {
    "id": "string",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "details": "Shimmering purple horn!",
    "created_at": "2025-10-03T12:00:00Z",
    "expires_at": "2025-10-03T16:00:00Z"
  }
}
```

**REST API Endpoints:**
```
POST /sightings
Body: { latitude, longitude, details? }

GET /sightings/nearby?lat={lat}&lng={lng}&radius={meters}
Returns: array of sightings
```

## Mobile-Specific Features

### Haptic Feedback
- Vibrates on report submission
- Error vibrations for invalid actions
- Works on iOS and Android

### Adaptive UI
- Responsive controls for all screen sizes
- Safe area insets for iPhone notch/Dynamic Island
- Touch-optimized map controls
- Prevents iOS zoom on input focus

### Background Notifications
- Receive alerts when app is closed
- Shows unicorn emoji in notification
- Tappable to open app at sighting

## Browser Support

| Feature | iOS Safari | Chrome Android | Samsung Internet |
|---------|-----------|----------------|------------------|
| Install | ✅ 11.3+ | ✅ 76+ | ✅ 4.0+ |
| Geolocation | ✅ | ✅ | ✅ |
| Notifications | ✅ 16.4+ | ✅ | ✅ |
| Service Worker | ✅ 11.3+ | ✅ 40+ | ✅ 4.0+ |
| WebSocket | ✅ | ✅ | ✅ |

## Troubleshooting

### Location not working
- Ensure HTTPS (or localhost for testing)
- Check browser permissions in Settings
- iOS: Settings → Privacy → Location Services → Safari
- Android: Settings → Apps → Chrome → Permissions

### Notifications not showing
- iOS requires 16.4+ for web notifications
- Check Do Not Disturb is off
- Verify notification permissions granted
- Try re-enabling in browser settings

### Can't install on iOS
- Must use Safari (not Chrome/Firefox)
- Already installed? Check home screen
- Try clearing Safari cache and retry

### Map not loading
- Check internet connection
- Verify OpenStreetMap tiles aren't blocked
- Try refreshing the page

### WebSocket connection fails (Production)
- Verify `WS_URL` is correct
- Check backend server is running
- Ensure WebSocket endpoint is accessible
- Look for CORS issues in console

### Addresses not loading in list
- Addresses load via OpenStreetMap's Nominatim API
- Rate limited to 1 request per second (automatically staggered)
- If service is down, coordinates shown instead
- Requires internet connection

## Development Tips

### Testing Locally

1. Use HTTPS for full PWA features:
```bash
# Using mkcert
mkcert -install
mkcert localhost
python3 -m http.server --bind 0.0.0.0 8000
```

2. Or use ngrok for HTTPS:
```bash
ngrok http 8000
```

### Mobile Debugging

**iOS Safari:**
1. Connect iPhone to Mac
2. Safari → Develop → [Your iPhone] → [Page]
3. Use Web Inspector console

**Android Chrome:**
1. Connect phone via USB
2. Chrome → `chrome://inspect`
3. Click "Inspect" on your device

### Force PWA Update

```javascript
// In service worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys => 
            Promise.all(keys.map(key => caches.delete(key)))
        )
    );
});
```

## Backend Architecture

For production deployment, you'll need:

1. **WebSocket Server** (Node.js/Go/Python)
   - Handle client connections
   - Broadcast new sightings to subscribers
   - Manage geographic subscriptions

2. **REST API** (Express/FastAPI/Gin)
   - Create new sightings
   - Query nearby sightings
   - Handle expiration (4 hours)

3. **Database** (PostgreSQL + PostGIS)
   - Store sighting locations
   - Efficient geographic queries
   - Auto-delete expired sightings

4. **Rate Limiting** (Redis)
   - Prevent spam (5 min cooldown)
   - IP-based or session-based

## Security Considerations

- No user authentication (fully anonymous)
- Rate limiting prevents abuse
- Input validation on backend
- HTTPS required for production
- CORS properly configured
- No sensitive data stored

## Performance

- Initial load: ~200KB (map tiles cached)
- Service Worker caches map tiles
- WebSocket for real-time updates
- Lazy load components
- Efficient geospatial queries

## License

Do whatever you want with it! 🦄✨

## Credits

- Built with [Leaflet.js](https://leafletjs.com/) for maps
- Map data © [OpenStreetMap](https://www.openstreetmap.org/) contributors
- Inspired by community safety apps
- Transformed into whimsical unicorn spotting for fun!

---

**Remember:** Unicorns are magical creatures. Treat them with respect! 🦄🌈✨
