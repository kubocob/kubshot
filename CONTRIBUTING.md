# Contributing to Kubshot

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/kubocob/kubshot.git
   cd kubshot
   ```
3. Load the extension in Chrome:
   - Navigate to `chrome://extensions`
   - Enable Developer mode
   - Click "Load unpacked" and select the `src` folder

## Development Workflow

1. Create a branch for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes in the `src/` directory

3. Test the extension manually by reloading it in `chrome://extensions`

4. Commit your changes with a clear message:
   ```bash
   git commit -m "Add: description of your change"
   ```

5. Push to your fork and create a Pull Request

## Project Structure

- `src/manifest.json` - Extension manifest (MV3)
- `src/background.js` - Service worker for screenshot capture
- `src/content.js` - Content script that renders the device overlay
- `src/content.css` - Styles for the content script
- `src/panel.html` - Side panel UI markup
- `src/panel.js` - Side panel logic and settings management
- `src/panel.css` - Side panel styles (supports light/dark themes)
- `src/devices.js` - Device preset definitions

## Adding New Devices

To add a new device preset, edit `src/devices.js`:

```javascript
{
  id: 'device-id',         // Unique identifier
  name: 'Device Name',     // Display name in dropdown
  width: 390,              // Screen width in pixels
  height: 844,             // Screen height in pixels
  pixelRatio: 3,           // Device pixel ratio
  hasNotch: true           // Whether to show notch cutout
}
```

The device frame (bezel) is rendered programmatically in `content.js` using CSS - no external SVG files are needed.

## Key Files to Know

### `panel.js`
- Manages all UI controls and settings
- Communicates with content script via Chrome messaging
- Handles screenshot capture and gallery management

### `content.js`
- Creates the device overlay on the page
- Renders device frame, system bar, and browser bar
- Applies tilt transforms and background effects

### `background.js`
- Service worker that handles `chrome.tabs.captureVisibleTab()`
- Required for screenshot functionality

## Issues

- Check existing issues before creating a new one
- Use clear, descriptive titles
- Include steps to reproduce for bugs
- Include Chrome version and OS

## Pull Request Guidelines

- Keep PRs focused on a single change
- Update documentation if needed
- Test your changes thoroughly
- Reference related issues in the PR description
