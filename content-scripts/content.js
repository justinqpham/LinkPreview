// LinkPreview - Content Script
// Minimal version with only link preview functionality

class LinkPreview {
  constructor() {
    this.settings = null;
    this.currentPreview = null;
    this.hoverTimeout = null;
    this.clickTimeout = null;
    this.isEnabled = true;
    this.currentOverlay = null;
    
    
    this.init();
  }

  async init() {
    console.log('LinkPreview initializing...');
    
    // Load settings
    await this.loadSettings();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
    });

    console.log('LinkPreview initialized');
  }

  async loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
      if (response && response.settings) {
        this.settings = response.settings;
        this.isEnabled = this.settings.enabled;
      } else {
        this.settings = this.getDefaultSettings();
        this.isEnabled = true;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Use default settings if extension context is invalidated
      this.settings = this.getDefaultSettings();
      this.isEnabled = true;
    }
  }

  getDefaultSettings() {
    return {
      enabled: true,
      triggers: {
        selectedTrigger: 'longHover'
      },
      timing: {
        longHoverTimeMS: 1000
      },
      appearance: {
        theme: 'light',
        zIndex: 9999
      },
      behavior: {
        highlighting: true,
        closeOnOutsideClick: true,
        closeOnScrollOver: true
      },
      disabled: {
        websites: []
      }
    };
  }

  handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'showPreview':
          this.showPreviewForUrl(request.url);
          break;
        case 'settingsUpdated':
          this.loadSettings();
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  setupEventListeners() {
    document.addEventListener('mouseover', (e) => this.handleMouseOver(e), true);
    document.addEventListener('mouseout', (e) => this.handleMouseOut(e), true);
    document.addEventListener('click', (e) => this.handleClick(e), true);
    document.addEventListener('keydown', (e) => this.handleKeyDown(e), true);
    document.addEventListener('keyup', (e) => this.handleKeyUp(e), true);
    document.addEventListener('scroll', () => this.handleScroll(), true);
    document.addEventListener('click', (e) => this.handleDocumentClick(e), true);
  }

  handleMouseOver(e) {
    if (!this.isEnabled || !this.settings) return;

    const link = this.findLinkElement(e.target);
    if (!link) return;

    const url = this.extractUrl(link);
    if (!url || !this.isValidPreviewUrl(url)) return;

    // Highlight link if enabled
    if (this.settings.behavior.highlighting) {
      link.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
    }

    // Handle hover triggers
    if (this.settings.triggers.selectedTrigger === 'longHover') {
      this.hoverTimeout = setTimeout(() => {
        this.showPreviewForUrl(url, e);
      }, this.settings.timing.longHoverTimeMS);
    }

    // Handle hover + space
    if (this.settings.triggers.hoverSpace && this.isSpacePressed) {
      this.showPreviewForUrl(url, e);
    }
  }

  handleMouseOut(e) {
    const link = this.findLinkElement(e.target);
    if (link && this.settings?.behavior.highlighting) {
      link.style.backgroundColor = '';
    }

    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }

    // Close on mouse leave if enabled
    if (this.currentPreview && this.settings?.behavior.closeOnMouseLeave) {
      this.hidePreview();
    }
  }

  handleClick(e) {
    if (!this.isEnabled || !this.settings) return;

    const link = this.findLinkElement(e.target);
    if (!link) return;

    const url = this.extractUrl(link);
    if (!url || !this.isValidPreviewUrl(url)) return;

    // Handle different click triggers
    const selectedTrigger = this.settings.triggers.selectedTrigger;

    // Hard click trigger (simple click)
    if (selectedTrigger === 'hardClick' && !e.altKey && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
      this.showPreviewForUrl(url, e);
      return;
    }

    if (selectedTrigger === 'altClick' && e.altKey) {
      e.preventDefault();
      this.showPreviewForUrl(url, e);
      return;
    }

    if (selectedTrigger === 'ctrlShiftClick' && e.ctrlKey && e.shiftKey) {
      e.preventDefault();
      this.showPreviewForUrl(url, e);
      return;
    }

    if (this.settings.triggers.longClick) {
      this.clickTimeout = setTimeout(() => {
        this.showPreviewForUrl(url, e);
      }, this.settings.timing.longClickTimeMS);
    }
  }

  handleKeyDown(e) {
    if (e.key === ' ') {
      this.isSpacePressed = true;
    }

    if (e.key === 'Escape' && this.currentPreview) {
      this.hidePreview();
    }
  }

  handleKeyUp(e) {
    if (e.key === ' ') {
      this.isSpacePressed = false;
    }
  }

  handleScroll() {
    if (this.currentPreview && this.settings?.behavior.closeOnScrollOver) {
      this.hidePreview();
    }
  }

  handleDocumentClick(e) {
    if (this.currentPreview && this.settings?.behavior.closeOnOutsideClick) {
      if (!this.currentPreview.contains(e.target)) {
        this.hidePreview();
      }
    }
  }

  findLinkElement(element) {
    let current = element;
    while (current && current !== document) {
      if (current.tagName === 'A' && current.href) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  extractUrl(link) {
    return link.href;
  }

  isValidPreviewUrl(url) {
    try {
      const urlObj = new URL(url);
      
      // Check if it's http or https
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }

      // Check if domain is disabled
      if (this.settings?.disabled.websites) {
        const hostname = urlObj.hostname;
        for (const disabled of this.settings.disabled.websites) {
          if (hostname.includes(disabled)) {
            return false;
          }
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  async showPreviewForUrl(url, event = null) {
    if (this.currentPreview) {
      this.hidePreview();
    }

    try {
      // Show overlay to dim the page
      this.showOverlay();
      
      // Show loading indicator
      this.showLoadingIndicator(event);

      // Check if extension context is still valid
      if (!chrome.runtime?.id) {
        console.log('Extension context invalidated, creating direct preview');
        this.hideLoadingIndicator();
        this.createDirectPreview(url, event);
        return;
      }

      // Fetch content
      const response = await chrome.runtime.sendMessage({
        action: 'fetchContent',
        url: url
      });

      this.hideLoadingIndicator();

      if (!response) {
        console.log('No response from background, creating direct preview');
        this.createDirectPreview(url, event);
        return;
      }

      if (response.error) {
        this.showError(response.error, event);
        return;
      }

      // Create and show preview
      this.createPreview(response, url, event);
    } catch (error) {
      this.hideLoadingIndicator();
      console.log('Extension context error, creating direct preview:', error.message);
      // Fallback to direct preview if background script is unavailable
      this.createDirectPreview(url, event);
    }
  }

  createDirectPreview(url, event = null) {
    // Create preview directly without background script
    const response = {
      success: true,
      contentType: 'text/html',
      metadata: {
        title: new URL(url).hostname,
        description: 'Preview',
        image: null,
        url: url
      }
    };
    this.createPreview(response, url, event);
  }

  showLoadingIndicator(event) {
    const loader = document.createElement('div');
    loader.id = 'linkpreview-loader';
    loader.innerHTML = `
      <div style="
        position: fixed;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 999999;
        pointer-events: none;
      ">
        Loading preview...
      </div>
    `;
    
    this.positionElement(loader.firstElementChild, event);
    document.body.appendChild(loader);
  }

  hideLoadingIndicator() {
    const loader = document.getElementById('linkpreview-loader');
    if (loader) {
      loader.remove();
    }
  }

  showError(message, event) {
    const error = document.createElement('div');
    error.id = 'linkpreview-error';
    error.innerHTML = `
      <div style="
        position: fixed;
        background: #dc3545;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 999999;
        max-width: 300px;
      ">
        Error: ${message}
      </div>
    `;
    
    this.positionElement(error.firstElementChild, event);
    document.body.appendChild(error);
    
    setTimeout(() => {
      error.remove();
    }, 3000);
  }

  createPreview(response, url, event) {
    const preview = document.createElement('div');
    preview.id = 'linkpreview-preview';
    
    // Calculate responsive dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const width = Math.floor(viewportWidth * 0.6);
    const height = Math.floor(viewportHeight * 0.8);
    
    preview.style.cssText = `
      position: fixed;
      background: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      width: ${width}px;
      height: ${height}px;
      z-index: ${this.settings?.appearance.zIndex || 999999};
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      resize: both;
      overflow: auto;
      min-width: 300px;
      min-height: 200px;
      max-width: 95vw;
      max-height: 95vh;
    `;

    if (response.contentType === 'text/html') {
      this.createHtmlPreview(preview, response, url);
    } else if (response.contentType === 'image') {
      this.createImagePreview(preview, response, url);
    } else {
      this.createGenericPreview(preview, response, url);
    }

    this.positionElement(preview, event);
    document.body.appendChild(preview);
    this.currentPreview = preview;
    this.makeDraggable(preview);
  }

  createHtmlPreview(preview, response, url) {
    // Create iframe to display the actual website content
    preview.innerHTML = `
      <div style="position: relative; width: 100%; height: 100%;">
        <div id="linkpreview-header" style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 30px;
          background: rgba(0,0,0,0.8);
          border-radius: 8px 8px 0 0;
          z-index: 10;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 12px;
          cursor: move;
        ">
          <div style="color: white; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${new URL(url).hostname}
          </div>
          <button id="linkpreview-close" style="
            background: transparent;
            color: white;
            border: none;
            font-size: 16px;
            cursor: pointer;
            padding: 2px 6px;
            line-height: 1;
            border-radius: 3px;
          ">×</button>
        </div>
        <iframe 
          id="linkpreview-iframe"
          src="${url}" 
          style="
            width: 100%;
            height: 100%;
            border: none;
            border-radius: 0 0 8px 8px;
            margin-top: 30px;
            position: absolute;
            top: 0;
            left: 0;
          "
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        ></iframe>
      </div>
    `;

    // Add event listeners
    preview.querySelector('#linkpreview-close').addEventListener('click', () => {
      this.hidePreview();
    });
    
    // Handle iframe load errors
    const iframe = preview.querySelector('#linkpreview-iframe');
    iframe.addEventListener('error', () => {
      this.createFallbackPreview(preview, response, url);
    });
  }

  makeDraggable(element) {
    const header = element.querySelector('#linkpreview-header');
    if (!header) return;

    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    header.addEventListener('mousedown', (e) => {
      if (e.target.id === 'linkpreview-close') return; // Don't drag when clicking close button
      
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      
      const rect = element.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      
      header.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      let newLeft = initialLeft + deltaX;
      let newTop = initialTop + deltaY;
      
      // Ensure window stays within viewport bounds
      const rect = element.getBoundingClientRect();
      const maxLeft = window.innerWidth - rect.width;
      const maxTop = window.innerHeight - rect.height;
      
      newLeft = Math.max(0, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));
      
      element.style.left = newLeft + 'px';
      element.style.top = newTop + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        header.style.cursor = 'move';
      }
    });
  }

  
  createFallbackPreview(preview, response, url) {
    const { metadata } = response;
    
    preview.innerHTML = `
      <div style="padding: 16px;">
        ${metadata.image ? `<img src="${metadata.image}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 4px; margin-bottom: 12px;" onerror="this.style.display='none'">` : ''}
        <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">${metadata.title || 'Untitled'}</h3>
        ${metadata.description ? `<p style="margin: 0 0 12px 0; font-size: 14px; color: #666; line-height: 1.4;">${metadata.description}</p>` : ''}
        <div style="font-size: 12px; color: #888; margin-bottom: 8px;">
          ${new URL(url).hostname}
        </div>
        <div style="font-size: 12px; color: #dc3545;">
          Preview not available - click to open
        </div>
        <div style="margin-top: 12px; display: flex; gap: 8px;">
          <button id="linkpreview-open" style="
            background: #007bff;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
          ">Open</button>
          <button id="linkpreview-close" style="
            background: #6c757d;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
          ">Close</button>
        </div>
      </div>
    `;

    // Add event listeners
    preview.querySelector('#linkpreview-open').addEventListener('click', () => {
      window.open(url, '_blank');
      this.hidePreview();
    });

    preview.querySelector('#linkpreview-close').addEventListener('click', () => {
      this.hidePreview();
    });
  }

  createImagePreview(preview, response, url) {
    preview.innerHTML = `
      <div style="padding: 8px;">
        <img src="${response.url}" style="max-width: 100%; max-height: 500px; border-radius: 4px;">
        <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: #888;">${new URL(url).hostname}</span>
          <button id="linkpreview-close" style="
            background: #6c757d;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
          ">Close</button>
        </div>
      </div>
    `;

    preview.querySelector('#linkpreview-close').addEventListener('click', () => {
      this.hidePreview();
    });
  }

  createGenericPreview(preview, response, url) {
    preview.innerHTML = `
      <div style="padding: 16px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">Link Preview</h3>
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #666;">${response.type || 'Unknown content type'}</p>
        <div style="font-size: 12px; color: #888; margin-bottom: 12px;">
          ${new URL(url).hostname}
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="linkpreview-open" style="
            background: #007bff;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
          ">Open</button>
          <button id="linkpreview-close" style="
            background: #6c757d;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
          ">Close</button>
        </div>
      </div>
    `;

    preview.querySelector('#linkpreview-open').addEventListener('click', () => {
      window.open(url, '_blank');
      this.hidePreview();
    });

    preview.querySelector('#linkpreview-close').addEventListener('click', () => {
      this.hidePreview();
    });
  }

  positionElement(element, event) {
    const rect = element.getBoundingClientRect();
    let x, y;

    // Y position: Always at 10% of viewport height (viewport height - 90%)
    y = window.innerHeight * 0.1 - rect.height;

    if (event) {
      // X position based on cursor location
      const viewportCenter = window.innerWidth / 2;
      const tenPercentWidth = window.innerWidth * 0.1; // 10% margin from edge
      
      if (event.clientX <= viewportCenter) {
        // Cursor on left half - position window 90% from left edge (90% from right edge)
        x = window.innerWidth * 0.1 - rect.width;
      } else {
        // Cursor on right half - position window 10% from left edge
        x = tenPercentWidth;
      }
    } else {
      // Center the element horizontally if no event
      x = (window.innerWidth - rect.width) / 2;
    }

    // Ensure element stays within viewport bounds with minimum margins
    const maxLeft = window.innerWidth - rect.width - 10;
    const maxTop = window.innerHeight - rect.height - 10;
    
    x = Math.max(10, Math.min(x, maxLeft));
    y = Math.max(10, Math.min(y, maxTop));

    element.style.left = x + 'px';
    element.style.top = y + 'px';
    element.style.transform = 'none'; // Remove any centering transform
  }

  hidePreview() {
    if (this.currentPreview) {
      this.currentPreview.remove();
      this.currentPreview = null;
    }
    this.hideOverlay();
  }

  showOverlay() {
    // Remove existing overlay if any
    this.hideOverlay();
    
    const overlay = document.createElement('div');
    overlay.id = 'linkpreview-overlay';
    
    // Get overlay settings
    const overlayOpacity = this.settings?.appearance?.overlayOpacity || 0.3;
    const overlayBlur = this.settings?.appearance?.overlayBlur || 2;
    
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, ${overlayOpacity});
      backdrop-filter: blur(${overlayBlur}px);
      -webkit-backdrop-filter: blur(${overlayBlur}px);
      z-index: ${(this.settings?.appearance?.zIndex || 999999) - 1};
      pointer-events: none;
    `;
    
    document.body.appendChild(overlay);
    this.currentOverlay = overlay;
  }

  hideOverlay() {
    if (this.currentOverlay) {
      this.currentOverlay.remove();
      this.currentOverlay = null;
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new LinkPreview();
  });
} else {
  new LinkPreview();
}