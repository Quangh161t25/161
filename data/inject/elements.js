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
              --width: 440px;
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
            input[type=submit],
            input[type=button] {
              padding: 6px 10px;
              color: #1e293b;
              font-weight: 600;
              background-image: linear-gradient(#ffffff, #f1f5f9);
              box-shadow: rgba(0, 0, 0, 0.06) 0 1px 2px;
              border: solid 1px #cbd5e1;
              border-radius: 6px;
              cursor: pointer;
              font-size: 12px;
            }
            input[type=button]:disabled {
              opacity: 0.5;
            }
            #post {
              background-image: linear-gradient(#6366f1, #4f46e5);
              color: #ffffff;
              border: 1px solid #4338ca;
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
              grid-template-columns: repeat(4, 1fr);
              grid-gap: 8px;
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
              <input type="button" value="💾 Lưu Bảng tạm" id="post" disabled title="${this.locales.post}">
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
      }
      enable() {
        this.shadowRoot.getElementById('copy').disabled = false;
        this.shadowRoot.getElementById('post').disabled = false;
        this.shadowRoot.getElementById('result').setAttribute('contenteditable', true);
      }
      get result() {
        return this.shadowRoot.getElementById('result').innerText;
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
        // copy
        this.shadowRoot.getElementById('copy').onclick = async () => {
          try {
            await navigator.clipboard.writeText(this.result);
          }
          catch (e) {
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

