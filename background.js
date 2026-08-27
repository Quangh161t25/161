// ============================================================
//  InfoSys Extension — Background Service Worker
//  - SidePanel toggle
//  - Context Menu for fast saving
//  - Auto-save copied text to BANG_TAM on Google Sheets
// ============================================================

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

// --- Side Panel Behavior ---
if (typeof chrome !== 'undefined' && chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
}

// --- Context Menus ---
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.contextMenus) {
    chrome.runtime.onInstalled.addListener(() => {
        chrome.contextMenus.create({
            id: 'save_selection_to_bang_tam',
            title: 'Lưu vào Bảng tạm (InfoSys)',
            contexts: ['selection', 'link', 'page']
        });
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
        if (info.menuItemId === 'save_selection_to_bang_tam') {
            const text = info.selectionText || info.linkUrl || (tab ? tab.title : '') || '';
            const url = info.pageUrl || (tab ? tab.url : '') || '';
            saveToBangTam(text, url);
        }
    });
}

// --- Messages from content script ---
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message && message.action === 'AUTO_COPY_SAVE') {
            const { text, url } = message.data || {};
            saveToBangTam(text, url).then(success => {
                sendResponse({ success });
            });
            return true; // Keep channel open for async response
        }
    });
}
