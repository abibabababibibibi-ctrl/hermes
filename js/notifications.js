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
        
        // Создаем кнопку уведомлений в хедере
        this.createNotificationButton();
        
        // Создаем панель уведомлений
        this.createNotificationPanel();
        
        // Обновляем бейдж
        this.updateBadge();
        
        // Запускаем проверку новых уведомлений (каждые 30 секунд)
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
        document.body.appendChild(container);
        this.toastContainer = container;
    }

    createNotificationButton() {
        // Ищем место для кнопки в хедере
        const navActions = document.querySelector('.nav-actions');
        if (!navActions) return;
        
        // Проверяем, есть ли уже кнопка
        if (document.getElementById('notificationsBtn')) return;
        
        const btnWrapper = document.createElement('div');
        btnWrapper.className = 'notifications-wrapper';
        btnWrapper.style.position = 'relative';
        
        btnWrapper.innerHTML = `
            <button class="notifications-btn" id="notificationsBtn" title="Уведомления">
                <i class="fas fa-bell"></i>
                <span class="notifications-badge" id="notificationsBadge" style="display: none;">0</span>
            </button>
        `;
        
        // Вставляем перед блоком авторизации
        const authSection = navActions.querySelector('.nav-auth');
        if (authSection) {
            navActions.insertBefore(btnWrapper, authSection);
        } else {
            navActions.appendChild(btnWrapper);
        }
        
        // Добавляем обработчик
        document.getElementById('notificationsBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePanel();
        });
    }

    createNotificationPanel() {
        // Проверяем, есть ли уже панель
        if (document.getElementById('notificationsPanel')) return;
        
        const panel = document.createElement('div');
        panel.id = 'notificationsPanel';
        panel.className = 'notifications-panel';
        panel.innerHTML = `
            <div class="notifications-header">
                <h3><i class="fas fa-bell"></i> Уведомления</h3>
                <button class="btn-clear" id="clearAllBtn">Прочитать все</button>
            </div>
            <div class="notifications-list" id="notificationsList">
                <div class="empty-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <p>Нет уведомлений</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Обработчик для кнопки "Прочитать все"
        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.markAllAsRead();
        });
        
        // Закрытие при клике вне панели
        document.addEventListener('click', (e) => {
            if (this.isPanelOpen && 
                !e.target.closest('#notificationsPanel') && 
                !e.target.closest('#notificationsBtn')) {
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
            panel.classList.add('active');
            this.isPanelOpen = true;
            this.renderNotifications();
            // Сбрасываем счетчик при открытии
            this.markAllAsRead();
        }
    }

    closePanel() {
        const panel = document.getElementById('notificationsPanel');
        if (panel) {
            panel.classList.remove('active');
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
            // Добавляем приветственное уведомление для новых пользователей
            this.notifications = [
                {
                    id: Date.now(),
                    type: 'info',
                    title: 'Добро пожаловать!',
                    message: `Добро пожаловать, ${this.currentUser.firstName}! Рады видеть вас в агентстве "Гермес".`,
                    timestamp: new Date().toISOString(),
                    read: false,
                    actions: []
                },
                {
                    id: Date.now() + 1,
                    type: 'success',
                    title: 'Аккаунт создан',
                    message: 'Ваш аккаунт успешно создан. Теперь вы можете просматривать объекты и делать бронирования.',
                    timestamp: new Date().toISOString(),
                    read: false,
                    actions: [
                        { label: 'Перейти в каталог', url: 'catalog.html' }
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
                <div class="empty-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <p>Нет уведомлений</p>
                </div>
            `;
            return;
        }
        
        list.innerHTML = this.notifications.map(notif => this.createNotificationHTML(notif)).join('');
        
        // Добавляем обработчики для кнопок действий
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
        
        let actionsHTML = '';
        if (notif.actions && notif.actions.length > 0) {
            actionsHTML = `
                <div class="notification-actions">
                    ${notif.actions.map(action => `
                        <a href="${action.url || '#'}" class="btn-sm btn-primary">${action.label}</a>
                    `).join('')}
                </div>
            `;
        }
        
        return `
            <div class="notification-item ${notif.read ? 'read' : 'unread'}" data-id="${notif.id}">
                <div class="notification-icon ${notif.type}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notif.title}</div>
                    <div class="notification-message">${notif.message}</div>
                    <div class="notification-time">${timeAgo}</div>
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
            // Перерендерим список, если панель открыта
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

    // ========== МЕТОДЫ ДЛЯ ДОБАВЛЕНИЯ УВЕДОМЛЕНИЙ ==========

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
        
        // Если панель открыта, обновляем список
        if (this.isPanelOpen) {
            this.renderNotifications();
        }
        
        return notification;
    }

    // Специализированные методы для разных типов уведомлений

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
        toast.className = `toast-notification toast-${type}`;
        
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle',
            booking: 'fa-calendar-check',
            deal: 'fa-handshake'
        };
        const icon = iconMap[type] || 'fa-info-circle';
        
        toast.innerHTML = `
            <div class="toast-icon"><i class="fas ${icon}"></i></div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <div class="toast-close"><i class="fas fa-times"></i></div>
            <div class="toast-progress" style="--duration: ${duration}ms;"></div>
        `;
        
        // Закрытие по клику на крестик
        toast.querySelector('.toast-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeToast(toast);
        });
        
        // Закрытие по клику на уведомление
        toast.addEventListener('click', () => {
            // Открываем панель уведомлений
            this.openPanel();
            this.removeToast(toast);
        });
        
        this.toastContainer.appendChild(toast);
        
        // Анимация появления
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // Автоматическое удаление
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);
    }

    removeToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }

    // ========== ПРОВЕРКА НОВЫХ УВЕДОМЛЕНИЙ ==========

    checkNewNotifications() {
        // В реальном приложении здесь был бы запрос к серверу
        // Для демонстрации генерируем случайные уведомления
        if (Math.random() > 0.7) {
            const types = ['info', 'success', 'warning'];
            const type = types[Math.floor(Math.random() * types.length)];
            const messages = [
                ['Новый объект', 'Добавлена новая квартира в центре города'],
                ['Акция', 'Скидка 50% на услуги агента до конца месяца'],
                ['Обновление', 'В каталоге появились новые объекты']
            ];
            const msg = messages[Math.floor(Math.random() * messages.length)];
            this.addNotification(type, msg[0], msg[1]);
        }
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

    // Получить количество непрочитанных
    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    // Получить все уведомления
    getAll() {
        return this.notifications;
    }

    // Очистить все уведомления
    clearAll() {
        this.notifications = [];
        this.saveNotifications();
        this.updateBadge();
        if (this.isPanelOpen) {
            this.renderNotifications();
        }
    }

    // ========== ПРЕДУСТАНОВЛЕННЫЕ УВЕДОМЛЕНИЯ ДЛЯ РАЗНЫХ СОБЫТИЙ ==========

    // При бронировании объекта
    onBookingCreated(propertyTitle, bookingId) {
        return this.booking('Бронирование создано', 
            `Вы успешно забронировали объект "${propertyTitle}"`,
            [{ label: 'Посмотреть бронирование', url: `dashboard.html?tab=bookings` }]
        );
    }

    // При назначении показа
    onShowingScheduled(clientName, propertyTitle, date, time) {
        return this.booking('Назначен показ', 
            `Показ объекта "${propertyTitle}" для ${clientName} запланирован на ${date} в ${time}`,
            [{ label: 'Перейти в календарь', url: 'calendar.html' }]
        );
    }

    // При изменении статуса объекта
    onPropertyStatusChanged(propertyTitle, newStatus) {
        const statusText = { available: 'доступен', booked: 'забронирован', sold: 'продан' };
        return this.info('Статус объекта изменен', 
            `Объект "${propertyTitle}" теперь ${statusText[newStatus] || newStatus}`,
            [{ label: 'Посмотреть объект', url: `apartment-detail.html?id=${propertyId}` }]
        );
    }

    // При закрытии сделки
    onDealClosed(dealId, amount) {
        return this.deal('Сделка закрыта', 
            `Сделка №${dealId} успешно закрыта на сумму ${amount}`,
            [{ label: 'Подробнее', url: `deal-detail.html?id=${dealId}` }]
        );
    }

    // При добавлении клиента
    onClientAdded(clientName) {
        return this.success('Клиент добавлен', 
            `Клиент "${clientName}" успешно добавлен в базу`,
            [{ label: 'Перейти к клиенту', url: `clients.html` }]
        );
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========

// Создаем глобальный экземпляр
let notificationSystem = null;

document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, есть ли пользователь
    const user = JSON.parse(localStorage.getItem('currentUser') || 
        localStorage.getItem('hermes_session') || 
        sessionStorage.getItem('hermes_current_user') || 'null');
    
    // Инициализируем систему только для авторизованных пользователей
    if (user) {
        notificationSystem = new NotificationSystem();
        window.notify = notificationSystem;
        
        // Обновляем UI авторизации с меню пользователя
        updateAuthUIWithNotifications(user);
    }
});

function updateAuthUIWithNotifications(user) {
    const authSection = document.getElementById('authSection');
    if (!authSection) return;
    
    authSection.innerHTML = `
        <div class="user-menu" style="position: relative; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.9rem; color: var(--text-primary, #333); display: none;">${user.firstName}</span>
            <div class="user-avatar" style="width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; cursor: pointer; font-size: 0.9rem;">
                ${user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
            </div>
        </div>
    `;
}

// ========== ИНТЕГРАЦИЯ С СУЩЕСТВУЮЩИМИ МОДУЛЯМИ ==========

// Пример использования в других скриптах:
/*
// При бронировании объекта
if (window.notify) {
    window.notify.onBookingCreated('3-комнатная квартира в центре', 123);
}

// При назначении показа
if (window.notify) {
    window.notify.onShowingScheduled('Иван Петров', 'Квартира на Ленина', '15.05.2025', '14:00');
}

// При любом событии
if (window.notify) {
    window.notify.success('Успешно!', 'Операция выполнена');
}
*/