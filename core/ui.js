function toggleSidebar() {
    document.body.classList.toggle('sidebar-collapsed');
    const icon = document.querySelector('.sidebar-toggle i');
    if (icon) {
        icon.setAttribute('data-lucide', document.body.classList.contains('sidebar-collapsed') ? 'panel-left-open' : 'panel-left-close');
        lucide.createIcons();
    }
}


async function switchTab(tabName) {
    if (tabName === 'MK') {
        const pass = prompt('Vui lòng nhập mật khẩu để truy cập:');
        if (pass !== 'h161') {
            alert('Mật khẩu không đúng!');
            return;
        }
    }

    currentView = tabName;
    if (tabName === 'HOM_NAY' || tabName === 'LICH') {
        currentTab = 'CONG_VIEC';
    } else if (tabName === 'THEM') {
        currentTab = '';
    } else if (tabName === 'TAT_CA') {
        currentTab = '';
    } else if (tabName === 'THONG_KE') {
        currentTab = '';
    } else {
        currentTab = CONFIG.tabs[tabName] ? tabName : '';
    }
    
    document.querySelectorAll('.tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === currentView);
    });
    
    const kanbanDash = document.getElementById('kanbanDashboard');
    if (kanbanDash && currentView !== 'CONG_VIEC') kanbanDash.style.display = 'none';
    const expDash = document.getElementById('expenseDashboard');
    const taskDash = document.getElementById('taskDashboard');
    const todayDash = document.getElementById('todayDashboard');
    const calDash = document.getElementById('calendarDashboard');
    const analyticsDash = document.getElementById('analyticsDashboard');
    const tableWrap = document.getElementById('tableWrapper');
    const pagination = document.getElementById('pagination');
    const phanLoaiFilterContainer = document.getElementById('phanLoaiFilterContainer');
    const searchInput = document.querySelector('.search-container');
    const dateFilters = document.getElementById('dateFilterContainer');

    if (expDash) expDash.style.display = currentView === 'CHI_TIEU' ? 'grid' : 'none';
    if (taskDash) taskDash.style.display = currentView === 'CONG_VIEC' ? 'grid' : 'none';
    if (todayDash) todayDash.style.display = currentView === 'HOM_NAY' ? 'block' : 'none';
    if (calDash) calDash.style.display = currentView === 'LICH' ? 'block' : 'none';
    if (analyticsDash) analyticsDash.style.display = currentView === 'THONG_KE' ? 'block' : 'none';
    
    const viewToggleBtn = document.getElementById('viewToggleBtn');
    if (viewToggleBtn) {
        viewToggleBtn.style.display = currentView === 'CONG_VIEC' ? 'inline-flex' : 'none';
        viewToggleBtn.innerHTML = taskViewMode === 'table' ? '<i data-lucide="layout-dashboard" style="width:16px; margin-right:4px;"></i> Kanban' : '<i data-lucide="table" style="width:16px; margin-right:4px;"></i> Table';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    
    const quickAddDash = document.getElementById('quickAddDashboard');
    if (quickAddDash) quickAddDash.style.display = currentView === 'THEM' ? 'flex' : 'none';

    const allDash = document.getElementById('allDashboard');
    if (allDash) allDash.style.display = currentView === 'TAT_CA' ? 'flex' : 'none';

    if(!currentTab && currentView !== 'THEM' && currentView !== 'TAT_CA' && currentView !== 'THONG_KE') {
        if(tableWrap) tableWrap.style.display = 'none';
        if(pagination) pagination.style.display = 'none';
        return;
    }
    
    if (currentView === 'HOM_NAY' || currentView === 'LICH' || currentView === 'THEM' || currentView === 'TAT_CA' || currentView === 'THONG_KE') {
        if(tableWrap) tableWrap.style.display = 'none';
        if(pagination) pagination.style.display = 'none';
        if(phanLoaiFilterContainer) phanLoaiFilterContainer.style.display = 'none';
        if(searchInput) searchInput.style.display = 'none';
        if(dateFilters) dateFilters.style.display = 'none';
        const addBtn = document.querySelector('.add-btn');
        if (addBtn) addBtn.style.display = 'none';
        
        if (currentView === 'THEM') {
            renderQuickAddForms();
        } else if (currentView === 'TAT_CA') {
            renderAllDashboard();
        } else if (currentView === 'THONG_KE') {
            renderAnalytics();
        }
    } else {
        if(tableWrap) tableWrap.style.display = 'block';
        if(pagination) pagination.style.display = 'flex';
        if(phanLoaiFilterContainer) phanLoaiFilterContainer.style.display = 'flex';
        if(searchInput) searchInput.style.display = 'flex';
        if(dateFilters) dateFilters.style.display = currentView === 'DSNV' ? 'none' : 'flex';
        const addBtn = document.querySelector('.add-btn');
        if (addBtn) addBtn.style.display = 'inline-flex';
    }
    
    await fetchData();
}


async function reloadCurrentTab() {
    await fetchData(true);
}


function dispatchViewRender() {
    if (currentView === 'HOM_NAY') {
        renderTodayTasks();
    } else if (currentView === 'LICH') {
        renderCalendar();
    } else if (currentView === 'THONG_KE') {
        renderAnalytics();
    } else {
        renderHeaders();
        renderTabFilters();
        
        if (currentTab === 'CONG_VIEC') {
            renderTaskDashboard();
            renderTaskView();
        } else {
            const kanbanDash = document.getElementById('kanbanDashboard');
            if (kanbanDash) kanbanDash.style.display = 'none';
            document.getElementById('tableWrapper').style.display = 'block';
            const pagination = document.getElementById('pagination');
            if (pagination) pagination.style.display = 'flex';
            renderTable();
        }
        if (currentTab === 'CHI_TIEU') {
            renderExpenseDashboard();
        }
    }
}


