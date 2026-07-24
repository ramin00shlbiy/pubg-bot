// ============================================
// منطق ثبت‌نام و ورود با Netlify Identity API
// ============================================

console.log('🚀 script.js loaded successfully');

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded');

    // ===== آدرس سایت =====
    const SITE_URL = window.location.origin; // https://pubg-empire.netlify.app

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

    // ===== ثبت‌نام کاربر (با fetch مستقیم) =====
    document.getElementById('register')?.addEventListener('submit', async function(e) {
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
            document.getElementById('register')?.reset();
            document.querySelector('.tab-btn[data-tab="login"]')?.click();

        } catch (error) {
            alert('❌ خطا در ثبت‌نام: ' + error.message);
            console.error(error);
        }
    });

    // ===== ورود کاربر (با fetch مستقیم) =====
    document.getElementById('login')?.addEventListener('submit', async function(e) {
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

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'خطا در ورود');
            }

            const data = await response.json();
            console.log('User logged in:', data);
            
            // ذخیره توکن در localStorage
            localStorage.setItem('netlify_token', data.token);
            localStorage.setItem('netlify_user', JSON.stringify(data.user));
            
            alert('✅ ورود موفق! به داشبورد هدایت می‌شوید.');
            window.location.href = '/dashboard.html';

        } catch (error) {
            alert('❌ خطا در ورود: ' + error.message);
            console.error(error);
        }
    });
});
