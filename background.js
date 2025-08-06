// LinkPreview - Background Script
// Minimal version with only link preview functionality

const DEFAULT_SETTINGS = {
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
};

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('LinkPreview installed');
  initializeSettings();
});

// Initialize settings with defaults
async function initializeSettings() {
  try {
    const result = await chrome.storage.local.get(['linkpreview_settings']);
    if (!result.linkpreview_settings) {
      await chrome.storage.local.set({ linkpreview_settings: DEFAULT_SETTINGS });
    }
  } catch (error) {
    console.error('Error initializing settings:', error);
  }
}

// Handle messages from content script and options page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request.action, request);
  
  switch (request.action) {
    case 'getSettings':
      console.log('Handling getSettings');
      handleGetSettings(sendResponse);
      return true;
      
    case 'updateSettings':
      console.log('Handling updateSettings with:', request.settings);
      handleUpdateSettings(request.settings, sendResponse);
      return true;
      
    case 'fetchContent':
      handleFetchContent(request.url, sendResponse);
      return true;
      
    case 'openOptionsPage':
      chrome.runtime.openOptionsPage();
      sendResponse({ success: true });
      return true;
      
    default:
      console.log('Unknown action:', request.action);
      sendResponse({ error: 'Unknown action' });
      return false;
  }
});

// Get current settings
function handleGetSettings(sendResponse) {
  console.log('Getting settings from storage');
  chrome.storage.local.get(['linkpreview_settings'])
    .then(result => {
      console.log('Storage result:', result);
      const settings = result.linkpreview_settings || DEFAULT_SETTINGS;
      console.log('Sending settings:', settings);
      sendResponse({ settings });
    })
    .catch(error => {
      console.error('Error getting settings:', error);
      sendResponse({ error: error.message });
    });
}

// Update settings
function handleUpdateSettings(newSettings, sendResponse) {
  console.log('Updating settings in storage:', newSettings);
  chrome.storage.local.set({ linkpreview_settings: newSettings })
    .then(() => {
      console.log('Settings saved successfully');
      sendResponse({ success: true });
    })
    .catch(error => {
      console.error('Error updating settings:', error);
      sendResponse({ error: error.message });
    });
}

// Fetch content for preview
async function handleFetchContent(url, sendResponse) {
  try {
    // Basic URL validation
    if (!isValidUrl(url)) {
      sendResponse({ error: 'Invalid URL' });
      return;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'LinkPreview'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('text/html')) {
      const html = await response.text();
      const metadata = extractMetadata(html);
      sendResponse({ 
        success: true, 
        content: html,
        metadata,
        contentType: 'text/html'
      });
    } else if (contentType.startsWith('image/')) {
      sendResponse({
        success: true,
        contentType: 'image',
        url: url
      });
    } else {
      sendResponse({
        success: true,
        contentType: 'other',
        type: contentType
      });
    }
  } catch (error) {
    console.error('Error fetching content:', error);
    sendResponse({ error: error.message });
  }
}

// Validate URL
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Extract metadata from HTML
function extractMetadata(html) {
  const metadata = {
    title: '',
    description: '',
    image: '',
    url: ''
  };
  
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    metadata.title = titleMatch[1].trim();
  }
  
  // Extract meta tags
  const metaMatches = html.matchAll(/<meta[^>]*>/gi);
  for (const match of metaMatches) {
    const metaTag = match[0];
    
    // Open Graph title
    if (metaTag.includes('property="og:title"') || metaTag.includes("property='og:title'")) {
      const contentMatch = metaTag.match(/content=["']([^"']+)["']/i);
      if (contentMatch) metadata.title = contentMatch[1];
    }
    
    // Open Graph description
    if (metaTag.includes('property="og:description"') || metaTag.includes("property='og:description'")) {
      const contentMatch = metaTag.match(/content=["']([^"']+)["']/i);
      if (contentMatch) metadata.description = contentMatch[1];
    }
    
    // Meta description
    if (metaTag.includes('name="description"') || metaTag.includes("name='description'")) {
      const contentMatch = metaTag.match(/content=["']([^"']+)["']/i);
      if (contentMatch && !metadata.description) metadata.description = contentMatch[1];
    }
    
    // Open Graph image
    if (metaTag.includes('property="og:image"') || metaTag.includes("property='og:image'")) {
      const contentMatch = metaTag.match(/content=["']([^"']+)["']/i);
      if (contentMatch) metadata.image = contentMatch[1];
    }
    
    // Open Graph URL
    if (metaTag.includes('property="og:url"') || metaTag.includes("property='og:url'")) {
      const contentMatch = metaTag.match(/content=["']([^"']+)["']/i);
      if (contentMatch) metadata.url = contentMatch[1];
    }
  }
  
  return metadata;
}

// Context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'linkpreview-preview',
    title: 'Preview with LinkPreview',
    contexts: ['link']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'linkpreview-preview' && info.linkUrl) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'showPreview',
      url: info.linkUrl
    });
  }
});