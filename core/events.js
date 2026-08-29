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

    const globalToggleFloatingBtn = document.getElementById('globalToggleFloatingBtn');
    if (globalToggleFloatingBtn) {
        globalToggleFloatingBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof toggleFloatingIconSetting === 'function') toggleFloatingIconSetting();
        });
    }

    const ttsSettingsBtn = document.getElementById('ttsSettingsBtn');
    if (ttsSettingsBtn) {
        ttsSettingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof openTtsSettingsModal === 'function') openTtsSettingsModal();
        });
    }

    const openToolboxBtn = document.getElementById('openToolboxBtn');
    if (openToolboxBtn) {
        openToolboxBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
                chrome.tabs.create({ url: chrome.runtime.getURL('toolbox.html') });
            } else if (typeof chrome !== 'undefined' && chrome.sidePanel && chrome.sidePanel.open) {
                chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT }).catch(() => {
                    window.open('toolbox.html', '_blank', 'width=480,height=750');
                });
            } else {
                window.open('toolbox.html', '_blank', 'width=480,height=750');
            }
        });
    }

    // TTS Settings Modal controls
    const ttsRateSlider = document.getElementById('ttsRateSlider');
    const ttsRateValue = document.getElementById('ttsRateValue');
    if (ttsRateSlider && ttsRateValue) {
        ttsRateSlider.addEventListener('input', (e) => {
            ttsRateValue.textContent = `${parseFloat(e.target.value).toFixed(2)}x`;
        });
    }

    const ttsTestBtn = document.getElementById('ttsTestBtn');
    if (ttsTestBtn) {
        ttsTestBtn.addEventListener('click', () => {
            const slider = document.getElementById('ttsRateSlider');
            const select = document.getElementById('ttsVoiceSelect');
            const rate = slider ? parseFloat(slider.value) : 1.0;
            const voice = select ? select.value : '';
            if (window.ttsConfig) {
                window.ttsConfig.rate = rate;
                window.ttsConfig.voiceURI = voice;
            }
            if (typeof speakVietnamese === 'function') {
                speakVietnamese("Xin chào! Đây là bản đọc thử với giọng và tốc độ bạn đã chọn.", ttsTestBtn, rate);
            }
        });
    }

    const ttsSaveBtn = document.getElementById('ttsSaveBtn');
    if (ttsSaveBtn) {
        ttsSaveBtn.addEventListener('click', () => {
            const slider = document.getElementById('ttsRateSlider');
            const select = document.getElementById('ttsVoiceSelect');
            const rate = slider ? parseFloat(slider.value) : 1.0;
            const voice = select ? select.value : '';
            if (typeof saveTtsConfig === 'function') {
                saveTtsConfig(rate, voice, 1.0);
            }
            if (typeof showInfoToast === 'function') {
                showInfoToast(`Đã lưu: Tốc độ ${rate}x & Giọng đọc`, 'success');
            }
            if (typeof closeTtsSettingsModal === 'function') {
                closeTtsSettingsModal();
            }
        });
    }

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
    if (addRecordBtn) addRecordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openRecordForm();
    });

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

        // Toggle date group select button
        const dateGroupBtn = e.target.closest('[data-action="toggle-date-group"]');
        if (dateGroupBtn) {
            e.stopPropagation();
            e.preventDefault();
            const gName = dateGroupBtn.getAttribute('data-date-group');
            const rowCbs = document.querySelectorAll(`.row-checkbox[data-date-group="${gName}"]`);
            const checkedCount = document.querySelectorAll(`.row-checkbox[data-date-group="${gName}"]:checked`).length;
            const willCheck = checkedCount < rowCbs.length;
            if (typeof handleDateGroupCheckbox === 'function') {
                handleDateGroupCheckbox(gName, willCheck);
            }
            return;
        }

        // Speak Vietnamese (TTS)
        const ttsBtn = e.target.closest('[data-action="speak-text"]');
        if (ttsBtn) {
            e.stopPropagation();
            e.preventDefault();
            const val = ttsBtn.getAttribute('data-value');
            if (typeof speakVietnamese === 'function') {
                speakVietnamese(val, ttsBtn);
            }
            return;
        }

        // Translate BANG_TAM row
        const transBtn = e.target.closest('[data-action="translate-bangtam"]');
        if (transBtn) {
            e.stopPropagation();
            e.preventDefault();
            const row = transBtn.getAttribute('data-row');
            const val = transBtn.getAttribute('data-value');
            if (typeof handleTranslateBangTam === 'function') {
                handleTranslateBangTam(row, val, transBtn);
            }
            return;
        }

        // Close translation box
        const closeTransBtn = e.target.closest('[data-action="close-trans-box"]');
        if (closeTransBtn) {
            e.stopPropagation();
            e.preventDefault();
            const targetId = closeTransBtn.getAttribute('data-target');
            const el = document.getElementById(targetId);
            if (el) el.style.display = 'none';
            return;
        }

        // Form speak input
        const formSpeakBtn = e.target.closest('[data-action="form-speak-input"]');
        if (formSpeakBtn) {
            e.stopPropagation();
            e.preventDefault();
            const targetId = formSpeakBtn.getAttribute('data-target');
            const inp = document.getElementById(targetId);
            if (inp && typeof speakVietnamese === 'function') {
                speakVietnamese(inp.value, formSpeakBtn);
            }
            return;
        }

        // Form translate input
        const formTransBtn = e.target.closest('[data-action="form-trans-input"]');
        if (formTransBtn) {
            e.stopPropagation();
            e.preventDefault();
            const targetId = formTransBtn.getAttribute('data-target');
            if (typeof handleFormTranslate === 'function') {
                handleFormTranslate(targetId, formTransBtn);
            }
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

        // Toggle floating icon setting
        const tfBtn = e.target.closest('[data-action="toggle-floating-setting"]');
        if (tfBtn) {
            e.stopPropagation();
            if (typeof toggleFloatingIconSetting === 'function') toggleFloatingIconSetting();
            return;
        }

        // Open TTS settings modal
        const openTtsSettingsBtn = e.target.closest('[data-action="open-tts-settings"]');
        if (openTtsSettingsBtn) {
            e.stopPropagation();
            if (typeof openTtsSettingsModal === 'function') openTtsSettingsModal();
            return;
        }

        // Close TTS settings modal
        const closeTtsBtn = e.target.closest('[data-action="close-tts-modal"]');
        if (closeTtsBtn) {
            e.stopPropagation();
            if (typeof closeTtsSettingsModal === 'function') closeTtsSettingsModal();
            return;
        }

        // TTS rate preset button
        const ttsPreset = e.target.closest('[data-action="set-tts-rate-preset"]');
        if (ttsPreset) {
            e.stopPropagation();
            const rate = parseFloat(ttsPreset.getAttribute('data-rate')) || 1.0;
            const slider = document.getElementById('ttsRateSlider');
            const valSpan = document.getElementById('ttsRateValue');
            if (slider) slider.value = rate;
            if (valSpan) valSpan.textContent = `${rate.toFixed(2)}x`;
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
        // Auto-fill ngay_hoan_thanh = ngay_bat_dau + 30 mins (realtime)
        if (e.target.id === 'input_ngay_bat_dau') {
            const endInput = document.getElementById('input_ngay_hoan_thanh');
            if (endInput && e.target.value) {
                const startDate = new Date(e.target.value);
                if (!isNaN(startDate.getTime())) {
                    startDate.setMinutes(startDate.getMinutes() + 30);
                    const tzOffset = startDate.getTimezoneOffset() * 60000;
                    endInput.value = (new Date(startDate.getTime() - tzOffset)).toISOString().slice(0, 16);
                }
            }
        }

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
        // Auto-fill ngay_hoan_thanh = ngay_bat_dau + 30 mins
        if (e.target.id === 'input_ngay_bat_dau') {
            const endInput = document.getElementById('input_ngay_hoan_thanh');
            if (endInput && e.target.value) {
                const startDate = new Date(e.target.value);
                if (!isNaN(startDate.getTime())) {
                    startDate.setMinutes(startDate.getMinutes() + 30);
                    const tzOffset = startDate.getTimezoneOffset() * 60000;
                    endInput.value = (new Date(startDate.getTime() - tzOffset)).toISOString().slice(0, 16);
                }
            }
        }

        // Select all header checkbox
        if (e.target.id === 'selectAll' || e.target.id === 'selectAllCb') {
            if (typeof toggleSelectAll === 'function') toggleSelectAll(e.target);
            return;
        }

        // Date group master checkbox
        if (e.target.matches('.date-group-checkbox')) {
            const gName = e.target.getAttribute('data-date-group');
            if (typeof handleDateGroupCheckbox === 'function') {
                handleDateGroupCheckbox(gName, e.target.checked);
            }
            return;
        }

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




    // Paste event listener to support image pasting directly into textareas
    document.addEventListener('paste', async (e) => {
        if (e.target.tagName === 'TEXTAREA' && e.target.id === 'input_noi_dung') {
            const items = (e.clipboardData || window.clipboardData).items;
            for (let index in items) {
                const item = items[index];
                if (item.kind === 'file' && item.type.indexOf('image/') === 0) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    if (!file) continue;

                    const originalText = e.target.value;
                    const startPos = e.target.selectionStart;
                    const endPos = e.target.selectionEnd;
                    
                    // Show loading text inline
                    const loadingText = " [Đang tải ảnh...] ";
                    e.target.value = originalText.substring(0, startPos) + loadingText + originalText.substring(endPos);
                    e.target.selectionStart = startPos;
                    e.target.selectionEnd = startPos + loadingText.length;

                    try {
                        const formData = new FormData();
                        formData.append('image', file);
                        formData.append('key', '1bad1429a242d7040fda3f2cfddb3a25'); // default ImgBB key

                        const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: formData });
                        const data = await res.json();
                        
                        if (data && data.success) {
                            const url = data.data.url;
                            const md = "\\n![image](" + url + ")\\n";
                            
                            // Replace loading text with actual markdown link
                            const newText = e.target.value;
                            e.target.value = newText.substring(0, startPos) + md + newText.substring(startPos + loadingText.length);
                        } else {
                            // Revert on error
                            const newText = e.target.value;
                            e.target.value = newText.substring(0, startPos) + " [Lỗi tải ảnh] " + newText.substring(startPos + loadingText.length);
                        }
                    } catch (err) {
                        console.error('Image upload failed', err);
                        const newText = e.target.value;
                        e.target.value = newText.substring(0, startPos) + " [Lỗi mạng] " + newText.substring(startPos + loadingText.length);
                    }
                    break; // Only process one image
                }
            }
        }
    });

    document.addEventListener('input', (e) => {
        if (e.target.tagName === 'TEXTAREA' && e.target.id === 'input_noi_dung') {
            const val = e.target.value || '';
            const p = document.getElementById('preview_noi_dung');
            if (p) {
                const urlMatches = [...val.matchAll(/(?:!\[.*?\]\((.*?)\))|(?:(?:^|\s)(https?:\/\/\S+\.(?:png|jpg|jpeg|gif|webp))(?:$|\s))/ig)];
                if (urlMatches && urlMatches.length > 0) {
                    const urls = urlMatches.map(m => m[1] || m[2]).filter(Boolean);
                    if (urls.length > 0) {
                        p.innerHTML = '<div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">' + 
                            urls.map(u => '<img src="' + u + '" style="max-height:100px; border-radius:4px; border:1px solid #e2e8f0; object-fit:cover;">').join('') + 
                            '</div>';
                    } else {
                        p.innerHTML = '';
                    }
                } else {
                    p.innerHTML = '';
                }
            }
        }
    });
    // 25. Trigger OCR Scan button
    const headerOcrBtn = document.getElementById('headerOcrBtn');
    if (headerOcrBtn) {
        headerOcrBtn.addEventListener('click', () => {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({ action: 'START_OCR_CAPTURE_FROM_VIEW' });
            } else {
                alert('Tính năng Quét chữ OCR hoạt động khi chạy trên Chrome Extension.');
            }
        });
    }

    // 25b. Action Recorder Toggle Button
    const toggleRecBtn = document.getElementById('toggleRecorderBtn');
    if (toggleRecBtn) {
        toggleRecBtn.addEventListener('click', () => {
            const nextState = !window.isActionRecorderEnabled;
            window.isActionRecorderEnabled = nextState;
            try {
                localStorage.setItem('infosys_action_recorder_enabled', String(nextState));
            } catch(e) {}
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ infosys_action_recorder_enabled: nextState });
            }
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({ action: 'TOGGLE_ACTION_RECORDER', enabled: nextState });
            }
            if (typeof updateActionRecorderButtonUI === 'function') {
                updateActionRecorderButtonUI();
            }
            showInfoToast(nextState ? '🔴 Đã BẬT ghi lại thao tác duyệt web' : '⏹️ Đã TẮT ghi thao tác');
        });
    }

    // 26. Listen to Extension updates for BANG_TAM & THAO_TAC
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((msg) => {
            if (msg && msg.action === 'BANG_TAM_UPDATED') {
                window.cachedData['BANG_TAM'] = null;
                if (currentTab === 'BANG_TAM') {
                    fetchData(true);
                }
            } else if (msg && msg.action === 'THAO_TAC_UPDATED') {
                window.cachedData['THAO_TAC'] = null;
                if (currentTab === 'THAO_TAC') {
                    fetchData(true);
                }
            }
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
    setupEventListeners();
}


