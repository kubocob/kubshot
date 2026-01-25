// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ tabId: tab.id });
});

// Track which tab the panel is connected to
let connectedTabId = null;

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'panel') {
    // Panel connected - store the tab ID from the port's sender
    port.onMessage.addListener((message) => {
      if (message.type === 'SET_TAB_ID') {
        connectedTabId = message.tabId;
      }
    });
    
    port.onDisconnect.addListener(async () => {
      // Panel disconnected - cleanup only the connected tab
      if (connectedTabId) {
        try {
          await chrome.tabs.sendMessage(connectedTabId, { type: 'CLEANUP' });
        } catch (e) {
          // Tab might be closed or not have content script
        }
        connectedTabId = null;
      }
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CAPTURE_TAB') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      sendResponse({ dataUrl });
    });
    return true;
  }
  
  if (message.type === 'GET_CONNECTED_TAB') {
    sendResponse({ tabId: connectedTabId });
    return true;
  }
});
