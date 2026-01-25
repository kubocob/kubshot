const panelPort = chrome.runtime.connect({ name: 'panel' });

document.addEventListener('DOMContentLoaded', () => {
  const togglePreview = document.getElementById('toggle-preview');
  const previewControls = document.getElementById('preview-controls');
  const deviceSelect = document.getElementById('device-select');
  const customWidthInput = document.getElementById('custom-width');
  const customHeightInput = document.getElementById('custom-height');
  const customDimensionsSection = document.getElementById('custom-dimensions-section');
  const orientationPortrait = document.getElementById('orientation-portrait');
  const orientationLandscape = document.getElementById('orientation-landscape');
  const deviceStyleSelect = document.getElementById('device-style-select');
  const backgroundModeSelect = document.getElementById('background-mode');
  const colorOptions = document.getElementById('color-options');
  const pageBehindOptions = document.getElementById('page-behind-options');
  const pageBehindColor = document.getElementById('page-behind-color');
  const pageBehindTransparency = document.getElementById('page-behind-transparency');
  const transparencyValue = document.getElementById('transparency-value');
  const colorGrid = document.getElementById('color-grid');
  const customColor = document.getElementById('custom-color');
  const tiltSelect = document.getElementById('tilt-select');
  const customTiltOptions = document.getElementById('custom-tilt-options');
  const tiltX = document.getElementById('tilt-x');
  const tiltY = document.getElementById('tilt-y');
  const tiltZ = document.getElementById('tilt-z');
  const tiltPerspective = document.getElementById('tilt-perspective');
  const tiltXValue = document.getElementById('tilt-x-value');
  const tiltYValue = document.getElementById('tilt-y-value');
  const tiltZValue = document.getElementById('tilt-z-value');
  const tiltPerspectiveValue = document.getElementById('tilt-perspective-value');
  const btnCapture = document.getElementById('btn-capture');
  const tiltWarning = document.getElementById('tilt-warning');
  
  const frameModeSelect = document.getElementById('frame-mode');
  const frameThemeOptions = document.getElementById('frame-theme-options');
  const frameTheme = document.getElementById('frame-theme');
  const frameCustomColorRow = document.getElementById('frame-custom-color-row');
  const frameCustomColor = document.getElementById('frame-custom-color');
  const systemOptions = document.getElementById('system-options');
  const browserOptions = document.getElementById('browser-options');
  
  const systemTime = document.getElementById('system-time');
  const systemBattery = document.getElementById('system-battery');
  const batteryValue = document.getElementById('battery-value');
  const systemWifi = document.getElementById('system-wifi');
  const systemSignal = document.getElementById('system-signal');
  
  const browserPosition = document.getElementById('browser-position');
  const browserUrlInput = document.getElementById('browser-url');
  const browserShowControls = document.getElementById('browser-show-controls');

  let screenshots = [];
  let settings = loadSettings();

  async function loadScreenshots() {
    try {
      const result = await chrome.storage.local.get('screenshots');
      if (result.screenshots && Array.isArray(result.screenshots)) {
        screenshots = result.screenshots;
        renderGallery();
      }
    } catch (err) {
      console.error('Failed to load screenshots:', err);
    }
  }

  async function saveScreenshots() {
    try {
      await chrome.storage.local.set({ screenshots });
    } catch (err) {
      console.error('Failed to save screenshots:', err);
    }
  }

  const COLORS = [
    '#ffffff', '#f5f5f5', '#e0e0e0', '#9e9e9e', '#616161', '#424242', '#212121', '#000000',
    '#ffcdd2', '#f8bbd9', '#e1bee7', '#d1c4e9', '#c5cae9', '#bbdefb', '#b3e5fc', '#b2ebf2',
    '#b2dfdb', '#c8e6c9', '#dcedc8', '#f0f4c3', '#fff9c4', '#ffecb3', '#ffe0b2', '#ffccbc',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #2c3e50 0%, #bdc3c7 100%)'
  ];

  const TILTS = {
    'none': { x: 0, y: 0, z: 0, perspective: 1000 },
    'left': { x: 0, y: -15, z: 0, perspective: 1000 },
    'right': { x: 0, y: 15, z: 0, perspective: 1000 },
    'perspective': { x: 5, y: -5, z: 0, perspective: 1000 }
  };

  function loadSettings() {
    try {
      const saved = localStorage.getItem('kubshotSettings');
      return saved ? JSON.parse(saved) : getDefaultSettings();
    } catch {
      return getDefaultSettings();
    }
  }

  function getDefaultSettings() {
    return {
      device: 'phone-medium',
      customWidth: 390,
      customHeight: 844,
      deviceStyle: 'modern-notch',
      orientation: 'portrait',
      backgroundMode: 'transparent',
      backgroundColor: '#212121',
      pageBehindColor: 'dark',
      pageBehindTransparency: 50,
      tiltPreset: 'none',
      customTilt: { x: 0, y: 0, z: 0, perspective: 1000 },
      frameMode: 'all',
      frameTheme: 'page',
      frameCustomColor: '#ffffff',
      systemTime: '',
      systemBattery: 100,
      systemWifi: true,
      systemSignal: true,
      browserPosition: 'top',
      browserUrl: '',
      browserShowControls: true
    };
  }

  function saveSettings() {
    localStorage.setItem('kubshotSettings', JSON.stringify(settings));
  }

  function populateDeviceSelect() {
    deviceSelect.innerHTML = '';
    
    if (window.devices && Array.isArray(window.devices)) {
      window.devices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.id;
        
        // Format: "Name (WxH)" for regular devices, just "Custom" for custom
        if (device.isCustom) {
          option.textContent = device.name;
        } else {
          option.textContent = `${device.name} (${device.width}×${device.height})`;
        }
        
        deviceSelect.appendChild(option);
      });
    }
  }

  function populateDeviceStyleSelect() {
    deviceStyleSelect.innerHTML = '';
    
    if (window.deviceStyles && Array.isArray(window.deviceStyles)) {
      // Group styles by category
      const categories = window.getDeviceStylesByCategory();
      const categoryLabels = {
        'modern': 'Modern',
        'classic': 'Classic',
        'minimal': 'Minimal'
      };
      
      Object.entries(categories).forEach(([categoryId, styles]) => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = categoryLabels[categoryId] || categoryId;
        
        styles.forEach(style => {
          const option = document.createElement('option');
          option.value = style.id;
          option.textContent = `${style.name}`;
          option.title = style.description;
          optgroup.appendChild(option);
        });
        
        deviceStyleSelect.appendChild(optgroup);
      });
    }
  }

  let currentTabId = null;
  let panelPort = null;

  // Connect to background script to track panel lifecycle
  function connectToBackground() {
    panelPort = chrome.runtime.connect({ name: 'panel' });
    panelPort.onDisconnect.addListener(() => {
      panelPort = null;
    });
  }
  connectToBackground();

  async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  async function sendToContent(message) {
    const tab = await getActiveTab();
    if (!tab?.id) {
      console.error('No active tab found');
      return;
    }
    
    // Ensure content script is injected
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    } catch (e) {
      // Script might already be injected or page doesn't allow it
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      return await chrome.tabs.sendMessage(tab.id, message);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }

  async function checkContentScriptState() {
    const tab = await getActiveTab();
    if (!tab?.id) return { enabled: false };
    
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_STATE' });
      return response || { enabled: false };
    } catch {
      return { enabled: false };
    }
  }

  async function syncWithCurrentTab() {
    const tab = await getActiveTab();
    if (!tab?.id) return;
    
    const previousTabId = currentTabId;
    
    // If we switched to a different tab
    if (previousTabId !== tab.id) {
      // Cleanup the previous tab if preview was enabled
      if (previousTabId && togglePreview.checked) {
        try {
          await chrome.tabs.sendMessage(previousTabId, { type: 'CLEANUP' });
        } catch (e) {
          // Previous tab might be closed
        }
      }
      
      currentTabId = tab.id;
      
      // Notify background of current tab
      if (panelPort) {
        panelPort.postMessage({ type: 'SET_TAB_ID', tabId: tab.id });
      }
      
      // Check if new tab already has the extension enabled
      const state = await checkContentScriptState();
      
      if (togglePreview.checked && !state.enabled) {
        // Enable preview on new tab
        await sendToContent({ type: 'TOGGLE_PREVIEW', enabled: true });
        await applyAllSettings();
      } else if (!togglePreview.checked && state.enabled) {
        // Disable preview on new tab (cleanup orphaned state)
        await sendToContent({ type: 'CLEANUP' });
      }
    }
  }

  // Poll for tab changes (works without tabs permission for events)
  let tabCheckInterval = null;
  
  function startTabMonitoring() {
    if (tabCheckInterval) return;
    tabCheckInterval = setInterval(async () => {
      await syncWithCurrentTab();
    }, 500);
  }
  
  function stopTabMonitoring() {
    if (tabCheckInterval) {
      clearInterval(tabCheckInterval);
      tabCheckInterval = null;
    }
  }

  // Start monitoring when panel opens
  startTabMonitoring();

  // Also sync on visibility change (when user returns to browser)
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      await syncWithCurrentTab();
    }
  });

  function buildTiltTransform(tilt) {
    const { x, y, z, perspective } = tilt;
    if (x === 0 && y === 0 && z === 0) return 'none';
    
    let transform = '';
    if (perspective > 0) {
      transform += `perspective(${perspective}px) `;
    }
    if (x !== 0) transform += `rotateX(${x}deg) `;
    if (y !== 0) transform += `rotateY(${y}deg) `;
    if (z !== 0) transform += `rotate(${z}deg) `;
    return transform.trim() || 'none';
  }

  function initColorGrid() {
    colorGrid.innerHTML = '';
    COLORS.forEach(color => {
      const swatch = document.createElement('button');
      swatch.className = 'color-swatch';
      swatch.dataset.color = color;
      swatch.style.background = color;
      if (color === settings.backgroundColor) {
        swatch.classList.add('active');
      }
      swatch.addEventListener('click', () => selectColor(color));
      colorGrid.appendChild(swatch);
    });
  }

  function selectColor(color) {
    settings.backgroundColor = color;
    saveSettings();
    
    colorGrid.querySelectorAll('.color-swatch').forEach(s => {
      s.classList.toggle('active', s.dataset.color === color);
    });
    
    applyAllSettings();
  }

  async function applyBackground() {
    let background;
    switch (settings.backgroundMode) {
      case 'no-background':
        background = 'transparent';
        break;
      case 'page-behind':
        const color = settings.pageBehindColor === 'light' ? '255,255,255' : '0,0,0';
        const alpha = (settings.pageBehindTransparency ?? 50) / 100;
        background = `rgba(${color},${alpha})`;
        break;
      case 'filled':
      default:
        background = settings.backgroundColor;
    }
    await sendToContent({ type: 'SET_BACKGROUND', background, mode: settings.backgroundMode });
  }

  async function applyTilt() {
    const tilt = settings.tiltPreset === 'custom' 
      ? settings.customTilt 
      : TILTS[settings.tiltPreset] || TILTS.none;
    const transform = buildTiltTransform(tilt);
    await sendToContent({ type: 'SET_TILT', tilt: transform });
    updateTiltWarning();
  }

  function updateTiltWarning() {
    // Show warning and disable capture when both tilt and transparent background are enabled
    const hasTilt = settings.tiltPreset !== 'none' || 
      (settings.customTilt && (settings.customTilt.x !== 0 || settings.customTilt.y !== 0 || settings.customTilt.z !== 0));
    const isTransparent = settings.backgroundMode === 'no-background';
    const showWarning = hasTilt && isTransparent;
    
    if (tiltWarning) {
      tiltWarning.classList.toggle('visible', showWarning);
    }
    
    // Disable capture button when the warning is shown
    if (btnCapture) {
      btnCapture.disabled = showWarning;
    }
  }

  async function applyAllSettings() {
    if (!togglePreview.checked) return;
    
    await applyDevice();
    await applyFrames();
    await applyBackground();
    await applyTilt();
    await fetchPageThemeColor();
  }

  async function fetchPageThemeColor() {
    try {
      const tab = await getActiveTab();
      if (!tab?.id) return;
      
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.querySelector('meta[name="theme-color"]')?.getAttribute('content')
      });
      
      settings.pageThemeColor = result?.result || '#ffffff';
    } catch (err) {
      settings.pageThemeColor = '#ffffff';
    }
  }

  function getFrameThemeColor() {
    if (settings.frameTheme === 'custom') {
      return settings.frameCustomColor;
    } else if (settings.frameTheme === 'dark') {
      return '#202124';
    } else if (settings.frameTheme === 'page') {
      return settings.pageThemeColor || '#ffffff';
    } else {
      return '#ffffff';
    }
  }

  async function applyFrames() {
    const showSystem = settings.frameMode === 'system' || settings.frameMode === 'all';
    const showBrowser = settings.frameMode === 'all';
    const themeColor = getFrameThemeColor();
    const isDark = settings.frameTheme === 'dark' || 
      (settings.frameTheme === 'custom' && !isLightColor(settings.frameCustomColor)) ||
      (settings.frameTheme === 'page' && settings.pageThemeColor && !isLightColor(settings.pageThemeColor));
    
    
    await sendToContent({ 
      type: 'SET_SYSTEM_BAR', 
      enabled: showSystem,
      time: settings.systemTime,
      battery: settings.systemBattery,
      showWifi: settings.systemWifi,
      showSignal: settings.systemSignal,
      themeColor: themeColor,
      isDark: isDark
    });
    
    await sendToContent({ 
      type: 'SET_BROWSER_FRAME', 
      frame: showBrowser ? (isDark ? 'dark' : 'light') : 'none',
      url: settings.browserUrl || '',
      position: settings.browserPosition,
      showControls: settings.browserShowControls,
      themeColor: themeColor,
      isDark: isDark
    });
  }

  function isLightColor(color) {
    const hex = color.replace('#', '');
    if (hex.length === 6) {
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return (r * 299 + g * 587 + b * 114) / 1000 > 128;
    }
    return true;
  }

  function updateFrameOptionsUI() {
    const showSystem = settings.frameMode === 'system' || settings.frameMode === 'all';
    const showBrowser = settings.frameMode === 'all';
    const showTheme = settings.frameMode !== 'none';
    
    frameThemeOptions.style.display = showTheme ? 'block' : 'none';
    systemOptions.style.display = showSystem ? 'block' : 'none';
    browserOptions.style.display = showBrowser ? 'block' : 'none';
    frameCustomColorRow.style.display = settings.frameTheme === 'custom' ? 'flex' : 'none';
  }

  function updateTiltDisplay() {
    tiltXValue.textContent = `${settings.customTilt.x}°`;
    tiltYValue.textContent = `${settings.customTilt.y}°`;
    tiltZValue.textContent = `${settings.customTilt.z}°`;
    tiltPerspectiveValue.textContent = `${settings.customTilt.perspective}px`;
    
    tiltX.value = settings.customTilt.x;
    tiltY.value = settings.customTilt.y;
    tiltZ.value = settings.customTilt.z;
    tiltPerspective.value = settings.customTilt.perspective;
  }

  function updateDeviceUI() {
    const device = window.devices?.find(d => d.id === settings.device);
    const isCustom = device?.isCustom ?? false;
    
    if (customDimensionsSection) {
      customDimensionsSection.style.display = isCustom ? 'block' : 'none';
    }
  }

  function updateCustomDimensionsFromDevice() {
    const device = window.devices?.find(d => d.id === settings.device);
    if (device && !device.isCustom) {
      settings.customWidth = device.width;
      settings.customHeight = device.height;
      customWidthInput.value = device.width;
      customHeightInput.value = device.height;
    } else {
      customWidthInput.value = settings.customWidth;
      customHeightInput.value = settings.customHeight;
    }
  }

  function getCurrentDimensions() {
    const device = window.devices?.find(d => d.id === settings.device);
    const isCustom = device?.isCustom ?? false;
    
    let width = isCustom ? settings.customWidth : (device?.width || 390);
    let height = isCustom ? settings.customHeight : (device?.height || 844);
    
    if (settings.orientation === 'landscape') {
      [width, height] = [height, width];
    }
    
    return { width, height };
  }

  async function applyDevice() {
    const device = window.devices?.find(d => d.id === settings.device);
    if (!device) return;
    
    const dims = getCurrentDimensions();
    const deviceStyle = window.getDeviceStyle?.(settings.deviceStyle) || window.deviceStyles?.[0];
    
    await sendToContent({ 
      type: 'SET_DEVICE', 
      device: { 
        ...device, 
        width: dims.width, 
        height: dims.height
      },
      orientation: settings.orientation,
      deviceStyle: deviceStyle
    });
  }

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (date.toDateString() === now.toDateString()) {
      return timeStr;
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${timeStr}`;
    }
    
    if (date.getFullYear() === now.getFullYear()) {
      const monthDay = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      return `${monthDay} ${timeStr}`;
    }
    
    const fullDate = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    return `${fullDate} ${timeStr}`;
  }

  function renderGallery(newItemAdded = false) {
    const galleryGrid = document.getElementById('gallery-grid');
    const galleryEmpty = document.getElementById('gallery-empty');
    const galleryThumbPreview = document.getElementById('gallery-thumb-preview');
    const galleryBadge = document.getElementById('gallery-badge');
    
    if (screenshots.length > 0) {
      const latest = screenshots[screenshots.length - 1];
      galleryThumbPreview.innerHTML = `<img src="${latest.dataUrl}" alt="Latest">`;
      galleryBadge.textContent = screenshots.length;
      galleryBadge.style.display = 'flex';
    } else {
      galleryThumbPreview.innerHTML = `<span class="material-icons gallery-empty-icon">collections</span>`;
      galleryBadge.style.display = 'none';
    }
    
    if (screenshots.length === 0) {
      galleryEmpty.style.display = 'flex';
      galleryGrid.style.display = 'none';
      return;
    }
    
    galleryEmpty.style.display = 'none';
    galleryGrid.style.display = 'grid';
    
    galleryGrid.innerHTML = '';
    [...screenshots].reverse().forEach((screenshot, i) => {
      const originalIndex = screenshots.length - 1 - i;
      const timeStr = formatTimestamp(screenshot.timestamp);
      
      const item = document.createElement('div');
      item.className = 'gallery-item' + (newItemAdded && i === 0 ? ' new-item' : '');
      item.dataset.index = originalIndex;
      item.innerHTML = `
        <img src="${screenshot.dataUrl}" alt="Screenshot">
        <span class="item-time">${timeStr}</span>
        <div class="item-overlay">
          <button class="btn-icon-action" data-action="copy" data-index="${originalIndex}" title="Copy to clipboard">
            <span class="material-icons">content_copy</span>
          </button>
          <button class="btn-icon-action" data-action="download" data-index="${originalIndex}" title="Download">
            <span class="material-icons">download</span>
          </button>
          <button class="btn-icon-action btn-delete" data-action="delete" data-index="${originalIndex}" title="Delete">
            <span class="material-icons">delete_outline</span>
          </button>
        </div>
      `;
      galleryGrid.appendChild(item);
    });
  }

  function openScreenshotInNewTab(index) {
    const screenshot = screenshots[index];
    if (!screenshot) return;
    
    const newTab = window.open();
    if (newTab) {
      newTab.document.write(`
        <html>
          <head><title>Screenshot</title></head>
          <body style="margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh; background:#1e1e1e;">
            <img src="${screenshot.dataUrl}" style="max-width:100%; max-height:100vh; object-fit:contain;">
          </body>
        </html>
      `);
    }
  }

  function openGallery() {
    document.getElementById('gallery-panel').classList.add('open');
    document.getElementById('gallery-backdrop').classList.add('visible');
  }
  
  function closeGallery() {
    document.getElementById('gallery-panel').classList.remove('open');
    document.getElementById('gallery-backdrop').classList.remove('visible');
  }

  async function playCaptureAnimation(dataUrl) {
    const flash = document.getElementById('capture-flash');
    flash.classList.add('flash');
    setTimeout(() => flash.classList.remove('flash'), 200);
    
    const galleryBtn = document.getElementById('btn-gallery');
    const btnRect = galleryBtn.getBoundingClientRect();
    
    const flyingThumb = document.createElement('img');
    flyingThumb.className = 'flying-thumb';
    flyingThumb.src = dataUrl;
    
    const startX = -40;
    const startY = window.innerHeight / 2 - 50;
    flyingThumb.style.left = startX + 'px';
    flyingThumb.style.top = startY + 'px';
    flyingThumb.style.opacity = '1';
    flyingThumb.style.transform = 'scale(0.8)';
    flyingThumb.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    
    document.body.appendChild(flyingThumb);
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        flyingThumb.style.left = (btnRect.left + btnRect.width / 2 - 40) + 'px';
        flyingThumb.style.top = (btnRect.top + btnRect.height / 2 - 50) + 'px';
        flyingThumb.style.transform = 'scale(0.4)';
        flyingThumb.style.opacity = '0.7';
        flyingThumb.style.borderRadius = '8px';
      });
    });
    
    setTimeout(() => {
      flyingThumb.remove();
      galleryBtn.style.transform = 'scale(1.15)';
      galleryBtn.style.transition = 'transform 0.15s';
      setTimeout(() => {
        galleryBtn.style.transform = '';
        setTimeout(() => galleryBtn.style.transition = '', 150);
      }, 150);
    }, 600);
  }

  async function copyScreenshot(index) {
    const screenshot = screenshots[index];
    if (!screenshot) return;

    try {
      const response = await fetch(screenshot.dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      const btn = document.querySelector(`[data-action="copy"][data-index="${index}"]`);
      if (btn) {
        const icon = btn.querySelector('.material-icons');
        if (icon) {
          icon.textContent = 'check';
          setTimeout(() => icon.textContent = 'content_copy', 1500);
        }
      }
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }

  async function downloadScreenshot(index) {
    const screenshot = screenshots[index];
    if (!screenshot) return;

    const formatSelect = document.getElementById('export-format');
    const format = formatSelect?.value || 'png';
    
    let dataUrl = screenshot.dataUrl;
    let mimeType = 'image/png';
    
    if (format !== 'png') {
      const img = new Image();
      img.src = screenshot.dataUrl;
      await new Promise(resolve => img.onload = resolve);
      
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      mimeType = format === 'webp' ? 'image/webp' : 'image/jpeg';
      dataUrl = canvas.toDataURL(mimeType, 0.92);
    }

    const link = document.createElement('a');
    link.download = `device-preview-${screenshot.timestamp}.${format}`;
    link.href = dataUrl;
    link.click();
  }

  function deleteScreenshot(index) {
    screenshots.splice(index, 1);
    renderGallery();
    saveScreenshots();
  }


  togglePreview.addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    previewControls.classList.toggle('disabled', !enabled);
    
    if (enabled) {
      await sendToContent({ type: 'TOGGLE_PREVIEW', enabled: true });
      await applyAllSettings();
    } else {
      await sendToContent({ type: 'CLEANUP' });
    }
  });

  deviceSelect.addEventListener('change', async (e) => {
    settings.device = e.target.value;
    saveSettings();
    updateCustomDimensionsFromDevice();
    updateDeviceUI();
    await applyAllSettings();
  });

  customWidthInput.addEventListener('input', async (e) => {
    settings.customWidth = parseInt(e.target.value) || 390;
    saveSettings();
    await applyAllSettings();
  });

  customHeightInput.addEventListener('input', async (e) => {
    settings.customHeight = parseInt(e.target.value) || 844;
    saveSettings();
    await applyAllSettings();
  });

  deviceStyleSelect.addEventListener('change', async (e) => {
    settings.deviceStyle = e.target.value;
    saveSettings();
    await applyAllSettings();
  });

  orientationPortrait.addEventListener('click', async () => {
    settings.orientation = 'portrait';
    saveSettings();
    orientationPortrait.classList.add('active');
    orientationLandscape.classList.remove('active');
    await applyAllSettings();
  });

  orientationLandscape.addEventListener('click', async () => {
    settings.orientation = 'landscape';
    saveSettings();
    orientationLandscape.classList.add('active');
    orientationPortrait.classList.remove('active');
    await applyAllSettings();
  });

  frameModeSelect.addEventListener('change', async (e) => {
    settings.frameMode = e.target.value;
    saveSettings();
    updateFrameOptionsUI();
    await applyAllSettings();
  });

  frameTheme.addEventListener('change', async (e) => {
    settings.frameTheme = e.target.value;
    saveSettings();
    updateFrameOptionsUI();
    await applyAllSettings();
  });

  frameCustomColor.addEventListener('input', async (e) => {
    settings.frameCustomColor = e.target.value;
    saveSettings();
    await applyAllSettings();
  });

  systemTime.addEventListener('input', async (e) => {
    settings.systemTime = e.target.value;
    saveSettings();
    await applyAllSettings();
  });

  systemBattery.addEventListener('input', async (e) => {
    settings.systemBattery = parseInt(e.target.value) || 100;
    batteryValue.textContent = settings.systemBattery + '%';
    saveSettings();
    await applyAllSettings();
  });

  systemWifi.addEventListener('change', async (e) => {
    settings.systemWifi = e.target.checked;
    saveSettings();
    await applyAllSettings();
  });

  systemSignal.addEventListener('change', async (e) => {
    settings.systemSignal = e.target.checked;
    saveSettings();
    await applyAllSettings();
  });

  browserPosition.addEventListener('change', async (e) => {
    settings.browserPosition = e.target.value;
    saveSettings();
    await applyAllSettings();
  });

  browserUrlInput.addEventListener('input', async (e) => {
    settings.browserUrl = e.target.value;
    saveSettings();
    await applyAllSettings();
  });

  browserShowControls.addEventListener('change', async (e) => {
    settings.browserShowControls = e.target.checked;
    saveSettings();
    await applyAllSettings();
  });

  backgroundModeSelect.addEventListener('change', async (e) => {
    settings.backgroundMode = e.target.value;
    saveSettings();
    colorOptions.style.display = e.target.value === 'filled' ? 'block' : 'none';
    pageBehindOptions.style.display = e.target.value === 'page-behind' ? 'block' : 'none';
    updateTiltWarning();
    await applyAllSettings();
  });

  pageBehindColor.addEventListener('change', async (e) => {
    settings.pageBehindColor = e.target.value;
    saveSettings();
    await applyAllSettings();
  });

  pageBehindTransparency.addEventListener('input', async (e) => {
    settings.pageBehindTransparency = parseInt(e.target.value);
    transparencyValue.textContent = `${e.target.value}%`;
    saveSettings();
    await applyAllSettings();
  });

  customColor.addEventListener('input', (e) => {
    selectColor(e.target.value);
  });

  tiltSelect.addEventListener('change', async (e) => {
    settings.tiltPreset = e.target.value;
    saveSettings();
    customTiltOptions.style.display = e.target.value === 'custom' ? 'block' : 'none';
    
    if (e.target.value !== 'custom' && TILTS[e.target.value]) {
      settings.customTilt = { ...TILTS[e.target.value] };
      updateTiltDisplay();
      updateGizmoCube();
    }
    await applyAllSettings();
  });

  [tiltX, tiltY, tiltZ, tiltPerspective].forEach(slider => {
    slider.addEventListener('input', async (e) => {
      const prop = e.target.id.replace('tilt-', '');
      settings.customTilt[prop] = parseInt(e.target.value);
      saveSettings();
      updateTiltDisplay();
      updateGizmoCube();
      await applyAllSettings();
    });
  });

  const gizmo = document.getElementById('tilt-gizmo');
  const gizmoCube = gizmo?.querySelector('.gizmo-cube');
  let isDraggingGizmo = false;
  let gizmoStartX = 0;
  let gizmoStartY = 0;
  let gizmoStartRotX = 0;
  let gizmoStartRotY = 0;
  let gizmoStartRotZ = 0;

  function updateGizmoCube() {
    if (gizmoCube) {
      const { x, y, z } = settings.customTilt;
      gizmoCube.style.transform = `translateZ(-30px) rotateX(${-x}deg) rotateY(${y}deg) rotateZ(${z}deg)`;
    }
  }

  if (gizmo) {
    gizmo.addEventListener('mousedown', (e) => {
      isDraggingGizmo = true;
      gizmoStartX = e.clientX;
      gizmoStartY = e.clientY;
      gizmoStartRotX = settings.customTilt.x;
      gizmoStartRotY = settings.customTilt.y;
      gizmoStartRotZ = settings.customTilt.z;
      e.preventDefault();
    });

    document.addEventListener('mousemove', async (e) => {
      if (!isDraggingGizmo) return;
      
      const deltaX = e.clientX - gizmoStartX;
      const deltaY = e.clientY - gizmoStartY;
      const sensitivity = 0.5;
      
      if (e.shiftKey) {
        settings.customTilt.z = Math.max(-45, Math.min(45, gizmoStartRotZ + deltaX * sensitivity));
      } else {
        settings.customTilt.y = Math.max(-45, Math.min(45, gizmoStartRotY + deltaX * sensitivity));
        settings.customTilt.x = Math.max(-45, Math.min(45, gizmoStartRotX - deltaY * sensitivity));
      }
      
      updateTiltDisplay();
      updateGizmoCube();
      await applyAllSettings();
    });

    document.addEventListener('mouseup', () => {
      if (isDraggingGizmo) {
        isDraggingGizmo = false;
        saveSettings();
      }
    });
  }

  const tiltFineToggle = document.getElementById('tilt-fine-toggle');
  const tiltFineControls = document.getElementById('tilt-fine-controls');
  if (tiltFineToggle && tiltFineControls) {
    tiltFineToggle.addEventListener('click', () => {
      tiltFineToggle.classList.toggle('expanded');
      tiltFineControls.classList.toggle('collapsed');
    });
  }

  const tiltResetBtn = document.getElementById('tilt-reset');
  if (tiltResetBtn) {
    tiltResetBtn.addEventListener('click', async () => {
      settings.customTilt = { x: 0, y: 0, z: 0, perspective: 1000 };
      saveSettings();
      updateTiltDisplay();
      updateGizmoCube();
      await applyAllSettings();
    });
  }

  btnCapture.addEventListener('click', async () => {
    btnCapture.disabled = true;
    btnCapture.classList.add('capturing');
    
    try {
      const isTransparent = settings.backgroundMode === 'no-background';
      
      let capturedDataUrl = null;
      
      if (isTransparent) {
        capturedDataUrl = await captureWithTransparentBackground();
        
        if (capturedDataUrl) {
          screenshots.push({
            dataUrl: capturedDataUrl,
            timestamp: Date.now(),
            transparent: true
          });
        }
      } else {
        const response = await chrome.runtime.sendMessage({ type: 'CAPTURE_TAB' });
        if (response?.dataUrl) {
          capturedDataUrl = response.dataUrl;
          screenshots.push({
            dataUrl: capturedDataUrl,
            timestamp: Date.now(),
            transparent: false
          });
        }
      }
      
      if (capturedDataUrl) {
        await playCaptureAnimation(capturedDataUrl);
        renderGallery(true);
        saveScreenshots();
      }
    } catch (err) {
      console.error('Capture failed:', err);
    }
    
    btnCapture.classList.remove('capturing');
    // Re-check if button should remain disabled due to tilt+transparent warning
    updateTiltWarning();
  });

  document.getElementById('btn-gallery').addEventListener('click', openGallery);
  document.getElementById('btn-close-gallery').addEventListener('click', closeGallery);
  document.getElementById('gallery-backdrop').addEventListener('click', closeGallery);

  document.getElementById('gallery-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (btn) {
      e.stopPropagation();
      const action = btn.dataset.action;
      const index = parseInt(btn.dataset.index);
      
      switch (action) {
        case 'copy': copyScreenshot(index); break;
        case 'download': downloadScreenshot(index); break;
        case 'delete': 
          deleteScreenshot(index);
          renderGallery();
          break;
      }
      return;
    }
    
    const item = e.target.closest('.gallery-item');
    if (item && item.dataset.index) {
      const index = parseInt(item.dataset.index);
      openScreenshotInNewTab(index);
    }
  });

  document.getElementById('btn-clear-all').addEventListener('click', () => {
    if (screenshots.length === 0) return;
    
    if (confirm(`Delete all ${screenshots.length} screenshots?`)) {
      screenshots = [];
      saveScreenshots();
      renderGallery();
    }
  });

  async function captureWithTransparentBackground() {
    const device = window.devices?.find(d => d.id === settings.device);
    if (!device) return null;
    
    const dims = getCurrentDimensions();
    const screenWidth = dims.width;
    const screenHeight = dims.height;
    
    const isTablet = settings.device === 'tablet';
    const isPhone = settings.device.startsWith('phone-') || settings.device === 'custom';
    
    // Get device style
    const deviceStyle = window.getDeviceStyle?.(settings.deviceStyle) || window.deviceStyles?.[0];
    const frame = deviceStyle?.frame || {
      padding: 14,
      borderRadius: 44,
      screenRadius: 32
    };
    
    const paddingTop = frame.paddingTop || frame.padding;
    const paddingBottom = frame.paddingBottom || frame.padding;
    const paddingLeft = frame.paddingLeft || frame.padding;
    const paddingRight = frame.paddingRight || frame.padding;
    
    const borderRadius = frame.borderRadius;
    const screenRadius = frame.screenRadius;
    
    const frameWidth = screenWidth + paddingLeft + paddingRight;
    const frameHeight = screenHeight + paddingTop + paddingBottom;
    
    // Temporarily reset tilt for capture
    const hasTilt = settings.tiltPreset !== 'none' || 
      (settings.customTilt.x !== 0 || settings.customTilt.y !== 0 || settings.customTilt.z !== 0);
    
    if (hasTilt) {
      await sendToContent({ type: 'SET_TILT', tilt: 'none' });
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const boundsResponse = await sendToContent({ type: 'GET_SCREEN_BOUNDS' });
    const screenBounds = boundsResponse?.bounds;
    if (!screenBounds) return null;
    
    const contentDpr = boundsResponse?.dpr || window.devicePixelRatio || 1;
    
    const response = await chrome.runtime.sendMessage({ type: 'CAPTURE_TAB' });
    
    // Restore tilt
    if (hasTilt) {
      const tilt = settings.tiltPreset === 'custom' 
        ? settings.customTilt 
        : TILTS[settings.tiltPreset] || TILTS.none;
      const transform = buildTiltTransform(tilt);
      await sendToContent({ type: 'SET_TILT', tilt: transform });
    }
    
    if (!response?.dataUrl) return null;
    
    return new Promise((resolve) => {
      const pageImg = new Image();
      pageImg.onload = async () => {
        const srcDpr = contentDpr;
        const outDpr = window.devicePixelRatio || 1;
        const exportPadding = 40;
        
        const canvasWidth = (frameWidth + exportPadding * 2) * outDpr;
        const canvasHeight = (frameHeight + exportPadding * 2) * outDpr;
        
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        
        const offsetX = exportPadding * outDpr;
        const offsetY = exportPadding * outDpr;
        
        const deviceType = isTablet ? 'tablet' : 'phone';
        
        // Draw device frame using style
        ctx.save();
        drawDeviceFrameWithStyle(ctx, offsetX, offsetY, frameWidth * outDpr, frameHeight * outDpr, deviceStyle, outDpr);
        ctx.restore();
        
        // Draw screen content
        ctx.save();
        const screenX = offsetX + paddingLeft * outDpr;
        const screenY = offsetY + paddingTop * outDpr;
        
        ctx.beginPath();
        roundedRect(ctx, screenX, screenY, screenWidth * outDpr, screenHeight * outDpr, screenRadius * outDpr);
        ctx.clip();
        
        ctx.drawImage(pageImg, 
          screenBounds.x * srcDpr, screenBounds.y * srcDpr, screenBounds.width * srcDpr, screenBounds.height * srcDpr,
          screenX, screenY, screenWidth * outDpr, screenHeight * outDpr
        );
        ctx.restore();
        
        // Draw notch based on style
        if (deviceStyle?.notch) {
          drawNotchWithStyle(ctx, offsetX, offsetY, frameWidth * outDpr, screenWidth * outDpr, deviceStyle, outDpr);
        }
        
        // Draw home elements based on style
        drawHomeElementsWithStyle(ctx, offsetX, offsetY, frameWidth * outDpr, frameHeight * outDpr, screenWidth * outDpr, deviceStyle, outDpr);
        
        // Get the straight device image
        const straightDeviceDataUrl = canvas.toDataURL('image/png');
        
        // If there's tilt, apply it using canvas transforms
        if (hasTilt) {
          const tilt = settings.tiltPreset === 'custom' 
            ? settings.customTilt 
            : TILTS[settings.tiltPreset] || TILTS.none;
          
          const tiltedResult = await applyTiltToCanvas(canvas, tilt, exportPadding * outDpr);
          resolve(tiltedResult || straightDeviceDataUrl);
        } else {
          resolve(straightDeviceDataUrl);
        }
      };
      pageImg.src = response.dataUrl;
    });
  }
  
  async function applyTiltToCanvas(sourceCanvas, tilt, currentPadding) {
    const { x: rotX, y: rotY, z: rotZ, perspective } = tilt;
    
    // If no significant tilt, return original
    if (Math.abs(rotX) < 1 && Math.abs(rotY) < 1 && Math.abs(rotZ) < 1) {
      return sourceCanvas.toDataURL('image/png');
    }
    
    const padding = 10;
    const srcWidth = sourceCanvas.width;
    const srcHeight = sourceCanvas.height;
    
    // Convert degrees to radians - match CSS transform direction
    const radY = (rotY * Math.PI) / 180;
    const radX = (rotX * Math.PI) / 180;
    const radZ = (-rotZ * Math.PI) / 180;
    
    // Use a perspective distance relative to image size for natural look
    // CSS perspective is distance from viewer - we scale it relative to image diagonal
    const diagonal = Math.sqrt(srcWidth * srcWidth + srcHeight * srcHeight);
    const perspectiveDist = diagonal * (perspective / 500); // Normalize perspective
    
    // Calculate the four corners of the transformed image
    // Original corners (centered at origin)
    const hw = srcWidth / 2;
    const hh = srcHeight / 2;
    const corners = [
      { x: -hw, y: -hh }, // top-left
      { x: hw, y: -hh },  // top-right
      { x: hw, y: hh },   // bottom-right
      { x: -hw, y: hh }   // bottom-left
    ];
    
    // Apply 3D rotation and perspective projection
    const transformedCorners = corners.map(corner => {
      let { x, y } = corner;
      let z = 0;
      
      // Rotate around Y axis (left-right tilt)
      if (Math.abs(radY) > 0.001) {
        const cosY = Math.cos(radY);
        const sinY = Math.sin(radY);
        const newX = x * cosY;
        const newZ = x * sinY;
        x = newX;
        z = newZ;
      }
      
      // Rotate around X axis (top-bottom tilt)
      if (Math.abs(radX) > 0.001) {
        const cosX = Math.cos(radX);
        const sinX = Math.sin(radX);
        const newY = y * cosX;
        const newZ = z + y * sinX;
        y = newY;
        z = newZ;
      }
      
      // Rotate around Z axis (rotation in plane)
      if (Math.abs(radZ) > 0.001) {
        const cosZ = Math.cos(radZ);
        const sinZ = Math.sin(radZ);
        const newX = x * cosZ - y * sinZ;
        const newY = x * sinZ + y * cosZ;
        x = newX;
        y = newY;
      }
      
      // Apply perspective projection with scaled distance
      // This creates a more subtle, natural perspective effect
      const scale = perspectiveDist / (perspectiveDist + z);
      x *= scale;
      y *= scale;
      
      return { x, y, z };
    });
    
    // Find bounding box of transformed corners
    const xs = transformedCorners.map(c => c.x);
    const ys = transformedCorners.map(c => c.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    const outWidth = Math.ceil(maxX - minX + padding * 2);
    const outHeight = Math.ceil(maxY - minY + padding * 2);
    
    // Offset to center the result
    const offsetX = -minX + padding;
    const offsetY = -minY + padding;
    
    // Adjust corners to output canvas coordinates
    const destCorners = transformedCorners.map(c => ({
      x: c.x + offsetX,
      y: c.y + offsetY
    }));
    
    const outCanvas = document.createElement('canvas');
    outCanvas.width = outWidth;
    outCanvas.height = outHeight;
    const ctx = outCanvas.getContext('2d');
    
    // Draw the image using perspective transform via subdivision
    drawPerspectiveImage(ctx, sourceCanvas, 
      destCorners[0], destCorners[1], destCorners[2], destCorners[3]
    );
    
    // Trim to content with padding
    const trimmedCanvas = trimCanvas(outCanvas, padding);
    
    return trimmedCanvas.toDataURL('image/png');
  }
  
  function drawPerspectiveImage(ctx, img, topLeft, topRight, bottomRight, bottomLeft) {
    // Draw a perspective-transformed image by subdividing into a grid
    const srcWidth = img.width;
    const srcHeight = img.height;
    const subdivisions = 16; // More subdivisions = smoother
    
    const stepU = 1 / subdivisions;
    const stepV = 1 / subdivisions;
    
    for (let row = 0; row < subdivisions; row++) {
      for (let col = 0; col < subdivisions; col++) {
        const u0 = col * stepU;
        const v0 = row * stepV;
        const u1 = (col + 1) * stepU;
        const v1 = (row + 1) * stepV;
        
        // Get the four corners of this cell in destination space
        const p00 = interpolateQuad(topLeft, topRight, bottomRight, bottomLeft, u0, v0);
        const p10 = interpolateQuad(topLeft, topRight, bottomRight, bottomLeft, u1, v0);
        const p11 = interpolateQuad(topLeft, topRight, bottomRight, bottomLeft, u1, v1);
        const p01 = interpolateQuad(topLeft, topRight, bottomRight, bottomLeft, u0, v1);
        
        // Source coordinates
        const sx = u0 * srcWidth;
        const sy = v0 * srcHeight;
        const sw = stepU * srcWidth;
        const sh = stepV * srcHeight;
        
        // Draw this cell as two triangles
        drawTexturedTriangle(ctx, img,
          sx, sy, sx + sw, sy, sx, sy + sh,
          p00.x, p00.y, p10.x, p10.y, p01.x, p01.y
        );
        drawTexturedTriangle(ctx, img,
          sx + sw, sy, sx + sw, sy + sh, sx, sy + sh,
          p10.x, p10.y, p11.x, p11.y, p01.x, p01.y
        );
      }
    }
  }
  
  function interpolateQuad(topLeft, topRight, bottomRight, bottomLeft, u, v) {
    // Bilinear interpolation within a quad
    const top = {
      x: topLeft.x + (topRight.x - topLeft.x) * u,
      y: topLeft.y + (topRight.y - topLeft.y) * u
    };
    const bottom = {
      x: bottomLeft.x + (bottomRight.x - bottomLeft.x) * u,
      y: bottomLeft.y + (bottomRight.y - bottomLeft.y) * u
    };
    return {
      x: top.x + (bottom.x - top.x) * v,
      y: top.y + (bottom.y - top.y) * v
    };
  }
  
  function drawTexturedTriangle(ctx, img, sx0, sy0, sx1, sy1, sx2, sy2, dx0, dy0, dx1, dy1, dx2, dy2) {
    // Draw a textured triangle using affine transform
    ctx.save();
    
    // Clip to triangle
    ctx.beginPath();
    ctx.moveTo(dx0, dy0);
    ctx.lineTo(dx1, dy1);
    ctx.lineTo(dx2, dy2);
    ctx.closePath();
    ctx.clip();
    
    // Calculate affine transform
    // We need to map source triangle to destination triangle
    const denom = (sx0 * (sy1 - sy2) + sx1 * (sy2 - sy0) + sx2 * (sy0 - sy1));
    
    if (Math.abs(denom) < 0.001) {
      ctx.restore();
      return;
    }
    
    const m11 = (dx0 * (sy1 - sy2) + dx1 * (sy2 - sy0) + dx2 * (sy0 - sy1)) / denom;
    const m12 = (dx0 * (sx2 - sx1) + dx1 * (sx0 - sx2) + dx2 * (sx1 - sx0)) / denom;
    const m21 = (dy0 * (sy1 - sy2) + dy1 * (sy2 - sy0) + dy2 * (sy0 - sy1)) / denom;
    const m22 = (dy0 * (sx2 - sx1) + dy1 * (sx0 - sx2) + dy2 * (sx1 - sx0)) / denom;
    const m31 = (dx0 * (sx1 * sy2 - sx2 * sy1) + dx1 * (sx2 * sy0 - sx0 * sy2) + dx2 * (sx0 * sy1 - sx1 * sy0)) / denom;
    const m32 = (dy0 * (sx1 * sy2 - sx2 * sy1) + dy1 * (sx2 * sy0 - sx0 * sy2) + dy2 * (sx0 * sy1 - sx1 * sy0)) / denom;
    
    ctx.transform(m11, m21, m12, m22, m31, m32);
    
    // Draw the image - expand slightly to avoid gaps
    ctx.drawImage(img, -0.5, -0.5, img.width + 1, img.height + 1);
    
    ctx.restore();
  }
  
  function trimCanvas(canvas, padding) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
    
    // Find bounding box of non-transparent pixels
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const alpha = data[(y * canvas.width + x) * 4 + 3];
        if (alpha > 0) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
    
    if (maxX < minX || maxY < minY) {
      // No content found, return original
      return canvas;
    }
    
    // Add padding
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(canvas.width, maxX + padding);
    maxY = Math.min(canvas.height, maxY + padding);
    
    const trimmedWidth = maxX - minX;
    const trimmedHeight = maxY - minY;
    
    const trimmedCanvas = document.createElement('canvas');
    trimmedCanvas.width = trimmedWidth;
    trimmedCanvas.height = trimmedHeight;
    const trimmedCtx = trimmedCanvas.getContext('2d');
    
    trimmedCtx.drawImage(canvas, minX, minY, trimmedWidth, trimmedHeight, 0, 0, trimmedWidth, trimmedHeight);
    
    return trimmedCanvas;
  }

  function roundedRect(ctx, x, y, width, height, radius) {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Parse CSS-like background to canvas fillStyle
  function parseBackground(ctx, background, x, y, width, height) {
    if (!background) return '#2d2d2d';
    
    // Check for linear gradient
    const gradientMatch = background.match(/linear-gradient\((\d+)deg,\s*([^)]+)\)/);
    if (gradientMatch) {
      const angle = parseInt(gradientMatch[1]) || 145;
      const stops = gradientMatch[2].split(',').map(s => s.trim());
      
      // Calculate gradient points based on angle
      const rad = (angle - 90) * Math.PI / 180;
      const cx = x + width / 2;
      const cy = y + height / 2;
      const len = Math.max(width, height);
      
      const gradient = ctx.createLinearGradient(
        cx - Math.cos(rad) * len / 2,
        cy - Math.sin(rad) * len / 2,
        cx + Math.cos(rad) * len / 2,
        cy + Math.sin(rad) * len / 2
      );
      
      stops.forEach((stop, i) => {
        const parts = stop.split(/\s+/);
        const color = parts[0];
        const position = parts[1] ? parseFloat(parts[1]) / 100 : i / (stops.length - 1);
        gradient.addColorStop(position, color);
      });
      
      return gradient;
    }
    
    return background;
  }

  function drawDeviceFrameWithStyle(ctx, x, y, width, height, style, dpr) {
    const frame = style?.frame || {};
    const borderRadius = (frame.borderRadius || 44) * dpr;
    
    // Draw frame background
    const fillStyle = parseBackground(ctx, frame.background, x, y, width, height);
    ctx.beginPath();
    roundedRect(ctx, x, y, width, height, borderRadius);
    ctx.fillStyle = fillStyle;
    ctx.fill();
    
    // Draw border if specified
    if (frame.border) {
      ctx.beginPath();
      roundedRect(ctx, x, y, width, height, borderRadius);
      ctx.strokeStyle = frame.border.replace(/\d+px\s+solid\s+/, '');
      ctx.lineWidth = parseInt(frame.border) || 2;
      ctx.stroke();
    } else {
      // Default subtle highlight
      ctx.beginPath();
      roundedRect(ctx, x, y, width, height, borderRadius);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // Draw buttons if specified
    if (style?.buttons) {
      const buttons = style.buttons;
      
      if (buttons.power) {
        const btn = buttons.power;
        ctx.fillStyle = btn.background || '#1a1a1a';
        ctx.fillRect(
          x + width - 1 * dpr,
          y + (btn.top || 120) * dpr,
          (btn.width || 3) * dpr,
          (btn.height || 80) * dpr
        );
      }
      
      if (buttons.volumeUp) {
        const btn = buttons.volumeUp;
        ctx.fillStyle = btn.background || '#1a1a1a';
        ctx.fillRect(
          x - 2 * dpr,
          y + (btn.top || 100) * dpr,
          (btn.width || 3) * dpr,
          (btn.height || 40) * dpr
        );
      }
      
      if (buttons.volumeDown) {
        const btn = buttons.volumeDown;
        ctx.fillStyle = btn.background || '#1a1a1a';
        ctx.fillRect(
          x - 2 * dpr,
          y + (btn.top || 150) * dpr,
          (btn.width || 3) * dpr,
          (btn.height || 40) * dpr
        );
      }
    }
  }

  function drawNotchWithStyle(ctx, frameX, frameY, frameWidth, screenWidth, style, dpr) {
    const notch = style?.notch;
    if (!notch) return;
    
    const paddingTop = (style.frame?.paddingTop || style.frame?.padding || 14) * dpr;
    
    switch (notch.type) {
      case 'notch': {
        const notchWidth = (notch.width || 130) * dpr;
        const notchHeight = (notch.height || 32) * dpr;
        const notchX = frameX + (frameWidth - notchWidth) / 2;
        const notchY = frameY + paddingTop;
        const notchRadius = (parseInt(notch.borderRadius) || 18) * dpr;
        
        ctx.fillStyle = notch.background || '#1a1a1a';
        ctx.beginPath();
        ctx.moveTo(notchX, notchY);
        ctx.lineTo(notchX + notchWidth, notchY);
        ctx.lineTo(notchX + notchWidth, notchY + notchHeight - notchRadius);
        ctx.quadraticCurveTo(notchX + notchWidth, notchY + notchHeight, notchX + notchWidth - notchRadius, notchY + notchHeight);
        ctx.lineTo(notchX + notchRadius, notchY + notchHeight);
        ctx.quadraticCurveTo(notchX, notchY + notchHeight, notchX, notchY + notchHeight - notchRadius);
        ctx.closePath();
        ctx.fill();
        
        // Draw notch elements
        if (notch.elements) {
          notch.elements.forEach(el => {
            if (el.type === 'speaker') {
              ctx.fillStyle = el.background || '#333';
              ctx.beginPath();
              ctx.roundRect(
                notchX + (notchWidth - el.width * dpr) / 2,
                notchY + el.top * dpr,
                el.width * dpr,
                el.height * dpr,
                el.borderRadius * dpr
              );
              ctx.fill();
            } else if (el.type === 'camera') {
              const camX = notchX + notchWidth - el.right * dpr - el.size * dpr / 2;
              const camY = notchY + el.top * dpr + el.size * dpr / 2;
              const camGradient = ctx.createRadialGradient(camX, camY, 0, camX, camY, el.size * dpr / 2);
              camGradient.addColorStop(0.3, '#1a3a5c');
              camGradient.addColorStop(1, '#0a1520');
              ctx.fillStyle = camGradient;
              ctx.beginPath();
              ctx.arc(camX, camY, el.size * dpr / 2, 0, Math.PI * 2);
              ctx.fill();
            }
          });
        }
        break;
      }
      
      case 'pill': {
        const pillWidth = (notch.width || 95) * dpr;
        const pillHeight = (notch.height || 28) * dpr;
        const pillX = frameX + (frameWidth - pillWidth) / 2;
        const pillY = frameY + paddingTop + (notch.top || 12) * dpr;
        const pillRadius = (notch.borderRadius || 14) * dpr;
        
        ctx.fillStyle = notch.background || '#000000';
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillWidth, pillHeight, pillRadius);
        ctx.fill();
        
        // Draw camera in pill
        if (notch.elements) {
          notch.elements.forEach(el => {
            if (el.type === 'camera') {
              const camX = pillX + pillWidth - el.right * dpr - el.size * dpr / 2;
              const camY = pillY + el.top * dpr + el.size * dpr / 2;
              const camGradient = ctx.createRadialGradient(camX, camY, 0, camX, camY, el.size * dpr / 2);
              camGradient.addColorStop(0.3, '#1a3a5c');
              camGradient.addColorStop(1, '#0a1520');
              ctx.fillStyle = camGradient;
              ctx.beginPath();
              ctx.arc(camX, camY, el.size * dpr / 2, 0, Math.PI * 2);
              ctx.fill();
            }
          });
        }
        break;
      }
      
      case 'punchhole': {
        const size = (notch.size || 14) * dpr;
        const top = (notch.top || 14) * dpr;
        let cx;
        
        if (notch.position === 'left') {
          cx = frameX + paddingTop + 14 * dpr + size / 2;
        } else if (notch.position === 'right') {
          cx = frameX + frameWidth - paddingTop - 14 * dpr - size / 2;
        } else {
          cx = frameX + frameWidth / 2;
        }
        
        const cy = frameY + paddingTop + top + size / 2;
        
        ctx.fillStyle = notch.background || '#000000';
        ctx.beginPath();
        ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      
      case 'speaker-bar': {
        const barWidth = (notch.width || 60) * dpr;
        const barHeight = (notch.height || 6) * dpr;
        const barX = frameX + (frameWidth - barWidth) / 2;
        const barY = frameY + paddingTop + (notch.top || 28) * dpr;
        
        ctx.fillStyle = notch.background || '#888';
        ctx.beginPath();
        ctx.roundRect(barX, barY, barWidth, barHeight, (notch.borderRadius || 3) * dpr);
        ctx.fill();
        break;
      }
    }
  }

  function drawHomeElementsWithStyle(ctx, frameX, frameY, frameWidth, frameHeight, screenWidth, style, dpr) {
    const padding = (style?.frame?.padding || 14) * dpr;
    const paddingTop = (style?.frame?.paddingTop || style?.frame?.padding || 14) * dpr;
    const paddingBottom = (style?.frame?.paddingBottom || style?.frame?.padding || 14) * dpr;
    
    // Draw home button for classic styles
    if (style?.homeButton?.show) {
      const config = style.homeButton;
      const size = config.size * dpr;
      const btnX = frameX + (frameWidth - size) / 2;
      // Center the button in the bottom bezel area
      // Bottom bezel starts at: frameY + frameHeight - paddingBottom
      // Button should be centered in that bezel
      const bezelStartY = frameY + frameHeight - paddingBottom;
      const btnY = bezelStartY + (paddingBottom - size) / 2;
      
      // Button background
      const fillStyle = parseBackground(ctx, config.background, btnX, btnY, size, size);
      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      ctx.arc(btnX + size / 2, btnY + size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Button border
      if (config.border) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = dpr;
        ctx.stroke();
      }
      
      // Inner square for Touch ID
      if (config.innerSquare) {
        const innerSize = size * 0.4;
        ctx.strokeStyle = '#444';
        ctx.lineWidth = dpr;
        ctx.beginPath();
        ctx.roundRect(
          btnX + (size - innerSize) / 2,
          btnY + (size - innerSize) / 2,
          innerSize,
          innerSize,
          4 * dpr
        );
        ctx.stroke();
      }
      return;
    }
    
    // Draw home indicator for modern styles
    if (style?.homeIndicator?.show) {
      const config = style.homeIndicator;
      const indicatorWidth = (config.width || Math.min(120, screenWidth / dpr * 0.35)) * dpr;
      const indicatorHeight = (config.height || 5) * dpr;
      const indicatorX = frameX + (frameWidth - indicatorWidth) / 2;
      const indicatorY = frameY + frameHeight - padding - (config.bottom || 8) * dpr - indicatorHeight;
      
      ctx.fillStyle = config.background || 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.roundRect(indicatorX, indicatorY, indicatorWidth, indicatorHeight, (config.borderRadius || 3) * dpr);
      ctx.fill();
    }
  }

  async function init() {
    initColorGrid();
    populateDeviceSelect();
    populateDeviceStyleSelect();
    
    deviceSelect.value = settings.device;
    deviceStyleSelect.value = settings.deviceStyle || 'modern-notch';
    customWidthInput.value = settings.customWidth || 390;
    customHeightInput.value = settings.customHeight || 844;
    updateDeviceUI();
    
    if (settings.orientation === 'landscape') {
      orientationLandscape.classList.add('active');
      orientationPortrait.classList.remove('active');
    }
    
    backgroundModeSelect.value = settings.backgroundMode;
    colorOptions.style.display = settings.backgroundMode === 'filled' ? 'block' : 'none';
    pageBehindOptions.style.display = settings.backgroundMode === 'page-behind' ? 'block' : 'none';
    pageBehindColor.value = settings.pageBehindColor || 'dark';
    pageBehindTransparency.value = settings.pageBehindTransparency ?? 50;
    transparencyValue.textContent = `${settings.pageBehindTransparency ?? 50}%`;
    
    tiltSelect.value = settings.tiltPreset;
    customTiltOptions.style.display = settings.tiltPreset === 'custom' ? 'block' : 'none';
    updateTiltDisplay();
    updateGizmoCube();
    
    frameModeSelect.value = settings.frameMode || 'all';
    frameTheme.value = settings.frameTheme || 'light';
    frameCustomColor.value = settings.frameCustomColor || '#ffffff';
    updateFrameOptionsUI();
    
    systemTime.value = settings.systemTime || '';
    systemBattery.value = settings.systemBattery ?? 100;
    batteryValue.textContent = (settings.systemBattery ?? 100) + '%';
    systemWifi.checked = settings.systemWifi !== false;
    systemSignal.checked = settings.systemSignal !== false;
    
    browserPosition.value = settings.browserPosition || 'top';
    browserUrlInput.value = settings.browserUrl || '';
    browserShowControls.checked = settings.browserShowControls !== false;
    
    updateTiltWarning();
    
    await loadScreenshots();
    
    const tab = await getActiveTab();
    currentTabId = tab?.id || null;
    
    // Notify background of current tab
    if (panelPort && currentTabId) {
      panelPort.postMessage({ type: 'SET_TAB_ID', tabId: currentTabId });
    }
    
    const previewEnabled = togglePreview.checked;
    previewControls.classList.toggle('disabled', !previewEnabled);
    await sendToContent({ type: 'TOGGLE_PREVIEW', enabled: previewEnabled });
    
    if (previewEnabled) {
      await applyAllSettings();
    }
  }

  init();
});