function renderHeaders() {
    const head = document.getElementById('tableHead');
    if (!CONFIG.tabs[currentTab]) return;
    let hiddenCols = ['trang_thai', 'dia_chi', 'map'];
    if (currentTab !== 'HOC_HOI' && currentTab !== 'CONG_VIEC' && currentTab !== 'DSNV' && currentTab !== 'MK') hiddenCols.push('anh', 'hinh_anh', 'anh_2');
    if (currentTab === 'HOC_HOI') hiddenCols.push('file');
    if (currentTab === 'BANG_TAM') hiddenCols.push('ngay', 'ngay_gio');
    const ths = CONFIG.tabs[currentTab].headers.map((h, i) => {
        if (i === 0 || hiddenCols.includes(h)) return '';
        let style = '';
        if (['ngay', 'ngay_in', 'ngay_out'].includes(h)) {
            style = 'style="white-space: nowrap; min-width: 95px;"';
        } else if (h === 'so_tien' || h === 'so_du_ao') {
            style = 'style="white-space: nowrap; text-align: right; width: 100px;"';
        } else if (currentTab === 'CHI_TIEU') {
            if (h === 'loai_giao_dich') style = 'style="width: 10%;"';
            else if (h === 'tai_khoan' || h === 'tai_khoan_nhan') style = 'style="width: 12%;"';
            else if (h === 'hang_muc' || h === 'hashtag') style = 'style="width: 10%;"';
            else if (h === 'ghi_chu') style = 'style="width: auto;"';
        } else if (currentTab === 'CONG_VIEC') {
            if (h === 'ghi_chu' || h === 'file_dinh_kem' || h === 'link_lien_quan') return '';
            if (h === 'tieu_de' || h === 'mo_ta') style = 'style="width: auto;"';
            else style = 'style="white-space: nowrap; width: 10%;"';
        } else if (currentTab === 'HOC_HOI') {
            if (h === 'link') style = 'style="white-space: nowrap; max-width: 200px;"';
            else if (h === 'anh' || h === 'hinh_anh') style = 'style="white-space: nowrap; width: 75px; text-align: center;"';
            else if (h === 'tag') style = 'style="white-space: nowrap; width: 110px;"';
            else if (h === 'tieu_de') style = 'style="width: 22%;"';
            else if (h === 'noi_dung') style = 'style="width: auto;"';
        } else if (currentTab === 'BANG_TAM') {
            if (h === 'ghi_chu') style = 'style="width: auto; min-width: 140px;"';
            else if (h === 'noi_dung') style = 'style="width: 95px; min-width: 80px; max-width: 105px;"';
            else if (h === 'tag') style = 'style="width: 75px; min-width: 65px; max-width: 80px; text-align: center;"';
        }
        
        let sortHtml = '';
        if (h !== 'anh' && h !== 'hinh_anh' && h !== 'map' && h !== 'dia_chi') {
            let sortIcon = 'arrow-up-down';
            if (currentSortCol === h) {
                sortIcon = currentSortAsc ? 'arrow-up' : 'arrow-down';
            }
            sortHtml = `<span data-action="sort-table" data-col="${h}" style="cursor:pointer; margin-left:4px; display:inline-flex; align-items:center; opacity:${currentSortCol === h ? '1' : '0.4'};">
                <i data-lucide="${sortIcon}" style="width:14px; height:14px;"></i>
            </span>`;
        }
        
        const alignHeader = (currentTab === 'HOC_HOI' && (h === 'anh' || h === 'hinh_anh')) ? 'justify-content:center;' : '';
        return `<th ${style}><div style="display:flex; align-items:center; ${alignHeader}">${h.toUpperCase()}${sortHtml}</div></th>`;
    }).join('');
    head.innerHTML = `<tr><th style="width: 36px; min-width: 36px; max-width: 36px; text-align: center; padding: 11px 4px;"><input type="checkbox" id="selectAll" ></th>${ths}</tr>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}


function renderTable() {
    const body = document.getElementById('tableBody');
    const tabConfig = CONFIG.tabs[currentTab];
    if (!tabConfig) return;

    let hiddenCols = ['trang_thai', 'dia_chi', 'map'];
    if (currentTab !== 'HOC_HOI' && currentTab !== 'CONG_VIEC' && currentTab !== 'DSNV' && currentTab !== 'MK') hiddenCols.push('anh', 'hinh_anh', 'anh_2');
    if (currentTab === 'HOC_HOI') hiddenCols.push('file');
    if (currentTab === 'BANG_TAM') hiddenCols.push('ngay', 'ngay_gio');
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = filteredData.slice(start, end);

    const tableWrap = document.getElementById('tableWrapper');
    const mobileList = document.getElementById('mobileListView');
    
    // Kiểm tra màn hình đt & tab chi tiêu
    if (window.innerWidth <= 768 && currentTab === 'CHI_TIEU') {
        tableWrap.style.display = 'none';
        if (mobileList) mobileList.style.display = 'block';
        
        let listHtml = `<div style="font-weight: 700; margin-bottom: 15px; font-size: 1rem; color: #0f172a; display:flex; justify-content:space-between; align-items:center;">
            <span>Giao dịch gần đây</span>
            <span style="font-size: 0.8rem; font-weight: 500; color: var(--primary); cursor: pointer;">Xem tất cả <i data-lucide="chevron-right" style="width:14px; vertical-align:middle;"></i></span>
        </div>`;
        
        listHtml += pageData.map((row) => {
            const sheetRow = row._sheetRow;
            const type = row[2] || '';
            const amount = parseFloat(String(row[4] || '').replace(/,/g, '')) || 0;
            const formattedAmount = formatMoney(amount);
            const dateStr = String(row[1] || '').split(' ')[0] || '';
            const account = row[3] || '';
            const tag = row[6] || 'Khác';
            const rowJson = JSON.stringify(row).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
            
            let iconHtml = '';
            let amountHtml = '';
            if (type === 'Thu') {
                iconHtml = `<div style="width:40px; height:40px; border-radius:50%; background:#dcfce7; color:#16a34a; display:flex; align-items:center; justify-content:center; flex-shrink:0;"><i data-lucide="shopping-bag" style="width:20px;"></i></div>`;
                amountHtml = `<span style="color:#16a34a; font-weight:700;">+${formattedAmount} đ</span>`;
            } else if (type === 'Chi') {
                iconHtml = `<div style="width:40px; height:40px; border-radius:50%; background:#fee2e2; color:#dc2626; display:flex; align-items:center; justify-content:center; flex-shrink:0;"><i data-lucide="shopping-cart" style="width:20px;"></i></div>`;
                amountHtml = `<span style="color:#dc2626; font-weight:700;">-${formattedAmount} đ</span>`;
            } else {
                iconHtml = `<div style="width:40px; height:40px; border-radius:50%; background:#e0e7ff; color:#4f46e5; display:flex; align-items:center; justify-content:center; flex-shrink:0;"><i data-lucide="refresh-cw" style="width:20px;"></i></div>`;
                amountHtml = `<span style="color:#4f46e5; font-weight:700;">${formattedAmount} đ</span>`;
            }

            return `
            <div class="transaction-card" data-action="open-record" data-row="${sheetRow}" style="display:flex; align-items:center; justify-content:space-between; background:white; padding:12px; border-radius:16px; margin-bottom:10px; box-shadow:0 1px 3px rgba(0,0,0,0.05); cursor:pointer;">
                <div style="display:flex; align-items:center; gap:12px;">
                    ${iconHtml}
                    <div>
                        <div style="font-weight:700; font-size:0.95rem; color:#0f172a; margin-bottom:4px;">${type}</div>
                        <div style="font-size:0.8rem; color:#64748b;">${account} • ${dateStr}</div>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="margin-bottom:4px;">${amountHtml}</div>
                    <div style="font-size:0.75rem; background:#f1f5f9; color:#475569; padding:2px 8px; border-radius:12px; display:inline-block;">${tag}</div>
                </div>
            </div>
            `;
        }).join('');
        
        if (mobileList) mobileList.innerHTML = listHtml;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    } else {
        tableWrap.style.display = 'block';
        if (mobileList) mobileList.style.display = 'none';
        
        let lastDateGroup = null;
        body.innerHTML = pageData.map((row) => {
            const sheetRow = row._sheetRow;
            const rowJson = JSON.stringify(row).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
            
            let groupHeaderHtml = '';
            if (currentTab === 'BANG_TAM') {
                const dateVal = String(row[1] || '').trim().split(' ')[0] || 'Chưa có ngày';
                if (dateVal !== lastDateGroup) {
                    lastDateGroup = dateVal;
                    groupHeaderHtml = `
                    <tr class="date-group-row" style="background: #f1f5f9; border-top: 2px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;">
                        <td colspan="100%" style="padding: 8px 16px; font-weight: 700; color: #1e293b; font-size: 0.88rem;">
                            <div style="display:inline-flex; align-items:center; gap:8px;">
                                <i data-lucide="calendar" style="width:15px; height:15px; color:var(--primary);"></i>
                                <span>Ngày: ${dateVal}</span>
                            </div>
                        </td>
                    </tr>`;
                }
            }

            return groupHeaderHtml + `<tr data-action="open-record-dbl" data-row="${sheetRow}">
                <td style="width: 36px; min-width: 36px; max-width: 36px; text-align: center; padding: 10px 4px;"><input type="checkbox" class="row-checkbox" data-index="${sheetRow}"></td>
                ${tabConfig.headers.map((h, i) => {
                if (i === 0 || hiddenCols.includes(h)) return '';

                let cellVal = row[i] || '';
                
                if (h === 'ghim') {
                    let isPinned = (cellVal === '1' || cellVal === 'x' || String(cellVal).toUpperCase() === 'TRUE');
                    let pinColor = isPinned ? 'var(--primary)' : '#94a3b8';
                    let fill = isPinned ? 'var(--primary)' : 'none';
                    return `<td style="text-align:center;">
                        <button type="button" data-action="toggle-pin" data-row="${sheetRow}" data-col="${i}" data-pinned="${isPinned}" style="background:transparent; border:none; cursor:pointer; padding:4px;">
                            <i data-lucide="pin" style="width:16px; height:16px; color:${pinColor}; fill:${fill};"></i>
                        </button>
                    </td>`;
                }


                if ((h.includes('anh') || h.includes('hinh') || h.includes('avatar') || h === 'link_anh') && cellVal) {
                    const url = String(cellVal);
                    if (url.startsWith('http')) {
                        return `<td style="text-align: center; white-space: nowrap;">
                            <img src="${url}" style="max-height: 40px; max-width: 40px; border-radius: 4px; object-fit: cover;" alt="img" />
                        </td>`;
                    }
                }

                if (['ngay_in', 'ngay_out'].includes(h) && cellVal) {
                    const parts = String(cellVal).split(' ');
                    if (parts.length > 1) {
                        const timeParts = parts[1].split(':');
                        if (timeParts.length >= 2) {
                            cellVal = `${timeParts[0]}:${timeParts[1]}`;
                        }
                    }
                }

                if (currentTab === 'CHI_TIEU' && (h === 'so_tien' || h === 'so_du_ao') && cellVal) {
                    if (h === 'so_tien') {
                        let num = parseFloat(String(cellVal).replace(/,/g, '')) || 0;
                        cellVal = formatMoney(num);
                        const type = row[2];
                        if (type === 'Thu') cellVal = `<span class="amount positive">+${cellVal}</span>`;
                        else if (type === 'Chi') cellVal = `<span class="amount negative">-${cellVal}</span>`;
                        else if (type === 'Chuyển khoản') cellVal = `<span class="amount transfer">${cellVal}</span>`;
                    } else if (h === 'so_du_ao') {
                        if (String(cellVal).includes('|')) {
                            const parts = String(cellVal).split('|');
                            cellVal = `<span style="white-space:nowrap; display:inline-block; line-height:1.4;"><strong>${formatMoney(parts[0].trim())} đ</strong><br><strong style="color:#2563eb;">${formatMoney(parts[1].trim())} đ</strong></span>`;
                        } else {
                            let num = parseFloat(String(cellVal).replace(/,/g, '')) || 0;
                            cellVal = `<strong>${formatMoney(num)} đ</strong>`;
                        }
                    }
                }

                let tdStyle = '';
                if (['ngay', 'ngay_in', 'ngay_out'].includes(h)) {
                    tdStyle = 'style="white-space: nowrap; text-align: center;"';
                } else if (h === 'so_tien' || h === 'so_du_ao') {
                    tdStyle = 'style="white-space: nowrap; text-align: right;"';
                } else if (currentTab === 'CHI_TIEU') {
                    if (h === 'loai_giao_dich') tdStyle = 'style="width: 10%;"';
                    else if (h === 'tai_khoan' || h === 'tai_khoan_nhan') tdStyle = 'style="width: 12%;"';
                    else if (h === 'hang_muc' || h === 'hashtag') tdStyle = 'style="width: 10%;"';
                    else if (h === 'ghi_chu') tdStyle = 'style="width: auto;"';
                } else if (currentTab === 'CONG_VIEC') {
                    if (h === 'ghi_chu' || h === 'file_dinh_kem' || h === 'link_lien_quan') return ''; // skip rendering these long columns

                    if (h === 'trang_thai') {
                        if (cellVal === 'Hoàn thành') cellVal = '<span style="color:#10b981; font-weight:bold;">Hoàn thành</span>';
                        else if (cellVal === 'Đang làm') cellVal = '<span style="color:#3b82f6; font-weight:bold;">Đang làm</span>';
                        else if (cellVal === 'Chưa làm') cellVal = '<span style="color:#64748b; font-weight:bold;">Chưa làm</span>';
                        else if (cellVal === 'Tạm dừng') cellVal = '<span style="color:#f59e0b; font-weight:bold;">Tạm dừng</span>';
                    }

                    tdStyle = 'style="white-space: nowrap;"';
                    if (h === 'tieu_de') {
                        tdStyle = 'style="width: auto; font-weight: 500;"';
                    }
                } else if (currentTab === 'HOC_HOI') {
                    if (h === 'link') {
                        tdStyle = 'style="max-width: 200px; word-break: break-all;"';
                        if (cellVal) {
                            const strVal = String(cellVal).trim();
                            const href = (strVal.startsWith('http://') || strVal.startsWith('https://')) ? strVal : (strVal.includes('.') ? `https://${strVal}` : strVal);
                            const isUrl = strVal.startsWith('http://') || strVal.startsWith('https://') || strVal.includes('.');
                            if (isUrl) {
                                cellVal = `<a href="${href}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();" style="color:var(--primary); text-decoration:underline; font-weight:500; font-size:0.85rem; word-break:break-all; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;" title="${strVal}">${strVal}</a>`;
                            } else {
                                cellVal = `<div class="line-clamp-2" title="${strVal}">${strVal}</div>`;
                            }
                        } else {
                            cellVal = '';
                        }
                    } else if (h === 'anh' || h === 'hinh_anh') {
                        tdStyle = 'style="width: 75px; text-align: center; white-space: nowrap;"';
                        if (cellVal && cellVal.startsWith('http')) {
                            cellVal = `<img src="${cellVal}" style="max-height: 45px; max-width: 60px; border-radius: 4px; object-fit: cover; border: 1px solid #e2e8f0; vertical-align: middle;">`;
                        } else {
                            cellVal = '';
                        }
                    } else if (h === 'tag') {
                        tdStyle = 'style="width: 110px; white-space: nowrap;"';
                    } else if (h === 'tieu_de') {
                        tdStyle = 'style="width: 25%; font-weight: 600;"';
                    } else if (h === 'noi_dung') {
                        tdStyle = 'style="width: auto;"';
                    }
                    if (h === 'tieu_de' || h === 'noi_dung') {
                        if (cellVal) {
                            const escapedVal = String(cellVal).replace(/'/g, "&#39;").replace(/"/g, "&quot;").replace(/\n/g, "\\n").replace(/\r/g, "");
                            let displayVal = cellVal;
                            
                            if (h === 'noi_dung') {
                                // Parse markdown images: ![alt](url)
                                displayVal = String(displayVal).replace(/!\[.*?\]\((.*?)\)/g, '<br><img src="$1" style="max-width:100%; max-height:200px; border-radius:4px; margin-top:8px; object-fit:cover;"><br>');
                                // Handle plain links ending in image extensions
                                displayVal = displayVal.replace(/(^|\s)(https?:\/\/\S+\.(?:png|jpg|jpeg|gif|webp))(\s|$)/ig, '$1<br><img src="$2" style="max-width:100%; max-height:200px; border-radius:4px; margin-top:8px; object-fit:cover;"><br>$3');
                                // Replace newlines with <br> for display
                                displayVal = displayVal.replace(/\n/g, '<br>');
                            }

                            cellVal = `<div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                                <div class="line-clamp-4" style="flex-grow:1; display:-webkit-box; -webkit-line-clamp:4; -webkit-box-orient:vertical; overflow:hidden; text-overflow:ellipsis; word-break:break-word; max-height:5.6em; line-height:1.4;">${displayVal}</div>
                                <button type="button" data-action="copy-to-clipboard" data-value="${escapedVal}" style="background:transparent; border:none; cursor:pointer; color:#64748b; padding:4px; flex-shrink:0; display:flex; align-items:center; justify-content:center; border-radius:4px;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'" title="Sao chép">
                                    <i data-lucide="copy" style="width:14px; height:14px;"></i>
                                </button>
                            </div>`;
                            return `<td ${tdStyle}>${cellVal}</td>`;
                        }
                    }
                } else if (currentTab === 'BANG_TAM') {
                    if (h === 'tag') {
                        tdStyle = 'style="width: 75px; min-width: 65px; max-width: 80px; text-align: center; white-space: nowrap; padding: 8px 4px;"';
                        let tagHtml = cellVal ? `<span style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; font-size: 0.72rem; font-weight: 700; padding: 2px 6px; border-radius: 10px; display: inline-block; white-space: nowrap;">${cellVal}</span>` : '';
                        return `<td ${tdStyle}>${tagHtml}</td>`;
                    } else if (h === 'noi_dung') {
                        tdStyle = 'style="width: 95px; min-width: 80px; max-width: 105px; padding: 8px 4px;"';
                        if (cellVal) {
                            const rawStr = String(cellVal).trim();
                            if (rawStr.startsWith('http://') || rawStr.startsWith('https://') || rawStr.includes('.')) {
                                const href = (rawStr.startsWith('http://') || rawStr.startsWith('https://')) ? rawStr : 'https://' + rawStr;
                                let label = rawStr.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];
                                if (label.length > 10) label = label.substring(0, 8) + '…';
                                const displayVal = `<a href="${href}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();" style="color:var(--primary); background:#eff6ff; border:1px solid #bfdbfe; padding:2px 6px; border-radius:6px; text-decoration:none; font-weight:600; font-size:0.75rem; display:inline-flex; align-items:center; gap:4px; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${rawStr}"><i data-lucide="external-link" style="width:11px; height:11px; flex-shrink:0;"></i><span style="overflow:hidden; text-overflow:ellipsis;">${label}</span></a>`;
                                return `<td ${tdStyle}>${displayVal}</td>`;
                            }
                        }
                        return `<td ${tdStyle}>${cellVal}</td>`;
                    } else if (h === 'ghi_chu') {
                        tdStyle = 'style="width: auto; min-width: 140px; word-break: break-word;"';
                        const rawStr = String(cellVal || '').trim();
                        const escapedVal = rawStr.replace(/'/g, "&#39;").replace(/"/g, "&quot;").replace(/\n/g, "\\n").replace(/\r/g, "");
                        let displayVal = rawStr;
                        displayVal = displayVal.replace(/!\[.*?\]\((.*?)\)/g, '<br><img src="$1" style="max-width:100%; max-height:200px; border-radius:4px; margin-top:8px; object-fit:cover;"><br>');
                        displayVal = displayVal.replace(/(^|\s)(https?:\/\/\S+\.(?:png|jpg|jpeg|gif|webp))(\s|$)/ig, '$1<br><img src="$2" style="max-width:100%; max-height:200px; border-radius:4px; margin-top:8px; object-fit:cover;"><br>$3');
                        displayVal = displayVal.replace(/\n/g, '<br>');

                        cellVal = `<div style="display:flex; justify-content:space-between; align-items:flex-start; gap:6px;">
                            <div class="line-clamp-4" style="flex-grow:1; display:-webkit-box; -webkit-line-clamp:4; -webkit-box-orient:vertical; overflow:hidden; text-overflow:ellipsis; word-break:break-word; max-height:5.6em; line-height:1.4;">${displayVal}</div>
                            <button type="button" data-action="copy-to-clipboard" data-value="${escapedVal}" style="background:transparent; border:none; cursor:pointer; color:#64748b; padding:3px; flex-shrink:0; display:flex; align-items:center; justify-content:center; border-radius:4px;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'" title="Sao chép">
                                <i data-lucide="copy" style="width:13px; height:13px;"></i>
                            </button>
                        </div>`;
                        return `<td ${tdStyle}>${cellVal}</td>`;
                    }
                } else if (currentTab === 'DSNV') {
                    if (h === 'hashtag') {
                        cellVal = `<div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                            <div class="line-clamp-3" style="flex-grow:1;">${cellVal}</div>
                            <button type="button" data-action="quick-edit-cell" data-row="${sheetRow}" data-col="${h}" style="background:transparent; border:none; cursor:pointer; color:var(--primary); padding:4px; flex-shrink:0; display:flex; align-items:center; justify-content:center; border-radius:4px;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'" title="Sửa nhanh">
                                <i data-lucide="edit-3" style="width:14px; height:14px;"></i>
                            </button>
                        </div>`;
                        return `<td ${tdStyle}>${cellVal}</td>`;
                    }
                } else if (currentTab === 'MK') {
                    if ((h === 'ten_đang_nhap' || h === 'mat_khau') && cellVal) {
                        const escapedVal = String(cellVal).replace(/'/g, "&#39;").replace(/"/g, "&quot;").replace(/\n/g, "\\n").replace(/\r/g, "");
                        
                        let displayVal = cellVal;
                        
                        cellVal = `<div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                            <div class="line-clamp-1" style="flex-grow:1; font-family:monospace;">${displayVal}</div>
                            <button type="button" data-action="copy-to-clipboard" data-value="${escapedVal}" style="background:transparent; border:none; cursor:pointer; color:var(--primary); padding:4px; flex-shrink:0; display:flex; align-items:center; justify-content:center; border-radius:4px;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'" title="Sao chép">
                                <i data-lucide="copy" style="width:14px; height:14px;"></i>
                            </button>
                        </div>`;
                        return `<td ${tdStyle}>${cellVal}</td>`;
                    } else if (h === 'anh' || h === 'anh_2') {
                        if (cellVal && cellVal.startsWith('http')) {
                            cellVal = `<img src="${cellVal}" style="max-height: 50px; max-width: 50px; border-radius: 4px; object-fit: cover;">`;
                            return `<td ${tdStyle}>${cellVal}</td>`;
                        }
                    }
                }

                if (h === 'link' && cellVal) {
                    const strVal = String(cellVal).trim();
                    const href = (strVal.startsWith('http://') || strVal.startsWith('https://')) ? strVal : (strVal.includes('.') ? `https://${strVal}` : strVal);
                    if (strVal.startsWith('http://') || strVal.startsWith('https://') || strVal.includes('.')) {
                        cellVal = `<a href="${href}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();" style="color:var(--primary); text-decoration:underline; font-weight:500; word-break:break-all;" title="${strVal}">${strVal}</a>`;
                    }
                }

                return `<td ${tdStyle}><div class="line-clamp-3">${cellVal}</div></td>`;
            }).join('')}
            </tr>`;
        }).join('');
    }

    renderPagination();
    updateBatchButtons();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}


function renderPagination() {

    let paginationDiv = document.getElementById('pagination');
    if (!paginationDiv) {
        paginationDiv = document.createElement('div');
        paginationDiv.id = 'pagination';
        paginationDiv.className = 'pagination';
        document.getElementById('tableWrapper').after(paginationDiv);
    }

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    if (totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }

    paginationDiv.innerHTML = `
        <button class="pagination-btn" data-action="change-page" data-val="-1" ${currentPage === 1 ? 'disabled' : ''}>Trước</button>
        <span class="page-info">Trang ${currentPage} / ${totalPages}</span>
        <button class="pagination-btn" data-action="change-page" data-val="1" ${currentPage === totalPages ? 'disabled' : ''}>Sau</button>
    `;
}


function changePage(delta) {
    currentPage += delta;
    renderTable();
}


function sortTable(colName) {
    if (!CONFIG.tabs[currentTab]) return;
    const colIndex = CONFIG.tabs[currentTab].headers.indexOf(colName);
    if (colIndex === -1) return;

    if (currentSortCol === colName) {
        currentSortAsc = !currentSortAsc;
    } else {
        currentSortCol = colName;
        currentSortAsc = true;
    }

    allData.sort((a, b) => {
        let valA = a[colIndex] || '';
        let valB = b[colIndex] || '';
        
        // Ensure sheetRow is preserved if values are equal
        if (valA === valB) {
            return b._sheetRow - a._sheetRow;
        }
        
        const numA = parseFloat(String(valA).replace(/,/g, ''));
        const numB = parseFloat(String(valB).replace(/,/g, ''));
        if (!isNaN(numA) && !isNaN(numB) && String(valA).trim() !== '' && String(valB).trim() !== '') {
            return currentSortAsc ? numA - numB : numB - numA;
        }

        return currentSortAsc 
            ? String(valA).localeCompare(String(valB), 'vi', { sensitivity: 'base' })
            : String(valB).localeCompare(String(valA), 'vi', { sensitivity: 'base' });
    });
    
    // update filteredData and render
    filterTable();
}


function doGlobalSearch() {
    clearTimeout(globalSearchTimeout);
    globalSearchTimeout = setTimeout(() => {
        const query = document.getElementById('globalSearchInput').value.toLowerCase().trim();
        const resultsContainer = document.getElementById('globalSearchResults');
        
        if (!query) {
            resultsContainer.style.display = 'none';
            return;
        }

        let results = [];
        const tabsToSearch = ['GHI_CHU', 'CHI_TIEU', 'CONG_VIEC', 'HOC_HOI', 'BANG_TAM', 'DSNV'];
        
        tabsToSearch.forEach(tab => {
            if (window.cachedData[tab]) {
                const config = CONFIG.tabs[tab];
                window.cachedData[tab].forEach(row => {
                    // Chuyển toàn bộ dữ liệu dòng thành text để tìm
                    const rowText = row.map(v => String(v || '').toLowerCase()).join(' ');
                    if (rowText.includes(query)) {
                        // Tìm thấy -> tạo object kết quả
                        let title = 'Không tên';
                        if (tab === 'GHI_CHU') title = row[config.headers.indexOf('tieu_de')];
                        else if (tab === 'CHI_TIEU') title = `Chi tiêu: ${row[config.headers.indexOf('so_tien')]} - ${row[config.headers.indexOf('loai_giao_dich')]}`;
                        else if (tab === 'CONG_VIEC') title = row[config.headers.indexOf('tieu_de')];
                        else if (tab === 'HOC_HOI') title = row[config.headers.indexOf('tieu_de')];
                        else if (tab === 'BANG_TAM') title = row[config.headers.indexOf('ghi_chu')] || row[config.headers.indexOf('noi_dung')];
                        else if (tab === 'DSNV') title = row[config.headers.indexOf('ho_ten')];

                        results.push({
                            tab: tab,
                            title: title || 'Dữ liệu',
                            row: row
                        });
                    }
                });
            }
        });

        if (results.length === 0) {
            resultsContainer.innerHTML = '<div style="padding:10px; color:#64748b; text-align:center;">Không tìm thấy kết quả.</div>';
        } else {
            // Giới hạn hiển thị 20 kết quả đầu
            resultsContainer.innerHTML = results.slice(0, 20).map(r => `
                <div style="padding:10px; border-bottom:1px solid #f1f5f9; cursor:pointer; hover:background:#f8fafc;" 
                     data-action="open-record-from-dash" data-tab-name="${r.tab}" data-row="${r.row._sheetRow}">
                    <div style="font-weight:600; font-size:0.9rem; color:#0f172a;">${r.title}</div>
                    <div style="font-size:0.75rem; color:#64748b; margin-top:3px; background:#e2e8f0; display:inline-block; padding:2px 6px; border-radius:4px;">Tab: ${r.tab}</div>
                </div>
            `).join('');
        }
        resultsContainer.style.display = 'block';
    }, 300);
}


function filterTable() {
    const searchVal = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const dateFromVal = document.getElementById('dateFromFilter')?.value;
    const dateToVal = document.getElementById('dateToFilter')?.value;

    let fromTime = null;
    let toTime = null;

    if (dateFromVal) {
        const d = new Date(dateFromVal);
        d.setHours(0, 0, 0, 0);
        fromTime = d.getTime();
    }
    if (dateToVal) {
        const d = new Date(dateToVal);
        d.setHours(23, 59, 59, 999);
        toTime = d.getTime();
    }

    filteredData = allData.filter(row => {
        let dateMatch = true;
        if (fromTime || toTime) {
            let anyDateMatches = false;
            const tabConfig = CONFIG.tabs[currentTab];
            let dateCols = [];
            if (tabConfig) {
                dateCols = tabConfig.headers.map((h, i) => ['ngay', 'ngay_in', 'ngay_out', 'ngay_bat_dau', 'ngay_hoan_thanh'].includes(h) ? i : -1).filter(i => i !== -1);
            }
            if (dateCols.length === 0) dateCols = [1]; // Fallback to column 1 if no date columns found

            for (let i of dateCols) {
                if (row[i]) {
                    let dStr = String(row[i]);
                    if (dStr.includes('/')) {
                        const parts = dStr.split(' ')[0].split('/');
                        if (parts.length === 3) dStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
                    }
                    const rd = new Date(dStr);
                    if (!isNaN(rd.getTime())) {
                        const rdTime = rd.getTime();
                        let thisDateMatches = true;
                        if (fromTime && rdTime < fromTime) thisDateMatches = false;
                        if (toTime && rdTime > toTime) thisDateMatches = false;
                        if (thisDateMatches) {
                            anyDateMatches = true;
                            break;
                        }
                    }
                }
            }
            if (!anyDateMatches) {
                dateMatch = false;
            }
        }

        let textMatch = true;
        if (searchVal) {
            textMatch = row.some(cell => String(cell || '').toLowerCase().includes(searchVal));
        }

        let phanLoaiMatch = true;
        if (activePhanLoaiFilter && activePhanLoaiFilter.length > 0 && currentTab === 'GHI_CHU') {
            const colIndex = CONFIG.tabs[currentTab].headers.indexOf('phan_loai');
            phanLoaiMatch = activePhanLoaiFilter.includes(row[colIndex]);
        } else if (activePhanLoaiFilter && activePhanLoaiFilter.length > 0 && (currentTab === 'HOC_HOI' || currentTab === 'DSNV' || currentTab === 'MK' || currentTab === 'BANG_TAM')) {
            const colName = currentTab === 'DSNV' ? 'hashtag' : 'tag';
            const colIndex = CONFIG.tabs[currentTab].headers.indexOf(colName);
            if (colIndex !== -1) {
                const tags = String(row[colIndex] || '').split(',').map(s => s.trim());
                phanLoaiMatch = activePhanLoaiFilter.some(filterTag => tags.includes(filterTag));
            }
        }

        let expenseMatch = true;
        if (currentTab === 'CHI_TIEU') {
            const tabConfig = CONFIG.tabs[currentTab];
            for (const [col, val] of Object.entries(activeExpenseFilters)) {
                if (col === 'tai_khoan') {
                    const tkIdx = tabConfig.headers.indexOf('tai_khoan');
                    const tknIdx = tabConfig.headers.indexOf('tai_khoan_nhan');
                    if (row[tkIdx] !== val && row[tknIdx] !== val) {
                        expenseMatch = false;
                        break;
                    }
                } else {
                    const colIndex = tabConfig.headers.indexOf(col);
                    if (colIndex !== -1 && row[colIndex] !== val) {
                        expenseMatch = false;
                        break;
                    }
                }
            }
        }

        let taskMatch = true;
        if (currentTab === 'CONG_VIEC') {
            const tabConfig = CONFIG.tabs[currentTab];
            for (const [col, val] of Object.entries(activeTaskFilters)) {
                const colIndex = tabConfig.headers.indexOf(col);
                if (colIndex !== -1 && row[colIndex] !== val) {
                    taskMatch = false;
                    break;
                }
            }
        }

        return dateMatch && textMatch && phanLoaiMatch && expenseMatch && taskMatch;
    });

    const tabConfig = CONFIG.tabs[currentTab];
    if (tabConfig && tabConfig.headers) {
        const ghimIdx = tabConfig.headers.indexOf('ghim');
        if (ghimIdx !== -1) {
            filteredData.sort((a, b) => {
                const isGhimA = (a[ghimIdx] === '1' || a[ghimIdx] === 'x' || String(a[ghimIdx]).toUpperCase() === 'TRUE') ? 1 : 0;
                const isGhimB = (b[ghimIdx] === '1' || b[ghimIdx] === 'x' || String(b[ghimIdx]).toUpperCase() === 'TRUE') ? 1 : 0;
                // If both are pinned or both are not pinned, keep their original order (which might be sorted by something else)
                if (isGhimA === isGhimB) return 0;
                return isGhimB - isGhimA; // pinned items first
            });
        }
    }

    currentPage = 1;
    dispatchViewRender();
}


function renderTabFilters() {
    const container = document.getElementById('phanLoaiFilterContainer');
    if (!container) return;

    if (currentTab === 'GHI_CHU') {
        const tabConfig = CONFIG.tabs[currentTab];
        const colIndex = tabConfig.headers.indexOf('phan_loai');
        const existingTags = new Set(allData.map(row => row[colIndex]).filter(v => v && typeof v === 'string' && v.trim() !== ''));

        let html = `<button class="tag-btn ${activePhanLoaiFilter.length === 0 ? 'active' : ''}" data-action="set-phan-loai-filter" data-val="" style="border-radius: 20px; font-weight:bold; ${activePhanLoaiFilter.length === 0 ? 'background-color: var(--primary); color: white;' : ''}">Tất cả</button>`;

        Array.from(existingTags).forEach(t => {
            const isActive = activePhanLoaiFilter.includes(t);
            const style = isActive ? 'background-color: var(--primary); color: white;' : '';
            html += `<button class="tag-btn ${isActive ? 'active' : ''}" onclick="setPhanLoaiFilter('${t.replace(/'/g, "\\'")}')" style="border-radius: 20px; font-weight:bold; ${style}">${t}</button>`;
        });
        container.innerHTML = html;
    } else if (currentTab === 'CHI_TIEU') {
        const tabConfig = CONFIG.tabs[currentTab];
        const colsToFilter = ['loai_giao_dich', 'tai_khoan', 'hang_muc', 'hashtag'];
        let html = '';
        colsToFilter.forEach(col => {
            const colIndex = tabConfig.headers.indexOf(col);
            if (colIndex === -1) return;
            const existingVals = new Set(allData.map(row => row[colIndex]).filter(v => v && typeof v === 'string' && v.trim() !== ''));
            const activeVal = activeExpenseFilters[col] || '';

            let btnHtml = `<div style="display:flex; align-items:center; gap:5px; flex-wrap:wrap; border-right:1px solid #e2e8f0; padding-right:10px;">`;
            btnHtml += `<span style="font-size:12px; color:#64748b; font-weight:600;">${col.toUpperCase()}:</span>`;
            btnHtml += `<button class="tag-btn ${!activeVal ? 'active' : ''}" data-action="set-expense-filter" data-col="${col}" data-val="" style="padding:4px 8px; font-size:12px; border-radius:12px; ${!activeVal ? 'background-color: var(--primary); color: white;' : ''}">Tất cả</button>`;

            Array.from(existingVals).forEach(v => {
                const isActive = activeVal === v;
                const style = isActive ? 'background-color: var(--primary); color: white;' : '';
                btnHtml += `<button class="tag-btn ${isActive ? 'active' : ''}" onclick="setExpenseFilter('${col}', '${v.replace(/'/g, "\\'")}')" style="padding:4px 8px; font-size:12px; border-radius:12px; ${style}">${v}</button>`;
            });
            btnHtml += `</div>`;
            html += btnHtml;
        });
        container.innerHTML = `<div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:10px;">${html}</div>`;
    } else if (currentTab === 'CONG_VIEC') {
        const tabConfig = CONFIG.tabs[currentTab];
        const colsToFilter = ['danh_muc', 'trang_thai', 'tag'];
        let html = '';
        colsToFilter.forEach(col => {
            const colIndex = tabConfig.headers.indexOf(col);
            if (colIndex === -1) return;
            const existingVals = new Set(allData.map(row => row[colIndex]).filter(v => v && typeof v === 'string' && v.trim() !== ''));
            const activeVal = activeTaskFilters[col] || '';

            let btnHtml = `<div style="display:flex; align-items:center; gap:5px; flex-wrap:wrap; border-right:1px solid #e2e8f0; padding-right:10px;">`;
            btnHtml += `<span style="font-size:12px; color:#64748b; font-weight:600;">${col.toUpperCase()}:</span>`;
            btnHtml += `<button class="tag-btn ${!activeVal ? 'active' : ''}" data-action="set-task-filter" data-col="${col}" data-val="" style="padding:4px 8px; font-size:12px; border-radius:12px; ${!activeVal ? 'background-color: var(--primary); color: white;' : ''}">Tất cả</button>`;

            Array.from(existingVals).forEach(v => {
                const isActive = activeVal === v;
                const style = isActive ? 'background-color: var(--primary); color: white;' : '';
                btnHtml += `<button class="tag-btn ${isActive ? 'active' : ''}" onclick="setTaskFilter('${col}', '${v.replace(/'/g, "\\'")}')" style="padding:4px 8px; font-size:12px; border-radius:12px; ${style}">${v}</button>`;
            });
            btnHtml += `</div>`;
            html += btnHtml;
        });
        container.innerHTML = `<div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:10px;">${html}</div>`;
    } else if (currentTab === 'HOC_HOI' || currentTab === 'DSNV' || currentTab === 'MK' || currentTab === 'BANG_TAM') {
        const tabConfig = CONFIG.tabs[currentTab];
        const colName = currentTab === 'DSNV' ? 'hashtag' : 'tag';
        const colIndex = tabConfig.headers.indexOf(colName);
        if (colIndex !== -1) {
            const allTags = allData.map(row => row[colIndex]).filter(v => v && typeof v === 'string' && v.trim() !== '').flatMap(v => v.split(',').map(s => s.trim()));
            const existingVals = new Set(allTags);
            const activeVal = activePhanLoaiFilter || '';

            let btnHtml = `<div style="display:flex; align-items:center; gap:5px; flex-wrap:wrap;">`;
            btnHtml += `<span style="font-size:12px; color:#64748b; font-weight:600;">${colName.toUpperCase()}:</span>`;
            btnHtml += `<button class="tag-btn ${activePhanLoaiFilter.length === 0 ? 'active' : ''}" data-action="set-phan-loai-filter" data-val="" style="padding:4px 8px; font-size:12px; border-radius:12px; ${activePhanLoaiFilter.length === 0 ? 'background-color: var(--primary); color: white;' : ''}">Tất cả</button>`;

            Array.from(existingVals).forEach(v => {
                const isActive = activePhanLoaiFilter.includes(v);
                const style = isActive ? 'background-color: var(--primary); color: white;' : '';
                btnHtml += `<button class="tag-btn ${isActive ? 'active' : ''}" onclick="setPhanLoaiFilter('${v.replace(/'/g, "\\'")}')" style="padding:4px 8px; font-size:12px; border-radius:12px; ${style}">${v}</button>`;
            });
            btnHtml += `</div>`;
            container.innerHTML = `<div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:10px;">${btnHtml}</div>`;
        }
    } else {
        container.innerHTML = '';
    }
}


