// ============================================================
//  QUICK ADD DASHBOARD — Redesigned
// ============================================================

function _fmtDate(date) {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}
function _fmtDateTime(date) {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

// ---------- Field builders ----------

function _fieldDate(id, value) {
    return `
    <div class="date-adjuster">
        <button type="button" class="adj-btn" onclick="adjustDateInput('${id}', -1)">−</button>
        <input type="date" id="${id}" name="${id.split('_').slice(2).join('_')}" value="${value}">
        <button type="button" class="adj-btn" onclick="adjustDateInput('${id}', 1)">+</button>
    </div>`;
}

function _fieldDateTime(id, value, extras) {
    return `
    <div class="date-adjuster">
        <button type="button" class="adj-btn" onclick="adjustDateInput('${id}', -1)">−</button>
        <input type="datetime-local" id="${id}" name="${id.split('_').slice(2).join('_')}" value="${value}">
        <button type="button" class="adj-btn" onclick="adjustDateInput('${id}', 1)">+</button>
        ${extras || ''}
    </div>`;
}

function _fieldText(id, name, placeholder, readonly) {
    return `<input type="text" id="${id}" name="${name}" placeholder="${placeholder}"${readonly ? ' readonly' : ''}>`;
}

function _fieldTextarea(id, name, placeholder) {
    return `<textarea id="${id}" name="${name}" placeholder="${placeholder}" rows="3"></textarea>`;
}

function _fieldChips(id, name, chips, placeholder, multi) {
    const chipsHtml = chips.map(t => {
        const safeT = t.replace(/'/g, "&#39;");
        const onclick = multi
            ? `const inp=document.getElementById('${id}');const cur=inp.value.split(',').map(s=>s.trim()).filter(s=>s);if(!cur.includes('${safeT}')){cur.push('${safeT}');inp.value=cur.join(', ');}`
            : `document.getElementById('${id}').value='${safeT}';`;
        return `<button type="button" class="tag-btn" onclick="${onclick}">${t}</button>`;
    }).join('');
    return `
    <div class="tag-buttons">${chipsHtml}</div>
    <input type="text" id="${id}" name="${name}" placeholder="${placeholder}">`;
}

function _fieldLoaiGiaoDich(tabName) {
    const id = `input_${tabName}_loai_giao_dich`;
    const opts = ['Chi', 'Thu', 'Chuyển khoản'];
    const btns = opts.map((o, i) => `
        <button type="button" class="${i === 0 ? 'active' : ''}"
            onclick="document.getElementById('${id}').value='${o}';
                     this.closest('.loai-toggle').querySelectorAll('button').forEach(b=>b.classList.remove('active'));
                     this.classList.add('active');
                     if(window.handleLoaiGiaoDichChangeQuickAdd) window.handleLoaiGiaoDichChangeQuickAdd('${tabName}');">${o}</button>
    `).join('');
    return `
    <div class="loai-toggle">${btns}</div>
    <input type="hidden" id="${id}" name="loai_giao_dich" value="Chi">`;
}

function _fieldSoTien(id, tabName) {
    const amounts = [10, 20, 30, 50, 100, 200, 300, 500, 1000];
    const chips = amounts.map(a =>
        `<button type="button" class="amount-chip"
            onclick="const inp=document.getElementById('${id}');inp.value=(parseFloat(inp.value.replace(/,/g,''))||0)+${a};">+${formatMoney(a)}</button>`
    ).join('');
    return `
    <div class="amount-chips">${chips}</div>
    <input type="number" id="${id}" name="so_tien" placeholder="Nhập số tiền...">`;
}

function _fieldMap(tabName) {
    const id = `input_${tabName}_map`;
    return `
    <div class="date-adjuster">
        <input type="text" id="${id}" name="map" placeholder="Kinh độ, Vĩ độ..." style="flex:1;" onchange="updateMapFromInputQuickAdd('${tabName}')">
        <button type="button" class="location-btn" onclick="getLocationQuickAdd('${tabName}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
            Vị trí
        </button>
    </div>
    <div id="mapPreview_${tabName}" style="width:100%;height:200px;margin-top:8px;border-radius:10px;border:1px solid #e5e9f2;display:none;"></div>`;
}

// ---------- Main form generator ----------

function generateFormHTML(tabName) {
    const tabConfig = CONFIG.tabs[tabName];
    if (!tabConfig) return '';

    const now = new Date();
    const nowDate = _fmtDate(now);
    const nowDT = _fmtDateTime(now);
    const out30 = _fmtDateTime(new Date(now.getTime() + 30 * 60000));

    return tabConfig.headers.map(h => {
        const id = `input_${tabName}_${h}`;
        let inputHtml = '';
        let label = h.toUpperCase();

        if (h === 'id') return `<input type="hidden" id="${id}" name="${h}" value="">`;

        switch (h) {
            case 'ngay':
                inputHtml = _fieldDate(id, nowDate);
                break;
            case 'ngay_in':
                inputHtml = _fieldDateTime(id, nowDT);
                break;
            case 'ngay_out':
                inputHtml = _fieldDateTime(id, out30,
                    `<button type="button" class="plus30-btn" onclick="setNgayOutPlus30QuickAdd('${tabName}')">+30p</button>`);
                break;
            case 'ngay_bat_dau':
            case 'deadline':
            case 'ngay_hoan_thanh':
                inputHtml = _fieldDateTime(id, '');
                break;
            case 'bao_lau':
            case 'so_du_ao':
                inputHtml = _fieldText(id, h, 'Tự động tính...', true);
                break;
            case 'map':
                inputHtml = _fieldMap(tabName);
                break;
            case 'phan_loai':
                inputHtml = _fieldChips(id, h, ['Ghi chú', 'Sự kiện', 'Ảnh', 'HN'], 'Nhập hoặc chọn phân loại...', false);
                break;
            case 'tag':
                if (tabName === 'HOC_HOI') {
                    inputHtml = _fieldChips(id, h, ['Lập trình', 'Thiết kế', 'Công cụ', 'Bài viết hay'], 'Nhiều tag, cách nhau dấu phẩy...', true);
                } else {
                    inputHtml = _fieldText(id, h, 'Nhập tag...');
                }
                break;
            case 'noi_dung':
            case 'mo_ta':
            case 'ghi_chu':
                inputHtml = _fieldTextarea(id, h, 'Nhập ' + h + '...');
                break;
            case 'loai_giao_dich':
                inputHtml = _fieldLoaiGiaoDich(tabName);
                break;
            case 'so_tien':
                inputHtml = _fieldSoTien(id, tabName);
                break;
            case 'hang_muc':
                inputHtml = _fieldChips(id, h, ['Công việc', 'Cá nhân', 'Gia đình', 'Lương', 'Bán hàng', 'Momo', 'Tp'], 'Nhập hoặc chọn hạng mục...', false);
                break;
            case 'tai_khoan':
            case 'tai_khoan_nhan':
                inputHtml = _fieldChips(id, h, ['Tiền mặt', 'Vietcombank', 'Momo'], 'Nhập hoặc chọn tài khoản...', false);
                break;
            case 'muc_uu_tien':
                if (tabName === 'CONG_VIEC') inputHtml = _fieldChips(id, h, ['Cao', 'Trung bình', 'Thấp'], 'Mức ưu tiên...', false);
                else inputHtml = _fieldText(id, h, 'Nhập ' + h + '...');
                break;
            case 'trang_thai':
                if (tabName === 'CONG_VIEC') inputHtml = _fieldChips(id, h, ['Chưa làm', 'Đang làm', 'Hoàn thành', 'Tạm dừng'], 'Trạng thái...', false);
                else inputHtml = _fieldText(id, h, 'Nhập ' + h + '...');
                break;
            case 'danh_muc':
                if (tabName === 'CONG_VIEC') inputHtml = _fieldChips(id, h, ['Công việc', 'Cá nhân', 'Gia đình', 'Học tập', 'Khác'], 'Danh mục...', false);
                else inputHtml = _fieldText(id, h, 'Nhập ' + h + '...');
                break;
            default:
                inputHtml = _fieldText(id, h, 'Nhập ' + h + '...');
        }

        return `<div class="form-group"><label>${label}</label>${inputHtml}</div>`;
    }).join('');
}

// ---------- Render all 3 quick-add cards ----------

const QUICK_ADD_META = {
    GHI_CHU: {
        title: 'Thêm Ghi Chú',
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
    },
    CHI_TIEU: {
        title: 'Thêm Chi Tiêu',
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>`
    },
    HOC_HOI: {
        title: 'Thêm Học Hỏi',
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 018 8c0 5.25-8 13-8 13S4 15.25 4 10a8 8 0 018-8z"/></svg>`
    }
};

function renderQuickAddForms() {
    const dash = document.getElementById('quickAddDashboard');
    if (!dash) return;

    const tabsToRender = ['GHI_CHU', 'CHI_TIEU', 'HOC_HOI'];

    dash.innerHTML = tabsToRender.map(tab => {
        const meta = QUICK_ADD_META[tab];
        return `
        <div class="quick-add-card">
            <form onsubmit="saveQuickAdd(event, '${tab}')" style="display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden;">
                <div class="quick-add-header">
                    <div class="quick-add-header-icon">${meta.icon}</div>
                    <h3>${meta.title}</h3>
                    <button type="submit" class="quick-save-btn-mini" title="Lưu">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        <span>Lưu</span>
                    </button>
                </div>
                <div class="quick-add-body">
                    ${generateFormHTML(tab)}
                </div>
                <div class="quick-add-footer">
                    <button type="submit" class="quick-save-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        ${meta.title}
                    </button>
                </div>
            </form>
        </div>`;
    }).join('');

    // Handle chuyển khoản visibility
    window.handleLoaiGiaoDichChangeQuickAdd = function (tabName) {
        const loai = document.getElementById(`input_${tabName}_loai_giao_dich`)?.value;
        const targetGroup = document.getElementById(`input_${tabName}_tai_khoan_nhan`)?.closest('.form-group');
        const hangMucGroup = document.getElementById(`input_${tabName}_hang_muc`)?.closest('.form-group');
        if (targetGroup) targetGroup.style.display = loai === 'Chuyển khoản' ? 'flex' : 'none';
        if (hangMucGroup) hangMucGroup.style.display = loai === 'Chuyển khoản' ? 'none' : 'flex';
    };

    if (document.getElementById('input_CHI_TIEU_loai_giao_dich')) {
        window.handleLoaiGiaoDichChangeQuickAdd('CHI_TIEU');
    }

    // Init lucide icons if available
    if (window.lucide) lucide.createIcons();
}

// ---------- Save ----------

async function saveQuickAdd(e, tabName) {
    e.preventDefault();
    const loadEl = document.getElementById('loading');
    loadEl.style.display = 'flex';
    loadEl.querySelector('p').innerText = 'Đang lưu...';

    try {
        const tabConfig = CONFIG.tabs[tabName];
        const token = await getAccessToken();
        const newId = 'ID-' + Date.now();

        const rowData = tabConfig.headers.map(h => {
            if (h === 'bao_lau' || h === 'so_du_ao') return null;
            if (h === 'id') return newId;
            const el = document.getElementById(`input_${tabName}_${h}`);
            let val = el ? el.value : '';
            if (h === 'ngay' && val) {
                const [y, m, d] = val.split('-');
                if (y && m && d) val = `${d}/${m}/${y}`;
            } else if (['ngay_in', 'ngay_out', 'ngay_bat_dau', 'deadline', 'ngay_hoan_thanh'].includes(h) && val) {
                const [datePart, timePart] = val.split('T');
                if (datePart) {
                    const [y, m, d] = datePart.split('-');
                    val = `${d}/${m}/${y} ${timePart || '00:00'}`;
                }
            }
            return val;
        });

        const res = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${tabName}!A2:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
            {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ values: [rowData] })
            }
        );

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error?.message || 'Lỗi khi lưu dữ liệu');
        }

        // Show success toast instead of alert
        _showToast(`✓ Đã lưu vào ${QUICK_ADD_META[tabName]?.title || tabName}`, 'success');
        renderQuickAddForms();
    } catch (err) {
        console.error(err);
        _showToast('Lưu thất bại: ' + err.message, 'error');
    } finally {
        loadEl.style.display = 'none';
    }
}

