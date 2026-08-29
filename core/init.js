// Khởi tạo các event listener và code còn sót lại
// Kanban Logic
// Ẩn kết quả khi click ra ngoài
document.addEventListener('click', (e) => {
    const container = document.getElementById('globalSearchResults');
    const input = document.getElementById('globalSearchInput');
    if (container && input && !container.contains(e.target) && e.target !== input) {
        container.style.display = 'none';
    }
});
document.addEventListener('DOMContentLoaded', () => {
    // Show ToolBox tab ONLY when running in Chrome Extension environment (chrome-extension://)
    const isExtension = typeof chrome !== 'undefined' && 
                        chrome.runtime && 
                        Boolean(chrome.runtime.id) && 
                        location.protocol === 'chrome-extension:';
    const toolboxTab = document.getElementById('tab_TOOLBOX');
    if (toolboxTab) {
        toolboxTab.style.display = isExtension ? 'flex' : 'none';
    }

    lucide.createIcons();
    document.getElementById('loading').style.display = 'none';
    if (window.updateGlobalFloatingButtonUI) window.updateGlobalFloatingButtonUI();
    if (window.updateActionRecorderButtonUI) window.updateActionRecorderButtonUI();
    if (typeof getAccessToken === 'function') getAccessToken().catch(() => {});
    switchTab('LICH');
    // Request Notification Permission
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
    }
    // Start Reminder Cron
    setInterval(checkReminders, 60000);
    // Global click outside to close modals
    document.addEventListener('mousedown', function(e) {
        const modals = [
            { maskId: 'productModal', closeFunc: () => { if (typeof closeProductForm === 'function') closeProductForm(); else { const m = document.getElementById('productModal'); if(m) m.style.display = 'none'; } } },
            { maskId: 'orderDetailModal', closeFunc: () => { if (typeof closeDonHangDetail === 'function') closeDonHangDetail(); else { const m = document.getElementById('orderDetailModal'); if(m) m.style.display = 'none'; } } },
            { maskId: 'batchEditModal', closeFunc: () => { if (typeof closeBatchEditModal === 'function') closeBatchEditModal(); else { const m = document.getElementById('batchEditModal'); if(m) m.style.display = 'none'; } } }
        ];
        modals.forEach(m => {
            const mask = document.getElementById(m.maskId);
            // If modal is open
            if (mask && (mask.style.display === 'flex' || mask.style.display === 'block' || window.getComputedStyle(mask).display !== 'none')) {
                const modalContent = mask.querySelector('.modal');
                // If click is outside the actual modal content
                if (modalContent && !modalContent.contains(e.target)) {
                    m.closeFunc();
                }
            }
        });
    });
});
// Batch Actions Logic
window.batchEditTargetCol = null;
window.toggleTag = function(inputId, tagStr) {
    const input = document.getElementById(inputId);
    if (!input) return;
    let currentVals = input.value.split(',').map(s => s.trim()).filter(s => s);
    if (currentVals.includes(tagStr)) {
        currentVals = currentVals.filter(v => v !== tagStr);
    } else {
        currentVals.push(tagStr);
    }
    input.value = currentVals.join(', ');
    if (window.updateTagButtonsUI) window.updateTagButtonsUI(inputId);
}
window.updateTagButtonsUI = function(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const currentVals = input.value.split(',').map(s => s.trim()).filter(s => s);
    let container = null;
    if (inputId === 'batchEditPhanLoaiInput') {
        container = document.getElementById('batchEditTagButtons');
    } else {
        container = input.nextElementSibling;
    }
    if (container && container.classList.contains('tag-buttons')) {
        container.querySelectorAll('.tag-btn').forEach(btn => {
            const t = btn.getAttribute('data-tag');
            if (t && currentVals.includes(t)) {
                btn.style.background = 'var(--primary)';
                btn.style.color = 'white';
                btn.style.border = '1px solid var(--primary)';
            } else {
                btn.style.background = '#f1f5f9';
                btn.style.color = '#334155';
                btn.style.border = '1px solid #e2e8f0';
            }
        });
    }
}
window.updateBatchEditTagButtons = function() {
    window.updateTagButtonsUI('batchEditPhanLoaiInput');
}
window.quickEditCell = function(sheetRow, colName) {
    // Bỏ chọn tất cả checkbox
    document.querySelectorAll('.row-checkbox').forEach(cb => cb.checked = false);
    // Chọn đúng checkbox của dòng cần sửa
    const targetCb = document.querySelector(`.row-checkbox[data-index="${sheetRow}"]`);
    if (targetCb) {
        targetCb.checked = true;
        // find current val
        const tabConfig = CONFIG.tabs[currentTab];
        const colIndex = tabConfig.headers.indexOf(colName);
        let currentVal = '';
        if (colIndex !== -1) {
            const rowData = allData.find(r => String(r._sheetRow) === String(sheetRow));
            if (rowData) currentVal = rowData[colIndex] || '';
        }
        let title = 'Sửa nhanh';
        let label = 'Giá trị mới';
        if (colName === 'hashtag') { title = 'Sửa Hashtag'; label = 'HASHTAG'; }
        if (colName === 'gioi_tinh') { title = 'Sửa Giới tính'; label = 'GIỚI TÍNH'; }
        openBatchEdit(colName, title, label, [], currentVal);
    } else {
        alert('Không tìm thấy dòng để sửa');
    }
}
// Kanban Drag and Drop Functions
// ==========================================
// 10. THONG KE / ANALYTICS
// ==========================================
// ==========================================
// 11. THONG BAO & NHAC VIEC (NOTIFICATIONS)
// ==========================================
// ==========================================
// 12. UPLOAD TO IMGBB
// ==========================================
