function renderTaskDashboard() {
    const dash = document.getElementById('taskDashboard');
    if (!dash || currentTab !== 'CONG_VIEC') return;

    let todayTasks = 0;
    let completedTasks = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filteredData.forEach(row => {
        const status = row[4]; // trang_thai is now index 4

        todayTasks++;
        if (status === 'Hoàn thành') completedTasks++;
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
            <h3>Chưa xong</h3>
            <p class="amount negative">${todayTasks - completedTasks}</p>
        </div>
    `;
}


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
        const status = row[4] || 'Chưa làm'; // trang_thai is now index 4
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

        // Group tasks by date of ngay_bat_dau (row[5])
        const dateGroups = {};
        tasks.forEach(t => {
            const rawDate = t[5] || '';
            let dateKey = 'Chưa có ngày';
            if (rawDate) {
                const str = String(rawDate).trim();
                if (str.includes(' ')) {
                    dateKey = str.split(' ')[0];
                } else if (str.includes('T')) {
                    const [dPart] = str.split('T');
                    const [y, m, d] = dPart.split('-');
                    dateKey = (y && m && d) ? `${d}/${m}/${y}` : dPart;
                } else {
                    dateKey = str;
                }
            }
            if (!dateGroups[dateKey]) dateGroups[dateKey] = [];
            dateGroups[dateKey].push(t);
        });

        let cardsHtml = '';
        const dateKeys = Object.keys(dateGroups);

        if (dateKeys.length === 0) {
            cardsHtml = `<div style="color:#94a3b8; font-size:0.85rem; text-align:center; padding: 20px 0;">Không có công việc</div>`;
        } else {
            dateKeys.forEach(dKey => {
                const groupTasks = dateGroups[dKey];
                cardsHtml += `
                    <div class="kanban-date-group" style="margin-bottom: 12px;">
                        <div style="font-size: 0.76rem; font-weight: 700; color: #475569; background: #e2e8f0; padding: 3px 8px; border-radius: 6px; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 4px;">
                            <i data-lucide="calendar" style="width:12px; height:12px;"></i> ${dKey}
                            <span style="background:#cbd5e1; color:#334155; padding:0 5px; border-radius:10px; font-size:0.7rem; margin-left:2px;">${groupTasks.length}</span>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            ${groupTasks.map(t => {
                                const danh_muc = t[3]; // danh_muc is index 3
                                const ngay_bat_dau = t[5] || ''; // ngay_bat_dau is index 5
                                const ghim = t[12]; // ghim is index 12
                                let isPinned = (ghim === '1' || ghim === 'x' || String(ghim).toUpperCase() === 'TRUE');
                                let pinColor = isPinned ? 'var(--primary)' : '#94a3b8';
                                let fill = isPinned ? 'var(--primary)' : 'none';

                                return `
                                <div class="task-card" draggable="true" data-action="drag-task" data-row="${t._sheetRow}" ondragstart="dragStart(event, '${t._sheetRow}')" style="margin: 0; cursor: grab; padding: 12px; position: relative; background: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.03); transition: transform 0.15s ease, box-shadow 0.15s ease;" ondblclick='openRecordForm(${JSON.stringify(t).replace(/'/g, "&#39;")}, ${t._sheetRow})'>
                                    <button type="button" data-action="toggle-pin" data-row="${t._sheetRow}" data-col="12" data-pinned="${isPinned}" onclick="event.stopPropagation();" style="position:absolute; top:8px; right:8px; background:transparent; border:none; cursor:pointer; padding:4px;">
                                        <i data-lucide="pin" style="width:14px; height:14px; color:${pinColor}; fill:${fill};"></i>
                                    </button>
                                    <div style="font-weight: 700; margin-bottom: 6px; font-size: 0.92rem; padding-right: 22px; word-break: break-word; line-height: 1.4; color: #1e293b;" title="${(t[1] || '').replace(/"/g, '&quot;')}">${t[1] || 'Không tiêu đề'}</div>
                                    ${ngay_bat_dau ? `<div style="font-size: 0.78rem; color: #64748b; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;"><i data-lucide="clock" style="width:12px; height:12px;"></i> ${ngay_bat_dau}</div>` : ''}
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 4px;">
                                        <span class="task-card-badge badge-gray" style="font-size: 0.72rem; padding: 2px 7px; border-radius: 6px;">${danh_muc || 'Công việc'}</span>
                                    </div>
                                </div>`;
                            }).join('')}
                        </div>
                    </div>
                `;
            });
        }

        kanbanHtml += `
            <div class="kanban-column" data-action="drop-task" data-status="${status}" ondragover="allowDrop(event)" ondrop="dropTask(event, '${status}')" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 10px; width: 100%; min-width: 0; box-sizing: border-box;">
                <div style="font-weight: 800; color: ${headerColor}; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; display:flex; justify-content:space-between; align-items: center;">
                    <span>${status}</span>
                    <span style="background:#e2e8f0; color:#475569; padding:2px 8px; border-radius:12px; font-size:0.8rem;">${tasks.length}</span>
                </div>
                <div class="kanban-cards" data-action="drop-task" data-status="${status}" ondragover="allowDrop(event)" ondrop="dropTask(event, '${status}')" style="display: flex; flex-direction: column; gap: 6px; overflow-y:auto; max-height: 70vh; padding-right: 2px; min-height: 100px;">
                    ${cardsHtml}
                </div>
            </div>
        `;
    });

    kanbanDash.style.display = 'grid';
    kanbanDash.style.gridTemplateColumns = 'repeat(4, minmax(0, 1fr))';
    kanbanDash.style.gap = '16px';
    kanbanDash.style.width = '100%';
    kanbanDash.style.boxSizing = 'border-box';
    kanbanDash.innerHTML = kanbanHtml;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}


function dragStart(event, sheetRow) {
    if (event.dataTransfer) {
        event.dataTransfer.setData("text/plain", String(sheetRow));
        event.dataTransfer.effectAllowed = "move";
    }
}

function allowDrop(event) {
    event.preventDefault();
    if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
    }
}

async function dropTask(event, newStatus) {
    event.preventDefault();
    const sheetRow = event.dataTransfer ? event.dataTransfer.getData("text/plain") : null;
    if (!sheetRow) return;

    // Find the task in allData
    const taskIndex = allData.findIndex(row => String(row._sheetRow) === String(sheetRow));
    if (taskIndex === -1) return;

    const task = allData[taskIndex];
    const statusColIndex = CONFIG.tabs['CONG_VIEC'] ? CONFIG.tabs['CONG_VIEC'].headers.indexOf('trang_thai') : 4;
    if (task[statusColIndex] === newStatus) return; // No change

    // Optimistically update
    task[statusColIndex] = newStatus;
    const fTaskIndex = filteredData.findIndex(row => String(row._sheetRow) === String(sheetRow));
    if (fTaskIndex !== -1) {
        filteredData[fTaskIndex][statusColIndex] = newStatus;
    }

    renderKanban();

    // Send update to Google Sheets
    try {
        const token = await getAccessToken();
        const colLetter = String.fromCharCode(65 + statusColIndex); // 0=A, 1=B, 2=C, 3=D, 4=E
        
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

        if (window.cachedData) window.cachedData['CONG_VIEC'] = null;
    } catch (err) {
        console.error("Error updating status:", err);
        alert("Lỗi khi cập nhật trạng thái!");
        if (typeof fetchData === 'function') await fetchData(true);
    }
}


function setTaskFilter(col, val) {
    if (val) activeTaskFilters[col] = val;
    else delete activeTaskFilters[col];
    renderTabFilters();
    filterTable();
}


