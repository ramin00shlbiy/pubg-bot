// ============================================
// منطق ثبت‌نام و ورود با Netlify Identity
// ============================================

console.log('🚀 script.js loaded successfully');

// صبر کردن برای بارگذاری کامل DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded');

    // ===== بررسی در دسترس بودن Netlify Identity =====
    function getIdentity() {
        if (typeof window.netlifyIdentity !== 'undefined') {
            return window.netlifyIdentity;
        }
        return null;
    }

    const netlifyIdentity = getIdentity();

    if (!netlifyIdentity) {
        console.error('❌ Netlify Identity not available');
        alert('⚠️ سیستم احراز هویت در حال بارگذاری است. لطفاً صفحه را ریفرش کنید.');
        return;
    }

    console.log('✅ Netlify Identity loaded successfully');

    // ===== مدیریت تب‌ها =====
    const tabBtns = document.querySelectorAll('.tab-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    console.log('🔍 Found tabs:', tabBtns.length);

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('🔄 Tab clicked:', this.dataset.tab);
            
            // تغییر تب فعال
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // نمایش فرم مربوطه
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
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');

    if (switchToRegister) {
        switchToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('.tab-btn[data-tab="register"]')?.click();
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('.tab-btn[data-tab="login"]')?.click();
        });
    }

    // ===== ثبت‌نام کاربر =====
    const registerFormElement = document.getElementById('register');
    if (registerFormElement) {
        registerFormElement.addEventListener('submit', async function(e) {
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
                const user = await netlifyIdentity.signup({
                    email: email,
                    password: password,
                    full_name: name
                });
                
                alert('✅ ثبت‌نام موفق! لطفاً ایمیل خود را تأیید کنید.');
                console.log('User registered:', user);
                
                document.getElementById('register')?.reset();
                document.querySelector('.tab-btn[data-tab="login"]')?.click();
            } catch (error) {
                alert('❌ خطا در ثبت‌نام: ' + error.message);
                console.error(error);
            }
        });
    } else {
        console.error('❌ Register form not found');
    }

    // ===== ورود کاربر =====
    const loginFormElement = document.getElementById('login');
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('🔐 Login form submitted');

            const email = document.getElementById('login-email')?.value || '';
            const password = document.getElementById('login-password')?.value || '';

            try {
                const user = await netlifyIdentity.login({
                    email: email,
                    password: password
                });
                
                alert('✅ ورود موفق! به داشبورد هدایت می‌شوید.');
                console.log('User logged in:', user);
                
                window.location.href = '/dashboard.html';
            } catch (error) {
                alert('❌ خطا در ورود: ' + error.message);
                console.error(error);
            }
        });
    } else {
        console.error('❌ Login form not found');
    }

    // ===== بررسی وضعیت لاگین =====
    netlifyIdentity.on('login', function(user) {
        console.log('User logged in:', user);
        window.location.href = '/dashboard.html';
    });

    netlifyIdentity.on('logout', function() {
        console.log('User logged out');
        window.location.href = '/';
    });
});
