// HoverZoom+ Safari Port - popup.js
// Popup script for the toolbar button

document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("enableToggle");
  const statusText = document.getElementById("statusText");
  const optionsBtn = document.getElementById("optionsBtn");

  // Open options page
  optionsBtn.addEventListener("click", function () {
    browser.runtime.openOptionsPage();
  });

  // Load current state
  browser.storage.sync.get({ extensionEnabled: true }, function (result) {
    toggle.checked = result.extensionEnabled;
    updateStatusText(result.extensionEnabled);
  });

  // Handle toggle changes
  toggle.addEventListener("change", function () {
    const enabled = toggle.checked;
    browser.storage.sync.set({ extensionEnabled: enabled }, function () {
      updateStatusText(enabled);

      // Notify all tabs about the change
      browser.tabs.query({}, function (tabs) {
        tabs.forEach(function (tab) {
          if (tab.url && (tab.url.startsWith("http://") || tab.url.startsWith("https://"))) {
            browser.tabs
              .sendMessage(tab.id, {
                action: "optionsChanged",
                options: { extensionEnabled: enabled },
              })
              .catch(() => {
                // Ignore errors for tabs that don't have the content script
              });
          }
        });
      });
    });
  });

  function updateStatusText(enabled) {
    statusText.textContent = enabled ? "Enabled" : "Disabled";
  }
});
