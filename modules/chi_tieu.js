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


function setExpenseFilter(col, val) {
    if (val) activeExpenseFilters[col] = val;
    else delete activeExpenseFilters[col];
    renderTabFilters();
    filterTable();
}


