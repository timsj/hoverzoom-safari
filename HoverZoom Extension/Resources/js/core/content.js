// HoverZoom+ Safari Port - content.js
// Content script initialization for Safari WebExtension

// The hoverzoom.js file auto-initializes by calling hoverZoom.loadHoverZoom() at the end
// This file handles any additional initialization needed

// Listen for messages from the background script
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "optionsChanged" && typeof hoverZoom !== "undefined") {
    // Options were changed, the hoverzoom.js handles this internally
    console.log("HoverZoom+: Options updated");
  }
});

// Log that the extension is loaded
console.log("HoverZoom+ for Safari: Content script loaded");
