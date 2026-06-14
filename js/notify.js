// notify.js - Централизованная система сообщений пользователю

class NotifySystem {
    constructor() {
        this.container = null;
        this.defaultDuration = 3000;
        this.notificationsQueue = [];
        this.isProcessing = false;
        this.init();
    }

    init() {
        this.createContainer();
        this.injectStyles();
    }

    createContainer() {
        if (document.getElementById('hermes-notify-container')) return;
        
        const container = document.createElement('div');
        container.id = 'hermes-notify-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 12px;
            max-width: 380px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        this.container = container;
    }

    injectStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            .hermes-notify {
                pointer-events: auto;
                background: var(--bg-primary);
                border-radius: 12px;
                padding: 14px 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                transform: translateX(420px);
                transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                border-left: 4px solid;
                cursor: pointer;
                min-width: 280px;
            }
            .hermes-notify.show {
                transform: translateX(0);
            }
            .hermes-notify:hover {
                transform: translateX(-5px);
            }
            .hermes-notify-success { border-left-color: #27ae60; }
            .hermes-notify-error { border-left-color: #e74c3c; }
            .hermes-notify-warning { border-left-color: #f39c12; }
            .hermes-notify-info { border-left-color: #3498db; }
            .hermes-notify-booking { border-left-color: #9b59b6; }
            .hermes-notify-deal { border-left-color: #1abc9c; }
            
            .hermes-notify-icon { font-size: 20px; flex-shrink: 0; }
            .hermes-notify-content { flex: 1; }
            .hermes-notify-title { font-weight: 600; margin-bottom: 4px; font-size: 14px; }
            .hermes-notify-message { font-size: 13px; color: var(--text-secondary); line-height: 1.4; }
            .hermes-notify-close {
                flex-shrink: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                cursor: pointer;
                transition: background 0.2s;
                color: var(--text-tertiary);
            }
            .hermes-notify-close:hover {
                background: var(--bg-tertiary);
                color: var(--text-primary);
            }
            .hermes-notify-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: currentColor;
                width: 100%;
                border-radius: 0 0 12px 12px;
                animation: progressLine var(--duration) linear forwards;
            }
            @keyframes progressLine {
                from { width: 100%; opacity: 0.7; }
                to { width: 0%; opacity: 0; }
            }
        `;
        document.head.appendChild(styles);
    }

    // Основной метод показа уведомления
    show(message, type = 'info', options = {}) {
        const {
            title = null,
            duration = this.defaultDuration,
            actions = [],
            onClose = null,
            onClick = null,
            showProgress = true
        } = options;

        const notification = {
            id: Date.now() + Math.random(),
            message,
            type,
            title,
            duration,
            actions,
            onClose,
            onClick,
            showProgress
        };

        this.notificationsQueue.push(notification);
        this.processQueue();
        
        return notification.id;
    }

    processQueue() {
        if (this.isProcessing || this.notificationsQueue.length === 0) return;
        
        this.isProcessing = true;
        const notification = this.notificationsQueue.shift();
        this.renderNotification(notification);
        
        setTimeout(() => {
            this.isProcessing = false;
            this.processQueue();
        }, notification.duration + 300);
    }

    renderNotification(notification) {
        const { id, message, type, title, duration, actions, onClick, showProgress, onClose } = notification;
        
        const toast = document.createElement('div');
        toast.className = `hermes-notify hermes-notify-${type}`;
        toast.setAttribute('data-id', id);
        
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle',
            booking: 'fa-calendar-check',
            deal: 'fa-handshake'
        };
        
        const icon = iconMap[type] || iconMap.info;
        const iconColor = {
            success: '#27ae60', error: '#e74c3c', warning: '#f39c12',
            info: '#3498db', booking: '#9b59b6', deal: '#1abc9c'
        }[type];
        
        toast.innerHTML = `
            <div class="hermes-notify-icon" style="color: ${iconColor}">
                <i class="fas ${icon}"></i>
            </div>
            <div class="hermes-notify-content">
                ${title ? `<div class="hermes-notify-title">${title}</div>` : ''}
                <div class="hermes-notify-message">${message}</div>
                ${actions.length ? `<div style="display: flex; gap: 12px; margin-top: 8px;">${actions.map(a => `<button class="notify-action" data-action="${a.id}" style="background: none; border: none; color: ${iconColor}; cursor: pointer; font-size: 12px; font-weight: 500;">${a.label}</button>`).join('')}</div>` : ''}
            </div>
            <div class="hermes-notify-close">
                <i class="fas fa-times"></i>
            </div>
            ${showProgress ? `<div class="hermes-notify-progress" style="--duration: ${duration}ms; background: ${iconColor};"></div>` : ''}
        `;
        
        toast.addEventListener('click', (e) => {
            if (e.target.closest('.hermes-notify-close')) {
                this.removeToast(toast);
                if (onClose) onClose();
                return;
            }
            if (e.target.closest('.notify-action')) {
                const actionId = e.target.closest('.notify-action').dataset.action;
                const action = actions.find(a => a.id === actionId);
                if (action && action.handler) action.handler();
                this.removeToast(toast);
                return;
            }
            if (onClick) onClick();
            this.removeToast(toast);
        });
        
        this.container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        
        if (duration > 0) {
            setTimeout(() => this.removeToast(toast), duration);
        }
    }

    removeToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }

    // ========== СПЕЦИАЛИЗИРОВАННЫЕ МЕТОДЫ ==========

    // Успешные операции
    success(message, title = 'Успешно') {
        return this.show(message, 'success', { title });
    }

    // Ошибки
    error(message, title = 'Ошибка') {
        return this.show(message, 'error', { title, duration: 5000 });
    }

    // Предупреждения
    warning(message, title = 'Внимание') {
        return this.show(message, 'warning', { title });
    }

    // Информация
    info(message, title = 'Информация') {
        return this.show(message, 'info', { title });
    }

    // Уведомления о бронированиях
    booking(message, title = 'Бронирование') {
        return this.show(message, 'booking', { title });
    }

    // Уведомления о сделках
    deal(message, title = 'Сделка') {
        return this.show(message, 'deal', { title });
    }

    // ========== КОНКРЕТНЫЕ СООБЩЕНИЯ ДЛЯ СИСТЕМЫ ==========

    // Объекты
    objectAdded(name) {
        return this.success(`Объект "${name}" успешно добавлен`, 'Объект создан');
    }
    
    objectUpdated(name) {
        return this.success(`Объект "${name}" обновлен`, 'Изменения сохранены');
    }
    
    objectDeleted(name) {
        return this.warning(`Объект "${name}" удален`, 'Объект удален');
    }
    
    objectArchived(name) {
        return this.info(`Объект "${name}" отправлен в архив`, 'Объект архивирован');
    }
    
    objectCannotDelete(name) {
        return this.error(`Вы не можете удалить объект "${name}" со статусом "Продан" без предварительной архивации`, 'Действие запрещено');
    }
    
    objectStatusChanged(name, newStatus) {
        const statusText = { available: 'В продаже', rent: 'В аренде', booked: 'Забронирован', sold: 'Продан' };
        return this.success(`Статус объекта "${name}" изменен на "${statusText[newStatus]}"`, 'Статус обновлен');
    }
    
    objectPriceChanged(name, oldPrice, newPrice) {
        return this.info(`Цена объекта "${name}" изменена: ${this.formatPrice(oldPrice)} → ${this.formatPrice(newPrice)}`, 'Изменение цены');
    }

    // Клиенты
    clientAdded(name) {
        return this.success(`Клиент "${name}" успешно добавлен`, 'Клиент создан');
    }
    
    clientUpdated(name) {
        return this.success(`Данные клиента "${name}" обновлены`, 'Клиент обновлен');
    }
    
    clientDeleted(name) {
        return this.warning(`Клиент "${name}" удален`, 'Клиент удален');
    }
    
    clientAttachedToDeal(clientName, dealId) {
        return this.success(`Клиент "${clientName}" прикреплен к сделке №${dealId}`, 'Клиент привязан');
    }
    
    clientInterestedProperty(clientName, propertyName) {
        return this.info(`Клиент "${clientName}" добавил объект "${propertyName}" в список интересующих`, 'Добавлен интерес');
    }

    // Сделки
    dealCreated(dealId) {
        return this.success(`Сделка №${dealId} успешно создана`, 'Сделка открыта');
    }
    
    dealUpdated(dealId) {
        return this.success(`Данные сделки №${dealId} обновлены`, 'Сделка обновлена');
    }
    
    dealClosed(dealId, commission) {
        return this.success(`Сделка №${dealId} закрыта. Комиссия ${commission} начислена`, 'Сделка завершена');
    }
    
    dealStageChanged(dealId, oldStage, newStage) {
        const stages = { prelim: 'Предварительный', contract: 'Договор', payment: 'Оплата', registration: 'Регистрация', completed: 'Завершена' };
        return this.info(`Сделка №${dealId} переведена на этап "${stages[newStage]}"`, 'Статус обновлен');
    }
    
    dealCommissionCalculated(dealId, amount) {
        return this.info(`Комиссия по сделке №${dealId} составляет ${amount}`, 'Расчет комиссии');
    }

    // Показы
    showingScheduled(clientName, propertyName, date, time) {
        return this.success(`Назначен показ для "${clientName}" объекта "${propertyName}" на ${date} в ${time}`, 'Показ запланирован');
    }
    
    showingUpdated(clientName, propertyName, date, time) {
        return this.info(`Показ для "${clientName}" объекта "${propertyName}" перенесен на ${date} в ${time}`, 'Показ изменен');
    }
    
    showingCancelled(clientName, propertyName) {
        return this.warning(`Показ для "${clientName}" объекта "${propertyName}" отменен`, 'Показ отменен');
    }
    
    showingCompleted(clientName, propertyName) {
        return this.success(`Показ для "${clientName}" объекта "${propertyName}" завершен`, 'Показ проведен');
    }
    
    showingConflict() {
        return this.error('Выбранное время уже занято другим показом', 'Конфликт расписания');
    }

    // Напоминания
    showingReminder(clientName, propertyName, minutesBefore) {
        const timeText = minutesBefore === 0 ? 'сейчас' : `через ${minutesBefore} минут`;
        return this.show(`Показ "${propertyName}" для ${clientName} начинается ${timeText}`, 'reminder', {
            title: 'Напоминание о показе',
            duration: 10000,
            actions: [
                { id: 'view', label: 'Подробнее', handler: () => window.location.href = 'calendar.html' },
                { id: 'snooze', label: 'Напомнить позже', handler: () => setTimeout(() => this.showingReminder(clientName, propertyName, 10), 600000) }
            ]
        });
    }

    // Документы
    documentUploaded(name) {
        return this.success(`Документ "${name}" успешно загружен`, 'Файл добавлен');
    }
    
    documentDeleted(name) {
        return this.info(`Документ "${name}" удален`, 'Файл удален');
    }
    
    contractGenerated(dealId) {
        return this.success(`Договор по сделке №${dealId} сформирован`, 'Документ готов');
    }
    
    actGenerated(dealId) {
        return this.success(`Акт приема-передачи по сделке №${dealId} сформирован`, 'Документ готов');
    }

    // Валидация форм
    validationError(fieldName) {
        return this.error(`Заполните обязательное поле "${fieldName}"`, 'Ошибка валидации');
    }
    
    validationErrors(errors) {
        const errorText = errors.map(e => `• ${e}`).join('<br>');
        return this.show(errorText, 'error', { title: 'Пожалуйста, исправьте ошибки', duration: 5000 });
    }

    // Авторизация
    loginSuccess(userName) {
        return this.success(`Добро пожаловать, ${userName}!`, 'Вход выполнен');
    }
    
    loginError() {
        return this.error('Неверный email или пароль', 'Ошибка входа');
    }
    
    registerSuccess() {
        return this.success('Регистрация прошла успешно! Теперь вы можете войти.', 'Добро пожаловать!');
    }
    
    logoutSuccess() {
        return this.info('Вы вышли из системы', 'До свидания!');
    }
    
    accessDenied() {
        return this.error('У вас нет прав для выполнения этого действия', 'Доступ запрещен');
    }

    // Системные сообщения
    dataSaved() {
        return this.success('Данные сохранены', 'Готово');
    }
    
    dataLoaded() {
        return this.info('Данные загружены', 'Готово');
    }
    
    connectionRestored() {
        return this.success('Соединение восстановлено', 'Система');
    }
    
    connectionLost() {
        return this.error('Потеряно соединение с сервером. Проверьте интернет.', 'Нет соединения');
    }
    
    searchNoResults() {
        return this.warning('По вашему запросу ничего не найдено', 'Результаты поиска');
    }

    // Пользователи (админ)
    userAdded(name) {
        return this.success(`Пользователь "${name}" добавлен`, 'Пользователь создан');
    }
    
    userUpdated(name) {
        return this.success(`Данные пользователя "${name}" обновлены`, 'Пользователь обновлен');
    }
    
    userDeleted(name) {
        return this.warning(`Пользователь "${name}" удален`, 'Пользователь удален');
    }
    
    userBlocked(name) {
        return this.warning(`Пользователь "${name}" заблокирован`, 'Доступ ограничен');
    }
    
    userUnblocked(name) {
        return this.success(`Пользователь "${name}" разблокирован`, 'Доступ восстановлен');
    }
    
    roleChanged(name, newRole) {
        const roles = { admin: 'Администратора', agent: 'Агента', user: 'Пользователя' };
        return this.info(`Пользователь "${name}" назначен ${roles[newRole]}`, 'Роль изменена');
    }

    // Вспомогательные методы
    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    }
}

// Глобальный экземпляр
window.notify = new NotifySystem();

// Функции для быстрого доступа из консоли и других скриптов
window.showSuccess = (msg) => notify.success(msg);
window.showError = (msg) => notify.error(msg);
window.showWarning = (msg) => notify.warning(msg);
window.showInfo = (msg) => notify.info(msg);