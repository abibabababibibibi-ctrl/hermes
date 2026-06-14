// js/auth.js
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, авторизован ли пользователь
    checkAuth();

    // Инициализируем формы
    initLoginForm();
    initRegisterForm();
});

// Проверка авторизации
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        updateAuthUI(JSON.parse(user));
    }
}

// Обновление интерфейса при авторизации
function updateAuthUI(user) {
    const navAuth = document.querySelector('.nav-auth');
    if (!navAuth) return;

    navAuth.innerHTML = `
        <div class="user-menu">
            <div class="user-avatar">${user.firstName.charAt(0)}${user.lastName.charAt(0)}</div>
            <span class="user-name">${user.firstName}</span>
            <div class="dropdown">
                <a href="dashboard.html">Личный кабинет</a>
                <a href="#" onclick="logout()">Выйти</a>
            </div>
        </div>
    `;
}

// Инициализация формы входа
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Валидация
        if (!validateEmail(email)) {
            showError('emailError', 'Введите корректный email');
            return;
        }

        if (password.length < 6) {
            showError('passwordError', 'Пароль должен содержать минимум 6 символов');
            return;
        }

        // Симуляция запроса на сервер
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Сохраняем данные пользователя
            localStorage.setItem('currentUser', JSON.stringify(user));

            // Показываем уведомление об успешном входе
            showSuccess('Успешный вход! Перенаправляем...');

            // Перенаправляем на главную страницу
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showError('passwordError', 'Неверный email или пароль');
        }
    });
}

// Инициализация формы регистрации
function initRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    // Показ/скрытие поля агентства
    const isRealtorCheckbox = document.getElementById('isRealtor');
    const agencyField = document.getElementById('agencyField');

    if (isRealtorCheckbox) {
        isRealtorCheckbox.addEventListener('change', function() {
            agencyField.style.display = this.checked ? 'block' : 'none';
        });
    }

    // Валидация пароля при вводе
    const passwordInput = document.getElementById('regPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', validatePasswordStrength);
    }

    // Обработка отправки формы
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const terms = document.querySelector('input[name="terms"]').checked;

        // Валидация
        let isValid = true;

        if (!firstName) {
            showError('firstNameError', 'Введите имя');
            isValid = false;
        }

        if (!lastName) {
            showError('lastNameError', 'Введите фамилию');
            isValid = false;
        }

        if (!validateEmail(email)) {
            showError('regEmailError', 'Введите корректный email');
            isValid = false;
        }

        if (!validatePhone(phone)) {
            showError('phoneError', 'Введите корректный номер телефона');
            isValid = false;
        }

        if (!validatePassword(password)) {
            showError('regPasswordError', 'Пароль не соответствует требованиям');
            isValid = false;
        }

        if (password !== confirmPassword) {
            showError('confirmPasswordError', 'Пароли не совпадают');
            isValid = false;
        }

        if (!terms) {
            showError('termsError', 'Необходимо согласиться с условиями');
            isValid = false;
        }

        if (!isValid) return;

        // Проверка, существует ли пользователь
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some(u => u.email === email)) {
            showError('regEmailError', 'Пользователь с таким email уже существует');
            return;
        }

        // Создание нового пользователя
        const newUser = {
            id: Date.now(),
            firstName,
            lastName,
            email,
            phone,
            password, // В реальном приложении пароль должен хэшироваться!
            isRealtor: isRealtorCheckbox ? isRealtorCheckbox.checked : false,
            agency: isRealtorCheckbox && isRealtorCheckbox.checked ?
                   document.getElementById('agency').value.trim() : null,
            createdAt: new Date().toISOString(),
            favorites: [],
            applications: []
        };

        // Сохраняем пользователя
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Авторизуем пользователя
        localStorage.setItem('currentUser', JSON.stringify(newUser));

        // Показываем успешное сообщение
        showSuccess('Регистрация прошла успешно! Перенаправляем...');

        // Перенаправляем на главную страницу
        setTimeout(() => {
            window.location.href = 'index';
        }, 1500);
    });
}

// Валидация email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Валидация телефона
function validatePhone(phone) {
    const re = /^\+?[78][-\(]?\d{3}\)?-?\d{3}-?\d{2}-?\d{2}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// Валидация пароля
function validatePassword(password) {
    // Минимум 8 символов, заглавная буква, цифра, специальный символ
    const hasLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return hasLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
}

// Валидация силы пароля
function validatePasswordStrength() {
    const password = document.getElementById('regPassword').value;

    const requirements = {
        length: document.getElementById('length'),
        uppercase: document.getElementById('uppercase'),
        number: document.getElementById('number'),
        special: document.getElementById('special')
    };

    if (requirements.length) {
        requirements.length.className = password.length >= 8 ? 'valid' : 'invalid';
    }

    if (requirements.uppercase) {
        requirements.uppercase.className = /[A-Z]/.test(password) ? 'valid' : 'invalid';
    }

    if (requirements.number) {
        requirements.number.className = /\d/.test(password) ? 'valid' : 'invalid';
    }

    if (requirements.special) {
        requirements.special.className = /[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'valid' : 'invalid';
    }
}

// Показать ошибку
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
    }
}

// Показать успешное сообщение
function showSuccess(message) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Переключение видимости пароля
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentNode.querySelector('.toggle-password');

    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}

// Выход из системы
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index';
}

// Добавляем стили для анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Обновить UI в зависимости от статуса авторизации
updateAuthUI() 
    const user = this.getCurrentUser();
    const authSection = document.getElementById('authSection');
    
    if (!authSection) return;
    
    if (user) {
        authSection.innerHTML = `
            <div class="user-menu">
                <div class="user-avatar" onclick="toggleUserMenu()">
                    ${user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}${user.lastName ? user.lastName.charAt(0).toUpperCase() : ''}
                </div>
                <div class="user-dropdown" id="userDropdown">
                    <div class="user-info">
                        <strong>${user.firstName} ${user.lastName}</strong>
                        <small>${user.email}</small>
                    </div>
                    <div class="dropdown-divider"></div>
                    <a href="dashboard.html">
                        <i class="fas fa-tachometer-alt"></i> Личный кабинет
                    </a>
                    <a href="favorites.html">
                        <i class="fas fa-heart"></i> Избранное
                    </a>
                    <a href="dashboard.html?tab=bookings">
                        <i class="fas fa-calendar-alt"></i> Мои бронирования
                    </a>
                    ${user.role === 'admin' ? `
                        <div class="dropdown-divider"></div>
                        <a href="admin.html">
                            <i class="fas fa-crown"></i> Админ панель
                        </a>
                    ` : ''}
                    <div class="dropdown-divider"></div>
                    <a href="#" onclick="AuthService.logout(); return false;">
                        <i class="fas fa-sign-out-alt"></i> Выйти
                    </a>
                </div>
            </div>
        `;
    } else {
        authSection.innerHTML = `
            <a href="login.html" class="auth-btn auth-login">Войти</a>
            <a href="register.html" class="auth-btn auth-register">Регистрация</a>
        `;
    }
