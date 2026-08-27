function formatMoney(num) {
    if (!num && num !== 0) return '';
    return Number(num).toLocaleString('vi-VN');
}


function parseSheetDate(d) {
    if (!d) return 0;
    const str = String(d).trim();
    if (str.includes('/')) {
        const parts = str.split(' ');
        const dateParts = parts[0].split('/');
        if (dateParts.length === 3) {
            const y = dateParts[2].length === 2 ? '20' + dateParts[2] : dateParts[2];
            const m = dateParts[1].padStart(2, '0');
            const day = dateParts[0].padStart(2, '0');
            const timePart = parts[1] || '00:00';
            const t = new Date(`${y}-${m}-${day}T${timePart.length === 5 ? timePart + ':00' : timePart}`).getTime();
            if (!isNaN(t)) return t;
            const fallbackT = new Date(`${y}-${m}-${day}`).getTime();
            if (!isNaN(fallbackT)) return fallbackT;
        }
    }
    const directT = new Date(str).getTime();
    return isNaN(directT) ? 0 : directT;
}


function copyToClipboard(text, event) {
    if (event) {
        event.stopPropagation();
    }
    navigator.clipboard.writeText(text).then(() => {
        const btn = event ? event.currentTarget : null;
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
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('change'));
}
