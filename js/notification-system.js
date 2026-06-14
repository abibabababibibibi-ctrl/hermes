// notification-system.js - Централизованная система уведомлений

class NotificationSystem {
    constructor() {
        this.toastContainer = null;
        this.notificationsHistory = [];
        this.unreadCount = 0;
        this.init();
    }

    init() {
        this.createToastContainer();
        this.loadHistory();
        this.setupEventListeners();
    }

    createToastContainer() {
        if (document.getElementById('toast-container')) return;
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 12px;
            max-width: 380px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        this.toastContainer = container;
    }

    // Основной метод показа уведомления
    show(message, type = 'info', options = {}) {
        const {
            title = null,
            duration = 5000,
            actions = [],
            onClose = null,
            persistent = false,
            sound = false
        } = options;

        // Сохраняем в историю
        const notification = {
            id: Date.now() + Math.random(),
            message,
            type,
            title,
            timestamp: new Date().toISOString(),
            read: false
        };
        this.notificationsHistory.unshift(notification);
        this.saveHistory();
        this.updateBadge();

        // Воспроизводим звук если нужно
        if (sound) this.playSound(type);

        // Создаем toast
        const toast = this.createToast(message, type, title, duration, actions, persistent, notification.id);
        this.toastContainer.appendChild(toast);

        // Анимация появления
        setTimeout(() => toast.classList.add('show'), 10);

        // Автоматическое удаление
        if (!persistent && duration > 0) {
            setTimeout(() => this.closeToast(toast, onClose), duration);
        }

        return notification.id;
    }

    createToast(message, type, title, duration, actions, persistent, id) {
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.dataset.id = id;
        toast.style.cssText = `
            background: var(--bg-primary);
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            padding: 16px;
            display: flex;
            gap: 12px;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            border-left: 4px solid ${this.getTypeColor(type)};
            pointer-events: auto;
            cursor: pointer;
        `;

        const icon = this.getTypeIcon(type);
        const color = this.getTypeColor(type);

        toast.innerHTML = `
            <div style="flex-shrink: 0;">
                <i class="${icon}" style="color: ${color}; font-size: 20px;"></i>
            </div>
            <div style="flex: 1;">
                ${title ? `<div style="font-weight: 600; margin-bottom: 4px;">${title}</div>` : ''}
                <div style="color: var(--text-secondary); font-size: 14px; line-height: 1.4;">${message}</div>
                ${actions.length > 0 ? `<div style="display: flex; gap: 8px; margin-top: 12px;">${actions.map(a => `<button class="toast-action" data-action="${a.id}" style="background: none; border: none; color: ${color}; cursor: pointer; font-size: 13px; font-weight: 500;">${a.label}</button>`).join('')}</div>` : ''}
                ${persistent ? `<div style="margin-top: 8px; font-size: 11px; color: var(--text-tertiary);">⚠️ Важное уведомление</div>` : ''}
            </div>
            <div style="flex-shrink: 0; cursor: pointer;" class="toast-close">
                <i class="fas fa-times" style="color: var(--text-tertiary); font-size: 12px;"></i>
            </div>
        `;

        // Обработчик закрытия
        toast.querySelector('.toast-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeToast(toast);
        });

        // Обработчик клика по уведомлению
        toast.addEventListener('click', (e) => {
            if (e.target.classList.contains('toast-close') || e.target.classList.contains('toast-action')) return;
            this.markAsRead(id);
            if (options.onClick) options.onClick();
        });

