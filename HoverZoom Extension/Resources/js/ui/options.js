// Hover Zoom+ Safari Port - options.js
// Options page functionality

// Every configurable action key, in the order shown on the options page. Labels are hardcoded
// because this port's _locales only carries the extension name and description.
const actionKeys = [
  { key: "actionKey", label: "Activation key" },
  { key: "toggleKey", label: "Toggle extension" },
  { key: "closeKey", label: "Close viewer" },
  { key: "hideKey", label: "Hide viewer (hold)" },
  { key: "lockImageKey", label: "Lock viewer" },
  { key: "fullZoomKey", label: "Full zoom (hold)" },
  { key: "prevImgKey", label: "Previous image" },
  { key: "nextImgKey", label: "Next image" },
  { key: "flipImageKey", label: "Flip image" },
  { key: "rotateImageKey", label: "Rotate image" },
  { key: "copyImageKey", label: "Copy image" },
  { key: "copyImageUrlKey", label: "Copy image URL" },
  // saveImageKey is deliberately absent: Safari has no browser.downloads API, and the port has no
  // background handler for downloadFile/downloadFileBlob, so the action can only ever fail.
  // Re-add it once downloading is implemented via background fetch + a blob <a download>.
  { key: "openImageInTabKey", label: "Open image in tab" },
  { key: "openImageInWindowKey", label: "Open image in window" },
  { key: "banKey", label: "Ban image" },
];

// These actions fire while the button is held, so a short click cannot be distinguished
const noShortClick = ["actionKey", "toggleKey", "hideKey", "fullZoomKey"];

function keyChoices(key) {
  const choices = [
    [0, key === "actionKey" ? "None (always active)" : "None"],
    [-1, "Right Click (Hold)"],
    [-2, "Middle Click (Hold)"],
  ];
  if (!noShortClick.includes(key)) {
    choices.push([-3, "Right Click"], [-4, "Middle Click"]);
  }
  // Shift+click opens a new window in Safari, so it cannot be bound to the new-tab action
  if (key !== "openImageInTabKey") choices.push([16, "Shift"]);
  choices.push([17, "Ctrl"], [18, "Alt"], [13, "Enter"], [91, "Command"]);
  for (let i = 65; i < 91; i++) choices.push([i, String.fromCharCode(i)]);
  choices.push([220, "\\"]);
  for (let i = 112; i < 124; i++) choices.push([i, "F" + (i - 111)]);
  return choices.concat([
    [27, "Escape"],
    [33, "Page Up"],
    [34, "Page Down"],
    [35, "End"],
    [36, "Home"],
    [37, "Left"],
    [38, "Up"],
    [39, "Right"],
    [40, "Down"],
    [45, "Insert"],
    [46, "Delete"],
  ]);
}

function initActionKeys() {
  const container = document.getElementById("actionKeys");
  actionKeys.forEach(function ({ key, label }) {
    const row = document.createElement("div");
    row.className = "setting-row";

    const labelEl = document.createElement("label");
    labelEl.setAttribute("for", key);
    labelEl.textContent = label + ":";

    const select = document.createElement("select");
    select.id = key;
    keyChoices(key).forEach(function ([value, text]) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = text;
      select.appendChild(option);
    });

    row.appendChild(labelEl);
    row.appendChild(select);
    container.appendChild(row);
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  // Set version from manifest
  const manifest = browser.runtime.getManifest();
  document.getElementById("version").textContent = manifest.version;

  // Build the key pickers before loading, so their values can be applied
  initActionKeys();

  // Load current options
  await loadOptionsUI();

  // Bind event listeners
  document.getElementById("saveBtn").addEventListener("click", saveOptions);
  document.getElementById("resetBtn").addEventListener("click", resetOptions);

  // Update opacity value displays
  document
    .getElementById("picturesOpacity")
    .addEventListener("input", function () {
      document.getElementById("opacityValue").textContent = this.value;
    });
  document
    .getElementById("captionOpacity")
    .addEventListener("input", function () {
      document.getElementById("captionOpacityValue").textContent = this.value;
    });
  document
    .getElementById("detailsOpacity")
    .addEventListener("input", function () {
      document.getElementById("detailsOpacityValue").textContent = this.value;
    });
});

