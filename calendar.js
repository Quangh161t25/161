// =========================================================================
// CALENDAR.JS — Module Lịch đa chế độ xem: Tháng, Tuần, Ngày
// =========================================================================

window.currentCalendarDate = window.currentCalendarDate || new Date();
window.calendarViewMode = window.calendarViewMode || 'month';
window.calendarFilter = window.calendarFilter || 'ALL';

// --- THUẬT TOÁN TÍNH ÂM LỊCH (Hồ Ngọc Đức) ---
const TIMEZONE = 7;

function jdFromDate(dd, mm, yy) {
    let a = Math.floor((14 - mm) / 12);
    let y = yy + 4800 - a;
    let m = mm + 12 * a - 3;
    let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4)
      - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    if (jd < 2299161) jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
    return jd;
}

function getNewMoonDay(k, timeZone) {
    let T = k / 1236.85;
    let T2 = T * T, T3 = T2 * T, T4 = T3 * T;
    let dr = Math.PI / 180;
    let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3 + 0.00000000073 * T4;
    Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    let M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    let Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    let F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    let Om = 125.04452 - 1934.136261 * T + 0.0020708 * T2;
    
    let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
    C1 -= 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
    C1 -= 0.0004 * Math.sin(dr * 3 * Mpr);
    C1 += 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
    C1 -= 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
    C1 -= 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
    C1 += 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (M + 2 * Mpr));
    C1 += 0.0005 * Math.sin(dr * (2 * Mpr - M)) - 0.0004 * Math.sin(dr * (2 * F - 2 * Mpr));
    C1 -= 0.0003 * Math.sin(dr * (2 * Mpr + M)) + 0.0003 * Math.sin(dr * (2 * F + 2 * M));
    C1 += 0.0003 * Math.sin(dr * (2 * F - 2 * M)) + 0.0002 * Math.sin(dr * (Mpr - M));
    C1 += 0.0002 * Math.sin(dr * 2 * Om);

    let deltat;
    if (T < -11) {
        deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
    } else {
        deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
    }
    let JdNew = Jd1 + C1 - deltat;
    return Math.floor(JdNew + 0.5 + timeZone / 24 + 0.005);
}

function getSunLongitude(jdn, timeZone) {
    let T = (jdn - 2451545.0 + 0.5 - timeZone / 24) / 36525;
    let T2 = T * T;
    let dr = Math.PI / 180;
    let M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
    let L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
    DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
    let L = L0 + DL;
    let omega = 125.04 - 1934.136 * T;
    let lambda = L - 0.00569 - 0.00478 * Math.sin(omega * dr);
    lambda = lambda * dr;
    lambda = lambda - Math.PI * 2 * Math.floor(lambda / (Math.PI * 2));
    return Math.floor(lambda / Math.PI * 6);
}

function getLunarMonth11(yy, timeZone) {
    let off = jdFromDate(31, 12, yy) - 2415021;
    let k = Math.floor(off / 29.530588853);
    let nm = getNewMoonDay(k, timeZone);
    let sunLong = getSunLongitude(nm, timeZone);
    if (sunLong >= 9) nm = getNewMoonDay(k - 1, timeZone);
    return nm;
}

function getLeapMonthOffset(a11, timeZone) {
    let k = Math.floor(0.5 + (a11 - 2415021.076998695) / 29.530588853);
    let last = 0, i = 1, arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
    do { last = arc; i++; arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone); } while (arc !== last && i < 14);
    return i - 1;
}

function solarToLunar(dd, mm, yy, timeZone = 7) {
    let dayNumber = jdFromDate(dd, mm, yy);
    let k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
    let monthStart = getNewMoonDay(k + 1, timeZone);
    if (monthStart > dayNumber) monthStart = getNewMoonDay(k, timeZone);
    let a11 = getLunarMonth11(yy, timeZone);
    let b11 = a11;
    let lunarYear;
    if (a11 >= monthStart) { lunarYear = yy; a11 = getLunarMonth11(yy - 1, timeZone); } 
    else { lunarYear = yy + 1; b11 = getLunarMonth11(yy + 1, timeZone); }
    let lunarDay = dayNumber - monthStart + 1;
    let diff = Math.floor((monthStart - a11) / 29);
    let lunarLeap = false;
    let lunarMonth = diff + 11;
    if (b11 - a11 > 365) {
      let leapMonthDiff = getLeapMonthOffset(a11, timeZone);
      if (diff >= leapMonthDiff) {
        lunarMonth = diff + 10;
        if (diff === leapMonthDiff) lunarLeap = true;
      }
    }
    if (lunarMonth > 12) lunarMonth -= 12;
    if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
    return { lunarDay, lunarMonth, lunarYear, lunarLeap };
}

// --- HELPER DATES & WEEKS ---
const VI_DAY_NAMES = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
const VI_DAY_SHORT = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
const VI_MONTH_NAMES = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

function pad2(n) { return String(n).padStart(2, '0'); }

function formatDateISO(d) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function getWeekMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1 - day); // Distance to Monday
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getWeekDaysList(date) {
    const monday = getWeekMonday(date);
    const days = [];
    for (let i = 0; i < 7; i++) {
        const temp = new Date(monday);
        temp.setDate(monday.getDate() + i);
        days.push(temp);
    }
    return days;
}