        // Обработчики действий
        actions.forEach(action => {
            const btn = toast.querySelector(`[data-action="${action.id}"]`);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    action.handler();
                    this.closeToast(toast);
                });
            }
        });

        return toast;
    }

    closeToast(toast, onClose) {
        toast.classList.remove('show');
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
            if (onClose) onClose();
        }, 300);
    }

    getTypeIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle',
            booking: 'fas fa-calendar-check',
            deal: 'fas fa-handshake',
            reminder: 'fas fa-bell'
        };
        return icons[type] || icons.info;
    }

    getTypeColor(type) {
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db',
            booking: '#9b59b6',
            deal: '#1abc9c',
            reminder: '#e67e22'
        };
        return colors[type] || colors.info;
    }

    playSound(type) {
        // Создаем звук для важных уведомлений
        if (type === 'error' || type === 'warning') {
            const audio = new Audio('data:audio/wav;base64,U3RlYWx0aCBzb3VuZA==');
            audio.volume = 0.3;
            audio.play().catch(() => {});
        }
    }

    // Специализированные методы для разных типов сообщений
    success(message, options = {}) {
        return this.show(message, 'success', { ...options, sound: true });
    }

    error(message, options = {}) {
        return this.show(message, 'error', { ...options, sound: true, persistent: true });
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', { ...options, sound: true });
    }

    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    // Сообщения для объектов
    objectAdded(objectName) {
        return this.success(`🏠 Объект "${objectName}" успешно добавлен`, {
            title: 'Объект создан',
            actions: [{ id: 'view', label: 'Посмотреть', handler: () => window.location.href = `apartment-detail.html?id=${this.lastObjectId}` }]
        });
    }

    objectUpdated(objectName) {
        return this.success(`✏️ Объект "${objectName}" обновлен`, { title: 'Изменения сохранены' });
    }

    objectDeleted(objectName) {
        return this.warning(`🗑️ Объект "${objectName}" удален`, { title: 'Объект удален' });
    }

    objectArchived(objectName) {
        return this.info(`📦 Объект "${objectName}" отправлен в архив`, { title: 'Объект архивирован' });
    }

    objectCannotDelete(objectName) {
        return this.error(`❌ Вы не можете удалить объект "${objectName}" со статусом "Продан" без предварительной архивации`, {
            title: 'Действие запрещено',
            persistent: true,
            actions: [{ id: 'archive', label: 'Архивировать', handler: () => window.location.href = `objects.html?action=archive&id=${this.lastObjectId}` }]
        });
    }

    // Сообщения для клиентов
    clientAdded(clientName) {
        return this.success(`👤 Клиент "${clientName}" успешно добавлен`, { title: 'Клиент создан' });
    }

    clientAttachedToDeal(clientName, dealId) {
        return this.success(`🔗 Клиент "${clientName}" прикреплен к сделке №${dealId}`, {
            title: 'Клиент привязан',
            actions: [{ id: 'view', label: 'Перейти к сделке', handler: () => window.location.href = `deal-detail.html?id=${dealId}` }]
        });
    }

    // Сообщения для сделок
    dealClosed(dealId, commission) {
        return this.success(`✅ Сделка №${dealId} закрыта. Комиссия ${commission} начислена`, {
            title: 'Сделка завершена',
            actions: [{ id: 'view', label: 'Посмотреть', handler: () => window.location.href = `deal-detail.html?id=${dealId}` }]
        });
    }

    dealStageChanged(dealId, oldStage, newStage) {
        const stageNames = { prelim: 'Предварительный', contract: 'Договор', payment: 'Оплата', registration: 'Регистрация', completed: 'Завершена' };
        return this.info(`📋 Сделка №${dealId} переведена на этап "${stageNames[newStage]}"`, { title: 'Статус обновлен' });
    }

    // Сообщения для показов
    showingScheduled(clientName, propertyName, date, time) {
        return this.success(`📅 Назначен показ для "${clientName}" объекта "${propertyName}" на ${date} в ${time}`, {
            title: 'Показ запланирован',
            actions: [{ id: 'calendar', label: 'Открыть календарь', handler: () => window.location.href = 'calendar.html' }]
        });
    }

    showingReminder(clientName, propertyName, minutesBefore) {
        const minutesText = minutesBefore === 0 ? 'сейчас' : `через ${minutesBefore} мин`;
        return this.show(`🔔 Показ "${propertyName}" для ${clientName} ${minutesText}`, 'reminder', {
            title: 'Напоминание о показе',
            persistent: true,
            duration: 30000,
            sound: true,
            actions: [
                { id: 'view', label: 'Подробнее', handler: () => window.location.href = 'calendar.html' },
                { id: 'snooze', label: 'Напомнить позже', handler: () => this.showingReminder(clientName, propertyName, 10) }
            ]
        });
    }

    showingCancelled(clientName, propertyName) {
        return this.warning(`🚫 Показ для "${clientName}" объекта "${propertyName}" отменен`, { title: 'Показ отменен' });
    }

    showingCompleted(clientName, propertyName) {
        return this.success(`✅ Показ для "${clientName}" объекта "${propertyName}" завершен`, { title: 'Показ проведен' });
    }

    // Сообщения для валидации форм
    validationError(fieldName) {
        return this.error(`⚠️ Заполните обязательное поле "${fieldName}"`, {
            title: 'Ошибка валидации',
            persistent: true,
            duration: 4000
        });
    }

    validationErrors(errors) {
        const errorList = errors.map(e => `• ${e}`).join('\n');
        return this.error(`Пожалуйста, исправьте следующие ошибки:\n${errorList}`, {
            title: 'Ошибка валидации',
            persistent: true,
            duration: 5000
        });
    }

    // Сообщения для авторизации
    loginSuccess(userName) {
        return this.success(`🎉 Добро пожаловать, ${userName}!`, { title: 'Вход выполнен' });
    }

    loginError() {
        return this.error('❌ Неверный email или пароль', { title: 'Ошибка входа' });
    }

    registerSuccess() {
        return this.success('✅ Регистрация прошла успешно! Теперь вы можете войти.', { title: 'Добро пожаловать!' });
    }

    logoutSuccess() {
        return this.info('👋 Вы вышли из системы', { title: 'До свидания!' });
    }

    // Сообщения для документов
    documentUploaded(docName) {
        return this.success(`📄 Документ "${docName}" успешно загружен`, { title: 'Файл добавлен' });
    }

    documentDeleted(docName) {
        return this.info(`🗑️ Документ "${docName}" удален`, { title: 'Файл удален' });
    }

    contractGenerated(dealId) {
        return this.success(`📑 Договор по сделке №${dealId} сформирован и готов к скачиванию`, {
            title: 'Документ готов',
            actions: [{ id: 'download', label: 'Скачать', handler: () => this.downloadContract(dealId) }]
        });
    }

    // Сообщения для уведомлений
    notificationsCleared() {
        return this.info('🧹 Все уведомления очищены', { title: 'Уведомления' });
    }

    // Системные сообщения
    connectionRestored() {
        return this.success('🔌 Соединение восстановлено', { title: 'Система' });
    }

    connectionLost() {
        return this.error('⚠️ Потеряно соединение с сервером. Проверьте интернет.', {
            title: 'Нет соединения',
            persistent: true
        });
    }

    dataSaved() {
        return this.success('💾 Данные сохранены', { title: 'Готово', duration: 2000 });
    }

    // История уведомлений
    saveHistory() {
        localStorage.setItem('notification_history', JSON.stringify(this.notificationsHistory.slice(0, 100)));
        localStorage.setItem('unread_notifications', this.notificationsHistory.filter(n => !n.read).length);
    }

    loadHistory() {
        const saved = localStorage.getItem('notification_history');
        if (saved) {
            this.notificationsHistory = JSON.parse(saved);
            this.unreadCount = this.notificationsHistory.filter(n => !n.read).length;
        }
    }

    markAsRead(id) {
        const notification = this.notificationsHistory.find(n => n.id === id);
        if (notification && !notification.read) {
            notification.read = true;
            this.unreadCount--;
            this.saveHistory();
            this.updateBadge();
        }
    }

    markAllAsRead() {
        this.notificationsHistory.forEach(n => n.read = true);
        this.unreadCount = 0;
        this.saveHistory();
        this.updateBadge();
        this.notificationsCleared();
    }

    updateBadge() {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    getHistory() {
        return this.notificationsHistory;
    }

    getUnreadCount() {
        return this.unreadCount;
    }

    setupEventListeners() {
        // Слушаем события онлайн/офлайн
        window.addEventListener('online', () => this.connectionRestored());
        window.addEventListener('offline', () => this.connectionLost());
    }

    downloadContract(dealId) {
        console.log(`Скачивание договора по сделке ${dealId}`);
        this.info('Договор скачивается...', { duration: 2000 });
    }
}