async function loadOptionsUI() {
  try {
    const options = await loadOptions();

    // General
    document.getElementById("extensionEnabled").checked =
      options.extensionEnabled !== false;
    document.getElementById("showHighRes").checked =
      options.showHighRes !== false;
    document.getElementById("zoomVideos").checked =
      options.zoomVideos !== false;
    document.getElementById("muteVideos").checked = options.muteVideos === true;

    // Display
    document.getElementById("displayDelay").value = options.displayDelay || 100;
    document.getElementById("fadeDuration").value = options.fadeDuration || 200;
    document.getElementById("zoomFactor").value = options.zoomFactor || 1;
    document.getElementById("picturesOpacity").value =
      options.picturesOpacity || 1;
    document.getElementById("opacityValue").textContent =
      options.picturesOpacity || 1;
    document.getElementById("centerImages").checked =
      options.centerImages === true;
    document.getElementById("viewerShadowEnabled").checked =
      options.viewerShadowEnabled !== false;

    // Frame & Details
    document.getElementById("frameBackgroundColor").value =
      options.frameBackgroundColor || "#ffffff";
    document.getElementById("frameThickness").value =
      options.frameThickness ?? 4;
    document.getElementById("captionLocation").value =
      options.captionLocation || "none";
    document.getElementById("captionOpacity").value =
      options.captionOpacity || 1;
    document.getElementById("captionOpacityValue").textContent =
      options.captionOpacity || 1;
    document.getElementById("detailsLocation").value =
      options.detailsLocation || "none";
    document.getElementById("detailsOpacity").value =
      options.detailsOpacity || 1;
    document.getElementById("detailsOpacityValue").textContent =
      options.detailsOpacity || 1;
    document.getElementById("showDetailFilename").checked =
      options.showDetailFilename !== false;
    document.getElementById("showDetailHost").checked =
      options.showDetailHost !== false;
    document.getElementById("showDetailDimensions").checked =
      options.showDetailDimensions !== false;
    document.getElementById("showDetailScale").checked =
      options.showDetailScale !== false;
    document.getElementById("showDetailRatio").checked =
      options.showDetailRatio !== false;
    document.getElementById("showDetailExtension").checked =
      options.showDetailExtension !== false;
    document.getElementById("showDetailContentLength").checked =
      options.showDetailContentLength !== false;
    document.getElementById("showDetailLastModified").checked =
      options.showDetailLastModified !== false;
    document.getElementById("showDetailDuration").checked =
      options.showDetailDuration !== false;
    document.getElementById("fontSize").value = options.fontSize || 11;
    document.getElementById("fontOutline").checked =
      options.fontOutline === true;

    // Behavior
    actionKeys.forEach(function ({ key }) {
      const value = options[key];
      document.getElementById(key).value =
        value === undefined ? factorySettings[key] : value;
    });
    document.getElementById("enableGalleries").checked =
      options.enableGalleries !== false;
    document.getElementById("galleriesMouseWheel").checked =
      options.galleriesMouseWheel !== false;
    document.getElementById("mouseUnderlap").checked =
      options.mouseUnderlap !== false;

    // Excluded Sites
    document.getElementById("whiteListMode").checked =
      options.whiteListMode === true;
    document.getElementById("excludedSites").value = (
      options.excludedSites || []
    ).join("\n");

    // Advanced
    document.getElementById("maxWidth").value = options.maxWidth || 0;
    document.getElementById("maxHeight").value = options.maxHeight || 0;
    document.getElementById("debug").checked = options.debug === true;
  } catch (error) {
    console.error("Error loading options:", error);
  }
}

