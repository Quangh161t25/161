let currentCalendarDate = new Date();

async function renderCalendar() {
    const calDash = document.getElementById('calendarDashboard');
    if (!calDash) return;
    
    const tabsToFetch = ['GHI_CHU', 'CHI_TIEU', 'HOC_HOI', 'CONG_VIEC', 'DSNV'];
    const allCached = tabsToFetch.every(tabName => window.cachedData && window.cachedData[tabName]);
    if (!allCached) {
        document.getElementById('loading').style.display = 'flex';
    }
    
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

        const allResults = await Promise.all(promises);
        document.getElementById('loading').style.display = 'none';
        
        let events = [];
        allResults.forEach(result => {
            result.data.forEach(row => {
                let eventDateStr = '';
                let title = '';
                let typeClass = '';
                let icon = '';
                
                if (result.tabName === 'GHI_CHU') {
                    eventDateStr = row[1]; 
                    title = row[4]; 
                    typeClass = 'cal-evt-ghi_chu';
                    icon = 'book-open';
                } else if (result.tabName === 'CHI_TIEU') {
                    eventDateStr = row[1]; 
                    const loai = row[2];
                    const soTien = row[4];
                    title = `${loai}: ${soTien}`;
                    typeClass = loai === 'Chi' ? 'cal-evt-chi_tieu_chi' : 'cal-evt-chi_tieu_thu';
                    icon = 'wallet';
                } else if (result.tabName === 'HOC_HOI') {
                    eventDateStr = row[1]; 
                    title = row[2]; 
                    typeClass = 'cal-evt-hoc_hoi';
                    icon = 'lightbulb';
                } else if (result.tabName === 'CONG_VIEC') {
                    eventDateStr = row[7]; // deadline
                    title = row[1]; 
                    typeClass = 'cal-evt-cong_viec';
                    icon = 'check-square';
                } else if (result.tabName === 'DSNV') {
                    eventDateStr = row[4]; // ngay_sinh
                    title = `Sinh nhật: ${row[1] || 'Không tên'}`; // ho_ten
                    typeClass = 'cal-evt-dsnv';
                    icon = 'gift';
                }
                
                if (!eventDateStr) return;
                
                const parts = String(eventDateStr).split(' ')[0].split('/'); 
                if (parts.length < 3) return;
                
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                let year = parseInt(parts[2], 10);
                
                if (result.tabName === 'DSNV') {
                    year = currentCalendarDate.getFullYear();
                }
                
                events.push({
                    day, month, year,
                    title: title || 'Không tên',
                    typeClass, icon,
                    tabName: result.tabName,
                    rowIndex: row._sheetRow,
                    rowData: row
                });
            });
        });
        
        drawCalendarUI(calDash, events);
        if (window.lucide) window.lucide.createIcons();
        
    } catch (error) {
        console.error('Error loading calendar data:', error);
        document.getElementById('loading').style.display = 'none';
        calDash.innerHTML = `<div style="padding: 20px; color: red;">Lỗi tải dữ liệu lịch: ${error.message}</div>`;
    }
}

window.calendarFilter = 'ALL';

