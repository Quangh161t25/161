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
            <div class="kanban-column" style="background: #f1f5f9; border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 12px; flex: 1; min-width: 250px;" data-action="drop-task" data-status="${status}">
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

                        const ghim = t[15];
                        let isPinned = (ghim === '1' || ghim === 'x' || String(ghim).toUpperCase() === 'TRUE');
                        let pinColor = isPinned ? 'var(--primary)' : '#94a3b8';
                        let fill = isPinned ? 'var(--primary)' : 'none';

                        return `
                        <div class="task-card" style="margin: 0; cursor: grab; padding: 12px; position: relative;" draggable="true" data-action="drag-task" data-row="${t._sheetRow}" ondblclick='openRecordForm(${JSON.stringify(t).replace(/'/g, "&#39;")}, ${t._sheetRow})'>
                            <button type="button" data-action="toggle-pin" data-row="${t._sheetRow}" data-col="15" data-pinned="${isPinned}" style="position:absolute; top:8px; right:8px; background:transparent; border:none; cursor:pointer; padding:4px;">
                                <i data-lucide="pin" style="width:14px; height:14px; color:${pinColor}; fill:${fill};"></i>
                            </button>
                            <div style="font-weight: 700; margin-bottom: 6px; font-size: 0.95rem; padding-right: 20px;">${t[1]}</div>
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


function setTaskFilter(col, val) {
    if (val) activeTaskFilters[col] = val;
    else delete activeTaskFilters[col];
    renderTabFilters();
    filterTable();
}


