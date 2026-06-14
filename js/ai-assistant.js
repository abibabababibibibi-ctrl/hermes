// AI-Помощник для агентства недвижимости "Гермес"

class AIAssistant {
    constructor() {
        this.isOpen = false;
        this.isMinimized = false;
        this.messages = [];
        this.currentUser = null;
        
        this.init();
    }
    
    init() {
        // Получаем текущего пользователя
        if (window.AuthService) {
            this.currentUser = AuthService.getCurrentUser();
        }
        
        // DOM элементы
        this.toggleBtn = document.getElementById('aiToggleBtn');
        this.chatWindow = document.getElementById('aiChatWindow');
        this.minimizeBtn = document.getElementById('aiMinimizeBtn');
        this.closeBtn = document.getElementById('aiCloseBtn');
        this.sendBtn = document.getElementById('aiSendBtn');
        this.input = document.getElementById('aiInput');
        this.messagesContainer = document.querySelector('.ai-messages');
        this.typingIndicator = document.getElementById('aiTyping');
        
        // Приветственное сообщение если пользователь авторизован
        if (this.currentUser) {
            this.addPersonalizedGreeting();
        }
        
        // Обработчики событий
        this.toggleBtn.addEventListener('click', () => this.toggleChat());
        this.minimizeBtn.addEventListener('click', () => this.minimizeChat());
        this.closeBtn.addEventListener('click', () => this.closeChat());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Автоматическое изменение высоты textarea
        this.input.addEventListener('input', () => {
            this.input.style.height = 'auto';
            this.input.style.height = Math.min(this.input.scrollHeight, 100) + 'px';
        });
        
        // Обработка предложений
        document.querySelectorAll('.ai-suggestion').forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.dataset.question;
                this.input.value = question;
                this.sendMessage();
            });
        });
        
        // Загрузка истории
        this.loadHistory();
    }
    
    toggleChat() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.chatWindow.classList.add('open');
            this.input.focus();
            this.scrollToBottom();
        } else {
            this.chatWindow.classList.remove('open');
        }
    }
    
    minimizeChat() {
        this.isMinimized = true;
        this.chatWindow.classList.add('minimized');
        setTimeout(() => {
            this.chatWindow.classList.remove('open');
        }, 300);
    }
    
    closeChat() {
        this.isOpen = false;
        this.isMinimized = false;
        this.chatWindow.classList.remove('open', 'minimized');
    }
    
    async sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;
        
        // Добавляем сообщение пользователя
        this.addMessage(message, 'user');
        this.input.value = '';
        this.input.style.height = 'auto';
        
        // Показываем индикатор печати
        this.showTyping();
        
        // Получаем ответ от AI
        setTimeout(async () => {
            const response = await this.getAIResponse(message);
            this.hideTyping();
            this.addMessage(response, 'bot');
            this.saveToHistory(message, response);
        }, 500);
    }
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ai-message-${sender}`;
        
        const avatar = sender === 'bot' ? '<i class="fas fa-robot"></i>' : 
                      (this.currentUser ? this.currentUser.firstName.charAt(0) : '👤');
        
        messageDiv.innerHTML = `
            <div class="ai-message-avatar">
                ${avatar}
            </div>
            <div class="ai-message-content">
                ${this.formatMessage(text)}
            </div>
        `;
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Сохраняем в массив
        this.messages.push({ text, sender, timestamp: new Date() });
    }
    
    formatMessage(text) {
        // Форматирование ссылок
        text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        // Форматирование жирного текста
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Форматирование списков
        text = text.replace(/- (.*?)(\n|$)/g, '<li>$1</li>');
        if (text.includes('<li>')) {
            text = '<ul>' + text + '</ul>';
        }
        
        // Перенос строк
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }
    
    async getAIResponse(message) {
        const lowerMsg = message.toLowerCase();
        
        // Проверка на наличие пользователя
        const user = this.currentUser;
        
        // База знаний AI
        const responses = {
            // Приветствия
            'привет': 'Здравствуйте! 👋 Чем я могу помочь вам сегодня?',
            'здравствуй': 'Здравствуйте! Рад видеть вас в агентстве "Гермес"! 🏠',
            'добрый день': 'Добрый день! Чем могу быть полезен?',
            
            // Поиск недвижимости
            'найти квартиру': this.getSearchResponse('квартира'),
            'найти дом': this.getSearchResponse('дом'),
            'поиск': '🔍 Для поиска недвижимости перейдите в <a href="catalog.html">каталог</a>. Вы можете отфильтровать объекты по цене, району и другим параметрам.',
            
            // Ипотека
            'ипотека': this.getMortgageResponse(),
            'рассчитать ипотеку': this.getMortgageResponse(),
            'кредит': '💰 Мы сотрудничаем с ведущими банками. Средняя ставка по ипотеке — от 8% годовых. Хотите рассчитать примерный платеж?',
            
            // Просмотры
            'записаться на просмотр': this.getViewingResponse(),
            'посмотреть квартиру': this.getViewingResponse(),
            
            // Бронирование
            'бронирование': '📅 Чтобы забронировать объект, перейдите в <a href="catalog.html">каталог</a>, выберите понравившийся вариант и нажмите "Забронировать". Депозит составляет от 20 000 до 100 000 ₽.',
            
            // Контакты
            'контакты': '📞 Наши контакты:<br>Телефон: +7 (495) 123-45-67<br>Email: info@hermes.ru<br>Адрес: г. Москва, ул. Тверская, 15',
            'адрес': '🏢 Наш офис находится по адресу: г. Москва, ул. Тверская, 15. Ближайшее метро — "Тверская" или "Пушкинская".',
            'телефон': '📞 Наш телефон: +7 (495) 123-45-67. Звоните с 9:00 до 20:00 ежедневно.',
            
            // О компании
            'о компании': '🏢 "Гермес" — агентство недвижимости с 10-летним опытом. Мы помогли более 500 семьям найти свой идеальный дом. Наши специалисты всегда готовы помочь вам!',
            'отзывы': '⭐ Наши клиенты оценивают нас на 4.9 из 5. Вы можете посмотреть отзывы в нашем <a href="https://vk.com/club233530044" target="_blank">сообществе ВКонтакте</a>.',
            
            // Помощь
            'помощь': this.getHelpResponse(),
            'что ты умеешь': this.getHelpResponse(),
            'функции': this.getHelpResponse(),
            
            // Цены
            'цена': '💰 Цены на недвижимость варьируются от 4.5 млн ₽ за студию до 25 млн ₽ за загородный дом. Актуальные цены смотрите в <a href="catalog.html">каталоге</a>.',
            
            // Документы
            'документы': '📋 Для покупки недвижимости потребуются: паспорт, СНИЛС, ИНН, справка о доходах. Наши юристы помогут собрать все необходимые документы.',
            
            // Скидки
            'скидка': '🎁 У нас действуют акции! При покупке квартиры — бесплатная юридическая консультация. При бронировании через сайт — скидка 5% на услуги агента.',
        };
        
        // Поиск по ключевым словам
        for (const [key, value] of Object.entries(responses)) {
            if (lowerMsg.includes(key)) {
                return value;
            }
        }
        
        // Проверка на вопрос о цене конкретного района
        if (lowerMsg.includes('цена') && (lowerMsg.includes('центр') || lowerMsg.includes('центральный'))) {
            return '💰 В центральном районе цены на квартиры начинаются от 12 млн ₽ за 2-комнатную. В нашем каталоге есть несколько вариантов в этом районе. Хотите посмотреть?';
        }
        
        if (lowerMsg.includes('цена') && lowerMsg.includes('пригород')) {
            return '💰 В пригороде вы можете найти дом от 15 млн ₽ или квартиру от 5 млн ₽. Стоимость зависит от площади и удаленности от города.';
        }
        
        // Общий ответ
        return this.getGeneralResponse(lowerMsg);
    }
    
    getSearchResponse(type) {
        const user = this.currentUser;
        let response = `🔍 Поиск ${type === 'квартира' ? 'квартир' : 'домов'}:\n\n`;
        
        if (user) {
            response += `Здравствуйте, ${user.firstName}! `;
        }
        
        response += `Я помогу вам найти идеальный вариант. Вот что я могу сделать:\n\n`;
        response += `• Показать все доступные ${type === 'квартира' ? 'квартиры' : 'дома'} в каталоге\n`;
        response += `• Подобрать варианты по вашим критериям\n`;
        response += `• Сравнить несколько объектов\n`;
        response += `• Записать на просмотр\n\n`;
        response += `Перейдите в <a href="catalog.html">каталог</a> чтобы начать поиск! 🏠`;
        
        return response;
    }
    
    getMortgageResponse() {
        return `💰 **Ипотечный калькулятор**

