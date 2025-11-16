# Speedometer

A GPS-based heads-up display (HUD) speedometer designed for use while driving. Projects your current speed onto your car's windshield using your phone's screen reflection.

## Use Case

This speedometer app is designed to be placed on your car's dashboard with the screen facing up toward the windshield. The display reflects onto the glass, creating a heads-up display (HUD) that shows your current speed without taking your eyes off the road.

**Recommended Setup:**
- Place phone in portrait mode with charging port facing toward you
- Enable HUD mirror mode (single tap) for proper windshield reflection
- Optionally enable 180° rotation (double tap) if phone is upside-down
- Keep phone plugged in to charger while driving

## Features

### GPS Speed Tracking
- Uses device GPS for accurate speed measurement in MPH
- Updates display once per second for easy readability
- GPS data sampled continuously for accuracy
- Handles GPS unavailability gracefully

### Large, Readable Display
- Extra-large speed numbers (52.5vmin)
- White text on solid black background
- Optimized for both portrait and landscape orientations
- Responsive sizing that stays consistent when rotating device

### HUD Mirror Mode
- **Single tap** on the speed number toggles horizontal mirroring
- Creates proper windshield reflection for heads-up display
- Clean, distraction-free display when active

### Upside-Down Mode
- **Double tap** on the speed number rotates display 180°
- Perfect for portrait mode with charging port facing driver
- Can be combined with HUD mirror mode

### Screen Lock Prevention
- Dual approach to keep screen awake during use:
  - Modern Wake Lock API (iOS 16.4+, Android Chrome)
  - Silent audio loop fallback for older iOS versions
- Automatically restarts when app regains focus
- No manual intervention needed

### Progressive Web App (PWA)
- Install to homescreen for fullscreen experience
- Completely black screen with no browser chrome
- Supports notched devices with safe area padding
- Detects standalone mode and shows install hint in browser

### Zero Dependencies
- Pure vanilla HTML, CSS, and JavaScript
- No external libraries or frameworks
- No network requests after initial load
- Fast, lightweight, and privacy-friendly

## Installation

### iOS Safari
1. Open the speedometer page in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to confirm
5. Launch from homescreen icon for fullscreen experience

### Android Chrome
1. Open the speedometer page in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home screen"
4. Tap "Add" to confirm
5. Launch from homescreen icon for fullscreen experience

## Usage

1. **Start**: Tap the "Start" button and allow location access when prompted
2. **View Speed**: Large white numbers show your current speed in MPH
3. **Enable HUD**: Single tap the speed number to mirror for windshield reflection
4. **Rotate**: Double tap the speed number if using upside-down portrait mode
5. **Place on Dashboard**: Position phone so display reflects onto windshield

## Controls

- **Single tap speed display**: Toggle HUD mirror mode
- **Double tap speed display**: Toggle 180° rotation

## Technical Details

- **Update Frequency**: Display updates every 1 second, GPS sampled continuously
- **Speed Unit**: MPH (miles per hour)
- **GPS Accuracy**: Depends on device GPS quality and signal strength
- **Screen Size**: Optimized for iPhone 16, works on all modern smartphones
- **Zoom**: Disabled to maintain consistent sizing during orientation changes

## Browser Compatibility

- **iOS Safari**: Full support (iOS 11+)
- **Android Chrome**: Full support
- **Other browsers**: May work but not officially tested

## Privacy

- No data collection or tracking
- GPS data stays on your device
- No external network requests
- No analytics or cookies

## Safety Notice

**⚠️ Use responsibly and legally:**
- Ensure speedometer use is legal in your jurisdiction
- Do not interact with the app while driving
- Set up HUD mode before starting your journey
- Keep eyes on the road at all times
- Use as a supplement to, not replacement for, your vehicle's speedometer
