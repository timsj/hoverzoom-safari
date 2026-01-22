// HoverZoom+ Safari Port - background.js
// Service worker / background script for Safari WebExtension

let options;

function cLog(msg) {
    if (options && options.debug && msg) {
        console.log(msg);
    }
}

// Validate URL to prevent SSRF and protocol attacks
function isValidFetchUrl(urlString) {
    try {
        const url = new URL(urlString);
        // Only allow http and https protocols
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return false;
        }
        // Block localhost and private IP ranges
        const hostname = url.hostname.toLowerCase();
        if (hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            hostname.startsWith('172.16.') ||
            hostname.startsWith('172.17.') ||
            hostname.startsWith('172.18.') ||
            hostname.startsWith('172.19.') ||
            hostname.startsWith('172.2') ||
            hostname.startsWith('172.30.') ||
            hostname.startsWith('172.31.') ||
            hostname === '0.0.0.0' ||
            hostname.endsWith('.local')) {
            return false;
        }
        return true;
    } catch {
        return false;
    }
}

// Performs an ajax request
async function ajaxRequest(request, sendResponse) {
    const response = request.response;
    const method = request.method;

    // Validate URL before fetching
    if (!isValidFetchUrl(request.url)) {
        cLog('Blocked invalid or private URL: ' + request.url);
        sendResponse(null);
        return;
    }

    // Prepare fetch options
    const fetchOptions = {
        method: request.method,
        headers: {},
        body: request.data
    };

    for (let i in request.headers) {
        fetchOptions.headers[request.headers[i].header] = request.headers[i].value;
    }

    try {
        const fetchResponse = await fetch(request.url, fetchOptions);

        if (fetchResponse.ok) {
            if (method === 'HEAD') {
                const headers = {};
                fetchResponse.headers.forEach((value, key) => {
                    headers[key] = value;
                });
                sendResponse({url: request.url, headers: headers});
            } else {
                switch (response) {
                    case 'URL':
                        sendResponse(fetchResponse.url);
                        break;
                    default:
                        const text = await fetchResponse.text();
                        sendResponse(text);
                }
            }
        } else {
            sendResponse(null);
        }
    } catch (error) {
        cLog(error);
        sendResponse(null);
    }
}

async function loadOptionsBackground() {
    return new Promise((resolve) => {
        browser.storage.sync.get(null, function(result) {
            if (result && Object.keys(result).length > 0) {
                resolve(result);
            } else {
                // Return factory defaults if no options stored
                resolve({
                    extensionEnabled: true,
                    debug: false,
                    excludedSites: [],
                    whiteListMode: false
                });
            }
        });
    });
}

async function onMessage(message, sender, sendResponse) {
    options = await loadOptionsBackground();

    switch (message.action) {
        case 'ajaxGet':
            await ajaxRequest({
                method: 'GET',
                response: message.response,
                url: message.url,
                headers: message.headers
            }, sendResponse);
            break;

        case 'ajaxGetHeaders':
            await ajaxRequest({
                method: 'HEAD',
                response: message.response,
                url: message.url
            }, sendResponse);
            break;

        case 'ajaxRequest':
            await ajaxRequest(message, sendResponse);
            break;

        case 'showPageAction':
            // Safari handles page action differently - just acknowledge
            sendResponse();
            break;

        case 'getOptions':
            sendResponse(options);
            break;

        case 'setItem':
            const items = {};
            items[message.id] = message.data;
            browser.storage.local.set(items);
            break;

        case 'getItem':
            browser.storage.local.get(message.id).then((result) => {
                sendResponse(result[message.id]);
            });
            break;

        case 'removeItem':
            browser.storage.local.remove(message.id);
            break;

        case 'getPermissionsContains':
            // Safari permissions work differently - return false for optional permissions
            sendResponse(false);
            break;

        case 'openViewTab':
            browser.tabs.query({active: true, currentWindow: true}, function (tabs) {
                if (tabs[0]) {
                    message.createData.index = tabs[0].index + 1;
                }
                browser.tabs.create(message.createData);
            });
            break;

        case 'banImage':
            await banImage(message);
            break;

        case 'resetBannedImages':
            await resetBannedImages();
            break;

        case 'isImageBanned':
            sendResponse(await isImageBanned(message));
            break;

        default:
            // Unknown action
            break;
    }
}

// Add url of image, video or audio track to the banlist
async function banImage(message) {
    const url = message.url;
    if (!url) return;

    let result = await browser.storage.local.get('HoverZoomBannedUrls');
    let bannedUrls = result.HoverZoomBannedUrls || '{}';
    try {
        let update = false;
        bannedUrls = JSON.parse(bannedUrls);
        if (url && !bannedUrls[url]) {
            bannedUrls[url] = { 'location' : message.location };
            update = true;
        }
        if (update) {
            await browser.storage.local.set({'HoverZoomBannedUrls': JSON.stringify(bannedUrls)});
        }
    } catch {}
}

// Clear list of banned image, video or audio track urls
async function resetBannedImages() {
    await browser.storage.local.remove('HoverZoomBannedUrls');
}

// Check if url belongs to the banlist
async function isImageBanned(message) {
    const url = message.url;
    let result = await browser.storage.local.get('HoverZoomBannedUrls');
    let bannedUrls = result.HoverZoomBannedUrls || '{}';
    try {
        bannedUrls = JSON.parse(bannedUrls);
    } catch { return false; }
    return bannedUrls[url];
}

// Bind events
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    onMessage(request, sender, sendResponse);
    return true;
});
