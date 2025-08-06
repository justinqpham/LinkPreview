console.log('External options.js loaded!');

// Options page functionality
class LinkPreviewOptions {
  constructor() {
    console.log('LinkPreviewOptions constructor called');
    this.settings = null;
    this.hasUnsavedChanges = false;
    this.autoSaveTimeout = null;
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupEventListeners();
    this.updateUI();
  }

  async loadSettings() {
    try {
      console.log('Options: Requesting settings from background');
      const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
      console.log('Options: Received response:', response);
      this.settings = response.settings || this.getDefaultSettings();
      console.log('Options: Final settings:', this.settings);
    } catch (error) {
      console.error('Error loading settings:', error);
      this.settings = this.getDefaultSettings();
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
  }

  setupEventListeners() {
    // Save button
    document.getElementById('saveSettings').addEventListener('click', () => {
      console.log('Save button clicked!');
      this.saveSettings();
    });

    // Reset button
    document.getElementById('resetSettings').addEventListener('click', () => {
      this.resetSettings();
    });

    // Auto-save on focus loss from the entire page
    window.addEventListener('blur', () => {
      if (this.hasUnsavedChanges) {
        console.log('Window lost focus with unsaved changes, auto-saving...');
        this.saveSettings();
      }
    });

    // Setup change detection for all form elements
    this.setupAutoSave();

    // Range inputs
    const longHoverRange = document.getElementById('longHoverTime');
    longHoverRange.addEventListener('input', (e) => {
      document.getElementById('longHoverTimeValue').textContent = e.target.value + 'ms';
    });

    const zIndexRange = document.getElementById('zIndex');
    zIndexRange.addEventListener('input', (e) => {
      document.getElementById('zIndexValue').textContent = e.target.value;
    });

    const overlayOpacityRange = document.getElementById('overlayOpacity');
    overlayOpacityRange.addEventListener('input', (e) => {
      document.getElementById('overlayOpacityValue').textContent = e.target.value;
    });

    const overlayBlurRange = document.getElementById('overlayBlur');
    overlayBlurRange.addEventListener('input', (e) => {
      document.getElementById('overlayBlurValue').textContent = e.target.value + 'px';
    });
  }

  setupAutoSave() {
    // Get all form elements that can be changed
    const formElements = document.querySelectorAll('input, select, textarea');
    
    formElements.forEach(element => {
      // Add change listeners for all form elements
      const eventType = element.type === 'range' ? 'input' : 'change';
      element.addEventListener(eventType, () => {
        this.markAsChanged();
      });

      // Also listen for blur events on text inputs and textarea
      if (element.tagName === 'TEXTAREA' || element.type === 'text') {
        element.addEventListener('blur', () => {
          if (this.hasUnsavedChanges) {
            this.triggerAutoSave();
          }
        });
      }
    });
  }

  markAsChanged() {
    this.hasUnsavedChanges = true;
    console.log('Settings changed, will auto-save soon...');
    
    // Clear existing timeout
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
    
    // Set new timeout for auto-save (2 seconds after last change)
    this.autoSaveTimeout = setTimeout(() => {
      if (this.hasUnsavedChanges) {
        console.log('Auto-saving due to timeout...');
        this.saveSettings();
      }
    }, 2000);
  }

  triggerAutoSave() {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
    console.log('Triggering immediate auto-save...');
    this.saveSettings();
  }

  updateUI() {
    // Triggers - set the selected radio button
    const selectedTrigger = this.settings.triggers.selectedTrigger || 'longHover';
    document.getElementById(selectedTrigger).checked = true;

    // Timing
    const longHoverTime = this.settings.timing.longHoverTimeMS;
    document.getElementById('longHoverTime').value = longHoverTime;
    document.getElementById('longHoverTimeValue').textContent = longHoverTime + 'ms';

    // Appearance
    document.getElementById('theme').value = this.settings.appearance.theme;
    const zIndex = this.settings.appearance.zIndex;
    document.getElementById('zIndex').value = zIndex;
    document.getElementById('zIndexValue').textContent = zIndex;

    const overlayOpacity = this.settings.appearance.overlayOpacity;
    document.getElementById('overlayOpacity').value = overlayOpacity;
    document.getElementById('overlayOpacityValue').textContent = overlayOpacity;

    const overlayBlur = this.settings.appearance.overlayBlur;
    document.getElementById('overlayBlur').value = overlayBlur;
    document.getElementById('overlayBlurValue').textContent = overlayBlur + 'px';

    // Behavior
    document.getElementById('highlighting').checked = this.settings.behavior.highlighting;
    document.getElementById('closeOnOutsideClick').checked = this.settings.behavior.closeOnOutsideClick;
    document.getElementById('closeOnScrollOver').checked = this.settings.behavior.closeOnScrollOver;

    // Disabled websites
    document.getElementById('disabledWebsites').value = this.settings.disabled.websites.join('\n');
  }

  async saveSettings() {
    try {
      console.log('Options: Starting save process');
      
      // Collect settings from UI
      const selectedTrigger = document.querySelector('input[name="trigger"]:checked')?.value || 'longHover';
      const newSettings = {
        ...this.settings,
        triggers: {
          selectedTrigger: selectedTrigger
        },
        timing: {
          longHoverTimeMS: parseInt(document.getElementById('longHoverTime').value)
        },
        appearance: {
          theme: document.getElementById('theme').value,
          zIndex: parseInt(document.getElementById('zIndex').value),
          overlayOpacity: parseFloat(document.getElementById('overlayOpacity').value),
          overlayBlur: parseInt(document.getElementById('overlayBlur').value)
        },
        behavior: {
          highlighting: document.getElementById('highlighting').checked,
          closeOnOutsideClick: document.getElementById('closeOnOutsideClick').checked,
          closeOnScrollOver: document.getElementById('closeOnScrollOver').checked
        },
        disabled: {
          websites: document.getElementById('disabledWebsites').value
            .split('\n')
            .map(site => site.trim())
            .filter(site => site.length > 0)
        }
      };

      console.log('Options: Sending settings to background:', newSettings);

      // Save to storage
      const response = await chrome.runtime.sendMessage({
        action: 'updateSettings',
        settings: newSettings
      });

      console.log('Options: Received save response:', response);

      if (response && response.success) {
        this.settings = newSettings;
        this.hasUnsavedChanges = false;
        this.showStatusMessage('Settings saved successfully!', 'success');
        // Close the options page after a brief delay
        setTimeout(() => {
          window.close();
        }, 1000);
      } else {
        this.showStatusMessage('Error saving settings: ' + (response?.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Options: Save error:', error);
      this.showStatusMessage('Error saving settings: ' + error.message, 'error');
    }
  }

  async resetSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      this.settings = this.getDefaultSettings();
      this.updateUI();
      await this.saveSettings();
      this.showStatusMessage('Settings reset to defaults!', 'success');
    }
  }


  showStatusMessage(message, type) {
    const statusElement = document.getElementById('status-message');
    statusElement.textContent = message;
    statusElement.className = `status-message status-${type}`;
    statusElement.style.display = 'block';

    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 3000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing options...');
  new LinkPreviewOptions();
});