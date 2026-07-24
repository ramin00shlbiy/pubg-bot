// ============================================
// منطق ثبت‌نام و ورود با Netlify Identity
// ============================================

// راه‌اندازی Netlify Identity
const netlifyIdentity = window.netlifyIdentity;

// نمایش فرم‌ها
document.addEventListener('DOMContentLoaded', function() {
    // مدیریت تب‌ها
    const tabBtns = document.querySelectorAll('.tab-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
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

    // سوئیچ بین فرم‌ها
    document.getElementById('switch-to-register').addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.tab-btn[data-tab="register"]').click();
    });

    document.getElementById('switch-to-login').addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.tab-btn[data-tab="login"]').click();
    });

    // ===== ثبت‌نام کاربر =====
    document.getElementById('register').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        if (password.length < 6) {
            alert('رمز عبور باید حداقل ۶ کاراکتر باشد.');
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
            
            // پاک کردن فرم
            document.getElementById('register').reset();
            document.querySelector('.tab-btn[data-tab="login"]').click();
        } catch (error) {
            alert('❌ خطا در ثبت‌نام: ' + error.message);
            console.error(error);
        }
    });

    // ===== ورود کاربر =====
    document.getElementById('login').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const user = await netlifyIdentity.login({
                email: email,
                password: password
            });
            
            alert('✅ ورود موفق! به داشبورد هدایت می‌شوید.');
            console.log('User logged in:', user);
            
            // هدایت به داشبورد
            window.location.href = '/dashboard.html';
        } catch (error) {
            alert('❌ خطا در ورود: ' + error.message);
            console.error(error);
        }
    });

    // بررسی وضعیت لاگین
    netlifyIdentity.on('login', function(user) {
        console.log('User logged in:', user);
        window.location.href = '/dashboard.html';
    });

    netlifyIdentity.on('logout', function() {
        console.log('User logged out');
        window.location.href = '/';
    });
});
