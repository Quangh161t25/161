// ============================================================
//  InfoSys Extension & MAX Design ToolBox Suite — Service Worker
// ============================================================

// Import ToolBox Core Utilities & Features
try {
    importScripts('common/storage_schema.js');
    importScripts('common/common_utils.js');
    importScripts('4. tools-features/saveasfiletype.js');
    importScripts('2. screencapture/screencapture_debugger.js');
    importScripts('2. screencapture/screencapture_full_stitcher.js');
    importScripts('2. screencapture/screencapture_full_singlepass.js');
    importScripts('4. tools-features/screencapturecontext.js');
    importScripts('4. tools-features/imagesearch.js');
    importScripts('4. tools-features/tools-features.js');
} catch (e) {
    console.warn('Toolbox scripts import:', e);
}

const CONFIG = {
    spreadsheetId: "16eWBBZOcFzrpoU66r3Ma3DM5ngX7JqMPtXxasggyS-s",
    serviceAccountEmail: "test-gia-ason@api-test-sheet-161.iam.gserviceaccount.com",
    privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC3NN84hLTkQPZd
Lj7niXZTICq7nHsuTn3J6r2Paq12m70/lYSmrwh1i0EStr9bO19QM8cevGlslwGr
WSVOLJlc6+w1HGPKvRXtA41kYV9MYIvpzIPQtkFE7Hxq71QyBARcv39Lfzze6Ioj
3G8VBvAKFLAnCUr97GHRv+KbCTFxPZupd3PEB+xS5ZUlzdBCEZvDid3iXaaEJJ+l
Td1apAGQHjtnDTLOkiTa8zf7X5ebALwnI9MziOdN8VyprHXGhkachPbKyrG0QwEs
2jtiI6Y5ULsBPjNefoavH8MKU5DEAT9h0fZ7KfsKYVMDuXqmEKBs0D3B4Z6aDZQW
wT2dDRZDAgMBAAECggEAEIuVoSzZVuFhaz1GI9ji0IacjvO50cIq7M8Zrj4/F756
Ew6PIhKENafAb7U4INm2AnzUMO8CqL9Jpxs85qUM3W4JysSByqLUiRW2184amIyb
j7jCXfLBTQn8AbHgrUepl5d/vBmFYMgon/mqjbNiGDb4FZgEQSkie5o6fi/dWp5d
NahbZl+WTOB/znhAfKh/zferHNxldR/ERmwOubZUerkqysWiBigc3ovpLSUof9ur
z3hNPPp0CKQjF40xuQc6FYTHUHMLuMvp78PXuc/mYqQmZ8VOGhU+faGtZ4m+QJly
dF5dS8U5cwKEF+ptuAUiWSahn6INb9yKn3+FcsW0UQKBgQDb8N4eWFvbgpRo/vxo
wBN2u2TWubj6clcrq/1a+VR0njC28Can0ogJHhrFhPxVs5D/rugs3HlbyAXJFptY
V0DZPCwBxGU5P5RbGjXWWEUXjp4ISKQD8WKfVlXNr79TqLdOg2NZBYQAi06Cpo/T
PV9l7LSG2Tj/9WdvD7W2wvrpaQKBgQDVPjpJN6xh7+sHtSU0mjKvrqigpHbuSQ/o
XpUaWSIpJffm5QpFPAOcTT5mHZCyllicJQIrfPSY+sH8n+sF03CUqVkV4Q2UqfOf
pFaLDB4P6SQ8iesZyF4VKFrj/cAvRJmp0e5W/DRnFkoEp+8c+nrru2+Dzm9kb7Uq
0CiltqYAywKBgBtcfrV1to+7Ue0x84KwintV2rifyDRX7yI+tjkQFYKgf1zyyUxN
c6D2vsvdvGqI+TvlrXqPPwW8/4NBrbeyux2LT8o0fYc+sp0WyKXOu2Gv21caelUH
PYam/eultn6Y2Z0J2V0kw4Qx0GWOhQv5cZnDdb3k3iNxixmU8b03ynEpAoGBAKEA
7O0fNe50QRZ+tOq0ihSPYQ55XrqnO3WNBDLynZJH8pbI1CpWF7vJrpVXOUs9rQWo
A61mGR/wJMtiywaJEHWOL48PbzuR3jno0NcHfSMyOoPi9jlvSWncIFQH4TVPLF5F
/Rh8L+ytrZE6YpWUoX6e9KGmGgDRPw5mQGpuL4RlAoGADe9n080SXlsUk4nHVjUz
Efv7EBoBkgOpqb9T1foRfJl46NxmmTOYV3iGIhjwcDskEg284k4iq/gH6EEFyEBc
Vz13jzB1nBgjfezFesVQz7bA/+Wik6HZtxAxVg38BKMt+Q1tYw9wOjbGPqOn++VC
sR2Sh8e3h3Knd6j1tceRIFU=
-----END PRIVATE KEY-----`,
    tokenUrl: "https://oauth2.googleapis.com/token"
};

let cachedAccessToken = null;
let tokenExpiry = 0;

function pemToArrayBuffer(pem) {
    const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

function base64url(buf) {
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function getAccessToken() {
    if (cachedAccessToken && Date.now() < tokenExpiry - 300000) {
        return cachedAccessToken;
    }

    const privateKeyBuffer = pemToArrayBuffer(CONFIG.privateKey);
    const key = await crypto.subtle.importKey(
        'pkcs8',
        privateKeyBuffer,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
        iss: CONFIG.serviceAccountEmail,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        aud: CONFIG.tokenUrl,
        exp: now + 3600,
        iat: now
    };

    const enc = new TextEncoder();
    const encodedHeader = base64url(enc.encode(JSON.stringify(header)));
    const encodedPayload = base64url(enc.encode(JSON.stringify(payload)));
    const dataToSign = enc.encode(encodedHeader + '.' + encodedPayload);

    const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, dataToSign);
    const encodedSignature = base64url(signature);
    const jwt = encodedHeader + '.' + encodedPayload + '.' + encodedSignature;

    const res = await fetch(CONFIG.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + jwt
    });
    const data = await res.json();
    cachedAccessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);
    return cachedAccessToken;
}

// Format Vietnam Datetime
function getFormattedDateTime() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const dd = pad(now.getDate());
    const mm = pad(now.getMonth() + 1);
    const yyyy = now.getFullYear();
    const hh = pad(now.getHours());
    const min = pad(now.getMinutes());

    return {
        ngay: `${dd}/${mm}/${yyyy}`,
        ngay_gio: `${dd}/${mm}/${yyyy} ${hh}:${min}`
    };
}

// Smart Tag Detection from URL and content
function detectSmartTag(url, text) {
    if (!url) return 'Ghi chú';
    try {
        const u = new URL(url);
        const host = u.hostname.toLowerCase().replace('www.', '');
        if (host.includes('chatgpt') || host.includes('openai') || host.includes('claude') || host.includes('gemini')) return 'ChatGPT';
        if (host.includes('youtube') || host.includes('youtu.be')) return 'YouTube';
        if (host.includes('tiktok')) return 'TikTok';
        if (host.includes('facebook') || host.includes('fb.com')) return 'Facebook';
        if (host.includes('github')) return 'GitHub';
        if (host.includes('vnexpress') || host.includes('dantri') || host.includes('tuoitre') || host.includes('thanhnien') || host.includes('cafef') || host.includes('kenh14') || host.includes('vietnamnet')) return 'Tin tức';
        if (host.includes('shopee') || host.includes('lazada') || host.includes('tiki')) return 'Mua sắm';
        if (host.includes('threads.net')) return 'Threads';
        if (host.includes('x.com') || host.includes('twitter')) return 'Twitter';
        if (host.includes('instagram')) return 'Instagram';
        if (host.includes('zalo')) return 'Zalo';
        if (host.includes('notion')) return 'Notion';
        if (host.includes('medium') || host.includes('substack')) return 'Bài viết';

        const domainParts = host.split('.');
        const mainDomain = domainParts.length >= 2 ? domainParts[domainParts.length - 2] : host;
        if (mainDomain.length > 0) {
            return mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
        }
        return 'Ghi chú';
    } catch (e) {
        return 'Ghi chú';
    }
}

// Append new row to BANG_TAM
async function saveToBangTam(text, url, customTag = null) {
    if (!text && !url) return false;

    try {
        const token = await getAccessToken();
        const { ngay, ngay_gio } = getFormattedDateTime();
        const id = 'ID-' + Date.now();
        const ghi_chu = text ? String(text).trim() : '';
        const noi_dung = url ? String(url).trim() : '';
        const tag = customTag || detectSmartTag(url, text);

        const row = [id, ngay, ngay_gio, ghi_chu, noi_dung, tag];

        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/BANG_TAM!A2:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                values: [row]
            })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.error('Lỗi append BANG_TAM:', err);
            return false;
        }

        // Notify active views (sidepanel, index.html) to reload cache
        chrome.runtime.sendMessage({ action: 'BANG_TAM_UPDATED' }).catch(() => {});

        return true;
    } catch (err) {
        console.error('Lỗi saveToBangTam:', err);
        return false;
    }
}

// ============================================================
//  ACTION RECORDER ENGINE (Ghi lại thao tác vào Sheet THAO_TAC)
// ============================================================
let isActionRecorderActive = true;
let actionRecordBuffer = [];
let actionFlushTimer = null;

if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get({ infosys_action_recorder_enabled: true }, (data) => {
        isActionRecorderActive = data.infosys_action_recorder_enabled !== false;
    });
}

function bufferUserAction(actionData) {
    if (!actionData) return;
    const { ngay, ngay_gio } = getFormattedDateTime();
    const id = 'TT_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const loai_thao_tac = actionData.loai_thao_tac || 'CLICK';
    const doi_tuong = actionData.doi_tuong || '';
    const noi_dung = actionData.noi_dung || '';
    const tieu_de_trang = actionData.tieu_de_trang || '';
    const url_trang = actionData.url_trang || '';
    const thong_tin_them = actionData.thong_tin_them || '';
    const trang_thai = 'Đã ghi';

    const row = [id, ngay, ngay_gio, loai_thao_tac, doi_tuong, noi_dung, tieu_de_trang, url_trang, thong_tin_them, trang_thai];
    actionRecordBuffer.push(row);

    if (actionRecordBuffer.length >= 8) {
        flushActionBuffer();
    } else if (!actionFlushTimer) {
        actionFlushTimer = setTimeout(() => {
            actionFlushTimer = null;
            flushActionBuffer();
        }, 7000);
    }
}

async function flushActionBuffer() {
    if (actionRecordBuffer.length === 0) return true;
    const rowsToWrite = [...actionRecordBuffer];
    actionRecordBuffer = [];

    try {
        const token = await getAccessToken();
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/THAO_TAC!A2:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                values: rowsToWrite
            })
        });

        if (!res.ok) {
            console.warn('Lỗi append THAO_TAC batch, hoàn lại buffer:', await res.text().catch(() => ''));
            actionRecordBuffer = [...rowsToWrite, ...actionRecordBuffer];
            return false;
        }

        chrome.runtime.sendMessage({ action: 'THAO_TAC_UPDATED', count: rowsToWrite.length }).catch(() => {});
        return true;
    } catch (err) {
        console.error('Exception flushActionBuffer:', err);
        actionRecordBuffer = [...rowsToWrite, ...actionRecordBuffer];
        return false;
    }
}

// --- Side Panel Behavior ---
function syncPanelBehavior() {
    chrome.storage.local.get({ currentViewMode: 'sidepanel' }, (data) => {
        const isSidePanel = data.currentViewMode === 'sidepanel';
        if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
            chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: isSidePanel }).catch(() => {});
        }
    });
}

// On startup or install, configure default icon behavior & context menus
chrome.runtime.onStartup.addListener(() => {
    syncPanelBehavior();
    if (typeof updateUnifiedContextMenus === 'function') updateUnifiedContextMenus();
});

chrome.runtime.onInstalled.addListener((details) => {
    syncPanelBehavior();
    if (typeof updateUnifiedContextMenus === 'function') updateUnifiedContextMenus();

    // Register InfoSys context menus
    try {
        chrome.contextMenus.create({
            id: 'ocr_selection_to_bang_tam',
            title: '🔍 Quét chữ ảnh OCR ➔ Lưu Bảng tạm',
            contexts: ['all']
        });
        chrome.contextMenus.create({
            id: 'save_selection_to_bang_tam',
            title: '📥 Lưu vào Bảng tạm (InfoSys)',
            contexts: ['selection', 'link', 'page']
        });
        chrome.contextMenus.create({
            id: 'translate_selection',
            title: '🌐 Dịch sang Tiếng Việt (Google Dịch)',
            contexts: ['selection']
        });
        chrome.contextMenus.create({
            id: 'speak_selection',
            title: '🔊 Đọc văn bản Tiếng Việt',
            contexts: ['selection']
        });
        chrome.contextMenus.create({
            id: 'toggle_floating_widget',
            title: '🔘 Bật / Tắt Icon nổi trên web',
            contexts: ['action', 'page']
        });
    } catch(err) {}
});

// Auto-detect blob: image tabs and inject auto-open-image-studio.js
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab && tab.url && tab.url.startsWith('blob:')) {
        chrome.storage.local.get({ directImageStudioEnabled: true }, (data) => {
            if (data.directImageStudioEnabled !== false) {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['4. tools-features/auto-open-image-studio.js']
                }).catch(() => {});
            }
        });
    }
});

// Global keyboard shortcuts (Alt+Shift+O / Alt+Shift+Z/X/C/V)
if (typeof chrome !== 'undefined' && chrome.commands && chrome.commands.onCommand) {
    chrome.commands.onCommand.addListener((command) => {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            let tab = tabs && tabs[0];
            const executeCommand = (activeTab) => {
                if (!activeTab || !activeTab.id) return;
                if (command === 'capture_ocr') {
                    chrome.tabs.sendMessage(activeTab.id, { action: 'START_OCR_CAPTURE' }).catch(() => {});
                } else if (command === 'capture_area') {
                    if (typeof createSelectionOverlay === 'function') {
                        chrome.scripting.executeScript({
                            target: { tabId: activeTab.id },
                            func: createSelectionOverlay
                        }).catch(() => {});
                    }
                } else if (command === 'capture_visible') {
                    if (typeof performVisibleCaptureDirectly === 'function') {
                        performVisibleCaptureDirectly(activeTab);
                    }
                } else if (command === 'capture_full') {
                    if (typeof performFullPageCaptureDirectly === 'function') {
                        performFullPageCaptureDirectly(activeTab);
                    }
                } else if (command === 'capture_record') {
                    if (typeof openScreenRecorderWindow === 'function') {
                        openScreenRecorderWindow();
                    }
                }
            };
            if (tab) executeCommand(tab);
        });
    });
}

// --- Context Menus Click Handler ---
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'ocr_selection_to_bang_tam') {
        if (tab && tab.id) {
            chrome.tabs.sendMessage(tab.id, { action: 'START_OCR_CAPTURE' }).catch(() => {});
        }
    } else if (info.menuItemId === 'save_selection_to_bang_tam') {
        const text = info.selectionText || info.linkUrl || (tab ? tab.title : '') || '';
        const url = info.pageUrl || (tab ? tab.url : '') || '';
        saveToBangTam(text, url);
    } else if (info.menuItemId === 'translate_selection') {
        if (tab && tab.id && info.selectionText) {
            chrome.tabs.sendMessage(tab.id, {
                action: 'TRIGGER_TRANSLATE',
                text: info.selectionText
            }).catch(() => {});
        }
    } else if (info.menuItemId === 'speak_selection') {
        if (tab && tab.id && info.selectionText) {
            chrome.tabs.sendMessage(tab.id, {
                action: 'TRIGGER_SPEAK',
                text: info.selectionText
            }).catch(() => {});
        }
    } else if (info.menuItemId === 'toggle_floating_widget') {
        chrome.storage.local.get(['infosys_floating_icon_enabled'], (res) => {
            const isCurrentlyEnabled = res.infosys_floating_icon_enabled !== false;
            const nextState = !isCurrentlyEnabled;
            chrome.storage.local.set({ infosys_floating_icon_enabled: nextState }, () => {
                if (chrome.tabs && chrome.tabs.query) {
                    chrome.tabs.query({}, (tabs) => {
                        tabs.forEach(t => {
                            if (t && t.id) {
                                chrome.tabs.sendMessage(t.id, {
                                    action: 'TOGGLE_FLOATING_ICON',
                                    enabled: nextState
                                }).catch(() => {});
                            }
                        });
                    });
                }
            });
        });
    }
});

// --- Translation Engine in Service Worker (No CORS limit) ---
async function handleTranslateApi(text, targetLang = 'vi') {
    if (!text || typeof text !== 'string') return '';
    const cleanText = text.trim();

    try {
        const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=${targetLang}&q=${encodeURIComponent(cleanText)}`;
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
                if (typeof data[0] === 'string') return data[0].trim();
                if (Array.isArray(data[0]) && typeof data[0][0] === 'string') {
                    return data.map(item => Array.isArray(item) ? item[0] : item).join('').trim();
                }
            }
        }
    } catch (e) {}

    try {
        const url = `https://translate.google.com/m?sl=auto&tl=${targetLang}&q=${encodeURIComponent(cleanText)}`;
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15' } });
        if (res.ok) {
            const html = await res.text();
            const match = html.match(/class="result-container">([\s\S]*?)<\/div>/);
            if (match && match[1]) {
                const decoded = match[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
                if (decoded && decoded.trim().length > 0) return decoded.trim();
            }
        }
    } catch (e) {}

    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=autodetect|${targetLang}`;
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            if (data && data.responseData && data.responseData.translatedText) {
                const decoded = data.responseData.translatedText.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
                if (decoded && !decoded.includes('QUERY LENGTH LIMIT') && !decoded.includes('INVALID SOURCE LANGUAGE')) {
                    return decoded.trim();
                }
            }
        }
    } catch (e) {}

    throw new Error('Không thể dịch tự động. Vui lòng kiểm tra lại mạng.');
}

// --- Integrated OCR WebAssembly Engine ---
async function triggerOcrEngine(tabId) {
    if (!tabId) return;
    try {
        await chrome.scripting.insertCSS({
            target: { tabId },
            files: ['data/inject/inject.css']
        });
        await chrome.scripting.executeScript({
            target: { tabId },
            files: ['data/inject/inject.js']
        });
    } catch (e) {
        console.warn('triggerOcrEngine error:', e);
    }
}

// --- Combined Message Dispatcher ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message) return;

    // OCR Engine specific methods
    if (message.method === 'captured') {
        const { devicePixelRatio, left, top, width, height } = message;
        const tabId = sender.tab ? sender.tab.id : null;
        const windowId = sender.tab ? sender.tab.windowId : null;

        if (tabId && width && height) {
            chrome.tabs.captureVisibleTab(windowId, { format: 'png' }, async href => {
                try {
                    const target = { tabId };
                    await chrome.scripting.executeScript({
                        target,
                        files: ['data/inject/elements.js'],
                        world: 'MAIN'
                    });
                    await chrome.scripting.executeScript({
                        target,
                        files: ['data/engine/helper.js']
                    });
                    await chrome.scripting.executeScript({
                        target,
                        files: ['data/inject/response.js']
                    });

                    chrome.storage.local.get({
                        'post-method': 'POST',
                        'post-href': '',
                        'post-body': '',
                        'lang': 'vie',
                        'frequently-used': ['vie', 'eng', 'fra', 'deu', 'rus', 'ara', 'jpn', 'kor', 'chi_sim'],
                        'accuracy': '4.0.0'
                    }, prefs => chrome.scripting.executeScript({
                        target,
                        func: (prefs, href, box) => {
                            const em = document.querySelector('ocr-result:last-of-type');
                            if (em) {
                                em.command('configure', prefs);
                                em.command('prepare');
                                em.href = href;
                                em.box = box;
                                em.run();
                            }
                        },
                        args: [prefs, href, {
                            width: width * (devicePixelRatio || 1),
                            height: height * (devicePixelRatio || 1),
                            left: left * (devicePixelRatio || 1),
                            top: top * (devicePixelRatio || 1)
                        }]
                    }));
                } catch (err) {
                    console.error('OCR engine execution error:', err);
                }
            });
        }
        return true;
    } else if (message.method === 'open-link') {
        if (sender.tab) {
            chrome.tabs.create({ url: message.href, index: sender.tab.index + 1 });
        }
        return true;
    } else if (message.method === 'remove-indexeddb') {
        caches.delete('traineddata').finally(() => {
            if (sendResponse) sendResponse();
        });
        if (typeof indexedDB !== 'undefined' && indexedDB.databases) {
            indexedDB.databases().then(as => {
                for (const { name } of as) {
                    indexedDB.deleteDatabase(name);
                }
            });
        }
        return true;
    }

    // InfoSys / ToolBox Action Handlers
    if (message.action === 'START_OCR_CAPTURE_FROM_VIEW' || message.action === 'START_OCR_CAPTURE') {
        const targetTabId = (sender.tab && sender.tab.id) || null;
        if (targetTabId) {
            triggerOcrEngine(targetTabId);
        } else {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs[0] && tabs[0].id) {
                    triggerOcrEngine(tabs[0].id);
                }
            });
        }
        return true;
    } else if (message.action === 'AUTO_COPY_SAVE') {
        const { text, url, tag } = message.data || {};
        saveToBangTam(text, url, tag).then(success => {
            sendResponse({ success });
        });
        return true;
    } else if (message.action === 'SPEAK_TEXT') {
        const text = (message.text || '').trim();
        const lang = message.lang || 'vi-VN';
        if (text && chrome.tts) {
            try {
                chrome.tts.stop();
                chrome.tts.speak(text, {
                    lang: lang,
                    rate: message.rate || 1.0,
                    pitch: 1.0,
                    onEvent: (event) => {
                        if (event.type === 'start') {
                            if (sendResponse) try { sendResponse({ status: 'start' }); } catch(e){}
                        } else if (event.type === 'end' || event.type === 'error' || event.type === 'interrupted' || event.type === 'cancelled') {
                            if (sendResponse) try { sendResponse({ status: 'end' }); } catch(e){}
                        }
                    }
                });
            } catch(e) {
                console.warn('chrome.tts error:', e);
            }
        }
        return true;
    } else if (message.action === 'STOP_SPEAKING') {
        if (chrome.tts) {
            try { chrome.tts.stop(); } catch(e){}
        }
        return true;
    } else if (message.action === 'TRANSLATE_TEXT') {
        handleTranslateApi(message.text, message.targetLang || 'vi')
            .then(translatedText => sendResponse({ success: true, translatedText }))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    } else if (message.action === 'LOG_USER_ACTION') {
        if (isActionRecorderActive) {
            bufferUserAction(message.data);
        }
        sendResponse({ success: true });
        return true;
    } else if (message.action === 'TOGGLE_ACTION_RECORDER') {
        const nextState = message.enabled !== undefined ? message.enabled : !isActionRecorderActive;
        isActionRecorderActive = nextState;
        chrome.storage.local.set({ infosys_action_recorder_enabled: nextState }, () => {
            if (!nextState) {
                flushActionBuffer();
            }
            if (chrome.tabs && chrome.tabs.query) {
                chrome.tabs.query({}, (tabs) => {
                    tabs.forEach(t => {
                        if (t && t.id) {
                            chrome.tabs.sendMessage(t.id, {
                                action: 'ACTION_RECORDER_STATE_CHANGED',
                                enabled: nextState
                            }).catch(() => {});
                        }
                    });
                });
            }
            sendResponse({ success: true, enabled: nextState });
        });
        return true;
    } else if (message.action === 'FLUSH_ACTION_RECORDER') {
        flushActionBuffer().then(success => {
            sendResponse({ success });
        });
        return true;
    }

    // 2. ToolBox Handlers
    if (message.action === 'update_context_menus' || message.action === 'update_save_as_context_menu' || message.action === 'update_google_search_context_menu') {
        if (typeof updateUnifiedContextMenus === 'function') updateUnifiedContextMenus();
    }

    if (message.action === 'trigger_capture_visible') {
        const targetTabId = message.tabId || (sender.tab && sender.tab.id);
        if (targetTabId) {
            chrome.tabs.get(targetTabId, (tab) => {
                if (tab && typeof performVisibleCaptureDirectly === 'function') {
                    performVisibleCaptureDirectly(tab);
                }
            });
        }
    }

    if (message.action === 'trigger_capture_full') {
        const targetTabId = message.tabId || (sender.tab && sender.tab.id);
        if (targetTabId) {
            chrome.tabs.get(targetTabId, (tab) => {
                if (tab && typeof performFullPageCaptureDirectly === 'function') {
                    performFullPageCaptureDirectly(tab);
                }
            });
        }
    }

    if (message.action === 'trigger_screen_recorder') {
        if (typeof openScreenRecorderWindow === 'function') {
            openScreenRecorderWindow();
        }
    }

    if (message.action === 'start_area_capture') {
        const targetTabId = message.tabId || (sender.tab && sender.tab.id);
        const executeAreaCapture = (tabId) => {
            chrome.storage.local.get(['captureResolutionScale'], async (data) => {
                const scale = parseInt(data.captureResolutionScale, 10) || 1;
                if (scale > 1 && tabId && chrome.debugger) {
                    try {
                        await new Promise(r => chrome.debugger.attach({ tabId }, '1.3', () => {
                            if (chrome.runtime.lastError) {}
                            r();
                        }));
                    } catch (e) {}
                }
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    func: createSelectionOverlay
                }).catch(() => {});
            });
        };

        if (targetTabId) {
            executeAreaCapture(targetTabId);
        } else {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs[0]) executeAreaCapture(tabs[0].id);
            });
        }
    }

    if (message.action === 'area_cancelled') {
        const tabId = sender.tab ? sender.tab.id : null;
        if (tabId && chrome.debugger) {
            try {
                chrome.debugger.detach({ tabId }, () => {
                    if (chrome.runtime.lastError) {}
                });
            } catch (e) {}
        }
    }

    if (message.action === 'area_selected') {
        const tabId = sender.tab ? sender.tab.id : null;
        const windowId = sender.tab ? sender.tab.windowId : null;

        chrome.storage.local.get(['maxSettings', 'captureFormat', 'captureResolutionScale'], async (data) => {
            const saved = data['maxSettings'] || {};
            const scale = parseInt(data.captureResolutionScale, 10) || 1;
            const fmtKey = data.captureFormat || saved.captureFormat || 'jpg';
            const map = {
                png:  { ext: 'png',  mime: 'image/png',  chromeFormat: 'png'  },
                jpg:  { ext: 'jpg',  mime: 'image/jpeg', chromeFormat: 'jpeg' },
                webp: { ext: 'webp', mime: 'image/webp', chromeFormat: 'png'  }
            };
            const formatConfig = map[fmtKey] || map['jpg'];

            let folderPrefix = '';
            if (saved.downloadLocation === 'subfolder') {
                const folder = (saved.subfolderName || 'MAX Downloads').replace(/[/\\]+$/, '');
                folderPrefix = folder + '/';
            }

            const now = new Date();
            const yy = String(now.getFullYear()).slice(-2);
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');
            const secondsFromMidnight = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
            const timestamp = `${yy}${mm}${dd}-${secondsFromMidnight}`;

            let dataUrl = null;

            if (scale > 1 && tabId && chrome.debugger) {
                try {
                    await new Promise(r => chrome.debugger.attach({ tabId }, '1.3', () => {
                        if (chrome.runtime.lastError) {}
                        r();
                    }));
                    const layoutResults = await chrome.scripting.executeScript({
                        target: { tabId },
                        func: () => ({ baseDpr: window.devicePixelRatio || 1 })
                    });
                    const baseDpr = (layoutResults && layoutResults[0]) ? layoutResults[0].result.baseDpr : 1;

                    await new Promise(r => chrome.debugger.sendCommand({ tabId }, 'Emulation.setDeviceMetricsOverride', {
                        width: 0,
                        height: 0,
                        deviceScaleFactor: baseDpr * scale,
                        mobile: false
                    }, r));

                    await new Promise(r => setTimeout(r, 250));

                    const cdpFmt = formatConfig.mime === 'image/jpeg' ? 'jpeg' : 'png';
                    const cdpMimePrefix = formatConfig.mime === 'image/jpeg' ? 'data:image/jpeg;base64,' : 'data:image/png;base64,';
                    const cdpParams = { format: cdpFmt, fromSurface: true };
                    if (cdpFmt === 'jpeg') cdpParams.quality = 92;

                    const cdpRes = await new Promise((resolve) => {
                        chrome.debugger.sendCommand({ tabId }, 'Page.captureScreenshot', cdpParams, (r) => {
                            if (chrome.runtime.lastError || !r || !r.data) resolve(null);
                            else resolve(cdpMimePrefix + r.data);
                        });
                    });

                    if (cdpRes) dataUrl = cdpRes;

                    await new Promise(r => chrome.debugger.sendCommand({ tabId }, 'Emulation.clearDeviceMetricsOverride', {}, r));
                    await new Promise(r => chrome.debugger.detach({ tabId }, r));
                } catch (e) {
                    try { chrome.debugger.detach({ tabId }, () => {}); } catch(err){}
                }
            }

            if (!dataUrl) {
                dataUrl = await new Promise((resolve) => {
                    chrome.tabs.captureVisibleTab(windowId, { format: formatConfig.chromeFormat }, (res) => resolve(res));
                });
            }

            if (tabId && dataUrl) {
                const maxW = saved.maxCaptureWidth || 0;
                const maxH = saved.maxCaptureHeight !== undefined ? saved.maxCaptureHeight : 16000;

                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    args: [dataUrl, message.coords, formatConfig, folderPrefix, timestamp, maxW, maxH],
                    func: cropAndDownloadInTab
                }).catch(() => {});
            }
        });
    }

    if (message.action === 'download_and_save_area_capture') {
        chrome.downloads.download({
            url: message.croppedDataUrl,
            filename: message.filename,
            conflictAction: 'uniquify',
            saveAs: false
        }, (downloadId) => {
            const dId = chrome.runtime.lastError ? null : downloadId;
            const newItem = {
                id: 'cap_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                filename: message.filename,
                ext: message.ext.toUpperCase(),
                width: message.width || 0,
                height: message.height || 0,
                timestamp: Date.now(),
                pageTitle: message.pageTitle || 'Webpage',
                pageUrl: message.pageUrl || '',
                downloadId: dId
            };
            if (typeof saveVerifiedCaptureHistoryItem === 'function') {
                saveVerifiedCaptureHistoryItem(newItem);
            } else {
                chrome.storage.local.get({ captureHistory: [] }, (res) => {
                    let history = res.captureHistory || [];
                    history = [newItem, ...history.filter(h => h.filename !== newItem.filename)].slice(0, 20);
                    chrome.storage.local.set({ captureHistory: history });
                });
            }
        });
    }

    if (message.action === 'get_image_file_size') {
        fetch(message.url, { method: 'HEAD' })
            .then(res => {
                const len = res.headers.get('content-length');
                sendResponse({ success: true, size: len ? parseInt(len) : null });
            })
            .catch(() => {
                fetch(message.url, { method: 'GET', headers: { 'Range': 'bytes=0-1' } })
                    .then(res => {
                        const len = res.headers.get('content-length');
                        sendResponse({ success: true, size: len ? parseInt(len) : null });
                    })
                    .catch(() => sendResponse({ success: false }));
            });
        return true;
    }

    if (message.action === 'execute_context_menu_action') {
        if (typeof executeFallbackAction === 'function') {
            executeFallbackAction(message.menuItemId, message.imageUrl);
        } else if (self.executeFallbackAction) {
            self.executeFallbackAction(message.menuItemId, message.imageUrl);
        }
    }

    if (message.action === 'OPEN_TOOLBOX') {
        chrome.tabs.create({ url: chrome.runtime.getURL('toolbox.html') });
    }
});

// Selection Overlay Injection Script for Area Capture
function createSelectionOverlay() {
    if (document.getElementById('max-capture-overlay')) return;

    const docEl = document.documentElement || document.body;
    const originalOverflow = document.body ? document.body.style.overflow : '';
    if (document.body) document.body.style.overflow = 'hidden';

    const style = document.createElement('style');
    style.id = 'max-capture-style';
    style.textContent = `
        #max-capture-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 2147483647 !important;
            background-color: rgba(0, 0, 0, 0.45) !important;
            cursor: crosshair !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            transition: background-color 0.1s ease !important;
        }
        #max-capture-overlay.selecting {
            background-color: transparent !important;
        }
        #max-capture-box {
            position: fixed !important;
            border: 2px dashed #00f2fe !important;
            box-shadow: 0 0 0 99999px rgba(0, 0, 0, 0.55), 0 0 16px rgba(0, 242, 254, 0.4) !important;
            z-index: 2147483647 !important;
            pointer-events: none !important;
            display: none;
            box-sizing: border-box !important;
            background: transparent !important;
        }
        #max-capture-label {
            position: absolute !important;
            bottom: -28px !important;
            right: 0 !important;
            background-color: #0f172a !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            color: #f9fafb !important;
            padding: 3px 8px !important;
            border-radius: 4px !important;
            font-family: system-ui, -apple-system, sans-serif !important;
            font-size: 11px !important;
            font-weight: 600 !important;
            white-space: nowrap !important;
            pointer-events: none !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
        }
    `;
    (document.head || docEl).appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = 'max-capture-overlay';

    const box = document.createElement('div');
    box.id = 'max-capture-box';

    const label = document.createElement('div');
    label.id = 'max-capture-label';
    box.appendChild(label);

    overlay.appendChild(box);
    (document.body || docEl).appendChild(overlay);

    let startX = 0, startY = 0, isDragging = false;

    const onMouseDown = (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        isDragging = true;
        overlay.classList.add('selecting');
        startX = e.clientX;
        startY = e.clientY;
        box.style.left = startX + 'px';
        box.style.top = startY + 'px';
        box.style.width = '0px';
        box.style.height = '0px';
        box.style.display = 'block';

        window.addEventListener('mousemove', onMouseMove, true);
        window.addEventListener('mouseup', onMouseUp, true);
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        e.stopPropagation();
        const currentX = e.clientX;
        const currentY = e.clientY;

        const x = Math.min(startX, currentX);
        const y = Math.min(startY, currentY);
        const w = Math.abs(startX - currentX);
        const h = Math.abs(startY - currentY);

        box.style.left = x + 'px';
        box.style.top = y + 'px';
        box.style.width = w + 'px';
        box.style.height = h + 'px';

        label.textContent = `${w} × ${h} px`;
        if (y + h + 35 > window.innerHeight) {
            label.style.bottom = 'auto';
            label.style.top = '-28px';
        } else {
            label.style.top = 'auto';
            label.style.bottom = '-28px';
        }
    };

    const onMouseUp = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        e.stopPropagation();
        isDragging = false;
        overlay.classList.remove('selecting');

        const currentX = e.clientX;
        const currentY = e.clientY;

        const x = Math.min(startX, currentX);
        const y = Math.min(startY, currentY);
        const w = Math.abs(startX - currentX);
        const h = Math.abs(startY - currentY);

        cleanup();

        if (w > 5 && h > 5) {
            setTimeout(() => {
                chrome.runtime.sendMessage({
                    action: 'area_selected',
                    coords: { x, y, w, h, dpr: window.devicePixelRatio || 1 }
                });
            }, 80);
        }
    };

    const onKeyDown = (e) => {
        if (e.key === 'Escape') {
            cleanup();
            try {
                chrome.runtime.sendMessage({ action: 'area_cancelled' });
            } catch(err) {}
        }
    };

    const cleanup = () => {
        overlay.removeEventListener('mousedown', onMouseDown, true);
        window.removeEventListener('mousemove', onMouseMove, true);
        window.removeEventListener('mouseup', onMouseUp, true);
        window.removeEventListener('keydown', onKeyDown, true);
        if (document.body) document.body.style.overflow = originalOverflow;
        overlay.remove();
        style.remove();
    };

    overlay.addEventListener('mousedown', onMouseDown, true);
    window.addEventListener('keydown', onKeyDown, true);
}

// Cropping and Web Toast Injection Script
function cropAndDownloadInTab(dataUrl, coords, formatConfig, folderPrefix, timestamp, maxW = 0, maxH = 16000) {
    function removeVietnameseTones(str) {
        if (!str) return '';
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        return str;
    }

    function sanitizeFilename(name) {
        if (!name) return 'screenshot';
        let cleanName = removeVietnameseTones(name);
        cleanName = cleanName.replace(/[\\/:*?"<>|]/g, '_');
        cleanName = cleanName.replace(/[^a-zA-Z0-9\s._-]/g, '');
        return cleanName.trim().replace(/\s+/g, ' ').replace(/_+/g, '_') || 'screenshot';
    }

    const img = new Image();
    img.onload = () => {
        const scaleX = (img.naturalWidth || img.width) / window.innerWidth;
        const scaleY = (img.naturalHeight || img.height) / window.innerHeight;

        const cropX = Math.round(coords.x * scaleX);
        const cropY = Math.round(coords.y * scaleY);
        const cropW = Math.round(coords.w * scaleX);
        const cropH = Math.round(coords.h * scaleY);

        let targetW = cropW;
        let targetH = cropH;

        const maxWVal = parseInt(maxW, 10) || 0;
        const maxHVal = parseInt(maxH, 10) || 0;

        if (maxWVal > 0 && targetW > maxWVal) {
            const ratio = maxWVal / targetW;
            targetW = maxWVal;
            targetH = Math.round(targetH * ratio);
        }

        if (maxHVal > 0 && targetH > maxHVal) {
            targetH = maxHVal;
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const drawH = Math.round(cropH * (targetW / cropW));

        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, targetW, drawH);

        const pageTitle = sanitizeFilename(document.title);
        const finalFilename = (folderPrefix || '') + `${pageTitle} - ${timestamp}.${formatConfig.ext}`;

        canvas.toBlob((blob) => {
            if (!blob) return;
            const croppedDataUrl = canvas.toDataURL(formatConfig.mime, 1.0);

            chrome.runtime.sendMessage({
                action: 'download_and_save_area_capture',
                croppedDataUrl: croppedDataUrl,
                filename: finalFilename,
                ext: formatConfig.ext,
                width: canvas.width,
                height: canvas.height,
                pageTitle: document.title || 'Webpage',
                pageUrl: window.location.href || ''
            });

            if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
                try {
                    const item = new ClipboardItem({ 'image/png': blob });
                    navigator.clipboard.write([item]).catch(() => {});
                } catch (e) {}
            }
        }, formatConfig.mime, formatConfig.mime === 'image/jpeg' ? 0.92 : undefined);
    };
    img.src = dataUrl;
}
