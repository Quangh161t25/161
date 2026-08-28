// ============================================================
//  InfoSys Extension — Content Script
//  - Icon Dịch Google & Thanh nổi khi bôi đen văn bản trên web
//  - Khung xem bản dịch chuẩn Google Translate Popup
//  - Đọc Tiếng Việt (TTS) tùy chỉnh tốc độ & giọng đọc
//  - Bật / Tắt tức thì từ Extension & Chuột phải
// ============================================================

(function() {
    let isFloatingEnabled = true;
    let lastCopiedText = '';
    let lastCopyTime = 0;
    let currentSelectedText = '';
    let selectionTimeout = null;
    let autoDismissTimer = null;
    let currentSpeechAudio = null;
    let currentSpeechBtn = null;

    let ttsConfig = {
        rate: 1.0,
        voiceURI: '',
        pitch: 1.0
    };

    // Load initial settings from Extension storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['infosys_floating_icon_enabled', 'infosys_tts_rate', 'infosys_tts_voice', 'infosys_tts_pitch'], (res) => {
            if (res) {
                if (res.infosys_floating_icon_enabled !== undefined) isFloatingEnabled = res.infosys_floating_icon_enabled !== false;
                if (res.infosys_tts_rate !== undefined) ttsConfig.rate = parseFloat(res.infosys_tts_rate) || 1.0;
                if (res.infosys_tts_voice !== undefined) ttsConfig.voiceURI = res.infosys_tts_voice || '';
                if (res.infosys_tts_pitch !== undefined) ttsConfig.pitch = parseFloat(res.infosys_tts_pitch) || 1.0;
            }
        });

        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === 'local') {
                if (changes.infosys_floating_icon_enabled !== undefined) {
                    isFloatingEnabled = changes.infosys_floating_icon_enabled.newValue !== false;
                    if (!isFloatingEnabled) hideFloatingWidgets();
                }
                if (changes.infosys_tts_rate) ttsConfig.rate = parseFloat(changes.infosys_tts_rate.newValue) || 1.0;
                if (changes.infosys_tts_voice) ttsConfig.voiceURI = changes.infosys_tts_voice.newValue || '';
                if (changes.infosys_tts_pitch) ttsConfig.pitch = parseFloat(changes.infosys_tts_pitch.newValue) || 1.0;
                updateSpeedPillsUI();
            }
        });
    }

    // Speeds cycle: 0.75x -> 1.0x -> 1.25x -> 1.5x -> 2.0x
    const SPEED_PRESETS = [0.75, 1.0, 1.25, 1.5, 2.0];
    function cycleTtsSpeed() {
        let idx = SPEED_PRESETS.findIndex(s => Math.abs(s - ttsConfig.rate) < 0.05);
        if (idx === -1) idx = 1;
        const nextSpeed = SPEED_PRESETS[(idx + 1) % SPEED_PRESETS.length];
        ttsConfig.rate = nextSpeed;
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ infosys_tts_rate: nextSpeed });
        }
        updateSpeedPillsUI();
        showToast(`⚡ Tốc độ đọc: ${nextSpeed}x`);
    }

    function updateSpeedPillsUI() {
        const pills = document.querySelectorAll('.infosys-speed-pill');
        pills.forEach(p => {
            p.textContent = `⚡ ${ttsConfig.rate}x`;
        });
    }

    // Listen to messages from background / context menu
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((msg) => {
            if (msg && msg.action === 'TOGGLE_FLOATING_ICON') {
                isFloatingEnabled = msg.enabled !== false;
                if (!isFloatingEnabled) {
                    hideFloatingWidgets();
                }
                showToast(isFloatingEnabled ? 'Đã BẬT icon Dịch & nổi trên web' : 'Đã TẮT icon Dịch & nổi trên web');
            } else if (msg && msg.action === 'TRIGGER_TRANSLATE') {
                const text = msg.text || window.getSelection().toString().trim();
                if (text) {
                    const sel = window.getSelection();
                    const rect = (sel && sel.rangeCount > 0) ? sel.getRangeAt(0).getBoundingClientRect() : { left: window.innerWidth / 2 - 160, top: 120, bottom: 140, width: 200, height: 20 };
                    showGoogleTranslateCard(rect, text);
                }
            } else if (msg && msg.action === 'TRIGGER_SPEAK') {
                const text = msg.text || window.getSelection().toString().trim();
                if (text) {
                    speakVietnamese(text, null);
                }
            }
        });
    }

    // Toast notification UI
    function showToast(msg = 'Đã lưu vào Bảng tạm') {
        let toast = document.getElementById('infosys-copy-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'infosys-copy-toast';
            toast.style.cssText = `
                position: fixed !important;
                bottom: 24px !important;
                right: 24px !important;
                background: #0f172a !important;
                color: #ffffff !important;
                padding: 9px 16px !important;
                border-radius: 10px !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
                font-size: 13px !important;
                font-weight: 600 !important;
                box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4), 0 8px 10px -6px rgba(0,0,0,0.2) !important;
                z-index: 2147483647 !important;
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                pointer-events: none !important;
                opacity: 0 !important;
                transform: translateY(12px) !important;
                transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
            `;
            (document.body || document.documentElement).appendChild(toast);
        }

        toast.innerHTML = `<span style="color:#38bdf8; font-size:15px; font-weight:bold;">✓</span> <span style="color:#ffffff;">${msg}</span>`;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';

        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(12px)';
        }, 2200);
    }

    // Fast & Reliable Translation Engine (Via Background Service Worker to bypass CORS)
    async function translateText(text, targetLang = 'vi') {
        if (!text || typeof text !== 'string' || text.trim().length === 0) return '';
        const cleanText = text.trim();

        // 1. Send to background service worker (Bypasses all webpage CORS restrictions)
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            try {
                const response = await new Promise((resolve) => {
                    chrome.runtime.sendMessage({
                        action: 'TRANSLATE_TEXT',
                        text: cleanText,
                        targetLang: targetLang
                    }, (res) => {
                        if (chrome.runtime.lastError) {
                            resolve(null);
                        } else {
                            resolve(res);
                        }
                    });
                });

                if (response && response.success && response.translatedText) {
                    return response.translatedText;
                }
            } catch (e) {}
        }

        // 2. Direct client fallback: clients5.google.com dict-chrome-ex
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

        // 3. Direct client fallback: Google Translate Web /m
        try {
            const url = `https://translate.google.com/m?sl=auto&tl=${targetLang}&q=${encodeURIComponent(cleanText)}`;
            const res = await fetch(url);
            if (res.ok) {
                const html = await res.text();
                const match = html.match(/class="result-container">([\s\S]*?)<\/div>/);
                if (match && match[1]) {
                    const decoded = match[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
                    if (decoded && decoded.trim().length > 0) return decoded.trim();
                }
            }
        } catch (e) {}

        throw new Error('Không thể dịch tự động. Vui lòng kiểm tra lại kết nối mạng.');
    }

    // TTS Speech Engine
    function stopSpeaking() {
        if (typeof window !== 'undefined') {
            if (window.speechSynthesis) {
                try { window.speechSynthesis.cancel(); } catch (e) {}
            }
            if (currentSpeechAudio) {
                try { currentSpeechAudio.pause(); } catch (e) {}
                currentSpeechAudio = null;
            }
        }
        if (currentSpeechBtn) {
            currentSpeechBtn.innerHTML = currentSpeechBtn._origHtml || '🔊';
            currentSpeechBtn.style.color = '';
            currentSpeechBtn = null;
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

        const onStart = () => {
            if (btnEl) {
                currentSpeechBtn = btnEl;
                if (!btnEl._origHtml) btnEl._origHtml = btnEl.innerHTML;
                btnEl.innerHTML = '⏹️';
                btnEl.style.color = '#ef4444';
            }
        };

        const onEnd = () => {
            stopSpeaking();
        };

        const rate = customRate !== null ? customRate : (ttsConfig.rate || 1.0);

        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            try {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(cleanText);
                utterance.lang = 'vi-VN';
                utterance.rate = Math.max(0.5, Math.min(2.0, rate));
                utterance.pitch = Math.max(0.5, Math.min(1.5, ttsConfig.pitch || 1.0));

                const voices = window.speechSynthesis.getVoices();
                let selectedVoice = null;
                if (ttsConfig.voiceURI) {
                    selectedVoice = voices.find(v => v.voiceURI === ttsConfig.voiceURI || v.name === ttsConfig.voiceURI);
                }
                if (!selectedVoice) {
                    selectedVoice = voices.find(v => v.lang && (v.lang.toLowerCase().includes('vi') || v.lang.toLowerCase().includes('vn')));
                }
                if (selectedVoice) utterance.voice = selectedVoice;

                utterance.onstart = onStart;
                utterance.onend = onEnd;
                utterance.onerror = () => {
                    playAudioFallback(cleanText, onStart, onEnd, rate);
                };

                window.speechSynthesis.speak(utterance);
                return;
            } catch (e) {}
        }

        playAudioFallback(cleanText, onStart, onEnd, rate);
    }

    function speakOriginal(text, btnEl = null) {
        if (!text || typeof text !== 'string' || text.trim().length === 0) return;
        const cleanText = text.trim();

        if (currentSpeechBtn === btnEl && btnEl) {
            stopSpeaking();
            return;
        }

        stopSpeaking();

        const onStart = () => {
            if (btnEl) {
                currentSpeechBtn = btnEl;
                if (!btnEl._origHtml) btnEl._origHtml = btnEl.innerHTML;
                btnEl.innerHTML = '⏹️';
                btnEl.style.color = '#ef4444';
            }
        };

        const onEnd = () => {
            stopSpeaking();
        };

        const rate = ttsConfig.rate || 1.0;

        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            try {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(cleanText);
                utterance.rate = Math.max(0.5, Math.min(2.0, rate));
                utterance.onstart = onStart;
                utterance.onend = onEnd;
                utterance.onerror = onEnd;
                window.speechSynthesis.speak(utterance);
                return;
            } catch (e) {}
        }
    }

    function playAudioFallback(text, onStart, onEnd, customRate = null) {
        try {
            const shortText = text.length > 180 ? text.substring(0, 180) : text;
            const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(shortText)}`;
            const audio = new Audio(audioUrl);
            currentSpeechAudio = audio;
            const rate = customRate !== null ? customRate : (ttsConfig.rate || 1.0);
            audio.playbackRate = Math.max(0.5, Math.min(2.0, rate));
            if (onStart) onStart();
            audio.onended = () => { currentSpeechAudio = null; if (onEnd) onEnd(); };
            audio.onerror = () => { currentSpeechAudio = null; if (onEnd) onEnd(); };
            audio.play().catch(() => { currentSpeechAudio = null; if (onEnd) onEnd(); });
        } catch (e) {
            if (onEnd) onEnd();
        }
    }

    // Save text to BANG_TAM
    function doSaveToBangTam(text) {
        if (!text || text.trim().length === 0) return;
        const trimmed = text.trim();
        lastCopiedText = trimmed;
        lastCopyTime = Date.now();

        hideFloatingWidgets();

        try {
            chrome.runtime.sendMessage({
                action: 'AUTO_COPY_SAVE',
                data: {
                    text: trimmed,
                    url: window.location.href,
                    title: document.title || window.location.href
                }
            }, () => {
                showToast('Đã lưu vào Bảng tạm');
            });
        } catch (e) {
            showToast('Đã lưu vào Bảng tạm');
        }
    }

    function hideFloatingToolbar() {
        clearTimeout(autoDismissTimer);
        const tb = document.getElementById('infosys-floating-toolbar');
        if (tb) tb.remove();
    }

    function hideTranslateCard() {
        stopSpeaking();
        const tc = document.getElementById('infosys-translate-card');
        if (tc) tc.remove();
    }

    function hideFloatingWidgets() {
        hideFloatingToolbar();
        hideTranslateCard();
    }

    // Google Translate Popup Card
    async function showGoogleTranslateCard(rect, text) {
        hideFloatingWidgets();

        const card = document.createElement('div');
        card.id = 'infosys-translate-card';
        card.style.cssText = `
            position: fixed !important;
            width: 330px !important;
            max-width: calc(100vw - 28px) !important;
            background: #ffffff !important;
            color: #202124 !important;
            border-radius: 14px !important;
            box-shadow: 0 16px 40px rgba(0,0,0,0.24), 0 4px 12px rgba(0,0,0,0.12) !important;
            border: 1px solid #dadce0 !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
            z-index: 2147483647 !important;
            overflow: hidden !important;
            animation: infosys-fade-in 0.18s ease-out !important;
            line-height: 1.5 !important;
            box-sizing: border-box !important;
        `;

        // Position smoothly relative to viewport
        let posX = Math.max(12, Math.min(window.innerWidth - 346, (rect.left || 20)));
        let posY = (rect.bottom || 60) + 10;
        if (posY + 260 > window.innerHeight) {
            posY = Math.max(12, (rect.top || 100) - 240);
        }
        card.style.left = `${posX}px`;
        card.style.top = `${posY}px`;

        card.innerHTML = `
            <div style="background: #f8fafd; border-bottom: 1px solid #e8eaed; padding: 9px 12px; display: flex; justify-content: space-between; align-items: center; user-select: none;">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <div style="background:#1a73e8; border-radius:6px; width:22px; height:22px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; font-weight:bold;">G</div>
                    <span style="font-weight: 700; font-size: 13px; color: #1a73e8;">Google Dịch</span>
                    <span style="background: #e8f0fe; color: #1967d2; font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 8px;">➔ Tiếng Việt</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <button class="infosys-speed-pill" id="infosys-card-speed-btn" style="background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 10px; cursor: pointer;" title="Bấm để đổi tốc độ đọc (0.75x, 1x, 1.25x, 1.5x, 2x)">
                        ⚡ ${ttsConfig.rate}x
                    </button>
                    <button id="infosys-close-trans" style="background: transparent; border: none; font-size: 16px; color: #5f6368; cursor: pointer; padding: 2px 6px; border-radius: 4px; line-height: 1;" title="Đóng">✕</button>
                </div>
            </div>

            <div style="padding: 12px; max-height: 240px; overflow-y: auto;">
                <div style="font-size: 11px; color: #5f6368; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600;">Văn bản gốc:</span>
                    <button id="infosys-speak-orig" style="background: transparent; border: none; color: #1a73e8; cursor: pointer; font-size: 11px; font-weight:600; display: flex; align-items: center; gap: 3px; padding: 1px 4px;" title="Nghe văn bản gốc">🔊 Nghe</button>
                </div>
                <div style="font-size: 12px; color: #3c4043; background: #f8f9fa; padding: 6px 10px; border-radius: 6px; margin-bottom: 10px; word-break: break-word; max-height: 65px; overflow-y: auto;">
                    ${text.replace(/</g, '&lt;')}
                </div>

                <div style="font-size: 12px; color: #1a73e8; font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
                    <span>Bản dịch Tiếng Việt:</span>
                </div>
                <div id="infosys-trans-loading" style="display: flex; align-items: center; gap: 8px; color: #1a73e8; font-size: 13px; padding: 10px 0;">
                    <span style="display: inline-block; width: 14px; height: 14px; border: 2px solid #e8eaed; border-top-color: #1a73e8; border-radius: 50%; animation: infosys-spin 0.8s linear infinite;"></span>
                    <span>Đang dịch tức thì...</span>
                </div>
                <div id="infosys-trans-output" style="display: none; font-size: 14px; font-weight: 500; color: #1e293b; line-height: 1.5; word-break: break-word; background: #eff6ff; padding: 9px 12px; border-radius: 8px; border: 1px solid #bfdbfe;">
                </div>
            </div>

            <div style="background: #f8fafd; border-top: 1px solid #e8eaed; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; gap: 6px; flex-wrap: wrap;">
                <div style="display: flex; gap: 6px;">
                    <button id="infosys-speak-trans" style="background: #ffffff; border: 1px solid #dadce0; border-radius: 6px; padding: 4px 9px; font-size: 12px; font-weight: 600; color: #1a73e8; cursor: pointer; display: flex; align-items: center; gap: 4px;" title="Đọc bản dịch tiếng Việt">
                        🔊 Đọc
                    </button>
                    <button id="infosys-copy-trans" style="background: #ffffff; border: 1px solid #dadce0; border-radius: 6px; padding: 4px 9px; font-size: 12px; font-weight: 600; color: #3c4043; cursor: pointer; display: flex; align-items: center; gap: 4px;" title="Sao chép bản dịch">
                        📋 Chép
                    </button>
                </div>
                <button id="infosys-save-trans" style="background: #1a73e8; border: none; border-radius: 6px; padding: 5px 11px; font-size: 12px; font-weight: 600; color: #ffffff; cursor: pointer; display: flex; align-items: center; gap: 4px;" title="Lưu vào Bảng tạm InfoSys">
                    📥 Lưu Bảng tạm
                </button>
            </div>
        `;

        (document.body || document.documentElement).appendChild(card);

        // Prevent events inside card from bubbling and collapsing selection
        card.addEventListener('mousedown', (e) => e.stopPropagation());
        card.addEventListener('pointerdown', (e) => e.stopPropagation());

        card.querySelector('#infosys-close-trans').onclick = (e) => {
            e.stopPropagation();
            hideTranslateCard();
        };

        card.querySelector('#infosys-card-speed-btn').onclick = (e) => {
            e.stopPropagation();
            cycleTtsSpeed();
        };

        card.querySelector('#infosys-speak-orig').onclick = (e) => {
            e.stopPropagation();
            speakOriginal(text, e.currentTarget);
        };

        let translatedResult = '';
        try {
            translatedResult = await translateText(text, 'vi');
            const loadEl = card.querySelector('#infosys-trans-loading');
            const outEl = card.querySelector('#infosys-trans-output');
            if (loadEl && outEl) {
                loadEl.style.display = 'none';
                outEl.style.display = 'block';
                outEl.textContent = translatedResult;
            }
        } catch (err) {
            const loadEl = card.querySelector('#infosys-trans-loading');
            if (loadEl) loadEl.innerHTML = `<span style="color:#dc2626;">⚠️ ${err.message || 'Lỗi dịch thuật'}</span>`;
        }

        card.querySelector('#infosys-speak-trans').onclick = (e) => {
            e.stopPropagation();
            if (translatedResult) speakVietnamese(translatedResult, e.currentTarget);
        };

        card.querySelector('#infosys-copy-trans').onclick = (e) => {
            e.stopPropagation();
            if (translatedResult) {
                navigator.clipboard.writeText(translatedResult);
                showToast('Đã sao chép bản dịch');
            }
        };

        card.querySelector('#infosys-save-trans').onclick = (e) => {
            e.stopPropagation();
            if (translatedResult) {
                doSaveToBangTam(translatedResult);
                hideTranslateCard();
            }
        };
    }

    // Floating Toolbar Widget near Highlighted text
    function showFloatingToolbar(rect, text) {
        hideFloatingWidgets();

        const bar = document.createElement('div');
        bar.id = 'infosys-floating-toolbar';
        bar.style.cssText = `
            position: fixed !important;
            background: #0f172a !important;
            color: #ffffff !important;
            border-radius: 24px !important;
            padding: 3px 6px !important;
            box-shadow: 0 8px 24px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.2) !important;
            border: 1px solid #334155 !important;
            display: flex !important;
            align-items: center !important;
            gap: 4px !important;
            z-index: 2147483647 !important;
            user-select: none !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            animation: infosys-fade-in 0.15s ease-out !important;
            box-sizing: border-box !important;
        `;

        // Position centrally right above the selection (or below if top space is limited)
        let posX = Math.max(8, Math.min(window.innerWidth - 240, rect.left + (rect.width / 2) - 100));
        let posY = rect.top - 40;
        if (posY < 10) posY = rect.bottom + 8;

        bar.style.left = `${posX}px`;
        bar.style.top = `${posY}px`;

        bar.innerHTML = `
            <button id="infosys-tb-trans" style="background: #1a73e8; border: none; color: #ffffff; padding: 4px 10px; border-radius: 14px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: transform 0.15s, background 0.15s; box-shadow: 0 2px 6px rgba(26,115,232,0.4);" onmouseover="this.style.background='#1557b0';" onmouseout="this.style.background='#1a73e8';" title="Dịch sang Tiếng Việt (Google Dịch)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6"></path><path d="m4 14 6-6 2-3"></path><path d="M2 5h12"></path><path d="M7 2h1"></path><path d="m22 22-5-10-5 10"></path><path d="M14 18h6"></path></svg>
                <span>Dịch Google</span>
            </button>
            <button id="infosys-tb-save" style="background: transparent; border: none; color: #38bdf8; padding: 4px 7px; border-radius: 14px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: background 0.15s;" onmouseover="this.style.background='#1e293b'" onmouseout="this.style.background='transparent'" title="Lưu vào Bảng tạm InfoSys">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                <span>Lưu</span>
            </button>
            <button id="infosys-tb-speak" style="background: transparent; border: none; color: #22c55e; padding: 4px 7px; border-radius: 14px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: background 0.15s;" onmouseover="this.style.background='#1e293b'" onmouseout="this.style.background='transparent'" title="Đọc Tiếng Việt">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                <span>Đọc</span>
            </button>
            <button class="infosys-speed-pill" id="infosys-tb-speed" style="background: #1e293b; border: 1px solid #475569; color: #93c5fd; padding: 2px 7px; border-radius: 10px; font-size: 11px; font-weight: 700; cursor: pointer;" title="Đổi tốc độ đọc (0.75x, 1x, 1.25x, 1.5x, 2x)">
                ⚡ ${ttsConfig.rate}x
            </button>
            <button id="infosys-tb-close" style="background: transparent; border: none; color: #94a3b8; padding: 4px; border-radius: 50%; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1;" title="Đóng">✕</button>
        `;

        (document.body || document.documentElement).appendChild(bar);

        // Prevent events inside bar from collapsing selection
        bar.addEventListener('mousedown', (e) => e.stopPropagation());
        bar.addEventListener('pointerdown', (e) => e.stopPropagation());

        bar.querySelector('#infosys-tb-trans').onclick = (e) => {
            e.stopPropagation();
            showGoogleTranslateCard(rect, text);
        };

        bar.querySelector('#infosys-tb-save').onclick = (e) => {
            e.stopPropagation();
            doSaveToBangTam(text);
        };

        bar.querySelector('#infosys-tb-speak').onclick = (e) => {
            e.stopPropagation();
            speakVietnamese(text, e.currentTarget);
        };

        bar.querySelector('#infosys-tb-speed').onclick = (e) => {
            e.stopPropagation();
            cycleTtsSpeed();
        };

        bar.querySelector('#infosys-tb-close').onclick = (e) => {
            e.stopPropagation();
            hideFloatingToolbar();
        };

        clearTimeout(autoDismissTimer);
        autoDismissTimer = setTimeout(() => {
            hideFloatingToolbar();
        }, 12000);
    }

    // Handle selection on web page
    function doShowSelectionToolbar() {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
            hideFloatingToolbar();
            return;
        }

        const text = sel.toString().trim();
        if (!text || text.length === 0) {
            hideFloatingToolbar();
            return;
        }

        currentSelectedText = text;
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (!rect || (rect.width === 0 && rect.height === 0)) {
            hideFloatingToolbar();
            return;
        }

        showFloatingToolbar(rect, text);
    }

    function updateSelection() {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(['infosys_floating_icon_enabled'], (res) => {
                if (res && res.infosys_floating_icon_enabled === false) {
                    isFloatingEnabled = false;
                    hideFloatingWidgets();
                    return;
                }
                isFloatingEnabled = true;
                doShowSelectionToolbar();
            });
        } else {
            if (!isFloatingEnabled) {
                hideFloatingWidgets();
                return;
            }
            doShowSelectionToolbar();
        }
    }

    function scheduleSelectionCheck() {
        clearTimeout(selectionTimeout);
        selectionTimeout = setTimeout(updateSelection, 60);
    }

    // Global listeners
    document.addEventListener('mouseup', scheduleSelectionCheck, true);
    document.addEventListener('touchend', scheduleSelectionCheck, true);
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Shift' || e.key.includes('Arrow') || (e.ctrlKey && e.key === 'a')) {
            scheduleSelectionCheck();
        }
    }, true);

    document.addEventListener('mousedown', (e) => {
        if (e.target && e.target.closest && (e.target.closest('#infosys-floating-toolbar') || e.target.closest('#infosys-translate-card'))) {
            return;
        }
        setTimeout(() => {
            const sel = window.getSelection();
            if (!sel || sel.isCollapsed) {
                hideFloatingWidgets();
            }
        }, 100);
    }, true);

    // Add keyframes CSS to document head
    if (typeof document !== 'undefined') {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes infosys-fade-in { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
            @keyframes infosys-spin { to { transform: rotate(360deg); } }
        `;
        (document.head || document.documentElement).appendChild(style);
    }

    // Ctrl + C copy event
    document.addEventListener('copy', () => {
        setTimeout(() => {
            const selection = window.getSelection().toString().trim();
            const now = Date.now();
            if (!selection || selection.length < 1) return;

            if (selection === lastCopiedText && (now - lastCopyTime) < 1500) {
                hideFloatingToolbar();
                return;
            }
            lastCopiedText = selection;
            lastCopyTime = now;
            hideFloatingToolbar();
            doSaveToBangTam(selection);
        }, 20);
    }, true);
})();

