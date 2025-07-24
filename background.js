chrome.action.onClicked.addListener((tab) => {
  // get current active tab, check if it's seatalkweb.com
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;

    const currentTab = tabs[0];
    if (
      !currentTab.id ||
      !currentTab.url ||
      !currentTab.url.includes('seatalkweb.com')
    ) {
      return;
    }

    chrome.sidePanel.open({ tabId: currentTab.id });
  });
});