function parseEventDateInfo(rawStr) {
    if (!rawStr) return null;
    const str = String(rawStr).trim();
    let day = null, month = null, year = null, timeStr = '', hours = 0, minutes = 0;
    
    if (str.includes('/')) {
        const parts = str.split(' ');
        const dateParts = parts[0].split('/');
        if (dateParts.length >= 3) {
            day = parseInt(dateParts[0], 10);
            month = parseInt(dateParts[1], 10) - 1;
            year = parseInt(dateParts[2].length === 2 ? '20' + dateParts[2] : dateParts[2], 10);
            if (parts[1]) {
                timeStr = parts[1].slice(0, 5);
                const tParts = timeStr.split(':');
                if (tParts.length >= 2) {
                    hours = parseInt(tParts[0], 10) || 0;
                    minutes = parseInt(tParts[1], 10) || 0;
                }
            }
        }
    } else if (str.includes('-')) {
        const parts = str.split('T');
        const dateParts = parts[0].split('-');
        if (dateParts.length >= 3) {
            year = parseInt(dateParts[0], 10);
            month = parseInt(dateParts[1], 10) - 1;
            day = parseInt(dateParts[2], 10);
            if (parts[1]) {
                timeStr = parts[1].slice(0, 5);
                const tParts = timeStr.split(':');
                if (tParts.length >= 2) {
                    hours = parseInt(tParts[0], 10) || 0;
                    minutes = parseInt(tParts[1], 10) || 0;
                }
            }
        }
    }
    
    if (day === null || isNaN(day) || month === null || isNaN(month) || year === null || isNaN(year)) {
        return null;
    }
    
    return { day, month, year, timeStr, hours, minutes };
}

// --- MAIN RENDER CALENDAR ---
async function renderCalendar() {
    const calDash = document.getElementById('calendarDashboard');
    if (!calDash) return;
    
    try {
        if (!window.cachedData) window.cachedData = {};
        const tabsToFetch = ['GHI_CHU', 'CHI_TIEU', 'HOC_HOI', 'CONG_VIEC', 'DSNV'];
        const uncachedTabs = tabsToFetch.filter(tabName => !window.cachedData[tabName]);

        if (uncachedTabs.length > 0) {
            const loadEl = document.getElementById('loading');
            if (loadEl) {
                loadEl.style.display = 'flex';
                const p = loadEl.querySelector('p');
                if (p) p.innerText = 'Đang tải dữ liệu...';
            }
            
            try {
                const token = await getAccessToken();
            const rangesParam = uncachedTabs.map(t => `ranges=${CONFIG.tabs[t] ? CONFIG.tabs[t].range : t + '!A2:H'}`).join('&');
            const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values:batchGet?${rangesParam}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.valueRanges) {
                data.valueRanges.forEach((vr, idx) => {
                    const tabName = uncachedTabs[idx];
                    const rows = (vr.values || []).map((row, i) => {
                        const arr = [...row];
                        arr._sheetRow = i + 2;
                        return arr;
                    });
                    window.cachedData[tabName] = rows;
                });
            }
        } catch (e) {
            console.error("Lỗi khi tải dữ liệu lịch batchGet:", e);
        } finally {
            const loadEl = document.getElementById('loading');
            if (loadEl) loadEl.style.display = 'none';
        }
    }

    const allResults = tabsToFetch.map(tabName => {
        const tabConfig = CONFIG.tabs[tabName];
        return {
            tabName,
            headers: tabConfig ? tabConfig.headers : [],
            data: window.cachedData[tabName] ? [...window.cachedData[tabName]] : []
        };
    });
        
        let events = [];
        allResults.forEach(result => {
            result.data.forEach(row => {
                let eventDateStr = '';
                let title = '';
                let typeClass = '';
                let icon = '';
                let typeLabel = '';
                let extra = '';
                let amount = 0;
                let status = '';
                
                if (result.tabName === 'GHI_CHU') {
                    eventDateStr = row[1]; // ngay
                    title = row[4] || 'Ghi chú không tên'; // tieu_de
                    typeClass = 'cal-evt-ghi_chu';
                    icon = 'book-open';
                    typeLabel = 'Ghi chú';
                    extra = row[6] || ''; // phan_loai
                } else if (result.tabName === 'CHI_TIEU') {
                    eventDateStr = row[1]; // ngay
                    const loai = row[2] || 'Chi'; // loai_giao_dich
                    const soTien = row[4] || '0'; // so_tien
                    const hangMuc = row[5] || '';
                    const ghiChu = row[7] || '';
                    amount = parseFloat(String(soTien).replace(/,/g, '')) || 0;
                    title = `${loai}: ${soTien}đ${hangMuc ? ' (' + hangMuc + ')' : ''}`;
                    typeClass = loai === 'Chi' ? 'cal-evt-chi_tieu_chi' : 'cal-evt-chi_tieu_thu';
                    icon = 'wallet';
                    typeLabel = loai === 'Chi' ? 'Chi tiêu' : 'Thu nhập';
                    extra = ghiChu;
                } else if (result.tabName === 'HOC_HOI') {
                    eventDateStr = row[1]; // ngay
                    title = row[2] || 'Bài học không tên'; // tieu_de
                    typeClass = 'cal-evt-hoc_hoi';
                    icon = 'lightbulb';
                    typeLabel = 'Học hỏi';
                    extra = row[7] || ''; // tag
                } else if (result.tabName === 'CONG_VIEC') {
                    eventDateStr = row[6] || row[5]; // ngay_hoan_thanh or ngay_bat_dau
                    title = row[1] || 'Công việc không tên'; // tieu_de
                    status = row[4] || ''; // trang_thai
                    typeClass = 'cal-evt-cong_viec';
                    icon = 'check-square';
                    typeLabel = 'Công việc';
                    extra = status ? `[${status}]` : '';
                } else if (result.tabName === 'DSNV') {
                    eventDateStr = row[4]; // ngay_sinh
                    title = `Sinh nhật: ${row[1] || 'Không tên'}`; // ho_ten
                    typeClass = 'cal-evt-dsnv';
                    icon = 'gift';
                    typeLabel = 'Sinh nhật';
                }
                
                if (!eventDateStr) return;
                
                const parsed = parseEventDateInfo(eventDateStr);
                if (!parsed) return;
                
                let year = parsed.year;
                if (result.tabName === 'DSNV') {
                    year = (window.currentCalendarDate || new Date()).getFullYear();
                }
                
                events.push({
                    day: parsed.day,
                    month: parsed.month,
                    year: year,
                    timeStr: parsed.timeStr,
                    hours: parsed.hours,
                    minutes: parsed.minutes,
                    title: title,
                    typeClass,
                    icon,
                    typeLabel,
                    extra,
                    amount,
                    status,
                    tabName: result.tabName,
                    rowIndex: row._sheetRow,
                    rowData: row
                });
            });
        });
        
        // Sort events chronologically (time-based first)
        events.sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            if (a.month !== b.month) return a.month - b.month;
            if (a.day !== b.day) return a.day - b.day;
            if (a.timeStr && b.timeStr) {
                return (a.hours * 60 + a.minutes) - (b.hours * 60 + b.minutes);
            }
            if (a.timeStr) return -1;
            if (b.timeStr) return 1;
            return 0;
        });

        window._allCalendarEvents = events;
        
        // Apply filter
        const filteredEvents = (window.calendarFilter === 'ALL' || window.calendarFilter === 'LICH_SU') 
            ? events 
            : events.filter(e => e.tabName === window.calendarFilter);
        window._currentCalendarEvents = filteredEvents;

        // Render based on calendarViewMode
        drawCalendarView(calDash, filteredEvents);
        
        if (window.lucide) window.lucide.createIcons();
        
    } catch (error) {
        console.error('Error loading calendar data:', error);
        const loadEl = document.getElementById('loading');
        if (loadEl) loadEl.style.display = 'none';
        calDash.innerHTML = `<div style="padding: 20px; color: red;">Lỗi tải dữ liệu lịch: ${error.message}</div>`;
    }
}
window.renderCalendar = renderCalendar;

