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


