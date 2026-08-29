// ============================================================
//  InfoSys Extension — Content Script
//  - Icon Dịch Google & Thanh nổi khi bôi đen văn bản trên web
//  - Khung xem bản dịch chuẩn Google Translate Popup (Kéo thả, Ghim, Đổi ngôn ngữ, Sửa bản dịch, Gắn tag)
//  - Đọc Tiếng Việt (TTS) tùy chỉnh tốc độ & giọng đọc
//  - Bật / Tắt tức thì từ Extension & Chuột phải
// ============================================================

(function() {
    // Only execute on top window to prevent duplicate toolbars, events, and overlapping TTS voices in iframes
    if (window.top !== window.self) return;

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

    let isActionRecorderActive = true;
    let pageVisitLogged = false;

    // Load initial settings from Extension storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['infosys_floating_icon_enabled', 'infosys_tts_rate', 'infosys_tts_voice', 'infosys_tts_pitch', 'infosys_target_lang', 'infosys_action_recorder_enabled'], (res) => {
            if (res) {
                if (res.infosys_floating_icon_enabled !== undefined) isFloatingEnabled = res.infosys_floating_icon_enabled !== false;
                if (res.infosys_tts_rate !== undefined) ttsConfig.rate = parseFloat(res.infosys_tts_rate) || 1.0;
                if (res.infosys_tts_voice !== undefined) ttsConfig.voiceURI = res.infosys_tts_voice || '';
                if (res.infosys_tts_pitch !== undefined) ttsConfig.pitch = parseFloat(res.infosys_tts_pitch) || 1.0;
                if (res.infosys_target_lang) currentTargetLang = res.infosys_target_lang;
                if (res.infosys_action_recorder_enabled !== undefined) {
                    isActionRecorderActive = res.infosys_action_recorder_enabled !== false;
                    if (isActionRecorderActive) logInitialPageVisit();
                } else {
                    isActionRecorderActive = true;
                    logInitialPageVisit();
                }
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
                if (changes.infosys_action_recorder_enabled !== undefined) {
                    isActionRecorderActive = changes.infosys_action_recorder_enabled.newValue !== false;
                    if (isActionRecorderActive) logInitialPageVisit();
                }
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
            } else if (msg && msg.action === 'ACTION_RECORDER_STATE_CHANGED') {
                isActionRecorderActive = msg.enabled !== false;
                if (isActionRecorderActive) {
                    logInitialPageVisit();
                }
            }
        });
    }

    // ============================================================
    //  ACTION RECORDER ENGINE (Theo dõi & Gửi thao tác sang Background)
    // ============================================================
    function isEventInsideExtensionUI(target) {
        if (!target || !target.closest) return false;
        return !!target.closest('#infosys-floating-toolbar, #infosys-translate-card, #infosys-ai-summary-card, #infosys-ocr-result-modal, #infosys-ocr-overlay, #infosys-copy-toast, ocr-container, #infosys-ocr-loading-hud');
    }

    function sendActionToBackground(loai_thao_tac, doi_tuong, noi_dung, thong_tin_them = '') {
        if (!isActionRecorderActive) return;
        try {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({
                    action: 'LOG_USER_ACTION',
                    data: {
                        loai_thao_tac,
                        doi_tuong: String(doi_tuong || '').substring(0, 200),
                        noi_dung: String(noi_dung || '').substring(0, 1000),
                        tieu_de_trang: document.title || '',
                        url_trang: window.location.href || '',
                        thong_tin_them: String(thong_tin_them || '').substring(0, 300)
                    }
                }).catch(() => {});
            }
        } catch (e) {}
    }

    function logInitialPageVisit() {
        if (!isActionRecorderActive || pageVisitLogged) return;
        pageVisitLogged = true;
        sendActionToBackground('TRUY_CAP', 'Mở trang web', window.location.href, document.title);
    }

    // 1. Click tracker
    document.addEventListener('click', (e) => {
        if (!isActionRecorderActive || isEventInsideExtensionUI(e.target)) return;

        const target = e.target;
        const link = target.closest('a');
        if (link) {
            const text = link.innerText.trim() || link.title || link.getAttribute('aria-label') || 'Liên kết';
            sendActionToBackground('CLICK_LINK', text, link.href, link.id ? '#' + link.id : link.className);
            return;
        }

        const btn = target.closest('button, input[type="button"], input[type="submit"], [role="button"]');
        if (btn) {
            const text = btn.innerText.trim() || btn.value || btn.title || btn.getAttribute('aria-label') || 'Nút bấm';
            const info = (btn.id ? '#' + btn.id : '') + (btn.className ? ' .' + btn.className.split(' ').slice(0, 2).join('.') : '');
            sendActionToBackground('CLICK_NUT', text, info || btn.tagName, btn.type || '');
            return;
        }

        const interactive = target.closest('summary, label, select, [data-action], [tabindex]');
        if (interactive) {
            const text = interactive.innerText.trim() || interactive.title || interactive.getAttribute('aria-label') || interactive.tagName;
            sendActionToBackground('CLICK_PHAN_TU', text, interactive.tagName, interactive.id || '');
        }
    }, true);

    // 2. Input / Typing tracker (debounced)
    let inputDebounceTimers = new Map();
    document.addEventListener('input', (e) => {
        if (!isActionRecorderActive || isEventInsideExtensionUI(e.target)) return;
        const target = e.target;
        if (target.type === 'password') return;

        const isInputable = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
        if (!isInputable) return;

        const fieldName = target.name || target.placeholder || target.id || target.getAttribute('aria-label') || (target.tagName.toLowerCase());
        const val = target.isContentEditable ? target.innerText.trim() : (target.value || '').trim();

        if (inputDebounceTimers.has(target)) {
            clearTimeout(inputDebounceTimers.get(target));
        }

        const timer = setTimeout(() => {
            inputDebounceTimers.delete(target);
            if (val.length > 0) {
                sendActionToBackground('NHAP_LIEU', fieldName, val, target.id ? '#' + target.id : '');
            }
        }, 1200);

        inputDebounceTimers.set(target, timer);
    }, true);

    // 3. Form Submit tracker
    document.addEventListener('submit', (e) => {
        if (!isActionRecorderActive || isEventInsideExtensionUI(e.target)) return;
        const form = e.target;
        const formName = form.name || form.id || form.getAttribute('aria-label') || 'Biểu mẫu';
        sendActionToBackground('SUBMIT_FORM', formName, form.action || window.location.href, form.method || 'POST');
    }, true);

    // 4. Paste tracker
    document.addEventListener('paste', (e) => {
        if (!isActionRecorderActive || isEventInsideExtensionUI(e.target)) return;
        const target = e.target;
        if (target && target.type === 'password') return;

        try {
            const pasted = (e.clipboardData || window.clipboardData)?.getData('text');
            if (pasted && pasted.trim()) {
                const fieldName = target ? (target.name || target.placeholder || target.id || 'Vùng dán') : 'Trang web';
                sendActionToBackground('PASTE', fieldName, pasted.trim().substring(0, 500), '');
            }
        } catch (err) {}
    }, true);

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

    // ============================================================
    //  TTS Speech Engine (Hỗ trợ đọc văn bản dài không giới hạn & Chống trùng giọng)
    // ============================================================
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

        const sessionId = ++currentSpeechSessionId;
        const chunks = splitTextIntoChunks(cleanText, 160);
        if (chunks.length === 0) return;

        const onStart = () => {
            if (btnEl) {
                currentSpeechBtn = btnEl;
                if (!btnEl._origHtml) btnEl._origHtml = btnEl.innerHTML;
                btnEl.innerHTML = '⏹️';
                btnEl.style.color = '#ef4444';
            }
        };

        const onEnd = () => {
            if (sessionId === currentSpeechSessionId) {
                stopSpeaking();
            }
        };

        onStart();

        const rate = customRate !== null ? customRate : (ttsConfig.rate || 1.0);
        const pitch = ttsConfig.pitch || 1.0;

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
                    utterance.lang = langCode === 'vi' ? 'vi-VN' : langCode;
                    utterance.rate = Math.max(0.5, Math.min(2.0, rate));
                    utterance.pitch = Math.max(0.5, Math.min(1.5, pitch));

                    const voices = window.speechSynthesis.getVoices();
                    let selectedVoice = null;
                    if (langCode === 'vi' && ttsConfig.voiceURI) {
                        selectedVoice = voices.find(v => v.voiceURI === ttsConfig.voiceURI || v.name === ttsConfig.voiceURI);
                    }
                    if (!selectedVoice) {
                        selectedVoice = voices.find(v => v.lang && (v.lang.toLowerCase().includes('vi') || v.lang.toLowerCase().includes('vn')));
                    }
                    if (!selectedVoice && langCode !== 'vi') {
                        selectedVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(langCode.substring(0, 2).toLowerCase()));
                    }
                    if (selectedVoice) utterance.voice = selectedVoice;

                    utterance.onend = () => {
                        if (sessionId === currentSpeechSessionId) {
                            playNextChunk();
                        }
                    };

                    utterance.onerror = (err) => {
                        console.warn('Utterance error, fallback to audio for remaining chunks:', err);
                        playAudioQueueFallback(chunks.slice(currentChunkIndex - 1), langCode, rate, sessionId, onEnd);
                    };

                    window.speechSynthesis.speak(utterance);
                    return;
                } catch (e) {
                    console.warn('SpeechSynthesis exception:', e);
                }
            }

            playAudioQueueFallback(chunks.slice(currentChunkIndex - 1), langCode, rate, sessionId, onEnd);
        }

        playNextChunk();
    }

    function playAudioQueueFallback(audioChunks, langCode, rate, sessionId, onEnd) {
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
            const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
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

    function hideAiSummaryCard() {
        const sc = document.getElementById('infosys-ai-summary-card');
        if (sc) sc.remove();
    }

    function hideFloatingWidgets() {
        hideFloatingToolbar();
        hideTranslateCard();
        hideAiSummaryCard();
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
            <button id="infosys-tb-summarize" style="background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); border: none; color: #ffffff; padding: 4px 9px; border-radius: 14px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px rgba(124,58,237,0.4);" title="Tóm tắt nội dung bằng AI">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"></path></svg>
                <span>✨ Tóm tắt AI</span>
            </button>
            <button id="infosys-tb-save" style="background: transparent; border: none; color: #38bdf8; padding: 4px 7px; border-radius: 14px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: background 0.15s;" onmouseover="this.style.background='#1e293b'" onmouseout="this.style.background='transparent'" title="Lưu vào Bảng tạm InfoSys">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                <span>Lưu</span>
            </button>
            <button id="infosys-tb-speak" style="background: transparent; border: none; color: #22c55e; padding: 4px 7px; border-radius: 14px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: background 0.15s;" onmouseover="this.style.background='#1e293b'" onmouseout="this.style.background='transparent'" title="Đọc phát âm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                <span>Đọc</span>
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

        bar.querySelector('#infosys-tb-summarize').onclick = (e) => {
            e.stopPropagation();
            showAiSummarizerCard(rect, text);
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

    // AI Summarizer Card Widget
    function showAiSummarizerCard(rect, text) {
        hideFloatingWidgets();

        const card = document.createElement('div');
        card.id = 'infosys-ai-summary-card';
        card.style.cssText = `
            position: fixed !important;
            background: #ffffff !important;
            color: #0f172a !important;
            border-radius: 16px !important;
            box-shadow: 0 20px 40px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.1) !important;
            border: 1px solid #e2e8f0 !important;
            width: min(440px, calc(100vw - 32px)) !important;
            max-height: 80vh !important;
            overflow-y: auto !important;
            z-index: 2147483647 !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            padding: 16px !important;
            box-sizing: border-box !important;
            animation: infosys-fade-in 0.2s ease-out !important;
        `;

        let posX = Math.max(16, Math.min(window.innerWidth - 456, rect.left));
        let posY = Math.max(16, Math.min(window.innerHeight - 380, rect.bottom + 10));
        card.style.left = `${posX}px`;
        card.style.top = `${posY}px`;

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid #f1f5f9;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <div style="width:28px; height:28px; border-radius:8px; background:linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); color:#fff; display:flex; align-items:center; justify-content:center; font-size:14px;">✨</div>
                    <span style="font-weight:800; font-size:14px; color:#0f172a;">Tóm tắt Nội dung AI</span>
                </div>
                <button id="infosys-ai-sum-close" style="background:transparent; border:none; color:#94a3b8; font-size:16px; cursor:pointer; padding:2px 6px; border-radius:6px;">✕</button>
            </div>
            <div id="infosys-ai-sum-body" style="font-size:13px; color:#334155; line-height:1.6;">
                <div style="display:flex; align-items:center; gap:8px; padding:20px 0; justify-content:center; color:#64748b;">
                    <div style="width:16px; height:16px; border:2px solid #8b5cf6; border-top-color:transparent; border-radius:50%; animation:infosys-spin 0.8s linear infinite;"></div>
                    <span>AI đang phân tích và trích xuất điểm chính...</span>
                </div>
            </div>
        `;

        (document.body || document.documentElement).appendChild(card);

        // Prevent outside click handler from immediately closing when clicking inside card
        ['mousedown', 'mouseup', 'click', 'pointerdown'].forEach(ev => {
            card.addEventListener(ev, e => e.stopPropagation());
        });

        card.querySelector('#infosys-ai-sum-close').onclick = () => card.remove();

        // Send to background AI
        chrome.runtime.sendMessage({
            action: 'AI_SUMMARIZE_TEXT',
            text: text,
            title: document.title,
            url: window.location.href
        }, (resp) => {
            const body = card.querySelector('#infosys-ai-sum-body');
            if (!body) return;

            if (resp && resp.success && resp.summary) {
                const s = resp.summary;
                let html = `
                    <div style="background:#f8fafc; border-radius:10px; padding:10px 12px; border:1px solid #e2e8f0; margin-bottom:10px;">
                        <div style="font-weight:700; color:#0284c7; font-size:11px; margin-bottom:4px; text-transform:uppercase;">📌 Tổng quan cốt lõi:</div>
                        <div style="color:#0f172a; font-size:13px; font-weight:500; line-height:1.5;">${s.overview || ''}</div>
                    </div>
                `;

                if (Array.isArray(s.keyPoints) && s.keyPoints.length > 0) {
                    html += `
                        <div style="margin-bottom:10px;">
                            <div style="font-weight:700; color:#7c3aed; font-size:11px; margin-bottom:6px; text-transform:uppercase;">🔑 Điểm chính:</div>
                            <ul style="margin:0; padding-left:18px; color:#334155; font-size:12.5px;">
                                ${s.keyPoints.map(p => `<li style="margin-bottom:4px;">${p}</li>`).join('')}
                            </ul>
                        </div>
                    `;
                }

                if (Array.isArray(s.actionItems) && s.actionItems.length > 0) {
                    html += `
                        <div style="margin-bottom:12px;">
                            <div style="font-weight:700; color:#059669; font-size:11px; margin-bottom:6px; text-transform:uppercase;">💡 Bài học & Hành động:</div>
                            <ul style="margin:0; padding-left:18px; color:#334155; font-size:12.5px;">
                                ${s.actionItems.map(a => `<li style="margin-bottom:4px;">${a}</li>`).join('')}
                            </ul>
                        </div>
                    `;
                }

                html += `
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:6px; margin-top:14px; padding-top:10px; border-top:1px solid #f1f5f9;">
                        <button id="infosys-ai-save-hoc-hoi" style="background:#f0fdf4; border:1px solid #bbf7d0; color:#15803d; padding:6px 8px; border-radius:8px; font-size:11px; font-weight:700; cursor:pointer;">💾 Lưu Học hỏi</button>
                        <button id="infosys-ai-save-ghi-chu" style="background:#eff6ff; border:1px solid #bfdbfe; color:#1d4ed8; padding:6px 8px; border-radius:8px; font-size:11px; font-weight:700; cursor:pointer;">📝 Lưu Ghi chú</button>
                        <button id="infosys-ai-copy-sum" style="background:#f8fafc; border:1px solid #cbd5e1; color:#334155; padding:6px 8px; border-radius:8px; font-size:11px; font-weight:700; cursor:pointer;">📋 Sao chép</button>
                    </div>
                `;

                body.innerHTML = html;

                const fullSummaryText = `📌 [TỔNG QUAN]\n${s.overview || ''}\n\n🔑 [ĐIỂM CHÍNH]\n${(s.keyPoints || []).map(p => '• ' + p).join('\n')}\n\n💡 [HÀNH ĐỘNG]\n${(s.actionItems || []).map(a => '• ' + a).join('\n')}`;

                card.querySelector('#infosys-ai-save-hoc-hoi')?.addEventListener('click', () => {
                    chrome.runtime.sendMessage({
                        action: 'SAVE_TO_HOC_HOI',
                        title: document.title,
                        content: fullSummaryText,
                        url: window.location.href,
                        tag: (s.tags && s.tags[0]) || 'Tóm tắt AI'
                    }, (r) => {
                        showToast('✓ Đã lưu tóm tắt vào HỌC HỎI!');
                        card.remove();
                    });
                });

                card.querySelector('#infosys-ai-save-ghi-chu')?.addEventListener('click', () => {
                    chrome.runtime.sendMessage({
                        action: 'SAVE_TO_GHI_CHU',
                        title: document.title,
                        content: fullSummaryText,
                        tag: (s.tags && s.tags[0]) || 'Tóm tắt AI'
                    }, (r) => {
                        showToast('✓ Đã lưu tóm tắt vào GHI CHÚ!');
                        card.remove();
                    });
                });

                card.querySelector('#infosys-ai-copy-sum')?.addEventListener('click', () => {
                    navigator.clipboard.writeText(fullSummaryText).then(() => {
                        showToast('✓ Đã sao chép bản tóm tắt!');
                    });
                });

            } else {
                body.innerHTML = `<div style="color:#ef4444; font-weight:600; padding:10px 0; text-align:center;">⚠️ Không thể tóm tắt được nội dung này.</div>`;
            }
        });
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

    // ============================================================
    //  OCR AREA SELECTION & RECOGNITION (Nhận diện chữ & Lưu Bảng tạm)
    // ============================================================
    function startOcrAreaSelection() {
        hideFloatingWidgets();

        const existing = document.getElementById('infosys-ocr-overlay');
        if (existing) existing.remove();

        const docEl = document.documentElement || document.body;

        const overlay = document.createElement('div');
        overlay.id = 'infosys-ocr-overlay';
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 2147483647 !important;
            cursor: crosshair !important;
            background: rgba(15, 23, 42, 0.45) !important;
            backdrop-filter: blur(2px) !important;
            user-select: none !important;
            margin: 0 !important;
            padding: 0 !important;
        `;

        const guidePill = document.createElement('div');
        guidePill.style.cssText = `
            position: fixed !important;
            top: 24px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            background: #0f172a !important;
            color: #f8fafc !important;
            border: 1px solid #6366f1 !important;
            box-shadow: 0 10px 25px -5px rgba(99,102,241,0.5) !important;
            padding: 10px 22px !important;
            border-radius: 30px !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            font-size: 13.5px !important;
            font-weight: 700 !important;
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            pointer-events: none !important;
            z-index: 2147483647 !important;
        `;
        guidePill.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2.5"><path d="M4 7V4h3"/><path d="M20 7V4h-3"/><path d="M4 17v3h3"/><path d="M20 17v3h-3"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="16" x2="13" y2="16"/></svg>
            <span>Kéo chuột chọn vùng ảnh chứa chữ để Quét OCR & Lưu Bảng tạm (Nhấn ESC để hủy)</span>
        `;
        overlay.appendChild(guidePill);

        const box = document.createElement('div');
        box.id = 'infosys-ocr-box';
        box.style.cssText = `
            position: fixed !important;
            border: 2px dashed #818cf8 !important;
            background: rgba(99, 102, 241, 0.15) !important;
            box-shadow: 0 0 0 99999px rgba(0, 0, 0, 0.45), 0 0 15px rgba(99,102,241,0.6) !important;
            display: none !important;
            pointer-events: none !important;
            z-index: 2147483647 !important;
            border-radius: 4px !important;
        `;

        const sizeLabel = document.createElement('div');
        sizeLabel.style.cssText = `
            position: absolute !important;
            bottom: -28px !important;
            left: 0 !important;
            background: #4f46e5 !important;
            color: #ffffff !important;
            font-family: monospace !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            padding: 3px 8px !important;
            border-radius: 6px !important;
            white-space: nowrap !important;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3) !important;
        `;
        box.appendChild(sizeLabel);
        overlay.appendChild(box);

        docEl.appendChild(overlay);

        let startX = 0, startY = 0, isDragging = false;

        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                cleanup();
            }
        };

        const cleanup = () => {
            window.removeEventListener('keydown', onKeyDown, true);
            window.removeEventListener('mousemove', onMouseMove, true);
            window.removeEventListener('mouseup', onMouseUp, true);
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        };

        window.addEventListener('keydown', onKeyDown, true);

        overlay.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            e.stopPropagation();
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            box.style.left = `${startX}px`;
            box.style.top = `${startY}px`;
            box.style.width = '0px';
            box.style.height = '0px';
            box.style.display = 'block';

            window.addEventListener('mousemove', onMouseMove, true);
            window.addEventListener('mouseup', onMouseUp, true);
        }, true);

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

            box.style.left = `${x}px`;
            box.style.top = `${y}px`;
            box.style.width = `${w}px`;
            box.style.height = `${h}px`;

            sizeLabel.textContent = `${w} × ${h} px`;
            if (y + h + 35 > window.innerHeight) {
                sizeLabel.style.bottom = 'auto';
                sizeLabel.style.top = '-28px';
            } else {
                sizeLabel.style.top = 'auto';
                sizeLabel.style.bottom = '-28px';
            }
        };

        const onMouseUp = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            e.stopPropagation();
            isDragging = false;

            const currentX = e.clientX;
            const currentY = e.clientY;
            const x = Math.min(startX, currentX);
            const y = Math.min(startY, currentY);
            const w = Math.abs(startX - currentX);
            const h = Math.abs(startY - currentY);

            cleanup();

            if (w < 15 || h < 15) {
                showToast('⚠️ Vùng chọn quá nhỏ, hãy kéo chọn vùng lớn hơn.');
                return;
            }

            // Show loading HUD
            showOcrLoadingHud();

            // Request background to capture visible tab and return dataUrl
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                chrome.runtime.sendMessage({
                    action: 'PERFORM_OCR_TAB_CAPTURE',
                    coords: {
                        x: x,
                        y: y,
                        w: w,
                        h: h,
                        dpr: window.devicePixelRatio || 1
                    }
                });
            }
        };
    }

    function showOcrLoadingHud() {
        let hud = document.getElementById('infosys-ocr-loading-hud');
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'infosys-ocr-loading-hud';
            hud.style.cssText = `
                position: fixed !important;
                top: 24px !important;
                right: 24px !important;
                background: #0f172a !important;
                color: #ffffff !important;
                padding: 12px 20px !important;
                border-radius: 12px !important;
                border: 1px solid #6366f1 !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                font-size: 13.5px !important;
                font-weight: 700 !important;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 15px rgba(99,102,241,0.4) !important;
                z-index: 2147483647 !important;
                display: flex !important;
                align-items: center !important;
                gap: 12px !important;
                animation: infosys-fade-in 0.2s ease-out !important;
            `;
            (document.body || document.documentElement).appendChild(hud);
        }
        hud.innerHTML = `
            <div style="width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,0.2); border-top-color: #818cf8; border-radius: 50%; animation: infosys-spin 0.8s linear infinite;"></div>
            <span id="infosys-ocr-status-text">⏳ Đang nhận diện chữ (OCR)...</span>
        `;
    }

    function updateOcrLoadingProgress(percent) {
        const textEl = document.getElementById('infosys-ocr-status-text');
        if (textEl) {
            textEl.textContent = `⏳ Đang đọc chữ OCR (${percent}%)...`;
        }
    }

    function hideOcrLoadingHud() {
        const hud = document.getElementById('infosys-ocr-loading-hud');
        if (hud) hud.remove();
    }

    async function handleOcrProcessing(dataUrl, coords) {
        try {
            const img = new Image();
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                canvas.width = coords.w;
                canvas.height = coords.h;
                const ctx = canvas.getContext('2d');
                
                const sx = coords.x * coords.dpr;
                const sy = coords.y * coords.dpr;
                const sw = coords.w * coords.dpr;
                const sh = coords.h * coords.dpr;

                ctx.drawImage(img, sx, sy, sw, sh, 0, 0, coords.w, coords.h);

                const croppedDataUrl = canvas.toDataURL('image/png');

                // Perform OCR Recognition
                let ocrText = '';

                // Try Tesseract.js (Vietnamese + English)
                if (typeof Tesseract !== 'undefined' && Tesseract.recognize) {
                    try {
                        const tesseractRes = await Tesseract.recognize(canvas, 'vie+eng', {
                            logger: m => {
                                if (m.status === 'recognizing text' && m.progress) {
                                    updateOcrLoadingProgress(Math.round(m.progress * 100));
                                }
                            }
                        });
                        if (tesseractRes && tesseractRes.data && tesseractRes.data.text && tesseractRes.data.text.trim()) {
                            ocrText = tesseractRes.data.text.trim();
                        }
                    } catch (tessErr) {
                        console.warn('[OCR Tesseract]', tessErr);
                    }
                }

                // Cloud OCR Fallback if needed
                if (!ocrText || ocrText.length < 2) {
                    try {
                        const formData = new URLSearchParams();
                        formData.append('base64Image', croppedDataUrl);
                        formData.append('OCREngine', '2');
                        formData.append('apikey', 'K88795898888957');
                        
                        const cloudRes = await fetch('https://api.ocr.space/parse/image', {
                            method: 'POST',
                            body: formData
                        });
                        const cloudJson = await cloudRes.json();
                        if (cloudJson && cloudJson.ParsedResults && cloudJson.ParsedResults[0] && cloudJson.ParsedResults[0].ParsedText) {
                            ocrText = cloudJson.ParsedResults[0].ParsedText.trim();
                        }
                    } catch (cloudErr) {
                        console.warn('[OCR Cloud fallback]', cloudErr);
                    }
                }

                hideOcrLoadingHud();

                if (!ocrText || ocrText.trim().length === 0) {
                    showToast('⚠️ Không tìm thấy chữ trong vùng đã chọn. Hãy thử lại với vùng rõ nét hơn.');
                    return;
                }

                // 1. Auto save to Google Sheets BANG_TAM
                const pageUrl = window.location.href;
                doSaveToBangTam(ocrText, 'OCR');

                // 2. Show OCR Result Card
                showOcrResultCard(ocrText, croppedDataUrl, pageUrl);
            };
            img.src = dataUrl;
        } catch (err) {
            hideOcrLoadingHud();
            console.error('[OCR Processing Error]', err);
            showToast('❌ Lỗi khi xử lý OCR: ' + err.message);
        }
    }

    function showOcrResultCard(text, imageSrc, pageUrl) {
        const existing = document.getElementById('infosys-ocr-result-modal');
        if (existing) existing.remove();

        const card = document.createElement('div');
        card.id = 'infosys-ocr-result-modal';
        card.style.cssText = `
            position: fixed !important;
            bottom: 24px !important;
            right: 24px !important;
            width: 440px !important;
            max-width: calc(100vw - 36px) !important;
            max-height: 85vh !important;
            background: #0f172a !important;
            color: #f8fafc !important;
            border: 1px solid #4f46e5 !important;
            border-radius: 16px !important;
            box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 20px rgba(99, 102, 241, 0.3) !important;
            z-index: 2147483647 !important;
            display: flex !important;
            flex-direction: column !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            overflow: hidden !important;
            animation: infosys-fade-in 0.25s ease-out !important;
        `;

        card.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:#1e1b4b; border-bottom:1px solid rgba(99,102,241,0.3);">
                <div style="display:flex; align-items:center; gap:8px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2.5"><path d="M4 7V4h3"/><path d="M20 7V4h-3"/><path d="M4 17v3h3"/><path d="M20 17v3h-3"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="16" x2="13" y2="16"/></svg>
                    <span style="font-size:13.5px; font-weight:700; color:#c7d2fe;">Quét chữ OCR ➔ Đã lưu Bảng tạm</span>
                </div>
                <button id="ocr-card-close" style="background:transparent; border:none; color:#94a3b8; font-size:16px; cursor:pointer; padding:2px 6px; line-height:1; border-radius:6px;" title="Đóng">✕</button>
            </div>
            <div style="padding:14px 16px; overflow-y:auto; max-height:260px; display:flex; flex-direction:column; gap:10px;">
                <textarea id="ocr-text-area" style="width:100%; height:110px; background:#090d16; border:1px solid #334155; border-radius:10px; color:#e2e8f0; font-size:13px; font-family:inherit; padding:10px; resize:vertical; box-sizing:border-box; line-height:1.5;">${escapeHtml(text)}</textarea>
                <div style="display:flex; align-items:center; justify-content:space-between; font-size:11.5px; color:#94a3b8;">
                    <span>📁 Tag: <b style="color:#38bdf8;">OCR</b></span>
                    <span>🔗 URL: <b style="color:#cbd5e1;">${new URL(pageUrl).hostname}</b></span>
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px; padding:10px 16px; background:#111827; border-top:1px solid #1e293b; flex-wrap:wrap;">
                <button id="ocr-btn-copy" style="flex:1; background:#4f46e5; border:none; color:#ffffff; padding:7px 10px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px; box-shadow:0 2px 6px rgba(79,70,229,0.4);" title="Sao chép văn bản">
                    📋 Sao chép
                </button>
                <button id="ocr-btn-speak" style="background:#1e293b; border:1px solid #334155; color:#22c55e; padding:7px 10px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:4px;" title="Đọc phát âm">
                    🔊 Đọc
                </button>
                <button id="ocr-btn-trans" style="background:#1e293b; border:1px solid #334155; color:#38bdf8; padding:7px 10px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:4px;" title="Dịch Google">
                    🌐 Dịch
                </button>
                <button id="ocr-btn-save-edit" style="background:#1e293b; border:1px solid #334155; color:#f59e0b; padding:7px 10px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:4px;" title="Cập nhật văn bản đã sửa vào Bảng tạm">
                    💾 Cập nhật
                </button>
            </div>
        `;

        (document.body || document.documentElement).appendChild(card);

        card.querySelector('#ocr-card-close').onclick = () => card.remove();

        card.querySelector('#ocr-btn-copy').onclick = () => {
            const currentVal = card.querySelector('#ocr-text-area').value;
            navigator.clipboard.writeText(currentVal).then(() => {
                showToast('📋 Đã sao chép chữ OCR vào bộ nhớ tạm!');
            });
        };

        card.querySelector('#ocr-btn-speak').onclick = (e) => {
            const currentVal = card.querySelector('#ocr-text-area').value;
            speakInLang(currentVal, 'vi', e.currentTarget);
        };

        card.querySelector('#ocr-btn-trans').onclick = () => {
            const currentVal = card.querySelector('#ocr-text-area').value;
            const rect = card.getBoundingClientRect();
            showGoogleTranslateCard(rect, currentVal);
        };

        card.querySelector('#ocr-btn-save-edit').onclick = () => {
            const currentVal = card.querySelector('#ocr-text-area').value;
            doSaveToBangTam(currentVal, 'OCR');
            showToast('✅ Đã cập nhật văn bản OCR vào Bảng tạm!');
        };
    }

    // Keyboard shortcut Alt + Shift + O
    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.shiftKey && (e.key === 'O' || e.key === 'o' || e.code === 'KeyO')) {
            e.preventDefault();
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                chrome.runtime.sendMessage({ action: 'START_OCR_CAPTURE_FROM_VIEW' });
            } else {
                startOcrAreaSelection();
            }
        }
    }, true);

    // Extension runtime message receiver
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'START_OCR_CAPTURE') {
                startOcrAreaSelection();
                sendResponse({ status: 'ok' });
            } else if (request.action === 'DO_OCR_PROCESSING') {
                handleOcrProcessing(request.dataUrl, request.coords);
                sendResponse({ status: 'ok' });
            } else if (request.action === 'OCR_CAPTURE_FAILED') {
                hideOcrLoadingHud();
                showToast('❌ Không thể chụp màn hình để quét OCR.');
                sendResponse({ status: 'error' });
            }
        });
    }
})();

