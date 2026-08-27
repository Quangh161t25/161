    // ---- Register Service Worker ----
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => {
            console.log('[SW] Registered:', reg.scope);
            window._swReg = reg;
          })
          .catch(err => console.warn('[SW] Failed:', err));
      });
    }

    // ---- Notification permission + deadline checker ----
    async function requestNotificationPermission() {
      if (!('Notification' in window)) return false;
      if (Notification.permission === 'granted') return true;
      if (Notification.permission === 'denied') return false;
      const result = await Notification.requestPermission();
      return result === 'granted';
    }

    // Ask for notification permission after first interaction
    document.addEventListener('click', async function askOnce() {
      document.removeEventListener('click', askOnce);
      const granted = await requestNotificationPermission();
      if (granted) {
        console.log('[Notifications] Permission granted');
        // Start periodic deadline check
        setInterval(checkDeadlines, 30 * 60 * 1000); // every 30 min
      }
    }, { once: true });

    // Check CONG_VIEC deadlines and notify via SW
    function checkDeadlines() {
        // Feature disabled as deadline column was removed
    } catch(e) { return; }

        if (isNaN(dl)) return;
        dl.setHours(0,0,0,0);

        if (dl < today) overdue.push(title);
        else if (dl.getTime() === today.getTime()) todayTasks.push(title);
      });

      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CHECK_DEADLINES',
          overdue,
          today: todayTasks
        });
      }
    }

    // Handle shortcut URLs (#them, #chitieu etc.)
    window.addEventListener('DOMContentLoaded', () => {
      const hash = location.hash.replace('#', '').toUpperCase();
      const tabMap = { THEM: 'THEM', CHITIEU: 'CHI_TIEU', GHICHU: 'GHI_CHU', CONGVIEC: 'CONG_VIEC', HOCHOI: 'HOC_HOI' };
      if (hash && tabMap[hash]) {
        setTimeout(() => window.switchTab && window.switchTab(tabMap[hash]), 800);
      }
    });

