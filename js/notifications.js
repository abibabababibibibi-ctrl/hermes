// notifications.js - Полноценная система уведомлений для пользователей

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.currentUser = null;
        this.unreadCount = 0;
        this.toastContainer = null;
        this.isPanelOpen = false;
        this.init();
    }

    init() {
        // Получаем текущего пользователя
        this.currentUser = this.getCurrentUser();
        
        // Создаем контейнер для Toast
        this.createToastContainer();
        
        // Загружаем уведомления
        this.loadNotifications();
        
        // СОЗДАЕМ КНОПКУ И ПАНЕЛЬ СРАЗУ
        this.createNotificationUI();
        
        // Обновляем бейдж
        this.updateBadge();
        
        // Запускаем проверку новых уведомлений
        if (this.currentUser) {
            setInterval(() => this.checkNewNotifications(), 30000);
        }
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser') || 
            localStorage.getItem('hermes_session') || 
            sessionStorage.getItem('hermes_current_user') || 'null');
    }

    createToastContainer() {
        if (document.getElementById('toast-container')) return;
        
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10001;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 380px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        this.toastContainer = container;
    }

    createNotificationUI() {
        // Проверяем, есть ли уже кнопка
        if (document.getElementById('notificationsBtn')) {
            this.setupEventListeners();
            return;
        }
        
        // Находим место для кнопки
        const navActions = document.querySelector('.nav-actions');
        if (!navActions) {
            // Если нет nav-actions, создаем в header
            const header = document.querySelector('.header .nav');
            if (header) {
                const actions = document.createElement('div');
                actions.className = 'nav-actions';
                header.appendChild(actions);
                this.createNotificationUI();
                return;
            }
            return;
        }
        
        // Создаем кнопку
        const btnWrapper = document.createElement('div');
        btnWrapper.className = 'notifications-wrapper';
        btnWrapper.style.cssText = `
            position: relative;
            display: inline-block;
        `;
        
        btnWrapper.innerHTML = `
            <button class="notifications-btn" id="notificationsBtn" title="Уведомления" style="
                background: none;
                border: none;
                cursor: pointer;
                font-size: 1.2rem;
                color: var(--text-primary, #333);
                padding: 8px 12px;
                border-radius: 8px;
                position: relative;
                transition: all 0.3s;
            ">
                <i class="fas fa-bell"></i>
                <span id="notificationsBadge" style="
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    background: #e74c3c;
                    color: white;
                    font-size: 0.6rem;
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: 50%;
                    min-width: 18px;
                    height: 18px;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    transform: translate(4px, -4px);
                ">0</span>
            </button>
        `;
        
        // Вставляем перед блоком авторизации или в конец
        const authSection = navActions.querySelector('.nav-auth');
        if (authSection) {
            navActions.insertBefore(btnWrapper, authSection);
        } else {
            navActions.appendChild(btnWrapper);
        }
        
        // СОЗДАЕМ ПАНЕЛЬ УВЕДОМЛЕНИЙ
        this.createPanel();
        
        // Настраиваем обработчики
        this.setupEventListeners();
    }

    createPanel() {
        // Удаляем старую панель, если есть
        const oldPanel = document.getElementById('notificationsPanel');
        if (oldPanel) oldPanel.remove();
        
        const panel = document.createElement('div');
        panel.id = 'notificationsPanel';
        panel.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            width: 380px;
            max-height: 500px;
            background: var(--bg-primary, #ffffff);
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            display: none;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid var(--border-color, #e9ecef);
        `;
        
        panel.innerHTML = `
            <div style="
                padding: 16px 20px;
                border-bottom: 1px solid var(--border-color, #e9ecef);
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-shrink: 0;
                background: var(--bg-primary, #ffffff);
            ">
                <h3 style="margin: 0; font-size: 1rem; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-bell"></i> Уведомления
                </h3>
                <button id="clearAllBtn" style="
                    background: none;
                    border: none;
                    color: var(--text-tertiary, #999);
                    cursor: pointer;
                    font-size: 0.8rem;
                    padding: 4px 12px;
                    border-radius: 20px;
                    transition: all 0.3s;
                ">Прочитать все</button>
            </div>
            <div id="notificationsList" style="
                flex: 1;
                overflow-y: auto;
                max-height: 400px;
            ">
                <div style="
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--text-tertiary, #999);
                ">
                    <i class="fas fa-bell-slash" style="font-size: 2.5rem; display: block; margin-bottom: 12px;"></i>
                    <p style="margin: 0; font-size: 0.9rem;">Нет уведомлений</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
    }

    setupEventListeners() {
        // Кнопка открытия/закрытия
        const btn = document.getElementById('notificationsBtn');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePanel();
            });
        }
        
        // Кнопка "Прочитать все"
        const clearBtn = document.getElementById('clearAllBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.markAllAsRead();
            });
        }
        
        // Закрытие при клике вне панели
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('notificationsPanel');
            const btn = document.getElementById('notificationsBtn');
            if (this.isPanelOpen && 
                panel && !panel.contains(e.target) && 
                btn && !btn.contains(e.target)) {
                this.closePanel();
            }
        });
        
        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isPanelOpen) {
                this.closePanel();
            }
        });
    }

    togglePanel() {
        if (this.isPanelOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }

    openPanel() {
        const panel = document.getElementById('notificationsPanel');
        if (panel) {
            panel.style.display = 'flex';
            this.isPanelOpen = true;
            this.renderNotifications();
            // Отмечаем все как прочитанные при открытии
            this.markAllAsRead();
        }
    }

    closePanel() {
        const panel = document.getElementById('notificationsPanel');
        if (panel) {
            panel.style.display = 'none';
            this.isPanelOpen = false;
        }
    }

    loadNotifications() {
        if (!this.currentUser) {
            this.notifications = [];
            return;
        }
        
        const key = `notifications_${this.currentUser.id}`;
        const saved = localStorage.getItem(key);
        
        if (saved) {
            this.notifications = JSON.parse(saved);
        } else {
            // Добавляем приветственные уведомления
            this.notifications = [
                {
                    id: Date.now(),
                    type: 'info',
                    title: '👋 Добро пожаловать!',
                    message: `Рады видеть вас, ${this.currentUser.firstName}! Добро пожаловать в агентство "Гермес".`,
                    timestamp: new Date().toISOString(),
                    read: false,
                    actions: []
                },
                {
                    id: Date.now() + 1,
                    type: 'success',
                    title: '✅ Аккаунт создан',
                    message: 'Ваш аккаунт успешно создан. Теперь вы можете просматривать объекты и делать бронирования.',
                    timestamp: new Date().toISOString(),
                    read: false,
                    actions: [
                        { label: 'Перейти в каталог', url: 'catalog.html' }
                    ]
                },
                {
                    id: Date.now() + 2,
                    type: 'booking',
                    title: '🏠 Рекомендация',
                    message: 'В каталоге появились новые квартиры в центре города, которые могут вас заинтересовать.',
                    timestamp: new Date().toISOString(),
                    read: false,
                    actions: [
                        { label: 'Посмотреть', url: 'catalog.html' }
                    ]
                }
            ];
            this.saveNotifications();
        }
        
        this.unreadCount = this.notifications.filter(n => !n.read).length;
    }

    saveNotifications() {
        if (!this.currentUser) return;
        const key = `notifications_${this.currentUser.id}`;
        localStorage.setItem(key, JSON.stringify(this.notifications));
    }

    renderNotifications() {
        const list = document.getElementById('notificationsList');
        if (!list) return;
        
        if (this.notifications.length === 0) {
            list.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-tertiary, #999);">
                    <i class="fas fa-bell-slash" style="font-size: 2.5rem; display: block; margin-bottom: 12px;"></i>
                    <p style="margin: 0; font-size: 0.9rem;">Нет уведомлений</p>
                </div>
            `;
            return;
        }
        
        list.innerHTML = this.notifications.map(notif => this.createNotificationHTML(notif)).join('');
        
        // Добавляем обработчики на элементы
        list.querySelectorAll('.notification-item').forEach(item => {
            const id = parseInt(item.dataset.id);
            item.addEventListener('click', (e) => {
                if (e.target.closest('.btn-sm')) return;
                this.markAsRead(id);
            });
        });
    }

    createNotificationHTML(notif) {
        const timeAgo = this.getTimeAgo(notif.timestamp);
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle',
            booking: 'fa-calendar-check',
            deal: 'fa-handshake'
        };
        const icon = iconMap[notif.type] || 'fa-info-circle';
        const colorMap = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db',
            booking: '#9b59b6',
            deal: '#1abc9c'
        };
        const color = colorMap[notif.type] || '#3498db';
        
        let actionsHTML = '';
        if (notif.actions && notif.actions.length > 0) {
            actionsHTML = `
                <div style="display: flex; gap: 8px; margin-top: 6px;">
                    ${notif.actions.map(action => `
                        <a href="${action.url || '#'}" style="
                            padding: 4px 12px;
                            font-size: 0.7rem;
                            border-radius: 20px;
                            background: #3498db;
                            color: white;
                            text-decoration: none;
                            border: none;
                            cursor: pointer;
                            transition: all 0.3s;
                        ">${action.label}</a>
                    `).join('')}
                </div>
            `;
        }
        
        return `
            <div class="notification-item ${notif.read ? 'read' : 'unread'}" data-id="${notif.id}" style="
                padding: 12px 20px;
                border-bottom: 1px solid var(--border-color, #f1f2f6);
                cursor: pointer;
                transition: background 0.2s;
                display: flex;
                gap: 12px;
                align-items: flex-start;
                ${!notif.read ? 'background: rgba(52, 152, 219, 0.05); border-left: 3px solid #3498db;' : ''}
            ">
                <div style="
                    flex-shrink: 0;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.9rem;
                    background: ${color}20;
                    color: ${color};
                ">
                    <i class="fas ${icon}"></i>
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary, #333); margin-bottom: 2px;">${notif.title}</div>
                    <div style="font-size: 0.82rem; color: var(--text-secondary, #666); line-height: 1.4;">${notif.message}</div>
                    <div style="font-size: 0.7rem; color: var(--text-tertiary, #999); margin-top: 4px;">${timeAgo}</div>
                    ${actionsHTML}
                </div>
            </div>
        `;
    }

    updateBadge() {
        const badge = document.getElementById('notificationsBadge');
        if (!badge) return;
        
        this.unreadCount = this.notifications.filter(n => !n.read).length;
        
        if (this.unreadCount > 0) {
            badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    markAsRead(id) {
        const notif = this.notifications.find(n => n.id === id);
        if (notif && !notif.read) {
            notif.read = true;
            this.saveNotifications();
            this.updateBadge();
            if (this.isPanelOpen) {
                this.renderNotifications();
            }
        }
    }

    markAllAsRead() {
        let hasUnread = false;
        this.notifications.forEach(n => {
            if (!n.read) {
                n.read = true;
                hasUnread = true;
            }
        });
        
        if (hasUnread) {
            this.saveNotifications();
            this.updateBadge();
            if (this.isPanelOpen) {
                this.renderNotifications();
            }
        }
    }

    // ========== ДОБАВЛЕНИЕ УВЕДОМЛЕНИЙ ==========

    addNotification(type, title, message, actions = []) {
        if (!this.currentUser) return;
        
        const notification = {
            id: Date.now() + Math.random(),
            type: type,
            title: title,
            message: message,
            timestamp: new Date().toISOString(),
            read: false,
            actions: actions
        };
        
        this.notifications.unshift(notification);
        this.saveNotifications();
        this.updateBadge();
        
        // Показываем Toast
        this.showToast(type, title, message);
        
        if (this.isPanelOpen) {
            this.renderNotifications();
        }
        
        return notification;
    }

    // Специализированные методы
    success(title, message, actions = []) {
        return this.addNotification('success', title, message, actions);
    }

    error(title, message, actions = []) {
        return this.addNotification('error', title, message, actions);
    }

    warning(title, message, actions = []) {
        return this.addNotification('warning', title, message, actions);
    }

    info(title, message, actions = []) {
        return this.addNotification('info', title, message, actions);
    }

    booking(title, message, actions = []) {
        return this.addNotification('booking', title, message, actions);
    }

    deal(title, message, actions = []) {
        return this.addNotification('deal', title, message, actions);
    }

    // ========== TOAST УВЕДОМЛЕНИЯ ==========

    showToast(type, title, message, duration = 4000) {
        if (!this.toastContainer) return;
        
        const toast = document.createElement('div');
        const colorMap = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db',
            booking: '#9b59b6',
            deal: '#1abc9c'
        };
        const color = colorMap[type] || '#3498db';
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle',
            booking: 'fa-calendar-check',
            deal: 'fa-handshake'
        };
        const icon = iconMap[type] || 'fa-info-circle';
        
        toast.style.cssText = `
            background: var(--bg-primary, #ffffff);
            border-radius: 12px;
            padding: 14px 18px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            transform: translateX(calc(100% + 20px));
            transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            pointer-events: auto;
            border-left: 4px solid ${color};
            max-width: 380px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        `;
        
        toast.innerHTML = `
            <div style="flex-shrink: 0; font-size: 1.2rem; color: ${color};">
                <i class="fas ${icon}"></i>
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 600; font-size: 0.9rem; margin-bottom: 2px;">${title}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary, #666);">${message}</div>
            </div>
            <div style="flex-shrink: 0; cursor: pointer; color: var(--text-tertiary, #999); font-size: 0.9rem; padding: 4px;" class="toast-close">
                <i class="fas fa-times"></i>
            </div>
            <div style="position: absolute; bottom: 0; left: 0; height: 3px; width: 100%; background: ${color}; border-radius: 0 0 12px 12px; animation: progressBar ${duration}ms linear forwards;"></div>
        `;
        
        // Добавляем стиль для анимации
        if (!document.getElementById('toast-animations')) {
            const style = document.createElement('style');
            style.id = 'toast-animations';
            style.textContent = `
                @keyframes progressBar {
                    from { width: 100%; opacity: 0.7; }
                    to { width: 0%; opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Закрытие по крестику
        toast.querySelector('.toast-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeToast(toast);
        });
        
        // Закрытие по клику на уведомление
        toast.addEventListener('click', () => {
            this.openPanel();
            this.removeToast(toast);
        });
        
        this.toastContainer.appendChild(toast);
        
        // Анимация появления
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });
        
        // Автоматическое удаление
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);
    }

    removeToast(toast) {
        toast.style.transform = 'translateX(calc(100% + 20px))';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }

    // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ==========

    getTimeAgo(timestamp) {
        const now = new Date();
        const date = new Date(timestamp);
        const diff = Math.floor((now - date) / 1000);
        
        if (diff < 60) return 'только что';
        if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} дн назад`;
        
        return date.toLocaleDateString('ru-RU');
    }

    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    getAll() {
        return this.notifications;
    }

    clearAll() {
        this.notifications = [];
        this.saveNotifications();
        this.updateBadge();
        if (this.isPanelOpen) {
            this.renderNotifications();
        }
    }

    // ========== ПРОВЕРКА НОВЫХ УВЕДОМЛЕНИЙ ==========

    checkNewNotifications() {
        if (Math.random() > 0.8) {
            const types = ['info', 'success', 'warning'];
            const type = types[Math.floor(Math.random() * types.length)];
            const messages = [
                ['📢 Новый объект', 'В каталог добавлена новая квартира в центре города'],
                ['🎉 Акция', 'Скидка 50% на услуги агента до конца месяца!'],
                ['📊 Обновление', 'В каталоге появились новые объекты в вашем районе']
            ];
            const msg = messages[Math.floor(Math.random() * messages.length)];
            this.addNotification(type, msg[0], msg[1]);
        }
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========

let notificationSystem = null;

document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('currentUser') || 
        localStorage.getItem('hermes_session') || 
        sessionStorage.getItem('hermes_current_user') || 'null');
    
    // Создаем глобальный объект для уведомлений ДО инициализации
    window.notify = {
        success: (title, message) => {},
        error: (title, message) => {},
        warning: (title, message) => {},
        info: (title, message) => {},
        booking: (title, message) => {},
        deal: (title, message) => {}
    };
    
    if (user) {
        notificationSystem = new NotificationSystem();
        // Переопределяем методы глобального объекта
        window.notify = {
            success: (title, message, actions) => notificationSystem.success(title, message, actions),
            error: (title, message, actions) => notificationSystem.error(title, message, actions),
            warning: (title, message, actions) => notificationSystem.warning(title, message, actions),
            info: (title, message, actions) => notificationSystem.info(title, message, actions),
            booking: (title, message, actions) => notificationSystem.booking(title, message, actions),
            deal: (title, message, actions) => notificationSystem.deal(title, message, actions),
            add: (type, title, message, actions) => notificationSystem.addNotification(type, title, message, actions)
        };
        
        // Обновляем UI авторизации
        updateAuthUI(user);
    }
});

function updateAuthUI(user) {
    const authSection = document.getElementById('authSection');
    if (!authSection) return;
    
    authSection.innerHTML = `
        <div class="user-menu" style="position: relative; display: flex; align-items: center; gap: 8px;">
            <div class="user-avatar" style="
                width: 38px;
                height: 38px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea, #764ba2);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 600;
                cursor: pointer;
                font-size: 0.9rem;
            ">
                ${user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
            </div>
        </div>
    `;
}
