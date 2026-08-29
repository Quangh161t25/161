function formatMoney(num) {
    if (!num && num !== 0) return '';
    return Number(num).toLocaleString('vi-VN');
}


function parseSheetDate(d) {
    if (!d) return 0;
    const str = String(d).trim();
    if (str.includes('/')) {
        const parts = str.split(' ');
        const dateParts = parts[0].split('/');
        if (dateParts.length === 3) {
            const y = dateParts[2].length === 2 ? '20' + dateParts[2] : dateParts[2];
            const m = dateParts[1].padStart(2, '0');
            const day = dateParts[0].padStart(2, '0');
            const timePart = parts[1] || '00:00';
            const t = new Date(`${y}-${m}-${day}T${timePart.length === 5 ? timePart + ':00' : timePart}`).getTime();
            if (!isNaN(t)) return t;
            const fallbackT = new Date(`${y}-${m}-${day}`).getTime();
            if (!isNaN(fallbackT)) return fallbackT;
        }
    }
    const directT = new Date(str).getTime();
    return isNaN(directT) ? 0 : directT;
}


function copyToClipboard(text, event) {
    if (event) {
        event.stopPropagation();
    }
    navigator.clipboard.writeText(text).then(() => {
        const btn = event ? event.currentTarget : null;
        if (btn) {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i data-lucide="check" style="width:14px; height:14px; color:#10b981;"></i>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }, 1500);
        }
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}


function adjustDateInput(id, delta) {
    const el = document.getElementById(id);
    if (!el || !el.value) return;
    const d = new Date(el.value);
    d.setDate(d.getDate() + delta);
    if (el.type === 'date') {
        el.value = d.toISOString().slice(0, 10);
    } else {
        const offset = d.getTimezoneOffset() * 60000;
        el.value = (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
    }
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('change'));
}

