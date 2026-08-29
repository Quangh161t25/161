// ============================================================
//  InfoSys — Module THAO_TAC (Ghi lại & Quản lý Thao tác)
// ============================================================

function safeEscapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function updateActionRecorderButtonUI() {
    const btn = document.getElementById('toggleRecorderBtn');
    const textEl = document.getElementById('toggleRecorderText');
    if (!btn || !textEl) return;

    const isActive = window.isActionRecorderEnabled === true;
    if (isActive) {
        btn.style.background = '#fef2f2';
        btn.style.borderColor = '#fca5a5';
        btn.style.color = '#dc2626';
        btn.innerHTML = `<i data-lucide="radio" style="width:14px; height:14px; color:#ef4444; animation: infosys-pulse 1.5s infinite;"></i> <span id="toggleRecorderText">Ghi thao tác: ĐANG BẬT</span>`;
    } else {
        btn.style.background = '#ffffff';
        btn.style.borderColor = '#cbd5e1';
        btn.style.color = '#334155';
        btn.innerHTML = `<i data-lucide="circle-dot" style="width:14px; height:14px; color:#94a3b8;"></i> <span id="toggleRecorderText">Ghi thao tác: TẮT</span>`;
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function getActionTypeBadge(type) {
    const t = String(type || '').toUpperCase();
    if (t.includes('LINK')) {
        return `<span style="background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; padding:2px 7px; border-radius:6px; font-size:0.75rem; font-weight:700; display:inline-flex; align-items:center; gap:3px;"><i data-lucide="link" style="width:11px; height:11px;"></i> Link</span>`;
    } else if (t.includes('NUT') || t.includes('BUTTON')) {
        return `<span style="background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; padding:2px 7px; border-radius:6px; font-size:0.75rem; font-weight:700; display:inline-flex; align-items:center; gap:3px;"><i data-lucide="mouse-pointer" style="width:11px; height:11px;"></i> Nút bấm</span>`;
    } else if (t.includes('NHAP') || t.includes('INPUT') || t.includes('TYPE')) {
        return `<span style="background:#faf5ff; color:#7e22ce; border:1px solid #e9d5ff; padding:2px 7px; border-radius:6px; font-size:0.75rem; font-weight:700; display:inline-flex; align-items:center; gap:3px;"><i data-lucide="keyboard" style="width:11px; height:11px;"></i> Gõ phím</span>`;
    } else if (t.includes('SUBMIT') || t.includes('FORM')) {
        return `<span style="background:#fffbeb; color:#b45309; border:1px solid #fde68a; padding:2px 7px; border-radius:6px; font-size:0.75rem; font-weight:700; display:inline-flex; align-items:center; gap:3px;"><i data-lucide="send" style="width:11px; height:11px;"></i> Gửi Form</span>`;
    } else if (t.includes('COPY')) {
        return `<span style="background:#ecfeff; color:#0e7490; border:1px solid #a5f3fc; padding:2px 7px; border-radius:6px; font-size:0.75rem; font-weight:700; display:inline-flex; align-items:center; gap:3px;"><i data-lucide="copy" style="width:11px; height:11px;"></i> Sao chép</span>`;
    } else if (t.includes('PASTE')) {
        return `<span style="background:#fff1f2; color:#be123c; border:1px solid #fecdd3; padding:2px 7px; border-radius:6px; font-size:0.75rem; font-weight:700; display:inline-flex; align-items:center; gap:3px;"><i data-lucide="clipboard-paste" style="width:11px; height:11px;"></i> Dán</span>`;
    } else if (t.includes('TRUY_CAP') || t.includes('NAV')) {
        return `<span style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; padding:2px 7px; border-radius:6px; font-size:0.75rem; font-weight:700; display:inline-flex; align-items:center; gap:3px;"><i data-lucide="globe" style="width:11px; height:11px;"></i> Mở trang</span>`;
    }
    return `<span style="background:#f1f5f9; color:#475569; border:1px solid #e2e8f0; padding:2px 6px; border-radius:6px; font-size:0.75rem; font-weight:600;">${type || 'Thao tác'}</span>`;
}

function renderThaoTacCustomCell(h, val, sheetRow, rowData) {
    if (h === 'loai_thao_tac') {
        return `<td style="width: 105px; min-width: 95px; text-align: center; white-space: nowrap; padding: 8px 6px;">${getActionTypeBadge(val)}</td>`;
    } else if (h === 'doi_tuong') {
        const rawStr = String(val || '').trim();
        return `<td style="width: 140px; min-width: 120px; font-weight:600; color:#334155; word-break:break-word; padding:8px 6px;">${safeEscapeHtml(rawStr)}</td>`;
    } else if (h === 'noi_dung') {
        const rawStr = String(val || '').trim();
        const escapedVal = rawStr.replace(/'/g, "&#39;").replace(/"/g, "&quot;").replace(/\n/g, "\\n").replace(/\r/g, "");
        
        let displayContent = safeEscapeHtml(rawStr);
        if (rawStr.startsWith('http://') || rawStr.startsWith('https://')) {
            displayContent = `<a href="${rawStr}" target="_blank" rel="noopener noreferrer" style="color:var(--primary); text-decoration:underline; word-break:break-all;">${rawStr}</a>`;
        }

        const cellHtml = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:6px;">
                <div class="line-clamp-3" style="flex-grow:1; word-break:break-word; max-height:4.5em; line-height:1.45; font-size:0.83rem;">${displayContent}</div>
                <button type="button" data-action="copy-to-clipboard" data-value="${escapedVal}" style="background:transparent; border:none; cursor:pointer; color:#64748b; padding:3px; flex-shrink:0; display:flex; align-items:center; justify-content:center; border-radius:4px;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'" title="Sao chép">
                    <i data-lucide="copy" style="width:13px; height:13px;"></i>
                </button>
            </div>
        `;
        return `<td style="width: auto; min-width: 160px; padding: 8px 6px;">${cellHtml}</td>`;
    } else if (h === 'tieu_de_trang') {
        const rawStr = String(val || '').trim();
        return `<td style="width: 150px; min-width: 130px; font-size:0.8rem; color:#475569; word-break:break-word; padding:8px 6px;">${safeEscapeHtml(rawStr)}</td>`;
    } else if (h === 'url_trang') {
        if (val) {
            const rawStr = String(val).trim();
            try {
                const u = new URL(rawStr);
                const host = u.hostname.replace(/^www\./, '');
                return `<td style="width: 110px; min-width: 95px; padding: 8px 6px;"><a href="${rawStr}" target="_blank" rel="noopener noreferrer" style="color:var(--primary); background:#f0f9ff; border:1px solid #bae6fd; padding:2px 6px; border-radius:6px; text-decoration:none; font-weight:600; font-size:0.75rem; display:inline-flex; align-items:center; gap:3px; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${rawStr}"><i data-lucide="external-link" style="width:10px; height:10px; flex-shrink:0;"></i><span>${host}</span></a></td>`;
            } catch(e) {
                return `<td style="width: 110px; min-width: 95px; padding: 8px 6px;">${safeEscapeHtml(rawStr.substring(0, 20))}</td>`;
            }
        }
        return `<td></td>`;
    }
    return null;
}

window.updateActionRecorderButtonUI = updateActionRecorderButtonUI;
window.renderThaoTacCustomCell = renderThaoTacCustomCell;
window.getActionTypeBadge = getActionTypeBadge;
