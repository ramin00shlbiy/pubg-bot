// ============================================
// منطق ثبت‌نام و ورود با گوگل (Netlify Identity)
// ============================================

console.log('🚀 PUBG Empire - script.js loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded');

    const SITE_URL = window.location.origin;
    const LOGIN_BTN = document.getElementById('google-login-btn');
    const REGISTER_BTN = document.getElementById('google-register-btn');
    const TAB_BTNS = document.querySelectorAll('.tab-btn');
    const LOGIN_FORM = document.getElementById('login-form');
    const REGISTER_FORM = document.getElementById('register-form');
    const SWITCH_TO_REGISTER = document.getElementById('switch-to-register');
    const SWITCH_TO_LOGIN = document.getElementById('switch-to-login');

    // ===== مدیریت تب‌ها =====
    TAB_BTNS.forEach(btn => {
        btn.addEventListener('click', function() {
            TAB_BTNS.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const tab = this.dataset.tab;
            if (tab === 'login') {
                LOGIN_FORM.classList.add('active');
                REGISTER_FORM.classList.remove('active');
            } else {
                REGISTER_FORM.classList.add('active');
                LOGIN_FORM.classList.remove('active');
            }
        });
    });

    // ===== سوئیچ بین فرم‌ها =====
    if (SWITCH_TO_REGISTER) {
        SWITCH_TO_REGISTER.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('.tab-btn[data-tab="register"]')?.click();
        });
    }

    if (SWITCH_TO_LOGIN) {
        SWITCH_TO_LOGIN.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('.tab-btn[data-tab="login"]')?.click();
        });
    }

    // ===== ورود با گوگل =====
    if (LOGIN_BTN) {
        LOGIN_BTN.addEventListener('click', function() {
            console.log('🔐 Google login clicked');
            localStorage.setItem('redirect_after_login', '/dashboard.html');
            window.location.href = `${SITE_URL}/.netlify/identity/authorize?provider=google`;
        });
    }

    // ===== ثبت‌نام با گوگل =====
    if (REGISTER_BTN) {
        REGISTER_BTN.addEventListener('click', function() {
            console.log('📝 Google register clicked');
            const name = document.getElementById('register-name')?.value || 'کاربر';
            const nickname = document.getElementById('register-nickname')?.value || name;
            localStorage.setItem('pending_name', name);
            localStorage.setItem('pending_nickname', nickname);
            window.location.href = `${SITE_URL}/.netlify/identity/authorize?provider=google`;
        });
    }

    // ===== بررسی وضعیت ورود =====
    function checkLoginStatus() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
            console.log('🔑 Token found in URL');
            localStorage.setItem('netlify_token', token);
            window.history.replaceState({}, document.title, window.location.pathname);
            fetchUserData(token);
            return;
        }

        const savedToken = localStorage.getItem('netlify_token');
        if (savedToken) {
            console.log('🔑 Token found in localStorage');
            fetchUserData(savedToken);
        }
    }

    // ===== دریافت اطلاعات کاربر =====
    async function fetchUserData(token) {
        try {
            console.log('📡 Fetching user data...');
            const response = await fetch(`${SITE_URL}/.netlify/identity/user`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const user = await response.json();
                console.log('✅ User logged in:', user);
                
                // ذخیره اطلاعات کاربر
                const userData = {
                    email: user.email,
                    name: user.full_name || 'کاربر',
                    nickname: localStorage.getItem('pending_nickname') || user.full_name || 'کاربر',
                    balance: 0
                };
                localStorage.setItem('netlify_user', JSON.stringify(userData));
                localStorage.removeItem('pending_nickname');
                
                // هدایت به داشبورد
                window.location.href = '/dashboard.html';
            } else {
                console.error('❌ Failed to fetch user data');
                localStorage.removeItem('netlify_token');
            }
        } catch (error) {
            console.error('❌ Error fetching user data:', error);
        }
    }

    checkLoginStatus();

    // ============================================
    // مدیریت صفحات
    // ============================================
    window.showPage = function(page) {
        const pages = ['login', 'dashboard', 'matches', 'charge', 'profile'];
        pages.forEach(p => {
            const el = document.getElementById(p + '-page');
            if (el) el.style.display = 'none';
        });
        
        const target = document.getElementById(page + '-page');
        if (target) target.style.display = 'block';
        
        // به‌روزرسانی اطلاعات در صورت نیاز
        if (page === 'dashboard' || page === 'profile' || page === 'charge') {
            updateUserInfo();
        }
    };

    // ============================================
    // به‌روزرسانی اطلاعات کاربر
    // ============================================
    function updateUserInfo() {
        const userData = JSON.parse(localStorage.getItem('netlify_user') || '{}');
        
        document.getElementById('user-name').textContent = userData.name || 'کاربر';
        document.getElementById('user-nickname').textContent = userData.nickname || 'اسم مستعار';
        document.getElementById('user-email').textContent = userData.email || 'email@example.com';
        document.getElementById('user-balance').textContent = (userData.balance || 0) + ' UC';
        document.getElementById('charge-balance').textContent = (userData.balance || 0) + ' UC';
        document.getElementById('profile-name').textContent = userData.name || 'کاربر';
        document.getElementById('profile-nickname').textContent = userData.nickname || 'اسم مستعار';
        document.getElementById('profile-email').textContent = userData.email || 'email@example.com';
        document.getElementById('profile-balance').textContent = (userData.balance || 0) + ' UC';
    }

    // ============================================
    // ثبت‌نام در مسابقه
    // ============================================
    window.registerMatch = function(type) {
        const userData = JSON.parse(localStorage.getItem('netlify_user') || '{}');
        const configs = {
            room: { name: 'روم', price: 130 },
            solo: { name: 'سولو', price: 180 },
            duo: { name: 'دوتایی', price: 250 }
        };
        
        const config = configs[type];
        if (!config) return;

        if ((userData.balance || 0) < config.price) {
            alert(`❌ موجودی کافی نیست! نیاز: ${config.price} UC`);
            return;
        }

        userData.balance -= config.price;
        localStorage.setItem('netlify_user', JSON.stringify(userData));
        updateUserInfo();
        alert(`✅ ثبت‌نام در مسابقه ${config.name} موفق!`);
    };

    // ============================================
    // ارسال کد شارژ
    // ============================================
    window.submitCharge = function() {
        const code = document.getElementById('charge-code').value.trim();
        if (code.length !== 16) {
            alert('⚠️ کد باید ۱۶ رقم باشد!');
            return;
        }
        alert(`✅ کد ${code} با موفقیت ارسال شد! منتظر تأیید ادمین باشید.`);
        document.getElementById('charge-code').value = '';
    };

    // ============================================
    // خروج
    // ============================================
    window.logout = function() {
        console.log('🚪 Logging out...');
        localStorage.removeItem('netlify_token');
        localStorage.removeItem('netlify_user');
        window.location.href = '/';
    };

    console.log('✅ script.js initialization complete');
});
