window.cachedData = window.cachedData || {};
const CONFIG = {
    spreadsheetId: "16eWBBZOcFzrpoU66r3Ma3DM5ngX7JqMPtXxasggyS-s",
    serviceAccountEmail: "test-gia-ason@api-test-sheet-161.iam.gserviceaccount.com",
    privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC3NN84hLTkQPZd
Lj7niXZTICq7nHsuTn3J6r2Paq12m70/lYSmrwh1i0EStr9bO19QM8cevGlslwGr
WSVOLJlc6+w1HGPKvRXtA41kYV9MYIvpzIPQtkFE7Hxq71QyBARcv39Lfzze6Ioj
3G8VBvAKFLAnCUr97GHRv+KbCTFxPZupd3PEB+xS5ZUlzdBCEZvDid3iXaaEJJ+l
Td1apAGQHjtnDTLOkiTa8zf7X5ebALwnI9MziOdN8VyprHXGhkachPbKyrG0QwEs
2jtiI6Y5ULsBPjNefoavH8MKU5DEAT9h0fZ7KfsKYVMDuXqmEKBs0D3B4Z6aDZQW
wT2dDRZDAgMBAAECggEAEIuVoSzZVuFhaz1GI9ji0IacjvO50cIq7M8Zrj4/F756
Ew6PIhKENafAb7U4INm2AnzUMO8CqL9Jpxs85qUM3W4JysSByqLUiRW2184amIyb
j7jCXfLBTQn8AbHgrUepl5d/vBmFYMgon/mqjbNiGDb4FZgEQSkie5o6fi/dWp5d
NahbZl+WTOB/znhAfKh/zferHNxldR/ERmwOubZUerkqysWiBigc3ovpLSUof9ur
z3hNPPp0CKQjF40xuQc6FYTHUHMLuMvp78PXuc/mYqQmZ8VOGhU+faGtZ4m+QJly
dF5dS8U5cwKEF+ptuAUiWSahn6INb9yKn3+FcsW0UQKBgQDb8N4eWFvbgpRo/vxo
wBN2u2TWubj6clcrq/1a+VR0njC28Can0ogJHhrFhPxVs5D/rugs3HlbyAXJFptY
V0DZPCwBxGU5P5RbGjXWWEUXjp4ISKQD8WKfVlXNr79TqLdOg2NZBYQAi06Cpo/T
PV9l7LSG2Tj/9WdvD7W2wvrpaQKBgQDVPjpJN6xh7+sHtSU0mjKvrqigpHbuSQ/o
XpUaWSIpJffm5QpFPAOcTT5mHZCyllicJQIrfPSY+sH8n+sF03CUqVkV4Q2UqfOf
pFaLDB4P6SQ8iesZyF4VKFrj/cAvRJmp0e5W/DRnFkoEp+8c+nrru2+Dzm9kb7Uq
0CiltqYAywKBgBtcfrV1to+7Ue0x84KwintV2rifyDRX7yI+tjkQFYKgf1zyyUxN
c6D2vsvdvGqI+TvlrXqPPwW8/4NBrbeyux2LT8o0fYc+sp0WyKXOu2Gv21caelUH
PYam/eultn6Y2Z0J2V0kw4Qx0GWOhQv5cZnDdb3k3iNxixmU8b03ynEpAoGBAKEA
7O0fNe50QRZ+tOq0ihSPYQ55XrqnO3WNBDLynZJH8pbI1CpWF7vJrpVXOUs9rQWo
A61mGR/wJMtiywaJEHWOL48PbzuR3jno0NcHfSMyOoPi9jlvSWncIFQH4TVPLF5F
/Rh8L+ytrZE6YpWUoX6e9KGmGgDRPw5mQGpuL4RlAoGADe9n080SXlsUk4nHVjUz
Efv7EBoBkgOpqb9T1foRfJl46NxmmTOYV3iGIhjwcDskEg284k4iq/gH6EEFyEBc
Vz13jzB1nBgjfezFesVQz7bA/+Wik6HZtxAxVg38BKMt+Q1tYw9wOjbGPqOn++VC
sR2Sh8e3h3Knd6j1tceRIFU=
-----END PRIVATE KEY-----`,
    tokenUrl: "https://oauth2.googleapis.com/token",
    tabs: {
        'GHI_CHU': {
            range: 'GHI_CHU!A2:L',
            headers: ['id', 'ngay', 'ngay_in', 'ngay_out', 'tieu_de', 'noi_dung', 'phan_loai', 'anh', 'trang_thai', 'dia_chi', 'map', 'bao_lau']
        },
        'CHI_TIEU': {
            range: 'CHI_TIEU!A2:J',
            headers: ['id', 'ngay', 'loai_giao_dich', 'tai_khoan', 'so_tien', 'hang_muc', 'tai_khoan_nhan', 'ghi_chu', 'so_du_ao', 'hashtag']
        },
        'CONG_VIEC': {
            range: 'CONG_VIEC!A2:O',
            headers: ['id', 'tieu_de', 'mo_ta', 'danh_muc', 'muc_uu_tien', 'trang_thai', 'ngay_bat_dau', 'deadline', 'ngay_hoan_thanh', 'tien_do', 'tag', 'ghi_chu', 'file_dinh_kem', 'link_lien_quan', 'lap_lai']
        },
        'HOC_HOI': {
            range: 'HOC_HOI!A2:H',
            headers: ['id', 'ngay', 'tieu_de', 'noi_dung', 'link', 'anh', 'file', 'tag']
        },
        'DSNV': {
            range: 'DSNV!A2:J',
            headers: ['id', 'ho_ten', 'hinh_anh', 'gioi_tinh', 'ngay_sinh', 'quyen', 'mk', 'udt', 'sdt', 'hashtag']
        }
    }
};

let globalAccountBalances = {};

function formatMoney(num) {
    if (!num && num !== 0) return '';
    return Number(num).toLocaleString('vi-VN');
}

function parseSheetDate(d) {
    if (!d) return 0;
    if (d.includes('/')) {
        const parts = d.split(' ')[0].split('/');
        if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
    }
    return new Date(d).getTime();
}

function calculateExpenseBalances() {
    if (currentTab !== 'CHI_TIEU') return;

    allData.sort((a, b) => {
        const dateDiff = parseSheetDate(a[1]) - parseSheetDate(b[1]);
        if (dateDiff !== 0) return dateDiff;
        return a._sheetRow - b._sheetRow;
    });
    globalAccountBalances = {};

    allData.forEach(row => {
        const type = row[2];
        const account = row[3];
        const amount = parseFloat(String(row[4]).replace(/,/g, '')) || 0;
        const targetAccount = row[6];

        if (account && !globalAccountBalances[account]) globalAccountBalances[account] = 0;

        if (type === 'Thu') {
            if (account) globalAccountBalances[account] += amount;
        } else if (type === 'Chi') {
            if (account) globalAccountBalances[account] -= amount;
        } else if (type === 'Chuyển khoản') {
            if (account) globalAccountBalances[account] -= amount;
            let targetBal = 0;
            if (targetAccount) {
                if (!globalAccountBalances[targetAccount]) globalAccountBalances[targetAccount] = 0;
                globalAccountBalances[targetAccount] += amount;
                targetBal = globalAccountBalances[targetAccount];
            }
            row[8] = account ? `${globalAccountBalances[account]}|${targetBal}` : '0|0';
        }
        if (type !== 'Chuyển khoản') {
            row[8] = account ? globalAccountBalances[account] : 0;
        }
    });

    allData.sort((a, b) => {
        const dateDiff = parseSheetDate(b[1]) - parseSheetDate(a[1]);
        if (dateDiff !== 0) return dateDiff;
        return b._sheetRow - a._sheetRow;
    });
}

function renderExpenseDashboard() {
    const dash = document.getElementById('expenseDashboard');
    if (!dash || currentTab !== 'CHI_TIEU') return;

    let periodIncome = 0;
    let periodExpense = 0;
    let categoryBalances = {};

    filteredData.forEach(row => {
        const type = row[2];
        const amount = parseFloat(String(row[4]).replace(/,/g, '')) || 0;
        const hangMuc = row[5];
        if (type === 'Thu') {
            periodIncome += amount;
            if (hangMuc && hangMuc.trim() !== '') {
                categoryBalances[hangMuc] = (categoryBalances[hangMuc] || 0) + amount;
            }
        }
        if (type === 'Chi') {
            periodExpense += amount;
            if (hangMuc && hangMuc.trim() !== '') {
                categoryBalances[hangMuc] = (categoryBalances[hangMuc] || 0) - amount;
            }
        }
    });

    let totalBalance = 0;
    
    for (const [acc, bal] of Object.entries(globalAccountBalances)) {
        const accLower = acc.toLowerCase();
        // Exclude Momo (ví trả sau) from Total Assets
        if (!accLower.includes('momo') && !accLower.includes('trả sau')) {
            totalBalance += bal;
        }
    }

    let topCards = `
        <div class="dashboard-card card-asset" style="flex-direction: row; justify-content: space-between; align-items: center;">
            <p class="card-title" style="margin: 0;">Tổng tài sản</p>
            <p class="amount" style="margin: 0;">${formatMoney(totalBalance)}</p>
        </div>
        <div class="dashboard-card card-income" style="flex-direction: row; justify-content: space-between; align-items: center;">
            <p class="card-title" style="margin: 0;">Tổng thu</p>
            <p class="amount positive" style="margin: 0;">+${formatMoney(periodIncome)}</p>
        </div>
        <div class="dashboard-card card-expense" style="flex-direction: row; justify-content: space-between; align-items: center;">
            <p class="card-title" style="margin: 0;">Tổng chi</p>
            <p class="amount negative" style="margin: 0;">-${formatMoney(periodExpense)}</p>
        </div>
    `;

    for (const [acc, bal] of Object.entries(globalAccountBalances)) {
        topCards += `
            <div class="dashboard-card" style="flex-direction: row; justify-content: space-between; align-items: center;">
                <p class="card-title" style="margin: 0;">${acc}</p>
                <p class="amount blue-text" style="margin: 0;">${formatMoney(bal)}</p>
            </div>
        `;
    }

    let categoryCards = '';
    for (const [cat, bal] of Object.entries(categoryBalances)) {
        if (bal === 0) continue; // Skip if net is 0
        const isIncome = bal > 0;
        const colorClass = isIncome ? 'positive' : 'negative';
        const displayBal = isIncome ? `+${formatMoney(bal)}` : formatMoney(bal);
        
        categoryCards += `
            <div class="dashboard-card" style="flex-direction: row; justify-content: space-between; align-items: center; padding: 12px 16px;">
                <p class="card-title" style="margin: 0; font-size: 0.72rem;">${cat}</p>
                <p class="amount ${colorClass}" style="margin: 0; font-size: 1.1rem;">${displayBal}</p>
            </div>
        `;
    }

    let dashHtml = `
        <div style="grid-column: 1 / -1; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">
            ${topCards}
        </div>
    `;
    
    if (categoryCards) {
        dashHtml += `
            <div style="grid-column: 1 / -1; margin-top: 12px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px;">
                    ${categoryCards}
                </div>
            </div>
        `;
    }

    dash.innerHTML = dashHtml;
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderTaskDashboard() {
    const dash = document.getElementById('taskDashboard');
    if (!dash || currentTab !== 'CONG_VIEC') return;

    let todayTasks = 0;
    let completedTasks = 0;
    let overdueTasks = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filteredData.forEach(row => {
        const status = row[5];
        const deadlineStr = row[7];

        todayTasks++;
        if (status === 'Hoàn thành') completedTasks++;

        if (deadlineStr && status !== 'Hoàn thành') {
            const dl = parseSheetDate(deadlineStr);
            if (dl > 0 && dl < today.getTime()) {
                overdueTasks++;
            }
        }
    });

    const completionRate = todayTasks > 0 ? Math.round((completedTasks / todayTasks) * 100) : 0;

    dash.innerHTML = `
        <div class="dashboard-card" style="background: #f8fafc; border-color: var(--primary);">
            <h3 style="color: var(--primary);">Tổng Công Việc</h3>
            <p class="amount" style="color: var(--primary);">${todayTasks}</p>
        </div>
        <div class="dashboard-card">
            <h3>Hoàn thành</h3>
            <p class="amount positive">${completedTasks} <span style="font-size: 14px; color:#64748b;">(${completionRate}%)</span></p>
        </div>
        <div class="dashboard-card">
            <h3>Quá hạn</h3>
            <p class="amount negative">${overdueTasks}</p>
        </div>
    `;
}


let currentTab = 'GHI_CHU', allData = [], accessToken = null, tokenExpiry = 0;
let filteredData = [];
let editingSheetRow = null;
let currentPage = 1;
const rowsPerPage = 100;
let activePhanLoaiFilter = null;
let activeExpenseFilters = {};
let activeTaskFilters = {};
let mapInstance = null, mapMarker = null;

async function getAccessToken() {
    if (accessToken && Date.now() < tokenExpiry - 300000) return accessToken;
    const header = { alg: "RS256", typ: "JWT" }, now = Math.floor(Date.now() / 1000),
        payload = { iss: CONFIG.serviceAccountEmail, scope: "https://www.googleapis.com/auth/spreadsheets", aud: CONFIG.tokenUrl, exp: now + 3600, iat: now };
    const sJWT = KJUR.jws.JWS.sign("RS256", JSON.stringify(header), JSON.stringify(payload), CONFIG.privateKey);
    const res = await fetch(CONFIG.tokenUrl, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${sJWT}` });
    const data = await res.json();
    accessToken = data.access_token; tokenExpiry = Date.now() + (data.expires_in * 1000);
    return accessToken;
}

