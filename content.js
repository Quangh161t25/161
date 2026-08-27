// ============================================================
//  InfoSys Extension — Content Script
//  - Mini floating icons at start & end of highlighted text
//  - Auto-save on click or copy to BANG_TAM
// ============================================================

(function() {
    let lastCopiedText = '';
    let lastCopyTime = 0;
    let currentSelectedText = '';
    let selectionTimeout = null;

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
                padding: 10px 18px !important;
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

        toast.innerHTML = `<span style="color:#22c55e; font-size:16px; font-weight:bold;">✓</span> <span style="color:#ffffff;">${msg}</span>`;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';

        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(12px)';
        }, 2200);
    }

    // Save text to BANG_TAM
    function doSaveToBangTam(text, targetBtn) {
        if (!text || text.trim().length === 0) return;

        if (targetBtn) {
            targetBtn.innerHTML = '✓';
            targetBtn.style.background = '#16a34a';
            targetBtn.style.borderColor = '#16a34a';
            targetBtn.style.color = '#ffffff';
        }

        try {
            chrome.runtime.sendMessage({
                action: 'AUTO_COPY_SAVE',
                data: {
                    text: text.trim(),
                    url: window.location.href,
                    title: document.title || window.location.href
                }
            }, (response) => {
                showToast('Đã lưu vào Bảng tạm');
                setTimeout(hideFloatingIcons, 1000);
            });
        } catch (e) {
            console.error('Error sending message to extension:', e);
            showToast('Đã lưu vào Bảng tạm');
            setTimeout(hideFloatingIcons, 1000);
        }
    }

    // Create a mini icon button (fixed in viewport)
    function createMiniBtn(titleText, isEnd = false) {
        const btn = document.createElement('div');
        btn.className = 'infosys-floating-btn';
        btn.title = titleText || 'Lưu vào Bảng tạm';
        btn.style.cssText = `
            position: fixed !important;
            width: 26px !important;
            height: 26px !important;
            border-radius: 50% !important;
            background: #0f172a !important;
            color: #38bdf8 !important;
            border: 2px solid #38bdf8 !important;
            box-shadow: 0 4px 14px rgba(0,0,0,0.35) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            pointer-events: auto !important;
            user-select: none !important;
            padding: 0 !important;
            margin: 0 !important;
            font-size: 13px !important;
            font-weight: bold !important;
            line-height: 1 !important;
            z-index: 2147483647 !important;
            transition: transform 0.15s ease, background 0.2s ease, border-color 0.2s ease !important;
            box-sizing: border-box !important;
        `;

        btn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none; display:block;">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                <line x1="12" y1="11" x2="12" y2="17"></line>
                <line x1="9" y1="14" x2="15" y2="14"></line>
            </svg>
        `;

        btn.onmouseover = () => {
            btn.style.transform = 'scale(1.25)';
            btn.style.background = '#0284c7';
            btn.style.color = '#ffffff';
            btn.style.borderColor = '#ffffff';
        };
        btn.onmouseout = () => {
            btn.style.transform = 'scale(1)';
            if (!btn.innerHTML.includes('✓')) {
                btn.style.background = '#0f172a';
                btn.style.color = '#38bdf8';
                btn.style.borderColor = '#38bdf8';
            }
        };

        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            doSaveToBangTam(currentSelectedText, btn);
        });

        return btn;
    }

    function hideFloatingIcons() {
        document.querySelectorAll('.infosys-floating-btn').forEach(el => el.remove());
    }

    // Handle text selection on webpage
    function updateSelectionIcons() {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
            hideFloatingIcons();
            return;
        }

        const text = selection.toString().trim();
        if (!text || text.length === 0) {
            hideFloatingIcons();
            return;
        }

        currentSelectedText = text;

        const range = selection.getRangeAt(0);
        const rects = range.getClientRects();
        if (!rects || rects.length === 0) {
            hideFloatingIcons();
            return;
        }

        const firstRect = rects[0];
        const lastRect = rects[rects.length - 1];

        // Remove old buttons first
        hideFloatingIcons();

        // Icon 1: At the start of selected text
        const btnStart = createMiniBtn('Lưu vào Bảng tạm (Đầu đoạn)', false);
        const startX = Math.max(6, firstRect.left - 30);
        const startY = Math.max(6, firstRect.top - 6);
        btnStart.style.left = `${startX}px`;
        btnStart.style.top = `${startY}px`;
        (document.body || document.documentElement).appendChild(btnStart);

        // Icon 2: At the end of selected text
        const btnEnd = createMiniBtn('Lưu vào Bảng tạm (Cuối đoạn)', true);
        const endX = Math.min(window.innerWidth - 32, lastRect.right + 6);
        const endY = Math.max(6, lastRect.bottom - 22);
        btnEnd.style.left = `${endX}px`;
        btnEnd.style.top = `${endY}px`;
        (document.body || document.documentElement).appendChild(btnEnd);
    }

    function scheduleSelectionCheck() {
        clearTimeout(selectionTimeout);
        selectionTimeout = setTimeout(updateSelectionIcons, 40);
    }

    // Global selection listeners
    document.addEventListener('mouseup', scheduleSelectionCheck, true);
    document.addEventListener('touchend', scheduleSelectionCheck, true);
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Shift' || e.key.includes('Arrow') || (e.ctrlKey && e.key === 'a')) {
            scheduleSelectionCheck();
        }
    }, true);

    document.addEventListener('selectionchange', () => {
        clearTimeout(selectionTimeout);
        selectionTimeout = setTimeout(() => {
            const sel = window.getSelection();
            if (!sel || sel.isCollapsed) {
                hideFloatingIcons();
            } else {
                updateSelectionIcons();
            }
        }, 120);
    });

    // Dismiss icons when clicking outside selection
    document.addEventListener('mousedown', (e) => {
        if (e.target && e.target.closest && e.target.closest('.infosys-floating-btn')) {
            return;
        }
        // If clicking somewhere else, hide after short delay if selection collapsed
        setTimeout(() => {
            const sel = window.getSelection();
            if (!sel || sel.isCollapsed) {
                hideFloatingIcons();
            }
        }, 80);
    }, true);

    // Also update position on scroll
    window.addEventListener('scroll', () => {
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed) {
            updateSelectionIcons();
        }
    }, { passive: true });

    // Also support Ctrl+C / Copy event
    document.addEventListener('copy', () => {
        setTimeout(() => {
            const selection = window.getSelection().toString().trim();
            const now = Date.now();
            if (!selection || selection.length < 1) return;

            if (selection === lastCopiedText && (now - lastCopyTime) < 1500) {
                return;
            }
            lastCopiedText = selection;
            lastCopyTime = now;

            doSaveToBangTam(selection, null);
        }, 30);
    }, true);
})();
