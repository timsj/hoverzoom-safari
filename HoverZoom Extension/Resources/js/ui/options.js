// HoverZoom+ Safari Port - options.js
// Options page functionality

document.addEventListener("DOMContentLoaded", async function () {
  // Set version from manifest
  const manifest = browser.runtime.getManifest();
  document.getElementById("version").textContent = manifest.version;

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
    document.getElementById("actionKey").value = options.actionKey || 0;
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

async function saveOptions() {
  try {
    // Parse excluded sites
    const excludedSitesText = document.getElementById("excludedSites").value;
    const excludedSites = excludedSitesText
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

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

      // Behavior
      actionKey: parseInt(document.getElementById("actionKey").value) || 0,
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
