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


async function fetchData(forceReload = false) {
    if (!currentTab) return;
    
    if (!forceReload && window.cachedData[currentTab]) {
        allData = window.cachedData[currentTab];
        if (currentTab === 'CHI_TIEU') {
            calculateExpenseBalances();
        } else if (currentTab === 'CONG_VIEC') {
            allData.sort((a, b) => {
                const dateA = parseSheetDate(a[5]);
                const dateB = parseSheetDate(b[5]);
                if (dateA !== dateB && dateA !== 0 && dateB !== 0) return dateB - dateA;
                return b._sheetRow - a._sheetRow;
            });
        } else if (currentTab === 'BANG_TAM') {
            allData.sort((a, b) => {
                const dateB = parseSheetDate(b[2]) || parseSheetDate(b[1]);
                const dateA = parseSheetDate(a[2]) || parseSheetDate(a[1]);
                const dateDiff = dateB - dateA;
                if (dateDiff !== 0) return dateDiff;
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

        if (currentTab === 'DSNV') {
            allData.sort((a, b) => (a[1] || '').localeCompare(b[1] || '', 'vi', { sensitivity: 'base' }));
        }
        if (currentTab === 'CHI_TIEU') {
            calculateExpenseBalances();
        } else if (currentTab === 'CONG_VIEC') {
            allData.sort((a, b) => {
                const dateA = parseSheetDate(a[5]); // ngay_bat_dau is index 5
                const dateB = parseSheetDate(b[5]);
                if (dateA !== dateB && dateA !== 0 && dateB !== 0) return dateB - dateA;
                return b._sheetRow - a._sheetRow;
            });
        } else if (currentTab === 'BANG_TAM') {
            allData.sort((a, b) => {
                const dateB = parseSheetDate(b[2]) || parseSheetDate(b[1]);
                const dateA = parseSheetDate(a[2]) || parseSheetDate(a[1]);
                const dateDiff = dateB - dateA;
                if (dateDiff !== 0) return dateDiff;
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


async function getSheetId(tabName) {
    const token = await getAccessToken();
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const sheet = data.sheets.find(s => s.properties.title === tabName);
    return sheet ? sheet.properties.sheetId : null;
}


async function uploadToImgbb(fileInput, targetInputId, previewId = null) {
    if (!fileInput.files || fileInput.files.length === 0) return;
    
    const file = fileInput.files[0];
    const statusSpan = document.getElementById(fileInput.id.replace('file_', 'upload_status_'));
    const targetInput = document.getElementById(targetInputId);
    const previewImg = previewId ? document.getElementById(previewId) : null;
    
    if (statusSpan) statusSpan.innerText = "Đang tải lên...";
    
    // API key mặc định cho ImgBB (có thể đổi bằng key riêng của người dùng)
    const IMGBB_API_KEY = '1bad1429a242d7040fda3f2cfddb3a25';
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        
        if (data.success) {
            if (targetInput) {
                targetInput.value = data.data.url;
                // Dispatch input event to update preview if it has an oninput handler
                targetInput.dispatchEvent(new Event('input'));
            }
            if (previewImg) {
                previewImg.src = data.data.url;
                previewImg.style.display = 'block';
            }
            if (statusSpan) {
                statusSpan.innerText = "Thành công!";
                statusSpan.style.color = "#10b981";
            }
        } else {
            throw new Error(data.error.message || 'Lỗi không xác định');
        }
    } catch (err) {
        console.error(err);
        if (statusSpan) {
            statusSpan.innerText = "Lỗi tải ảnh";
            statusSpan.style.color = "#ef4444";
        }
        alert("Upload ảnh thất bại: " + err.message);
    } finally {
        fileInput.value = ""; // reset input
    }
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
            if ((h === 'ngay' || h === 'ngay_sinh') && val) {
                const [y, m, d] = val.split('-');
                if (y && m && d) val = `${d}/${m}/${y}`;
            } else if (['ngay_in', 'ngay_out', 'ngay_bat_dau', 'ngay_hoan_thanh', 'ngay_gio'].includes(h) && val) {
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
        if (currentView === 'LICH') {
            if (typeof renderCalendar === 'function') await renderCalendar();
        } else {
            await fetchData(true);
        }
    } catch (err) {
        console.error(err);
        alert("Lưu thất bại: " + err.message);
        document.getElementById('loading').style.display = 'none';
    }
}


async function deleteCurrentRecord() {
    if (!editingSheetRow || !currentTab) return;
    if (!confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) return;

    document.getElementById('loading').style.display = 'flex';
    document.getElementById('loading').querySelector('p').innerText = 'Đang xóa...';

    try {
        const sheetId = await getSheetId(currentTab);
        if (sheetId === null) throw new Error('Không tìm thấy sheet ID.');
        const token = await getAccessToken();

        const res = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}:batchUpdate`,
            {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requests: [{
                        deleteDimension: {
                            range: {
                                sheetId: sheetId,
                                dimension: 'ROWS',
                                startIndex: editingSheetRow - 1,
                                endIndex: editingSheetRow
                            }
                        }
                    }]
                })
            }
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || 'Lỗi khi xóa');
        }

        closeProductForm();
        window.cachedData[currentTab] = null;
        if (currentView === 'LICH') {
            if (typeof renderCalendar === 'function') await renderCalendar();
        } else {
            await fetchData(true);
        }
    } catch (e) {
        alert('Xóa thất bại: ' + e.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
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


async function executeBatchEditGeneric() {
    const checkboxes = document.querySelectorAll('.row-checkbox:checked');
    if (checkboxes.length === 0 || !window.batchEditTargetCol) return;

    const newValue = document.getElementById('batchEditPhanLoaiInput').value;
    if (newValue === '') {
        if (!confirm("Bạn không nhập giá trị nào, mục này sẽ bị để trống. Tiếp tục?")) return;
    }

    closeBatchEditModal();
    document.getElementById('loading').style.display = 'flex';
    try {
        const token = await getAccessToken();
        const tabConfig = CONFIG.tabs[currentTab];
        const colIndex = tabConfig.headers.indexOf(window.batchEditTargetCol);
        if (colIndex === -1) throw new Error("Không tìm thấy cột dữ liệu.");

        let colLetter;
        if (colIndex < 26) {
            colLetter = String.fromCharCode(65 + colIndex);
        } else {
            colLetter = String.fromCharCode(64 + Math.floor(colIndex / 26)) + String.fromCharCode(65 + (colIndex % 26));
        }

        const dataToUpdate = Array.from(checkboxes).map(cb => {
            const rowIndex = cb.getAttribute('data-index');
            return {
                range: `${currentTab}!${colLetter}${rowIndex}`,
                values: [[newValue]]
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

        await fetchData(true);
    } catch (e) {
        console.error(e);
        alert("Lỗi: " + e.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}



