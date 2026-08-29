// tests
// https://www.youtube.com/
// https://www.google.com/search?q=english+text&tbm=isch

{
  const HTMLElement = HTMLDivElement.__proto__;
  const get = CustomElementRegistry.prototype.get.bind(customElements);
  const define = CustomElementRegistry.prototype.define.bind(customElements);

  if (get('ocr-container') === undefined) {
    // This document requires 'TrustedHTML' assignment
    self.trustedTypes?.createPolicy('default', {
      createHTML(s) {
        return s;
      }
    });

    class OCRContainer extends HTMLElement {
      constructor() {
        super();

        const shadow = this.attachShadow({mode: 'open'});
        shadow.innerHTML = `
          <style>
            #body {
              position: fixed;
              bottom: 10px;
              right: 30px;
              padding: 5px;
              z-index: 10000000000;
              box-shadow: 0 0 2px #ccc;
              display: flex;
              gap: 5px;
              flex-direction: column;
              background-color: #fff;
              max-height: calc(100vh - 20px);
              color-scheme: light;
              overflow: auto;
            }
          </style>
          <div id="body">
            <slot></slot>
          </div>
        `;
      }
    }
    // customElements.define('ocr-container', OCRContainer);
    define('ocr-container', OCRContainer);
  }

  if (get('ocr-result') === undefined) {
    class OCRResult extends HTMLElement {
      constructor() {
        super();

        this.prefs = {
          'post-method': 'POST',
          'post-href': '',
          'post-body': '',
          'lang': 'vie',
          'frequently-used': ['vie', 'eng', 'fra', 'deu', 'rus', 'ara', 'jpn', 'kor', 'chi_sim'],
          'accuracy': '4.0.0',
          'example': 'NA',
          'href': 'NA'
        };

        this.locales = {
          post: `Lưu kết quả vào Bảng tạm Google Sheets của InfoSys`,
          close: `Đóng khung kết quả OCR này (Nhấn Shift + Click để đóng tất cả)`,
          tutorial: `Cấu hình Server Webhook:`
        };

        const shadow = this.attachShadow({mode: 'open'});
        shadow.innerHTML = `
          <style>
            :host {
              --fg: #1e293b;
              --bg: #f8fafc;
              --bg-result: #fffdf5;
              --accent: #6366f1;
              --width: 480px;
              --height: 220px;
              --gap: 10px;
            }
            :host([data-mode='expand']) {
              --height: 70vh;
            }
            #body {
              font-size: 13px;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              padding: 12px;
              display: flex;
              flex-direction: column;
              height: var(--height);
              width: min(var(--width), calc(100vw - 2rem));
              color: var(--fg);
              background-color: var(--bg);
              color-scheme: light;
              accent-color: var(--accent);
              border-radius: 8px;
            }
            progress {
              width: 100%;
              height: 7px;
              border-radius: 4px;
            }
            img {
              display: none;
            }
            button,
            input[type=button] {
              font-family: inherit;
              padding: 5px 6px;
              background-image: linear-gradient(#ffffff, #f1f5f9);
              border: 1px solid #cbd5e1;
              color: #334155;
              border-radius: 6px;
              font-weight: 600;
              cursor: pointer;
              font-size: 11.5px;
            }
            input[type=button]:disabled {
              opacity: 0.5;
            }
            #post {
              background-image: linear-gradient(#6366f1, #4f46e5);
              color: #ffffff;
              border: 1px solid #4338ca;
            }
            #trans {
              background-image: linear-gradient(#0284c7, #0369a1);
              color: #ffffff;
              border: 1px solid #075985;
            }
            #speak {
              background-image: linear-gradient(#10b981, #059669);
              color: #ffffff;
              border: 1px solid #047857;
            }
            #result {
              min-height: 48px;
              background-color: var(--bg-result);
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              margin: 10px 0;
              overflow: auto;
              flex: 1;
              padding: var(--gap);
              line-height: 1.5;
            }
            #result:empty::before {
              content: attr(data-msg);
              color: #94a3b8;
            }
            #result .ocr_par:first-child {
              margin-top: 0;
            }
            #result .ocr_par:last-child {
              margin-bottom: 0;
            }
            .ocr_line {
              display: block;
            }
            .grid {
              display: grid;
              grid-template-columns: min-content 1fr;
              white-space: nowrap;
              align-items: center;
              justify-items: left;
              grid-gap: var(--gap);
              font-size: 11.5px;
              color: #64748b;
            }
            .options {
              display: grid;
              grid-template-columns: 1fr 1fr;
              background: #f1f5f9;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              margin-bottom: var(--gap);
              padding: 2px 4px;
            }
            #accuracy,
            #language {
              border: none;
              text-overflow: ellipsis;
              background-color: transparent;
              outline: none;
              padding: 5px;
              font-size: 12.5px;
              font-weight: 600;
              color: #334155;
            }
            #tools {
              display: grid;
              grid-template-columns: repeat(6, 1fr);
              grid-gap: 5px;
              justify-content: end;
            }
          </style>

          <div id="body">
            <div style="display: flex; justify-content: center;">
              <img id="img">
            </div>
            <div class="options">
              <select id="language">
                <optgroup>
                  <option value="detect">🔍 Tự động nhận diện ngôn ngữ</option>
                </optgroup>
                <optgroup id="frequently-used"></optgroup>
                <optgroup label="Danh sách ngôn ngữ">
                  <option value="vie">Tiếng Việt (Vietnamese)</option>
                  <option value="eng">Tiếng Anh (English)</option>
                  <option value="chi_sim">Tiếng Trung (Giản thể)</option>
                  <option value="chi_tra">Tiếng Trung (Phồn thể)</option>
                  <option value="jpn">Tiếng Nhật (Japanese)</option>
                  <option value="kor">Tiếng Hàn (Korean)</option>
                  <option value="fra">Tiếng Pháp (French)</option>
                  <option value="deu">Tiếng Đức (German)</option>
                  <option value="rus">Tiếng Nga (Russian)</option>
                  <option value="tha">Tiếng Thái (Thai)</option>
                  <option value="spa">Tiếng Tây Ban Nha (Spanish)</option>
                  <option value="ita">Tiếng Ý (Italian)</option>
                  <option value="por">Tiếng Bồ Đào Nha (Portuguese)</option>
                  <option value="ara">Tiếng Ả Rập (Arabic)</option>
                  <option value="hin">Tiếng Hindi (Ấn Độ)</option>
                  <option value="ind">Tiếng Indonesia</option>
                  <option value="msa">Tiếng Malaysia</option>
                  <option value="lao">Tiếng Lào (Lao)</option>
                  <option value="khm">Tiếng Khmer (Campuchia)</option>
                  <option value="mya">Tiếng Myanmar</option>
                  <option value="afr">Afrikaans</option>
                  <option value="amh">Amharic</option>
                  <option value="asm">Assamese</option>
                  <option value="aze">Azerbaijani</option>
                  <option value="bel">Belarusian</option>
                  <option value="ben">Bengali</option>
                  <option value="bod">Tibetan</option>
                  <option value="bos">Bosnian</option>
                  <option value="bul">Bulgarian</option>
                  <option value="cat">Catalan</option>
                  <option value="ceb">Cebuano</option>
                  <option value="ces">Czech</option>
                  <option value="chr">Cherokee</option>
                  <option value="cym">Welsh</option>
                  <option value="dan">Danish</option>
                  <option value="dzo">Dzongkha</option>
                  <option value="ell">Greek</option>
                  <option value="epo">Esperanto</option>
                  <option value="est">Estonian</option>
                  <option value="eus">Basque</option>
                  <option value="fas">Persian</option>
                  <option value="fin">Finnish</option>
                  <option value="gle">Irish</option>
                  <option value="glg">Galician</option>
                  <option value="guj">Gujarati</option>
                  <option value="hat">Haitian Creole</option>
                  <option value="heb">Hebrew</option>
                  <option value="hrv">Croatian</option>
                  <option value="hun">Hungarian</option>
                  <option value="isl">Icelandic</option>
                  <option value="jav">Javanese</option>
                  <option value="kan">Kannada</option>
                  <option value="kat">Georgian</option>
                  <option value="kaz">Kazakh</option>
                  <option value="kir">Kyrgyz</option>
                  <option value="kur">Kurdish</option>
                  <option value="lat">Latin</option>
                  <option value="lav">Latvian</option>
                  <option value="lit">Lithuanian</option>
                  <option value="mal">Malayalam</option>
                  <option value="mar">Marathi</option>
                  <option value="mkd">Macedonian</option>
                  <option value="mlt">Maltese</option>
                  <option value="nep">Nepali</option>
                  <option value="nld">Dutch</option>
                  <option value="nor">Norwegian</option>
                  <option value="ori">Oriya</option>
                  <option value="pan">Punjabi</option>
                  <option value="pol">Polish</option>
                  <option value="pus">Pashto</option>
                  <option value="ron">Romanian</option>
                  <option value="san">Sanskrit</option>
                  <option value="sin">Sinhala</option>
                  <option value="slk">Slovak</option>
                  <option value="slv">Slovenian</option>
                  <option value="sqi">Albanian</option>
                  <option value="srp">Serbian</option>
                  <option value="swa">Swahili</option>
                  <option value="swe">Swedish</option>
                  <option value="syr">Syriac</option>
                  <option value="tam">Tamil</option>
                  <option value="tel">Telugu</option>
                  <option value="tgk">Tajik</option>
                  <option value="tgl">Tagalog</option>
                  <option value="tir">Tigrinya</option>
                  <option value="tur">Turkish</option>
                  <option value="uig">Uyghur</option>
                  <option value="ukr">Ukrainian</option>
                  <option value="urd">Urdu</option>
                  <option value="uzb">Uzbek</option>
                  <option value="yid">Yiddish</option>
                </optgroup>
              </select>
              <select id="accuracy">
                <option value='4.0.0'>Độ chính xác cao (Khuyên dùng)</option>
                <option value='4.0.0_best'>Độ chính xác tốt nhất</option>
                <option value='4.0.0_fast'>Độ chính xác vừa (Nhanh)</option>
                <option value='3.02'>Độ chính xác cơ bản</option>
              </select>
            </div>
            <div class="grid">
              <span>Đang tải gói ngôn ngữ</span>
              <progress id="lang" value="0" max="1"></progress>
              <span>Đang nhận diện chữ</span>
              <progress id="recognize" value="0" max="1"></progress>
            </div>

            <div id="result" data-msg="Đang xử lý nhận diện chữ, vui lòng chờ..."></div>
            <div id="tools">
              <input type="button" value="Mở rộng" id="expand">
              <input type="button" value="💾 Lưu" id="post" disabled title="${this.locales.post}">
              <input type="button" value="🌐 Dịch" id="trans" disabled title="Dịch sang Tiếng Việt (Google Translate)">
              <input type="button" value="🔊 Đọc" id="speak" disabled title="Đọc phát âm">
              <input type="button" value="Sao chép" id="copy" disabled>
              <input type="button" value="Đóng" id="close" title="${this.locales.close}">
            </div>
          </div>
        `;
        this.events = {};
      }
      /* io */
      configure(prefs, report = false) {
        Object.assign(this.prefs, prefs);
        if (report) {
          this.dispatchEvent(new CustomEvent('save-preference', {
            detail: prefs
          }));
        }
      }
      /* methods */
      prepare() {
        // frequently used
        for (const lang of this.prefs['frequently-used']) {
          const e = this.shadowRoot.querySelector(`option[value="${lang}"]`).cloneNode(true);
          this.shadowRoot.getElementById('frequently-used').appendChild(e);
        }
        // language
        this.language(this.prefs.lang);
        // accuracy
        this.accuracy(this.prefs.accuracy);
      }
      build(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        this.clear();

        for (const child of [...doc.body.childNodes]) {
          this.shadowRoot.getElementById('result').append(child);
        }
      }
      message(value) {
        this.shadowRoot.getElementById('result').dataset.msg = value;
      }
      progress(value, type = 'recognize') {
        this.shadowRoot.getElementById(type).value = value;
      }
      rename(value) {
        this.shadowRoot.querySelector('option[value=detect]').textContent = value;
      }
      clear() {
        this.shadowRoot.getElementById('result').removeAttribute('contenteditable');
        this.shadowRoot.getElementById('result').textContent = '';
        const spk = this.shadowRoot.getElementById('speak');
        if (spk) {
          spk.disabled = true;
          spk.value = '🔊 Đọc';
        }
        const trs = this.shadowRoot.getElementById('trans');
        if (trs) {
          trs.disabled = true;
          trs.value = '🌐 Dịch';
        }
        if (typeof window.speechSynthesis !== 'undefined') {
          window.speechSynthesis.cancel();
        }
      }
      enable() {
        this.shadowRoot.getElementById('copy').disabled = false;
        this.shadowRoot.getElementById('post').disabled = false;
        const spk = this.shadowRoot.getElementById('speak');
        if (spk) spk.disabled = false;
        const trs = this.shadowRoot.getElementById('trans');
        if (trs) trs.disabled = false;
        this.shadowRoot.getElementById('result').setAttribute('contenteditable', true);
      }
      get result() {
        const el = this.shadowRoot.getElementById('result');
        return el ? (el.innerText || el.textContent || '') : '';
      }
      language(value) {
        this.dataset.language = value;
        this.shadowRoot.getElementById('language').value = value;
      }
      accuracy(value) {
        this.dataset.accuracy = value;
        this.shadowRoot.getElementById('accuracy').value = value;
      }
      toast(name, messages, timeout = 2000) {
        this.shadowRoot.getElementById(name).value = messages.new;
        clearTimeout(this[name + 'ID']);
        this[name + 'ID'] = setTimeout(() => {
          this.shadowRoot.getElementById(name).value = messages.old;
        }, timeout);
      }
      connectedCallback() {
        // Prevent events from bubbling outside to page
        this.shadowRoot.addEventListener('mousedown', e => e.stopPropagation());
        this.shadowRoot.addEventListener('mouseup', e => e.stopPropagation());
        this.shadowRoot.addEventListener('click', e => e.stopPropagation());
        this.shadowRoot.addEventListener('pointerdown', e => e.stopPropagation());

        let activeAudio = null;
        let isSpeaking = false;

        const stopSpeaking = () => {
          isSpeaking = false;
          try {
            chrome.runtime.sendMessage({ action: 'STOP_SPEAKING' });
          } catch(e) {}
          if (activeAudio) {
            try {
              activeAudio.pause();
              activeAudio.currentTime = 0;
            } catch(e) {}
            activeAudio = null;
          }
          if (typeof window.speechSynthesis !== 'undefined') {
            try { window.speechSynthesis.cancel(); } catch(e) {}
          }
          const speakBtn = this.shadowRoot.getElementById('speak');
          if (speakBtn) {
            speakBtn.value = '🔊 Đọc';
            speakBtn.style.backgroundImage = 'linear-gradient(#10b981, #059669)';
          }
        };

        // 1. DỊCH (Translate to Vietnamese)
        const transBtn = this.shadowRoot.getElementById('trans');
        if (transBtn) {
          transBtn.onclick = (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            let text = (this.result || '').trim();
            if (!text) {
              const res = this.shadowRoot.getElementById('result');
              if (res) text = (res.innerText || res.textContent || '').trim();
            }
            if (!text) return;

            transBtn.value = '⏳ Đang dịch...';
            transBtn.disabled = true;

            try {
              chrome.runtime.sendMessage({
                action: 'TRANSLATE_TEXT',
                text: text,
                targetLang: 'vi'
              }, (resp) => {
                transBtn.disabled = false;
                transBtn.value = '🌐 Dịch';

                if (resp && resp.success && resp.translatedText) {
                  const resultEl = this.shadowRoot.getElementById('result');
                  if (resultEl) {
                    resultEl.innerHTML = `<div style="color:#0369a1; font-weight:700; margin-bottom:6px; font-size:11px; display:flex; align-items:center; gap:4px;">🌐 Bản dịch Tiếng Việt:</div><div id="ocr_trans_val" style="line-height:1.6; font-size:13px; color:#0f172a; font-weight:500;">${resp.translatedText}</div><div style="margin-top:8px; padding-top:6px; border-top:1px dashed #cbd5e1; color:#64748b; font-size:11px;"><b>Gốc:</b> ${text}</div>`;
                  }
                  this.toast('trans', {
                    new: '✓ Đã dịch!',
                    old: '🌐 Dịch'
                  });
                } else {
                  this.toast('trans', {
                    new: '⚠️ Lỗi dịch',
                    old: '🌐 Dịch'
                  });
                }
              });
            } catch(err) {
              transBtn.disabled = false;
              transBtn.value = '🌐 Dịch';
            }
          };
        }

        // 2. ĐỌC (Text-To-Speech)
        const speakBtn = this.shadowRoot.getElementById('speak');
        if (speakBtn) {
          speakBtn.onclick = (e) => {
            if (e) {
              e.preventDefault();
              e.stopPropagation();
            }
            if (isSpeaking) {
              stopSpeaking();
              return;
            }

            // Check if there is a translated text element or raw text
            let text = '';
            const transValEl = this.shadowRoot.getElementById('ocr_trans_val');
            if (transValEl) {
              text = transValEl.innerText.trim();
            }
            if (!text) {
              text = (this.result || '').trim();
            }
            if (!text) {
              const res = this.shadowRoot.getElementById('result');
              if (res) text = (res.innerText || res.textContent || '').trim();
            }
            if (!text) {
              text = 'Xin chào, không nhận diện được chữ';
            }

            isSpeaking = true;
            speakBtn.value = '⏹️ Dừng';
            speakBtn.style.backgroundImage = 'linear-gradient(#ef4444, #dc2626)';

            // Determine language code
            let langCode = 'vi';
            const langSelect = this.shadowRoot.getElementById('language');
            if (langSelect && langSelect.value && !transValEl) {
              const val = langSelect.value;
              if (val.startsWith('eng')) langCode = 'en';
              else if (val.startsWith('chi')) langCode = 'zh-CN';
              else if (val.startsWith('jpn')) langCode = 'ja';
              else if (val.startsWith('kor')) langCode = 'ko';
              else if (val.startsWith('fra')) langCode = 'fr';
              else if (val.startsWith('deu')) langCode = 'de';
              else if (val.startsWith('rus')) langCode = 'ru';
              else if (val.startsWith('tha')) langCode = 'th';
              else langCode = 'vi';
            }

            // Split into safe chunks
            const rawParts = text.match(/[^.!?\n\r,;:]+[.!?\n\r,;:]*|[^.!?\n\r,;:]+$/g) || [text];
            const chunks = [];
            rawParts.forEach(p => {
              const t = p.trim();
              if (!t) return;
              if (t.length > 130) {
                const words = t.split(/\s+/);
                let cur = '';
                words.forEach(w => {
                  if ((cur + ' ' + w).trim().length > 130) {
                    if (cur.trim()) chunks.push(cur.trim());
                    cur = w;
                  } else {
                    cur = (cur + ' ' + w).trim();
                  }
                });
                if (cur.trim()) chunks.push(cur.trim());
              } else {
                chunks.push(t);
              }
            });

            if (chunks.length === 0) {
              chunks.push(text);
            }

            // SYNCHRONOUSLY initiate Audio or SpeechSynthesis to guarantee user gesture activation
            let chunkIdx = 0;

            const playChunk = () => {
              if (!isSpeaking) return;
              if (chunkIdx >= chunks.length) {
                stopSpeaking();
                return;
              }

              const chunk = chunks[chunkIdx++];

              // Method A: Try SpeechSynthesis
              if (typeof window.speechSynthesis !== 'undefined') {
                try {
                  window.speechSynthesis.cancel();
                  const u = new SpeechSynthesisUtterance(chunk);
                  u.lang = langCode === 'vi' ? 'vi-VN' : langCode;
                  u.rate = 1.0;
                  const voices = window.speechSynthesis.getVoices() || [];
                  const vMatch = voices.find(v => v.lang && (v.lang.toLowerCase().includes(langCode)));
                  if (vMatch) u.voice = vMatch;

                  u.onend = () => {
                    if (isSpeaking) playChunk();
                  };
                  u.onerror = () => {
                    playAudioFallback(chunk);
                  };

                  window.speechSynthesis.speak(u);
                  return;
                } catch(e) {
                  playAudioFallback(chunk);
                }
              } else {
                playAudioFallback(chunk);
              }
            };

            const playAudioFallback = (chunk) => {
              try {
                const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
                const audio = new Audio(url);
                activeAudio = audio;
                audio.onended = () => {
                  if (isSpeaking) playChunk();
                };
                audio.onerror = () => {
                  if (isSpeaking) playChunk();
                };
                audio.play().catch(() => {
                  if (isSpeaking) playChunk();
                });
              } catch(e) {
                if (isSpeaking) playChunk();
              }
            };

            // Also send background chrome.tts in parallel as bonus
            try {
              chrome.runtime.sendMessage({
                action: 'SPEAK_TEXT',
                text: text,
                lang: langCode === 'vi' ? 'vi-VN' : langCode
              });
            } catch(e) {}

            playChunk();
          };
        }

        // copy
        this.shadowRoot.getElementById('copy').onclick = async (e) => {
          if (e) { e.preventDefault(); e.stopPropagation(); }
          try {
            await navigator.clipboard.writeText(this.result);
          }
          catch (err) {
            const input = document.createElement('textarea');
            input.value = this.result;
            input.style.position = 'absolute';
            input.style.left = '-9999px';
            document.body.append(input);
            input.select();
            document.execCommand('copy');
            input.remove();
          }
          this.toast('copy', {
            new: '✓ Đã chép!',
            old: 'Sao chép'
          });
        };
        // post (Lưu vào Bảng tạm InfoSys)
        this.shadowRoot.getElementById('post').onclick = e => {
          if (e) { e.preventDefault(); e.stopPropagation(); }
          const value = this.result.trim();
          if (e.shiftKey) {
            const message = this.locales.tutorial.replace('&page;', this.dataset.page);
            const m = prompt(
              message,
              [this.prefs['post-method'], this.prefs['post-href'], this.prefs['post-body']].join('|')
            );
            const [method, href, body] = (m || '').split('|');

            const prefs = {
              'post-method': (method || 'POST').toUpperCase(),
              'post-href': href || '',
              'post-body': body || ''
            };
            this.configure(prefs, true);
          }

          if (value) {
            try {
              chrome.runtime.sendMessage({
                action: 'AUTO_COPY_SAVE',
                data: {
                  text: value,
                  url: window.location.href,
                  tag: 'OCR'
                }
              });
            } catch(err) {}

            this.toast('post', {
              new: '✓ Đã lưu!',
              old: '💾 Lưu Bảng tạm'
            });
          }
        };
        // change language
        this.shadowRoot.getElementById('language').onchange = e => {
          this.language(e.target.value);
          const prefs = {
            'lang': e.target.value,
            'frequently-used': this.prefs['frequently-used']
          };
          prefs['frequently-used'].unshift(prefs.lang);
          prefs['frequently-used'] = prefs['frequently-used'].filter((s, i, l) => s && l.indexOf(s) === i).slice(0, 10);
          this.configure(prefs, true);
          this.dispatchEvent(new Event('language-changed'));
        };
        // change accuracy
        this.shadowRoot.getElementById('accuracy').onchange = e => {
          this.accuracy(e.target.value);
          const prefs = {
            'accuracy': e.target.value
          };
          this.configure(prefs, true);
          this.dispatchEvent(new Event('accuracy-changed'));
        };
        // close
        this.shadowRoot.getElementById('close').onclick = e => {
          this.remove();
          this.dispatchEvent(new MouseEvent('closed', {
            shiftKey: e.shiftKey,
            ctrlKey: e.ctrlKey,
            metaKey: e.metaKey
          }));
        };
        // expand
        this.shadowRoot.getElementById('expand').onclick = e => {
          this.dataset.mode = this.dataset.mode === 'expand' ? 'collapse' : 'expand';
          e.target.value = this.dataset.mode === 'expand' ? 'Thu nhỏ' : 'Mở rộng';
        };
        // apply commands on cross-origin
        this.addEventListener('command', e => {
          const {name, args} = e.detail;

          this[name](...args);
        });
        // constants
        this.dataset.languages = [...this.shadowRoot.querySelectorAll('#language option')]
          .map(e => e.value)
          .filter(s => s !== 'detect')
          .join(', ');
      }
    }

    // customElements.define('ocr-result', OCRResult);
    define('ocr-result', OCRResult);
  }
}

