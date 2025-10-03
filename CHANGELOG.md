# Changelog

All notable changes to the LinkPreview extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-03

### Added
- Initial release of LinkPreview extension
- Link preview functionality with iframe display
- Multiple trigger options:
  - Long hover (configurable delay)
  - Hard click
  - Alt + Click
  - Ctrl + Shift + Click
  - Hover + Space
- Draggable preview windows
- Resizable preview windows
- Customizable overlay with adjustable opacity and blur
- Smart preview positioning based on cursor location
- Settings page with comprehensive options:
  - Trigger method selection
  - Timing adjustments
  - Appearance customization (theme, z-index)
  - Behavior toggles (highlighting, auto-close options)
  - Website blacklist management
- Auto-save functionality for settings
- Context menu integration ("Preview with LinkPreview")
- Link highlighting on hover
- Multiple close methods:
  - ESC key
  - Click outside preview
  - Close button
  - Scroll away (optional)
- Fallback preview mode for sites that block iframes
- Metadata extraction (title, description, Open Graph tags)
- Error handling with user-friendly messages
- Loading indicator during content fetch
- Background dimming overlay
- Support for light and dark themes
- Internationalization support (English)

### Features
- Zero dependencies - pure vanilla JavaScript
- Manifest V3 compliant
- Privacy-focused - no data collection
- Lightweight and performant
- Works on all websites (with configurable exceptions)
- Responsive design for various screen sizes

### Technical
- Content script injection on all URLs
- Service worker for background tasks
- Chrome Storage API for settings persistence
- Declarative Net Request for content fetching
- Context Menus API integration
- Runtime messaging between components

## [Unreleased]

### Planned
- Keyboard shortcut customization
- Multiple simultaneous preview windows
- Preview history tracking
- Bookmark from preview functionality
- Screenshot capture from preview
- Enhanced dark mode
- Preset configuration templates
- Import/export settings
- Privacy-focused analytics dashboard
- Browser action popup interface
- Preview window animations
- Custom CSS injection support
- Whitelist mode (only show on specific domains)

---

## Release Notes

### Version 1.0.0

This is the initial public release of LinkPreview. The extension provides a complete link preview experience with the following highlights:

**Core Experience:**
- Hover over any link to see a preview of the destination
- Fully draggable and resizable preview windows
- Elegant overlay with customizable dimming and blur

**Customization:**
- Choose from 5 different trigger methods
- Adjust timing, appearance, and behavior to your preferences
- Disable previews on specific websites

**Quality of Life:**
- Auto-saving settings
- Multiple ways to close previews
- Graceful fallback for sites that block embedding
- Context menu integration for quick access

**Privacy & Performance:**
- No telemetry or data collection
- Minimal resource footprint
- Local-only settings storage

We're excited to bring this tool to the Chrome community and look forward to your feedback!

---

## Versioning Guidelines

- **MAJOR** version when making incompatible API changes
- **MINOR** version when adding functionality in a backwards compatible manner
- **PATCH** version when making backwards compatible bug fixes

## Links

- [Repository](https://github.com/yourusername/LinkPreview)
- [Issues](https://github.com/yourusername/LinkPreview/issues)
- [Discussions](https://github.com/yourusername/LinkPreview/discussions)

[1.0.0]: https://github.com/yourusername/LinkPreview/releases/tag/v1.0.0
[Unreleased]: https://github.com/yourusername/LinkPreview/compare/v1.0.0...HEAD
