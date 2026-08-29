// ============================================================
//  InfoSys — Module TRỢ LÝ AI (AI Assistant Chat & Q&A)
//  - Hỏi đáp thông minh trên dữ liệu Google Sheets (Chi tiêu, Công việc, Ghi chú, Học hỏi)
//  - Hỗ trợ Chế độ Gemini AI Pro (API Key) & Chế độ Miễn phí (Smart NLP Engine)
//  - Tích hợp Nhập liệu giọng nói (Voice Input) & Gợi ý câu hỏi nhanh 1-Click
// ============================================================

(function(window) {
    let chatHistory = [];
    let isProcessing = false;
    let geminiApiKey = '';
    let speechRecognizer = null;
    let isListening = false;

    // Load initial settings
    try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(['infosys_gemini_api_key', 'infosys_ai_chat_history'], (data) => {
                if (data) {
                    geminiApiKey = data.infosys_gemini_api_key || '';
                    if (Array.isArray(data.infosys_ai_chat_history)) {
                        chatHistory = data.infosys_ai_chat_history;
                    }
                }
            });
        } else {
            const savedKey = localStorage.getItem('infosys_gemini_api_key');
            if (savedKey) geminiApiKey = savedKey;
            const savedHistory = localStorage.getItem('infosys_ai_chat_history');
            if (savedHistory) chatHistory = JSON.parse(savedHistory);
        }
    } catch(e) {}

    function saveChatHistory() {
        try {
            const trimmed = chatHistory.slice(-50); // Keep last 50 messages
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ infosys_ai_chat_history: trimmed });
            } else {
                localStorage.setItem('infosys_ai_chat_history', JSON.stringify(trimmed));
            }
        } catch(e) {}
    }

    function saveApiKey(key) {
        geminiApiKey = (key || '').trim();
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ infosys_gemini_api_key: geminiApiKey });
            } else {
                localStorage.setItem('infosys_gemini_api_key', geminiApiKey);
            }
        } catch(e) {}
        if (typeof showInfoToast === 'function') {
            showInfoToast(geminiApiKey ? '🔑 Đã lưu Google Gemini API Key!' : 'Đã chuyển về chế độ AI cục bộ miễn phí', 'success');
        }
        updateApiKeyUI();
    }

    function renderAiAssistant() {
        const container = document.getElementById('aiAssistantDashboard');
        if (!container) return;

        container.innerHTML = `
            <!-- Assistant Header -->
            <div style="padding:14px 20px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; background:#ffffff; flex-wrap:wrap; gap:10px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="width:38px; height:38px; border-radius:12px; background:linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(99,102,241,0.3);">
                        <i data-lucide="bot" style="width:20px; height:20px;"></i>
                    </div>
                    <div>
                        <div style="display:flex; align-items:center; gap:6px;">
                            <h3 style="margin:0; font-size:1.05rem; font-weight:800; color:#0f172a;">Trợ lý AI InfoSys</h3>
                            <span id="aiModeBadge" style="font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:12px; background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe;">
                                ${geminiApiKey ? '✨ Gemini AI Pro' : '⚡ Smart NLP (Miễn phí)'}
                            </span>
                        </div>
                        <p style="margin:0; font-size:0.75rem; color:#64748b;">Hỏi đáp & Phân tích trực tiếp trên dữ liệu Chi tiêu, Công việc, Ghi chú</p>
                    </div>
                </div>

                <div style="display:flex; align-items:center; gap:8px;">
                    <button type="button" id="aiConfigApiKeyBtn" style="background:#f8fafc; border:1px solid #cbd5e1; padding:6px 12px; border-radius:10px; font-size:0.8rem; font-weight:600; color:#334155; cursor:pointer; display:flex; align-items:center; gap:5px;" title="Cài đặt Gemini API Key">
                        <i data-lucide="key" style="width:14px; height:14px; color:#8b5cf6;"></i>
                        <span>API Key</span>
                    </button>
                    <button type="button" id="aiClearHistoryBtn" style="background:#f8fafc; border:1px solid #cbd5e1; padding:6px 10px; border-radius:10px; font-size:0.8rem; font-weight:600; color:#ef4444; cursor:pointer; display:flex; align-items:center; gap:4px;" title="Xóa lịch sử chat">
                        <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
                    </button>
                </div>
            </div>

            <!-- Chat Messages Container -->
            <div id="aiChatMessages" style="flex:1; padding:20px; overflow-y:auto; background:#f8fafc; display:flex; flex-direction:column; gap:16px;">
                ${chatHistory.length === 0 ? renderWelcomeMessage() : renderMessageList()}
            </div>

            <!-- Quick Suggestion Chips -->
            <div style="padding:8px 16px; background:#ffffff; border-top:1px solid #f1f5f9; display:flex; gap:6px; overflow-x:auto; white-space:nowrap; scrollbar-width:none;">
                <button type="button" class="ai-suggestion-chip" data-prompt="Tổng chi tiêu tháng này là bao nhiêu và chi vào những mục nào?">💰 Chi tiêu tháng này</button>
                <button type="button" class="ai-suggestion-chip" data-prompt="Hôm nay tôi có những công việc nào cần làm?">📋 Công việc hôm nay</button>
                <button type="button" class="ai-suggestion-chip" data-prompt="Liệt kê các công việc sắp đến hạn trong tuần này">⏰ Việc sắp đến hạn</button>
                <button type="button" class="ai-suggestion-chip" data-prompt="Phân tích tình hình tài chính của tôi và đưa ra lời khuyên">💡 Lời khuyên tài chính</button>
                <button type="button" class="ai-suggestion-chip" data-prompt="Thống kê tổng quan số lượng ghi chú và công việc">📊 Thống kê dữ liệu</button>
            </div>

            <!-- Chat Input Bar -->
            <div style="padding:14px 16px; background:#ffffff; border-top:1px solid #e2e8f0; display:flex; align-items:center; gap:8px;">
                <button type="button" id="aiVoiceInputBtn" style="background:#f1f5f9; border:1px solid #cbd5e1; width:40px; height:40px; border-radius:12px; color:#475569; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; transition:all 0.15s;" title="Nói bằng giọng nói (Speech-to-Text)">
                    <i data-lucide="mic" style="width:18px; height:18px;"></i>
                </button>
                
                <div style="flex:1; position:relative;">
                    <textarea id="aiChatInput" rows="1" placeholder="Hỏi AI bất kỳ điều gì về chi tiêu, công việc, ghi chú..." style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:12px; font-size:0.9rem; resize:none; box-sizing:border-box; outline:none; line-height:1.4; font-family:inherit; max-height:100px;"></textarea>
                </div>

                <button type="button" id="aiSendMessageBtn" style="background:linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color:#ffffff; border:none; width:42px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; box-shadow:0 3px 8px rgba(99,102,241,0.35); transition:transform 0.1s;">
                    <i data-lucide="send" style="width:17px; height:17px;"></i>
                </button>
            </div>

            <!-- API Key Settings Drawer/Modal -->
            <div id="aiApiKeyModal" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(15,23,42,0.6); z-index:99999; justify-content:center; align-items:center; backdrop-filter:blur(3px);">
                <div style="background:#ffffff; border-radius:16px; padding:22px; width:90%; max-width:440px; box-shadow:0 20px 35px rgba(0,0,0,0.25); border:1px solid #e2e8f0;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                        <h4 style="margin:0; font-size:1rem; font-weight:800; color:#0f172a; display:flex; align-items:center; gap:6px;">
                            <i data-lucide="key" style="width:16px; height:16px; color:#8b5cf6;"></i> Cài đặt Google Gemini API Key
                        </h4>
                        <button type="button" id="closeAiApiKeyModalBtn" style="background:transparent; border:none; color:#94a3b8; font-size:1.2rem; cursor:pointer;">✕</button>
                    </div>
                    <p style="font-size:0.8rem; color:#64748b; line-height:1.5; margin-bottom:12px;">
                        Nhập API Key Google Gemini (hoàn toàn miễn phí tại <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color:#2563eb; text-decoration:underline; font-weight:600;">Google AI Studio</a>) để AI trả lời chuyên sâu, tự nhiên và đưa ra lời khuyên chi tiết nhất.
                    </p>
                    <div style="margin-bottom:14px;">
                        <label style="display:block; font-size:0.75rem; font-weight:700; color:#334155; margin-bottom:4px;">GEMINI API KEY:</label>
                        <input type="password" id="geminiApiKeyInput" placeholder="AIzaSy..." value="${geminiApiKey}" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.88rem; box-sizing:border-box;">
                    </div>
                    <div style="display:flex; justify-content:flex-end; gap:8px;">
                        <button type="button" id="cancelApiKeyBtn" style="background:#f8fafc; border:1px solid #cbd5e1; padding:8px 14px; border-radius:8px; font-weight:600; font-size:0.82rem; color:#64748b; cursor:pointer;">Đóng</button>
                        <button type="button" id="saveApiKeyBtn" style="background:linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color:#ffffff; border:none; padding:8px 18px; border-radius:8px; font-weight:700; font-size:0.82rem; cursor:pointer;">Lưu API Key</button>
                    </div>
                </div>
            </div>
        `;

        setupAiAssistantEvents();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function renderWelcomeMessage() {
        return `
            <div style="background:#ffffff; border-radius:14px; padding:18px; border:1px solid #e2e8f0; max-width:85%; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                    <div style="width:24px; height:24px; border-radius:6px; background:#8b5cf6; color:#fff; display:flex; align-items:center; justify-content:center; font-size:12px;">🤖</div>
                    <span style="font-weight:700; font-size:0.9rem; color:#0f172a;">Trợ lý AI InfoSys</span>
                </div>
                <div style="font-size:0.88rem; color:#334155; line-height:1.6;">
                    Xin chào! Tôi là trợ lý AI thông minh kết nối trực tiếp với toàn bộ dữ liệu Google Sheets của bạn.
                    <br><br>
                    Bạn có thể hỏi tôi bất kỳ điều gì, ví dụ:
                    <ul style="margin:6px 0 0 0; padding-left:20px;">
                        <li><b>Chi tiêu:</b> <i>"Tháng này tôi tiêu hết bao nhiêu?", "Số dư các tài khoản hiện tại?"</i></li>
                        <li><b>Công việc:</b> <i>"Hôm nay có việc gì gấp?", "Các việc đang làm và chưa xong?"</i></li>
                        <li><b>Ghi chú & Học hỏi:</b> <i>"Tìm ghi chú về hợp đồng", "Tổng hợp kiến thức đã lưu"</i></li>
                    </ul>
                </div>
            </div>
        `;
    }

    function renderMessageList() {
        return chatHistory.map(msg => {
            const isUser = msg.role === 'user';
            return `
                <div style="display:flex; justify-content:${isUser ? 'flex-end' : 'flex-start'};">
                    <div style="max-width:85%; background:${isUser ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' : '#ffffff'}; color:${isUser ? '#ffffff' : '#0f172a'}; border-radius:14px; padding:14px 16px; border:${isUser ? 'none' : '1px solid #e2e8f0'}; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                        ${!isUser ? `<div style="display:flex; align-items:center; gap:6px; margin-bottom:6px; font-weight:700; font-size:0.78rem; color:#8b5cf6;"><i data-lucide="bot" style="width:14px; height:14px;"></i> Trợ lý AI</div>` : ''}
                        <div style="font-size:0.88rem; line-height:1.6; word-break:break-word;">
                            ${formatAiMessageMarkdown(msg.content)}
                        </div>
                        <div style="font-size:0.65rem; color:${isUser ? 'rgba(255,255,255,0.7)' : '#94a3b8'}; text-align:right; margin-top:4px;">
                            ${msg.time || ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function formatAiMessageMarkdown(text) {
        if (!text) return '';
        let formatted = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Bold
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Bullet points
        formatted = formatted.replace(/^\s*[\-\*]\s+(.*)$/gm, '<li style="margin-left:16px;">$1</li>');
        // Code
        formatted = formatted.replace(/`(.*?)`/g, '<code style="background:#f1f5f9; padding:2px 5px; border-radius:4px; font-size:0.82rem; color:#e11d48;">$1</code>');
        // Line breaks
        formatted = formatted.replace(/\n/g, '<br>');

        return formatted;
    }

    function setupAiAssistantEvents() {
        const sendBtn = document.getElementById('aiSendMessageBtn');
        const input = document.getElementById('aiChatInput');
        const voiceBtn = document.getElementById('aiVoiceInputBtn');
        const configBtn = document.getElementById('aiConfigApiKeyBtn');
        const clearBtn = document.getElementById('aiClearHistoryBtn');
        const apiModal = document.getElementById('aiApiKeyModal');
        const saveApiBtn = document.getElementById('saveApiKeyBtn');
        const cancelApiBtn = document.getElementById('cancelApiKeyBtn');
        const closeApiBtn = document.getElementById('closeAiApiKeyModalBtn');

        sendBtn?.addEventListener('click', handleSendMessage);
        input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });

        voiceBtn?.addEventListener('click', toggleAiVoiceInput);

        configBtn?.addEventListener('click', () => {
            if (apiModal) apiModal.style.display = 'flex';
        });
        cancelApiBtn?.addEventListener('click', () => {
            if (apiModal) apiModal.style.display = 'none';
        });
        closeApiBtn?.addEventListener('click', () => {
            if (apiModal) apiModal.style.display = 'none';
        });
        saveApiBtn?.addEventListener('click', () => {
            const keyInput = document.getElementById('geminiApiKeyInput');
            saveApiKey(keyInput ? keyInput.value : '');
            if (apiModal) apiModal.style.display = 'none';
        });

        clearBtn?.addEventListener('click', () => {
            if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử trò chuyện với AI?')) {
                chatHistory = [];
                saveChatHistory();
                renderAiAssistant();
            }
        });

        // Quick suggestion chips
        const chips = document.querySelectorAll('.ai-suggestion-chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                const prompt = chip.dataset.prompt;
                if (input) input.value = prompt;
                handleSendMessage();
            });
        });
    }

    function toggleAiVoiceInput() {
        const voiceBtn = document.getElementById('aiVoiceInputBtn');
        const input = document.getElementById('aiChatInput');
        const SpeechRecClass = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecClass) {
            alert('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói Web Speech.');
            return;
        }

        if (isListening) {
            if (speechRecognizer) {
                try { speechRecognizer.stop(); } catch(e) {}
            }
            isListening = false;
            if (voiceBtn) {
                voiceBtn.style.background = '#f1f5f9';
                voiceBtn.style.color = '#475569';
            }
            return;
        }

        try {
            speechRecognizer = new SpeechRecClass();
            speechRecognizer.continuous = false;
            speechRecognizer.interimResults = true;
            speechRecognizer.lang = 'vi-VN';

            isListening = true;
            if (voiceBtn) {
                voiceBtn.style.background = '#fef2f2';
                voiceBtn.style.color = '#dc2626';
            }

            speechRecognizer.onresult = (event) => {
                let full = '';
                for (let i = 0; i < event.results.length; i++) {
                    full += event.results[i][0].transcript;
                }
                if (input) input.value = full;
            };

            speechRecognizer.onend = () => {
                isListening = false;
                if (voiceBtn) {
                    voiceBtn.style.background = '#f1f5f9';
                    voiceBtn.style.color = '#475569';
                }
            };

            speechRecognizer.onerror = () => {
                isListening = false;
                if (voiceBtn) {
                    voiceBtn.style.background = '#f1f5f9';
                    voiceBtn.style.color = '#475569';
                }
            };

            speechRecognizer.start();
        } catch(e) {
            console.warn('Voice input error:', e);
        }
    }

    function updateApiKeyUI() {
        const badge = document.getElementById('aiModeBadge');
        if (badge) {
            badge.textContent = geminiApiKey ? '✨ Gemini AI Pro' : '⚡ Smart NLP (Miễn phí)';
        }
    }

    async function handleSendMessage() {
        if (isProcessing) return;
        const input = document.getElementById('aiChatInput');
        const text = input ? input.value.trim() : '';
        if (!text) return;

        input.value = '';

        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Add user message
        chatHistory.push({
            role: 'user',
            content: text,
            time: timeStr
        });

        renderAiAssistant();
        scrollChatToBottom();

        isProcessing = true;

        // Show thinking indicator
        const messagesContainer = document.getElementById('aiChatMessages');
        const thinkingId = 'ai-thinking-' + Date.now();
        if (messagesContainer) {
            const div = document.createElement('div');
            div.id = thinkingId;
            div.style.cssText = 'display:flex; justify-content:flex-start;';
            div.innerHTML = `
                <div style="background:#ffffff; border-radius:14px; padding:12px 16px; border:1px solid #e2e8f0; display:flex; align-items:center; gap:8px; color:#64748b; font-size:0.85rem;">
                    <div style="width:14px; height:14px; border:2px solid #8b5cf6; border-top-color:transparent; border-radius:50%; animation:infosys-spin 0.8s linear infinite;"></div>
                    <span>AI đang phân tích dữ liệu Google Sheet...</span>
                </div>
            `;
            messagesContainer.appendChild(div);
            scrollChatToBottom();
        }

        try {
            const aiResponse = await generateAiAnswer(text);
            const thinkingEl = document.getElementById(thinkingId);
            if (thinkingEl) thinkingEl.remove();

            chatHistory.push({
                role: 'assistant',
                content: aiResponse,
                time: timeStr
            });

            saveChatHistory();
            renderAiAssistant();
            scrollChatToBottom();

        } catch(err) {
            const thinkingEl = document.getElementById(thinkingId);
            if (thinkingEl) thinkingEl.remove();

            chatHistory.push({
                role: 'assistant',
                content: `⚠️ Có lỗi khi xử lý câu hỏi: ${err.message || err}`,
                time: timeStr
            });
            renderAiAssistant();
            scrollChatToBottom();
        } finally {
            isProcessing = false;
        }
    }

    function scrollChatToBottom() {
        const messagesContainer = document.getElementById('aiChatMessages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    // ============================================================
    //  AI Query Reasoning Engine (Gemini Pro + Local NLP Fallback)
    // ============================================================
    async function generateAiAnswer(userPrompt) {
        const dataSummary = buildDataContextSummary();

        if (geminiApiKey) {
            try {
                const systemPrompt = `Bạn là trợ lý AI chuyên nghiệp cho hệ thống InfoSys cá nhân. Dưới đây là tóm tắt dữ liệu hiện tại trong Google Sheets của người dùng:
${JSON.stringify(dataSummary, null, 2)}

Hãy trả lời câu hỏi của người dùng một cách chính xác, thân thiện, rõ ràng bằng Tiếng Việt.
Nếu người dùng hỏi về tài chính/chi tiêu: Tính toán tổng tiền, nêu rõ các khoản lớn nhất, đưa ra lời khuyên tiết kiệm.
Nếu người dùng hỏi về công việc: Liệt kê các việc ưu tiên, hạn chót và trạng thái.
Nếu người dùng hỏi về ghi chú/học hỏi: Tóm tắt thông tin liên quan.
Dùng định dạng Markdown (in đậm, danh sách gạch đầu dòng) để câu trả lời dễ nhìn.`;

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [
                            { parts: [{ text: systemPrompt + '\n\nCâu hỏi: ' + userPrompt }] }
                        ],
                        generationConfig: { temperature: 0.25, maxOutputTokens: 1200 }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (aiText) return aiText.trim();
                }
            } catch(e) {
                console.warn('Gemini API query error, using local engine:', e);
            }
        }

        // Local Smart NLP Engine (Instant, 100% Offline & Free)
        return processLocalNlpQuery(userPrompt, dataSummary);
    }

    function buildDataContextSummary() {
        const cache = window.dataCache || window.cachedData || {};
        const summary = {
            chi_tieu: [],
            cong_viec: [],
            ghi_chu: [],
            hoc_hoi: []
        };

        if (Array.isArray(cache['CHI_TIEU'])) {
            summary.chi_tieu = cache['CHI_TIEU'].slice(0, 100).map(r => ({
                ngay: r.ngay,
                loai: r.loai_giao_dich,
                tien: parseFloat(String(r.so_tien || 0).replace(/,/g, '')) || 0,
                hang_muc: r.hang_muc,
                tai_khoan: r.tai_khoan,
                ghi_chu: r.ghi_chu
            }));
        }

        if (Array.isArray(cache['CONG_VIEC'])) {
            summary.cong_viec = cache['CONG_VIEC'].slice(0, 100).map(r => ({
                tieu_de: r.tieu_de,
                trang_thai: r.trang_thai,
                danh_muc: r.danh_muc,
                ngay_bat_dau: r.ngay_bat_dau,
                ngay_hoan_thanh: r.ngay_hoan_thanh
            }));
        }

        if (Array.isArray(cache['GHI_CHU'])) {
            summary.ghi_chu = cache['GHI_CHU'].slice(0, 50).map(r => ({
                tieu_de: r.tieu_de,
                noi_dung: r.noi_dung ? r.noi_dung.substring(0, 150) : '',
                phan_loai: r.phan_loai
            }));
        }

        if (Array.isArray(cache['HOC_HOI'])) {
            summary.hoc_hoi = cache['HOC_HOI'].slice(0, 50).map(r => ({
                tieu_de: r.tieu_de,
                tag: r.tag
            }));
        }

        return summary;
    }

    function processLocalNlpQuery(prompt, summary) {
        const query = prompt.toLowerCase();
        const now = new Date();
        const curMonth = now.getMonth() + 1;
        const curYear = now.getFullYear();

        // 1. Finance / Chi tiêu Queries
        if (query.includes('chi tiêu') || query.includes('tiền') || query.includes('thu chi') || query.includes('ăn uống') || query.includes('tài chính') || query.includes('tiêu hết')) {
            const expenses = summary.chi_tieu || [];
            let totalChi = 0;
            let totalThu = 0;
            const categoryMap = {};

            expenses.forEach(item => {
                if (item.loai === 'Chi') {
                    totalChi += item.tien;
                    const cat = item.hang_muc || 'Khác';
                    categoryMap[cat] = (categoryMap[cat] || 0) + item.tien;
                } else if (item.loai === 'Thu') {
                    totalThu += item.tien;
                }
            });

            const topCategories = Object.entries(categoryMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4);

            const formatMoney = (n) => new Intl.NumberFormat('vi-VN').format(n) + ' đ';

            let res = `📊 **Báo Cáo Tài Chính & Chi Tiêu (Dữ liệu gần nhất):**\n\n`;
            res += `• 🔴 **Tổng Chi:** **${formatMoney(totalChi)}**\n`;
            res += `• 🟢 **Tổng Thu:** **${formatMoney(totalThu)}**\n`;
            res += `• ⚖️ **Chênh lệch (Thu - Chi):** **${formatMoney(totalThu - totalChi)}**\n\n`;

            if (topCategories.length > 0) {
                res += `🏆 **Các hạng mục chi tiêu nhiều nhất:**\n`;
                topCategories.forEach(([cat, amount]) => {
                    const pct = totalChi > 0 ? ((amount / totalChi) * 100).toFixed(1) : 0;
                    res += `  - **${cat}:** ${formatMoney(amount)} (${pct}%)\n`;
                });
            }

            res += `\n💡 **Lời khuyên thông minh:** Hãy kiểm soát kỹ các khoản chi chiếm tỷ trọng lớn để tối ưu hóa tích lũy hàng tháng.`;
            return res;
        }

        // 2. Tasks / Công việc Queries
        if (query.includes('công việc') || query.includes('hôm nay') || query.includes('việc') || query.includes('hạn') || query.includes('deadline')) {
            const tasks = summary.cong_viec || [];
            const chuaLam = tasks.filter(t => t.trang_thai === 'Chưa làm');
            const dangLam = tasks.filter(t => t.trang_thai === 'Đang làm');
            const hoanThanh = tasks.filter(t => t.trang_thai === 'Hoàn thành');

            let res = `📋 **Tổng Hợp Công Việc Của Bạn:**\n\n`;
            res += `• ⏳ **Đang làm:** **${dangLam.length}** việc\n`;
            res += `• ⚪ **Chưa làm:** **${chuaLam.length}** việc\n`;
            res += `• ✅ **Đã hoàn thành:** **${hoanThanh.length}** việc\n\n`;

            if (dangLam.length > 0) {
                res += `🔥 **Các việc đang tiến hành cần ưu tiên:**\n`;
                dangLam.slice(0, 5).forEach(t => {
                    res += `  - **${t.tieu_de}** ${t.ngay_hoan_thanh ? `(Hạn: ${t.ngay_hoan_thanh})` : ''}\n`;
                });
            } else if (chuaLam.length > 0) {
                res += `📌 **Các việc tiếp theo:**\n`;
                chuaLam.slice(0, 5).forEach(t => {
                    res += `  - **${t.tieu_de}**\n`;
                });
            }

            return res;
        }

        // 3. Notes / Ghi chú Queries
        if (query.includes('ghi chú') || query.includes('tìm') || query.includes('hợp đồng') || query.includes('ý tưởng')) {
            const notes = summary.ghi_chu || [];
            const keywords = query.replace(/(tìm|ghi chú|về|xem|cho tôi)/g, '').trim().split(/\s+/).filter(w => w.length > 1);
            
            let matched = notes;
            if (keywords.length > 0) {
                matched = notes.filter(n => {
                    const full = (n.tieu_de + ' ' + n.noi_dung + ' ' + n.phan_loai).toLowerCase();
                    return keywords.some(k => full.includes(k));
                });
            }

            if (matched.length > 0) {
                let res = `📝 **Tìm thấy ${matched.length} ghi chú liên quan:**\n\n`;
                matched.slice(0, 5).forEach(n => {
                    res += `• **${n.tieu_de || 'Ghi chú'}** ${n.phan_loai ? `\`[${n.phan_loai}]\`` : ''}\n  ${n.noi_dung || ''}\n\n`;
                });
                return res;
            } else {
                return `🔍 Không tìm thấy ghi chú nào khớp với từ khóa của bạn. Hãy thử tìm với từ khóa ngắn gọn hơn!`;
            }
        }

        // Default General Overview
        const totalNotes = (summary.ghi_chu || []).length;
        const totalTasks = (summary.cong_viec || []).length;
        const totalExpenses = (summary.chi_tieu || []).length;
        const totalLearnings = (summary.hoc_hoi || []).length;

        return `🤖 **Tổng quan dữ liệu InfoSys của bạn:**\n\n` +
               `• 💰 **Chi tiêu:** ${totalExpenses} bản ghi giao dịch\n` +
               `• 📋 **Công việc:** ${totalTasks} công việc đang theo dõi\n` +
               `• 📝 **Ghi chú:** ${totalNotes} mục ghi chú\n` +
               `• 💡 **Học hỏi:** ${totalLearnings} thẻ kiến thức\n\n` +
               `Bạn muốn tôi phân tích hoặc tra cứu thông tin gì cụ thể?`;
    }

    // Expose global methods
    window.renderAiAssistant = renderAiAssistant;

})(window);
