# Indoor Biking Web App — Handoff Document

## Purpose
This document is a handoff for a **new implementation session** to build a web-based indoor biking app. The app connects to a smart trainer over **Web Bluetooth**, controls resistance based on map grade, reads trainer telemetry (power/cadence/speed), and ingests **Zwift Play** controller button events (left/right/gear up/down).

## Goals (Must Have)
1. **Trainer control loop**: Automatically increase/decrease resistance based on map grade.
2. **Zwift Play input**: Read button presses (left/right/gear up/down) into the web app.
3. **Telemetry**: Read wattage, cadence, and speed/RPM from the trainer into the app UI.

## Scope (MVP)
- **Single-page web app** served from GitHub Pages / static hosting.
- **Web Bluetooth (BLE)** only (no native apps).
- **FTMS (Fitness Machine Service)** for trainer control and telemetry.
- **OpenStreetMap** map tiles (OpenLayers) for route + grade display.
- **Basic UI**: connection state, grade display, telemetry readout, control toggles.

## Out of Scope (for MVP)
- ANT+ support (requires native bridge).
- Multi-user accounts, data persistence, or backend services.
- Advanced workout modes (ERG, intervals) beyond grade-based resistance.
- Detailed route editing or full ride history.

---

## Key Technical Requirements

### 1) Trainer Control (BLE FTMS)
- **Service**: Fitness Machine Service (`0x1826`).
- **Characteristics** (typical):
  - **Fitness Machine Control Point** (`0x2AD9`) — write commands.
  - **Supported Resistance Range** (`0x2AD6`) — optional; use to clamp levels.
  - **Fitness Machine Status** (`0x2ADA`) — optional status notifications.
  - **Indoor Bike Data** (`0x2AD2`) — telemetry stream.

**Expected control opcodes** (FTMS standard):
- Set Target Resistance Level
- Set Target Power (optional fallback if resistance control is unavailable)

**Constraints**:
- Web Bluetooth requires **HTTPS** and **user gesture** for pairing.
- Some trainers require enabling “controllable” mode or no second controller connected.

### 2) Zwift Play Buttons (BLE)
- Zwift Play controllers are BLE devices. **Zwift does not publish a public spec.**
- You must **identify the GATT service + characteristic** that emits button notifications.
- Plan:
  1. Pair via Web Bluetooth.
  2. Subscribe to notification characteristic.
  3. Parse button press codes into events: `left`, `right`, `gear_up`, `gear_down`.

### 3) Map + Grade
- Use **OpenLayers** with OpenStreetMap tiles (already used elsewhere in this repo).
- Accept a **predefined route** (GPX/GeoJSON) or manually select a segment.
- Compute grade from consecutive elevation points: `grade% = (deltaElev / deltaDist) * 100`.

---

## Data Flow (High Level)
1. **User connects trainer** via Web Bluetooth.
2. **User connects Zwift Play** via Web Bluetooth.
3. App loads route and computes grade for the current position.
4. App sends resistance updates (1–2 Hz) based on grade.
5. App displays live telemetry from trainer.
6. Zwift Play buttons update app state (steering UI, gear display, map pan).

---

## Minimal UI Components
- **Connection Panel**:
  - Connect Trainer
  - Connect Zwift Play
  - Status indicators
- **Map Panel**:
  - Route preview (OpenLayers)
  - Current grade
- **Telemetry Panel**:
  - Power (W)
  - Cadence (RPM)
  - Speed (km/h or mph)
- **Controls Panel**:
  - Toggle auto-resistance
  - Gear display
  - Button event log

---

## Control Algorithm (MVP)

### Grade → Resistance Mapping
- Example mapping:
  - `resistance = clamp(base + grade * factor, min, max)`
- Use supported resistance range if provided by trainer.
- Apply **rate limiting** to avoid abrupt changes (e.g., max 1 level per second).

### Update Loop
- Run at **1–2 Hz**.
- Each tick:
  1. Get grade at current distance.
  2. Compute target resistance.
  3. Send control point command if auto mode is enabled.

---

## BLE Constraints & Notes
- Web Bluetooth does not allow background operation.
- Some trainers require exclusive control; disconnect Zwift or other apps.
- BLE reconnection logic should be robust:
  - Display disconnect reasons.
  - Allow reconnect without reload.

---

## Testing Strategy (Manual)
- **Trainer connection**: verify telemetry updates live.
- **Resistance changes**: verify trainer responds to grade changes.
- **Zwift Play**: verify each button generates events in UI.
- **Map grade**: validate grade computation on a short known route.

---

## Open Questions / Risks
1. **Zwift Play BLE spec**: is the notification data publicly documented?
2. **Trainer command support**: does target resistance or target power work across all devices?
3. **Grade smoothing**: how much filtering is needed to avoid jitter?
4. **Route source**: will MVP allow GPX upload or fixed route?

---

## Suggested Implementation Order
1. Build trainer BLE connection and telemetry display.
2. Implement route loading + grade calculation.
3. Add resistance control loop.
4. Pair Zwift Play and log button events.
5. Wire button events to UI actions.

---

## Reference Materials
- Bluetooth FTMS spec (Fitness Machine Service).
- OpenLayers docs + OSM tiles.
- Web Bluetooth API docs.

---

## Location for Implementation
This document is stored in:
- `biking/indoor-biking-app-handoff.md`

This repo already has map usage in `biking/activity-weather.html` which can be used as a template for OpenLayers setup.
