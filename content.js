// ============================================================
//  InfoSys Extension — Content Script
//  - Icon Dịch Google & Thanh nổi khi bôi đen văn bản trên web
//  - Khung xem bản dịch chuẩn Google Translate Popup (Kéo thả, Ghim, Đổi ngôn ngữ, Sửa bản dịch, Gắn tag)
//  - Đọc Tiếng Việt (TTS) tùy chỉnh tốc độ & giọng đọc
//  - Bật / Tắt tức thì từ Extension & Chuột phải
// ============================================================

(function() {
    let isFloatingEnabled = true;
    let isCardPinned = false;
    let currentTargetLang = 'vi';
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

    const SUPPORTED_LANGUAGES = [
        { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
        { code: 'en', name: 'Tiếng Anh', flag: '🇬🇧' },
        { code: 'zh-CN', name: 'Tiếng Trung', flag: '🇨🇳' },
        { code: 'ja', name: 'Tiếng Nhật', flag: '🇯🇵' },
        { code: 'ko', name: 'Tiếng Hàn', flag: '🇰🇷' },
        { code: 'fr', name: 'Tiếng Pháp', flag: '🇫🇷' },
        { code: 'de', name: 'Tiếng Đức', flag: '🇩🇪' },
        { code: 'ru', name: 'Tiếng Nga', flag: '🇷🇺' },
        { code: 'es', name: 'Tây Ban Nha', flag: '🇪🇸' },
        { code: 'th', name: 'Tiếng Thái', flag: '🇹🇭' }
    ];

    const QUICK_TAGS = ['Từ vựng', 'Ghi chú', 'Quan trọng', 'Học hỏi', 'Công việc', 'Dịch thuật'];

    // Load initial settings from Extension storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['infosys_floating_icon_enabled', 'infosys_tts_rate', 'infosys_tts_voice', 'infosys_tts_pitch', 'infosys_target_lang'], (res) => {
            if (res) {
                if (res.infosys_floating_icon_enabled !== undefined) isFloatingEnabled = res.infosys_floating_icon_enabled !== false;
                if (res.infosys_tts_rate !== undefined) ttsConfig.rate = parseFloat(res.infosys_tts_rate) || 1.0;
                if (res.infosys_tts_voice !== undefined) ttsConfig.voiceURI = res.infosys_tts_voice || '';
                if (res.infosys_tts_pitch !== undefined) ttsConfig.pitch = parseFloat(res.infosys_tts_pitch) || 1.0;
                if (res.infosys_target_lang) currentTargetLang = res.infosys_target_lang;
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
                if (changes.infosys_target_lang) currentTargetLang = changes.infosys_target_lang.newValue || 'vi';
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
                    const rect = (sel && sel.rangeCount > 0) ? sel.getRangeAt(0).getBoundingClientRect() : { left: window.innerWidth / 2 - 170, top: 120, bottom: 140, width: 200, height: 20 };
                    showGoogleTranslateCard(rect, text);
                }
            } else if (msg && msg.action === 'TRIGGER_SPEAK') {
                const text = msg.text || window.getSelection().toString().trim();
                if (text) {
                    speakInLang(text, 'vi', null);
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

    function speakInLang(text, langCode = 'vi', btnEl = null, customRate = null) {
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
                utterance.lang = langCode;
                utterance.rate = Math.max(0.5, Math.min(2.0, rate));
                utterance.pitch = Math.max(0.5, Math.min(1.5, ttsConfig.pitch || 1.0));

                const voices = window.speechSynthesis.getVoices();
                let selectedVoice = null;
                if (langCode === 'vi' && ttsConfig.voiceURI) {
                    selectedVoice = voices.find(v => v.voiceURI === ttsConfig.voiceURI || v.name === ttsConfig.voiceURI);
                }
                if (!selectedVoice) {
                    selectedVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(langCode.substring(0, 2).toLowerCase()));
                }
                if (selectedVoice) utterance.voice = selectedVoice;

                utterance.onstart = onStart;
                utterance.onend = onEnd;
                utterance.onerror = () => {
                    playAudioFallback(cleanText, langCode, onStart, onEnd, rate);
                };

                window.speechSynthesis.speak(utterance);
                return;
            } catch (e) {}
        }

        playAudioFallback(cleanText, langCode, onStart, onEnd, rate);
    }

    function playAudioFallback(text, langCode, onStart, onEnd, customRate = null) {
        try {
            const shortText = text.length > 180 ? text.substring(0, 180) : text;
            const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encodeURIComponent(shortText)}`;
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
    function doSaveToBangTam(text, customTag = null) {
        if (!text || text.trim().length === 0) return;
        const trimmed = text.trim();
        lastCopiedText = trimmed;
        lastCopyTime = Date.now();

        if (!isCardPinned) {
            hideFloatingWidgets();
        }

        try {
            chrome.runtime.sendMessage({
                action: 'AUTO_COPY_SAVE',
                data: {
                    text: trimmed,
                    url: window.location.href,
                    title: document.title || window.location.href,
                    tag: customTag
                }
            }, () => {
                showToast(customTag ? `Đã lưu [${customTag}] vào Bảng tạm` : 'Đã lưu vào Bảng tạm');
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
        if (isCardPinned) return;
        stopSpeaking();
        const tc = document.getElementById('infosys-translate-card');
        if (tc) tc.remove();
    }

    function forceHideTranslateCard() {
        isCardPinned = false;
        stopSpeaking();
        const tc = document.getElementById('infosys-translate-card');
        if (tc) tc.remove();
    }

    function hideFloatingWidgets() {
        hideFloatingToolbar();
        hideTranslateCard();
    }

    // Google Translate Popup Card (Clean, Spacious & Intuitive UI)
    async function showGoogleTranslateCard(rect, text) {
        hideFloatingToolbar();
        const existingCard = document.getElementById('infosys-translate-card');
        if (existingCard) existingCard.remove();

        const card = document.createElement('div');
        card.id = 'infosys-translate-card';
        card.style.cssText = `
            position: fixed !important;
            width: 440px !important;
            max-width: calc(100vw - 24px) !important;
            background: #ffffff !important;
            color: #0f172a !important;
            border-radius: 16px !important;
            box-shadow: 0 20px 45px -8px rgba(15,23,42,0.25), 0 8px 16px -4px rgba(15,23,42,0.1) !important;
            border: 1px solid #cbd5e1 !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
            z-index: 2147483647 !important;
            overflow: hidden !important;
            animation: infosys-fade-in 0.18s cubic-bezier(0.16, 1, 0.3, 1) !important;
            line-height: 1.5 !important;
            box-sizing: border-box !important;
        `;

        // Position smoothly relative to viewport
        let posX = Math.max(12, Math.min(window.innerWidth - 456, (rect.left || 20)));
        let posY = (rect.bottom || 60) + 10;
        if (posY + 360 > window.innerHeight) {
            posY = Math.max(12, (rect.top || 100) - 340);
        }
        card.style.left = `${posX}px`;
        card.style.top = `${posY}px`;

        let selectedTag = 'Dịch thuật';

        card.innerHTML = `
            <!-- Top Header Bar (Draggable) -->
            <div id="infosys-card-header" style="background: #ffffff; border-bottom: 1px solid #f1f5f9; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; cursor: grab; user-select: none;">
                <!-- Left: Logo & Language Selector -->
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="background: #1a73e8; border-radius: 6px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 12px; font-weight: 800; flex-shrink: 0; box-shadow: 0 2px 4px rgba(26,115,232,0.3);">G</div>
                    <span style="font-weight: 700; font-size: 13.5px; color: #1a73e8; letter-spacing: -0.2px;">Google Dịch</span>
                    <div style="display: flex; align-items: center; gap: 3px; background: #eff6ff; border: 1px solid #bfdbfe; padding: 2px 8px; border-radius: 20px;">
                        <span style="font-size: 11px; font-weight: 700; color: #1d4ed8;">➔</span>
                        <select id="infosys-target-lang-select" style="background: transparent; border: none; font-size: 12px; font-weight: 700; color: #1d4ed8; cursor: pointer; outline: none; padding: 1px 2px;">
                        </select>
                    </div>
                    <button id="infosys-swap-lang-btn" style="background: #f8fafc; border: 1px solid #e2e8f0; font-size: 13px; color: #1a73e8; cursor: pointer; padding: 3px 6px; border-radius: 6px; display: flex; align-items: center; transition: all 0.15s;" onmouseover="this.style.background='#e0f2fe'" onmouseout="this.style.background='#f8fafc'" title="Đổi chiều ngôn ngữ">⇄</button>
                </div>

                <!-- Right: Speed, Pin, External, Close -->
                <div style="display: flex; align-items: center; gap: 5px;">
                    <button class="infosys-speed-pill" id="infosys-card-speed-btn" style="background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-size: 11.5px; font-weight: 700; padding: 2px 8px; border-radius: 12px; cursor: pointer; transition: all 0.15s;" title="Đổi tốc độ đọc (0.75x, 1x, 1.25x, 1.5x, 2x)">
                        ⚡ ${ttsConfig.rate}x
                    </button>
                    <button id="infosys-pin-card-btn" style="background: #f8fafc; border: 1px solid #e2e8f0; font-size: 13px; color: #64748b; cursor: pointer; padding: 3px 7px; border-radius: 6px; transition: all 0.15s;" title="Ghim popup (không tự tắt khi click ra ngoài)">
                        📌
                    </button>
                    <button id="infosys-open-external-btn" style="background: #f8fafc; border: 1px solid #e2e8f0; font-size: 12px; color: #64748b; cursor: pointer; padding: 3px 7px; border-radius: 6px; font-weight: bold; transition: all 0.15s;" onmouseover="this.style.color='#1a73e8'" onmouseout="this.style.color='#64748b'" title="Mở trang Google Dịch đầy đủ">
                        ↗
                    </button>
                    <button id="infosys-close-trans" style="background: transparent; border: none; font-size: 15px; color: #94a3b8; cursor: pointer; padding: 3px 7px; border-radius: 6px; line-height: 1; transition: all 0.15s;" onmouseover="this.style.color='#ef4444'; this.style.background='#fee2e2';" onmouseout="this.style.color='#94a3b8'; this.style.background='transparent';" title="Đóng">✕</button>
                </div>
            </div>

            <!-- Body Container -->
            <div style="padding: 14px 16px 10px 16px; max-height: 380px; overflow-y: auto;">
                <!-- 1. Original Text Pane -->
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 9px 12px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <span style="font-size: 10.5px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Văn bản gốc</span>
                        <div style="display: flex; gap: 4px;">
                            <button id="infosys-speak-orig" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 5px; color: #0284c7; cursor: pointer; font-size: 11px; font-weight: 600; padding: 2px 7px; display: inline-flex; align-items: center; gap: 3px; transition: all 0.15s;" onmouseover="this.style.background='#e0f2fe'" onmouseout="this.style.background='#ffffff'" title="Nghe phát âm gốc">🔊 Nghe</button>
                            <button id="infosys-copy-orig" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 5px; color: #475569; cursor: pointer; font-size: 11px; font-weight: 600; padding: 2px 7px; display: inline-flex; align-items: center; gap: 3px; transition: all 0.15s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#ffffff'" title="Sao chép văn bản gốc">📋 Chép</button>
                        </div>
                    </div>
                    <div id="infosys-orig-display" style="font-size: 13px; color: #334155; line-height: 1.45; word-break: break-word; max-height: 70px; overflow-y: auto; padding-right: 4px;">
                        ${text.replace(/</g, '&lt;')}
                    </div>
                </div>

                <!-- 2. Translated Text Pane (Editable) -->
                <div style="background: #f0f7ff; border: 1.5px solid #93c5fd; border-radius: 10px; padding: 10px 12px; margin-bottom: 12px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="font-size: 11px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; letter-spacing: 0.5px;">
                            Bản dịch <span id="infosys-trans-lang-label" style="font-weight: 600; color: #3b82f6; text-transform: none;">(Tiếng Việt)</span>
                        </span>
                        <div style="display: flex; gap: 4px;">
                            <button id="infosys-speak-trans" style="background: #ffffff; border: 1px solid #bfdbfe; border-radius: 5px; color: #1d4ed8; cursor: pointer; font-size: 11px; font-weight: 700; padding: 2px 8px; display: inline-flex; align-items: center; gap: 3px; transition: all 0.15s;" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#ffffff'" title="Đọc bản dịch">🔊 Đọc</button>
                            <button id="infosys-copy-trans" style="background: #ffffff; border: 1px solid #bfdbfe; border-radius: 5px; color: #1e40af; cursor: pointer; font-size: 11px; font-weight: 600; padding: 2px 8px; display: inline-flex; align-items: center; gap: 3px; transition: all 0.15s;" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#ffffff'" title="Sao chép bản dịch">📋 Chép</button>
                        </div>
                    </div>
                    <div id="infosys-trans-loading" style="display: flex; align-items: center; gap: 8px; color: #1d4ed8; font-size: 13px; padding: 12px 0;">
                        <span style="display: inline-block; width: 15px; height: 15px; border: 2.5px solid #bfdbfe; border-top-color: #1d4ed8; border-radius: 50%; animation: infosys-spin 0.8s linear infinite;"></span>
                        <span style="font-weight: 500;">Đang dịch tức thì...</span>
                    </div>
                    <textarea id="infosys-trans-output" style="display: none; width: 100%; min-height: 75px; max-height: 140px; font-size: 14px; font-weight: 500; color: #0f172a; line-height: 1.55; word-break: break-word; background: transparent; border: none; outline: none; resize: none; box-sizing: border-box; font-family: inherit; padding: 0; margin: 0;" placeholder="Bản dịch..."></textarea>
                </div>

                <!-- 3. Quick Tag Selector -->
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                    <span style="font-size: 11px; font-weight: 700; color: #64748b; display: inline-flex; align-items: center; gap: 2px;">🏷️ Tag:</span>
                    <div id="infosys-tag-selector" style="display: inline-flex; gap: 5px; flex-wrap: wrap;">
                    </div>
                </div>
            </div>

            <!-- Footer Action Bar -->
            <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 9px 14px; display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                <span style="font-size: 11px; color: #64748b; font-weight: 500;">💡 Có thể sửa trực tiếp bản dịch trước khi lưu</span>
                <button id="infosys-save-trans" style="background: #1a73e8; border: none; border-radius: 8px; padding: 6px 14px; font-size: 12.5px; font-weight: 700; color: #ffffff; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.15s; box-shadow: 0 2px 6px rgba(26,115,232,0.35);" onmouseover="this.style.background='#1557b0';" onmouseout="this.style.background='#1a73e8';" title="Lưu bản dịch vào Bảng tạm InfoSys">
                    <span>📥 Lưu Bảng tạm</span>
                </button>
            </div>
        `;

        (document.body || document.documentElement).appendChild(card);

        // Prevent events inside card from bubbling and collapsing selection or triggering document listeners
        card.addEventListener('mousedown', (e) => e.stopPropagation());
        card.addEventListener('pointerdown', (e) => e.stopPropagation());
        card.addEventListener('mouseup', (e) => e.stopPropagation());
        card.addEventListener('click', (e) => e.stopPropagation());

        // 1. Dragging Logic
        const header = card.querySelector('#infosys-card-header');
        let isDragging = false;
        let startMouseX = 0, startMouseY = 0;
        let cardStartLeft = 0, cardStartTop = 0;

        header.onpointerdown = (e) => {
            if (e.target.closest('button') || e.target.closest('select')) return;
            isDragging = true;
            header.style.cursor = 'grabbing';
            startMouseX = e.clientX;
            startMouseY = e.clientY;
            cardStartLeft = card.offsetLeft;
            cardStartTop = card.offsetTop;
            header.setPointerCapture(e.pointerId);
        };

        header.onpointermove = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startMouseX;
            const dy = e.clientY - startMouseY;
            let newLeft = Math.max(8, Math.min(window.innerWidth - card.offsetWidth - 8, cardStartLeft + dx));
            let newTop = Math.max(8, Math.min(window.innerHeight - card.offsetHeight - 8, cardStartTop + dy));
            card.style.left = `${newLeft}px`;
            card.style.top = `${newTop}px`;
        };

        header.onpointerup = (e) => {
            if (isDragging) {
                isDragging = false;
                header.style.cursor = 'grab';
                try { header.releasePointerCapture(e.pointerId); } catch(err) {}
            }
        };

        // 2. Pin Button
        const pinBtn = card.querySelector('#infosys-pin-card-btn');
        pinBtn.onclick = (e) => {
            e.stopPropagation();
            isCardPinned = !isCardPinned;
            if (isCardPinned) {
                pinBtn.style.background = '#e0f2fe';
                pinBtn.style.color = '#0284c7';
                pinBtn.style.border = '1px solid #7dd3fc';
                pinBtn.title = 'Đã ghim popup (Bấm để bỏ ghim)';
                showToast('📌 Đã ghim Popup');
            } else {
                pinBtn.style.background = '#f8fafc';
                pinBtn.style.color = '#64748b';
                pinBtn.style.border = '1px solid #e2e8f0';
                pinBtn.title = 'Ghim popup (không tự tắt khi click ra ngoài)';
                showToast('Đã bỏ ghim Popup');
            }
        };

        // 3. Open External Google Translate Tab
        card.querySelector('#infosys-open-external-btn').onclick = (e) => {
            e.stopPropagation();
            const url = `https://translate.google.com/?sl=auto&tl=${currentTargetLang}&text=${encodeURIComponent(text)}`;
            window.open(url, '_blank');
        };

        // 4. Close Button
        card.querySelector('#infosys-close-trans').onclick = (e) => {
            e.stopPropagation();
            forceHideTranslateCard();
        };

        // 5. Speed Toggle
        card.querySelector('#infosys-card-speed-btn').onclick = (e) => {
            e.stopPropagation();
            cycleTtsSpeed();
        };

        // 6. Target Language Selector & Translation Function
        const langSelect = card.querySelector('#infosys-target-lang-select');
        SUPPORTED_LANGUAGES.forEach(l => {
            const opt = document.createElement('option');
            opt.value = l.code;
            opt.textContent = `${l.flag} ${l.name}`;
            if (l.code === currentTargetLang) opt.selected = true;
            langSelect.appendChild(opt);
        });

        async function reTranslate(newLang, textToTranslate) {
            currentTargetLang = newLang;
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ infosys_target_lang: newLang });
            }
            const langObj = SUPPORTED_LANGUAGES.find(x => x.code === newLang);
            const langLabel = card.querySelector('#infosys-trans-lang-label');
            if (langLabel) langLabel.textContent = `(${langObj ? langObj.name : newLang})`;

            const loadEl = card.querySelector('#infosys-trans-loading');
            const outEl = card.querySelector('#infosys-trans-output');
            if (loadEl && outEl) {
                loadEl.style.display = 'flex';
                outEl.style.display = 'none';
            }

            try {
                const res = await translateText(textToTranslate, newLang);
                if (loadEl && outEl) {
                    loadEl.style.display = 'none';
                    outEl.style.display = 'block';
                    outEl.value = res;
                    // Auto adjust textarea height smoothly
                    outEl.style.height = 'auto';
                    outEl.style.height = Math.min(140, Math.max(70, outEl.scrollHeight)) + 'px';
                }
            } catch (err) {
                if (loadEl) loadEl.innerHTML = `<span style="color:#dc2626; font-weight:600;">⚠️ ${err.message || 'Lỗi dịch'}</span>`;
            }
        }

        langSelect.onchange = (e) => {
            e.stopPropagation();
            reTranslate(e.target.value, text);
        };

        card.querySelector('#infosys-swap-lang-btn').onclick = (e) => {
            e.stopPropagation();
            const nextLang = currentTargetLang === 'vi' ? 'en' : 'vi';
            langSelect.value = nextLang;
            reTranslate(nextLang, text);
        };

        // 7. Original Audio & Copy
        card.querySelector('#infosys-speak-orig').onclick = (e) => {
            e.stopPropagation();
            speakInLang(text, 'auto', e.currentTarget);
        };

        card.querySelector('#infosys-copy-orig').onclick = (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(text);
            showToast('Đã sao chép văn bản gốc');
        };

        // 8. Quick Tags
        const tagContainer = card.querySelector('#infosys-tag-selector');
        QUICK_TAGS.forEach((tag) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = tag;
            const isDefault = tag === selectedTag;
            btn.style.cssText = `
                background: ${isDefault ? '#1a73e8' : '#ffffff'};
                color: ${isDefault ? '#ffffff' : '#475569'};
                border: 1px solid ${isDefault ? '#1a73e8' : '#cbd5e1'};
                padding: 2px 9px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.15s;
            `;
            btn.onmouseover = () => {
                if (selectedTag !== tag) btn.style.background = '#f1f5f9';
            };
            btn.onmouseout = () => {
                if (selectedTag !== tag) btn.style.background = '#ffffff';
            };
            btn.onclick = (e) => {
                e.stopPropagation();
                selectedTag = tag;
                tagContainer.querySelectorAll('button').forEach(b => {
                    b.style.background = '#ffffff';
                    b.style.color = '#475569';
                    b.style.border = '1px solid #cbd5e1';
                });
                btn.style.background = '#1a73e8';
                btn.style.color = '#ffffff';
                btn.style.border = '1px solid #1a73e8';
            };
            tagContainer.appendChild(btn);
        });

        // Initial translation execution
        reTranslate(currentTargetLang, text);

        // 9. Speak Translation
        card.querySelector('#infosys-speak-trans').onclick = (e) => {
            e.stopPropagation();
            const outEl = card.querySelector('#infosys-trans-output');
            const transText = outEl ? outEl.value.trim() : '';
            if (transText) speakInLang(transText, currentTargetLang, e.currentTarget);
        };

        // 10. Copy Translation
        card.querySelector('#infosys-copy-trans').onclick = (e) => {
            e.stopPropagation();
            const outEl = card.querySelector('#infosys-trans-output');
            const transText = outEl ? outEl.value.trim() : '';
            if (transText) {
                navigator.clipboard.writeText(transText);
                showToast('Đã sao chép bản dịch');
            }
        };

        // 11. Save Translation with Tag
        card.querySelector('#infosys-save-trans').onclick = (e) => {
            e.stopPropagation();
            const outEl = card.querySelector('#infosys-trans-output');
            const finalTranslatedText = outEl ? outEl.value.trim() : '';
            if (finalTranslatedText) {
                doSaveToBangTam(finalTranslatedText, selectedTag);
                if (!isCardPinned) forceHideTranslateCard();
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
            <button id="infosys-tb-trans" style="background: #1a73e8; border: none; color: #ffffff; padding: 4px 10px; border-radius: 14px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: transform 0.15s, background 0.15s; box-shadow: 0 2px 6px rgba(26,115,232,0.4);" onmouseover="this.style.background='#1557b0';" onmouseout="this.style.background='#1a73e8';" title="Dịch văn bản với Google Dịch">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6"></path><path d="m4 14 6-6 2-3"></path><path d="M2 5h12"></path><path d="M7 2h1"></path><path d="m22 22-5-10-5 10"></path><path d="M14 18h6"></path></svg>
                <span>Dịch Google</span>
            </button>
            <button id="infosys-tb-save" style="background: transparent; border: none; color: #38bdf8; padding: 4px 7px; border-radius: 14px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: background 0.15s;" onmouseover="this.style.background='#1e293b'" onmouseout="this.style.background='transparent'" title="Lưu vào Bảng tạm InfoSys">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                <span>Lưu</span>
            </button>
            <button id="infosys-tb-speak" style="background: transparent; border: none; color: #22c55e; padding: 4px 7px; border-radius: 14px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: background 0.15s;" onmouseover="this.style.background='#1e293b'" onmouseout="this.style.background='transparent'" title="Đọc phát âm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                <span>Đọc</span>
            </button>
            <button id="infosys-tb-toolbox" style="background: transparent; border: none; color: #c084fc; padding: 4px 7px; border-radius: 14px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: background 0.15s;" onmouseover="this.style.background='#1e293b'" onmouseout="this.style.background='transparent'" title="Mở ToolBox Suite (Chụp màn hình, Color Picker, Downloader)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                <span>ToolBox</span>
            </button>
            <button class="infosys-speed-pill" id="infosys-tb-speed" style="background: #1e293b; border: 1px solid #475569; color: #93c5fd; padding: 2px 7px; border-radius: 10px; font-size: 11px; font-weight: 700; cursor: pointer;" title="Đổi tốc độ đọc (0.75x, 1x, 1.25x, 1.5x, 2x)">
                ⚡ ${ttsConfig.rate}x
            </button>
            <button id="infosys-tb-close" style="background: transparent; border: none; color: #94a3b8; padding: 4px; border-radius: 50%; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1;" title="Đóng">✕</button>
        `;

        (document.body || document.documentElement).appendChild(bar);

        // Prevent events inside bar from collapsing selection or bubbling to document
        bar.addEventListener('mousedown', (e) => e.stopPropagation());
        bar.addEventListener('pointerdown', (e) => e.stopPropagation());
        bar.addEventListener('mouseup', (e) => e.stopPropagation());
        bar.addEventListener('click', (e) => e.stopPropagation());

        bar.querySelector('#infosys-tb-trans').onclick = (e) => {
            e.stopPropagation();
            showGoogleTranslateCard(rect, text);
        };

        bar.querySelector('#infosys-tb-toolbox').onclick = (e) => {
            e.stopPropagation();
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                chrome.runtime.sendMessage({ action: 'OPEN_TOOLBOX' });
            }
        };

        bar.querySelector('#infosys-tb-save').onclick = (e) => {
            e.stopPropagation();
            doSaveToBangTam(text);
        };

        bar.querySelector('#infosys-tb-speak').onclick = (e) => {
            e.stopPropagation();
            speakInLang(text, 'vi', e.currentTarget);
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
        if (document.getElementById('infosys-translate-card')) {
            return; // Never replace or dismiss translate card while it is open
        }
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
        if (document.getElementById('infosys-translate-card')) {
            return; // Translate card is active, do not overwrite with floating toolbar
        }
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

    function scheduleSelectionCheck(e) {
        if (e && e.target && e.target.closest && (e.target.closest('#infosys-floating-toolbar') || e.target.closest('#infosys-translate-card') || e.target.closest('#infosys-copy-toast'))) {
            return;
        }
        if (document.getElementById('infosys-translate-card')) {
            return; // Keep translate card open!
        }
        clearTimeout(selectionTimeout);
        selectionTimeout = setTimeout(updateSelection, 60);
    }

    // Global listeners
    document.addEventListener('mouseup', scheduleSelectionCheck, true);
    document.addEventListener('touchend', scheduleSelectionCheck, true);
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Shift' || e.key.includes('Arrow') || (e.ctrlKey && e.key === 'a')) {
            scheduleSelectionCheck(e);
        }
    }, true);

    document.addEventListener('mousedown', (e) => {
        if (isCardPinned) return;
        if (e.target && e.target.closest && (e.target.closest('#infosys-floating-toolbar') || e.target.closest('#infosys-translate-card') || e.target.closest('#infosys-copy-toast'))) {
            return;
        }
        setTimeout(() => {
            if (isCardPinned) return;
            const sel = window.getSelection();
            if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
                hideFloatingWidgets();
            }
        }, 150);
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