function toggleSidebar() {
    document.body.classList.toggle('sidebar-collapsed');
    const icon = document.querySelector('.sidebar-toggle i');
    if (icon) {
        icon.setAttribute('data-lucide', document.body.classList.contains('sidebar-collapsed') ? 'panel-left-open' : 'panel-left-close');
        lucide.createIcons();
    }
}

async function switchTab(tabName) {
    currentView = tabName;
    if (tabName === 'HOM_NAY' || tabName === 'LICH') {
        currentTab = 'CONG_VIEC';
    } else if (tabName === 'THEM') {
        currentTab = '';
    } else if (tabName === 'TAT_CA') {
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
    const tableWrap = document.getElementById('tableWrapper');
    const pagination = document.getElementById('pagination');
    const phanLoaiFilterContainer = document.getElementById('phanLoaiFilterContainer');
    const searchInput = document.querySelector('.search-container');
    const dateFilters = document.getElementById('dateFilterContainer');

    if (expDash) expDash.style.display = currentView === 'CHI_TIEU' ? 'grid' : 'none';
    if (taskDash) taskDash.style.display = currentView === 'CONG_VIEC' ? 'grid' : 'none';
    if (todayDash) todayDash.style.display = currentView === 'HOM_NAY' ? 'block' : 'none';
    if (calDash) calDash.style.display = currentView === 'LICH' ? 'block' : 'none';
    
    const viewToggleBtn = document.getElementById('viewToggleBtn');
    if (viewToggleBtn) viewToggleBtn.style.display = currentView === 'CONG_VIEC' ? 'inline-flex' : 'none';
    
    const quickAddDash = document.getElementById('quickAddDashboard');
    if (quickAddDash) quickAddDash.style.display = currentView === 'THEM' ? 'flex' : 'none';

    const allDash = document.getElementById('allDashboard');
    if (allDash) allDash.style.display = currentView === 'TAT_CA' ? 'flex' : 'none';

    if(!currentTab && currentView !== 'THEM' && currentView !== 'TAT_CA') {
        if(tableWrap) tableWrap.style.display = 'none';
        if(pagination) pagination.style.display = 'none';
        return;
    }
    
    if (currentView === 'HOM_NAY' || currentView === 'LICH' || currentView === 'THEM' || currentView === 'TAT_CA') {
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
        }
    } else {
        if(tableWrap) tableWrap.style.display = 'block';
        if(pagination) pagination.style.display = 'flex';
        if(phanLoaiFilterContainer) phanLoaiFilterContainer.style.display = 'flex';
        if(searchInput) searchInput.style.display = 'flex';
        if(dateFilters) dateFilters.style.display = 'flex';
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

async function fetchData(forceReload = false) {
    if (!currentTab) return;
    
    if (!forceReload && window.cachedData[currentTab]) {
        allData = window.cachedData[currentTab];
        if (currentTab === 'CHI_TIEU') {
            calculateExpenseBalances();
        } else if (currentTab === 'CONG_VIEC') {
            allData.sort((a, b) => {
                const dateA = parseSheetDate(a[7]);
                const dateB = parseSheetDate(b[7]);
                if (dateA !== dateB && dateA !== 0 && dateB !== 0) return dateA - dateB;
                return b._sheetRow - a._sheetRow;
            });
        } else {
            allData.sort((a, b) => {
                const dateDiff = parseSheetDate(b[1]) - parseSheetDate(a[1]);
                if (dateDiff !== 0) return dateDiff;
                return b._sheetRow - a._sheetRow;
            });
        }
        filteredData = [...allData];
        currentPage = 1;
        document.getElementById('loading').style.display = 'none';
        dispatchViewRender();
        return;
    }
    
    document.getElementById('loading').style.display = 'flex';
    try {
        const token = await getAccessToken();
        const tabConfig = CONFIG.tabs[currentTab];
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${tabConfig.range}`, { 
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store'
        });
        const rawData = await res.json();
        allData = (rawData.values || []).map((row, i) => {
            const arr = [...row];
            arr._sheetRow = i + 2;
            return arr;
        });
        if (currentTab === 'CHI_TIEU') {
            calculateExpenseBalances();
        } else if (currentTab === 'CONG_VIEC') {
            allData.sort((a, b) => {
                const dateA = parseSheetDate(a[7]); // deadline
                const dateB = parseSheetDate(b[7]);
                if (dateA !== dateB && dateA !== 0 && dateB !== 0) return dateA - dateB;
                return b._sheetRow - a._sheetRow;
            });
        } else {
            allData.sort((a, b) => {
                const dateDiff = parseSheetDate(b[1]) - parseSheetDate(a[1]);
                if (dateDiff !== 0) return dateDiff;
                return b._sheetRow - a._sheetRow;
            });
        }
        window.cachedData[currentTab] = allData;
        
        if (typeof filterTable === 'function') {
            filterTable();
        } else {
            filteredData = [...allData];
            currentPage = 1;
            dispatchViewRender();
        }
    } catch (e) {
        console.error("Lỗi khi tải dữ liệu:", e);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

function openRecordForm(rowData = null, sheetRow = null) {
    if (!currentTab) return;
    const tabConfig = CONFIG.tabs[currentTab];
    const fieldsDiv = document.getElementById('formFields');
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const formattedNow = (new Date(Date.now() - offset)).toISOString().slice(0, 16); // YYYY-MM-DDThh:mm

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
                <input type="text" id="input_${h}" name="${h}" value="${val}" placeholder="Kinh độ, Vĩ độ..." style="flex-grow:1;" onchange="updateMapFromInput()">
                <button type="button" class="tag-btn" onclick="getLocation()" style="white-space:nowrap; background:#e0f2fe; color:#0369a1; border-color:#bae6fd;">Lấy vị trí</button>
            </div>
            <div id="mapPreview" style="width:100%; height:250px; margin-top:8px; border-radius:8px; border:1px solid #ccc;"></div>`;
        } else if (h === 'ngay') {
            inputHtml = `
            <div style="display:flex; gap:5px;">
                <button type="button" class="tag-btn" onclick="adjustDateInput('input_${h}', -1)" style="padding:4px 8px;">-</button>
                <input type="date" id="input_${h}" name="${h}" value="${val || formattedNow.slice(0, 10)}" style="flex-grow:1;">
                <button type="button" class="tag-btn" onclick="adjustDateInput('input_${h}', 1)" style="padding:4px 8px;">+</button>
            </div>`;
        } else if (h === 'ngay_in') {
            inputHtml = `
            <div style="display:flex; gap:5px;">
                <button type="button" class="tag-btn" onclick="adjustDateInput('input_${h}', -1)" style="padding:4px 8px;">-</button>
                <input type="datetime-local" id="input_${h}" name="${h}" value="${val || formattedNow}" style="flex-grow:1;">
                <button type="button" class="tag-btn" onclick="adjustDateInput('input_${h}', 1)" style="padding:4px 8px;">+</button>
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
                <button type="button" class="tag-btn" onclick="adjustDateInput('input_${h}', -1)" style="padding:4px 8px;">-</button>
                <input type="datetime-local" id="input_${h}" name="${h}" value="${outVal}" style="flex-grow:1;">
                <button type="button" class="tag-btn" onclick="adjustDateInput('input_${h}', 1)" style="padding:4px 8px;">+</button>
                <button type="button" class="tag-btn" onclick="setNgayOutPlus30()" style="white-space:nowrap; background:#e0f2fe; color:#0369a1; border-color:#bae6fd;">+30p từ IN</button>
            </div>`;
        } else if (h === 'phan_loai') {
            const colIndex = tabConfig.headers.indexOf('phan_loai');
            const existingTags = new Set(allData.map(row => row[colIndex]).filter(v => v && typeof v === 'string' && v.trim() !== ''));
            ['Ghi chú', 'Sự kiện', 'Ảnh'].forEach(t => existingTags.add(t)); // Add default tags

            const tagsHtml = Array.from(existingTags).map(t =>
                `<button type="button" class="tag-btn" onclick="document.getElementById('input_phan_loai').value='${t.replace(/'/g, "&#39;")}'">${t}</button>`
            ).join('');

            inputHtml = `
                <input type="text" id="input_${h}" name="${h}" value="${val}" placeholder="Nhập hoặc chọn phân loại...">
                <div class="tag-buttons" style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">${tagsHtml}</div>
            `;
        } else if (h === 'tag' && currentTab === 'HOC_HOI') {
            const colIndex = tabConfig.headers.indexOf('tag');
            const allTags = allData.map(row => row[colIndex]).filter(v => v && typeof v === 'string' && v.trim() !== '').flatMap(v => v.split(',').map(s => s.trim()));
            const existingTags = new Set(allTags);
            ['Lập trình', 'Thiết kế', 'Công cụ', 'Bài viết hay'].forEach(t => existingTags.add(t));

            const tagsHtml = Array.from(existingTags).map(t =>
                `<button type="button" class="tag-btn" onclick="const input = document.getElementById('input_${h}'); const currentVals = input.value.split(',').map(s => s.trim()).filter(s => s); if(!currentVals.includes('${t.replace(/'/g, "&#39;")}')) { currentVals.push('${t.replace(/'/g, "&#39;")}'); input.value = currentVals.join(', '); }">${t}</button>`
            ).join('');

            inputHtml = `
                <input type="text" id="input_${h}" name="${h}" value="${val}" placeholder="Nhập hoặc chọn nhiều tag (cách nhau bởi dấu phẩy)...">
                <div class="tag-buttons" style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">${tagsHtml}</div>
            `;
        } else if (h === 'noi_dung') {
            inputHtml = `<textarea id="input_${h}" name="${h}" placeholder="Nhập ${h}..." rows="3">${val}</textarea>`;
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
        } else if (currentTab === 'CONG_VIEC' && ['mo_ta', 'ghi_chu'].includes(h)) {
            inputHtml = `<textarea id="input_${h}" name="${h}" placeholder="Nhập ${h}..." rows="3">${val}</textarea>`;
        } else if (currentTab === 'CONG_VIEC' && ['muc_uu_tien', 'trang_thai', 'danh_muc'].includes(h)) {
            const opts = h === 'muc_uu_tien' ? ['Cao', 'Trung bình', 'Thấp'] :
                h === 'trang_thai' ? ['Chưa làm', 'Đang làm', 'Hoàn thành', 'Tạm dừng'] :
                    ['Công việc', 'Cá nhân', 'Gia đình', 'Học tập', 'Khác'];
            const tagsHtml = opts.map(o =>
                `<button type="button" class="tag-btn" onclick="document.getElementById('input_${h}').value='${o}'">${o}</button>`
            ).join('');
            inputHtml = `
                <input type="text" id="input_${h}" name="${h}" value="${val}" placeholder="Nhập ${h}...">
                <div class="tag-buttons" style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">${tagsHtml}</div>
            `;
        } else if (currentTab === 'CONG_VIEC' && ['ngay_bat_dau', 'deadline', 'ngay_hoan_thanh'].includes(h)) {
            let dateVal = val;
            if (val && String(val).includes('/')) {
                const parts = String(val).split(' ');
                const [dd, mm, yyyy] = parts[0].split('/');
                dateVal = `${yyyy}-${mm}-${dd}T${parts[1] || '00:00'}`;
            } else if (!isEdit && !val) {
                const localNow = new Date();
                if (h === 'ngay_bat_dau') {
                    dateVal = new Date(localNow.getTime() - localNow.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                } else if (h === 'deadline') {
                    localNow.setHours(localNow.getHours() + 1);
                    dateVal = new Date(localNow.getTime() - localNow.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                }
            }
            inputHtml = `
                <div style="display:flex; gap:5px;">
                    <button type="button" class="tag-btn" onclick="adjustDateInput('input_${h}', -1)" style="padding:4px 8px;">-</button>
                    <input type="datetime-local" id="input_${h}" name="${h}" value="${dateVal}" style="flex-grow:1;">
                    <button type="button" class="tag-btn" onclick="adjustDateInput('input_${h}', 1)" style="padding:4px 8px;">+</button>
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
        }
        return `<div class="form-group"><label>${h.toUpperCase()}</label>${inputHtml}</div>`;
    }).join('');

    document.getElementById('productModal').style.display = 'flex';
    if (typeof lucide !== 'undefined') lucide.createIcons();

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

function setNgayOutPlus30() {
    const ngayInInput = document.getElementById('input_ngay_in');
    const ngayOutInput = document.getElementById('input_ngay_out');
    if (ngayInInput && ngayOutInput && ngayInInput.value) {
        const inDate = new Date(ngayInInput.value);
        inDate.setMinutes(inDate.getMinutes() + 30);
        const localOffset = inDate.getTimezoneOffset() * 60000;
        ngayOutInput.value = new Date(inDate.getTime() - localOffset).toISOString().slice(0, 16);
    }
}

function updateMapFromInput() {
    const val = document.getElementById('input_map').value;
    if (val && val.includes(',') && mapInstance) {
        const parts = val.split(',');
        const lat = parseFloat(parts[0].trim());
        const lng = parseFloat(parts[1].trim());
        if (!isNaN(lat) && !isNaN(lng)) {
            mapInstance.setView([lat, lng], 16);
            if (mapMarker) {
                mapMarker.setLatLng([lat, lng]);
            } else {
                const redIcon = L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
                });
                mapMarker = L.marker([lat, lng], { icon: redIcon, draggable: true }).addTo(mapInstance);
                mapMarker.on('dragend', function (e) {
                    const position = mapMarker.getLatLng();
                    document.getElementById('input_map').value = `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;
                });
            }
        }
    }
}

