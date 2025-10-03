# Contributing to LinkPreview

First off, thank you for considering contributing to LinkPreview! It's people like you that make LinkPreview such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

This project and everyone participating in it is governed by a simple principle: **Be respectful, be constructive, be collaborative.** By participating, you are expected to uphold this code.

### Our Standards

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

## Getting Started

### Prerequisites

- Google Chrome browser (version 88 or higher)
- Basic knowledge of JavaScript (ES6+)
- Familiarity with Chrome Extension APIs
- Git installed on your system

### Your First Contribution

Unsure where to begin? You can start by looking through these issues:

- **Beginner issues** - issues which should only require a few lines of code
- **Help wanted issues** - issues which might be a bit more involved

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find that you don't need to create one. When you are creating a bug report, please include as many details as possible.

**To submit a bug report:**

1. Use the GitHub issue tracker
2. Use the bug report template (if available)
3. Include a clear and descriptive title
4. Describe the exact steps to reproduce the problem
5. Provide specific examples to demonstrate the steps
6. Describe the behavior you observed and what you expected
7. Include screenshots if applicable
8. Include your Chrome version and OS

**Example Bug Report:**

```
**Title:** Preview window doesn't close on ESC key

**Description:**
When I press the ESC key while a preview window is open, it doesn't close as expected.

**Steps to Reproduce:**
1. Hover over any link on reddit.com
2. Wait for preview to appear
3. Press ESC key

**Expected Behavior:**
Preview window should close

**Actual Behavior:**
Nothing happens

**Environment:**
- Chrome Version: 120.0.6099.109
- OS: macOS 14.1
- Extension Version: 1.0
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- A clear and descriptive title
- A detailed description of the proposed functionality
- Explain why this enhancement would be useful
- List any alternative solutions or features you've considered
- Include mockups or examples if applicable

### Pull Requests

1. Fork the repository
2. Create a new branch from `main` (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
6. Push to the branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/LinkPreview.git
cd LinkPreview
```

### 2. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the cloned `LinkPreview` directory

### 3. Make Changes

Edit the source files:
- `content-scripts/content.js` - Main preview logic
- `background.js` - Service worker
- `options.html` / `options.js` - Settings page
- `manifest.json` - Extension configuration

### 4. Test Your Changes

1. After making changes, click the reload icon in `chrome://extensions/`
2. Test on various websites (news sites, blogs, social media, etc.)
3. Check browser console for errors (`F12`)
4. Test different trigger methods and settings
5. Verify responsive behavior (resize browser window)

### 5. Debug

- **Content Script Debugging**: Open DevTools on any webpage (`F12`)
- **Background Script Debugging**: In `chrome://extensions/`, click "Inspect views: service worker"
- **Options Page Debugging**: Right-click options page → Inspect

## Coding Standards

### JavaScript Style Guide

We follow modern ES6+ JavaScript conventions:

#### Variables and Constants

```javascript
// Use const by default, let when reassignment is needed
const DEFAULT_TIMEOUT = 1000;
let currentPreview = null;

// Use descriptive names
const isValidPreviewUrl = (url) => { /* ... */ };

// Avoid var
```

#### Functions

```javascript
// Use async/await for asynchronous code
async function fetchContent(url) {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// Arrow functions for callbacks
element.addEventListener('click', (e) => {
  handleClick(e);
});
```

#### Error Handling

```javascript
// Always handle errors gracefully
try {
  await riskyOperation();
} catch (error) {
  console.error('Operation failed:', error);
  showUserFriendlyError();
}
```

#### Comments

```javascript
// Use comments to explain "why", not "what"
// Good:
// Delay to prevent preview flicker on quick mouse movements
setTimeout(() => showPreview(), 100);

// Bad:
// Wait 100ms then show preview
setTimeout(() => showPreview(), 100);
```

#### Code Organization

```javascript
// Group related functionality in classes
class LinkPreview {
  constructor() {
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupEventListeners();
  }

  // Use descriptive method names
  handleMouseOver(event) { /* ... */ }
  createPreviewWindow(content) { /* ... */ }
}
```

### HTML/CSS Standards

- Use semantic HTML5 elements
- Keep inline styles minimal (use them only for dynamic values)
- Use consistent indentation (2 spaces)
- Add ARIA labels for accessibility

### Manifest.json

- Keep permissions minimal
- Document any new permissions in comments
- Follow Manifest V3 standards

### Commit Messages

Write clear, concise commit messages:

```
Good:
- "Fix preview window positioning on small screens"
- "Add support for custom keyboard shortcuts"
- "Refactor settings storage logic"

Bad:
- "fix bug"
- "update"
- "changes"
```

**Commit Message Format:**

```
<type>: <subject>

<body (optional)>

<footer (optional)>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Example:**

```
feat: Add keyboard shortcut customization

Users can now configure custom keyboard shortcuts for triggering
link previews in the extension settings.

Closes #42
```

## Pull Request Process

### Before Submitting

- [ ] Test your changes thoroughly
- [ ] Check for console errors
- [ ] Ensure code follows style guidelines
- [ ] Update documentation if needed
- [ ] Add comments for complex logic
- [ ] Verify no existing issues are duplicated

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots to demonstrate changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex areas
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tested on multiple websites
```

### Review Process

1. Maintainers will review your PR within 1-2 weeks
2. Address any requested changes
3. Once approved, a maintainer will merge your PR
4. Your contribution will be included in the next release

## Testing Guidelines

### Manual Testing Checklist

Test your changes on these scenarios:

- [ ] **Different websites**: News sites, blogs, e-commerce, social media
- [ ] **Different link types**: Text links, image links, button links
- [ ] **Edge cases**:
  - Very long URLs
  - Invalid URLs
  - Sites that block iframes
  - Slow-loading sites
  - Sites with heavy JavaScript
- [ ] **Trigger methods**: All configured trigger options
- [ ] **Browser actions**:
  - Scrolling while preview open
  - Resizing browser window
  - Multiple tabs
  - Incognito mode
- [ ] **Settings**:
  - All options work correctly
  - Settings persist after browser restart
  - Reset to defaults works

### Cross-Browser Testing

While primarily Chrome-focused, test on:
- Chrome (latest)
- Brave (latest)
- Edge (Chromium-based, latest)

## Documentation

When adding new features:

1. Update `README.md` with usage instructions
2. Add inline code comments
3. Update `CHANGELOG.md`
4. Update settings documentation if applicable

## Questions?

Feel free to:
- Open an issue for discussion
- Ask questions in pull requests
- Contact the maintainers

## Recognition

Contributors will be recognized in:
- `README.md` acknowledgments section
- Release notes
- GitHub contributors page

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

**Thank you for contributing to LinkPreview!** 🎉