function quickFilterDate(type) {
    const fromInput = document.getElementById('dateFromFilter');
    const toInput = document.getElementById('dateToFilter');
    if (!fromInput || !toInput) return;

    const now = new Date();
    const getLocalISO = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

    let fromDate = null;
    let toDate = null;

    if (type === 'today') {
        fromDate = new Date();
        toDate = new Date();
    } else if (type === 'yesterday') {
        fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 1);
        toDate = new Date(fromDate);
    } else if (type === 'this_week') {
        fromDate = new Date();
        const day = fromDate.getDay();
        const diff = fromDate.getDate() - day + (day === 0 ? -6 : 1);
        fromDate.setDate(diff);
        toDate = new Date();
        toDate.setDate(fromDate.getDate() + 6);
    } else if (type === 'this_month') {
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (type === '7_days') {
        fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 4);
        toDate = new Date();
        toDate.setDate(toDate.getDate() + 2);
    } else if (type === 'all') {
        fromInput.value = '';
        toInput.value = '';
        filterTable();
        return;
    }

    if (fromDate && toDate) {
        fromInput.value = getLocalISO(fromDate);
        toInput.value = getLocalISO(toDate);
    }

    filterTable();
}


function toggleSelectAll(targetEl = null) {
    const selectAllEl = targetEl || document.getElementById('selectAll') || document.getElementById('selectAllCb');
    if (!selectAllEl) return;
    const isChecked = selectAllEl.checked;
    const checkboxes = document.querySelectorAll('.row-checkbox');
    checkboxes.forEach(cb => cb.checked = isChecked);
    updateBatchButtons();
}


