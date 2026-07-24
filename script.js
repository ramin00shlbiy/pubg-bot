// ============================================
// منطق ثبت‌نام و ورود با گوگل (Netlify Identity)
// ============================================

console.log('🚀 PUBG Empire - script.js loaded successfully');

// ============================================
// صبر برای بارگذاری کامل DOM
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded');

    // ============================================
    // متغیرهای عمومی
    // ============================================
    const SITE_URL = window.location.origin;
    const LOGIN_BTN = document.getElementById('google-login-btn');
    const REGISTER_BTN = document.getElementById('google-register-btn');
    const TAB_BTNS = document.querySelectorAll('.tab-btn');
    const LOGIN_FORM = document.getElementById('login-form');
    const REGISTER_FORM = document.getElementById('register-form');
    const SWITCH_TO_REGISTER = document.getElementById('switch-to-register');
    const SWITCH_TO_LOGIN = document.getElementById('switch-to-login');
    const REGISTER_FORM_ELEMENT = document.getElementById('register');
    const LOGIN_FORM_ELEMENT = document.getElementById('login');

    // ============================================
    // مدیریت تب‌ها
    // ============================================
    TAB_BTNS.forEach(btn => {
        btn.addEventListener('click', function() {
            // تغییر تب فعال
            TAB_BTNS.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // نمایش فرم مربوطه
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

    // ============================================
    // سوئیچ بین فرم‌ها
    // ============================================
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

    // ============================================
    // ورود با گوگل
    // ============================================
    if (LOGIN_BTN) {
        LOGIN_BTN.addEventListener('click', function() {
            console.log('🔐 Google login clicked');
            // ذخیره مسیر بازگشت
            localStorage.setItem('redirect_after_login', '/dashboard.html');
            // هدایت به صفحه ورود گوگل
            window.location.href = `${SITE_URL}/.netlify/identity/authorize?provider=google`;
        });
    }

    // ============================================
    // ثبت‌نام با گوگل
    // ============================================
    if (REGISTER_BTN) {
        REGISTER_BTN.addEventListener('click', function() {
            console.log('📝 Google register clicked');
            const name = document.getElementById('register-name')?.value || 'کاربر';
            localStorage.setItem('pending_name', name);
            window.location.href = `${SITE_URL}/.netlify/identity/authorize?provider=google`;
        });
    }

    // ============================================
    // ثبت‌نام کاربر (با ایمیل - در صورت نیاز)
    // ============================================
    if (REGISTER_FORM_ELEMENT) {
        REGISTER_FORM_ELEMENT.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📝 Register form submitted');

            const name = document.getElementById('register-name')?.value || '';
            const email = document.getElementById('register-email')?.value || '';
            const password = document.getElementById('register-password')?.value || '';

            if (password.length < 6) {
                alert('⚠️ رمز عبور باید حداقل ۶ کاراکتر باشد.');
                return;
            }

            try {
                const response = await fetch(`${SITE_URL}/.netlify/identity/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password,
                        full_name: name
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.msg || 'خطا در ثبت‌نام');
                }

                const data = await response.json();
                console.log('User registered:', data);
                
                alert('✅ ثبت‌نام موفق! لطفاً ایمیل خود را تأیید کنید.');
                REGISTER_FORM_ELEMENT.reset();
                document.querySelector('.tab-btn[data-tab="login"]')?.click();

            } catch (error) {
                alert('❌ خطا در ثبت‌نام: ' + error.message);
                console.error(error);
            }
        });
    }

    // ============================================
    // ورود کاربر (با ایمیل - در صورت نیاز)
    // ============================================
    if (LOGIN_FORM_ELEMENT) {
        LOGIN_FORM_ELEMENT.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('🔐 Login form submitted');

            const email = document.getElementById('login-email')?.value || '';
            const password = document.getElementById('login-password')?.value || '';

            try {
                const response = await fetch(`${SITE_URL}/.netlify/identity/token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.msg || data.error_description || 'خطا در ورود');
                }

                console.log('User logged in:', data);
                
                localStorage.setItem('netlify_token', data.token);
                localStorage.setItem('netlify_user', JSON.stringify(data.user));
                
                alert('✅ ورود موفق! به داشبورد هدایت می‌شوید.');
                window.location.href = '/dashboard.html';

            } catch (error) {
                alert('❌ خطا در ورود: ' + error.message);
                console.error('Login error:', error);
            }
        });
    }

    // ============================================
    // بررسی وضعیت ورود (بعد از بازگشت از گوگل)
    // ============================================
    function checkLoginStatus() {
        // بررسی وجود توکن در URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
            console.log('🔑 Token found in URL');
            localStorage.setItem('netlify_token', token);
            window.history.replaceState({}, document.title, window.location.pathname);
            fetchUserData(token);
            return;
        }

        // بررسی توکن در localStorage
        const savedToken = localStorage.getItem('netlify_token');
        if (savedToken) {
            console.log('🔑 Token found in localStorage');
            fetchUserData(savedToken);
        }
    }

    // ============================================
    // دریافت اطلاعات کاربر
    // ============================================
    async function fetchUserData(token) {
        try {
            console.log('📡 Fetching user data...');
            const response = await fetch(`${SITE_URL}/.netlify/identity/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const user = await response.json();
                console.log('✅ User logged in:', user);
                
                // ذخیره اطلاعات کاربر
                localStorage.setItem('netlify_user', JSON.stringify(user));
                
                // بررسی مسیر بازگشت
                const redirectPath = localStorage.getItem('redirect_after_login') || '/dashboard.html';
                localStorage.removeItem('redirect_after_login');
                
                // هدایت به داشبورد
                console.log(`🔄 Redirecting to: ${redirectPath}`);
                window.location.href = redirectPath;
            } else {
                console.error('❌ Failed to fetch user data');
                localStorage.removeItem('netlify_token');
            }
        } catch (error) {
            console.error('❌ Error fetching user data:', error);
        }
    }

    // ============================================
    // خروج
    // ============================================
    window.logout = function() {
        console.log('🚪 Logging out...');
        localStorage.removeItem('netlify_token');
        localStorage.removeItem('netlify_user');
        localStorage.removeItem('redirect_after_login');
        window.location.href = '/';
    };

    // ============================================
    // بررسی وضعیت ورود در هنگام بارگذاری
    // ============================================
    checkLoginStatus();

    console.log('✅ script.js initialization complete');
});
