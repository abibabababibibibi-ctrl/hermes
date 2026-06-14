// Quick Order System - позволяет покупать без регистрации
(function() {
    'use strict';

    console.log('Quick Order System loading...');

    // Конфигурация
    const config = {
        storageKey: 'hermes_quick_orders',
        nextOrderId: 1
    };

    // Инициализация системы
    function init() {
        // Восстанавливаем следующий ID заказа
        const orders = getAllOrders();
        if (orders.length > 0) {
            const maxId = Math.max(...orders.map(order => order.id));
            config.nextOrderId = maxId + 1;
        }

        console.log('Quick Order System initialized');
        console.log('Orders in system:', orders.length);
    }

    // Получить все заказы
    function getAllOrders() {
        try {
            return JSON.parse(localStorage.getItem(config.storageKey)) || [];
        } catch (e) {
            console.error('Error reading orders:', e);
            return [];
        }
    }

    // Создать быстрый заказ без регистрации
    function createQuickOrder(orderData) {
        try {
            const orders = getAllOrders();

            const order = {
                id: config.nextOrderId++,
                ...orderData,
                status: 'new',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isGuest: true,
                sessionId: generateSessionId()
            };

            orders.push(order);
            localStorage.setItem(config.storageKey, JSON.stringify(orders));

            console.log('Quick order created:', order.id);

            // Сохраняем сессию для этого пользователя
            saveGuestSession(order.sessionId, order);

            return {
                success: true,
                order: order,
                message: 'Заказ успешно создан! Номер заказа: #' + order.id
            };
        } catch (e) {
            console.error('Error creating order:', e);
            return {
                success: false,
                message: 'Ошибка при создании заказа'
            };
        }
    }

    // Покупка без регистрации
    function buyWithoutRegistration(propertyId, propertyData) {
        // Получаем данные объекта
        const property = propertyData || getPropertyById(propertyId);

        if (!property) {
            alert('Объект не найден');
            return;
        }

        // Показываем форму быстрого заказа
        showQuickOrderModal(property);
    }

    // Показать модальное окно быстрого заказа
    function showQuickOrderModal(property) {
        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.className = 'quick-order-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="closeQuickOrderModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-shopping-cart"></i> Быстрый заказ</h3>
                    <button class="modal-close" onclick="closeQuickOrderModal()">&times;</button>
                </div>

                <div class="modal-body">
                    <div class="order-summary">
                        <h4>Вы покупаете:</h4>
                        <div class="property-info-summary">
                            <div class="property-image-sm">
                                <img src="${property.image}" alt="${property.title}">
                            </div>
                            <div class="property-details-sm">
                                <h5>${property.title}</h5>
                                <p class="property-price">${formatPrice(property.price)}</p>
                                <p class="property-location">${property.location}</p>
                            </div>
                        </div>
                    </div>

                    <form id="quickOrderForm" class="quick-order-form">
                        <div class="form-group">
                            <label>Ваше имя *</label>
                            <input type="text" id="guestName" required placeholder="Иван Иванов">
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Телефон *</label>
                                <input type="tel" id="guestPhone" required placeholder="+7 (999) 999-99-99">
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" id="guestEmail" placeholder="example@mail.ru">
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Способ связи</label>
                            <div class="contact-preferences">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="contactMethod" value="phone" checked>
                                    <span class="checkmark"></span>
                                    Телефон
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="contactMethod" value="whatsapp">
                                    <span class="checkmark"></span>
                                    WhatsApp
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="contactMethod" value="telegram">
                                    <span class="checkmark"></span>
                                    Telegram
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="contactMethod" value="email">
                                    <span class="checkmark"></span>
                                    Email
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Комментарий к заказу</label>
                            <textarea id="orderComment" placeholder="Дополнительные пожелания, вопросы..."></textarea>
                        </div>

                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="agreeTerms" required>
                                <span class="checkmark"></span>
                                Я согласен с <a href="terms.html" target="_blank">условиями покупки</a> *
                            </label>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn btn-success">
                                <i class="fas fa-check"></i> Подтвердить заказ
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="closeQuickOrderModal()">
                                Отмена
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Добавляем обработчик формы
        document.getElementById('quickOrderForm').addEventListener('submit', function(e) {
            e.preventDefault();
            submitQuickOrder(property);
        });

        // Блокируем прокрутку страницы
        document.body.style.overflow = 'hidden';
    }

    // Закрыть модальное окно
    function closeQuickOrderModal() {
        const modal = document.querySelector('.quick-order-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    // Отправить быстрый заказ
    function submitQuickOrder(property) {
        const form = document.getElementById('quickOrderForm');

        // Собираем данные
        const orderData = {
            propertyId: property.id,
            propertyTitle: property.title,
            propertyPrice: property.price,
            propertyType: property.type,
            guestName: document.getElementById('guestName').value.trim(),
            guestPhone: document.getElementById('guestPhone').value.trim(),
            guestEmail: document.getElementById('guestEmail').value.trim() || null,
            contactMethods: Array.from(document.querySelectorAll('input[name="contactMethod"]:checked'))
                .map(cb => cb.value),
            comment: document.getElementById('orderComment').value.trim() || null,
            source: window.location.href
        };

        // Валидация
        if (!orderData.guestName || !orderData.guestPhone) {
            alert('Пожалуйста, заполните обязательные поля');
            return;
        }

        if (!document.getElementById('agreeTerms').checked) {
            alert('Необходимо согласиться с условиями покупки');
            return;
        }

        // Создаем заказ
        const result = createQuickOrder(orderData);

        if (result.success) {
            // Закрываем модальное окно
            closeQuickOrderModal();

            // Показываем подтверждение
            showOrderConfirmation(result.order);

            // Отправляем уведомление (в реальном приложении - на сервер)
            sendOrderNotification(result.order);
        } else {
            alert(result.message);
        }
    }

    // Показать подтверждение заказа
    function showOrderConfirmation(order) {
        const confirmation = document.createElement('div');
        confirmation.className = 'order-confirmation';
        confirmation.innerHTML = `
            <div class="confirmation-overlay" onclick="closeConfirmation()"></div>
            <div class="confirmation-content">
                <div class="confirmation-header">
                    <div class="confirmation-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3>Заказ оформлен!</h3>
                </div>

                <div class="confirmation-body">
                    <div class="order-details">
                        <p><strong>Номер заказа:</strong> #${order.id}</p>
                        <p><strong>Объект:</strong> ${order.propertyTitle}</p>
                        <p><strong>Цена:</strong> ${formatPrice(order.propertyPrice)}</p>
                        <p><strong>Ваше имя:</strong> ${order.guestName}</p>
                        <p><strong>Телефон:</strong> ${order.guestPhone}</p>
                    </div>

                    <div class="confirmation-message">
                        <p>✅ Спасибо за заказ! Наш менеджер свяжется с вами в течение 15 минут.</p>
                        <p>📞 Вы также можете позвонить нам: <strong>+7 (495) 123-45-67</strong></p>
                    </div>

                    <div class="order-actions">
                        <button class="btn btn-primary" onclick="printOrder(${order.id})">
                            <i class="fas fa-print"></i> Распечатать заказ
                        </button>
                        <button class="btn btn-secondary" onclick="saveOrderToPhone(${order.id})">
                            <i class="fas fa-save"></i> Сохранить в телефон
                        </button>
                        <button class="btn btn-success" onclick="closeConfirmation(); window.location.href='index.html'">
                            <i class="fas fa-home"></i> На главную
                        </button>
                    </div>

                    <div class="order-tips">
                        <h4>Что дальше?</h4>
                        <ul>
                            <li>Ожидайте звонка нашего менеджера</li>
                            <li>Подготовьте документы для сделки</li>
                            <li>Запишите номер вашего заказа: <strong>#${order.id}</strong></li>
                            <li>Сохраните эту страницу для связи с нами</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(confirmation);
        document.body.style.overflow = 'hidden';

        // Сохраняем заказ в sessionStorage для быстрого доступа
        sessionStorage.setItem('last_order_id', order.id);
    }

    // Закрыть подтверждение
    function closeConfirmation() {
        const confirmation = document.querySelector('.order-confirmation');
        if (confirmation) {
            confirmation.remove();
            document.body.style.overflow = '';
        }
    }

    // Распечатать заказ
    function printOrder(orderId) {
        const orders = getAllOrders();
        const order = orders.find(o => o.id === orderId);

        if (!order) {
            alert('Заказ не найден');
            return;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Заказ #${order.id} - Гермес</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .order-info { margin-bottom: 20px; }
                    .section { margin-bottom: 15px; }
                    .label { font-weight: bold; }
                    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Агентство недвижимости "Гермес"</h1>
                    <h2>Заказ на покупку недвижимости</h2>
                </div>

                <div class="order-info">
                    <div class="section">
                        <span class="label">Номер заказа:</span> #${order.id}
                    </div>
                    <div class="section">
                        <span class="label">Дата заказа:</span> ${new Date(order.createdAt).toLocaleString('ru-RU')}
                    </div>
                </div>

                <div class="section">
                    <h3>Информация об объекте</h3>
                    <p><span class="label">Объект:</span> ${order.propertyTitle}</p>
                    <p><span class="label">Цена:</span> ${formatPrice(order.propertyPrice)}</p>
                    <p><span class="label">Тип:</span> ${order.propertyType === 'apartment' ? 'Квартира' : 'Дом'}</p>
                </div>

                <div class="section">
                    <h3>Данные покупателя</h3>
                    <p><span class="label">Имя:</span> ${order.guestName}</p>
                    <p><span class="label">Телефон:</span> ${order.guestPhone}</p>
                    ${order.guestEmail ? `<p><span class="label">Email:</span> ${order.guestEmail}</p>` : ''}
                    <p><span class="label">Предпочтительный способ связи:</span> ${order.contactMethods.join(', ')}</p>
                </div>

                ${order.comment ? `
                <div class="section">
                    <h3>Комментарий</h3>
                    <p>${order.comment}</p>
                </div>
                ` : ''}

                <div class="footer">
                    <p>Агентство недвижимости "Гермес"</p>
                    <p>Телефон: +7 (495) 123-45-67</p>
                    <p>Email: info@hermes-realty.ru</p>
                    <p>Распечатано: ${new Date().toLocaleString('ru-RU')}</p>
                    <button class="no-print" onclick="window.print()">Печать</button>
                    <button class="no-print" onclick="window.close()">Закрыть</button>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    // Сохранить заказ в телефон (скачать как файл)
    function saveOrderToPhone(orderId) {
        const orders = getAllOrders();
        const order = orders.find(o => o.id === orderId);

        if (!order) {
            alert('Заказ не найден');
            return;
        }

        const content = `
ЗАКАЗ НА ПОКУПКУ НЕДВИЖИМОСТИ
Агентство недвижимости "Гермес"

Номер заказа: #${order.id}
Дата заказа: ${new Date(order.createdAt).toLocaleString('ru-RU')}

ИНФОРМАЦИЯ ОБ ОБЪЕКТЕ:
Объект: ${order.propertyTitle}
Цена: ${formatPrice(order.propertyPrice)}
Тип: ${order.propertyType === 'apartment' ? 'Квартира' : 'Дом'}

ДАННЫЕ ПОКУПАТЕЛЯ:
Имя: ${order.guestName}
Телефон: ${order.guestPhone}
Email: ${order.guestEmail || 'не указан'}
Способы связи: ${order.contactMethods.join(', ')}

КОММЕНТАРИЙ:
${order.comment || 'нет'}

КОНТАКТЫ АГЕНТСТВА:
Телефон: +7 (495) 123-45-67
Email: info@hermes-realty.ru
Сайт: ${window.location.origin}

Сохраните этот номер заказа для связи: #${order.id}
        `.trim();

        // Создаем и скачиваем файл
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = `заказ-${order.id}-гермес.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('Заказ сохранен в файл!');
    }

    // Отправить уведомление (симуляция)
    function sendOrderNotification(order) {
        console.log('Order notification sent:', order);

        // В реальном приложении здесь будет отправка на сервер
        // Например: fetch('/api/orders', { method: 'POST', body: JSON.stringify(order) })

        // Сохраняем уведомление в localStorage для админки
        const notifications = JSON.parse(localStorage.getItem('hermes_notifications') || '[]');
        notifications.push({
            id: Date.now(),
            type: 'new_order',
            title: `Новый заказ #${order.id}`,
            message: `Быстрый заказ от ${order.guestName} на объект: ${order.propertyTitle}`,
            data: order,
            read: false,
            createdAt: new Date().toISOString()
        });

        localStorage.setItem('hermes_notifications', JSON.stringify(notifications));
    }

    // Вспомогательные функции
    function getPropertyById(id) {
        // В реальном приложении получаем из базы данных
        const properties = JSON.parse(localStorage.getItem('hermes_properties') || '[]');
        return properties.find(p => p.id === id);
    }

    function generateSessionId() {
        return 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function saveGuestSession(sessionId, data) {
        const sessions = JSON.parse(localStorage.getItem('hermes_guest_sessions') || '{}');
        sessions[sessionId] = {
            ...data,
            lastActivity: new Date().toISOString()
        };
        localStorage.setItem('hermes_guest_sessions', JSON.stringify(sessions));
    }

    function formatPrice(price) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(price);
    }

    // Инициализация
    document.addEventListener('DOMContentLoaded', init);

    // Экспортируем функции в глобальную область видимости
    window.quickOrder = {
        buyWithoutRegistration: buyWithoutRegistration,
        openQuickOrderForm: function(propertyId) {
            const property = getPropertyById(propertyId);
            if (property) showQuickOrderModal(property);
        },
        printOrder: printOrder,
        saveOrderToPhone: saveOrderToPhone,
        closeQuickOrderModal: closeQuickOrderModal,
        closeConfirmation: closeConfirmation
    };

    // Создаем глобальные функции для вызова из HTML
    window.buyWithoutRegistration = buyWithoutRegistration;
    window.openQuickOrderForm = function() {
        // Получаем ID объекта из URL или других способов
        const path = window.location.pathname;
        let propertyId = 1; // По умолчанию

        if (path.includes('apartment1.html')) propertyId = 1;
        else if (path.includes('apartment2.html')) propertyId = 2;
        else if (path.includes('house1.html')) propertyId = 3;

        quickOrder.openQuickOrderForm(propertyId);
    };

    console.log('Quick Order System ready');

})();