// Глобальный экземпляр
window.notify = new NotificationSystem();

// Примеры использования в консоли:
// notify.success('Операция выполнена успешно');
// notify.error('Произошла ошибка');
// notify.warning('Внимание!');
// notify.info('Информационное сообщение');
// notify.objectAdded('Квартира на Ленина');
// notify.showingScheduled('Иванов Иван', '3-комн. квартира', '15.05.2026', '14:00');
// notify.dealClosed(123, '50 000 ₽');

// Пример интеграции в object-manager.js
class ObjectManager {
    // ... существующий код ...
    
    saveObject() {
        // ... валидация ...
        
        if (id) {
            // ... сохранение ...
            notify.objectUpdated(objData.title);
        } else {
            // ... сохранение ...
            notify.objectAdded(objData.title);
        }
    }
    
    deleteObject(id) {
        if (confirm('Удалить объект?')) {
            const obj = this.objects.find(o => o.id === id);
            if (obj.status === 'sold') {
                notify.objectCannotDelete(obj.title);
                return;
            }
            // ... удаление ...
            notify.objectDeleted(obj.title);
        }
    }
    
    archiveObject(id) {
        // ... архивация ...
        notify.objectArchived(obj.title);
    }
}

// Пример интеграции в client-manager.js
class ClientManager {
    attachToDeal(clientId, dealId) {
        // ... привязка ...
        notify.clientAttachedToDeal(clientName, dealId);
    }
}

// Пример интеграции в deal-manager.js
class DealManager {
    saveDeal() {
        // ... сохранение ...
        if (stage === 'completed') {
            notify.dealClosed(dealData.id, this.formatPrice(dealData.commissionAmount));
        }
    }
    
    updateStage(dealId, newStage) {
        // ... обновление ...
        notify.dealStageChanged(dealId, oldStage, newStage);
    }
}

// Пример интеграции в calendar.js
class CalendarManager {
    saveEvent() {
        // ... сохранение ...
        notify.showingScheduled(clientName, propertyTitle, date, time);
    }
    
    cancelEvent(eventId) {
        // ... отмена ...
        notify.showingCancelled(clientName, propertyTitle);
    }
}