// --- VIEW DISPATCHER ---
function drawCalendarView(container, events) {
    let mode = window.calendarViewMode || 'month';
    if (mode === 'day') {
        drawDayView(container, events);
    } else if (mode === 'week') {
        drawWeekView(container, events);
    } else {
        drawMonthView(container, events);
    }
}

// --- COMMON CALENDAR HEADER ---
function buildCalendarHeaderHtml(titleText, subtitleText = '') {
    const curMode = window.calendarViewMode || 'month';
    const curFilter = window.calendarFilter || 'ALL';
    const curDateISO = formatDateISO(window.currentCalendarDate || new Date());

    return `
        <div class="calendar-header" style="flex-direction:column; gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--border); background: #f8fafc;">
            <!-- Top bar: Title, Navigation, View Mode Switcher, Quick Add -->
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; width:100%;">
                
                <!-- Left: Title & Prev/Today/Next -->
                <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                    <div>
                        <h2 style="margin:0; font-size:1.3rem; font-weight:700; color:var(--primary); line-height:1.2;">
                            ${titleText}
                        </h2>
                        ${subtitleText ? `<div style="font-size:0.8rem; color:#64748b; font-weight:500; margin-top:2px;">${subtitleText}</div>` : ''}
                    </div>
                    
                    <div class="calendar-nav" style="display:flex; gap:6px;">
                        <button type="button" data-action="cal-change-date" data-offset="-1" onclick="changeCalendarDate(-1)" title="Trước" style="padding:6px 10px;">
                            <i data-lucide="chevron-left" style="width:16px;height:16px;"></i>
                        </button>
                        <button type="button" data-action="cal-change-date" data-offset="0" onclick="changeCalendarDate(0)" title="Về hôm nay" style="font-size:0.85rem; font-weight:600; padding:6px 12px;">Hôm nay</button>
                        <button type="button" data-action="cal-change-date" data-offset="1" onclick="changeCalendarDate(1)" title="Sau" style="padding:6px 10px;">
                            <i data-lucide="chevron-right" style="width:16px;height:16px;"></i>
                        </button>
                    </div>
                </div>

                <!-- Center: View Mode Toggle (Tháng / Tuần / Ngày) -->
                <div class="calendar-view-modes" style="display:flex; background:#e2e8f0; padding:3px; border-radius:10px; gap:3px;">
                    <button type="button" class="cal-mode-btn ${curMode === 'month' ? 'active' : ''}" data-action="cal-set-mode" data-mode="month" onclick="setCalendarViewMode('month')" title="Xem dạng Tháng">
                        <i data-lucide="calendar" style="width:14px;height:14px;"></i> Tháng
                    </button>
                    <button type="button" class="cal-mode-btn ${curMode === 'week' ? 'active' : ''}" data-action="cal-set-mode" data-mode="week" onclick="setCalendarViewMode('week')" title="Xem dạng Tuần">
                        <i data-lucide="calendar-range" style="width:14px;height:14px;"></i> Tuần
                    </button>
                    <button type="button" class="cal-mode-btn ${curMode === 'day' ? 'active' : ''}" data-action="cal-set-mode" data-mode="day" onclick="setCalendarViewMode('day')" title="Xem dạng Ngày">
                        <i data-lucide="calendar-days" style="width:14px;height:14px;"></i> Ngày
                    </button>
                </div>

                <!-- Right: Quick add buttons -->
                <div style="display: flex; gap: 6px; align-items:center; flex-wrap: wrap;">
                    <button type="button" class="tag-btn" data-action="quick-add-cal" data-tab="GHI_CHU" data-date="${curDateISO}" style="background:#eef2ff; color:#4b4eea; font-weight:600; border:1px solid #c7d2fe;" onclick="quickAddCalendarOnDate('GHI_CHU', '${curDateISO}')">
                        <i data-lucide="plus" style="width:13px;height:13px;display:inline-block;vertical-align:middle;margin-right:2px;"></i> Ghi chú
                    </button>
                    <button type="button" class="tag-btn" data-action="quick-add-cal" data-tab="CHI_TIEU" data-date="${curDateISO}" style="background:#fef2f2; color:#ef4444; font-weight:600; border:1px solid #fecaca;" onclick="quickAddCalendarOnDate('CHI_TIEU', '${curDateISO}')">
                        <i data-lucide="plus" style="width:13px;height:13px;display:inline-block;vertical-align:middle;margin-right:2px;"></i> Chi tiêu
                    </button>
                    <button type="button" class="tag-btn" data-action="quick-add-cal" data-tab="CONG_VIEC" data-date="${curDateISO}" style="background:#fffbeb; color:#f59e0b; font-weight:600; border:1px solid #fde68a;" onclick="quickAddCalendarOnDate('CONG_VIEC', '${curDateISO}')">
                        <i data-lucide="plus" style="width:13px;height:13px;display:inline-block;vertical-align:middle;margin-right:2px;"></i> Công việc
                    </button>
                    <button type="button" class="tag-btn" data-action="quick-add-cal" data-tab="HOC_HOI" data-date="${curDateISO}" style="background:#ecfdf5; color:#10b981; font-weight:600; border:1px solid #a7f3d0;" onclick="quickAddCalendarOnDate('HOC_HOI', '${curDateISO}')">
                        <i data-lucide="plus" style="width:13px;height:13px;display:inline-block;vertical-align:middle;margin-right:2px;"></i> Học hỏi
                    </button>
                    <button type="button" class="tag-btn" data-action="quick-add-cal" data-tab="DSNV" data-date="${curDateISO}" style="background:#eef2ff; color:#6366f1; font-weight:600; border:1px solid #c7d2fe;" onclick="quickAddCalendarOnDate('DSNV', '${curDateISO}')">
                        <i data-lucide="plus" style="width:13px;height:13px;display:inline-block;vertical-align:middle;margin-right:2px;"></i> Con người
                    </button>
                </div>
            </div>

            <!-- Bottom bar: Filter chips -->
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; width:100%; border-top:1px dashed #e2e8f0; padding-top:10px;">
                <div class="calendar-filters" style="display: flex; gap: 6px; overflow-x: auto; flex-wrap: wrap;">
                    <button type="button" class="tag-btn" data-action="cal-set-filter" data-filter="ALL" style="${curFilter === 'ALL' ? 'background:var(--primary);color:#fff;' : ''}" onclick="setCalendarFilter('ALL')">Tất cả</button>
                    <button type="button" class="tag-btn" data-action="cal-set-filter" data-filter="GHI_CHU" style="${curFilter === 'GHI_CHU' ? 'background:var(--primary);color:#fff;' : ''}" onclick="setCalendarFilter('GHI_CHU')">Ghi chú</button>
                    <button type="button" class="tag-btn" data-action="cal-set-filter" data-filter="CHI_TIEU" style="${curFilter === 'CHI_TIEU' ? 'background:var(--primary);color:#fff;' : ''}" onclick="setCalendarFilter('CHI_TIEU')">Chi tiêu</button>
                    <button type="button" class="tag-btn" data-action="cal-set-filter" data-filter="CONG_VIEC" style="${curFilter === 'CONG_VIEC' ? 'background:var(--primary);color:#fff;' : ''}" onclick="setCalendarFilter('CONG_VIEC')">Công việc</button>
                    <button type="button" class="tag-btn" data-action="cal-set-filter" data-filter="HOC_HOI" style="${curFilter === 'HOC_HOI' ? 'background:var(--primary);color:#fff;' : ''}" onclick="setCalendarFilter('HOC_HOI')">Học hỏi</button>
                    <button type="button" class="tag-btn" data-action="cal-set-filter" data-filter="DSNV" style="${curFilter === 'DSNV' ? 'background:var(--primary);color:#fff;' : ''}" onclick="setCalendarFilter('DSNV')">Sinh nhật</button>
                    <button type="button" class="tag-btn" data-action="cal-set-filter" data-filter="LICH_SU" style="${curFilter === 'LICH_SU' ? 'background:var(--primary);color:#fff;' : ''}" onclick="setCalendarFilter('LICH_SU')">
                        <i data-lucide="history" style="width:13px;height:13px;display:inline-block;vertical-align:middle;margin-right:2px;"></i> Lịch sử
                    </button>
                </div>
                <button type="button" class="add-btn" data-action="add-from-cal" style="background:var(--primary);color:#fff;border:none;padding:6px 14px;border-radius:8px;font-weight:600;font-size:0.84rem;display:flex;align-items:center;gap:4px;cursor:pointer;" onclick="addFromCalendar()">
                    <i data-lucide="plus" style="width:16px;height:16px;"></i> Thêm mới
                </button>
            </div>
        </div>
    `;
}

