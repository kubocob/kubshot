(() => {
  if (window.__kubshotInjected) return;
  window.__kubshotInjected = true;

  let previewEnabled = false;
  let currentDevice = null;
  let currentOrientation = 'portrait';
  let currentDeviceType = 'phone';
  let overlayElements = null;
  let currentSystemBar = { enabled: false, time: '9:41', battery: 100, showWifi: true, showSignal: true };
  let currentBrowserFrame = { frame: 'none', url: 'example.com', position: 'top', showControls: false };

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    
    if (message.type === 'TOGGLE_PREVIEW') {
      togglePreview(message.enabled);
      sendResponse({ success: true });
    }
    if (message.type === 'SET_DEVICE') {
      setDevice(message.device, message.orientation);
      sendResponse({ success: true });
    }
    if (message.type === 'GET_STATE') {
      sendResponse({ enabled: previewEnabled, device: currentDevice });
    }
    if (message.type === 'SET_BACKGROUND') {
      setBackground(message.background, message.mode);
      sendResponse({ success: true });
    }
    if (message.type === 'SET_TILT') {
      setTilt(message.tilt);
      sendResponse({ success: true });
    }
    if (message.type === 'SET_SYSTEM_BAR') {
      setSystemBar(message.enabled, message.time, message.battery, message.showWifi, message.showSignal, message.themeColor, message.isDark);
      sendResponse({ success: true });
    }
    if (message.type === 'SET_BROWSER_FRAME') {
      setBrowserFrame(message.frame, message.url, message.position, message.showControls, message.themeColor, message.isDark);
      sendResponse({ success: true });
    }
    if (message.type === 'HIDE_OVERLAY') {
      if (overlayElements) {
        overlayElements.container.style.display = 'none';
      }
      sendResponse({ success: true });
    }
    if (message.type === 'SHOW_OVERLAY') {
      if (overlayElements) {
        overlayElements.container.style.display = 'flex';
      }
      sendResponse({ success: true });
    }
    if (message.type === 'RENDER_TILTED_IMAGE') {
      renderTiltedImage(message.imageDataUrl, message.tilt).then(bounds => {
        sendResponse({ success: true, bounds: bounds });
      });
      return true; // Keep channel open for async response
    }
    if (message.type === 'REMOVE_TILTED_IMAGE') {
      removeTiltedImage();
      sendResponse({ success: true });
    }
    if (message.type === 'PREPARE_CAPTURE') {
      sendResponse({ success: true });
    }
    if (message.type === 'RESTORE_AFTER_CAPTURE') {
      setBackground(message.background, message.mode);
      sendResponse({ success: true });
    }
    if (message.type === 'GET_DEVICE_BOUNDS') {
      if (overlayElements) {
        const rect = overlayElements.deviceWrapper.getBoundingClientRect();
        sendResponse({ 
          success: true, 
          bounds: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          }
        });
      } else {
        sendResponse({ success: false });
      }
    }
    if (message.type === 'CLEANUP') {
      removeOverlay();
      previewEnabled = false;
      currentDevice = null;
      sendResponse({ success: true });
    }
    if (message.type === 'GET_SCREEN_BOUNDS') {
      if (overlayElements) {
        const rect = overlayElements.screen.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        sendResponse({ 
          success: true, 
          bounds: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          dpr: dpr
        });
      } else {
        sendResponse({ success: false });
      }
    }
    return true;
  });

  let tiltedImageContainer = null;

  function renderTiltedImage(imageDataUrl, tilt) {
    return new Promise((resolve) => {
      removeTiltedImage();
      
      const perspective = tilt.perspective || 1000;
      
      // Hide the main overlay
      if (overlayElements) {
        overlayElements.container.style.display = 'none';
      }
      
      // Create container for tilted image with a specific chroma key background
      // Using #01FE01 - a very specific green that won't appear in normal content
      tiltedImageContainer = document.createElement('div');
      tiltedImageContainer.id = 'dp-tilted-capture';
      tiltedImageContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        perspective: ${perspective}px;
        background: #01FE01;
        overflow: hidden;
      `;
      
      // Create a wrapper to handle scaling
      const wrapper = document.createElement('div');
      wrapper.id = 'dp-tilted-wrapper';
      wrapper.style.cssText = `
        transform: rotateX(${tilt.x || 0}deg) rotateY(${tilt.y || 0}deg) rotateZ(${tilt.z || 0}deg);
        transform-style: preserve-3d;
      `;
      
      const img = document.createElement('img');
      img.id = 'dp-tilted-image';
      img.style.cssText = `
        max-width: none;
        max-height: none;
        display: block;
      `;
      
      img.onload = () => {
        // Wait for initial render
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Check if the tilted image fits in the viewport
            let rect = wrapper.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const margin = 20;
            
            // Calculate scale factor to fit within viewport with margin
            let scale = 1;
            if (rect.x < margin || rect.y < margin || 
                rect.x + rect.width > viewportWidth - margin || 
                rect.y + rect.height > viewportHeight - margin) {
              
              const scaleX = (viewportWidth - margin * 2) / rect.width;
              const scaleY = (viewportHeight - margin * 2) / rect.height;
              scale = Math.min(scaleX, scaleY, 1);
              
              // Apply scale to image
              img.style.transform = `scale(${scale})`;
              
              // Wait for re-render after scaling
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  rect = wrapper.getBoundingClientRect();
                  resolve({
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height,
                    scale: scale
                  });
                });
              });
            } else {
              resolve({
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                scale: 1
              });
            }
          });
        });
      };
      
      img.onerror = () => {
        resolve(null);
      };
      
      img.src = imageDataUrl;
      wrapper.appendChild(img);
      tiltedImageContainer.appendChild(wrapper);
      document.body.appendChild(tiltedImageContainer);
    });
  }

  function removeTiltedImage() {
    if (tiltedImageContainer) {
      tiltedImageContainer.remove();
      tiltedImageContainer = null;
    }
    // Show the main overlay again
    if (overlayElements) {
      overlayElements.container.style.display = 'flex';
    }
  }

  function createOverlay() {
    removeOverlay();
    
    const container = document.createElement('div');
    container.id = 'dp-overlay-container';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 2147483647;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    const background = document.createElement('div');
    background.id = 'dp-background';
    background.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(30, 30, 30, 0.95);
      pointer-events: auto;
    `;
    
    const deviceWrapper = document.createElement('div');
    deviceWrapper.id = 'dp-device-wrapper';
    deviceWrapper.style.cssText = `
      position: relative;
      z-index: 10;
      transition: transform 0.3s ease;
    `;
    
    const deviceFrame = document.createElement('div');
    deviceFrame.id = 'dp-device-frame';
    deviceFrame.style.cssText = `
      position: relative;
      width: fit-content;
      height: fit-content;
      background: linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 50%, #0d0d0d 100%);
      border-radius: 44px;
      padding: 14px;
      box-shadow: 
        0 50px 100px -20px rgba(0, 0, 0, 0.8),
        0 30px 60px -30px rgba(0, 0, 0, 0.6),
        inset 0 1px 1px rgba(255, 255, 255, 0.1),
        inset 0 -1px 1px rgba(0, 0, 0, 0.5);
    `;
    
    const powerButton = document.createElement('div');
    powerButton.style.cssText = `
      position: absolute;
      right: -2px;
      top: 120px;
      width: 3px;
      height: 80px;
      background: linear-gradient(90deg, #1a1a1a, #333);
      border-radius: 0 2px 2px 0;
    `;
    
    const volumeUp = document.createElement('div');
    volumeUp.style.cssText = `
      position: absolute;
      left: -2px;
      top: 100px;
      width: 3px;
      height: 40px;
      background: linear-gradient(90deg, #333, #1a1a1a);
      border-radius: 2px 0 0 2px;
    `;
    
    const volumeDown = document.createElement('div');
    volumeDown.style.cssText = `
      position: absolute;
      left: -2px;
      top: 150px;
      width: 3px;
      height: 40px;
      background: linear-gradient(90deg, #333, #1a1a1a);
      border-radius: 2px 0 0 2px;
    `;
    
    const screen = document.createElement('div');
    screen.id = 'dp-screen';
    screen.style.cssText = `
      position: relative;
      width: fit-content;
      height: fit-content;
      background: #000;
      border-radius: 32px;
      overflow: hidden;
    `;
    
    const viewport = document.createElement('div');
    viewport.id = 'dp-viewport';
    viewport.style.cssText = `
      position: relative;
      background: transparent;
      overflow: hidden;
      border-radius: 32px;
      z-index: 1;
    `;
    
    const iframe = document.createElement('iframe');
    iframe.id = 'dp-iframe';
    iframe.style.cssText = `
      border: none;
      background: white;
      pointer-events: auto;
      width: 100%;
      height: 100%;
    `;
    iframe.src = window.location.href;
    
    const frameBlockedWarning = document.createElement('div');
    frameBlockedWarning.id = 'dp-frame-blocked';
    frameBlockedWarning.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 10px 16px;
      display: none;
      align-items: center;
      gap: 10px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #fff;
      z-index: 100;
      backdrop-filter: blur(10px);
      max-width: 400px;
    `;
    frameBlockedWarning.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" style="flex-shrink: 0;">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span style="font-size: 13px; color: #ccc;"> This page has restricted iframe embedding. Kubshot uses iframes and respects the site's security settings.</span>
    `;
    
    fetch(window.location.href, { method: 'HEAD' })
      .then(res => {
        const xfo = res.headers.get('x-frame-options');
        const csp = res.headers.get('content-security-policy');
        const xfoBlocks = xfo && xfo.toLowerCase() === 'deny';
        const cspBlocks = csp && csp.includes('frame-ancestors') && csp.includes("frame-ancestors 'none'");
        if (xfoBlocks || cspBlocks) {
          frameBlockedWarning.style.display = 'flex';
        }
      })
      .catch(() => {});
    
    const notch = document.createElement('div');
    notch.id = 'dp-notch';
    notch.style.cssText = `
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 130px;
      height: 32px;
      background: #1a1a1a;
      border-radius: 0 0 18px 18px;
      z-index: 100;
      display: none;
    `;
    
    const speaker = document.createElement('div');
    speaker.style.cssText = `
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      width: 50px;
      height: 5px;
      background: #333;
      border-radius: 3px;
    `;
    notch.appendChild(speaker);
    
    const camera = document.createElement('div');
    camera.style.cssText = `
      position: absolute;
      top: 10px;
      right: 20px;
      width: 10px;
      height: 10px;
      background: radial-gradient(circle, #1a3a5c 30%, #0a1520 100%);
      border-radius: 50%;
    `;
    notch.appendChild(camera);
    
    const homeIndicator = document.createElement('div');
    homeIndicator.id = 'dp-home-indicator';
    homeIndicator.style.cssText = `
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 5px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 3px;
      z-index: 100;
    `;
    
    viewport.appendChild(iframe);
    screen.appendChild(viewport);
    screen.appendChild(notch);
    screen.appendChild(homeIndicator);
    deviceFrame.appendChild(screen);
    deviceFrame.appendChild(powerButton);
    deviceFrame.appendChild(volumeUp);
    deviceFrame.appendChild(volumeDown);
    deviceWrapper.appendChild(deviceFrame);
    container.appendChild(background);
    container.appendChild(deviceWrapper);
    container.appendChild(frameBlockedWarning);
    
    document.body.appendChild(container);
    
    overlayElements = {
      container,
      background,
      deviceWrapper,
      deviceFrame,
      screen,
      viewport,
      iframe,
      notch,
      homeIndicator
    };
    
    return overlayElements;
  }
  
  function removeOverlay() {
    const existing = document.getElementById('dp-overlay-container');
    if (existing) {
      existing.remove();
    }
    overlayElements = null;
  }

  function togglePreview(enabled) {
    previewEnabled = enabled;
    
    if (enabled) {
      overlayElements = createOverlay();
      
      if (currentDevice) {
        applyDeviceDimensions(currentDevice, currentOrientation);
      } else {
        setDevice({
          id: 'phone-medium',
          name: 'Medium Phone',
          width: 390,
          height: 844
        }, 'portrait');
      }
      setSystemBar(
        currentSystemBar.enabled, 
        currentSystemBar.time, 
        currentSystemBar.battery, 
        currentSystemBar.showWifi, 
        currentSystemBar.showSignal
      );
      setBrowserFrame(
        currentBrowserFrame.frame, 
        currentBrowserFrame.url, 
        currentBrowserFrame.position,
        currentBrowserFrame.showControls
      );
    } else {
      removeOverlay();
    }
  }

  function setDevice(device, orientation) {
    currentDevice = device;
    currentOrientation = orientation || 'portrait';
    currentDeviceType = device?.id === 'tablet' ? 'tablet' : 'phone';
    if (previewEnabled && overlayElements) {
      applyDeviceDimensions(device, currentOrientation);
      updateViewportPosition();
    }
  }

  function applyDeviceDimensions(device, orientation) {
    if (!overlayElements || !device) return;
    
    const { deviceFrame, screen, viewport, homeIndicator, notch } = overlayElements;
    
    const isTablet = currentDeviceType === 'tablet';
    const isPhone = currentDeviceType === 'phone';
    
    let padding, borderRadius, screenRadius;
    
    if (isTablet) {
      padding = 16;
      borderRadius = 30;
      screenRadius = 20;
    } else {
      padding = 14;
      borderRadius = 44;
      screenRadius = 32;
    }
    
    const frameBackground = 'linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 50%, #0d0d0d 100%)';
    const frameShadow = `
      0 50px 100px -20px rgba(0, 0, 0, 0.8),
      0 30px 60px -30px rgba(0, 0, 0, 0.6),
      inset 0 1px 1px rgba(255, 255, 255, 0.1),
      inset 0 -1px 1px rgba(0, 0, 0, 0.5)
    `;
    
    deviceFrame.style.padding = `${padding}px`;
    deviceFrame.style.border = 'none';
    deviceFrame.style.borderRadius = `${borderRadius}px`;
    deviceFrame.style.background = frameBackground;
    deviceFrame.style.boxShadow = frameShadow;
    screen.style.width = `${device.width}px`;
    screen.style.height = `${device.height}px`; 
    screen.style.borderRadius = `${screenRadius}px`;
   
    viewport.style.width = `${device.width}px`;
    viewport.style.height = `${device.height}px`;
    viewport.style.borderRadius = `${screenRadius}px`;
    
    homeIndicator.style.display = 'block';
    homeIndicator.style.width = `${Math.min(120, device.width * 0.35)}px`;
    
    const isLandscape = orientation === 'landscape';
    
    if (notch) {
      const speaker = notch.querySelector('div:first-child');
      const camera = notch.querySelector('div:last-child');
      
      if (isLandscape) {
        notch.style.top = '50%';
        notch.style.left = '0';
        notch.style.transform = 'translateY(-50%)';
        notch.style.width = '32px';
        notch.style.height = '130px';
        notch.style.borderRadius = '0 18px 18px 0';
        
        if (speaker) {
          speaker.style.cssText = `
            position: absolute;
            top: 50%;
            left: 12px;
            transform: translateY(-50%);
            width: 5px;
            height: 50px;
            background: #333;
            border-radius: 3px;
          `;
        }
        if (camera) {
          camera.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 11px;
            width: 10px;
            height: 10px;
            background: radial-gradient(circle, #1a3a5c 30%, #0a1520 100%);
            border-radius: 50%;
          `;
        }
      } else {
        notch.style.top = '0';
        notch.style.left = '50%';
        notch.style.transform = 'translateX(-50%)';
        notch.style.width = '130px';
        notch.style.height = '32px';
        notch.style.borderRadius = '0 0 18px 18px';
        
        if (speaker) {
          speaker.style.cssText = `
            position: absolute;
            top: 12px;
            left: 50%;
            transform: translateX(-50%);
            width: 50px;
            height: 5px;
            background: #333;
            border-radius: 3px;
          `;
        }
        if (camera) {
          camera.style.cssText = `
            position: absolute;
            top: 10px;
            right: 20px;
            width: 10px;
            height: 10px;
            background: radial-gradient(circle, #1a3a5c 30%, #0a1520 100%);
            border-radius: 50%;
          `;
        }
      }
    }
    
    const powerButton = deviceFrame.querySelector('div:nth-child(2)');
    const volumeUp = deviceFrame.querySelector('div:nth-child(3)');
    const volumeDown = deviceFrame.querySelector('div:nth-child(4)');
    
    if (powerButton) powerButton.style.display = 'block';
    if (volumeUp) volumeUp.style.display = isPhone ? 'block' : 'none';
    if (volumeDown) volumeDown.style.display = isPhone ? 'block' : 'none';
  }

  function setBackground(background, mode) {
    if (!overlayElements) return;
    
    if (mode === 'no-background') {
      overlayElements.background.style.background = `
        repeating-conic-gradient(#404040 0% 25%, #2a2a2a 0% 50%) 
        50% / 20px 20px
      `;
    } else {
      overlayElements.background.style.background = background;
    }
  }

  function setTilt(tilt) {
    if (!overlayElements) return;
    overlayElements.deviceWrapper.style.transform = tilt;
  }

  const SYSTEM_BAR_HEIGHT = 32;
  const BROWSER_BAR_HEIGHT = 44;

  const BROWSER_STYLES = {
    'light': { bg: '#ffffff', text: '#5f6368', urlBg: '#f1f3f4', border: '#dadce0', accent: '#5f6368' },
    'dark': { bg: '#202124', text: '#9aa0a6', urlBg: '#303134', border: '#3c4043', accent: '#9aa0a6' }
  };

  let currentFrameTheme = { color: '#ffffff', isDark: false };

  function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  function setSystemBar(enabled, time, battery, showWifi, showSignal, themeColor, isDark) {
    const displayTime = (!time || time === '') ? getCurrentTime() : time;
    currentSystemBar = { 
      enabled, 
      time: displayTime, 
      battery: battery ?? 100, 
      showWifi: showWifi ?? true, 
      showSignal: showSignal ?? true 
    };
    
    if (themeColor !== undefined) {
      currentFrameTheme = { color: themeColor, isDark: isDark };
    }
    
    if (!overlayElements) return;
    
    const existingBar = document.getElementById('dp-system-bar');
    if (existingBar) existingBar.remove();
    
    const showNotch = currentDevice?.showNotch;
    const isPhone = currentDeviceType === 'phone';
    
    if (overlayElements.notch) {
      overlayElements.notch.style.display = (showNotch && isPhone) ? 'block' : 'none';
    }
    
    if (!enabled) {
      updateViewportPosition();
      return;
    }
    
    const bgColor = currentFrameTheme.color;
    const textColor = currentFrameTheme.isDark ? '#ffffff' : '#000000';
    
    const systemBar = document.createElement('div');
    systemBar.id = 'dp-system-bar';
    systemBar.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: ${SYSTEM_BAR_HEIGHT}px;
      background: ${bgColor};
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: ${textColor};
      z-index: 70;
      box-sizing: border-box;
    `;
    
    const leftSide = document.createElement('div');
    leftSide.style.cssText = `display: flex; align-items: center; min-width: 54px;`;
    leftSide.innerHTML = `<span style="font-size: 14px; font-weight: 600;">${currentSystemBar.time}</span>`;
    
    const rightSide = document.createElement('div');
    rightSide.style.cssText = `display: flex; align-items: center; gap: 5px;`;
    
    const iconColor = textColor;
    let iconsHtml = '';
    if (currentSystemBar.showSignal) {
      iconsHtml += `<svg width="17" height="10" viewBox="0 0 17 10" fill="${iconColor}">
        <rect x="0" y="6" width="3" height="4" rx="0.5"/>
        <rect x="4.5" y="4" width="3" height="6" rx="0.5"/>
        <rect x="9" y="2" width="3" height="8" rx="0.5"/>
        <rect x="13.5" y="0" width="3" height="10" rx="0.5"/>
      </svg>`;
    }
    if (currentSystemBar.showWifi) {
      iconsHtml += `<svg width="15" height="11" viewBox="0 0 16 12" fill="${iconColor}">
        <path d="M8 2.4C10.7 2.4 13.1 3.5 14.8 5.2L16 4C13.9 1.9 11.1 0.6 8 0.6C4.9 0.6 2.1 1.9 0 4L1.2 5.2C2.9 3.5 5.3 2.4 8 2.4Z"/>
        <path d="M8 5.5C9.9 5.5 11.6 6.3 12.8 7.5L14 6.3C12.4 4.8 10.3 3.8 8 3.8C5.7 3.8 3.6 4.8 2 6.3L3.2 7.5C4.4 6.3 6.1 5.5 8 5.5Z"/>
        <path d="M8 8.6C9.1 8.6 10.1 9 10.9 9.8L12 8.7C10.9 7.6 9.5 6.9 8 6.9C6.5 6.9 5.1 7.6 4 8.7L5.1 9.8C5.9 9 6.9 8.6 8 8.6Z"/>
        <circle cx="8" cy="11" r="1.5"/>
      </svg>`;
    }
    
    const batteryPercent = Math.min(100, Math.max(0, currentSystemBar.battery));
    const batteryFill = batteryPercent <= 20 ? '#ff3b30' : '#34c759';
    const batteryStroke = currentFrameTheme.isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
    iconsHtml += `
      <svg width="25" height="11" viewBox="0 0 27 13">
        <rect x="0" y="0.5" width="23" height="12" rx="3" stroke="${batteryStroke}" stroke-width="1" fill="none"/>
        <rect x="2" y="2.5" width="${(batteryPercent / 100) * 19}" height="8" rx="1.5" fill="${batteryFill}"/>
        <path d="M24.5 4.5v4a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2z" fill="${batteryStroke}"/>
      </svg>
    `;
    
    rightSide.innerHTML = iconsHtml;
    
    systemBar.appendChild(leftSide);
    systemBar.appendChild(rightSide);
    
    overlayElements.screen.insertBefore(systemBar, overlayElements.screen.firstChild);
    
    updateViewportPosition();
  }

  function setBrowserFrame(frame, url, position, showControls, themeColor, isDark) {
    const displayUrl = url || window.location.hostname;
    currentBrowserFrame = { frame, url: displayUrl, position: position || 'top', showControls };
    
    if (themeColor !== undefined) {
      currentFrameTheme = { color: themeColor, isDark: isDark };
    }
    
    if (!overlayElements) {
      return;
    }
    
    const existingFrame = document.getElementById('dp-browser-bar');
    if (existingFrame) existingFrame.remove();
    
    if (frame === 'none') {
      updateViewportPosition();
      return;
    }
    
    const bgColor = currentFrameTheme.color;
    const textColor = currentFrameTheme.isDark ? '#9aa0a6' : '#5f6368';
    const urlBgColor = currentFrameTheme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
    const accentColor = textColor;
    
    const isBottom = position === 'bottom';
    
    const browserBar = document.createElement('div');
    browserBar.id = 'dp-browser-bar';
    browserBar.style.cssText = `
      position: absolute;
      ${isBottom ? 'bottom: 0;' : ''}
      left: 0;
      right: 0;
      height: ${BROWSER_BAR_HEIGHT}px;
      background: ${bgColor};
      display: flex;
      align-items: center;
      padding: 4px 8px;
      gap: 4px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      z-index: 55;
      box-sizing: border-box;
    `;
    
    if (!isBottom) {
      const systemBar = document.getElementById('dp-system-bar');
      const topOffset = systemBar ? SYSTEM_BAR_HEIGHT : 0;
      browserBar.style.top = `${topOffset}px`;
    }
    
    const searchIcon = document.createElement('div');
    searchIcon.style.cssText = `
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${accentColor};
      flex-shrink: 0;
    `;
    searchIcon.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
    `;
    if (showControls) {
      browserBar.appendChild(searchIcon);
    }
    
    const urlBar = document.createElement('div');
    urlBar.style.cssText = `
      flex: 1;
      padding: 6px 12px;
      background: ${urlBgColor};
      border-radius: 20px;
      color: ${textColor};
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 6px;
      overflow: hidden;
      margin: 0 8px;
    `;
    
    urlBar.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="${accentColor}" style="flex-shrink: 0;">
        <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4z"/>
      </svg>
      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${displayUrl}</span>
    `;
    browserBar.appendChild(urlBar);
    
    if (showControls) {
      const rightIcons = document.createElement('div');
      rightIcons.style.cssText = `
        display: flex;
        align-items: center;
        gap: 16px;
        color: ${accentColor};
        flex-shrink: 0;
      `;
      
      rightIcons.innerHTML += `
        <div style="position: relative; width: 20px; height: 20px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
          </svg>
          <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 10px; font-weight: 600;">1</span>
        </div>
      `;
      
      rightIcons.innerHTML += `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2"/>
          <circle cx="12" cy="12" r="2"/>
          <circle cx="12" cy="19" r="2"/>
        </svg>
      `;
      
      browserBar.appendChild(rightIcons);
    }
    
    overlayElements.screen.appendChild(browserBar);
    
    if (currentSystemBar.enabled) {
      const systemBarData = { ...currentSystemBar };
      setSystemBar(
        systemBarData.enabled,
        systemBarData.time,
        systemBarData.battery,
        systemBarData.showWifi,
        systemBarData.showSignal
      );
    }
    
    updateViewportPosition();
  }

  function updateViewportPosition() {
    if (!overlayElements) return;
    
    const systemBar = document.getElementById('dp-system-bar');
    const browserBar = document.getElementById('dp-browser-bar');
    
    let topOffset = 0;
    let bottomOffset = 0;
    
    if (systemBar) {
      topOffset += SYSTEM_BAR_HEIGHT;
    }
    
    if (browserBar) {
      const isBottom = currentBrowserFrame.position === 'bottom';
      if (isBottom) {
        bottomOffset += BROWSER_BAR_HEIGHT;
      } else {
        topOffset += BROWSER_BAR_HEIGHT;
      }
    }
    
    overlayElements.viewport.style.position = 'absolute';
    overlayElements.viewport.style.top = `${topOffset}px`;
    overlayElements.viewport.style.left = '0';
    overlayElements.viewport.style.right = '0';
    overlayElements.viewport.style.bottom = `${bottomOffset}px`;
    overlayElements.viewport.style.width = 'auto';
    overlayElements.viewport.style.height = `calc(100% - ${topOffset + bottomOffset}px)`;
    
    const hasTopBar = systemBar || (browserBar && currentBrowserFrame.position !== 'bottom');
    const hasBottomBar = browserBar && currentBrowserFrame.position === 'bottom';
    
    const isTablet = currentDeviceType === 'tablet';
    const screenRadius = isTablet ? 20 : 32;
    
    const topRadius = hasTopBar ? '0' : `${screenRadius}px`;
    const bottomRadius = hasBottomBar ? '0' : `${screenRadius}px`;
    overlayElements.viewport.style.borderRadius = `${topRadius} ${topRadius} ${bottomRadius} ${bottomRadius}`;
  }
})();
