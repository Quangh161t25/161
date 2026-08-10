// core/events.js

function setupEventListeners() {
    // 1. Sidebar toggle
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', toggleSidebar);
    }

    // 2. Tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = tab.getAttribute('data-tab');
            if (tabName) switchTab(tabName);
        });
    });

    // 3. Search inputs
    const globalSearchInput = document.getElementById('globalSearchInput');
    if (globalSearchInput) {
        globalSearchInput.addEventListener('input', doGlobalSearch);
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterTable);
    }

    // 4. Date filters
    const dateFromFilter = document.getElementById('dateFromFilter');
    const dateToFilter = document.getElementById('dateToFilter');
    if (dateFromFilter) dateFromFilter.addEventListener('change', filterTable);
    if (dateToFilter) dateToFilter.addEventListener('change', filterTable);

    // 5. Quick filter dates
    document.querySelectorAll('[data-action="quick-filter-date"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const val = btn.getAttribute('data-value');
            if (val) quickFilterDate(val);
        });
    });

    // 6. Action buttons
    const reloadBtn = document.getElementById('reloadBtn');
    if (reloadBtn) reloadBtn.addEventListener('click', reloadCurrentTab);

    const viewToggleBtn = document.getElementById('viewToggleBtn');
    if (viewToggleBtn) viewToggleBtn.addEventListener('click', toggleTaskView);

    const batchEditPhanLoaiBtn = document.getElementById('batchEditPhanLoaiBtn');
    if (batchEditPhanLoaiBtn) batchEditPhanLoaiBtn.addEventListener('click', openBatchEditPhanLoai);

    const batchEditGioiTinhBtn = document.getElementById('batchEditGioiTinhBtn');
    if (batchEditGioiTinhBtn) batchEditGioiTinhBtn.addEventListener('click', openBatchEditGioiTinh);

    const batchEditHashtagBtn = document.getElementById('batchEditHashtagBtn');
    if (batchEditHashtagBtn) batchEditHashtagBtn.addEventListener('click', openBatchEditHashtag);

    const batchDeleteBtn = document.getElementById('batchDeleteBtn');
    if (batchDeleteBtn) batchDeleteBtn.addEventListener('click', batchDelete);

    const addRecordBtn = document.getElementById('addRecordBtn');
    if (addRecordBtn) addRecordBtn.addEventListener('click', openRecordForm);

    const excelFileInput = document.getElementById('excelFileInput');
    if (excelFileInput) excelFileInput.addEventListener('change', handleFileUpload);

    // 7. Modals
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            if (typeof saveRecordFromForm === 'function') saveRecordFromForm(e);
        });
    }

    document.querySelectorAll('[data-action="close-product-form"]').forEach(btn => {
        btn.addEventListener('click', () => { if (typeof closeProductForm === 'function') closeProductForm(); });
    });

    const deleteRecordBtn = document.getElementById('deleteRecordBtn');
    if (deleteRecordBtn) {
        deleteRecordBtn.addEventListener('click', () => { if (typeof deleteCurrentRecord === 'function') deleteCurrentRecord(); });
    }

    document.querySelectorAll('[data-action="close-order-detail"]').forEach(btn => {
        btn.addEventListener('click', () => { if (typeof closeDonHangDetail === 'function') closeDonHangDetail(); });
    });

    const addDonHangItemBtn = document.getElementById('addDonHangItemBtn');
    if (addDonHangItemBtn) {
        addDonHangItemBtn.addEventListener('click', () => { if (typeof addDonHangItem === 'function') addDonHangItem(); });
    }

    const saveDonHangDetailBtn = document.getElementById('saveDonHangDetailBtn');
    if (saveDonHangDetailBtn) {
        saveDonHangDetailBtn.addEventListener('click', () => { if (typeof saveDonHangDetail === 'function') saveDonHangDetail(); });
    }

    document.querySelectorAll('[data-action="close-batch-edit"]').forEach(btn => {
        btn.addEventListener('click', () => { if (typeof closeBatchEditModal === 'function') closeBatchEditModal(); });
    });

    const batchEditPhanLoaiInput = document.getElementById('batchEditPhanLoaiInput');
    if (batchEditPhanLoaiInput) {
        batchEditPhanLoaiInput.addEventListener('input', () => {
            if (updateBatchEditTagButtons) updateBatchEditTagButtons();
        });
    }

    const executeBatchEditBtn = document.getElementById('executeBatchEditBtn');
    if (executeBatchEditBtn) {
        executeBatchEditBtn.addEventListener('click', () => { if (typeof executeBatchEditGeneric === 'function') executeBatchEditGeneric(); });
    }

    document.querySelectorAll('[data-action="close-add-selection"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const m = document.getElementById('addSelectionModal');
            if (m) m.style.display = 'none';
        });
    });

    document.querySelectorAll('[data-action="open-record-dash"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = btn.getAttribute('data-tab-name');
            if (openRecordFormFromDash && tabName) {
                openRecordFormFromDash(tabName);
            }
            const m = document.getElementById('addSelectionModal');
            if (m) m.style.display = 'none';
        });
    });

    document.querySelectorAll('[data-action="close-day-view"]').forEach(btn => {
        btn.addEventListener('click', () => { if (typeof closeDayView === 'function') closeDayView(); });
    });

    // Close modals on clicking mask
    document.querySelectorAll('.modal-mask[data-modal]').forEach(mask => {
        mask.addEventListener('mousedown', (e) => {
            if (e.target === mask) {
                const modalId = mask.getAttribute('data-modal');
                if (modalId === 'productModal' && typeof closeProductForm === 'function') closeProductForm();
                else if (modalId === 'orderDetailModal' && typeof closeDonHangDetail === 'function') closeDonHangDetail();
                else if (modalId === 'batchEditModal' && typeof closeBatchEditModal === 'function') closeBatchEditModal();
                else if (modalId === 'addSelectionModal') mask.style.display = 'none';
                else if (modalId === 'dayViewModal' && typeof closeDayView === 'function') closeDayView();
            }
        });
    });

    // Delegated click listener for dynamically generated HTML elements
    document.addEventListener('click', (e) => {
        // Set input value
        const setValBtn = e.target.closest('[data-action="set-input-val"]');
        if (setValBtn) {
            const inputId = setValBtn.getAttribute('data-input');
            const val = setValBtn.getAttribute('data-val');
            const inp = document.getElementById(inputId);
            if (inp) {
                inp.value = val;
                if (updateTagButtonsUI) updateTagButtonsUI(inputId);
            }
            return;
        }

        // Filter clicks
        const pf = e.target.closest('[data-action="set-phan-loai-filter"]');
        if (pf) {
            if (setPhanLoaiFilter) setPhanLoaiFilter(pf.getAttribute('data-val'));
            return;
        }
        
        const ef = e.target.closest('[data-action="set-expense-filter"]');
        if (ef) {
            if (setExpenseFilter) setExpenseFilter(ef.getAttribute('data-col'), ef.getAttribute('data-val'));
            return;
        }

        const tf = e.target.closest('[data-action="set-task-filter"]');
        if (tf) {
            if (setTaskFilter) setTaskFilter(tf.getAttribute('data-col'), tf.getAttribute('data-val'));
            return;
        }
        
        // Add money
        const am = e.target.closest('[data-action="add-money"]');
        if (am) {
            const inp = document.getElementById(am.getAttribute('data-input'));
            const a = parseFloat(am.getAttribute('data-val')) || 0;
            if (inp) {
                inp.value = (parseFloat(inp.value.replace(/,/g, '')) || 0) + a;
            }
            return;
        }

        // Adjust date
        const ad = e.target.closest('[data-action="adjust-date"]');
        if (ad) {
            if (adjustDateInput) adjustDateInput(ad.getAttribute('data-input'), parseInt(ad.getAttribute('data-val')));
            return;
        }

        // Open day view dash
        const ord = e.target.closest('[data-action="open-record-from-dash"]');
        if (ord) {
            const tabName = ord.getAttribute('data-tab-name');
            const row = ord.getAttribute('data-row');
            if (openRecordFormFromDash && cachedData && cachedData[tabName]) {
                const rec = cachedData[tabName].find(x => x._sheetRow == row);
                openRecordFormFromDash(tabName, rec, row);
            }
            document.getElementById('globalSearchResults').style.display = 'none';
            return;
        }

        // Change page
        const cpb = e.target.closest('[data-action="change-page"]');
        if (cpb && !cpb.disabled) {
            const val = parseInt(cpb.getAttribute('data-val'));
            if (changePage) changePage(val);
            return;
        }

        // Set ngay out plus 30
        const no30 = e.target.closest('[data-action="set-ngay-out-30"]');
        if (no30) {
            if (setNgayOutPlus30) setNgayOutPlus30();
            return;
        }

        // Get location
        const gloc = e.target.closest('[data-action="get-location"]');
        if (gloc) {
            if (getLocation) getLocation();
            return;
        }
        // Table cell edit
        const editBtn = e.target.closest('[data-action="quick-edit-cell"]');
        if (editBtn) {
            e.stopPropagation();
            const row = editBtn.getAttribute('data-row');
            const col = editBtn.getAttribute('data-col');
            if (quickEditCell) quickEditCell(row, col);
            return;
        }

        // Table sort
        const st = e.target.closest('[data-action="sort-table"]');
        if (st) {
            const col = st.getAttribute('data-col');
            if (sortTable) sortTable(col);
            return;
        }

        // Open record single click
        const or = e.target.closest('[data-action="open-record"]');
        if (or && !e.target.closest('.row-checkbox')) {
            const row = or.getAttribute('data-row');
            if (allData) {
                const data = allData.find(x => x._sheetRow == row);
                if (openRecordForm && data) openRecordForm(data, parseInt(row));
            }
            return;
        }

        
        // Toggle pin
        const pinBtn = e.target.closest('[data-action="toggle-pin"]');
        if (pinBtn) {
            e.stopPropagation();
            const row = pinBtn.getAttribute('data-row');
            const col = pinBtn.getAttribute('data-col');
            let isPinned = pinBtn.getAttribute('data-pinned') === 'true';
            const newVal = isPinned ? '' : '1';
            const sheetRow = parseInt(row);
            if (allData) {
                const dataRow = allData.find(x => x._sheetRow === sheetRow);
                if (dataRow) {
                    dataRow[col] = newVal;
                    // Update API silently
                    (async () => {
                        try {
                            const token = await getAccessToken();
                            const endCol = String.fromCharCode(65 + CONFIG.tabs[currentTab].headers.length - 1);
                            const rowData = CONFIG.tabs[currentTab].headers.map((h, idx) => dataRow[idx] || '');
                            await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${currentTab}!A${sheetRow}:${endCol}${sheetRow}?valueInputOption=RAW`, {
                                method: 'PUT',
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    values: [rowData]
                                })
                            });
                            if (typeof filterTable === 'function') filterTable();
                        } catch (err) {
                            console.error('Error updating pin status:', err);
                        }
                    })();
                }
            }
            return;
        }
        // Switch tab
        const sTab = e.target.closest('[data-action="switch-tab"]');
        if (sTab) {
            if (switchTab) switchTab(sTab.getAttribute('data-tab-name'));
            return;
        }

        // Open record dash new
        const ordn = e.target.closest('[data-action="open-record-dash-new"]');
        if (ordn) {
            if (openRecordFormFromDash) openRecordFormFromDash(ordn.getAttribute('data-tab-name'));
            return;
        }

        // Change dash page
        const cdp = e.target.closest('[data-action="change-dash-page"]');
        if (cdp && !cdp.disabled) {
            if (changeAllDashPage) changeAllDashPage(cdp.getAttribute('data-tab-name'), parseInt(cdp.getAttribute('data-val')));
            return;
        }

        // Copy button
        const copyBtn = e.target.closest('[data-action="copy-to-clipboard"]');
        if (copyBtn) {
            const val = copyBtn.getAttribute('data-value');
            if (typeof copyToClipboard === 'function') copyToClipboard(val, e);
            return;
        }

        // Add to don hang
        const addToOrderBtn = e.target.closest('[data-action="add-to-donhang"]');
        if (addToOrderBtn) {
            e.stopPropagation();
            const sku = addToOrderBtn.getAttribute('data-sku');
            if (typeof addToDonHangBySKU === 'function') addToDonHangBySKU(sku);
            return;
        }

        // Remove don hang item
        const rmOrderBtn = e.target.closest('[data-action="remove-donhang-item"]');
        if (rmOrderBtn) {
            const index = rmOrderBtn.getAttribute('data-index');
            if (typeof removeDonHangItem === 'function') removeDonHangItem(index);
            return;
        }

        // Toggle tag in form
        const tagBtn = e.target.closest('[data-action="toggle-tag"]');
        if (tagBtn) {
            const inputId = tagBtn.getAttribute('data-input');
            const tagVal = tagBtn.getAttribute('data-value');
            if (toggleTag) toggleTag(inputId, tagVal);
            return;
        }

        // Delete tag from record
        const delTagBtn = e.target.closest('[data-action="delete-tag"]');
        if (delTagBtn) {
            e.stopPropagation();
            const row = delTagBtn.getAttribute('data-row');
            const col = delTagBtn.getAttribute('data-col');
            const tag = delTagBtn.getAttribute('data-tag');
            if (deleteTagFromRecord) deleteTagFromRecord(row, col, tag);
            return;
        }

        // Open day view
        const calDay = e.target.closest('[data-action="open-day-view"]');
        if (calDay) {
            const dateStr = calDay.getAttribute('data-date');
            if (typeof openDayView === 'function') openDayView(dateStr);
            return;
        }

        // Upload to imgbb
        const uploadBtn = e.target.closest('[data-action="trigger-upload"]');
        if (uploadBtn) {
            const fileId = uploadBtn.getAttribute('data-file-id');
            const fileInput = document.getElementById(fileId);
            if (fileInput) fileInput.click();
            return;
        }
    });

    // Delegated input listener
    document.addEventListener('input', (e) => {
        if (e.target.matches('[data-action="update-tags-input"]')) {
            const inputId = e.target.getAttribute('data-input');
            if (updateTagButtonsUI) updateTagButtonsUI(inputId);
        }

        if (e.target.matches('[data-action="img-preview-input"]')) {
            const pId = e.target.getAttribute('data-preview');
            const p = document.getElementById(pId);
            if (p) {
                if (e.target.value && e.target.value.startsWith('http')) {
                    p.src = e.target.value;
                    p.style.display = 'block';
                } else {
                    p.style.display = 'none';
                }
            }
        }
        
        if (e.target.matches('[data-action="update-map-input"]')) {
            if (updateMapFromInput) updateMapFromInput();
        }
    });

    // Delegated change listener
    document.addEventListener('change', (e) => {
        // Table row checkbox
        if (e.target.matches('.row-checkbox')) {
            if (typeof updateBatchButtons === 'function') updateBatchButtons();
            return;
        }

        // File inputs for ImgBB
        if (e.target.matches('input[type="file"][data-action="upload-imgbb"]')) {
            const targetId = e.target.getAttribute('data-target');
            const previewId = e.target.getAttribute('data-preview');
            if (typeof uploadToImgbb === 'function') uploadToImgbb(e.target, targetId, previewId);
            return;
        }
    });

    // Global Check All logic
    const selectAllCb = document.getElementById('selectAllCb');
    if (selectAllCb) {
        selectAllCb.addEventListener('change', (e) => {
            if (typeof toggleSelectAll === 'function') toggleSelectAll(e.target);
        });
    }
}

// Call setup after DOM is fully parsed
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
    setupEventListeners();
}

    // Delegated dblclick listener
    document.addEventListener('dblclick', (e) => {
        // Double click on table row
        const orDbl = e.target.closest('[data-action="open-record-dbl"]');
        if (orDbl) {
            const row = orDbl.getAttribute('data-row');
            if (allData) {
                const data = allData.find(x => x._sheetRow == row);
                if (openRecordForm && data) openRecordForm(data, parseInt(row));
            }
            return;
        }

        const ordDbl = e.target.closest('[data-action="open-record-dash-dbl"]');
        if (ordDbl) {
            const row = ordDbl.getAttribute('data-row');
            const tabName = ordDbl.getAttribute('data-tab-name');
            if (openRecordFormFromDash && cachedData && cachedData[tabName]) {
                const rec = cachedData[tabName].find(x => x._sheetRow == row);
                openRecordFormFromDash(tabName, rec, parseInt(row));
            }
            return;
        }
    });

    // Delegated drag/drop listeners
    document.addEventListener('dragstart', (e) => {
        const dt = e.target.closest('[data-action="drag-task"]');
        if (dt && dragStart) {
            dragStart(e, dt.getAttribute('data-row'));
        }
    });
    
    document.addEventListener('dragover', (e) => {
        const dt = e.target.closest('[data-action="drop-task"]');
        if (dt && allowDrop) {
            allowDrop(e);
        }
    });

    document.addEventListener('drop', (e) => {
        const dt = e.target.closest('[data-action="drop-task"]');
        if (dt && dropTask) {
            dropTask(e, dt.getAttribute('data-status'));
        }
    });