// --- 1. DRAW MONTH VIEW ---
function drawMonthView(container, events) {
    const curDate = window.currentCalendarDate || new Date();
    const year = curDate.getFullYear();
    const month = curDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    let startingDay = firstDay.getDay(); 
    const startCellIndex = startingDay === 0 ? 6 : startingDay - 1; // Mon is 0
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const today = new Date();
    
    let html = `
        <div class="calendar-container">
            ${buildCalendarHeaderHtml(`${VI_MONTH_NAMES[month]}, ${year}`, `Xem toàn bộ các mục trong tháng`)}
            
            <div class="calendar-grid">
                <div class="calendar-day-header">Thứ 2</div>
                <div class="calendar-day-header">Thứ 3</div>
                <div class="calendar-day-header">Thứ 4</div>
                <div class="calendar-day-header">Thứ 5</div>
                <div class="calendar-day-header">Thứ 6</div>
                <div class="calendar-day-header">Thứ 7</div>
                <div class="calendar-day-header">CN</div>
    `;
    
    // Prev month days
    for (let i = 0; i < startCellIndex; i++) {
        const dayNum = prevMonthLastDay - startCellIndex + i + 1;
        html += `<div class="calendar-day other-month"><span class="day-number">${dayNum}</span></div>`;
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        const isToday = today.getDate() === i && today.getMonth() === month && today.getFullYear() === year;
        const classes = isToday ? 'calendar-day today' : 'calendar-day';
        
        let dayEvents = [];
        if (window.calendarFilter === 'LICH_SU') {
            dayEvents = events.filter(e => e.day === i && e.month === month && e.year < year && e.tabName !== 'DSNV');
            dayEvents = dayEvents.map(e => ({
                ...e,
                title: `[${year - e.year} năm trước] ${e.title}`
            }));
        } else {
            dayEvents = events.filter(e => e.day === i && e.month === month && e.year === year);
        }
        
        let eventsHtml = '';
        dayEvents.forEach(evt => {
            const timeTag = evt.timeStr ? `<span style="font-weight:700;margin-right:2px;font-size:0.7rem;opacity:0.85;">${evt.timeStr}</span>` : '';
            eventsHtml += `
                <div class="calendar-event ${evt.typeClass}" data-action="cal-edit-event" data-tab="${evt.tabName}" data-row="${evt.rowIndex}" onclick="editEvent('${evt.tabName}', ${evt.rowIndex}, event)" title="${evt.timeStr ? '[' + evt.timeStr + '] ' : ''}${evt.title}">
                    <i data-lucide="${evt.icon}"></i>
                    ${timeTag}
                    <span class="evt-title">${evt.title}</span>
                </div>
            `;
        });
        
        const lunar = solarToLunar(i, month + 1, year);
        let lunarStr = lunar.lunarDay;
        if (lunar.lunarDay === 1 || i === 1) lunarStr += '/' + lunar.lunarMonth + (lunar.lunarLeap ? '*' : '');
        
        html += `
            <div class="${classes}" data-action="cal-switch-day-view" data-day="${i}" data-month="${month}" data-year="${year}" onclick="switchToDayView(${i}, ${month}, ${year})">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
                    <span class="day-number" title="Xem chi tiết ngày">${i}</span>
                    <span class="lunar-number" style="font-size:0.75rem; color:#9ca3af;" title="Âm lịch">${lunarStr}</span>
                </div>
                <div class="calendar-events">
                    ${eventsHtml}
                </div>
            </div>
        `;
    }
    
    // Next month days
    const totalCells = startCellIndex + daysInMonth;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
        html += `<div class="calendar-day other-month"><span class="day-number">${i}</span></div>`;
    }
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// --- 2. DRAW WEEK VIEW ---
function drawWeekView(container, events) {
    const curDate = window.currentCalendarDate || new Date();
    const weekDays = getWeekDaysList(curDate);
    const firstDay = weekDays[0];
    const lastDay = weekDays[6];
    
    const weekRangeStr = `${pad2(firstDay.getDate())}/${pad2(firstDay.getMonth() + 1)} – ${pad2(lastDay.getDate())}/${pad2(lastDay.getMonth() + 1)}/${lastDay.getFullYear()}`;
    const today = new Date();
    
    let html = `
        <div class="calendar-container">
            ${buildCalendarHeaderHtml(`Tuần: ${weekRangeStr}`, `Xem lịch trình 7 ngày trong tuần`)}
            
            <div class="calendar-week-grid">
    `;
    
    weekDays.forEach((wDate, idx) => {
        const dNum = wDate.getDate();
        const mNum = wDate.getMonth();
        const yNum = wDate.getFullYear();
        const isToday = today.getDate() === dNum && today.getMonth() === mNum && today.getFullYear() === yNum;
        const dateISO = formatDateISO(wDate);
        
        const lunar = solarToLunar(dNum, mNum + 1, yNum);
        let lunarStr = `Âm: ${lunar.lunarDay}/${lunar.lunarMonth}${lunar.lunarLeap ? '*' : ''}`;
        
        let dayEvents = [];
        if (window.calendarFilter === 'LICH_SU') {
            dayEvents = events.filter(e => e.day === dNum && e.month === mNum && e.year < yNum && e.tabName !== 'DSNV');
            dayEvents = dayEvents.map(e => ({ ...e, title: `[${yNum - e.year} năm trước] ${e.title}` }));
        } else {
            dayEvents = events.filter(e => e.day === dNum && e.month === mNum && e.year === yNum);
        }
        
        // Calculate daily expense stats
        let totalChi = 0, totalThu = 0;
        dayEvents.forEach(e => {
            if (e.tabName === 'CHI_TIEU') {
                if (e.typeClass.includes('chi_tieu_chi')) totalChi += e.amount;
                else if (e.typeClass.includes('chi_tieu_thu')) totalThu += e.amount;
            }
        });
        
        let eventsListHtml = '';
        if (dayEvents.length === 0) {
            eventsListHtml = `
                <div class="cal-week-empty" data-action="quick-add-cal" data-tab="CONG_VIEC" data-date="${dateISO}" onclick="quickAddCalendarOnDate('CONG_VIEC', '${dateISO}')">
                    <span>+ Thêm mục</span>
                </div>
            `;
        } else {
            dayEvents.forEach(evt => {
                let badgeClass = evt.typeClass;
                let metaBadge = '';
                if (evt.timeStr) {
                    metaBadge += `<span class="cal-card-time"><i data-lucide="clock" style="width:11px;height:11px;"></i> ${evt.timeStr}</span>`;
                }
                if (evt.status) {
                    metaBadge += `<span class="cal-card-tag status">${evt.status}</span>`;
                }
                
                eventsListHtml += `
                    <div class="cal-week-card ${badgeClass}" data-action="cal-edit-event" data-tab="${evt.tabName}" data-row="${evt.rowIndex}" onclick="editEvent('${evt.tabName}', ${evt.rowIndex}, event)" title="${evt.title}">
                        <div class="cal-week-card-header">
                            <span class="cal-card-type"><i data-lucide="${evt.icon}" style="width:12px;height:12px;"></i> ${evt.typeLabel}</span>
                            ${metaBadge}
                        </div>
                        <div class="cal-week-card-title">${evt.title}</div>
                        ${evt.extra ? `<div class="cal-week-card-extra">${evt.extra}</div>` : ''}
                    </div>
                `;
            });
        }
        
        let financialSummary = '';
        if (totalChi > 0 || totalThu > 0) {
            financialSummary = `
                <div class="cal-week-col-summary">
                    ${totalChi > 0 ? `<span style="color:#ef4444; font-weight:600;">-${Number(totalChi).toLocaleString('vi-VN')}đ</span>` : ''}
                    ${totalThu > 0 ? `<span style="color:#10b981; font-weight:600;">+${Number(totalThu).toLocaleString('vi-VN')}đ</span>` : ''}
                </div>
            `;
        }
        
        html += `
            <div class="calendar-week-col ${isToday ? 'today' : ''}">
                <!-- Column Header -->
                <div class="cal-week-col-header" data-action="cal-switch-day-view" data-day="${dNum}" data-month="${mNum}" data-year="${yNum}" onclick="switchToDayView(${dNum}, ${mNum}, ${yNum})">
                    <div class="cal-week-day-title">
                        <span class="day-name">${VI_DAY_SHORT[wDate.getDay()]}</span>
                        <span class="day-num ${isToday ? 'today-badge' : ''}">${pad2(dNum)}/${pad2(mNum + 1)}</span>
                    </div>
                    <div class="cal-week-lunar-sub">
                        <span>${lunarStr}</span>
                        ${isToday ? '<span class="today-chip">Hôm nay</span>' : ''}
                    </div>
                </div>
                
                <!-- Quick add per day -->
                <div class="cal-week-col-actions">
                    <button type="button" class="cal-col-add-btn" data-action="quick-add-cal" data-tab="CONG_VIEC" data-date="${dateISO}" onclick="quickAddCalendarOnDate('CONG_VIEC', '${dateISO}')" title="Thêm công việc ngày này">
                        <i data-lucide="plus" style="width:12px;height:12px;"></i> Thêm việc
                    </button>
                    <button type="button" class="cal-col-add-btn" data-action="quick-add-cal" data-tab="CHI_TIEU" data-date="${dateISO}" onclick="quickAddCalendarOnDate('CHI_TIEU', '${dateISO}')" title="Thêm chi tiêu ngày này">
                        <i data-lucide="plus" style="width:12px;height:12px;"></i> Chi tiêu
                    </button>
                </div>
                
                <!-- Event List -->
                <div class="cal-week-events-list">
                    ${eventsListHtml}
                </div>
                
                <!-- Column Footer -->
                <div class="cal-week-col-footer">
                    <div style="font-size:0.75rem; color:#64748b;">${dayEvents.length} mục</div>
                    ${financialSummary}
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// --- 3. DRAW DAY VIEW ---
function drawDayView(container, events) {
    const curDate = window.currentCalendarDate || new Date();
    const dNum = curDate.getDate();
    const mNum = curDate.getMonth();
    const yNum = curDate.getFullYear();
    const dayOfWeek = curDate.getDay();
    const dateISO = formatDateISO(curDate);
    const today = new Date();
    const isToday = today.getDate() === dNum && today.getMonth() === mNum && today.getFullYear() === yNum;
    
    const lunar = solarToLunar(dNum, mNum + 1, yNum);
    const lunarFullStr = `Ngày ${lunar.lunarDay} tháng ${lunar.lunarMonth}${lunar.lunarLeap ? ' (Nhuận)' : ''} Âm Lịch`;
    
    let dayEvents = [];
    if (window.calendarFilter === 'LICH_SU') {
        dayEvents = events.filter(e => e.day === dNum && e.month === mNum && e.year < yNum && e.tabName !== 'DSNV');
        dayEvents = dayEvents.map(e => ({ ...e, title: `[${yNum - e.year} năm trước] ${e.title}` }));
    } else {
        dayEvents = events.filter(e => e.day === dNum && e.month === mNum && e.year === yNum);
    }
    
    // Stats calculation
    let countGhiChu = 0, countCongViec = 0, countHocHoi = 0, countDsnv = 0;
    let totalChi = 0, totalThu = 0;
    
    dayEvents.forEach(e => {
        if (e.tabName === 'GHI_CHU') countGhiChu++;
        else if (e.tabName === 'CONG_VIEC') countCongViec++;
        else if (e.tabName === 'HOC_HOI') countHocHoi++;
        else if (e.tabName === 'DSNV') countDsnv++;
        else if (e.tabName === 'CHI_TIEU') {
            if (e.typeClass.includes('chi_tieu_chi')) totalChi += e.amount;
            else if (e.typeClass.includes('chi_tieu_thu')) totalThu += e.amount;
        }
    });
    
    // Split events into Time-based vs All-day
    const timeBasedEvents = dayEvents.filter(e => e.timeStr);
    const allDayEvents = dayEvents.filter(e => !e.timeStr);
    
    let html = `
        <div class="calendar-container">
            ${buildCalendarHeaderHtml(`${VI_DAY_NAMES[dayOfWeek]}, ${dNum} ${VI_MONTH_NAMES[mNum]} ${yNum}`, `${lunarFullStr} ${isToday ? '• <b style="color:var(--primary)">Hôm nay</b>' : ''}`)}
            
            <div class="calendar-day-view">
                
                <!-- Hero stats cards -->
                <div class="cal-day-stat-grid">
                    <div class="cal-stat-card">
                        <div class="stat-icon" style="background:#e0e7ff; color:#4338ca;"><i data-lucide="layers"></i></div>
                        <div class="stat-content">
                            <div class="stat-label">Tổng sự kiện</div>
                            <div class="stat-val">${dayEvents.length}</div>
                        </div>
                    </div>
                    <div class="cal-stat-card">
                        <div class="stat-icon" style="background:#fee2e2; color:#b91c1c;"><i data-lucide="trending-down"></i></div>
                        <div class="stat-content">
                            <div class="stat-label">Tổng Chi tiêu</div>
                            <div class="stat-val" style="color:#ef4444;">${Number(totalChi).toLocaleString('vi-VN')} đ</div>
                        </div>
                    </div>
                    <div class="cal-stat-card">
                        <div class="stat-icon" style="background:#dcfce7; color:#15803d;"><i data-lucide="trending-up"></i></div>
                        <div class="stat-content">
                            <div class="stat-label">Tổng Thu nhập</div>
                            <div class="stat-val" style="color:#10b981;">${Number(totalThu).toLocaleString('vi-VN')} đ</div>
                        </div>
                    </div>
                    <div class="cal-stat-card">
                        <div class="stat-icon" style="background:#fffbeb; color:#b45309;"><i data-lucide="check-square"></i></div>
                        <div class="stat-content">
                            <div class="stat-label">Công việc</div>
                            <div class="stat-val">${countCongViec}</div>
                        </div>
                    </div>
                    <div class="cal-stat-card">
                        <div class="stat-icon" style="background:#fef3c7; color:#d97706;"><i data-lucide="book-open"></i></div>
                        <div class="stat-content">
                            <div class="stat-label">Ghi chú & Học hỏi</div>
                            <div class="stat-val">${countGhiChu + countHocHoi}</div>
                        </div>
                    </div>
                </div>

                <!-- Main Agenda Section -->
                <div class="cal-day-main-content">
                    
                    ${dayEvents.length === 0 ? `
                        <div class="cal-day-empty-state">
                            <i data-lucide="calendar-x" style="width:48px;height:48px;color:#94a3b8;margin-bottom:12px;"></i>
                            <h3>Chưa có dữ liệu nào cho ngày này</h3>
                            <p style="color:#64748b; font-size:0.9rem; margin-bottom:16px;">Tạo nhanh ghi chú, công việc hoặc chi tiêu cho ngày ${pad2(dNum)}/${pad2(mNum + 1)}/${yNum}:</p>
                            <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                                <button type="button" class="primary-btn" data-action="quick-add-cal" data-tab="CONG_VIEC" data-date="${dateISO}" onclick="quickAddCalendarOnDate('CONG_VIEC', '${dateISO}')">
                                    <i data-lucide="check-square" style="width:15px;height:15px;"></i> Thêm công việc
                                </button>
                                <button type="button" class="primary-btn" style="background:#ef4444;" data-action="quick-add-cal" data-tab="CHI_TIEU" data-date="${dateISO}" onclick="quickAddCalendarOnDate('CHI_TIEU', '${dateISO}')">
                                    <i data-lucide="wallet" style="width:15px;height:15px;"></i> Thêm chi tiêu
                                </button>
                                <button type="button" class="secondary-btn" data-action="quick-add-cal" data-tab="GHI_CHU" data-date="${dateISO}" onclick="quickAddCalendarOnDate('GHI_CHU', '${dateISO}')">
                                    <i data-lucide="book-open" style="width:15px;height:15px;"></i> Thêm ghi chú
                                </button>
                            </div>
                        </div>
                    ` : `
                        <!-- 1. Timeline for Time-based items -->
                        ${timeBasedEvents.length > 0 ? `
                            <div class="cal-day-section">
                                <div class="cal-day-section-title">
                                    <i data-lucide="clock" style="width:18px;height:18px;color:var(--primary);"></i>
                                    <span>Lịch trình theo giờ (${timeBasedEvents.length})</span>
                                </div>
                                <div class="cal-timeline">
                                    ${timeBasedEvents.map(evt => renderDayEventCard(evt)).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <!-- 2. All-day & General Items -->
                        ${allDayEvents.length > 0 ? `
                            <div class="cal-day-section">
                                <div class="cal-day-section-title">
                                    <i data-lucide="list" style="width:18px;height:18px;color:#f59e0b;"></i>
                                    <span>Sự kiện cả ngày & Ghi chú (${allDayEvents.length})</span>
                                </div>
                                <div class="cal-timeline">
                                    ${allDayEvents.map(evt => renderDayEventCard(evt)).join('')}
                                </div>
                            </div>
                        ` : ''}
                    `}

                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

function renderDayEventCard(evt) {
    let metaTags = '';
    if (evt.status) {
        metaTags += `<span class="cal-card-tag status">${evt.status}</span>`;
    }
    if (evt.extra) {
        metaTags += `<span class="cal-card-tag info">${evt.extra}</span>`;
    }
    
    return `
        <div class="cal-day-card ${evt.typeClass}" data-action="cal-edit-event" data-tab="${evt.tabName}" data-row="${evt.rowIndex}" onclick="editEvent('${evt.tabName}', ${evt.rowIndex}, event)">
            <div class="cal-day-card-left">
                <div class="cal-card-time-badge">
                    ${evt.timeStr ? `<i data-lucide="clock" style="width:12px;height:12px;"></i> ${evt.timeStr}` : '<i data-lucide="calendar" style="width:12px;height:12px;"></i> Cả ngày'}
                </div>
                <div class="cal-day-type-chip">
                    <i data-lucide="${evt.icon}" style="width:13px;height:13px;"></i>
                    ${evt.typeLabel}
                </div>
            </div>
            
            <div class="cal-day-card-body">
                <div class="cal-day-card-title">${evt.title}</div>
                ${metaTags ? `<div class="cal-day-card-meta">${metaTags}</div>` : ''}
            </div>

            <div class="cal-day-card-actions">
                <button type="button" class="tag-btn" data-action="cal-edit-event" data-tab="${evt.tabName}" data-row="${evt.rowIndex}" style="background:#fff; border:1px solid #cbd5e1; font-weight:600; padding:4px 10px;" onclick="editEvent('${evt.tabName}', ${evt.rowIndex}, event)">
                    <i data-lucide="edit-2" style="width:13px;height:13px;display:inline-block;vertical-align:middle;margin-right:2px;"></i> Sửa
                </button>
            </div>
        </div>
    `;
}

// --- CALENDAR NAVIGATION & CONTROL FUNCTIONS ---

window.changeCalendarDate = function(offset) {
    let mode = window.calendarViewMode || 'month';
    if (!window.currentCalendarDate) window.currentCalendarDate = new Date();
    if (offset === 0) {
        window.currentCalendarDate = new Date();
    } else {
        if (mode === 'month') {
            window.currentCalendarDate.setMonth(window.currentCalendarDate.getMonth() + offset);
        } else if (mode === 'week') {
            window.currentCalendarDate.setDate(window.currentCalendarDate.getDate() + (offset * 7));
        } else if (mode === 'day') {
            window.currentCalendarDate.setDate(window.currentCalendarDate.getDate() + offset);
        }
    }
    renderCalendar();
};

window.changeCalendarMonth = function(offset) {
    window.changeCalendarDate(offset);
};

window.setCalendarViewMode = function(mode) {
    window.calendarViewMode = mode;
    renderCalendar();
};

window.switchToDayView = function(day, month, year) {
    window.currentCalendarDate = new Date(year, month, day);
    window.calendarViewMode = 'day';
    renderCalendar();
};

window.setCalendarFilter = function(filter) {
    window.calendarFilter = filter;
    renderCalendar();
};

window.quickAddCalendarOnDate = function(tabName, dateStr) {
    if (tabName && window.openRecordFormFromDash) {
        window.openRecordFormFromDash(tabName, null, null, dateStr);
    }
};

window.editEvent = function(tabName, rowIndex, e) {
    if (e) e.stopPropagation();
    if (tabName && window.openRecordFormFromDash) {
        const rowData = (window.cachedData && window.cachedData[tabName] || []).find(r => r._sheetRow === rowIndex);
        if (rowData) {
            window.openRecordFormFromDash(tabName, rowData, rowIndex);
        }
    }
};

window.openDayView = function(day, month, year) {
    // Open Day View directly
    window.switchToDayView(day, month, year);
};

window.closeDayView = function() {
    const modal = document.getElementById('dayViewModal');
    if (modal) modal.style.display = 'none';
};

window.addFromCalendar = function() {
    const modal = document.getElementById('addSelectionModal');
    if (modal) modal.style.display = 'flex';
};

