// Hover Zoom+ Safari Port - tools.js
// Adapted from original HoverZoom+ extension for Safari WebExtension API

const optionsStorageGet = async (keys) => {
  return new Promise((resolve, reject) => {
    browser.storage.sync.get(keys, function (result) {
      resolve(result);
    });
  });
};

const optionsStorageSet = async (keys) => {
  return new Promise((resolve, reject) => {
    browser.storage.sync.set(keys, function () {
      resolve();
    });
  });
};

const localStorageGet = async (keys) => {
  return new Promise((resolve, reject) => {
    browser.storage.local.get(keys, function (result) {
      resolve(result);
    });
  });
};

// Safari may not support browser.storage.session, fallback to local
const sessionStorageGet = async (keys) => {
  if (!browser.storage.session) return localStorageGet(keys);
  return new Promise((resolve, reject) => {
    browser.storage.session.get(keys, function (result) {
      resolve(result);
    });
  });
};
