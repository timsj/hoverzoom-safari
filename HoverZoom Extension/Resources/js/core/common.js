// Hover Zoom+ Safari Port - common.js
// Adapted from original HoverZoom+ extension for Safari WebExtension API

const factorySettings = {
  extensionEnabled: true,
  zoomFactor: 1,
  maxWidth: 0,
  maxHeight: 0,
  zoomVideos: true,
  videoPositionStep: 10,
  muteVideos: false,
  videoTimestamp: false,
  videoVolume: 0.25,
  playAudio: false,
  audioVolume: 0.25,
  mouseClickHoldTime: 250,
  lockImageZoomFactorEnabled: true,
  lockImageZoomDefaultEnabled: false,
  pageActionEnabled: true,
  showHighRes: true,
  galleriesMouseWheel: true,
  galleriesLoopEnabled: true,
  disableMouseWheelForVideo: false,
  scrollWheelCooldown: 0,
  alwaysPreload: false,
  displayDelay: 100,
  displayDelayVideo: 500,
  fadeDuration: 200,
  excludedSites: [],
  whiteListMode: false,
  picturesOpacity: 1,
  showWhileLoading: true,
  mouseUnderlap: true,
  hideMouseCursor: false,
  hideMouseCursorDelay: 500,
  filterNSFW: false,
  enableGalleries: true,
  enableNoFocusMsg: false,
  viewerShadowEnabled: true,
  captionDetailShadowEnabled: true,
  ambilightEnabled: false,
  ambilightHaloSize: 0.1,
  ambilightBackgroundOpacity: 0.9,
  disabledPlugins: [],
  imagePaddingSize: 10,
  fullZoomHidesDetailsCaptions: false,
  statusBarOverlap: false,
  hScrollBarOverlap: false,
  centerImages: false,
  autoLockImages: false,
  frameBackgroundColor: "#ffffff",
  frameThickness: 4,
  belowPositionOffset: 0,
  belowPositionOffsetUnit: "percent",
  abovePositionOffset: 0,
  abovePositionOffsetUnit: "percent",
  captionOpacity: 1,
  detailsOpacity: 1,
  useClipboardNameWhenSaving: false,
  displayImageLoader: false,
  downloadFolder: "",
  addDownloadOrigin: false,
  addDownloadSize: false,
  addDownloadDuration: false,
  addDownloadIndex: false,
  addDownloadCaption: false,
  replaceOriginalFilename: false,
  downloadFilename: "",
  useSeparateTabOrWindowForUnloadableUrlsEnabled: false,
  useSeparateTabOrWindowForUnloadableUrls: "window",
  captionLocation: "none",
  detailsLocation: "none",
  showDetailFilename: true,
  showDetailHost: true,
  showDetailLastModified: true,
  showDetailExtension: true,
  showDetailContentLength: true,
  showDetailDuration: true,
  showDetailScale: true,
  showDetailRatio: true,
  showDetailDimensions: true,
  rightShortClickAndHold: false,
  middleShortClickAndHold: false,
  rightShortClick: false,
  middleShortClick: false,
  fontSize: 11,
  fontOutline: false,
  actionKey: 0,
  toggleKey: 69,
  fullZoomKey: 90,
  copyImageKey: 67,
  copyImageUrlKey: 85,
  hideKey: 88,
  openImageInWindowKey: 87,
  openImageInTabKey: 84,
  lockImageKey: 76,
  saveImageKey: 0, // unbound: saving media is not implemented in the Safari port (no downloads API)
  prevImgKey: 37,
  nextImgKey: 39,
  flipImageKey: 70,
  rotateImageKey: 82,
  closeKey: 27,
  debug: false,
};

async function migrateOptions() {
  const result = await optionsStorageGet("extensionEnabled");
  if (
    result !== undefined &&
    result !== null &&
    result.extensionEnabled !== undefined
  )
    return;
  const options =
    localStorage && localStorage.options
      ? JSON.parse(localStorage.options)
      : factorySettings;
  await optionsStorageSet(options);
}

// Load options from storage
// Return default values if none exist
async function loadOptions() {
  await migrateOptions();
  return await optionsStorageGet(factorySettings);
}

// Send options to all tabs and extension pages
function sendOptions(options) {
  var request = { action: "optionsChanged", options: options };

  // Send options to all tabs - using browser.* API for Safari
  browser.windows.getAll(null, function (windows) {
    for (var i = 0; i < windows.length; i++) {
      browser.tabs.query(
        { active: true, windowId: windows[i].id },
        function (tabs) {
          for (var j = 0; j < tabs.length; j++) {
            const tab = tabs[j];
            if (
              tab.url &&
              (tab.url.startsWith("http://") || tab.url.startsWith("https://"))
            ) {
              browser.tabs.sendMessage(tab.id, request, function (response) {
                // Ignore errors that occur when the receiving end doesn't exist
                let lastError = browser.runtime.lastError;
              });
            }
          }
        },
      );
    }
  });

  // Send options to other extension pages
  browser.runtime.sendMessage(request);
}