function handleRowCheckbox() {
    updateBatchButtons();
}


function updateBatchButtons() {
    const totalCheckboxes = document.querySelectorAll('.row-checkbox');
    const checkedCount = document.querySelectorAll('.row-checkbox:checked').length;
    const editBtn = document.getElementById('batchEditPhanLoaiBtn');
    const editGioiTinhBtn = document.getElementById('batchEditGioiTinhBtn');
    const editHashtagBtn = document.getElementById('batchEditHashtagBtn');
    const delBtn = document.getElementById('batchDeleteBtn');
    const selectAll = document.getElementById('selectAll') || document.getElementById('selectAllCb');
    
    if (selectAll) {
        selectAll.checked = totalCheckboxes.length > 0 && checkedCount === totalCheckboxes.length;
        selectAll.indeterminate = checkedCount > 0 && checkedCount < totalCheckboxes.length;
    }
    
    if (checkedCount > 0) {
        if (editBtn) editBtn.style.display = currentTab === 'GHI_CHU' ? 'inline-block' : 'none';
        if (editGioiTinhBtn) editGioiTinhBtn.style.display = currentTab === 'DSNV' ? 'inline-block' : 'none';
        if (editHashtagBtn) editHashtagBtn.style.display = currentTab === 'DSNV' ? 'inline-block' : 'none';
        if (delBtn) delBtn.style.display = 'inline-block';
    } else {
        if (editBtn) editBtn.style.display = 'none';
        if (editGioiTinhBtn) editGioiTinhBtn.style.display = 'none';
        if (editHashtagBtn) editHashtagBtn.style.display = 'none';
        if (delBtn) delBtn.style.display = 'none';
    }
}


