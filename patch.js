// ============================================================
//  PATCH.JS — UI enhancements on top of app.js
//  1. Delete button in edit modal
//  2. Mobile: collapsible filter for CHI_TIEU
//  3. Override openRecordForm to show/hide delete btn
// ============================================================

// ---------- 1. Delete current record from edit modal ----------

async function deleteCurrentRecord() {
    const sheetRow = window.editingSheetRow;
    if (!sheetRow) return;
    if (!confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) return;

    const loadEl = document.getElementById('loading');
    loadEl.style.display = 'flex';
    loadEl.querySelector('p').innerText = 'Đang xóa...';

    try {
        const sheetId = await getSheetId(currentTab);
        if (sheetId === null) throw new Error('Không tìm thấy sheet ID.');
        const token = await getAccessToken();

        const res = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}:batchUpdate`,
            {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requests: [{
                        deleteDimension: {
                            range: {
                                sheetId: sheetId,
                                dimension: 'ROWS',
                                startIndex: sheetRow - 1,
                                endIndex: sheetRow
                            }
                        }
                    }]
                })
            }
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || 'Lỗi khi xóa');
        }

        closeProductForm();
        await fetchData();
    } catch (e) {
        alert('Xóa thất bại: ' + e.message);
    } finally {
        loadEl.style.display = 'none';
    }
}

// ---------- 2. Hook into openRecordForm to show/hide delete btn ----------

(function patchOpenRecordForm() {
    const _orig = window.openRecordForm;
    if (!_orig) return;
    window.openRecordForm = function (rowData, sheetRow) {
        _orig.call(this, rowData, sheetRow);
        const deleteBtn = document.getElementById('deleteRecordBtn');
        if (deleteBtn) {
            // Only show delete button when editing an existing row
            deleteBtn.style.display = (rowData && sheetRow) ? 'flex' : 'none';
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };
})();

// ---------- 3. Mobile filter: collapse CHI_TIEU filters into pills ----------

(function patchRenderTabFilters() {
    const _orig = window.renderTabFilters;
    if (!_orig) return;

    window.renderTabFilters = function () {
        _orig.call(this);

        // Only transform on mobile
        if (window.innerWidth > 768) return;
        if (currentTab !== 'CHI_TIEU' && currentTab !== 'CONG_VIEC') return;

        const container = document.getElementById('phanLoaiFilterContainer');
        if (!container) return;

        // Read the existing filter groups rendered by app.js
        const groups = container.querySelectorAll('div[style*="border-right"]');
        if (!groups.length) return;

        // Rebuild as compact collapsible rows
        let html = '<div class="mobile-filter-wrap">';
        groups.forEach(group => {
            const label = group.querySelector('span')?.textContent?.replace(':', '').trim() || '';
            const buttons = Array.from(group.querySelectorAll('button'));
            const activeBtn = buttons.find(b => b.classList.contains('active') || b.style.backgroundColor);
            const activeLabel = (activeBtn && !activeBtn.textContent.includes('Tất cả'))
                ? activeBtn.textContent.trim()
                : null;

            const btnHtml = buttons.map(b => b.outerHTML).join('');
            const rowId = 'mf_' + label.replace(/[^a-z0-9]/gi, '_');

            html += `
            <div class="mf-row" id="${rowId}">
                <button type="button" class="mf-toggle" onclick="_toggleMobileFilter('${rowId}')">
                    <span class="mf-label">${label}</span>
                    ${activeLabel ? `<span class="mf-active-tag">${activeLabel}</span>` : ''}
                    <svg class="mf-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div class="mf-options">${btnHtml}</div>
            </div>`;
        });
        html += '</div>';
        container.innerHTML = html;
    };
})();

function _toggleMobileFilter(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;
    row.classList.toggle('open');
}

// Re-apply patch after tab switches
document.addEventListener('DOMContentLoaded', function () {
    // Re-patch after each fetchData call completes
    const _origFetch = window.fetchData;
    if (_origFetch) {
        window.fetchData = async function () {
            await _origFetch.call(this);
            // Re-apply mobile filter patch
            if (window.innerWidth <= 768 && (currentTab === 'CHI_TIEU' || currentTab === 'CONG_VIEC')) {
                setTimeout(() => window.renderTabFilters && window.renderTabFilters(), 50);
            }
        };
    }
});

// ============================================================
//  MOBILE TABLE PATCHES
//  - GHI_CHU: merge NGAY / NGAY_IN / NGAY_OUT into 1 compact cell
//  - Compact header row
// ============================================================

function _applyMobileTablePatches() {
    if (window.innerWidth > 768) return;

    // ---- GHI_CHU: merge date columns ----
    if (currentTab === 'GHI_CHU') {
        _mergeGhiChuDates();
    }
}

function _mergeGhiChuDates() {
    const head = document.getElementById('tableHead');
    const body = document.getElementById('tableBody');
    if (!head || !body) return;

    // Find column indices for ngay, ngay_in, ngay_out
    const headers = CONFIG.tabs['GHI_CHU'].headers;
    // In the rendered table, col 0 = checkbox, col 1+ = headers (skip id at index 0)
    // rendered headers skip 'id' (index 0) so visual col 1 = ngay (headers[1])
    // visual col 2 = ngay_in, visual col 3 = ngay_out

    // Replace header: merge ngay/ngay_in/ngay_out into 1 column "THỜI GIAN"
    const thRow = head.querySelector('tr');
    if (!thRow) return;
    const ths = Array.from(thRow.querySelectorAll('th'));
    // ths[0]=checkbox, ths[1]=NGAY, ths[2]=NGAY_IN, ths[3]=NGAY_OUT
    if (ths.length < 4) return;

    // Already patched?
    if (ths[1] && ths[1].dataset.merged) return;

    ths[1].textContent = 'THỜI GIAN';
    ths[1].style.cssText = 'white-space:nowrap; width:72px; font-size:0.65rem; padding:7px 6px;';
    ths[1].dataset.merged = '1';
    if (ths[2]) ths[2].style.display = 'none';
    if (ths[3]) ths[3].style.display = 'none';

    // Merge body rows
    const rows = Array.from(body.querySelectorAll('tr'));
    rows.forEach(tr => {
        const tds = Array.from(tr.querySelectorAll('td'));
        // tds[0]=checkbox, tds[1]=ngay, tds[2]=ngay_in, tds[3]=ngay_out
        if (tds.length < 4) return;
        if (tds[1].dataset.merged) return;

        const ngay = (tds[1].textContent || '').trim();
        const ngayIn = (tds[2].textContent || '').trim();
        const ngayOut = (tds[3].textContent || '').trim();

        // Format: date on first line, time range on second
        let timeRange = '';
        if (ngayIn && ngayOut && ngayIn !== '00:00' && ngayOut !== '00:00') {
            timeRange = `<span style="color:#6b7280;font-size:0.7rem;">${ngayIn}–${ngayOut}</span>`;
        } else if (ngayIn && ngayIn !== '00:00') {
            timeRange = `<span style="color:#6b7280;font-size:0.7rem;">${ngayIn}</span>`;
        }

        tds[1].innerHTML = `
            <div style="display:flex;flex-direction:column;gap:1px;line-height:1.3;">
                <span style="font-weight:700;font-size:0.75rem;color:#1a1f36;">${ngay}</span>
                ${timeRange}
            </div>`;
        tds[1].style.cssText = 'padding:6px 6px; white-space:nowrap; vertical-align:middle;';
        tds[1].dataset.merged = '1';

        if (tds[2]) tds[2].style.display = 'none';
        if (tds[3]) tds[3].style.display = 'none';
    });
}

// Hook into renderTable
(function patchRenderTable() {
    const _orig = window.renderTable;
    if (!_orig) return;
    window.renderTable = function () {
        _orig.call(this);
        setTimeout(_applyMobileTablePatches, 0);
    };
})();

// Also patch filterTable
(function patchFilterTable() {
    const _orig = window.filterTable;
    if (!_orig) return;
    window.filterTable = function () {
        _orig.call(this);
        setTimeout(_applyMobileTablePatches, 0);
    };
})();