Примерный расчет для квартиры стоимостью 10 000 000 ₽:

• Первоначальный взнос (20%): 2 000 000 ₽
• Сумма кредита: 8 000 000 ₽
• Ставка: 8% годовых
• Срок: 20 лет

Ежемесячный платеж: ~66 500 ₽

Хотите точный расчет? Укажите:
- Стоимость объекта
- Сумму первоначального взноса
- Желаемый срок кредита`;
    }
    
    getViewingResponse() {
        const user = this.currentUser;
        
        if (!user) {
            return `📅 Для записи на просмотр необходимо <a href="login.html">войти</a> или <a href="register.html">зарегистрироваться</a>. После авторизации вы сможете выбрать удобное время для осмотра объектов.`;
        }
        
        return `📅 ${user.firstName}, записаться на просмотр очень просто!

Выберите понравившийся объект в <a href="catalog.html">каталоге</a> и нажмите кнопку "Забронировать просмотр". Наш менеджер свяжется с вами в ближайшее время для подтверждения.

Также вы можете позвонить нам: +7 (495) 123-45-67`;
    }
    
    getHelpResponse() {
        return `🤖 **Что я умею:**

• 🔍 **Поиск недвижимости** - найду квартиры, дома, коммерческую недвижимость
• 💰 **Ипотека** - рассчитаю примерный ежемесячный платеж
• 📅 **Просмотры** - помогу записаться на осмотр
• 📊 **Сравнение** - сравню несколько объектов
• 📞 **Контакты** - дам контактную информацию
• ❓ **FAQ** - отвечу на частые вопросы