// Entries are matched against a url's hostname alone, so reduce whatever was pasted to that:
// a full url, a bare domain and a fragment like "tiktok" all have to end up comparable.
function normalizeExcludedSite(entry) {
  return entry
    .trim()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//i, "") // scheme
    .replace(/^www\./i, "") // matching is a substring test, so www. only narrows it
    .replace(/[/?#].*$/, "") // path, query, fragment
    .replace(/:\d+$/, "") // port
    .toLowerCase(); // hostname is always lowercase
}

async function saveOptions() {
  try {
    // Parse excluded sites
    const excludedSitesText = document.getElementById("excludedSites").value;
    const excludedSites = [
      ...new Set(
        excludedSitesText
          .split("\n")
          .map(normalizeExcludedSite)
          .filter((s) => s.length > 0),
      ),
    ];

    const options = {
      // General
      extensionEnabled: document.getElementById("extensionEnabled").checked,
      showHighRes: document.getElementById("showHighRes").checked,
      zoomVideos: document.getElementById("zoomVideos").checked,
      muteVideos: document.getElementById("muteVideos").checked,

      // Display
      displayDelay:
        parseInt(document.getElementById("displayDelay").value) || 100,
      fadeDuration:
        parseInt(document.getElementById("fadeDuration").value) || 200,
      zoomFactor: parseFloat(document.getElementById("zoomFactor").value) || 1,
      picturesOpacity:
        parseFloat(document.getElementById("picturesOpacity").value) || 1,
      centerImages: document.getElementById("centerImages").checked,
      viewerShadowEnabled: document.getElementById("viewerShadowEnabled")
        .checked,

      // Frame & Details
      frameBackgroundColor: document.getElementById("frameBackgroundColor")
        .value,
      frameThickness:
        parseInt(document.getElementById("frameThickness").value) ?? 4,
      captionLocation: document.getElementById("captionLocation").value,
      captionOpacity:
        parseFloat(document.getElementById("captionOpacity").value) || 1,
      detailsLocation: document.getElementById("detailsLocation").value,
      detailsOpacity:
        parseFloat(document.getElementById("detailsOpacity").value) || 1,
      showDetailFilename: document.getElementById("showDetailFilename").checked,
      showDetailHost: document.getElementById("showDetailHost").checked,
      showDetailDimensions: document.getElementById("showDetailDimensions")
        .checked,
      showDetailScale: document.getElementById("showDetailScale").checked,
      showDetailRatio: document.getElementById("showDetailRatio").checked,
      showDetailExtension: document.getElementById("showDetailExtension")
        .checked,
      showDetailContentLength: document.getElementById(
        "showDetailContentLength",
      ).checked,
      showDetailLastModified: document.getElementById("showDetailLastModified")
        .checked,
      showDetailDuration: document.getElementById("showDetailDuration").checked,
      fontSize: parseInt(document.getElementById("fontSize").value) || 11,
      fontOutline: document.getElementById("fontOutline").checked,

      // Behavior (action keys are added below)
      enableGalleries: document.getElementById("enableGalleries").checked,
      galleriesMouseWheel: document.getElementById("galleriesMouseWheel")
        .checked,
      mouseUnderlap: document.getElementById("mouseUnderlap").checked,

      // Excluded Sites
      whiteListMode: document.getElementById("whiteListMode").checked,
      excludedSites: excludedSites,

      // Advanced
      maxWidth: parseInt(document.getElementById("maxWidth").value) || 0,
      maxHeight: parseInt(document.getElementById("maxHeight").value) || 0,
      debug: document.getElementById("debug").checked,
    };

    // Action keys, plus the mouse-button flags the core derives from them. When the same button
    // is bound twice, the second binding becomes the click-and-hold variant.
    let rightButtonActive = false;
    let middleButtonActive = false;
    options.rightShortClick = false;
    options.middleShortClick = false;
    options.rightShortClickAndHold = false;
    options.middleShortClickAndHold = false;

    actionKeys.forEach(function ({ key }) {
      options[key] = parseInt(document.getElementById(key).value) || 0;

      switch (options[key]) {
        case -3:
          options.rightShortClick = true;
        // falls through: a short right click is also a right-button binding
        case -1:
          if (rightButtonActive) options.rightShortClickAndHold = true;
          else rightButtonActive = true;
          break;
        case -4:
          options.middleShortClick = true;
        // falls through: a short middle click is also a middle-button binding
        case -2:
          if (middleButtonActive) options.middleShortClickAndHold = true;
          else middleButtonActive = true;
          break;
      }
    });

    await browser.storage.sync.set(options);

    // Notify all tabs about the change
    sendOptions(options);

    // Show success message
    showStatus("Options saved! Please refresh page(s) to see updates.");
  } catch (error) {
    console.error("Error saving options:", error);
    showStatus("Error saving options");
  }
}

async function resetOptions() {
  if (!confirm("Reset all options to defaults?")) {
    return;
  }

  try {
    await browser.storage.sync.clear();
    await browser.storage.sync.set(factorySettings);
    await loadOptionsUI();
    showStatus("Options reset to defaults!");
  } catch (error) {
    console.error("Error resetting options:", error);
    showStatus("Error resetting options");
  }
}

function showStatus(message) {
  const statusMsg = document.getElementById("statusMsg");
  statusMsg.textContent = message;
  statusMsg.classList.add("show");
  setTimeout(() => {
    statusMsg.classList.remove("show");
  }, 4000);
}
