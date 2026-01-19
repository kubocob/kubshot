chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ tabId: tab.id });
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'panel') {
    port.onDisconnect.addListener(async () => {
      try {
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
          if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
            continue;
          }
          try {
            await chrome.tabs.sendMessage(tab.id, { type: 'CLEANUP' });
          } catch (e) {}
        }
      } catch (e) {}
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
});