function openBatchEdit(colName, modalTitle, modalLabel, defaultTags = [], initialValue = '') {
    const checkboxes = document.querySelectorAll('.row-checkbox:checked');
    if (checkboxes.length === 0) return;

    window.batchEditTargetCol = colName;
    const tabConfig = CONFIG.tabs[currentTab];
    const colIndex = tabConfig.headers.indexOf(colName);

    if (!initialValue && checkboxes.length > 0) {
        // Lấy giá trị của dòng đầu tiên được chọn làm giá trị mặc định để sửa
                if (rowData && colIndex !== -1) {
            initialValue = rowData[colIndex] || '';
        }
    }
    
    let existingTags = new Set();
    if (colIndex !== -1) {
        if (colName === 'hashtag' || colName === 'tag') {
            const allTags = allData.map(row => row[colIndex]).filter(v => v && typeof v === 'string' && v.trim() !== '').flatMap(v => v.split(',').map(s => s.trim()));
            existingTags = new Set(allTags);
        } else {
            existingTags = new Set(allData.map(row => row[colIndex]).filter(v => v && typeof v === 'string' && v.trim() !== ''));
        }
    }
    defaultTags.forEach(t => existingTags.add(t)); // Add default tags

    const tagsHtml = Array.from(existingTags).map(t => {
        if (colName === 'hashtag' || colName === 'tag') {
            return `<button type="button" class="tag-btn" data-tag="${t.replace(/"/g, '&quot;')}" onclick="window.toggleTag('batchEditPhanLoaiInput', '${t.replace(/'/g, "\\'")}')">${t}</button>`;
        } else {
            return `<button type="button" class="tag-btn" data-tag="${t.replace(/"/g, '&quot;')}" onclick="document.getElementById('batchEditPhanLoaiInput').value='${t.replace(/'/g, "\\'")}'; if(window.updateTagButtonsUI) window.updateTagButtonsUI('batchEditPhanLoaiInput');">${t}</button>`;
        }
    }).join('');

    document.getElementById('batchEditModalTitle').innerText = modalTitle || `Sửa ${colName}`;
    document.getElementById('batchEditModalLabel').innerText = modalLabel || `Giá trị mới`;
    document.getElementById('batchEditTagButtons').innerHTML = tagsHtml;
    document.getElementById('batchEditPhanLoaiInput').value = initialValue;

    document.getElementById('batchEditModal').style.display = 'flex';
    
    setTimeout(() => { if(window.updateTagButtonsUI) window.updateTagButtonsUI('batchEditPhanLoaiInput'); }, 10);
}

