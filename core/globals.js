window.cachedData = window.cachedData || {};

var CONFIG = window.CONFIG = {
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
            range: 'GHI_CHU!A2:M',
            headers: ['id', 'ngay', 'ngay_in', 'ngay_out', 'tieu_de', 'noi_dung', 'phan_loai', 'anh', 'trang_thai', 'dia_chi', 'map', 'bao_lau', 'ghim']
        },
        'CHI_TIEU': {
            range: 'CHI_TIEU!A2:J',
            headers: ['id', 'ngay', 'loai_giao_dich', 'tai_khoan', 'so_tien', 'hang_muc', 'tai_khoan_nhan', 'ghi_chu', 'so_du_ao', 'hashtag']
        },
        'CONG_VIEC': {
            range: 'CONG_VIEC!A2:M',
            headers: ['id', 'tieu_de', 'mo_ta', 'danh_muc', 'trang_thai', 'ngay_bat_dau', 'ngay_hoan_thanh', 'tag', 'ghi_chu', 'file_dinh_kem', 'link_lien_quan', 'lap_lai', 'ghim']
        },
        'HOC_HOI': {
            range: 'HOC_HOI!A2:I',
            headers: ['id', 'ngay', 'tieu_de', 'noi_dung', 'link', 'anh', 'file', 'tag', 'ghim']
        },
        'DSNV': {
            range: 'DSNV!A2:J',
            headers: ['id', 'ho_ten', 'hinh_anh', 'gioi_tinh', 'ngay_sinh', 'quyen', 'mk', 'email', 'sdt', 'hashtag']
        },
        'MK': {
            range: 'MK!A2:N',
            headers: ['id', 'ngay', 'tag', 'nhan', 'ten_đang_nhap', 'mat_khau', 'noi_dung', 'ghi_chu', 'mail', 'tk', 'link', 'anh', 'anh_2', 'udt']
        },
        'BANG_TAM': {
            range: 'BANG_TAM!A2:F',
            headers: ['id', 'ngay', 'ngay_gio', 'ghi_chu', 'noi_dung', 'tag']
        },
        'THAO_TAC': {
            range: 'THAO_TAC!A2:J',
            headers: ['id', 'ngay', 'ngay_gio', 'loai_thao_tac', 'doi_tuong', 'noi_dung', 'tieu_de_trang', 'url_trang', 'thong_tin_them', 'trang_thai']
        }
    }
};


var globalAccountBalances = {};

var currentView = 'LICH', currentTab = 'CONG_VIEC', allData = [], accessToken = null, tokenExpiry = 0;
window.calendarViewMode = 'month';
window.currentCalendarDate = new Date();
window.calendarFilter = 'ALL';

try {
    const saved = localStorage.getItem('infosys_floating_icon_enabled');
    window.isFloatingIconEnabled = saved !== null ? saved === 'true' : true;
} catch (e) {
    window.isFloatingIconEnabled = true;
}

if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['infosys_floating_icon_enabled'], (res) => {
        if (res && res.infosys_floating_icon_enabled !== undefined) {
            window.isFloatingIconEnabled = res.infosys_floating_icon_enabled !== false;
            try {
                localStorage.setItem('infosys_floating_icon_enabled', String(window.isFloatingIconEnabled));
            } catch (e) {}
            if (typeof updateGlobalFloatingButtonUI === 'function') {
                updateGlobalFloatingButtonUI();
            }
            if (window.currentTab === 'BANG_TAM' && typeof renderTabFilters === 'function') {
                renderTabFilters();
            }
        }
        if (res && res.infosys_action_recorder_enabled !== undefined) {
            window.isActionRecorderEnabled = res.infosys_action_recorder_enabled === true;
            try {
                localStorage.setItem('infosys_action_recorder_enabled', String(window.isActionRecorderEnabled));
            } catch (e) {}
            if (typeof updateActionRecorderButtonUI === 'function') {
                updateActionRecorderButtonUI();
            }
        }
    });

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local') {
            if (changes.infosys_floating_icon_enabled !== undefined) {
                window.isFloatingIconEnabled = changes.infosys_floating_icon_enabled.newValue !== false;
                try {
                    localStorage.setItem('infosys_floating_icon_enabled', String(window.isFloatingIconEnabled));
                } catch (e) {}
                if (typeof updateGlobalFloatingButtonUI === 'function') {
                    updateGlobalFloatingButtonUI();
                }
                if (window.currentTab === 'BANG_TAM' && typeof renderTabFilters === 'function') {
                    renderTabFilters();
                }
            }
            if (changes.infosys_action_recorder_enabled !== undefined) {
                window.isActionRecorderEnabled = changes.infosys_action_recorder_enabled.newValue === true;
                try {
                    localStorage.setItem('infosys_action_recorder_enabled', String(window.isActionRecorderEnabled));
                } catch (e) {}
                if (typeof updateActionRecorderButtonUI === 'function') {
                    updateActionRecorderButtonUI();
                }
            }
        }
    });
}

var filteredData = [];
var editingSheetRow = null;
var currentPage = 1;
var rowsPerPage = 100;
var activePhanLoaiFilter = [];
var activeExpenseFilters = {};
var activeTaskFilters = {};
var mapInstance = null, mapMarker = null;
var currentSortCol = null;
var currentSortAsc = true;
var taskViewMode = 'kanban'; // 'table' or 'kanban'

function toggleTaskView() {
    taskViewMode = taskViewMode === 'table' ? 'kanban' : 'table';
    const btn = document.getElementById('viewToggleBtn');
    if (btn) {
        btn.innerHTML = taskViewMode === 'table' ? '<i data-lucide="layout-dashboard" style="width:16px; margin-right:4px;"></i> Kanban' : '<i data-lucide="table" style="width:16px; margin-right:4px;"></i> Table';
        lucide.createIcons();
    }
    renderTaskView();
}


var globalSearchTimeout = null;
var allDashPages = { 'GHI_CHU': 1, 'CHI_TIEU': 1, 'HOC_HOI': 1 };
var ALL_DASH_ROWS_PER_PAGE = 100;
var allDashResults = [];
var expenseChartInstance = null;
var taskChartInstance = null;