Просто напишите, что вас интересует, и я помогу!`;
    }
    
    getGeneralResponse(message) {
        // Проверка на вопрос о районе
        if (message.includes('район')) {
            return `🏙️ Мы работаем со всеми районами города. Самые популярные:
            
• Центральный - квартиры от 12 млн ₽
• Северный - квартиры от 8 млн ₽
• Южный - квартиры от 5.5 млн ₽
• Пригород - дома от 15 млн ₽

Подробнее о каждом районе можно узнать в <a href="catalog.html">каталоге</a>.`;
        }
        
        // Проверка на вопрос о времени работы
        if (message.includes('время работы') || message.includes('работаете')) {
            return `🕐 Мы работаем ежедневно с 9:00 до 20:00.
            
В выходные дни офис работает с 10:00 до 18:00.
Запись на просмотр доступна круглосуточно через сайт!`;
        }
        
        // Ответ по умолчанию
        return `🤔 Я не совсем понял ваш вопрос. 

Попробуйте спросить:
• "Найти квартиру" - для поиска недвижимости
• "Рассчитать ипотеку" - для расчета платежей
• "Записаться на просмотр" - для записи
• "Контакты" - наши контакты

Или посмотрите <a href="catalog.html">каталог</a> для самостоятельного поиска!`;
    }
    
    addPersonalizedGreeting() {
        if (!this.currentUser) return;
        
        setTimeout(() => {
            const greeting = `${this.currentUser.firstName}, рад снова видеть вас! 👋

У вас ${this.getUserFavoritesCount()} избранных объектов и ${this.getUserActiveBookingsCount()} активных бронирований.