function openBatchEditPhanLoai() {
    openBatchEdit('phan_loai', 'Sửa phân loại hàng loạt', 'PHÂN LOẠI MỚI', ['Ghi chú', 'Sự kiện', 'Ảnh']);
}

function openBatchEditGioiTinh() {
    openBatchEdit('gioi_tinh', 'Sửa giới tính hàng loạt', 'GIỚI TÍNH MỚI', ['Nam', 'Nữ']);
}

function openBatchEditHashtag() {
    openBatchEdit('hashtag', 'Sửa hashtag hàng loạt', 'HASHTAG MỚI', []);
}

function closeBatchEditModal() {
    document.getElementById('batchEditModal').style.display = 'none';
}

function openRecordForm(rowData = null, sheetRow = null) {
    if (!Array.isArray(rowData)) {
        rowData = null;
        sheetRow = null;
    }
    if (!currentTab) return;
    const tabConfig = CONFIG.tabs[currentTab];
    if (!tabConfig) return;
    const fieldsDiv = document.getElementById('formFields');
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const formattedNow = (new Date(Date.now() - offset)).toISOString().slice(0, 16);

    editingSheetRow = sheetRow;
    const isEdit = rowData && sheetRow;
    document.getElementById('productModalTitle').innerText = isEdit ? 'Chỉnh sửa' : 'Thêm mới';

    fieldsDiv.innerHTML = tabConfig.headers.map((h, idx) => {
        let val = isEdit ? (rowData[idx] || '') : '';

        // Parse date for input
        if (isEdit && String(val).includes('/')) {
            if (h === 'ngay') {
                const [d, m, y] = val.split('/');
                val = `${y}-${m}-${d}`;
            } else if (['ngay_in', 'ngay_out'].includes(h)) {
                const [datePart, timePart] = val.split(' ');
                if (datePart) {
                    const [d, m, y] = datePart.split('/');
                    val = `${y}-${m}-${d}T${timePart || '00:00'}`;
                }
            }
        }

        let inputHtml = `<input type="text" id="input_${h}" name="${h}" value="${val}" placeholder="Nhập ${h}...">`;
        if (h === 'id') {
            return `<input type="hidden" id="input_${h}" name="${h}" value="${val}">`;
        } else if (h === 'bao_lau') {
            inputHtml = `<input type="text" id="input_${h}" name="${h}" value="${val}" placeholder="Tự động tính..." readonly>`;
        } else if (h === 'map') {
            inputHtml = `
            <div style="display:flex; gap:8px;">
                <input type="text" id="input_${h}" name="${h}" value="${val}" placeholder="Kinh độ, Vĩ độ..." style="flex-grow:1;" data-action="update-map-input">
                <button type="button" class="tag-btn" data-action="get-location" data-input="input_" style="white-space:nowrap; background:#e0f2fe; color:#0369a1; border-color:#bae6fd;">Lấy vị trí</button>
            </div>
            <div id="mapPreview" style="width:100%; height:250px; margin-top:8px; border-radius:8px; border:1px solid #ccc;"></div>`;
        } else if (h === 'ngay') {
            inputHtml = `
            <div style="display:flex; gap:5px;">
                <button type="button" class="tag-btn" data-action="adjust-date" data-input="input_${h}" data-val="-1" style="padding:4px 8px;">-</button>
                <input type="date" id="input_${h}" name="${h}" value="${val || formattedNow.slice(0, 10)}" style="flex-grow:1;">
                <button type="button" class="tag-btn" data-action="adjust-date" data-input="input_${h}" data-val="1" style="padding:4px 8px;">+</button>
            </div>`;
        } else if (h === 'ngay_in') {
            inputHtml = `
            <div style="display:flex; gap:5px;">
                <button type="button" class="tag-btn" data-action="adjust-date" data-input="input_${h}" data-val="-1" style="padding:4px 8px;">-</button>
                <input type="datetime-local" id="input_${h}" name="${h}" value="${val || formattedNow}" style="flex-grow:1;">
                <button type="button" class="tag-btn" data-action="adjust-date" data-input="input_${h}" data-val="1" style="padding:4px 8px;">+</button>
            </div>`;
        } else if (h === 'ngay_out') {
            let outVal = val;
            if (!isEdit && !val) {
                const inDate = new Date();
                inDate.setMinutes(inDate.getMinutes() + 30);
                outVal = new Date(inDate.getTime() - offset).toISOString().slice(0, 16);
            } else {
                outVal = val || formattedNow;
            }
            inputHtml = `
            <div style="display:flex; gap:5px;">
                <button type="button" class="tag-btn" data-action="adjust-date" data-input="input_${h}" data-val="-1" style="padding:4px 8px;">-</button>
                <input type="datetime-local" id="input_${h}" name="${h}" value="${outVal}" style="flex-grow:1;">
                <button type="button" class="tag-btn" data-action="adjust-date" data-input="input_${h}" data-val="1" style="padding:4px 8px;">+</button>
                <button type="button" class="tag-btn" data-action="set-ngay-out-30" style="white-space:nowrap; background:#e0f2fe; color:#0369a1; border-color:#bae6fd;">+30p từ IN</button>
            </div>`;
        } else if (h === 'phan_loai') {
            const colIndex = tabConfig.headers.indexOf('phan_loai');
            const existingTags = new Set(allData.map(row => row[colIndex]).filter(v => v && typeof v === 'string' && v.trim() !== ''));
            ['Ghi chú', 'Sự kiện', 'Ảnh'].forEach(t => existingTags.add(t));

            const tagsHtml = Array.from(existingTags).map(t =>
                `<button type="button" class="tag-btn" onclick="document.getElementById('input_phan_loai').value='${t.replace(/'/g, "&#39;")}'">${t}</button>`
            ).join('');

            inputHtml = `
                <input type="text" id="input_${h}" name="${h}" value="${val}" placeholder="Nhập hoặc chọn phân loại...">
                <div class="tag-buttons" style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">${tagsHtml}</div>
            `;
        } else if (h === 'tag' && (currentTab === 'HOC_HOI' || currentTab === 'BANG_TAM')) {
            const colIndex = tabConfig.headers.indexOf('tag');
            const allTags = allData.map(row => row[colIndex]).filter(v => v && typeof v === 'string' && v.trim() !== '').flatMap(v => v.split(',').map(s => s.trim()));
            const existingTags = new Set(allTags);
            if (currentTab === 'HOC_HOI') {
                ['Lập trình', 'Thiết kế', 'Công cụ', 'Bài viết hay'].forEach(t => existingTags.add(t));
            } else if (currentTab === 'BANG_TAM') {
                ['Quan trọng', 'Tạm thời', 'Cần xử lý', 'Ý tưởng'].forEach(t => existingTags.add(t));
            }

            const tagsHtml = Array.from(existingTags).map(t =>
                `<button type="button" class="tag-btn" data-tag="${t.replace(/"/g, '&quot;')}" onclick="window.toggleTag('input_${h}', '${t.replace(/'/g, "\\'")}')">${t}</button>`
            ).join('');

            inputHtml = `
                <input type="text" id="input_${h}" name="${h}" value="${val}" placeholder="Nhập hoặc chọn nhiều tag (cách nhau bởi dấu phẩy)..." data-action="update-tags-input" data-input="input_${h}">
                <div class="tag-buttons" style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">${tagsHtml}</div>
            `;
        } else if (['noi_dung', 'mo_ta', 'ghi_chu', 'chi_tiet'].includes(h)) {
            let previewImages = '';
            const urlMatches = [...String(val || '').matchAll(/(?:!\[.*?\]\((.*?)\))|(?:(?:^|\s)(https?:\/\/\S+\.(?:png|jpg|jpeg|gif|webp))(?:$|\s))/ig)];
            if (urlMatches && urlMatches.length > 0) {
                const urls = urlMatches.map(m => m[1] || m[2]).filter(Boolean);
                if (urls.length > 0) {
                    previewImages = `<div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">` + 
                        urls.map(u => `<img src="${u}" style="max-height:100px; border-radius:4px; border:1px solid #e2e8f0; object-fit:cover;">`).join('') + 
                        `</div>`;
                }
            }
            inputHtml = `<textarea id="input_${h}" name="${h}" placeholder="Nhập ${h}..." rows="5" style="min-height:140px; line-height:1.6; resize:vertical; font-family:inherit; width:100%; white-space:pre-wrap; word-break:break-word; overflow-wrap:break-word;">${val}</textarea><div id="preview_${h}">${previewImages}</div>`;
        } else if (h === 'loai_giao_dich') {
            const options = ['Chi', 'Thu', 'Chuyển khoản'];
            const valOrDefault = val || 'Chi';
            const buttonsHtml = options.map(o => `
                <button type="button" class="tag-btn ${valOrDefault === o ? 'active' : ''}" 
                    style="${valOrDefault === o ? 'background: var(--primary); color: white; border-color: var(--primary);' : ''}"
                    onclick="document.getElementById('input_${h}').value='${o}'; 
                             this.parentElement.querySelectorAll('button').forEach(b => {b.style.background=''; b.style.color=''; b.style.borderColor=''; b.classList.remove('active');}); 
                             this.style.background='var(--primary)'; this.style.color='white'; this.style.borderColor='var(--primary)'; this.classList.add('active');
                             if(window.handleLoaiGiaoDichChange) window.handleLoaiGiaoDichChange();">
                    ${o}
                </button>
            `).join('');
            inputHtml = `
                <input type="hidden" id="input_${h}" name="${h}" value="${valOrDefault}">
                <div style="display:flex; gap:8px; margin-top:8px;">${buttonsHtml}</div>
            `;
        } else if (h === 'so_du_ao') {
            let displayVal = val;
            if (val && String(val).includes('|')) {
                const parts = String(val).split('|');
                displayVal = formatMoney(parts[0].trim()) + ' đ | ' + formatMoney(parts[1].trim()) + ' đ';
            } else if (val) {
                displayVal = formatMoney(val) + ' đ';
            }
            inputHtml = `<input type="text" id="input_${h}" name="${h}" value="${displayVal}" placeholder="Tự động tính..." readonly>`;
        } else if (h === 'so_tien') {
            const rawVal = parseFloat(String(val).replace(/,/g, '')) || '';
            const quickAmounts = [10, 20, 30, 50, 100, 200, 300, 500, 1000];
            const tagsHtml = quickAmounts.map(a =>
                `<button type="button" class="tag-btn" onclick="const inp = document.getElementById('input_${h}'); inp.value = (parseFloat(inp.value.replace(/,/g, '')) || 0) + ${a};">+${formatMoney(a)}</button>`
            ).join('');

            inputHtml = `
                <input type="number" id="input_${h}" name="${h}" value="${rawVal}" placeholder="Nhập ${h}...">
                <div class="tag-buttons" style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">${tagsHtml}</div>
            `;
        } else if (h === 'hang_muc') {
            const colIndex = tabConfig.headers.indexOf(h);
            const recentItems = [...new Set(allData.map(row => row[colIndex]).filter(v => v && typeof v === 'string' && v.trim() !== ''))].slice(0, 10);
            const existingTags = new Set(recentItems);
            ['Công việc', 'Cá nhân', 'Gia đình', 'Lương', 'Bán hàng', 'Momo', 'Tp'].forEach(t => existingTags.add(t)); // default tags

            const tagsHtml = Array.from(existingTags).map(t =>
                `<button type="button" class="tag-btn" onclick="document.getElementById('input_${h}').value='${t.replace(/'/g, "&#39;")}'">${t}</button>`
            ).join('');

            inputHtml = `
                <input type="text" id="input_${h}" name="${h}" value="${val}" placeholder="Nhập hoặc chọn ${h}...">
                <div class="tag-buttons" style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">${tagsHtml}</div>
            `;
        } else if (currentTab === 'CONG_VIEC' && ['trang_thai', 'danh_muc'].includes(h)) {
            const opts = h === 'trang_thai' ? ['Chưa làm', 'Đang làm', 'Hoàn thành', 'Tạm dừng'] :
                    ['Công việc', 'Cá nhân', 'Gia đình', 'Học tập', 'Khác'];
            const tagsHtml = opts.map(o =>
                `<button type="button" class="tag-btn" data-action="set-input-val" data-input="input_${h}" data-val="${o}">${o}</button>`
            ).join('');
            inputHtml = `
                <input type="text" id="input_${h}" name="${h}" value="${val}" placeholder="Nhập ${h}...">
                <div class="tag-buttons" style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">${tagsHtml}</div>
            `;
        } else if (h === 'ngay_gio' || (currentTab === 'CONG_VIEC' && ['ngay_bat_dau', 'ngay_hoan_thanh'].includes(h))) {
            let dateVal = val;
            if (val && String(val).includes('/')) {
                const parts = String(val).split(' ');
                const [dd, mm, yyyy] = parts[0].split('/');
                dateVal = `${yyyy}-${mm}-${dd}T${parts[1] || '00:00'}`;
            } else if (!isEdit && !val) {
                const localNow = new Date();
                if (h === 'ngay_gio' || h === 'ngay_bat_dau') {
                    dateVal = new Date(localNow.getTime() - localNow.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                } else if (h === 'ngay_hoan_thanh') {
                    localNow.setMinutes(localNow.getMinutes() + 30);
                    dateVal = new Date(localNow.getTime() - localNow.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                }
            }
            inputHtml = `
                <div style="display:flex; gap:5px;">
                    <button type="button" class="tag-btn" data-action="adjust-date" data-input="input_${h}" data-val="-1" style="padding:4px 8px;">-</button>
                    <input type="datetime-local" id="input_${h}" name="${h}" value="${dateVal}" style="flex-grow:1;">
                    <button type="button" class="tag-btn" data-action="adjust-date" data-input="input_${h}" data-val="1" style="padding:4px 8px;">+</button>
                </div>`;
        } else if (h === 'tai_khoan' || h === 'tai_khoan_nhan') {
            const colIndex = tabConfig.headers.indexOf(h);
            const existingAccounts = new Set(allData.map(row => row[colIndex]).filter(v => v && typeof v === 'string' && v.trim() !== ''));
            ['Tiền mặt', 'Vietcombank', 'Momo'].forEach(t => existingAccounts.add(t));
            const tagsHtml = Array.from(existingAccounts).map(t =>
                `<button type="button" class="tag-btn" onclick="document.getElementById('input_${h}').value='${t.replace(/'/g, "&#39;")}'">${t}</button>`
            ).join('');

            inputHtml = `
                <input type="text" id="input_${h}" name="${h}" value="${val}" placeholder="Nhập hoặc chọn tài khoản...">
                <div class="tag-buttons" style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">${tagsHtml}</div>
            `;
        } else if (h === 'ngay_sinh') {
            let dateVal = val;
            if (val && String(val).includes('/')) {
                const parts = String(val).split('/');
                if (parts.length === 3) dateVal = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            inputHtml = `<input type="date" id="input_${h}" name="${h}" value="${dateVal}">`;
        } else if (h === 'email') {
            inputHtml = `<input type="email" id="input_${h}" name="${h}" value="${val}" placeholder="Nhập địa chỉ email...">`;
        } else if (h === 'gioi_tinh') {
            const opts = ['Nam', 'Nữ'];
            const tagsHtml = opts.map(o =>
                `<button type="button" class="tag-btn" data-action="set-input-val" data-input="input_${h}" data-val="${o}">${o}</button>`
            ).join('');
            inputHtml = `
                <input type="text" id="input_${h}" name="${h}" value="${val}" placeholder="Chọn hoặc nhập giới tính...">
                <div class="tag-buttons" style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">${tagsHtml}</div>
            `;
        } else if (h === 'hashtag') {
            const colIndex = tabConfig.headers.indexOf('hashtag');
            const allTags = allData.map(row => row[colIndex]).filter(v => v && typeof v === 'string' && v.trim() !== '').flatMap(v => v.split(',').map(s => s.trim()));
            const existingTags = new Set(allTags);
            
            const tagsHtml = Array.from(existingTags).map(t =>
                `<button type="button" class="tag-btn" data-tag="${t.replace(/"/g, '&quot;')}" onclick="window.toggleTag('input_${h}', '${t.replace(/'/g, "\\'")}')">${t}</button>`
            ).join('');

            inputHtml = `
                <input type="text" id="input_${h}" name="${h}" value="${val}" placeholder="Nhập hoặc chọn hashtag..." data-action="update-tags-input" data-input="input_${h}">
                <div class="tag-buttons" style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">${tagsHtml}</div>
            `;
        }
        if (['anh', 'anh_2', 'hinh_anh', 'avatar', 'link', 'link_anh'].includes(h)) {
            inputHtml = inputHtml.replace(`<input type="text" id="input_${h}"`, `<input type="text" id="input_${h}" data-action="img-preview-input" data-preview="preview_${h}"`);
            
            let imgPreview = '';
            if (val && String(val).startsWith('http')) {
                imgPreview = `<img id="preview_${h}" src="${val}" style="max-height: 100px; max-width: 100px; border-radius: 8px; object-fit: cover; border: 1px solid #e2e8f0; display: block; flex-shrink: 0;">`;
            } else {
                imgPreview = `<img id="preview_${h}" src="" style="max-height: 100px; max-width: 100px; border-radius: 8px; object-fit: cover; border: 1px solid #e2e8f0; display: none; flex-shrink: 0;">`;
            }

            inputHtml += `
                <div style="margin-top: 8px; display:flex; gap:10px; align-items:flex-start;">
                    ${imgPreview}
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <input type="file" id="file_${h}" accept="image/*" style="display:none;" data-action="upload-imgbb" data-target="input_${h}" data-preview="preview_${h}">
                        <button type="button" class="tag-btn" data-action="trigger-upload" data-file-id="file_${h}" style="background:#e0f2fe; color:#0369a1; display:flex; align-items:center; width:fit-content; padding: 6px 12px;">
                            <i data-lucide="upload-cloud" style="width:14px;height:14px;margin-right:4px;"></i> Tải ảnh lên
                        </button>
                        <span id="upload_status_${h}" style="font-size:0.8rem; color:#64748b;"></span>
                    </div>
                </div>
            `;
        }
        const isFullWidth = ['tieu_de', 'mo_ta', 'noi_dung', 'ghi_chu', 'link_lien_quan', 'file_dinh_kem'].includes(h);
        return `<div class="form-group ${isFullWidth ? 'full-width' : ''}" style="${isFullWidth ? 'grid-column: 1 / -1;' : ''}"><label>${h.toUpperCase()}</label>${inputHtml}</div>`;
    }).join('');

    document.getElementById('productModal').style.display = 'flex';
    if (typeof lucide !== 'undefined') lucide.createIcons();

    setTimeout(() => {
        if (window.updateTagButtonsUI) {
            if (document.getElementById('input_hashtag')) window.updateTagButtonsUI('input_hashtag');
            if (document.getElementById('input_tag')) window.updateTagButtonsUI('input_tag');
        }
    }, 10);
    
    if (tabConfig.headers.includes('map')) {
        setTimeout(() => {
            initMapPicker(document.getElementById('input_map').value);
        }, 100);
    }

    // Auto-sync dates
    const ngayInput = document.getElementById('input_ngay');
    const ngayInInput = document.getElementById('input_ngay_in');
    const ngayOutInput = document.getElementById('input_ngay_out');

    if (ngayInput) {
        ngayInput.addEventListener('change', (e) => {
            const dateVal = e.target.value;
            if (ngayInInput) {
                const timePart = ngayInInput.value ? ngayInInput.value.split('T')[1] : '00:00';
                ngayInInput.value = dateVal + "T" + timePart;
                // Trigger change to update ngay_out if it's a new record
                ngayInInput.dispatchEvent(new Event('change'));
            }
        });

        if (ngayInInput) {
            ngayInInput.addEventListener('change', (e) => {
                const inVal = e.target.value;
                if (inVal) {
                    const datePart = inVal.split('T')[0];
                    if (ngayInput.value !== datePart) {
                        ngayInput.value = datePart;
                    }

                    // If new record, update ngay_out = ngay_in + 30m
                    if (!isEdit && ngayOutInput) {
                        const inDate = new Date(inVal);
                        inDate.setMinutes(inDate.getMinutes() + 30);
                        const localOffset = inDate.getTimezoneOffset() * 60000;
                        ngayOutInput.value = new Date(inDate.getTime() - localOffset).toISOString().slice(0, 16);
                    }
                }
            });
        }
    }

    if (currentTab === 'CHI_TIEU') {
        window.handleLoaiGiaoDichChange = function () {
            const loai = document.getElementById('input_loai_giao_dich')?.value;
            const targetAccInput = document.getElementById('input_tai_khoan_nhan');
            const hangMucInput = document.getElementById('input_hang_muc');

            if (targetAccInput && targetAccInput.closest('.form-group')) {
                targetAccInput.closest('.form-group').style.display = loai === 'Chuyển khoản' ? 'block' : 'none';
            }
            if (hangMucInput && hangMucInput.closest('.form-group')) {
                hangMucInput.closest('.form-group').style.display = loai === 'Chuyển khoản' ? 'none' : 'block';
            }
        };
        setTimeout(() => window.handleLoaiGiaoDichChange(), 0);
    }
}


function closeProductForm() {
    document.getElementById('productModal').style.display = 'none';
}


function openRecordFormFromDash(tabName, rowData = null, sheetRow = null) {
    currentTab = tabName;
    if (window.cachedData && window.cachedData[tabName]) {
        allData = window.cachedData[tabName];
    } else {
        allData = [];
    }
    openRecordForm(rowData, sheetRow);
}


function setPhanLoaiFilter(tag) {
    if (!tag) {
        activePhanLoaiFilter = [];
    } else {
        const index = activePhanLoaiFilter.indexOf(tag);
        if (index > -1) {
            activePhanLoaiFilter.splice(index, 1);
        } else {
            activePhanLoaiFilter.push(tag);
        }
    }
    renderTabFilters();
    filterTable();
}





