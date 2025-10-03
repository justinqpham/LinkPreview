# LinkPreview

![Version](https://img.shields.io/badge/version-1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Chrome](https://img.shields.io/badge/chrome-extension-orange.svg)

> Preview web links directly from your current tab with an elegant, customizable overlay

## Overview

LinkPreview is a lightweight Chrome extension that enhances your browsing experience by allowing you to preview the content of any link without leaving your current page. Simply hover over a link, and after a configurable delay, a resizable preview window appears, displaying the destination page in an iframe with a dimmed background overlay.

## Features

### Core Functionality
- **Instant Link Previews**: View webpage content without opening new tabs
- **Draggable & Resizable**: Full control over preview window position and size
- **Smart Positioning**: Preview window intelligently positions based on cursor location
- **Background Dimming**: Customizable overlay with blur effect for better focus

### Trigger Options
Choose how you want to activate link previews:
- **Long Hover** (default): Preview appears after hovering for a set duration
- **Hard Click**: Simple left-click on any link
- **Alt + Click**: Hold Alt key while clicking
- **Ctrl + Shift + Click**: Combined modifier keys
- **Hover + Space**: Hover while holding spacebar

### Customization Options
- **Timing Control**: Adjust hover delay from instant to several seconds
- **Visual Themes**: Light and dark theme support
- **Z-Index Control**: Manage layer priority for compatibility with other extensions
- **Overlay Settings**:
  - Adjustable opacity (0-1)
  - Configurable blur intensity (0-10px)
- **Behavior Settings**:
  - Link highlighting on hover
  - Close on outside click
  - Close on scroll
  - ESC key to dismiss

### Domain Management
- **Website Blacklist**: Disable previews for specific domains
- **Per-site Configuration**: Fine-grained control over where previews appear

### Additional Features
- **Context Menu Integration**: Right-click any link and select "Preview with LinkPreview"
- **Fallback Preview**: When iframe loading fails, displays metadata (title, description, image)
- **Error Handling**: Graceful degradation with informative error messages
- **Auto-save Settings**: Changes are automatically saved

## Installation

### From Chrome Web Store
*(Coming soon)*

### Manual Installation (Developer Mode)

1. **Clone or Download** this repository:
   ```bash
   git clone https://github.com/yourusername/LinkPreview.git
   ```

2. **Open Chrome Extensions Page**:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)

3. **Load the Extension**:
   - Click "Load unpacked"
   - Select the `LinkPreview` directory

4. **Verify Installation**:
   - The LinkPreview icon should appear in your extensions toolbar
   - Navigate to any webpage with links to test

## Usage

### Basic Usage

1. **Default Behavior** (Long Hover):
   - Hover your cursor over any link
   - Wait 1 second (default)
   - Preview window appears
   - Move cursor outside to dismiss

2. **Via Context Menu**:
   - Right-click any link
   - Select "Preview with LinkPreview"

3. **Interacting with Preview**:
   - **Drag**: Click and drag the dark header bar
   - **Resize**: Drag from any corner or edge
   - **Close**: Click × button, press ESC, or click outside
   - **Open Link**: If iframe fails to load, click "Open" button

### Configuring Settings

1. Click the extension icon in your toolbar
2. Select "Options" or right-click → "Options"
3. Configure your preferences:
   - **Triggers**: Choose your preferred activation method
   - **Timing**: Adjust hover delay
   - **Appearance**: Customize theme, overlay, and z-index
   - **Behavior**: Toggle features on/off
   - **Disabled Websites**: Add domains to exclude

Settings are automatically saved and applied immediately.

### Tips & Tricks

- **Quick Dismiss**: Press ESC or click anywhere outside the preview
- **Multiple Previews**: Close current preview before opening a new one
- **Domain Blocking**: Add frequently-opened domains to the blacklist
- **Performance**: Disable previews on heavy sites (YouTube, Twitter, etc.)
- **Positioning**: Preview appears on the opposite side of your cursor for convenience

## Configuration

### Default Settings

```javascript
{
  enabled: true,
  triggers: {
    selectedTrigger: 'longHover'
  },
  timing: {
    longHoverTimeMS: 1000
  },
  appearance: {
    theme: 'light',
    zIndex: 9999,
    overlayOpacity: 0.3,
    overlayBlur: 2
  },
  behavior: {
    highlighting: true,
    closeOnOutsideClick: true,
    closeOnScrollOver: true
  },
  disabled: {
    websites: []
  }
}
```

### Storage

Settings are stored locally using Chrome's `storage.local` API and persist across browser sessions.

## Architecture

### File Structure