Чем могу помочь сегодня?`;
            
            this.addMessage(greeting, 'bot');
        }, 1000);
    }
    
    getUserFavoritesCount() {
        const favorites = JSON.parse(localStorage.getItem('hermes_favorites')) || {};
        if (this.currentUser) {
            return (favorites[this.currentUser.id] || []).length;
        }
        return 0;
    }
    
    getUserActiveBookingsCount() {
        if (window.database) {
            const bookings = database.getBookings();
            if (this.currentUser) {
                return bookings.filter(b => b.userId === this.currentUser.id && b.status === 'active').length;
            }
        }
        return 0;
    }
    
    showTyping() {
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }
    
    hideTyping() {
        this.typingIndicator.style.display = 'none';
    }
    
    scrollToBottom() {
        const body = document.querySelector('.ai-chat-body');
        body.scrollTop = body.scrollHeight;
    }
    
    saveToHistory(question, answer) {
        const history = {
            question,
            answer,
            timestamp: new Date().toISOString(),
            userId: this.currentUser?.id || null
        };
        
        let chatHistory = JSON.parse(localStorage.getItem('ai_chat_history')) || [];
        chatHistory.push(history);
        
        // Ограничиваем историю 50 сообщениями
        if (chatHistory.length > 50) {
            chatHistory = chatHistory.slice(-50);
        }
        
        localStorage.setItem('ai_chat_history', JSON.stringify(chatHistory));
    }
    
    loadHistory() {
        // Опционально: загружаем последние сообщения
        const history = JSON.parse(localStorage.getItem('ai_chat_history')) || [];
        const userHistory = history.filter(h => h.userId === this.currentUser?.id).slice(-5);
        
        if (userHistory.length > 0 && !this.currentUser) {
            // Показываем последние 5 сообщений для авторизованного пользователя
            setTimeout(() => {
                this.addMessage('Продолжим общение? Вот что мы обсуждали ранее:', 'bot');
                userHistory.forEach(h => {
                    this.addMessage(h.question, 'user');
                    this.addMessage(h.answer, 'bot');
                });
            }, 1500);
        }
    }
}

// Инициализация при загрузке
let aiAssistant;
document.addEventListener('DOMContentLoaded', function() {
    aiAssistant = new AIAssistant();
});

// Добавьте в класс AIAssistant
async searchProperties(criteria) {
    const properties = database.getProperties();
    
    let filtered = [...properties];
    
    // Поиск по типу
    if (criteria.type) {
        filtered = filtered.filter(p => p.type === criteria.type);
    }
    
    // Поиск по цене
    if (criteria.maxPrice) {
        filtered = filtered.filter(p => p.price <= criteria.maxPrice);
    }
    
    // Поиск по комнатам
    if (criteria.rooms) {
        filtered = filtered.filter(p => p.rooms === criteria.rooms);
    }
    
    return filtered.slice(0, 5);
}

// ai-assistant.js - полная логика работы AI-помощника

class AIAssistant {
    constructor() {
        this.isOpen = false;
        this.isMinimized = false;
        this.messages = [];
        this.currentUser = null;
        this.unreadCount = 0;
        
        this.init();
    }
    
    init() {
        // Получаем DOM элементы
        this.toggleBtn = document.getElementById('aiToggleBtn');
        this.chatWindow = document.getElementById('aiChatWindow');
        this.minimizeBtn = document.getElementById('aiMinimizeBtn');
        this.closeBtn = document.getElementById('aiCloseBtn');
        this.sendBtn = document.getElementById('aiSendBtn');
        this.clearBtn = document.getElementById('aiClearBtn');
        this.input = document.getElementById('aiInput');
        this.messagesContainer = document.getElementById('aiMessages');
        this.typingIndicator = document.getElementById('aiTyping');
        this.notificationBadge = document.getElementById('aiNotificationBadge');
        
        // Получаем текущего пользователя
        if (window.AuthService) {
            this.currentUser = AuthService.getCurrentUser();
        }
        
        // Загружаем историю
        this.loadHistory();
        
        // Добавляем персонализированное приветствие
        if (this.currentUser && this.messages.length === 0) {
            this.addPersonalizedGreeting();
        }
        
        // Обработчики событий
        this.toggleBtn.addEventListener('click', () => this.toggleChat());
        this.minimizeBtn.addEventListener('click', () => this.minimizeChat());
        this.closeBtn.addEventListener('click', () => this.closeChat());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.clearBtn.addEventListener('click', () => this.clearHistory());
        
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Автоматическое изменение высоты textarea
        this.input.addEventListener('input', () => {
            this.input.style.height = 'auto';
            this.input.style.height = Math.min(this.input.scrollHeight, 100) + 'px';
        });
        
        // Обработка быстрых вопросов
        document.querySelectorAll('.ai-suggestion').forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.dataset.question;
                this.input.value = question;
                this.sendMessage();
            });
        });
        
        // Сброс уведомлений при открытии
        this.resetNotifications();
    }
    
    toggleChat() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.chatWindow.classList.add('open');
            this.input.focus();
            this.scrollToBottom();
            this.resetNotifications();
        } else {
            this.chatWindow.classList.remove('open');
            // Показываем уведомление о непрочитанных
            if (this.unreadCount > 0) {
                this.notificationBadge.style.display = 'block';
                this.notificationBadge.textContent = this.unreadCount;
            }
        }
    }
    
    minimizeChat() {
        this.isMinimized = true;
        this.chatWindow.classList.add('minimized');
        setTimeout(() => {
            this.chatWindow.classList.remove('open');
        }, 300);
    }
    
    closeChat() {
        this.isOpen = false;
        this.isMinimized = false;
        this.chatWindow.classList.remove('open', 'minimized');
    }
    
    async sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;
        
        // Добавляем сообщение пользователя
        this.addMessage(message, 'user');
        this.input.value = '';
        this.input.style.height = 'auto';
        
        // Показываем индикатор печати
        this.showTyping();
        
        // Получаем ответ от AI
        setTimeout(async () => {
            const response = await this.getAIResponse(message);
            this.hideTyping();
            this.addMessage(response, 'bot');
            this.saveToHistory(message, response);
            
            // Если чат свернут, увеличиваем счетчик
            if (!this.isOpen) {
                this.unreadCount++;
                this.notificationBadge.style.display = 'block';
                this.notificationBadge.textContent = this.unreadCount;
            }
        }, 800);
    }
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ai-message-${sender}`;
        
        let avatar = '';
        if (sender === 'bot') {
            avatar = '<i class="fas fa-robot"></i>';
        } else {
            avatar = this.currentUser ? this.currentUser.firstName.charAt(0).toUpperCase() : '👤';
        }
        
        messageDiv.innerHTML = `
            <div class="ai-message-avatar">
                ${avatar}
            </div>
            <div class="ai-message-content">
                ${this.formatMessage(text)}
            </div>
        `;
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Сохраняем в массив
        this.messages.push({ text, sender, timestamp: new Date() });
    }
    
    formatMessage(text) {
        // Форматирование ссылок
        text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        // Форматирование жирного текста
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Форматирование списков
        if (text.includes('\n- ')) {
            const lines = text.split('\n');
            let inList = false;
            let formatted = '';
            
            for (let line of lines) {
                if (line.startsWith('- ')) {
                    if (!inList) {
                        formatted += '<ul>';
                        inList = true;
                    }
                    formatted += `<li>${line.substring(2)}</li>`;
                } else {
                    if (inList) {
                        formatted += '</ul>';
                        inList = false;
                    }
                    formatted += line + '<br>';
                }
            }
            if (inList) formatted += '</ul>';
            text = formatted;
        }
        
        // Перенос строк
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }
    
    async getAIResponse(message) {
        const lowerMsg = message.toLowerCase();
        
        // База ответов AI
        const responses = {
            // Приветствия
            'привет': '👋 Здравствуйте! Чем могу помочь сегодня?',
            'здравствуй': 'Здравствуйте! Рад видеть вас в "Гермес"! 🏠',
            'добрый день': 'Добрый день! Чем могу быть полезен?',
            'доброе утро': 'Доброе утро! Хорошего дня! Чем помочь?',
            'добрый вечер': 'Добрый вечер! Чем могу помочь?',
            
            // Поиск
            'найти квартиру': this.getSearchResponse('квартира'),
            'найти дом': this.getSearchResponse('дом'),
            'поиск': '🔍 Перейдите в <a href="catalog.html">каталог</a> для поиска. Там есть фильтры по цене, району, комнатам!',
            'квартира': this.getSearchResponse('квартира'),
            'дом': this.getSearchResponse('дом'),
            
            // Ипотека
            'ипотека': this.getMortgageResponse(),
            'рассчитать ипотеку': this.getMortgageResponse(),
            'кредит': '💰 Мы сотрудничаем с банками. Ставка от 8% годовых. Хотите рассчитать платеж?',
            
            // Просмотр
            'записаться на просмотр': this.getViewingResponse(),
            'просмотр': this.getViewingResponse(),
            'посмотреть': this.getViewingResponse(),
            
            // Бронирование
            'бронирование': '📅 Чтобы забронировать объект, перейдите в <a href="catalog.html">каталог</a>, выберите объект и нажмите "Забронировать". Депозит от 20 000 ₽.',
            'забронировать': '📅 Для бронирования перейдите в каталог, выберите объект и нажмите "Забронировать".',
            
            // Контакты
            'контакты': '📞 **Наши контакты:**\n- Телефон: +7 (495) 123-45-67\n- Email: info@hermes.ru\n- Адрес: г. Москва, ул. Тверская, 15\n- VK: <a href="https://vk.com/club233530044" target="_blank">Гермес Недвижимость</a>',
            'телефон': '📞 Наш телефон: +7 (495) 123-45-67. Звоните с 9:00 до 20:00!',
            'адрес': '🏢 Наш офис: г. Москва, ул. Тверская, 15. Метро "Тверская" или "Пушкинская".',
            'email': '📧 Email для связи: info@hermes.ru',
            'vk': '🔗 Наша группа VK: <a href="https://vk.com/club233530044" target="_blank">https://vk.com/club233530044</a>',
            
            // О компании
            'о компании': '🏢 "Гермес" — агентство недвижимости с 10-летним опытом. Помогли более 500 семьям найти дом. Наша миссия — сделать поиск жилья простым и безопасным!',
            'отзывы': '⭐ Наши клиенты оценивают нас на 4.9 из 5. Отзывы можно посмотреть в нашей <a href="https://vk.com/club233530044" target="_blank">группе VK</a>.',
            
            // Помощь
            'помощь': this.getHelpResponse(),
            'что ты умеешь': this.getHelpResponse(),
            'функции': this.getHelpResponse(),
            
            // Цены
            'цена': '💰 Цены:\n- Студия: от 4.5 млн ₽\n- 1-комнатная: от 5.5 млн ₽\n- 2-комнатная: от 8 млн ₽\n- 3-комнатная: от 12 млн ₽\n- Дом: от 15 млн ₽\n\nАктуальные цены в <a href="catalog.html">каталоге</a>.',
            
            // Документы
            'документы': '📋 **Необходимые документы:**\n- Паспорт\n- СНИЛС\n- ИНН\n- Справка о доходах\n\nНаши юристы помогут собрать все документы!',
            
            // Скидки
            'скидка': '🎁 **Акции:**\n- При покупке квартиры → бесплатная юстировка\n- При бронировании через сайт → скидка 5%\n- При обращении по рекомендации → подарок!',
        };
        
        // Поиск по ключевым словам
        for (const [key, value] of Object.entries(responses)) {
            if (lowerMsg.includes(key)) {
                return value;
            }
        }
        
        // Вопросы про районы
        if (lowerMsg.includes('район')) {
            return this.getDistrictResponse(lowerMsg);
        }
        
        // Вопросы про время работы
        if (lowerMsg.includes('время работы') || lowerMsg.includes('работаете')) {
            return '🕐 **Режим работы:**\n- Пн-Пт: 9:00 - 20:00\n- Сб-Вс: 10:00 - 18:00\n\nЗапись на просмотр доступна 24/7 через сайт!';
        }
        
        // Общий ответ
        return this.getGeneralResponse();
    }
    
    getSearchResponse(type) {
        let response = `🔍 **Поиск ${type === 'квартира' ? 'квартир' : 'домов'}**\n\n`;
        
        if (this.currentUser) {
            response += `${this.currentUser.firstName}, я помогу вам найти идеальный вариант!\n\n`;
        }
        
        response += `**Что я могу:**\n`;
        response += `• Показать все доступные ${type === 'квартира' ? 'квартиры' : 'дома'} в <a href="catalog.html">каталоге</a>\n`;
        response += `• Подобрать варианты по вашим критериям\n`;
        response += `• Сравнить несколько объектов\n`;
        response += `• Записать на просмотр\n\n`;
        response += `👉 **Перейдите в <a href="catalog.html">каталог</a> чтобы начать поиск!** 🏠`;
        
        return response;
    }
    
    getMortgageResponse() {
        return `💰 **Ипотечный калькулятор**

**Примерный расчет для квартиры 10 000 000 ₽:**

| Параметр | Значение |
|----------|----------|
| Первоначальный взнос (20%) | 2 000 000 ₽ |
| Сумма кредита | 8 000 000 ₽ |
| Ставка | 8% годовых |
| Срок | 20 лет |

**Ежемесячный платеж:** ~66 500 ₽

Хотите точный расчет? Напишите:
- Стоимость объекта
- Сумму первоначального взноса
- Желаемый срок кредита

Наши специалисты также помогут с подбором лучшей программы!`;
    }
    
    getViewingResponse() {
        if (!this.currentUser) {
            return `📅 Для записи на просмотр необходимо <a href="login.html">войти</a> или <a href="register.html">зарегистрироваться</a>.

После авторизации вы сможете:
• Выбрать удобное время
• Забронировать объект
• Получить консультацию агента`;
        }
        
        return `📅 **${this.currentUser.firstName}, записаться на просмотр просто!**

**Шаг 1:** Перейдите в <a href="catalog.html">каталог</a>
**Шаг 2:** Выберите понравившийся объект
**Шаг 3:** Нажмите "Забронировать просмотр"

**Или свяжитесь с нами:**
📞 Телефон: +7 (495) 123-45-67
📧 Email: info@hermes.ru

Наш менеджер свяжется с вами для подтверждения!`;
    }
    
    getDistrictResponse(message) {
        if (message.includes('центр') || message.includes('центральный')) {
            return '🏙️ **Центральный район**\n- Квартиры от 12 млн ₽\n- Развитая инфраструктура\n- Близость к метро\n- Престижный район\n\nВ каталоге есть несколько вариантов!';
        }
        
        if (message.includes('север') || message.includes('северный')) {
            return '🏙️ **Северный район**\n- Квартиры от 8 млн ₽\n- Хорошая транспортная доступность\n- Много парков и скверов\n- Новостройки и вторичка\n\nХотите посмотреть варианты?';
        }
        
        if (message.includes('юг') || message.includes('южный')) {
            return '🏙️ **Южный район**\n- Квартиры от 5.5 млн ₽\n- Бюджетные варианты\n- Развитая инфраструктура\n- Хорошая экология\n\nМогу подобрать варианты для вас!';
        }
        
        if (message.includes('пригород')) {
            return '🏡 **Пригород**\n- Дома от 15 млн ₽\n- Участки от 2 млн ₽\n- Свежий воздух\n- Своя территория\n- Гараж и сад\n\nОтличный выбор для семей с детьми!';
        }
        
        return '🏙️ Мы работаем со всеми районами города. Уточните, какой район вас интересует: Центральный, Северный, Южный, Западный, Восточный или Пригород?';
    }
    
    getHelpResponse() {
        return `🤖 **Что я умею:**

| Команда | Что сделаю |
|---------|------------|
| 🔍 найти квартиру | Покажу где искать квартиры |
| 🏠 найти дом | Помогу найти дом |
| 💰 рассчитать ипотеку | Рассчитаю платеж |
| 📅 записаться на просмотр | Помогу записаться |
| 📞 контакты | Покажу контакты |
| 🏢 о компании | Расскажу о нас |
| ⭐ отзывы | Покажу отзывы |
| 📋 документы | Список документов |
| 🎁 скидка | Акции и скидки |

Просто напишите, что вас интересует! 😊`;
    }
    
    getGeneralResponse() {
        return `🤔 **Я не совсем понял вопрос.**

Попробуйте спросить:
• "Найти квартиру" - поиск в каталоге
• "Рассчитать ипотеку" - расчет платежей
• "Записаться на просмотр" - запись
• "Контакты" - наши контакты
• "Помощь" - что я умею

Или просто перейдите в <a href="catalog.html">каталог</a> для самостоятельного поиска! 🏠

Если нужна помощь специалиста, позвоните: +7 (495) 123-45-67`;
    }
    
    addPersonalizedGreeting() {
        const favorites = this.getUserFavoritesCount();
        const bookings = this.getUserActiveBookingsCount();
        
        let greeting = `👋 **${this.currentUser.firstName}, рад снова видеть вас!**\n\n`;
        
        if (favorites > 0 || bookings > 0) {
            greeting += `📊 **Ваша активность:**\n`;
            if (favorites > 0) greeting += `• ❤️ ${favorites} избранных объектов\n`;
            if (bookings > 0) greeting += `• 📅 ${bookings} активных бронирований\n`;
            greeting += `\n`;
        }
        
        greeting += `Чем могу помочь сегодня? Напишите вопрос или выберите действие ниже 👇`;
        
        setTimeout(() => {
            this.addMessage(greeting, 'bot');
        }, 500);
    }
    
    getUserFavoritesCount() {
        const favorites = JSON.parse(localStorage.getItem('hermes_favorites')) || {};
        if (this.currentUser) {
            return (favorites[this.currentUser.id] || []).length;
        }
        return 0;
    }
    
    getUserActiveBookingsCount() {
        if (window.database) {
            const bookings = database.getBookings();
            if (this.currentUser) {
                return bookings.filter(b => b.userId === this.currentUser.id && b.status === 'active').length;
            }
        }
        return 0;
    }
    
    showTyping() {
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }
    
    hideTyping() {
        this.typingIndicator.style.display = 'none';
    }
    
    scrollToBottom() {
        const body = document.querySelector('.ai-chat-body');
        if (body) {
            body.scrollTop = body.scrollHeight;
        }
    }
    
    resetNotifications() {
        this.unreadCount = 0;
        this.notificationBadge.style.display = 'none';
    }
    
    saveToHistory(question, answer) {
        const history = {
            question,
            answer,
            timestamp: new Date().toISOString(),
            userId: this.currentUser?.id || null
        };
        
        let chatHistory = JSON.parse(localStorage.getItem('ai_chat_history')) || [];
        chatHistory.push(history);
        
        // Ограничиваем историю 100 сообщениями
        if (chatHistory.length > 100) {
            chatHistory = chatHistory.slice(-100);
        }
        
        localStorage.setItem('ai_chat_history', JSON.stringify(chatHistory));
    }
    
    loadHistory() {
        const history = JSON.parse(localStorage.getItem('ai_chat_history')) || [];
        const userHistory = history.filter(h => h.userId === this.currentUser?.id);
        
        if (userHistory.length > 0 && this.currentUser) {
            // Восстанавливаем последние 3 диалога
            const lastMessages = userHistory.slice(-6);
            if (lastMessages.length > 0) {
                setTimeout(() => {
                    this.addMessage('Продолжим с того места, где остановились? 📝', 'bot');
                    lastMessages.forEach(h => {
                        this.addMessage(h.question, 'user');
                        this.addMessage(h.answer, 'bot');
                    });
                }, 1000);
            }
        }
    }
    
    clearHistory() {
        if (confirm('Очистить всю историю диалогов?')) {
            localStorage.removeItem('ai_chat_history');
            this.messages = [];
            this.messagesContainer.innerHTML = '';
            
            // Восстанавливаем приветствие
            const welcomeMsg = document.createElement('div');
            welcomeMsg.className = 'ai-message ai-message-bot';
            welcomeMsg.innerHTML = `
                <div class="ai-message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="ai-message-content">
                    <p>✅ История очищена! Теперь мы можем начать новый диалог. Чем могу помочь?</p>
                </div>
            `;
            this.messagesContainer.appendChild(welcomeMsg);
            
            if (this.currentUser) {
                this.addPersonalizedGreeting();
            }
            
            this.scrollToBottom();
        }
    }
}

// Инициализация
let aiAssistant;
document.addEventListener('DOMContentLoaded', function() {
    aiAssistant = new AIAssistant();
});