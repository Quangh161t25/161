function renderAnalytics() {
    const container = document.getElementById('analyticsDashboard');
    if (!container) return;
    
    // Đảm bảo dữ liệu đã được tải
    if (!window.cachedData['CHI_TIEU'] || !window.cachedData['CONG_VIEC']) {
        container.innerHTML = '<div style="padding:20px; text-align:center;">Đang tải dữ liệu hoặc không có dữ liệu...</div>';
        return;
    }
    
    const chiTieuData = window.cachedData['CHI_TIEU'];
    const chiTieuConfig = CONFIG.tabs['CHI_TIEU'];
    const congViecData = window.cachedData['CONG_VIEC'];
    const congViecConfig = CONFIG.tabs['CONG_VIEC'];
    
    // 1. Thống kê Chi tiêu tháng hiện tại
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const expenseByCategory = {};
    chiTieuData.forEach(row => {
        const dateVal = row[chiTieuConfig.headers.indexOf('ngay')];
        const category = row[chiTieuConfig.headers.indexOf('loai_giao_dich')] || 'Khác';
        const amountStr = row[chiTieuConfig.headers.indexOf('so_tien')];
        const type = row[chiTieuConfig.headers.indexOf('phan_loai')]; // Thu / Chi
        
        if (type !== 'Chi') return;
        
        const d = parseSheetDate(dateVal);
        if (d) {
            const dateObj = new Date(d);
            if (dateObj.getMonth() + 1 === currentMonth && dateObj.getFullYear() === currentYear) {
                const amount = parseFloat(String(amountStr).replace(/,/g, '')) || 0;
                if (!expenseByCategory[category]) expenseByCategory[category] = 0;
                expenseByCategory[category] += amount;
            }
        }
    });
    
    // 2. Thống kê năng suất công việc (Tuần)
    // Tính 4 tuần gần nhất
    const weeks = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7) - now.getDay() + 1); // Monday
        const end = new Date(start);
        end.setDate(end.getDate() + 6); // Sunday
        weeks.push({
            label: `${start.getDate()}/${start.getMonth()+1} - ${end.getDate()}/${end.getMonth()+1}`,
            start: start.getTime(),
            end: end.getTime(),
            count: 0
        });
    }
    
    congViecData.forEach(row => {
        const status = row[congViecConfig.headers.indexOf('trang_thai')];
        const dateVal = row[congViecConfig.headers.indexOf('ngay')]; // Ngày hoàn thành hoặc ngày làm
        if (status !== 'Hoàn thành') return;
        
        const d = parseSheetDate(dateVal);
        if (d) {
            weeks.forEach(w => {
                if (d >= w.start && d <= w.end) {
                    w.count++;
                }
            });
        }
    });

    container.innerHTML = `
        <div style="width:100%; display:flex; flex-wrap:wrap; gap:20px;">
            <div style="flex:1; min-width:300px; background:#fff; padding:20px; border-radius:12px; box-shadow:var(--shadow);">
                <h3 style="margin-bottom:15px; font-size:1.1rem; color:var(--text-dark);">Chi tiêu tháng ${currentMonth}/${currentYear}</h3>
                ${Object.keys(expenseByCategory).length === 0 ? '<p>Không có dữ liệu chi tiêu.</p>' : '<div style="position:relative; height:300px;"><canvas id="expenseChart"></canvas></div>'}
            </div>
            <div style="flex:1; min-width:300px; background:#fff; padding:20px; border-radius:12px; box-shadow:var(--shadow);">
                <h3 style="margin-bottom:15px; font-size:1.1rem; color:var(--text-dark);">Năng suất (4 tuần qua)</h3>
                <div style="position:relative; height:300px;"><canvas id="taskChart"></canvas></div>
            </div>
        </div>
    `;

    // Vẽ biểu đồ
    setTimeout(() => {
        if (Object.keys(expenseByCategory).length > 0) {
            const ctxExpense = document.getElementById('expenseChart');
            if (ctxExpense) {
                if (expenseChartInstance) expenseChartInstance.destroy();
                expenseChartInstance = new Chart(ctxExpense, {
                    type: 'doughnut',
                    data: {
                        labels: Object.keys(expenseByCategory),
                        datasets: [{
                            data: Object.values(expenseByCategory),
                            backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom' }
                        }
                    }
                });
            }
        }

        const ctxTask = document.getElementById('taskChart');
        if (ctxTask) {
            if (taskChartInstance) taskChartInstance.destroy();
            taskChartInstance = new Chart(ctxTask, {
                type: 'bar',
                data: {
                    labels: weeks.map(w => w.label),
                    datasets: [{
                        label: 'Hoàn thành',
                        data: weeks.map(w => w.count),
                        backgroundColor: '#5b5ef4',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1 } }
                    }
                }
            });
        }
    }, 100);
}


