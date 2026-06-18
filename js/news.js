// news.js - управление новостями

class NewsManager {
    constructor() {
        this.news = [];
        this.currentCategory = 'all';
        this.currentPage = 1;
        this.itemsPerPage = 6;
        this.searchQuery = '';
        this.init();
    }

    init() {
        this.loadNews();
        this.setupEventListeners();
        this.renderNews();
    }

    loadNews() {
        // Проверяем есть ли новости в localStorage
        const savedNews = localStorage.getItem('hermes_news');
        
        if (savedNews) {
            this.news = JSON.parse(savedNews);
        } else {
            // Данные новостей по умолчанию
            this.news = this.getDefaultNews();
            localStorage.setItem('hermes_news', JSON.stringify(this.news));
        }
        
        // Обновляем просмотры из localStorage
        this.loadViews();
    }

    getDefaultNews() {
        return [
            {
                id: 1,
                title: "Открытие нового офиса в центре Москвы",
                excerpt: "Агентство недвижимости 'Гермес' открывает новый современный офис на Тверской улице...",
                content: `
                    <p>Мы рады сообщить об открытии нового офиса агентства недвижимости "Гермес" в самом сердце Москвы!</p>
                    <p>Новый офис расположен по адресу: г. Москва, ул. Тверская, 15. Это современное пространство, оборудованное всем необходимым для комфортной работы с клиентами.</p>
                    <p>В новом офисе вас ждут:</p>
                    <ul>
                        <li>Удобная зона ожидания с кофе и чаем</li>
                        <li>Современные переговорные комнаты</li>
                        <li>Профессиональные консультанты по недвижимости</li>
                        <li>Бесплатный Wi-Fi и зарядные станции</li>
                    </ul>
                    <p>Приходите знакомиться! Будем рады видеть вас в нашем новом уютном офисе.</p>
                `,
                image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format",
                category: "company",
                date: "2025-03-15",
                views: 245,
                tags: ["офис", "новости компании"]
            },
            {
                id: 2,
                title: "Изменения в законодательстве о недвижимости с 2025 года",
                excerpt: "Важные изменения в законах, которые затронут покупателей и продавцов недвижимости...",
                content: `
                    <p>С 1 января 2025 года вступают в силу важные изменения в законодательстве о недвижимости.</p>
                    <p><strong>Основные изменения:</strong></p>
                    <ul>
                        <li>Упрощение процедуры регистрации прав собственности</li>
                        <li>Новые требования к энергоэффективности зданий</li>
                        <li>Изменения в налогообложении при продаже недвижимости</li>
                        <li>Ужесточение требований к застройщикам</li>
                    </ul>
                    <p>Наши юристы подготовили подробный обзор изменений. Полную консультацию вы можете получить в нашем офисе или по телефону.</p>
                `,
                image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format",
                category: "market",
                date: "2025-03-10",
                views: 189,
                tags: ["законодательство", "новости рынка"]
            },
            {
                id: 3,
                title: "Как выбрать квартиру в новостройке: советы эксперта",
                excerpt: "Полезные рекомендации при выборе квартиры в новостройке от наших экспертов...",
                content: `
                    <p>Выбор квартиры в новостройке - ответственное решение. Наши эксперты подготовили 10 важных советов.</p>
                    <p><strong>На что обратить внимание:</strong></p>
                    <ul>
                        <li>Проверка застройщика и разрешительной документации</li>
                        <li>Оценка инфраструктуры района</li>
                        <li>Изучение планировки и качества отделки</li>
                        <li>Сроки сдачи дома и гарантийные обязательства</li>
                        <li>Условия договора долевого участия</li>
                    </ul>
                    <p>Доверьте выбор профессионалам! Наши агенты помогут найти лучший вариант.</p>
                `,
                image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format",
                category: "tips",
                date: "2025-03-05",
                views: 312,
                tags: ["советы", "новостройки"]
            },
            {
                id: 4,
                title: "Акция месяца: скидка 50% на услуги агента",
                excerpt: "Только в марте скидка 50% на все услуги агентства при покупке квартиры...",
                content: `
                    <p>В честь открытия нового офиса мы запускаем акцию месяца!</p>
                    <p><strong>Условия акции:</strong></p>
                    <ul>
                        <li>Скидка 50% на услуги агента при покупке квартиры</li>
                        <li>Бесплатная юридическая проверка документов</li>
                        <li>Помощь в оформлении ипотеки на выгодных условиях</li>
                    </ul>
                    <p>Акция действует до 31 марта 2025 года. Не упустите возможность сэкономить!</p>
                `,
                image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format",
                category: "company",
                date: "2025-03-01",
                views: 567,
                tags: ["акция", "скидки"]
            },
            {
                id: 5,
                title: "Прогноз цен на недвижимость на 2025 год",
                excerpt: "Аналитики рынка делятся прогнозами по динамике цен на жилую и коммерческую недвижимость...",
                content: `
                    <p>Аналитический отдел 'Гермес' подготовил прогноз цен на недвижимость на 2025 год.</p>
                    <p><strong>Основные тенденции:</strong></p>
                    <ul>
                        <li>Рост цен на первичном рынке на 8-12%</li>
                        <li>Стабилизация цен на вторичном рынке</li>
                        <li>Повышенный спрос на коммерческую недвижимость</li>
                        <li>Развитие пригородных направлений</li>
                    </ul>
                    <p>Самый выгодный момент для покупки - сейчас! Цены продолжают расти.</p>
                `,
                image: "https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800&auto=format",
                category: "market",
                date: "2025-02-25",
                views: 423,
                tags: ["прогноз", "аналитика"]
            },
            {
                id: 6,
                title: "Вебинар: 'Как продать квартиру дорого и быстро'",
                excerpt: "Приглашаем на бесплатный вебинар от экспертов агентства 'Гермес'...",
                content: `
                    <p>Приглашаем всех желающих на бесплатный вебинар "Как продать квартиру дорого и быстро".</p>
                    <p><strong>На вебинаре вы узнаете:</strong></p>
                    <ul>
                        <li>Как правильно подготовить квартиру к продаже</li>
                        <li>Секреты профессиональной фотосъемки</li>
                        <li>Как определить оптимальную цену</li>
                        <li>Техники переговоров с покупателями</li>
                    </ul>
                    <p>Вебинар состоится 20 марта в 19:00. Участие бесплатное, необходима регистрация.</p>
                `,
                image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format",
                category: "events",
                date: "2025-02-20",
                views: 178,
                tags: ["вебинар", "обучение"]
            },
            {
                id: 7,
                title: "Топ-5 ошибок при покупке квартиры на вторичном рынке",
                excerpt: "Чего стоит избегать при покупке вторичного жилья - опыт наших юристов...",
                content: `
                    <p>Покупка квартиры на вторичном рынке имеет свои риски. Наши юристы подготовили список самых частых ошибок.</p>
                    <p><strong>Ошибки покупателей:</strong></p>
                    <ul>
                        <li>Непроверка истории объекта</li>
                        <li>Отсутствие юридической проверки документов</li>
                        <li>Игнорирование оценки состояния дома</li>
                        <li>Поспешное подписание договора</li>
                    </ul>
                    <p>Доверьте покупку профессионалам! Наши юристы проведут полную проверку объекта.</p>
                `,
                image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format",
                category: "tips",
                date: "2025-02-15",
                views: 289,
                tags: ["ошибки", "вторичное жилье"]
            },
            {
                id: 8,
                title: "Ипотека под 6%: новые программы от банков-партнеров",
                excerpt: "Специальные предложения по ипотеке для клиентов 'Гермес'...",
                content: `
                    <p>Наши банки-партнеры запустили специальные ипотечные программы для клиентов 'Гермес'.</p>
                    <p><strong>Условия программ:</strong></p>
                    <ul>
                        <li>Ставка от 6% годовых</li>
                        <li>Первоначальный взнос от 15%</li>
                        <li>Срок кредитования до 30 лет</li>
                        <li>Без комиссии за оформление</li>
                    </ul>
                    <p>Оставьте заявку на сайте, и наш ипотечный брокер подберет лучший вариант.</p>
                `,
                image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format",
                category: "market",
                date: "2025-02-10",
                views: 445,
                tags: ["ипотека", "банки"]
            }
        ];
    }