// ---------- Toast notification ----------

function _showToast(msg, type) {
    let toast = document.getElementById('_quickAddToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = '_quickAddToast';
        toast.style.cssText = `
            position:fixed; bottom:90px; left:50%; transform:translateX(-50%) translateY(20px);
            padding:12px 22px; border-radius:30px; font-weight:700; font-size:0.875rem;
            z-index:9999; opacity:0; transition:all 0.25s; white-space:nowrap;
            box-shadow:0 6px 20px rgba(0,0,0,0.15); pointer-events:none;`;
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.background = type === 'success' ? '#10b981' : '#ef4444';
    toast.style.color = '#fff';
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(10px)';
    }, 2800);
}

// ---------- Helpers ----------

function setNgayOutPlus30QuickAdd(tabName) {
    const ngayInInput = document.getElementById(`input_${tabName}_ngay_in`);
    const ngayOutInput = document.getElementById(`input_${tabName}_ngay_out`);
    if (ngayInInput && ngayOutInput && ngayInInput.value) {
        const inDate = new Date(ngayInInput.value);
        inDate.setMinutes(inDate.getMinutes() + 30);
        ngayOutInput.value = _fmtDateTime(inDate);
    }
}

function getLocationQuickAdd(tabName) {
    const input = document.getElementById(`input_${tabName}_map`);
    if (!navigator.geolocation) { alert('Trình duyệt không hỗ trợ Geolocation.'); return; }
    input.placeholder = 'Đang lấy vị trí...';
    navigator.geolocation.getCurrentPosition(
        pos => {
            input.value = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
            input.placeholder = 'Kinh độ, Vĩ độ...';
        },
        err => {
            alert('Không thể lấy vị trí: ' + err.message);
            input.placeholder = 'Kinh độ, Vĩ độ...';
        }
    );
}

function updateMapFromInputQuickAdd(_tabName) {
    // Map preview disabled in quick-add to save space
}