// ============================================================
//  Translation Utility (Dịch sang Tiếng Việt)
// ============================================================
async function translateText(text, targetLang = 'vi') {
    if (!text || typeof text !== 'string' || text.trim().length === 0) return '';
    const cleanText = text.trim();

    // Provider 1: clients5.google.com dict-chrome-ex (Used by Chrome Google Translate)
    try {
        const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=${targetLang}&q=${encodeURIComponent(cleanText)}`;
        const res = await fetch(url);
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

    // Provider 2: Google Translate Mobile (Fast, high accuracy)
    try {
        const url = `https://translate.google.com/m?sl=auto&tl=${targetLang}&q=${encodeURIComponent(cleanText)}`;
        const res = await fetch(url);
        if (res.ok) {
            const html = await res.text();
            const match = html.match(/class="result-container">([\s\S]*?)<\/div>/);
            if (match && match[1]) {
                const decoded = match[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
                if (decoded && decoded.trim().length > 0) {
                    return decoded.trim();
                }
            }
        }
    } catch (e) {}

    // Provider 3: MyMemory API (Free public API fallback)
    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=autodetect|${targetLang}`;
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            if (data && data.responseData && data.responseData.translatedText) {
                const decoded = data.responseData.translatedText.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
                if (decoded && decoded.trim().length > 0 && !decoded.includes('QUERY LENGTH LIMIT') && !decoded.includes('INVALID SOURCE LANGUAGE')) {
                    return decoded.trim();
                }
            }
        }
    } catch (e) {}

    throw new Error('Không thể kết nối đến máy chủ dịch thuật. Vui lòng kiểm tra kết nối mạng.');
}

// ============================================================
//  Text-To-Speech Configuration & Engine
// ============================================================
window.ttsConfig = {
    rate: 1.0,
    pitch: 1.0,
    voiceURI: ''
};

// Load saved TTS settings
try {
    const savedRate = localStorage.getItem('infosys_tts_rate');
    if (savedRate) window.ttsConfig.rate = parseFloat(savedRate) || 1.0;
    const savedPitch = localStorage.getItem('infosys_tts_pitch');
    if (savedPitch) window.ttsConfig.pitch = parseFloat(savedPitch) || 1.0;
    const savedVoice = localStorage.getItem('infosys_tts_voice');
    if (savedVoice) window.ttsConfig.voiceURI = savedVoice;
} catch (e) {}

if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['infosys_tts_rate', 'infosys_tts_pitch', 'infosys_tts_voice'], (res) => {
        if (res) {
            if (res.infosys_tts_rate !== undefined) window.ttsConfig.rate = parseFloat(res.infosys_tts_rate) || 1.0;
            if (res.infosys_tts_pitch !== undefined) window.ttsConfig.pitch = parseFloat(res.infosys_tts_pitch) || 1.0;
            if (res.infosys_tts_voice !== undefined) window.ttsConfig.voiceURI = res.infosys_tts_voice || '';
        }
    });

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local') {
            if (changes.infosys_tts_rate) window.ttsConfig.rate = parseFloat(changes.infosys_tts_rate.newValue) || 1.0;
            if (changes.infosys_tts_pitch) window.ttsConfig.pitch = parseFloat(changes.infosys_tts_pitch.newValue) || 1.0;
            if (changes.infosys_tts_voice) window.ttsConfig.voiceURI = changes.infosys_tts_voice.newValue || '';
        }
    });
}

function saveTtsConfig(rate, voiceURI, pitch = 1.0) {
    window.ttsConfig.rate = parseFloat(rate) || 1.0;
    window.ttsConfig.voiceURI = voiceURI || '';
    window.ttsConfig.pitch = parseFloat(pitch) || 1.0;

    try {
        localStorage.setItem('infosys_tts_rate', String(window.ttsConfig.rate));
        localStorage.setItem('infosys_tts_pitch', String(window.ttsConfig.pitch));
        localStorage.setItem('infosys_tts_voice', window.ttsConfig.voiceURI);
    } catch (e) {}

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({
            infosys_tts_rate: window.ttsConfig.rate,
            infosys_tts_pitch: window.ttsConfig.pitch,
            infosys_tts_voice: window.ttsConfig.voiceURI
        });
    }
}

let currentSpeechAudio = null;
let currentSpeechBtn = null;

let currentSpeechSessionId = 0;
let ttsHeartbeatTimer = null;

function splitTextIntoChunks(text, maxLen = 160) {
    if (!text || typeof text !== 'string') return [];
    const clean = text.replace(/\s+/g, ' ').trim();
    if (clean.length <= maxLen) return [clean];

    const rawSentences = clean.split(/(?<=[.?!;\n])\s+/);
    const chunks = [];
    let current = '';

    for (const sentence of rawSentences) {
        if (!sentence.trim()) continue;
        if ((current + ' ' + sentence).trim().length <= maxLen) {
            current = (current ? current + ' ' : '') + sentence.trim();
        } else {
            if (current) chunks.push(current.trim());
            if (sentence.length > maxLen) {
                const parts = sentence.split(/(?<=[,:\-])\s+|\s+/);
                let sub = '';
                for (const p of parts) {
                    if (!p.trim()) continue;
                    if ((sub + ' ' + p).trim().length <= maxLen) {
                        sub = (sub ? sub + ' ' : '') + p.trim();
                    } else {
                        if (sub) chunks.push(sub.trim());
                        sub = p.trim();
                    }
                }
                if (sub) current = sub;
                else current = '';
            } else {
                current = sentence.trim();
            }
        }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks.filter(c => c.length > 0);
}

function stopSpeaking() {
    currentSpeechSessionId++;
    if (ttsHeartbeatTimer) {
        clearInterval(ttsHeartbeatTimer);
        ttsHeartbeatTimer = null;
    }
    if (typeof window !== 'undefined') {
        if (window.speechSynthesis) {
            try {
                window.speechSynthesis.pause();
                window.speechSynthesis.cancel();
            } catch (e) {}
        }
        if (currentSpeechAudio) {
            try {
                currentSpeechAudio.pause();
                currentSpeechAudio.src = '';
            } catch (e) {}
            currentSpeechAudio = null;
        }
    }
    if (currentSpeechBtn) {
        currentSpeechBtn.innerHTML = currentSpeechBtn._origHtml || '<i data-lucide="volume-2" style="width:13px; height:13px;"></i>';
        currentSpeechBtn.style.color = '';
        currentSpeechBtn.title = 'Đọc tiếng Việt';
        currentSpeechBtn = null;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

function speakVietnamese(text, btnEl = null, customRate = null) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) return;
    const cleanText = text.trim();

    if (currentSpeechBtn === btnEl && btnEl) {
        stopSpeaking();
        return;
    }

    stopSpeaking();

    const sessionId = ++currentSpeechSessionId;
    const chunks = splitTextIntoChunks(cleanText, 160);
    if (chunks.length === 0) return;

    const onStart = () => {
        if (btnEl) {
            currentSpeechBtn = btnEl;
            if (!btnEl._origHtml) btnEl._origHtml = btnEl.innerHTML;
            btnEl.innerHTML = '<i data-lucide="square" style="width:13px; height:13px; fill:#ef4444; color:#ef4444;"></i>';
            btnEl.style.color = '#ef4444';
            btnEl.title = 'Dừng đọc';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    };

    const onEnd = () => {
        if (sessionId === currentSpeechSessionId) {
            stopSpeaking();
        }
    };

    onStart();

    const rate = customRate !== null ? customRate : (window.ttsConfig ? window.ttsConfig.rate : 1.0);
    const pitch = window.ttsConfig ? window.ttsConfig.pitch : 1.0;
    const chosenVoiceURI = window.ttsConfig ? window.ttsConfig.voiceURI : '';

    if (ttsHeartbeatTimer) clearInterval(ttsHeartbeatTimer);
    ttsHeartbeatTimer = setInterval(() => {
        if (sessionId !== currentSpeechSessionId) {
            clearInterval(ttsHeartbeatTimer);
            ttsHeartbeatTimer = null;
            return;
        }
        if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
        }
    }, 8000);

    let currentChunkIndex = 0;

    function playNextChunk() {
        if (sessionId !== currentSpeechSessionId) return;
        if (currentChunkIndex >= chunks.length) {
            onEnd();
            return;
        }

        const chunkText = chunks[currentChunkIndex++];

        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            try {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(chunkText);
                utterance.lang = 'vi-VN';
                utterance.rate = Math.max(0.5, Math.min(2.0, rate));
                utterance.pitch = Math.max(0.5, Math.min(1.5, pitch));

                const voices = window.speechSynthesis.getVoices();
                let selectedVoice = null;
                if (chosenVoiceURI) {
                    selectedVoice = voices.find(v => v.voiceURI === chosenVoiceURI || v.name === chosenVoiceURI);
                }
                if (!selectedVoice) {
                    selectedVoice = voices.find(v => v.lang && (v.lang.toLowerCase().includes('vi') || v.lang.toLowerCase().includes('vn')));
                }
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                }

                utterance.onend = () => {
                    if (sessionId === currentSpeechSessionId) {
                        playNextChunk();
                    }
                };
                utterance.onerror = (err) => {
                    console.warn('Utterance error, using audio fallback queue:', err);
                    playGoogleTtsAudioQueue(chunks.slice(currentChunkIndex - 1), rate, sessionId, onEnd);
                };

                window.speechSynthesis.speak(utterance);
                return;
            } catch (e) {
                console.warn('SpeechSynthesis exception:', e);
            }
        }

        playGoogleTtsAudioQueue(chunks.slice(currentChunkIndex - 1), rate, sessionId, onEnd);
    }

    playNextChunk();
}

function playGoogleTtsAudioQueue(audioChunks, rate, sessionId, onEnd) {
    if (!audioChunks || audioChunks.length === 0 || sessionId !== currentSpeechSessionId) {
        if (onEnd) onEnd();
        return;
    }

    let index = 0;
    function playNextAudio() {
        if (sessionId !== currentSpeechSessionId) return;
        if (index >= audioChunks.length) {
            if (onEnd) onEnd();
            return;
        }

        const chunk = audioChunks[index++];
        const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(chunk)}`;
        const audio = new Audio(audioUrl);
        currentSpeechAudio = audio;
        audio.playbackRate = Math.max(0.5, Math.min(2.0, rate));

        audio.onended = () => {
            if (sessionId === currentSpeechSessionId) playNextAudio();
        };
        audio.onerror = () => {
            if (sessionId === currentSpeechSessionId) playNextAudio();
        };
        audio.play().catch(() => {
            if (sessionId === currentSpeechSessionId) playNextAudio();
        });
    }

    playNextAudio();
}

function showInfoToast(msg, type = 'info') {
    if (typeof document === 'undefined') return;
    let toast = document.getElementById('infosys-app-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'infosys-app-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #0f172a;
            color: #ffffff;
            padding: 10px 18px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 600;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4), 0 8px 10px -6px rgba(0,0,0,0.2);
            z-index: 999999;
            display: flex;
            align-items: center;
            gap: 8px;
            pointer-events: none;
            opacity: 0;
            transform: translateY(12px);
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        `;
        (document.body || document.documentElement).appendChild(toast);
    }

    const icon = type === 'error' ? '❌' : (type === 'success' ? '✓' : '✨');
    toast.innerHTML = `<span style="color:#38bdf8; font-size:15px; font-weight:bold;">${icon}</span> <span>${msg}</span>`;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px)';
    }, 2200);
}

window.translateText = translateText;
window.speakVietnamese = speakVietnamese;
window.stopSpeaking = stopSpeaking;
window.showInfoToast = showInfoToast;