```
LinkPreview/
├── manifest.json           # Extension configuration
├── background.js           # Service worker for fetching content
├── content-scripts/
│   └── content.js         # Main preview logic injected into pages
├── options.html           # Settings page UI
├── options.js             # Settings page logic
├── icon/
│   └── icon.png          # Extension icon
├── _locales/
│   └── en/
│       └── messages.json  # Internationalization strings
└── README.md             # This file
```

### Components

#### Content Script (`content-scripts/content.js`)
- **Purpose**: Handles all link interactions and preview rendering
- **Responsibilities**:
  - Event listeners for hover, click, keyboard input
  - Preview window creation and positioning
  - Drag and resize functionality
  - Settings synchronization

#### Background Script (`background.js`)
- **Purpose**: Service worker for content fetching and settings management
- **Responsibilities**:
  - Fetch webpage content via `fetch()` API
  - Extract metadata (title, description, Open Graph tags)
  - Store and retrieve settings
  - Handle context menu actions

#### Options Page (`options.html` + `options.js`)
- **Purpose**: User-facing settings interface
- **Responsibilities**:
  - Display current settings
  - Validate and save user preferences
  - Auto-save functionality
  - Reset to defaults

### Technologies Used

- **Manifest V3**: Modern Chrome extension architecture
- **Vanilla JavaScript**: Zero dependencies for maximum performance
- **Chrome Storage API**: Persistent settings storage
- **Chrome Runtime Messaging**: Communication between components
- **Declarative Net Request**: Content fetching with proper permissions
- **Context Menus API**: Right-click integration

## Permissions

This extension requires the following permissions:

- `declarativeNetRequest`: Fetch content from external URLs
- `storage`: Save user preferences
- `contextMenus`: Add right-click menu option
- `host_permissions: *://*/*`: Access all websites for link preview functionality

**Privacy Note**: LinkPreview does not collect, store, or transmit any user data. All settings are stored locally on your device.

## Browser Compatibility

- **Minimum Chrome Version**: 88+ (Manifest V3 support)
- **Tested On**:
  - Chrome 120+
  - Edge 120+ (Chromium-based)
  - Brave 1.60+

## Known Limitations

1. **X-Frame-Options**: Some websites (banks, secure portals) prevent iframe embedding for security
2. **CORS Restrictions**: Certain cross-origin resources may not load in previews
3. **Heavy Pages**: Resource-intensive sites may load slowly in preview
4. **Dynamic Content**: SPAs with heavy JavaScript may not render correctly immediately
5. **Authentication**: Previews won't show logged-in content (uses separate context)

## Troubleshooting

### Preview not appearing?
- Check if the extension is enabled
- Verify the domain isn't in your disabled list
- Try a different trigger method
- Check browser console for errors (`F12`)

### Preview window is blank?
- The site may block iframe embedding (check for fallback card)
- CORS or security policies may prevent loading
- Try opening the link directly

### Settings not saving?
- Ensure you have storage permissions
- Check Chrome's extension storage quota
- Try resetting to defaults

### Extension stopped working?
- Reload the extension: `chrome://extensions/` → Click reload icon
- Clear extension storage and reconfigure
- Reinstall the extension

## Development

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/yourusername/LinkPreview.git
cd LinkPreview

# No build process required - pure vanilla JS
# Load extension in Chrome as described in Installation
```

### Making Changes

1. Edit source files
2. Reload extension in `chrome://extensions/`
3. Test on various websites
4. Check console for errors

### Debugging

- **Content Script**: Open DevTools on any webpage (`F12`)
- **Background Script**: Click "Inspect views: service worker" in `chrome://extensions/`
- **Options Page**: Right-click options page → Inspect

### Code Style

- ES6+ JavaScript
- Async/await for asynchronous operations
- Descriptive variable and function names
- Inline documentation for complex logic
- Error handling with try/catch blocks

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Ways to Contribute

- Report bugs via [GitHub Issues](https://github.com/yourusername/LinkPreview/issues)
- Suggest features or enhancements
- Submit pull requests
- Improve documentation
- Share with others

## Roadmap

### Planned Features
- [ ] Keyboard shortcuts customization
- [ ] Multiple preview windows
- [ ] Preview history
- [ ] Bookmarking from preview
- [ ] Screenshot capture
- [ ] Dark mode improvements
- [ ] Preset configurations
- [ ] Import/export settings
- [ ] Analytics dashboard (privacy-focused)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and release notes.

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/LinkPreview/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/LinkPreview/discussions)
- **Email**: support@linkpreview.extension

## Acknowledgments

- Inspired by mobile link preview behavior
- Built with the Chrome Extensions community
- Thanks to all contributors and testers

## Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Website: [yourwebsite.com](https://yourwebsite.com)

---

**Made with ❤️ for the Chrome browsing experience**
