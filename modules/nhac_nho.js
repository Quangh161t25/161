function checkReminders() {
    if (!window.cachedData || !window.cachedData['CONG_VIEC'] || !window.cachedData['DSNV']) return;
    if ("Notification" in window && Notification.permission === "granted") {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
        const lastNotified = localStorage.getItem('lastNotifiedDate');
        
        // Chỉ thông báo 1 lần mỗi ngày
        if (lastNotified !== todayStr) {
            let tasksDueToday = 0;
            let birthdaysToday = 0;
            
            // Check deadline
            const congViecData = window.cachedData['CONG_VIEC'];
            const cvConfig = CONFIG.tabs['CONG_VIEC'];
            congViecData.forEach(row => {
                const status = row[cvConfig.headers.indexOf('trang_thai')];
                const dateVal = row[cvConfig.headers.indexOf('ngay')];
                if (status !== 'Hoàn thành' && dateVal) {
                    const d = parseSheetDate(dateVal);
                    if (d) {
                        const dateObj = new Date(d);
                        if (dateObj.getDate() === today.getDate() && 
                            dateObj.getMonth() === today.getMonth() && 
                            dateObj.getFullYear() === today.getFullYear()) {
                            tasksDueToday++;
                        }
                    }
                }
            });

            // Check birthday
            const nvData = window.cachedData['DSNV'];
            const nvConfig = CONFIG.tabs['DSNV'];
            const birthdayNames = [];
            nvData.forEach(row => {
                const dobVal = row[nvConfig.headers.indexOf('ngay_sinh')];
                const name = row[nvConfig.headers.indexOf('ho_ten')];
                if (dobVal) {
                    const d = parseSheetDate(dobVal);
                    if (d) {
                        const dateObj = new Date(d);
                        if (dateObj.getDate() === today.getDate() && dateObj.getMonth() === today.getMonth()) {
                            birthdaysToday++;
                            birthdayNames.push(name);
                        }
                    }
                }
            });

            if (tasksDueToday > 0 || birthdaysToday > 0) {
                let bodyText = '';
                if (tasksDueToday > 0) bodyText += `Hôm nay có ${tasksDueToday} deadline cần làm.\n`;
                if (birthdaysToday > 0) bodyText += `Hôm nay là sinh nhật của ${birthdayNames.join(', ')}.\n`;
                
                new Notification("InfoSys - Nhắc việc hôm nay", {
                    body: bodyText.trim(),
                    icon: "favicon.png"
                });
                localStorage.setItem('lastNotifiedDate', todayStr);
            }
        }
    }
}



