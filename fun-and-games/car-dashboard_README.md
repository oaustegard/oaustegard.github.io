# Car Dashboard

A passive heads-up display (HUD) for vehicles without traditional instrument clusters, like the Tesla Model 3 or Volvo EX30. Displays speed, heading, trip stats, and more using only GPS data—completely non-interactive while driving.

## Target Use Case

Modern EVs like the Tesla Model 3 and Volvo EX30 have moved the speedometer to a center touchscreen, eliminating the traditional instrument cluster behind the steering wheel. This app provides a phone-based HUD that can be placed on the dashboard or mounted in the driver's line of sight.

**Key principle**: Zero interaction required after initial start. All data updates passively.

## Features

### Primary Display
- **Speed**: Large, glanceable speed display (38vmin font)
- **Clock**: Current time in 12-hour format

### GPS-Derived Data
| Data | Source | Notes |
|------|--------|-------|
| Speed | `coords.speed` | Direct from GPS |
| Heading | `coords.heading` | Shown as cardinal + degrees (e.g., "NE 47°") |
| Altitude | `coords.altitude` | In feet or meters |
| Grade | Computed | Rise/run from altitude history |
| GPS Accuracy | `coords.accuracy` | Signal quality indicator |

### Trip Statistics (Computed)
| Stat | Calculation |
|------|-------------|
| Trip Distance | Sum of haversine distances between positions |
| Elapsed Time | Time since start |
| Average Speed | Distance / moving time (excludes stops) |
| Max Speed | Highest speed recorded |

### System Status
- **Phone Battery**: Level and charging status via Battery API
- **GPS Signal**: Accuracy indicator with color coding

## Settings

Long-press the clock to access settings:

- **Speed Unit**: MPH or KM/H
- **Altitude Unit**: Feet or Meters

Settings are applied immediately; close panel to return to dashboard.

## Technical Details

### Data Sources
All data comes from browser APIs—no external network requests after initial load:

| API | Data |
|-----|------|
| Geolocation API | Speed, heading, altitude, position, accuracy |
| Battery Status API | Battery level, charging state |
| Date | Clock display |

### Update Frequency
- GPS: Continuous (`watchPosition` with `maximumAge: 0`)
- Clock: Every 1 second
- Battery: Event-driven (on change)

### Grade Calculation
Grade percentage is computed from the last ~100m of travel:
```
grade = (altitude_change / distance_traveled) * 100
```
Requires GPS altitude support (not available on all devices).

### Distance Calculation
Uses the Haversine formula for accurate great-circle distance between GPS points. Filters out GPS jumps (>500m between readings).

### Moving Time vs Total Time
Average speed uses "moving time"—time spent above 1 m/s (~2 mph). This excludes time spent stopped at lights, etc.

## Installation

### iOS Safari
1. Open the dashboard page in Safari
2. Tap Share > Add to Home Screen
3. Launch from homescreen for fullscreen experience

### Android Chrome
1. Open the dashboard page in Chrome
2. Tap menu > Add to Home screen
3. Launch from homescreen for fullscreen experience

## Usage

1. **Mount phone** in a visible location (dash mount, vent mount, etc.)
2. **Open app** and tap "Start Dashboard"
3. **Grant location permission** when prompted
4. **Configure settings** (long-press clock) before driving
5. **Drive**—display updates automatically with no interaction needed

## Privacy

- All GPS data stays on device
- No external API calls
- No analytics or tracking
- No data stored after session ends

## Browser Compatibility

| Browser | Support |
|---------|---------|
| iOS Safari | Full (iOS 11+) |
| Android Chrome | Full |
| Desktop browsers | Works but not the target use case |

### API Support Notes
- **Battery API**: Not available in all browsers (gracefully hidden if unsupported)
- **GPS Altitude**: Device-dependent; some phones don't report altitude
- **Wake Lock API**: iOS 16.4+, Android Chrome; falls back to silent audio

## Limitations

- **GPS-only**: Speed comes from GPS, not vehicle OBD. May lag slightly or be less accurate at low speeds
- **Altitude accuracy**: Consumer GPS altitude is less accurate than horizontal position
- **Grade calculation**: Requires altitude support and sufficient travel distance
- **No vehicle data**: Cannot access actual vehicle speed, fuel level, etc. (browser sandbox)

## Safety Notice

- Set up the display before driving
- Do not interact with the app while driving
- Use as a supplement to, not replacement for, vehicle instruments
- Ensure phone is securely mounted