function initMapPicker(initialValue) {
    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
        mapMarker = null;
    }
    const container = document.getElementById('mapPreview');
    if (!container) return;

    let lat = 21.028511, lng = 105.804817;
    if (initialValue && initialValue.includes(',')) {
        const parts = initialValue.split(',');
        lat = parseFloat(parts[0].trim());
        lng = parseFloat(parts[1].trim());
    }

    mapInstance = L.map('mapPreview').setView([lat, lng], 15);
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        attribution: 'Google'
    }).addTo(mapInstance);

    const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    if (initialValue && !isNaN(lat) && !isNaN(lng)) {
        mapMarker = L.marker([lat, lng], { icon: redIcon, draggable: true }).addTo(mapInstance);
        mapMarker.on('dragend', function (e) {
            const position = mapMarker.getLatLng();
            document.getElementById('input_map').value = `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;
        });
    }

    mapInstance.on('click', function (e) {
        const clat = e.latlng.lat.toFixed(6);
        const clng = e.latlng.lng.toFixed(6);
        document.getElementById('input_map').value = `${clat}, ${clng}`;
        if (mapMarker) {
            mapMarker.setLatLng(e.latlng);
        } else {
            mapMarker = L.marker(e.latlng, { icon: redIcon, draggable: true }).addTo(mapInstance);
            mapMarker.on('dragend', function (ev) {
                const pos = mapMarker.getLatLng();
                document.getElementById('input_map').value = `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`;
            });
        }
    });
}

// Kanban Logic
let taskViewMode = 'table'; // 'table' or 'kanban'

function toggleTaskView() {
    taskViewMode = taskViewMode === 'table' ? 'kanban' : 'table';
    const btn = document.getElementById('viewToggleBtn');
    if (btn) {
        btn.innerHTML = taskViewMode === 'table' ? '<i data-lucide="layout-dashboard" style="width:16px; margin-right:4px;"></i> Kanban' : '<i data-lucide="table" style="width:16px; margin-right:4px;"></i> Table';
        lucide.createIcons();
    }
    renderTaskView();
}

function renderTaskView() {
    const tableWrap = document.getElementById('tableWrapper');
    const pagination = document.getElementById('pagination');
    const kanbanDash = document.getElementById('kanbanDashboard');
    
    if (!kanbanDash || currentTab !== 'CONG_VIEC') return;

    if (taskViewMode === 'table') {
        kanbanDash.style.display = 'none';
        tableWrap.style.display = 'block';
        if (pagination) pagination.style.display = 'flex';
        renderTable();
    } else {
        tableWrap.style.display = 'none';
        if (pagination) pagination.style.display = 'none';
        kanbanDash.style.display = 'flex';
        renderKanban();
    }
}

function renderKanban() {
    const kanbanDash = document.getElementById('kanbanDashboard');
    if (!kanbanDash) return;

    const statuses = ['Chưa làm', 'Đang làm', 'Hoàn thành', 'Tạm dừng'];
    const tasksByStatus = {
        'Chưa làm': [],
        'Đang làm': [],
        'Hoàn thành': [],
        'Tạm dừng': []
    };

    filteredData.forEach(row => {
        const status = row[5] || 'Chưa làm';
        if (tasksByStatus[status]) {
            tasksByStatus[status].push(row);
        } else {
            tasksByStatus['Chưa làm'].push(row); // fallback
        }
    });

    let kanbanHtml = '';
    statuses.forEach(status => {
        const tasks = tasksByStatus[status];
        
        let headerColor = '#64748b'; // default
        if (status === 'Đang làm') headerColor = '#3b82f6';
        if (status === 'Hoàn thành') headerColor = '#10b981';
        if (status === 'Tạm dừng') headerColor = '#f59e0b';

        kanbanHtml += `
            <div class="kanban-column" style="background: #f1f5f9; border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 12px; flex: 1; min-width: 250px;" ondragover="allowDrop(event)" ondrop="dropTask(event, '${status}')">
                <div style="font-weight: 800; color: ${headerColor}; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; display:flex; justify-content:space-between;">
                    ${status} <span style="background:#e2e8f0; color:#475569; padding:2px 8px; border-radius:12px; font-size:0.8rem;">${tasks.length}</span>
                </div>
                <div class="kanban-cards" style="display: flex; flex-direction: column; gap: 10px; overflow-y:auto; max-height: 60vh;">
                    ${tasks.map(t => {
                        const priority = t[4];
                        let pClass = 'badge-gray';
                        if(priority === 'Cao') pClass = 'badge-red';
                        if(priority === 'Trung bình') pClass = 'badge-yellow';
                        if(priority === 'Thấp') pClass = 'badge-green';

                        return `
                        <div class="task-card" style="margin: 0; cursor: grab; padding: 12px;" draggable="true" ondragstart="dragStart(event, ${t._sheetRow})" ondblclick='openRecordForm(${JSON.stringify(t).replace(/'/g, "&#39;")}, ${t._sheetRow})'>
                            <div style="font-weight: 700; margin-bottom: 6px; font-size: 0.95rem;">${t[1]}</div>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span class="task-card-badge ${pClass}">${priority || 'Không mức độ'}</span>
                                <span style="font-size:0.75rem; color:#64748b; font-weight:600;">${t[7] || ''}</span>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        `;
    });

    kanbanDash.style.gap = '16px';
    kanbanDash.style.overflowX = 'auto';
    kanbanDash.innerHTML = kanbanHtml;
}

function getLocation() {
    if (navigator.geolocation) {
        document.getElementById('input_map').placeholder = "Đang lấy vị trí...";
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(6);
                const lng = position.coords.longitude.toFixed(6);
                document.getElementById('input_map').value = `${lat}, ${lng}`;
                updateMapFromInput();
            },
            (error) => {
                alert("Không thể lấy vị trí: " + error.message);
                document.getElementById('input_map').placeholder = "Kinh độ, Vĩ độ...";
            }
        );
    } else {
        alert("Trình duyệt không hỗ trợ Geolocation.");
    }
}

function closeProductForm() {
    document.getElementById('productModal').style.display = 'none';
}

async function saveRecordFromForm(e) {
    e.preventDefault();
    if (!currentTab) return;

    document.getElementById('loading').style.display = 'flex';
    document.getElementById('loading').querySelector('p').innerText = 'Đang lưu dữ liệu...';
    try {
        const tabConfig = CONFIG.tabs[currentTab];
        const token = await getAccessToken();

        // Generate a simple ID
        const newId = 'ID-' + Date.now();

        const rowData = [];
        tabConfig.headers.forEach((h, idx) => {
            if (h === 'bao_lau' || h === 'so_du_ao') {
                rowData.push(null); // Push null to ignore cell and maintain array formulas
                return;
            }

            if (h === 'id') {
                const existingId = document.getElementById(`input_${h}`)?.value;
                rowData.push(existingId || newId);
                return;
            }

            let val = document.getElementById(`input_${h}`) ? document.getElementById(`input_${h}`).value : '';

            // Format to DD/MM/YYYY
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

            rowData.push(val);
        });

        let res;
        if (editingSheetRow) {
            // Update
            const endCol = String.fromCharCode(65 + rowData.length - 1);
            res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${currentTab}!A${editingSheetRow}:${endCol}${editingSheetRow}?valueInputOption=RAW`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: [rowData]
                })
            });
        } else {
            // Append
            res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${currentTab}!A2:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: [rowData]
                })
            });
        }

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error?.message || "Lỗi khi lưu dữ liệu");
        }

        closeProductForm();
        window.cachedData[currentTab] = null; // Invalidate cache before reloading
        if (currentView === 'TAT_CA') {
            currentTab = '';
            await renderAllDashboard();
        } else {
            await fetchData(true);
        }
    } catch (err) {
        console.error(err);
        alert("Lưu thất bại: " + err.message);
        document.getElementById('loading').style.display = 'none';
    }
}

function renderHeaders() {
    const head = document.getElementById('tableHead');
    if (!CONFIG.tabs[currentTab]) return;
    let hiddenCols = ['trang_thai', 'dia_chi', 'map'];
    if (currentTab !== 'HOC_HOI' && currentTab !== 'CONG_VIEC') hiddenCols.push('anh');
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
            if (h === 'mo_ta' || h === 'ghi_chu' || h === 'file_dinh_kem' || h === 'link_lien_quan') return '';
            if (h === 'tieu_de') style = 'style="width: auto;"';
            else style = 'style="white-space: nowrap; width: 10%;"';
        }
        return `<th ${style}>${h.toUpperCase()}</th>`;
    }).join('');
    head.innerHTML = `<tr><th style="width: 40px; text-align: center;"><input type="checkbox" id="selectAll" onclick="toggleSelectAll()"></th>${ths}</tr>`;
}

function renderTable() {
    const body = document.getElementById('tableBody');
    const tabConfig = CONFIG.tabs[currentTab];
    if (!tabConfig) return;

    let hiddenCols = ['trang_thai', 'dia_chi', 'map'];
    if (currentTab !== 'HOC_HOI' && currentTab !== 'CONG_VIEC') hiddenCols.push('anh');
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
            <div class="transaction-card" onclick='openRecordForm(${rowJson}, ${sheetRow})' style="display:flex; align-items:center; justify-content:space-between; background:white; padding:12px; border-radius:16px; margin-bottom:10px; box-shadow:0 1px 3px rgba(0,0,0,0.05); cursor:pointer;">
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
        
        body.innerHTML = pageData.map((row) => {
            const sheetRow = row._sheetRow;
            const rowJson = JSON.stringify(row).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
            return `<tr ondblclick='openRecordForm(${rowJson}, ${sheetRow})'>
                <td style="text-align: center;" ondblclick="event.stopPropagation()"><input type="checkbox" class="row-checkbox" data-index="${sheetRow}" onclick="handleRowCheckbox()"></td>
                ${tabConfig.headers.map((h, i) => {
                if (i === 0 || hiddenCols.includes(h)) return '';

                let cellVal = row[i] || '';
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
                    if (h === 'mo_ta' || h === 'ghi_chu' || h === 'file_dinh_kem' || h === 'link_lien_quan') return ''; // skip rendering these long columns

                    if (h === 'muc_uu_tien') {
                        if (cellVal === 'Cao') cellVal = '<span style="color:#ef4444; font-weight:bold;">Cao</span>';
                        else if (cellVal === 'Trung bình') cellVal = '<span style="color:#f59e0b; font-weight:bold;">Trung bình</span>';
                        else if (cellVal === 'Thấp') cellVal = '<span style="color:#10b981; font-weight:bold;">Thấp</span>';
                    } else if (h === 'trang_thai') {
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
                    if (h === 'link' || h === 'file') {
                        if (cellVal && cellVal.startsWith('http')) {
                            cellVal = `<a href="${cellVal}" target="_blank" style="color:var(--primary); text-decoration:underline; font-weight:bold;">[Mở Link]</a>`;
                        }
                    } else if (h === 'anh') {
                        if (cellVal && cellVal.startsWith('http')) {
                            cellVal = `<img src="${cellVal}" style="max-height: 50px; max-width: 50px; border-radius: 4px; object-fit: cover;">`;
                        }
                    } else if (h === 'tieu_de' || h === 'noi_dung') {
                        if (cellVal) {
                            const escapedVal = String(cellVal).replace(/'/g, "&#39;").replace(/"/g, "&quot;").replace(/\n/g, "\\n").replace(/\r/g, "");
                            cellVal = `<div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                                <div class="line-clamp-3" style="flex-grow:1;">${cellVal}</div>
                                <button type="button" onclick="copyToClipboard('${escapedVal}', event)" style="background:transparent; border:none; cursor:pointer; color:#64748b; padding:4px; flex-shrink:0; display:flex; align-items:center; justify-content:center; border-radius:4px;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'" title="Sao chép">
                                    <i data-lucide="copy" style="width:14px; height:14px;"></i>
                                </button>
                            </div>`;
                            return `<td ${tdStyle}>${cellVal}</td>`;
                        }
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

function copyToClipboard(text, event) {
    if (event) {
        event.stopPropagation();
    }
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.currentTarget;
        if (btn) {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i data-lucide="check" style="width:14px; height:14px; color:#10b981;"></i>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }, 1500);
        }
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
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
        <button class="pagination-btn" onclick="changePage(-1)" ${currentPage === 1 ? 'disabled' : ''}>Trước</button>
        <span class="page-info">Trang ${currentPage} / ${totalPages}</span>
        <button class="pagination-btn" onclick="changePage(1)" ${currentPage === totalPages ? 'disabled' : ''}>Sau</button>
    `;
}

function changePage(delta) {
    currentPage += delta;
    renderTable();
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
                dateCols = tabConfig.headers.map((h, i) => ['ngay', 'ngay_in', 'ngay_out', 'ngay_bat_dau', 'deadline', 'ngay_hoan_thanh'].includes(h) ? i : -1).filter(i => i !== -1);
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
        if (activePhanLoaiFilter && currentTab === 'GHI_CHU') {
            const colIndex = CONFIG.tabs[currentTab].headers.indexOf('phan_loai');
            phanLoaiMatch = row[colIndex] === activePhanLoaiFilter;
        } else if (activePhanLoaiFilter && currentTab === 'HOC_HOI') {
            const colIndex = CONFIG.tabs[currentTab].headers.indexOf('tag');
            if (colIndex !== -1) {
                const tags = String(row[colIndex] || '').split(',').map(s => s.trim());
                phanLoaiMatch = tags.includes(activePhanLoaiFilter);
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

        let html = `<button class="tag-btn ${!activePhanLoaiFilter ? 'active' : ''}" onclick="setPhanLoaiFilter(null)" style="border-radius: 20px; font-weight:bold; ${!activePhanLoaiFilter ? 'background-color: var(--primary); color: white;' : ''}">Tất cả</button>`;

        Array.from(existingTags).forEach(t => {
            const isActive = activePhanLoaiFilter === t;
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
            btnHtml += `<button class="tag-btn ${!activeVal ? 'active' : ''}" onclick="setExpenseFilter('${col}', '')" style="padding:4px 8px; font-size:12px; border-radius:12px; ${!activeVal ? 'background-color: var(--primary); color: white;' : ''}">Tất cả</button>`;

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
        const colsToFilter = ['danh_muc', 'muc_uu_tien', 'trang_thai', 'tag'];
        let html = '';
        colsToFilter.forEach(col => {
            const colIndex = tabConfig.headers.indexOf(col);
            if (colIndex === -1) return;
            const existingVals = new Set(allData.map(row => row[colIndex]).filter(v => v && typeof v === 'string' && v.trim() !== ''));
            const activeVal = activeTaskFilters[col] || '';

            let btnHtml = `<div style="display:flex; align-items:center; gap:5px; flex-wrap:wrap; border-right:1px solid #e2e8f0; padding-right:10px;">`;
            btnHtml += `<span style="font-size:12px; color:#64748b; font-weight:600;">${col.toUpperCase()}:</span>`;
            btnHtml += `<button class="tag-btn ${!activeVal ? 'active' : ''}" onclick="setTaskFilter('${col}', '')" style="padding:4px 8px; font-size:12px; border-radius:12px; ${!activeVal ? 'background-color: var(--primary); color: white;' : ''}">Tất cả</button>`;

            Array.from(existingVals).forEach(v => {
                const isActive = activeVal === v;
                const style = isActive ? 'background-color: var(--primary); color: white;' : '';
                btnHtml += `<button class="tag-btn ${isActive ? 'active' : ''}" onclick="setTaskFilter('${col}', '${v.replace(/'/g, "\\'")}')" style="padding:4px 8px; font-size:12px; border-radius:12px; ${style}">${v}</button>`;
            });
            btnHtml += `</div>`;
            html += btnHtml;
        });
        container.innerHTML = `<div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:10px;">${html}</div>`;
    } else if (currentTab === 'HOC_HOI') {
        const tabConfig = CONFIG.tabs[currentTab];
        const colIndex = tabConfig.headers.indexOf('tag');
        if (colIndex !== -1) {
            const allTags = allData.map(row => row[colIndex]).filter(v => v && typeof v === 'string' && v.trim() !== '').flatMap(v => v.split(',').map(s => s.trim()));
            const existingVals = new Set(allTags);
            const activeVal = activePhanLoaiFilter || '';

            let btnHtml = `<div style="display:flex; align-items:center; gap:5px; flex-wrap:wrap;">`;
            btnHtml += `<span style="font-size:12px; color:#64748b; font-weight:600;">TAG:</span>`;
            btnHtml += `<button class="tag-btn ${!activeVal ? 'active' : ''}" onclick="setPhanLoaiFilter('')" style="padding:4px 8px; font-size:12px; border-radius:12px; ${!activeVal ? 'background-color: var(--primary); color: white;' : ''}">Tất cả</button>`;

            Array.from(existingVals).forEach(v => {
                const isActive = activeVal === v;
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

function setTaskFilter(col, val) {
    if (val) activeTaskFilters[col] = val;
    else delete activeTaskFilters[col];
    renderTabFilters();
    filterTable();
}

function setExpenseFilter(col, val) {
    if (val) activeExpenseFilters[col] = val;
    else delete activeExpenseFilters[col];
    renderTabFilters();
    filterTable();
}

function setPhanLoaiFilter(tag) {
    activePhanLoaiFilter = tag;
    renderTabFilters();
    filterTable();
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

function adjustDateInput(id, delta) {
    const el = document.getElementById(id);
    if (!el || !el.value) return;
    const d = new Date(el.value);
    d.setDate(d.getDate() + delta);
    if (el.type === 'date') {
        el.value = d.toISOString().slice(0, 10);
    } else {
        const offset = d.getTimezoneOffset() * 60000;
        el.value = (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
    }
    el.dispatchEvent(new Event('change'));
}

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    document.getElementById('loading').style.display = 'none';
    switchTab(currentTab);

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
function toggleSelectAll() {
    const isChecked = document.getElementById('selectAll').checked;
    const checkboxes = document.querySelectorAll('.row-checkbox');
    checkboxes.forEach(cb => cb.checked = isChecked);
    updateBatchButtons();
}

function handleRowCheckbox() {
    updateBatchButtons();
}

function updateBatchButtons() {
    const checkedCount = document.querySelectorAll('.row-checkbox:checked').length;
    const editBtn = document.getElementById('batchEditPhanLoaiBtn');
    const delBtn = document.getElementById('batchDeleteBtn');
    if (editBtn && delBtn) {
        if (checkedCount > 0) {
            editBtn.style.display = currentTab === 'GHI_CHU' ? 'inline-block' : 'none';
            delBtn.style.display = 'inline-block';
        } else {
            editBtn.style.display = 'none';
            delBtn.style.display = 'none';
            const selectAll = document.getElementById('selectAll');
            if (selectAll) selectAll.checked = false;
        }
    }
}

async function getSheetId(tabName) {
    const token = await getAccessToken();
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const sheet = data.sheets.find(s => s.properties.title === tabName);
    return sheet ? sheet.properties.sheetId : null;
}

async function batchDelete() {
    const checkboxes = document.querySelectorAll('.row-checkbox:checked');
    if (checkboxes.length === 0) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa ${checkboxes.length} dòng đã chọn?`)) return;

    document.getElementById('loading').style.display = 'flex';
    try {
        const sheetId = await getSheetId(currentTab);
        if (sheetId === null) throw new Error("Không tìm thấy ID của tab hiện tại.");

        const token = await getAccessToken();

        // Sort sheetRows in descending order so deleting doesn't shift the indices below them
        const rowsToDelete = Array.from(checkboxes)
            .map(cb => parseInt(cb.getAttribute('data-index')))
            .sort((a, b) => b - a);

        const requests = rowsToDelete.map(rowIndex => ({
            deleteDimension: {
                range: {
                    sheetId: sheetId,
                    dimension: 'ROWS',
                    startIndex: rowIndex - 1, // 0-indexed, inclusive
                    endIndex: rowIndex        // exclusive
                }
            }
        }));

        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}:batchUpdate`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ requests })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error?.message || "Lỗi khi xóa");
        }

        await fetchData(true); // Reload data
    } catch (e) {
        console.error(e);
        alert("Lỗi: " + e.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

function openBatchEditPhanLoai() {
    const checkboxes = document.querySelectorAll('.row-checkbox:checked');
    if (checkboxes.length === 0) return;

    const tabConfig = CONFIG.tabs[currentTab];
    const colIndex = tabConfig.headers.indexOf('phan_loai');
    const existingTags = new Set(allData.map(row => row[colIndex]).filter(v => v && typeof v === 'string' && v.trim() !== ''));
    ['Ghi chú', 'Sự kiện', 'Ảnh'].forEach(t => existingTags.add(t)); // Add default tags

    const tagsHtml = Array.from(existingTags).map(t =>
        `<button type="button" class="tag-btn" onclick="document.getElementById('batchEditPhanLoaiInput').value='${t.replace(/'/g, "&#39;")}'">${t}</button>`
    ).join('');

    document.getElementById('batchEditTagButtons').innerHTML = tagsHtml;
    document.getElementById('batchEditPhanLoaiInput').value = '';

    document.getElementById('batchEditModal').style.display = 'flex';
}

function closeBatchEditModal() {
    document.getElementById('batchEditModal').style.display = 'none';
}

async function executeBatchEditPhanLoai() {
    const checkboxes = document.querySelectorAll('.row-checkbox:checked');
    if (checkboxes.length === 0) return;

    const newPhanLoai = document.getElementById('batchEditPhanLoaiInput').value;
    if (newPhanLoai === '') {
        if (!confirm("Bạn không nhập phân loại nào, mục này sẽ bị để trống. Tiếp tục?")) return;
    }

    closeBatchEditModal();
    document.getElementById('loading').style.display = 'flex';
    try {
        const token = await getAccessToken();
        const tabConfig = CONFIG.tabs[currentTab];
        const phanLoaiColIndex = tabConfig.headers.indexOf('phan_loai');
        if (phanLoaiColIndex === -1) throw new Error("Không tìm thấy cột phân loại.");

        const colLetter = String.fromCharCode(65 + phanLoaiColIndex);

        const dataToUpdate = Array.from(checkboxes).map(cb => {
            const rowIndex = cb.getAttribute('data-index');
            return {
                range: `${currentTab}!${colLetter}${rowIndex}`,
                values: [[newPhanLoai]]
            };
        });

        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values:batchUpdate`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                valueInputOption: 'RAW',
                data: dataToUpdate
            })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error?.message || "Lỗi khi cập nhật");
        }

        await fetchData();
    } catch (e) {
        console.error(e);
        alert("Lỗi: " + e.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}



let allDashPages = { 'GHI_CHU': 1, 'CHI_TIEU': 1, 'HOC_HOI': 1 };
const ALL_DASH_ROWS_PER_PAGE = 100;
let allDashResults = [];

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
                        <button onclick="openRecordFormFromDash('${result.tabName}')" style="background:var(--success, #10b981); color:#fff; border:none; border-radius:6px; padding:6px 12px; font-size:0.85rem; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px;">
                            Thêm mới
                        </button>
                        <button onclick="switchTab('${result.tabName}')" style="background:var(--primary, #5b5ef4); color:#fff; border:none; border-radius:6px; padding:6px 12px; font-size:0.85rem; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px;">
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
            
            tableHtml += `<tr style="border-bottom:1px solid #f1f5f9; cursor:pointer;" class="table-row-hover" ondblclick='openRecordFormFromDash("${result.tabName}", ${safeRow}, ${sheetRow})'>`;
            
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
                    <button class="pagination-btn" onclick="changeAllDashPage('${result.tabName}', -1)" ${currentPage === 1 ? 'disabled' : ''}>Trước</button>
                    <span class="page-info">Trang ${currentPage} / ${totalPages}</span>
                    <button class="pagination-btn" onclick="changeAllDashPage('${result.tabName}', 1)" ${currentPage === totalPages ? 'disabled' : ''}>Sau</button>
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

function openRecordFormFromDash(tabName, rowData = null, sheetRow = null) {
    currentTab = tabName;
    if (window.cachedData && window.cachedData[tabName]) {
        allData = window.cachedData[tabName];
    } else {
        allData = [];
    }
    openRecordForm(rowData, sheetRow);
}

// Kanban Drag and Drop Functions
function dragStart(event, sheetRow) {
    event.dataTransfer.setData("text/plain", sheetRow);
    event.dataTransfer.effectAllowed = "move";
}

function allowDrop(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
}

async function dropTask(event, newStatus) {
    event.preventDefault();
    const sheetRow = event.dataTransfer.getData("text/plain");
    if (!sheetRow) return;

    // Find the task in allData
    const taskIndex = allData.findIndex(row => row._sheetRow == sheetRow);
    if (taskIndex === -1) return;
    
    const task = allData[taskIndex];
    if (task[5] === newStatus) return; // status didn't change
    
    // Update local data for immediate feedback
    task[5] = newStatus;
    
    // Also update filteredData so it renders correctly
    const fTaskIndex = filteredData.findIndex(row => row._sheetRow == sheetRow);
    if (fTaskIndex !== -1) {
        filteredData[fTaskIndex][5] = newStatus;
    }
    
    renderKanban(); // re-render locally immediately

    // Send API update
    document.getElementById('loading').style.display = 'flex';
    try {
        const token = await getAccessToken();
        const tabConfig = CONFIG.tabs['CONG_VIEC'];
        const statusColIndex = tabConfig.headers.indexOf('trang_thai'); // 5
        const colLetter = String.fromCharCode(65 + statusColIndex); // F
        
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/CONG_VIEC!${colLetter}${sheetRow}?valueInputOption=RAW`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                values: [[newStatus]]
            })
        });
        
        // Invalidate cache
        if (window.cachedData) window.cachedData['CONG_VIEC'] = null;
    } catch (err) {
        console.error("Error updating status:", err);
        alert("Lỗi khi cập nhật trạng thái!");
        // Revert on error
        await fetchData(true);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}
