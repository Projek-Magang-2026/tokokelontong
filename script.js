/**
 * Warung Berkah Kelontong - Hotspot WiFi Portal Logic
 * Android Native Feel & High-Speed Mikrotik Integration
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const tabVoucher = document.getElementById('tab-voucher');
    const tabMember = document.getElementById('tab-member');
    
    const inputLabel = document.getElementById('input-label-username');
    const inputHelperLink = document.getElementById('input-helper-link');
    const usernameInput = document.getElementById('username');
    const btnClearUser = document.getElementById('btn-clear-user');
    const passwordContainer = document.getElementById('password-container');
    const passwordInput = document.getElementById('password');
    const loginForm = document.getElementById('login-form');
    const btnSubmitText = document.getElementById('btn-submit-text');
    
    const togglePasswordBtn = document.getElementById('toggle-password');
    const errorBox = document.getElementById('error-box');
    const errorMsgText = document.getElementById('error-msg-text');

    let currentTab = 'voucher'; // 'voucher' | 'member'

    // --- TAB SWITCHING ---
    function switchToVoucher() {
        currentTab = 'voucher';
        if (tabVoucher) tabVoucher.classList.add('active');
        if (tabMember) tabMember.classList.remove('active');
        
        if (inputLabel) inputLabel.textContent = 'Kode Voucher Toko';
        if (inputHelperLink) {
            inputHelperLink.textContent = 'Tertera di voucher';
            inputHelperLink.style.display = 'inline';
        }
        if (usernameInput) {
            usernameInput.placeholder = 'MASUKKAN KODE VOUCHER';
            usernameInput.classList.add('code-font');
            usernameInput.setAttribute('autocapitalize', 'characters');
        }
        if (passwordContainer) passwordContainer.style.display = 'none';
        if (passwordInput) {
            passwordInput.required = false;
            passwordInput.value = '';
        }
        if (btnSubmitText) btnSubmitText.textContent = 'Sambungkan WiFi Toko';
        clearError();
        if (usernameInput) usernameInput.focus();
    }

    function switchToMember() {
        currentTab = 'member';
        if (tabMember) tabMember.classList.add('active');
        if (tabVoucher) tabVoucher.classList.remove('active');
        
        if (inputLabel) inputLabel.textContent = 'Username Member / Kasir';
        if (inputHelperLink) {
            inputHelperLink.textContent = 'Akun Toko';
        }
        if (usernameInput) {
            usernameInput.placeholder = 'Masukkan username member';
            usernameInput.classList.remove('code-font');
            usernameInput.setAttribute('autocapitalize', 'none');
        }
        if (passwordContainer) passwordContainer.style.display = 'block';
        if (passwordInput) {
            passwordInput.required = true;
        }
        if (btnSubmitText) btnSubmitText.textContent = 'Masuk Sebagai Member';
        clearError();
        if (usernameInput) usernameInput.focus();
    }

    if (tabVoucher) {
        tabVoucher.addEventListener('click', (e) => {
            e.preventDefault();
            switchToVoucher();
        });
    }

    if (tabMember) {
        tabMember.addEventListener('click', (e) => {
            e.preventDefault();
            switchToMember();
        });
    }

    // --- USERNAME CLEAR BUTTON LOGIC ---
    if (usernameInput && btnClearUser) {
        usernameInput.addEventListener('input', () => {
            btnClearUser.style.display = usernameInput.value.length > 0 ? 'flex' : 'none';
        });

        btnClearUser.addEventListener('click', () => {
            usernameInput.value = '';
            btnClearUser.style.display = 'none';
            usernameInput.focus();
        });
    }

    // --- PASSWORD EYE TOGGLE ---
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            
            if (isPassword) {
                togglePasswordBtn.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                `;
            } else {
                togglePasswordBtn.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                `;
            }
        });
    }

    // --- AUTO-LOGIN VIA URL QUERY PARAMETERS (QR SCAN REDIRECT) ---
    const urlParams = new URLSearchParams(window.location.search);
    const queryUser = urlParams.get('username') || urlParams.get('user');
    const queryPass = urlParams.get('password') || urlParams.get('pass');

    if (queryUser) {
        if (usernameInput) usernameInput.value = '';
        if (passwordInput) passwordInput.value = '';

        const autoLoginOverlay = document.createElement('div');
        autoLoginOverlay.className = 'modal-backdrop';
        autoLoginOverlay.style.zIndex = '2000';
        autoLoginOverlay.innerHTML = `
            <div class="modal-sheet" style="text-align: center; border-radius: 24px; margin: auto; max-width: 320px;">
                <h3 style="color: var(--primary); margin-bottom: 8px; font-size: 15px;">Mendeteksi QR Voucher</h3>
                <div class="loading-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
                <p style="font-size: 12px; color: var(--text-muted); font-weight: 600;">Menghubungkan otomatis ke WiFi...</p>
            </div>
        `;
        document.body.appendChild(autoLoginOverlay);

        setTimeout(() => {
            if (queryPass) {
                switchToMember();
                if (usernameInput) usernameInput.value = queryUser;
                if (passwordInput) passwordInput.value = queryPass;
            } else {
                switchToVoucher();
                if (usernameInput) usernameInput.value = queryUser;
            }

            setTimeout(() => {
                if (autoLoginOverlay) autoLoginOverlay.remove();
                if (loginForm) {
                    if (isDemoEnv()) {
                        simulateLogin(queryPass ? 'Member' : 'Voucher', queryUser);
                    } else {
                        loginForm.submit();
                    }
                }
            }, 800);
        }, 1000);
    }

    // --- FORM SUBMIT LOGIC ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            const uVal = usernameInput ? usernameInput.value.trim() : '';
            const pVal = passwordInput ? passwordInput.value.trim() : '';

            if (currentTab === 'voucher') {
                if (!uVal) {
                    e.preventDefault();
                    showError('Silakan masukkan kode voucher Anda!');
                    return;
                }
                // MikroTik voucher standard: password equals username
                if (passwordInput) passwordInput.value = uVal.toUpperCase();
                
                if (isDemoEnv()) {
                    e.preventDefault();
                    simulateLogin('Voucher', uVal.toUpperCase());
                }
            } else {
                if (!uVal || !pVal) {
                    e.preventDefault();
                    showError('Lengkapi username dan password member Anda!');
                    return;
                }
                
                if (isDemoEnv()) {
                    e.preventDefault();
                    simulateLogin('Member', uVal);
                }
            }
        });
    }

    // --- ERROR HELPERS ---
    function showError(msg) {
        if (errorBox) {
            if (errorMsgText) {
                errorMsgText.textContent = msg;
            } else {
                errorBox.innerHTML = `<span>⚠️</span> <div>${msg}</div>`;
            }
            errorBox.style.display = 'flex';
        } else {
            alert(msg);
        }
    }

    function clearError() {
        if (errorBox) {
            errorBox.style.display = 'none';
        }
    }

    function isDemoEnv() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' || 
               window.location.protocol === 'file:';
    }

    function simulateLogin(type, name) {
        localStorage.setItem('maduranet_active', 'true');
        localStorage.setItem('maduranet_username', name);
        localStorage.setItem('maduranet_type', type);
        localStorage.setItem('maduranet_ip', '192.168.100.23');
        localStorage.setItem('maduranet_mac', '00:1A:2B:3C:4D:5E');
        localStorage.setItem('maduranet_login_time', new Date().toLocaleTimeString());
        
        window.location.href = 'redirect.html';
    }

    // --- QR SCANNER MODAL CONTROLLER ---
    const scannerModal = document.getElementById('scanner-modal');
    const shortcutScanBtn = document.getElementById('shortcut-scan-btn');
    const closeScanner = document.getElementById('close-scanner');
    const closeGuideBtn = document.getElementById('close-guide-btn');

    function openScannerModal(e) {
        if (e) e.preventDefault();
        if (scannerModal) scannerModal.style.display = 'flex';
    }

    function closeScannerModal(e) {
        if (e) e.preventDefault();
        if (scannerModal) scannerModal.style.display = 'none';
    }

    if (shortcutScanBtn) shortcutScanBtn.addEventListener('click', openScannerModal);
    if (closeScanner) closeScanner.addEventListener('click', closeScannerModal);
    if (closeGuideBtn) closeGuideBtn.addEventListener('click', closeScannerModal);

    if (scannerModal) {
        scannerModal.addEventListener('click', (e) => {
            if (e.target === scannerModal) {
                closeScannerModal();
            }
        });
    }
});

// --- HELPER UNTUK MEMILIH PAKET ---
function selectPackage(pkgCode) {
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.focus();
        usernameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// --- OFFLINE SIMULATOR FOR STATUS PAGE ---
function initStatusPage() {
    const active = localStorage.getItem('maduranet_active');
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' || 
                    window.location.protocol === 'file:';
                    
    if (active !== 'true' && isLocal) {
        window.location.href = 'login.html';
        return;
    }

    const username = localStorage.getItem('maduranet_username') || 'Tamu-Warung';
    const type = localStorage.getItem('maduranet_type') || 'Voucher Toko';
    const ip = localStorage.getItem('maduranet_ip') || '192.168.100.23';
    const mac = localStorage.getItem('maduranet_mac') || '00:1A:2B:3C:4D:5E';

    const userEl = document.getElementById('stat-username');
    const ipEl = document.getElementById('stat-ip');
    const macEl = document.getElementById('stat-mac');
    const uptimeEl = document.getElementById('stat-uptime');
    const typeEl = document.getElementById('stat-type');
    
    if (userEl) userEl.textContent = username;
    if (ipEl) ipEl.textContent = ip;
    if (macEl) macEl.textContent = mac;
    if (typeEl) typeEl.textContent = type;

    let count = 0;
    setInterval(() => {
        count++;
        let hrs = Math.floor(count / 3600);
        let mins = Math.floor((count % 3600) / 60);
        let secs = count % 60;
        
        let hrsStr = hrs > 0 ? hrs + 'j ' : '';
        let minsStr = mins > 0 ? mins + 'm ' : '';
        let secsStr = secs + 's';
        
        if (uptimeEl) uptimeEl.textContent = hrsStr + minsStr + secsStr;
    }, 1000);

    const logoutForm = document.getElementById('logout-form');
    if (logoutForm && isLocal) {
        logoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'logout.html';
        });
    }
}
