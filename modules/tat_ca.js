async function renderAllDashboard() {
    const allDash = document.getElementById('allDashboard');
    if (!allDash) return;
    
    const tabsToFetch = ['GHI_CHU', 'CHI_TIEU', 'HOC_HOI'];
    const allCached = tabsToFetch.every(tabName => window.cachedData && window.cachedData[tabName]);
    if (!allCached) {
        document.getElementById('loading').style.display = 'flex';
    }
    allDash.innerHTML = '';

    try {
        const token = await getAccessToken();
        
        const promises = tabsToFetch.map(async (tabName) => {
            const tabConfig = CONFIG.tabs[tabName];
            let data;
            if (window.cachedData[tabName]) {
                data = window.cachedData[tabName];
            } else {
                const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${tabConfig.range}`, { 
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store'
                });
                const rawData = await res.json();
                data = (rawData.values || []).map((row, i) => {
                    const arr = [...row];
                    arr._sheetRow = i + 2;
                    return arr;
                });
                window.cachedData[tabName] = data;
            }
            return {
                tabName,
                headers: tabConfig.headers,
                data: [...data]
            };
        });

        allDashResults = await Promise.all(promises);
        
        allDashResults.forEach(result => {
            if (result.tabName === 'CHI_TIEU') {
                result.data.sort((a, b) => {
                    const dateDiff = parseSheetDate(a[1]) - parseSheetDate(b[1]);
                    if (dateDiff !== 0) return dateDiff;
                    return a._sheetRow - b._sheetRow;
                });
                
                let balances = {};
                result.data.forEach(row => {
                    const type = row[2];
                    const account = row[3];
                    const amount = parseFloat(String(row[4]).replace(/,/g, '')) || 0;
                    const targetAccount = row[6];
                    
                    if (account && !balances[account]) balances[account] = 0;
                    
                    if (type === 'Thu') {
                        if (account) balances[account] += amount;
                    } else if (type === 'Chi') {
                        if (account) balances[account] -= amount;
                    } else if (type === 'Chuyển khoản') {
                        if (account) balances[account] -= amount;
                        let targetBal = 0;
                        if (targetAccount) {
                            if (!balances[targetAccount]) balances[targetAccount] = 0;
                            balances[targetAccount] += amount;
                            targetBal = balances[targetAccount];
                        }
                        row[8] = account ? `${balances[account]}|${targetBal}` : '0|0';
                    }
                    if (type !== 'Chuyển khoản') {
                        row[8] = account ? balances[account] : 0;
                    }
                });
            }
            
            result.data.sort((a, b) => {
                const dateA = parseSheetDate(a[1]);
                const dateB = parseSheetDate(b[1]);
                if (dateA !== dateB && dateA !== 0 && dateB !== 0) return dateB - dateA;
                return b._sheetRow - a._sheetRow;
            });
            // Reset to page 1 on load
            allDashPages[result.tabName] = 1;
        });
        
        renderAllDashTables();
        
    } catch (e) {
        console.error(e);
        allDash.innerHTML = `<p style="color:red; padding:20px;">Lỗi tải dữ liệu: ${e.message}</p>`;
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}


function renderAllDashTables() {
    const allDash = document.getElementById('allDashboard');
    if (!allDash) return;
    
    let html = `<div style="display:flex; flex-direction:row; gap:20px; width:100%; align-items:stretch; padding-bottom: 20px;">`;
    
    allDashResults.forEach(result => {
        const currentPage = allDashPages[result.tabName] || 1;
        const start = (currentPage - 1) * ALL_DASH_ROWS_PER_PAGE;
        const end = start + ALL_DASH_ROWS_PER_PAGE;
        const pageData = result.data.slice(start, end);
        const totalPages = Math.ceil(result.data.length / ALL_DASH_ROWS_PER_PAGE) || 1;
        
        let colTitle = '';
        let colIcon = '';
        let displayCols = [];
        
        if (result.tabName === 'GHI_CHU') { 
            colTitle = 'GHI CHÚ'; 
            colIcon = 'book-open'; 
            displayCols = ['ngay', 'tieu_de', 'noi_dung', 'phan_loai'];
        }
        if (result.tabName === 'CHI_TIEU') { 
            colTitle = 'CHI TIÊU'; 
            colIcon = 'wallet'; 
            displayCols = ['ngay', 'loai_giao_dich', 'tai_khoan', 'so_tien', 'hang_muc', 'ghi_chu', 'tai_khoan_nhan', 'so_du_ao'];
        }
        if (result.tabName === 'HOC_HOI') { 
            colTitle = 'HỌC HỎI'; 
            colIcon = 'graduation-cap'; 
            displayCols = ['ngay', 'tieu_de', 'noi_dung', 'link', 'tag'];
        }
        
        let tableHtml = `
            <div style="height: calc(100vh - 120px); flex: 1; min-width: 0; display:flex; flex-direction:column; background:var(--surface, #ffffff); border-radius:12px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,0.1); border:1px solid #e2e8f0;">
                <div style="font-size:1.1rem; font-weight:700; color:var(--primary, #5b5ef4); margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; gap:8px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <i data-lucide="${colIcon}" style="width:20px;height:20px;"></i> ${colTitle}
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <button data-action="open-record-dash-new" data-tab-name="${result.tabName}" style="background:var(--success, #10b981); color:#fff; border:none; border-radius:6px; padding:6px 12px; font-size:0.85rem; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px;">
                            Thêm mới
                        </button>
                        <button data-action="switch-tab" data-tab-name="${result.tabName}" style="background:var(--primary, #5b5ef4); color:#fff; border:none; border-radius:6px; padding:6px 12px; font-size:0.85rem; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px;">
                            Mở module
                        </button>
                    </div>
                </div>
                <div style="overflow:auto; flex:1;">
                    <table style="width:100%; min-width:${result.tabName === 'CHI_TIEU' ? '800px' : '600px'}; table-layout:fixed; border-collapse:collapse; font-size:0.9rem; word-wrap: break-word;">
                        <thead style="position: sticky; top: 0; background: var(--surface, #ffffff); z-index: 10;">
                            <tr>
        `;
        
        displayCols.forEach(h => {
            let extraStyle = '';
            if (h === 'ngay') {
                extraStyle = 'width: 95px;';
            } else if (result.tabName === 'GHI_CHU') {
                if (h === 'phan_loai') extraStyle = 'width: 15%;';
                if (h === 'tieu_de' || h === 'noi_dung') extraStyle = 'width: 42%;';
            } else if (result.tabName === 'HOC_HOI') {
                if (h === 'tag') extraStyle = 'width: 15%;';
                if (h === 'link') extraStyle = 'width: 10%;';
                if (h === 'tieu_de' || h === 'noi_dung') extraStyle = 'width: 37%;';
            } else if (result.tabName === 'CHI_TIEU') {
                if (h === 'loai_giao_dich') extraStyle = 'width: 10%;';
                if (h === 'tai_khoan' || h === 'tai_khoan_nhan') extraStyle = 'width: 12%;';
                if (h === 'so_tien' || h === 'so_du_ao') extraStyle = 'width: 12%;';
                if (h === 'hang_muc') extraStyle = 'width: 10%;';
                if (h === 'ghi_chu') extraStyle = 'width: 25%;';
            }
            tableHtml += `<th style="padding:10px; text-align:left; border-bottom:2px solid #e2e8f0; color:#64748b; font-weight:600; white-space:nowrap; text-transform:uppercase; ${extraStyle}">${h}</th>`;
        });
        tableHtml += `</tr></thead><tbody>`;
        
        pageData.forEach(row => {
            const sheetRow = row._sheetRow;
            const safeRow = JSON.stringify(row).replace(/'/g, "&#39;").replace(/"/g, "&quot;").replace(/\\n/g, "\\\\n").replace(/\\r/g, "");
            
            tableHtml += `<tr style="border-bottom:1px solid #f1f5f9; cursor:pointer;" class="table-row-hover" data-action="open-record-dash-dbl" data-tab-name="${result.tabName}" data-row="${sheetRow}">`;
            
            displayCols.forEach(h => {
                const idx = result.headers.indexOf(h);
                let cellVal = idx !== -1 && row[idx] !== undefined && row[idx] !== null ? row[idx] : '';
                
                if (h === 'anh' && result.tabName === 'HOC_HOI') {
                    if (cellVal && String(cellVal).startsWith('http')) {
                        cellVal = `<img src="${cellVal}" style="max-height: 40px; border-radius: 4px;">`;
                    }
                } else if (h === 'link' || h === 'file') {
                    if (cellVal && String(cellVal).startsWith('http')) {
                        cellVal = `<a href="${cellVal}" target="_blank" style="color:var(--primary);">[Link]</a>`;
                    }
                } else if (h === 'ngay') {
                    cellVal = `<div style="white-space:nowrap;">${cellVal}</div>`;
                } else if (h === 'so_tien' || h === 'so_du_ao') {
                    cellVal = `<div style="white-space:nowrap; text-align:right; font-weight:600;">${cellVal}</div>`;
                } else if (result.tabName === 'GHI_CHU' && h === 'tieu_de') {
                    cellVal = `<div style="overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; white-space:normal; line-height:1.4;">${cellVal}</div>`;
                } else {
                    if (String(cellVal).length > 50) {
                        cellVal = `<div class="line-clamp-2" style="overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; white-space:normal;">${cellVal}</div>`;
                    } else {
                        cellVal = `<div style="white-space:normal;">${cellVal}</div>`;
                    }
                }
                
                tableHtml += `<td style="padding:10px;">${cellVal}</td>`;
            });
            
            tableHtml += `</tr>`;
        });
        
        if (pageData.length === 0) {
            tableHtml += `<tr><td colspan="${displayCols.length}" style="padding:20px; text-align:center; color:#94a3b8;">Chưa có dữ liệu.</td></tr>`;
        }
        
        tableHtml += `</tbody></table></div>`;
        
        if (totalPages > 1) {
            tableHtml += `
                <div class="pagination" style="display:flex; justify-content:center; align-items:center; gap:15px; margin-top:20px; padding-top:10px; border-top:1px solid #e2e8f0;">
                    <button class="pagination-btn" data-action="change-dash-page" data-tab-name="${result.tabName}" data-val="-1" ${currentPage === 1 ? 'disabled' : ''}>Trước</button>
                    <span class="page-info">Trang ${currentPage} / ${totalPages}</span>
                    <button class="pagination-btn" data-action="change-dash-page" data-tab-name="${result.tabName}" data-val="1" ${currentPage === totalPages ? 'disabled' : ''}>Sau</button>
                </div>
            `;
        }
        
        tableHtml += `</div>`;
        html += tableHtml;
    });

    html += `</div>`;
    
    allDash.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}


function changeAllDashPage(tabName, delta) {
    if(!allDashPages[tabName]) allDashPages[tabName] = 1;
    allDashPages[tabName] += delta;
    renderAllDashTables();
}


