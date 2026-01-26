// HoverZoom+ Safari Port - tools.js
// Adapted from original HoverZoom+ extension for Safari WebExtension API

const isChromiumBased = false; // Safari is not Chromium-based
const isSafari = true;

function slice(a) {
  return Array.prototype.slice.call(a);
}

function qs(s) {
  return document.querySelector(s);
}

function qsa(s) {
  return document.querySelectorAll(s);
}

function ce(s) {
  return document.createElement(s);
}

function ge(s) {
  return document.getElementById(s);
}

function parentNodeName(e, tag) {
  var p = e.parentNode;
  if (!p) {
    return null;
  }
  if (p && p.nodeName == tag.toUpperCase()) {
    return p;
  } else {
    return parentNodeName(p, tag);
  }
}

// Storage wrapper functions - using browser.* API for Safari
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

const optionsStorageRemove = async (keys) => {
  return new Promise((resolve, reject) => {
    browser.storage.sync.remove(keys, function () {
      resolve();
    });
  });
};

// Session storage - Safari may not support chrome.storage.session, fallback to local
const sessionStorageGet = async (keys) => {
  if (!browser.storage.session) return localStorageGet(keys);
  return new Promise((resolve, reject) => {
    browser.storage.session.get(keys, function (result) {
      resolve(result);
    });
  });
};

const sessionStorageSet = async (keys) => {
  if (!browser.storage.session) return localStorageSet(keys);
  return new Promise((resolve, reject) => {
    browser.storage.session.set(keys, function () {
      resolve();
    });
  });
};

const sessionStorageRemove = async (keys) => {
  if (!browser.storage.session) return localStorageRemove(keys);
  return new Promise((resolve, reject) => {
    browser.storage.session.remove(keys, function () {
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

const localStorageSet = async (keys) => {
  return new Promise((resolve, reject) => {
    browser.storage.local.set(keys, function () {
      resolve();
    });
  });
};

const localStorageRemove = async (keys) => {
  return new Promise((resolve, reject) => {
    browser.storage.local.remove(keys, function () {
      resolve();
    });
  });
};
