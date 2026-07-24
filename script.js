// ============================================
// منطق ثبت‌نام و ورود با گوگل (Netlify Identity)
// ============================================

console.log('🚀 script.js loaded successfully');

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded');

    const SITE_URL = window.location.origin;

    // ===== مدیریت تب‌ها =====
    const tabBtns = document.querySelectorAll('.tab-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const tab = this.dataset.tab;
            if (tab === 'login') {
                loginForm.classList.add('active');
                registerForm.classList.remove('active');
            } else {
                registerForm.classList.add('active');
                loginForm.classList.remove('active');
            }
        });
    });

    // ===== سوئیچ بین فرم‌ها =====
    document.getElementById('switch-to-register')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.tab-btn[data-tab="register"]')?.click();
    });

    document.getElementById('switch-to-login')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.tab-btn[data-tab="login"]')?.click();
    });

    // ============================================
    // ورود با گوگل
    // ============================================
    document.getElementById('google-login-btn')?.addEventListener('click', function() {
        console.log('🔐 Google login clicked');
        // ذخیره مسیر بازگشت در localStorage
        localStorage.setItem('redirect_after_login', '/dashboard.html');
        // هدایت به صفحه ورود گوگل Netlify Identity
        window.location.href = `${SITE_URL}/.netlify/identity/authorize?provider=google`;
    });

    // ============================================
    // ثبت‌نام با گوگل
    // ============================================
    document.getElementById('google-register-btn')?.addEventListener('click', function() {
        console.log('📝 Google register clicked');
        
        const name = document.getElementById('register-name')?.value || 'کاربر';
        localStorage.setItem('pending_name', name);
        window.location.href = `${SITE_URL}/.netlify/identity/authorize?provider=google`;
    });

    // ============================================
    // بررسی وضعیت ورود (بعد از بازگشت از گوگل)
    // ============================================
    function checkLoginStatus() {
        // بررسی وجود توکن در URL (بعد از بازگشت از گوگل)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
            // ذخیره توکن
            localStorage.setItem('netlify_token', token);
            // حذف توکن از URL
            window.history.replaceState({}, document.title, window.location.pathname);
            // دریافت اطلاعات کاربر
            fetchUserData(token);
            return;
        }

        // بررسی توکن در localStorage
        const savedToken = localStorage.getItem('netlify_token');
        if (savedToken) {
            fetchUserData(savedToken);
        }
    }

    async function fetchUserData(token) {
        try {
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

    // بررسی وضعیت ورود در هنگام بارگذاری صفحه
    checkLoginStatus();

    // ============================================
    // خروج (در صورت نیاز در صفحه اصلی)
    // ============================================
    window.logout = function() {
        localStorage.removeItem('netlify_token');
        localStorage.removeItem('netlify_user');
        window.location.href = '/';
    };
});