function drawCalendarUI(container, events) {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    let startingDay = firstDay.getDay(); 
    const startCellIndex = startingDay === 0 ? 6 : startingDay - 1;
    
    const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
    
    const filteredEvents = (window.calendarFilter === 'ALL' || window.calendarFilter === 'LICH_SU') 
        ? events 
        : events.filter(e => e.tabName === window.calendarFilter);
    window._currentCalendarEvents = filteredEvents; // Store for day view

    let html = `
        <div class="calendar-container">
            <div class="calendar-header" style="flex-wrap: wrap; gap: 10px; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <h2>${monthNames[month]}, ${year}</h2>
                    <div class="calendar-nav">
                        <button onclick="changeCalendarMonth(-1)" title="Tháng trước">
                            <i data-lucide="chevron-left" style="width:18px;height:18px;"></i>
                        </button>
                        <button onclick="changeCalendarMonth(0)" title="Hôm nay">Hôm nay</button>
                        <button onclick="changeCalendarMonth(1)" title="Tháng sau">
                            <i data-lucide="chevron-right" style="width:18px;height:18px;"></i>
                        </button>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div class="calendar-filters" style="display: flex; gap: 5px; overflow-x: auto;">
                        <button class="tag-btn" style="${window.calendarFilter === 'ALL' ? 'background:var(--primary);color:#fff;' : ''}" onclick="setCalendarFilter('ALL')">Tất cả</button>
                        <button class="tag-btn" style="${window.calendarFilter === 'GHI_CHU' ? 'background:var(--primary);color:#fff;' : ''}" onclick="setCalendarFilter('GHI_CHU')">Ghi chú</button>
                        <button class="tag-btn" style="${window.calendarFilter === 'CHI_TIEU' ? 'background:var(--primary);color:#fff;' : ''}" onclick="setCalendarFilter('CHI_TIEU')">Chi tiêu</button>
                        <button class="tag-btn" style="${window.calendarFilter === 'CONG_VIEC' ? 'background:var(--primary);color:#fff;' : ''}" onclick="setCalendarFilter('CONG_VIEC')">Công việc</button>
                        <button class="tag-btn" style="${window.calendarFilter === 'HOC_HOI' ? 'background:var(--primary);color:#fff;' : ''}" onclick="setCalendarFilter('HOC_HOI')">Học hỏi</button>
                        <button class="tag-btn" style="${window.calendarFilter === 'DSNV' ? 'background:var(--primary);color:#fff;' : ''}" onclick="setCalendarFilter('DSNV')">Sinh nhật</button>
                        <button class="tag-btn" style="${window.calendarFilter === 'LICH_SU' ? 'background:var(--primary);color:#fff;' : ''}" onclick="setCalendarFilter('LICH_SU')">
                            <i data-lucide="history" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:2px;"></i> Lịch sử
                        </button>
                    </div>
                    <button class="add-btn" style="background:var(--primary);color:#fff;border:none;padding:6px 12px;border-radius:8px;font-weight:600;display:flex;align-items:center;gap:4px;cursor:pointer;" onclick="addFromCalendar()">
                        <i data-lucide="plus" style="width:16px;height:16px;"></i> Thêm mới
                    </button>
                </div>
            </div>
            <div class="calendar-grid">
                <div class="calendar-day-header">Thứ 2</div>
                <div class="calendar-day-header">Thứ 3</div>
                <div class="calendar-day-header">Thứ 4</div>
                <div class="calendar-day-header">Thứ 5</div>
                <div class="calendar-day-header">Thứ 6</div>
                <div class="calendar-day-header">Thứ 7</div>
                <div class="calendar-day-header">CN</div>
    `;
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < startCellIndex; i++) {
        const dayNum = prevMonthLastDay - startCellIndex + i + 1;
        html += `<div class="calendar-day other-month"><span class="day-number">${dayNum}</span></div>`;
    }
    
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const isToday = today.getDate() === i && today.getMonth() === month && today.getFullYear() === year;
        const classes = isToday ? 'calendar-day today' : 'calendar-day';
        
        let dayEvents = [];
        if (window.calendarFilter === 'LICH_SU') {
            dayEvents = filteredEvents.filter(e => e.day === i && e.month === month && e.year < year && e.tabName !== 'DSNV');
            dayEvents = dayEvents.map(e => ({
                ...e,
                title: `[${year - e.year} năm trước] ${e.title}`
            }));
        } else {
            dayEvents = filteredEvents.filter(e => e.day === i && e.month === month && e.year === year);
        }
        
        let eventsHtml = '';
        dayEvents.forEach(evt => {
            eventsHtml += `
                <div class="calendar-event ${evt.typeClass}" onclick="editEvent('${evt.tabName}', ${evt.rowIndex}, event)" title="${evt.title}">
                    <i data-lucide="${evt.icon}"></i>
                    <span class="evt-title">${evt.title}</span>
                </div>
            `;
        });
        
        html += `
            <div class="${classes}" onclick="openDayView(${i}, ${month}, ${year})">
                <span class="day-number">${i}</span>
                <div class="calendar-events">
                    ${eventsHtml}
                </div>
            </div>
        `;
    }
    
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

window.changeCalendarMonth = function(offset) {
    if (offset === 0) {
        currentCalendarDate = new Date();
    } else {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + offset);
    }
    renderCalendar();
};

window.setCalendarFilter = function(filter) {
    window.calendarFilter = filter;
    renderCalendar();
};

window.editEvent = function(tabName, rowIndex, e) {
    if (e) e.stopPropagation();
    if (tabName && window.openRecordFormFromDash) {
        const rowData = (window.cachedData[tabName] || []).find(r => r._sheetRow === rowIndex);
        if (rowData) {
            window.openRecordFormFromDash(tabName, rowData, rowIndex);
        }
    }
};

window.openDayView = function(day, month, year) {
    const modal = document.getElementById('dayViewModal');
    if (!modal) return;
    
    const dayEvents = (window._currentCalendarEvents || []).filter(e => e.day === day && e.month === month && e.year === year);
    const listContainer = document.getElementById('dayViewList');
    document.getElementById('dayViewTitle').innerText = `Các mục ngày ${day}/${month + 1}/${year}`;
    
    if (dayEvents.length === 0) {
        listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">Không có dữ liệu nào trong ngày này.</div>';
    } else {
        let html = '<div class="feed-list" style="padding: 0; max-height: 60vh; overflow-y: auto;">';
        dayEvents.forEach(evt => {
            html += `
                <div class="feed-item" onclick="editEvent('${evt.tabName}', ${evt.rowIndex}, event); closeDayView()">
                    <div class="feed-item-top">
                        <div class="feed-item-title">${evt.title}</div>
                        <span class="feed-item-date" style="background: var(--bg); padding: 2px 6px; border-radius: 4px; font-size: 0.7rem;">
                            ${evt.tabName}
                        </span>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        listContainer.innerHTML = html;
    }
    
    modal.style.display = 'flex';
};

window.closeDayView = function() {
    const modal = document.getElementById('dayViewModal');
    if (modal) modal.style.display = 'none';
};

window.addFromCalendar = function() {
    const modal = document.getElementById('addSelectionModal');
    if (modal) modal.style.display = 'flex';
};