    loadViews() {
        const views = JSON.parse(localStorage.getItem('news_views')) || {};
        this.news.forEach(news => {
            if (views[news.id]) {
                news.views = views[news.id];
            }
        });
    }

    setupEventListeners() {
        // Фильтры по категориям
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentCategory = tab.dataset.category;
                this.currentPage = 1;
                this.renderNews();
            });
        });

        // Поиск
        const searchInput = document.getElementById('searchNews');
        if (searchInput) {
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.searchNews();
                }
            });
        }
    }

    searchNews() {
        const searchInput = document.getElementById('searchNews');
        this.searchQuery = searchInput.value.trim().toLowerCase();
        this.currentPage = 1;
        this.renderNews();
    }

    getFilteredNews() {
        let filtered = [...this.news];
        
        // Фильтр по категории
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(news => news.category === this.currentCategory);
        }
        
        // Фильтр по поиску
        if (this.searchQuery) {
            filtered = filtered.filter(news => 
                news.title.toLowerCase().includes(this.searchQuery) ||
                news.excerpt.toLowerCase().includes(this.searchQuery) ||
                news.tags.some(tag => tag.toLowerCase().includes(this.searchQuery))
            );
        }
        
        // Сортировка по дате (новые сверху)
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return filtered;
    }

    renderNews() {
        const filtered = this.getFilteredNews();
        const totalPages = Math.ceil(filtered.length / this.itemsPerPage);
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedNews = filtered.slice(start, start + this.itemsPerPage);
        
        const grid = document.getElementById('newsGrid');
        
        if (paginatedNews.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-newspaper fa-3x"></i>
                    <h3>Новости не найдены</h3>
                    <p>Попробуйте изменить параметры поиска</p>
                    <button class="btn btn-primary" onclick="resetFilters()">Сбросить фильтры</button>
                </div>
            `;
            document.getElementById('pagination').innerHTML = '';
            return;
        }
        
        grid.innerHTML = paginatedNews.map(news => this.createNewsCard(news)).join('');
        this.renderPagination(totalPages);
    }

    createNewsCard(news) {
        const date = new Date(news.date).toLocaleDateString('ru-RU');
        const categoryNames = {
            'company': 'Новости компании',
            'market': 'Рынок недвижимости',
            'tips': 'Советы',
            'events': 'Мероприятия'
        };
        
        const isNew = (new Date() - new Date(news.date)) < 7 * 24 * 60 * 60 * 1000;
        
        return `
            <div class="news-card" data-id="${news.id}">
                <div class="news-image">
                    <img src="${news.image}" alt="${news.title}" onerror="this.src='https://via.placeholder.com/400x250?text=Новость'">
                    <span class="news-category">${categoryNames[news.category] || news.category}</span>
                    ${isNew ? '<span class="news-badge">NEW</span>' : ''}
                </div>
                <div class="news-content">
                    <div class="news-date">
                        <i class="fas fa-calendar-alt"></i> ${date}
                    </div>
                    <h3 class="news-title">${news.title}</h3>
                    <p class="news-excerpt">${news.excerpt.substring(0, 120)}${news.excerpt.length > 120 ? '...' : ''}</p>
                    <div class="news-stats">
                        <span><i class="fas fa-eye"></i> ${news.views}</span>
                        <span><i class="fas fa-tag"></i> ${news.tags[0]}</span>
                    </div>
                    <div class="news-footer">
                        <a href="#" class="read-more" onclick="newsManager.openNews(${news.id}); return false;">
                            Читать далее <i class="fas fa-arrow-right"></i>
                        </a>
                        <div class="share-buttons">
                            <div class="share-btn" onclick="shareNews('${news.title}', '${window.location.href}')">
                                <i class="fas fa-share-alt"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPagination(totalPages) {
        const pagination = document.getElementById('pagination');
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let pagesHTML = '';
        
        // Previous button
        pagesHTML += `<button class="page-btn" onclick="newsManager.goToPage(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>`;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                pagesHTML += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" onclick="newsManager.goToPage(${i})">${i}</button>`;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                pagesHTML += `<span class="page-dots">...</span>`;
            }
        }
        
        // Next button
        pagesHTML += `<button class="page-btn" onclick="newsManager.goToPage(${this.currentPage + 1})" ${this.currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>`;
        
        pagination.innerHTML = pagesHTML;
    }

    goToPage(page) {
        const filtered = this.getFilteredNews();
        const totalPages = Math.ceil(filtered.length / this.itemsPerPage);
        
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderNews();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async openNews(id) {
        const news = this.news.find(n => n.id === id);
        if (!news) return;
        
        // Увеличиваем счетчик просмотров
        news.views += 1;
        
        // Сохраняем просмотры
        const views = JSON.parse(localStorage.getItem('news_views')) || {};
        views[id] = news.views;
        localStorage.setItem('news_views', JSON.stringify(views));
        
        // Обновляем отображение
        localStorage.setItem('hermes_news', JSON.stringify(this.news));
        this.renderNews();
        
        // Заполняем модальное окно
        document.getElementById('modalTitle').textContent = news.title;
        document.getElementById('modalDate').textContent = new Date(news.date).toLocaleDateString('ru-RU');
        document.getElementById('modalViews').textContent = news.views;
        document.getElementById('modalCategory').textContent = this.getCategoryName(news.category);
        document.getElementById('modalContent').innerHTML = news.content;
        document.getElementById('modalImage').src = news.image;
        
        // Показываем модальное окно
        document.getElementById('newsModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    getCategoryName(category) {
        const names = {
            'company': 'Новости компании',
            'market': 'Рынок недвижимости',
            'tips': 'Советы',
            'events': 'Мероприятия'
        };
        return names[category] || category;
    }

    resetFilters() {
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.currentPage = 1;
        
        // Сбрасываем UI
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === 'all');
        });
        
        const searchInput = document.getElementById('searchNews');
        if (searchInput) searchInput.value = '';
        
        this.renderNews();
    }

    addNews(newsData) {
        const newNews = {
            id: Date.now(),
            ...newsData,
            views: 0,
            date: new Date().toISOString().split('T')[0]
        };
        
        this.news.unshift(newNews);
        localStorage.setItem('hermes_news', JSON.stringify(this.news));
        this.renderNews();
        
        return newNews;
    }

    deleteNews(id) {
        if (confirm('Удалить эту новость?')) {
            this.news = this.news.filter(n => n.id !== id);
            localStorage.setItem('hermes_news', JSON.stringify(this.news));
            this.renderNews();
        }
    }
}

// Функции для глобального доступа
function resetFilters() {
    if (window.newsManager) {
        newsManager.resetFilters();
    }
}

function shareNews(title, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: 'Интересная новость от агентства "Гермес"',
            url: url
        });
    } else {
        // Копируем ссылку в буфер
        navigator.clipboard.writeText(url);
        showNotification('Ссылка скопирована в буфер обмена!', 'success');
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `auth-notification ${type}`;
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i> ${message}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function closeNewsModal() {
    document.getElementById('newsModal').classList.remove('active');
    document.body.style.overflow = '';
}

// Закрытие модального окна по Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeNewsModal();
    }
});

// Инициализация
let newsManager;
document.addEventListener('DOMContentLoaded', function() {
    newsManager = new NewsManager();
    window.newsManager = newsManager;
});