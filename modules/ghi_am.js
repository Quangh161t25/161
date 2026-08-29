// ============================================================
//  InfoSys — Module GHI ÂM MP3 (Studio Thu Âm & Xuất File MP3)
// ============================================================

(function(window) {
    let audioContext = null;
    let mediaStream = null;
    let scriptProcessor = null;
    let analyser = null;
    let mp3Encoder = null;
    let mp3Chunks = [];
    let isRecording = false;
    let isPaused = false;
    let recordStartTime = 0;
    let pausedDuration = 0;
    let pauseStartTime = 0;
    let timerInterval = null;
    let visualizerAnimationId = null;
    let recordedBlob = null;
    let recordedAudioUrl = null;
    let sampleRate = 44100;
    let recordedDurationSeconds = 0;

    function openVoiceRecorderModal() {
        let modal = document.getElementById('voiceRecorderModal');
        if (!modal) {
            createVoiceRecorderModalHtml();
            modal = document.getElementById('voiceRecorderModal');
        }
        modal.style.display = 'flex';
        resetRecorderUI();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function closeVoiceRecorderModal() {
        if (isRecording) {
            if (!confirm('Bạn đang trong quá trình thu âm. Bạn có chắc muốn dừng và đóng lại?')) {
                return;
            }
            stopVoiceRecording(false);
        }
        const modal = document.getElementById('voiceRecorderModal');
        if (modal) modal.style.display = 'none';
        cleanupAudioStream();
    }

    function resetRecorderUI() {
        const timerEl = document.getElementById('voiceRecorderTimer');
        const statusBadge = document.getElementById('voiceRecorderStatusBadge');
        const startBtn = document.getElementById('voiceStartBtn');
        const pauseBtn = document.getElementById('voicePauseBtn');
        const stopBtn = document.getElementById('voiceStopBtn');
        const postRecordSection = document.getElementById('voicePostRecordSection');
        const audioPlayer = document.getElementById('voicePreviewAudio');

        if (timerEl) timerEl.textContent = '00:00:00';
        if (statusBadge) {
            statusBadge.style.background = '#f1f5f9';
            statusBadge.style.color = '#64748b';
            statusBadge.innerHTML = '<i data-lucide="mic" style="width:13px; height:13px;"></i> Sẵn sàng thu âm';
        }
        if (startBtn) {
            startBtn.style.display = 'inline-flex';
            startBtn.innerHTML = '<i data-lucide="radio" style="width:16px; height:16px;"></i> <span>Bắt đầu Ghi âm</span>';
            startBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        }
        if (pauseBtn) pauseBtn.style.display = 'none';
        if (stopBtn) stopBtn.style.display = 'none';
        if (postRecordSection) postRecordSection.style.display = 'none';
        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer.src = '';
        }

        drawStaticVisualizer();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    async function startVoiceRecording() {
        if (isRecording) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            mediaStream = stream;

            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContextClass();
            sampleRate = audioContext.sampleRate;

            const sourceNode = audioContext.createMediaStreamSource(stream);
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            sourceNode.connect(analyser);

            const bufferSize = 4096;
            scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1);

            // Check lamejs availability
            if (typeof lamejs === 'undefined') {
                alert('Thư viện nén MP3 (lamejs) chưa được tải. Vui lòng kiểm tra lại kết nối!');
                return;
            }

            mp3Encoder = new lamejs.Mp3Encoder(1, sampleRate, 128);
            mp3Chunks = [];

            scriptProcessor.onaudioprocess = (e) => {
                if (!isRecording || isPaused) return;
                const inputData = e.inputBuffer.getChannelData(0);
                
                // Convert Float32 to Int16
                const samples = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    samples[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                const mp3buf = mp3Encoder.encodeBuffer(samples);
                if (mp3buf.length > 0) {
                    mp3Chunks.push(new Uint8Array(mp3buf));
                }
            };

            sourceNode.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);

            isRecording = true;
            isPaused = false;
            recordStartTime = Date.now();
            pausedDuration = 0;

            updateRecordingUI();
            startTimer();
            startVisualizer();

        } catch (err) {
            console.error('Không thể truy cập Microphone:', err);
            alert('Không thể truy cập Microphone của bạn! Vui lòng cấp quyền Microphone trên trình duyệt để ghi âm.');
        }
    }

    function togglePauseVoiceRecording() {
        if (!isRecording) return;
        isPaused = !isPaused;
        const pauseBtn = document.getElementById('voicePauseBtn');
        const statusBadge = document.getElementById('voiceRecorderStatusBadge');

        if (isPaused) {
            pauseStartTime = Date.now();
            if (pauseBtn) pauseBtn.innerHTML = '<i data-lucide="play" style="width:16px; height:16px;"></i> <span>Tiếp tục</span>';
            if (statusBadge) {
                statusBadge.style.background = '#fef3c7';
                statusBadge.style.color = '#b45309';
                statusBadge.innerHTML = '<i data-lucide="pause-circle" style="width:13px; height:13px;"></i> Đang tạm dừng';
            }
        } else {
            pausedDuration += (Date.now() - pauseStartTime);
            if (pauseBtn) pauseBtn.innerHTML = '<i data-lucide="pause" style="width:16px; height:16px;"></i> <span>Tạm dừng</span>';
            if (statusBadge) {
                statusBadge.style.background = '#fef2f2';
                statusBadge.style.color = '#dc2626';
                statusBadge.innerHTML = '<i data-lucide="radio" style="width:13px; height:13px; color:#ef4444; animation:infosys-pulse 1.2s infinite;"></i> Đang thu âm...';
            }
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function stopVoiceRecording(generateOutput = true) {
        if (!isRecording) return;
        isRecording = false;
        isPaused = false;

        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        if (visualizerAnimationId) {
            cancelAnimationFrame(visualizerAnimationId);
            visualizerAnimationId = null;
        }

        // Flush MP3 Encoder
        if (mp3Encoder && generateOutput) {
            const endBuf = mp3Encoder.flush();
            if (endBuf.length > 0) {
                mp3Chunks.push(new Uint8Array(endBuf));
            }
            recordedBlob = new Blob(mp3Chunks, { type: 'audio/mp3' });
            if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
            recordedAudioUrl = URL.createObjectURL(recordedBlob);
            
            showPostRecordingUI();
        }

        cleanupAudioStream();
    }

    function cleanupAudioStream() {
        if (scriptProcessor) {
            try { scriptProcessor.disconnect(); } catch (e) {}
            scriptProcessor = null;
        }
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
        if (audioContext && audioContext.state !== 'closed') {
            audioContext.close().catch(() => {});
            audioContext = null;
        }
    }

    function updateRecordingUI() {
        const startBtn = document.getElementById('voiceStartBtn');
        const pauseBtn = document.getElementById('voicePauseBtn');
        const stopBtn = document.getElementById('voiceStopBtn');
        const statusBadge = document.getElementById('voiceRecorderStatusBadge');
        const postRecordSection = document.getElementById('voicePostRecordSection');

        if (startBtn) startBtn.style.display = 'none';
        if (pauseBtn) {
            pauseBtn.style.display = 'inline-flex';
            pauseBtn.innerHTML = '<i data-lucide="pause" style="width:16px; height:16px;"></i> <span>Tạm dừng</span>';
        }
        if (stopBtn) stopBtn.style.display = 'inline-flex';
        if (postRecordSection) postRecordSection.style.display = 'none';

        if (statusBadge) {
            statusBadge.style.background = '#fef2f2';
            statusBadge.style.color = '#dc2626';
            statusBadge.innerHTML = '<i data-lucide="radio" style="width:13px; height:13px; color:#ef4444; animation:infosys-pulse 1.2s infinite;"></i> Đang thu âm...';
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function showPostRecordingUI() {
        const startBtn = document.getElementById('voiceStartBtn');
        const pauseBtn = document.getElementById('voicePauseBtn');
        const stopBtn = document.getElementById('voiceStopBtn');
        const statusBadge = document.getElementById('voiceRecorderStatusBadge');
        const postRecordSection = document.getElementById('voicePostRecordSection');
        const audioPlayer = document.getElementById('voicePreviewAudio');
        const sizeBadge = document.getElementById('voiceFileSizeBadge');
        const durationBadge = document.getElementById('voiceFileDurationBadge');
        const defaultNameInput = document.getElementById('voiceFileNoteInput');

        if (startBtn) {
            startBtn.style.display = 'inline-flex';
            startBtn.innerHTML = '<i data-lucide="rotate-ccw" style="width:16px; height:16px;"></i> <span>Thu âm lại</span>';
            startBtn.style.background = '#475569';
        }
        if (pauseBtn) pauseBtn.style.display = 'none';
        if (stopBtn) stopBtn.style.display = 'none';

        if (statusBadge) {
            statusBadge.style.background = '#f0fdf4';
            statusBadge.style.color = '#15803d';
            statusBadge.innerHTML = '<i data-lucide="check-circle" style="width:13px; height:13px;"></i> Thu âm & Nén MP3 thành công!';
        }

        if (postRecordSection) postRecordSection.style.display = 'block';
        if (audioPlayer && recordedAudioUrl) {
            audioPlayer.src = recordedAudioUrl;
        }

        if (recordedBlob) {
            const kbSize = (recordedBlob.size / 1024).toFixed(1);
            const mbSize = (recordedBlob.size / (1024 * 1024)).toFixed(2);
            const displaySize = recordedBlob.size > 1024 * 1024 ? `${mbSize} MB` : `${kbSize} KB`;
            if (sizeBadge) sizeBadge.textContent = `Dung lượng: ${displaySize} (MP3 128kbps)`;
        }

        const mins = Math.floor(recordedDurationSeconds / 60);
        const secs = recordedDurationSeconds % 60;
        const durStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        if (durationBadge) durationBadge.textContent = `Thời lượng: ${durStr}`;

        const now = new Date();
        const dateStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
        if (defaultNameInput) defaultNameInput.value = `Ghi_am_${dateStr}`;

        drawStaticVisualizer(true);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        const timerEl = document.getElementById('voiceRecorderTimer');
        
        timerInterval = setInterval(() => {
            if (!isRecording || isPaused) return;
            const elapsed = Math.floor((Date.now() - recordStartTime - pausedDuration) / 1000);
            recordedDurationSeconds = elapsed;

            const hrs = Math.floor(elapsed / 3600);
            const mins = Math.floor((elapsed % 3600) / 60);
            const secs = elapsed % 60;

            if (timerEl) {
                timerEl.textContent = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            }
        }, 500);
    }

    function startVisualizer() {
        const canvas = document.getElementById('voiceVisualizerCanvas');
        if (!canvas || !analyser) return;
        const ctx = canvas.getContext('2d');
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function renderFrame() {
            if (!isRecording) return;
            visualizerAnimationId = requestAnimationFrame(renderFrame);

            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / 40) - 2;
            let barHeight;
            let x = 0;

            for (let i = 0; i < 40; i++) {
                const index = Math.floor(i * (bufferLength / 40));
                barHeight = (dataArray[index] / 255) * canvas.height * 0.9;
                if (isPaused) barHeight = 4;

                const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
                gradient.addColorStop(0, '#ec4899');
                gradient.addColorStop(0.5, '#8b5cf6');
                gradient.addColorStop(1, '#3b82f6');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.roundRect(x, canvas.height - barHeight - 4, barWidth, barHeight + 4, 3);
                ctx.fill();

                x += barWidth + 2;
            }
        }

        renderFrame();
    }

    function drawStaticVisualizer(hasAudio = false) {
        const canvas = document.getElementById('voiceVisualizerCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / 40) - 2;
        let x = 0;
        for (let i = 0; i < 40; i++) {
            const barHeight = hasAudio ? (Math.sin(i * 0.3) * 15 + 20) : 4;
            ctx.fillStyle = hasAudio ? '#6366f1' : '#334155';
            ctx.beginPath();
            ctx.roundRect(x, canvas.height - barHeight - 4, barWidth, barHeight + 4, 3);
            ctx.fill();
            x += barWidth + 2;
        }
    }

    function downloadMp3File() {
        if (!recordedBlob) {
            alert('Chưa có file thu âm nào để tải về!');
            return;
        }
        const nameInput = document.getElementById('voiceFileNoteInput');
        let filename = (nameInput && nameInput.value.trim()) || 'Ghi_am_' + Date.now();
        if (!filename.toLowerCase().endsWith('.mp3')) {
            filename += '.mp3';
        }

        const a = document.createElement('a');
        a.href = recordedAudioUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        if (typeof showInfoToast === 'function') {
            showInfoToast(`📥 Đã tải file "${filename}" về máy thành công!`, 'success');
        }
    }

    async function saveAudioToBangTam() {
        if (!recordedBlob) return;
        const nameInput = document.getElementById('voiceFileNoteInput');
        const filename = (nameInput && nameInput.value.trim()) || 'Ghi_am_' + Date.now();
        const mins = Math.floor(recordedDurationSeconds / 60);
        const secs = recordedDurationSeconds % 60;
        const durStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        const kbSize = (recordedBlob.size / 1024).toFixed(1);

        const noteContent = `🎙️ [Ghi âm MP3] ${filename}\n⏱️ Thời lượng: ${durStr} | 📦 Kích thước: ${kbSize} KB (128kbps MP3)`;

        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({
                action: 'AUTO_COPY_SAVE',
                data: {
                    text: noteContent,
                    url: 'Ghi âm giọng nói',
                    tag: 'Ghi âm'
                }
            }, (res) => {
                if (res && res.success) {
                    if (typeof showInfoToast === 'function') showInfoToast('💾 Đã lưu thông tin bản ghi âm vào Bảng tạm!', 'success');
                } else {
                    if (typeof showInfoToast === 'function') showInfoToast('Đã ghi nhận bản thu âm', 'info');
                }
            });
        } else {
            alert('Đã lưu thông tin ghi âm!');
        }
    }

    function createVoiceRecorderModalHtml() {
        const modalHtml = `
        <div id="voiceRecorderModal" class="modal-mask" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(15,23,42,0.75); z-index:99999; justify-content:center; align-items:center; backdrop-filter:blur(4px);">
            <div class="modal-content" style="background:#ffffff; border-radius:18px; width:92%; max-width:520px; box-shadow:0 20px 40px rgba(0,0,0,0.3); overflow:hidden; border:1px solid #e2e8f0; display:flex; flex-direction:column; animation:infosys-modal-pop 0.25s ease-out;">
                
                <!-- Modal Header -->
                <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid #f1f5f9; background:#ffffff;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg, #ec4899 0%, #db2777 100%); color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 8px rgba(236,72,153,0.35);">
                            <i data-lucide="mic" style="width:18px; height:18px;"></i>
                        </div>
                        <div>
                            <h3 style="margin:0; font-size:1.05rem; font-weight:800; color:#0f172a;">Studio Ghi Âm MP3</h3>
                            <p style="margin:0; font-size:0.75rem; color:#64748b;">Thu âm giọng nói chất lượng cao & Xuất file .mp3 chuẩn</p>
                        </div>
                    </div>
                    <button type="button" id="closeVoiceRecorderBtn" style="background:transparent; border:none; color:#94a3b8; font-size:1.3rem; cursor:pointer; width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">✕</button>
                </div>

                <!-- Modal Body -->
                <div style="padding:22px 24px; display:flex; flex-direction:column; align-items:center; gap:16px; background:#f8fafc;">
                    
                    <!-- Status Badge -->
                    <div id="voiceRecorderStatusBadge" style="background:#f1f5f9; color:#64748b; font-size:0.8rem; font-weight:700; padding:4px 12px; border-radius:20px; display:inline-flex; align-items:center; gap:5px; border:1px solid #e2e8f0;">
                        <i data-lucide="mic" style="width:13px; height:13px;"></i> Sẵn sàng thu âm
                    </div>

                    <!-- Digital Timer Display -->
                    <div id="voiceRecorderTimer" style="font-family:'Courier New', monospace; font-size:2.8rem; font-weight:800; color:#0f172a; letter-spacing:2px; text-shadow:0 2px 4px rgba(0,0,0,0.05);">
                        00:00:00
                    </div>

                    <!-- Live Audio Waveform Visualizer Canvas -->
                    <div style="width:100%; border-radius:12px; overflow:hidden; box-shadow:inset 0 2px 6px rgba(0,0,0,0.2); border:1px solid #334155;">
                        <canvas id="voiceVisualizerCanvas" width="460" height="90" style="width:100%; height:90px; display:block; background:#0f172a;"></canvas>
                    </div>

                    <!-- Controls Toolbar -->
                    <div style="display:flex; gap:10px; align-items:center; justify-content:center; width:100%; margin-top:4px;">
                        <button type="button" id="voiceStartBtn" style="background:linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color:#ffffff; border:none; padding:10px 22px; border-radius:12px; font-weight:700; font-size:0.9rem; cursor:pointer; display:inline-flex; align-items:center; gap:6px; box-shadow:0 4px 12px rgba(239,68,68,0.35); transition:all 0.15s;">
                            <i data-lucide="radio" style="width:16px; height:16px;"></i>
                            <span>Bắt đầu Ghi âm</span>
                        </button>

                        <button type="button" id="voicePauseBtn" style="display:none; background:#ffffff; color:#334155; border:1px solid #cbd5e1; padding:10px 18px; border-radius:12px; font-weight:700; font-size:0.9rem; cursor:pointer; align-items:center; gap:6px;">
                            <i data-lucide="pause" style="width:16px; height:16px;"></i>
                            <span>Tạm dừng</span>
                        </button>

                        <button type="button" id="voiceStopBtn" style="display:none; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#ffffff; border:none; padding:10px 20px; border-radius:12px; font-weight:700; font-size:0.9rem; cursor:pointer; align-items:center; gap:6px; box-shadow:0 4px 12px rgba(16,185,129,0.35);">
                            <i data-lucide="square" style="width:16px; height:16px;"></i>
                            <span>Hoàn thành & Xuất MP3</span>
                        </button>
                    </div>

                    <!-- Post Recording Actions Section -->
                    <div id="voicePostRecordSection" style="display:none; width:100%; background:#ffffff; border-radius:14px; padding:16px; border:1px solid #e2e8f0; margin-top:6px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                        
                        <!-- Audio Player -->
                        <div style="margin-bottom:12px;">
                            <label style="display:block; font-size:0.75rem; font-weight:700; color:#64748b; margin-bottom:6px;">NGHE THỬ BẢN THU:</label>
                            <audio id="voicePreviewAudio" controls style="width:100%; height:40px; border-radius:8px;"></audio>
                        </div>

                        <!-- Details & Filename -->
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:6px;">
                            <span id="voiceFileDurationBadge" style="font-size:0.75rem; font-weight:700; background:#eff6ff; color:#1d4ed8; padding:3px 8px; border-radius:6px;">Thời lượng: 00:00</span>
                            <span id="voiceFileSizeBadge" style="font-size:0.75rem; font-weight:700; background:#f0fdf4; color:#15803d; padding:3px 8px; border-radius:6px;">Dung lượng: 0 KB</span>
                        </div>

                        <div style="margin-bottom:14px;">
                            <label style="display:block; font-size:0.75rem; font-weight:700; color:#334155; margin-bottom:4px;">TÊN FILE MP3:</label>
                            <input type="text" id="voiceFileNoteInput" placeholder="Nhập tên file (VD: Ghi_am_cuoc_hop)" style="width:100%; padding:8px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.88rem; box-sizing:border-box;">
                        </div>

                        <!-- Action Buttons -->
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                            <button type="button" id="voiceDownloadBtn" style="background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color:#ffffff; border:none; padding:10px; border-radius:10px; font-weight:700; font-size:0.83rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px; box-shadow:0 3px 8px rgba(37,99,235,0.3);">
                                <i data-lucide="download" style="width:15px; height:15px;"></i> Tải file MP3
                            </button>
                            <button type="button" id="voiceSaveBangTamBtn" style="background:#f8fafc; color:#334155; border:1px solid #cbd5e1; padding:10px; border-radius:10px; font-weight:700; font-size:0.83rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px;">
                                <i data-lucide="clipboard-list" style="width:15px; height:15px; color:#0284c7;"></i> Lưu Bảng tạm
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;

        const div = document.createElement('div');
        div.innerHTML = modalHtml;
        document.body.appendChild(div.firstElementChild);

        // Bind events
        document.getElementById('closeVoiceRecorderBtn')?.addEventListener('click', closeVoiceRecorderModal);
        document.getElementById('voiceStartBtn')?.addEventListener('click', startVoiceRecording);
        document.getElementById('voicePauseBtn')?.addEventListener('click', togglePauseVoiceRecording);
        document.getElementById('voiceStopBtn')?.addEventListener('click', () => stopVoiceRecording(true));
        document.getElementById('voiceDownloadBtn')?.addEventListener('click', downloadMp3File);
        document.getElementById('voiceSaveBangTamBtn')?.addEventListener('click', saveAudioToBangTam);

        // Close on mask click outside
        const modal = document.getElementById('voiceRecorderModal');
        modal?.addEventListener('mousedown', (e) => {
            if (e.target === modal) closeVoiceRecorderModal();
        });
    }

    // Expose global methods
    window.openVoiceRecorderModal = openVoiceRecorderModal;
    window.closeVoiceRecorderModal = closeVoiceRecorderModal;

})(window);
