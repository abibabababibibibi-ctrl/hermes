// client-manager.js - Управление клиентами с 15 готовыми клиентами

class ClientManager {
    constructor() {
        this.clients = [];
        this.objects = [];
        this.currentPage = 1;
        this.itemsPerPage = 9;
        this.filteredClients = [];
        this.init();
    }

    init() {
        this.loadClients();
        this.loadObjects();
        this.renderStats();
        this.renderClients();
        this.setupEventListeners();
        this.updateAuthUI();
    }

    // 15 готовых клиентов (покупатели и арендаторы)
    getDefaultClients() {
        return [
            {
                id: 1, firstName: 'Иван', lastName: 'Петров', phone: '+7 (999) 123-45-67', email: 'ivan@example.com',
                type: 'buyer', budget: 15000000, status: 'active', agentId: null,
                preferences: 'Центральный район, 2-3 комнаты, не первый этаж, новостройка',
                notes: 'Предпочитает кирпичные дома, нужна парковка',
                interestedProperties: [1, 6],
                history: [
                    { id: 1, type: 'call', description: 'Первичный звонок, интересуют квартиры в центре', date: '2025-05-01T10:00:00' },
                    { id: 2, type: 'meeting', description: 'Встреча в офисе, показал варианты в центре', date: '2025-05-05T15:00:00' }
                ],
                createdAt: '2025-05-01'
            },
            {
                id: 2, firstName: 'Мария', lastName: 'Иванова', phone: '+7 (999) 234-56-78', email: 'maria@example.com',
                type: 'tenant', budget: 50000, status: 'active', agentId: null,
                preferences: 'Студия или 1-комнатная, недалеко от метро, до 30 минут до центра',
                notes: 'Срочно, нужно до конца месяца, с мебелью',
                interestedProperties: [4, 7],
                history: [
                    { id: 1, type: 'call', description: 'Звонок, ищет студию до 50 000 ₽/мес', date: '2025-05-02T11:30:00' }
                ],
                createdAt: '2025-05-02'
            },
            {
                id: 3, firstName: 'Алексей', lastName: 'Сидоров', phone: '+7 (999) 345-67-89', email: 'alex@example.com',
                type: 'buyer', budget: 25000000, status: 'active', agentId: null,
                preferences: 'Загородный дом, участок от 10 соток, не дальше 30 км от МКАД',
                notes: 'Рассматривает таунхаусы и коттеджи',
                interestedProperties: [3, 5, 12],
                history: [
                    { id: 1, type: 'call', description: 'Первичный звонок о загородной недвижимости', date: '2025-05-03T09:00:00' },
                    { id: 2, type: 'viewing', description: 'Показ дома в эко-поселке', date: '2025-05-07T14:00:00' }
                ],
                createdAt: '2025-05-03'
            },
            {
                id: 4, firstName: 'Екатерина', lastName: 'Козлова', phone: '+7 (999) 456-78-90', email: 'ekaterina@example.com',
                type: 'buyer', budget: 8500000, status: 'active', agentId: null,
                preferences: '2-комнатная квартира, южный или восточный район, хорошая транспортная доступность',
                notes: 'Есть ребенок, нужна рядом школа и садик',
                interestedProperties: [7, 14],
                history: [
                    { id: 1, type: 'call', description: 'Звонок, ищет квартиру для семьи', date: '2025-05-04T14:00:00' }
                ],
                createdAt: '2025-05-04'
            },
            {
                id: 5, firstName: 'Дмитрий', lastName: 'Морозов', phone: '+7 (999) 567-89-01', email: 'dmitry@example.com',
                type: 'buyer', budget: 35000000, status: 'active', agentId: null,
                preferences: 'Элитная квартира, центр, вид на город, высокие потолки',
                notes: 'Интересуется пентхаусами',
                interestedProperties: [6, 8],
                history: [
                    { id: 1, type: 'call', description: 'Звонок о квартирах премиум-класса', date: '2025-05-05T16:00:00' },
                    { id: 2, type: 'meeting', description: 'Встреча в офисе, обсуждение вариантов', date: '2025-05-08T12:00:00' }
                ],
                createdAt: '2025-05-05'
            },
            {
                id: 6, firstName: 'Анна', lastName: 'Соколова', phone: '+7 (999) 678-90-12', email: 'anna@example.com',
                type: 'tenant', budget: 35000, status: 'active', agentId: null,
                preferences: '1-комнатная квартира, недалеко от метро, тихий двор',
                notes: 'Студентка, нужна квартира на длительный срок',
                interestedProperties: [7],
                history: [
                    { id: 1, type: 'call', description: 'Звонок о съеме квартиры', date: '2025-05-06T10:00:00' }
                ],
                createdAt: '2025-05-06'
            },
            {
                id: 7, firstName: 'Сергей', lastName: 'Волков', phone: '+7 (999) 789-01-23', email: 'sergey@example.com',
                type: 'buyer', budget: 12000000, status: 'active', agentId: null,
                preferences: '3-комнатная квартира, северный район, недалеко от парка',
                notes: 'Рассматривает вторичку и новостройки',
                interestedProperties: [2, 11],
                history: [
                    { id: 1, type: 'call', description: 'Первичный звонок', date: '2025-05-07T12:00:00' },
                    { id: 2, type: 'viewing', description: 'Показ квартиры в северном районе', date: '2025-05-09T16:00:00' }
                ],
                createdAt: '2025-05-07'
            },
            {
                id: 8, firstName: 'Ольга', lastName: 'Новикова', phone: '+7 (999) 890-12-34', email: 'olga@example.com',
                type: 'buyer', budget: 18000000, status: 'active', agentId: null,
                preferences: 'Таунхаус или дуплекс, западный район, закрытая территория',
                notes: 'Семья с двумя детьми, нужна хорошая школа рядом',
                interestedProperties: [5, 12],
                history: [
                    { id: 1, type: 'call', description: 'Звонок о таунхаусах', date: '2025-05-08T13:00:00' }
                ],
                createdAt: '2025-05-08'
            },
            {
                id: 9, firstName: 'Павел', lastName: 'Кузнецов', phone: '+7 (999) 901-23-45', email: 'pavel@example.com',
                type: 'buyer', budget: 5500000, status: 'completed', agentId: null,
                preferences: 'Студия в новостройке, южный район, отделка под ключ',
                notes: 'Сделка завершена, купил студию в ЖК "Южный"',
                interestedProperties: [4],
                history: [
                    { id: 1, type: 'call', description: 'Первичный звонок', date: '2025-04-01T10:00:00' },
                    { id: 2, type: 'viewing', description: 'Показ студии', date: '2025-04-05T14:00:00' },
                    { id: 3, type: 'meeting', description: 'Подписание договора', date: '2025-04-10T11:00:00' },
                    { id: 4, type: 'note', description: 'Сделка закрыта, ключи переданы', date: '2025-04-20T00:00:00' }
                ],
                createdAt: '2025-04-01'
            },
            {
                id: 10, firstName: 'Татьяна', lastName: 'Морозова', phone: '+7 (999) 012-34-56', email: 'tatiana@example.com',
                type: 'tenant', budget: 40000, status: 'active', agentId: null,
                preferences: '2-комнатная квартира, с мебелью, недалеко от метро',
                notes: 'Переезд в июне',
                interestedProperties: [2, 14],
                history: [
                    { id: 1, type: 'call', description: 'Звонок о аренде', date: '2025-05-10T09:00:00' }
                ],
                createdAt: '2025-05-10'
            },
            {
                id: 11, firstName: 'Андрей', lastName: 'Белов', phone: '+7 (999) 123-45-67', email: 'andrey@example.com',
                type: 'buyer', budget: 22000000, status: 'active', agentId: null,
                preferences: 'Дом с участком, пригород, хорошая экология',
                notes: 'Рассматривает Новорижское и Рублево-Успенское шоссе',
                interestedProperties: [3, 12],
                history: [
                    { id: 1, type: 'call', description: 'Звонок о загородной недвижимости', date: '2025-05-11T15:00:00' }
                ],
                createdAt: '2025-05-11'
            },
            {
                id: 12, firstName: 'Наталья', lastName: 'Егорова', phone: '+7 (999) 234-56-78', email: 'natalia@example.com',
                type: 'buyer', budget: 9500000, status: 'active', agentId: null,
                preferences: '2-комнатная квартира, восточный район, рядом парк',
                notes: 'Есть собака, нужен выгул рядом',
                interestedProperties: [7, 14],
                history: [
                    { id: 1, type: 'call', description: 'Первичный звонок', date: '2025-05-12T11:00:00' }
                ],
                createdAt: '2025-05-12'
            },
            {
                id: 13, firstName: 'Владимир', lastName: 'Степанов', phone: '+7 (999) 345-67-89', email: 'vladimir@example.com',
                type: 'buyer', budget: 45000000, status: 'active', agentId: null,
                preferences: 'Коммерческая недвижимость, центр, высокий трафик',
                notes: 'Для открытия кафе',
                interestedProperties: [10, 13],
                history: [
                    { id: 1, type: 'call', description: 'Звонок о коммерческой недвижимости', date: '2025-05-13T14:00:00' }
                ],
                createdAt: '2025-05-13'
            },
            {
                id: 14, firstName: 'Елена', lastName: 'Михайлова', phone: '+7 (999) 456-78-90', email: 'elena@example.com',
                type: 'tenant', budget: 60000, status: 'inactive', agentId: null,
                preferences: '3-комнатная квартира, центр, для офиса',
                notes: 'Временно заморозила поиск',
                interestedProperties: [1, 6],
                history: [
                    { id: 1, type: 'call', description: 'Звонок о коммерческой аренде', date: '2025-04-15T12:00:00' },
                    { id: 2, type: 'note', description: 'Клиент приостановил поиск', date: '2025-04-20T00:00:00' }
                ],
                createdAt: '2025-04-15'
            },
            {
                id: 15, firstName: 'Максим', lastName: 'Федоров', phone: '+7 (999) 567-89-01', email: 'maxim@example.com',
                type: 'buyer', budget: 30000000, status: 'active', agentId: null,
                preferences: 'Престижная квартира, северный район, вид на город',
                notes: 'Рассматривает ЖК "Скандинавия"',
                interestedProperties: [15],
                history: [
                    { id: 1, type: 'call', description: 'Звонок о квартире в ЖК Скандинавия', date: '2025-05-14T10:00:00' }
                ],
                createdAt: '2025-05-14'
            }
        ];
    }

    loadClients() {
        const saved = localStorage.getItem('hermes_clients');
        if (saved) {
            this.clients = JSON.parse(saved);
        } else {
            this.clients = this.getDefaultClients();
            localStorage.setItem('hermes_clients', JSON.stringify(this.clients));
        }
        this.filteredClients = [...this.clients];
    }

    loadObjects() {
        const saved = localStorage.getItem('hermes_objects');
        if (saved) {
            this.objects = JSON.parse(saved);
        } else {
            this.objects = [];
        }
    }

    renderStats() {
        document.getElementById('statsGrid').innerHTML = `
            <div class="stat-card"><div class="stat-number">${this.clients.length}</div><div class="stat-label">Всего клиентов</div></div>
            <div class="stat-card"><div class="stat-number">${this.clients.filter(c => c.type === 'buyer').length}</div><div class="stat-label">Покупатели</div></div>
            <div class="stat-card"><div class="stat-number">${this.clients.filter(c => c.type === 'tenant').length}</div><div class="stat-label">Арендаторы</div></div>
            <div class="stat-card"><div class="stat-number">${this.clients.filter(c => c.status === 'active').length}</div><div class="stat-label">Активных</div></div>
        `;
    }

    setupEventListeners() {
        document.getElementById('searchClient').addEventListener('input', () => this.applyFilters());
        document.getElementById('filterType').addEventListener('change', () => this.applyFilters());
        document.getElementById('filterStatus').addEventListener('change', () => this.applyFilters());
        document.getElementById('filterBudget').addEventListener('input', () => this.applyFilters());
    }

    applyFilters() {
        const search = document.getElementById('searchClient').value.toLowerCase();
        const type = document.getElementById('filterType').value;
        const status = document.getElementById('filterStatus').value;
        const budget = parseInt(document.getElementById('filterBudget').value) || Infinity;

        this.filteredClients = this.clients.filter(client => {
            if (search && !`${client.firstName} ${client.lastName}`.toLowerCase().includes(search) && 
                !client.phone.includes(search) && !(client.email && client.email.toLowerCase().includes(search))) return false;
            if (type && client.type !== type) return false;
            if (status && client.status !== status) return false;
            if (budget !== Infinity && client.budget && client.budget > budget) return false;
            return true;
        });
        
        this.currentPage = 1;
        this.renderClients();
    }

    resetFilters() {
        document.getElementById('searchClient').value = '';
        document.getElementById('filterType').value = '';
        document.getElementById('filterStatus').value = '';
        document.getElementById('filterBudget').value = '';
        this.applyFilters();
    }

    renderClients() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const paginated = this.filteredClients.slice(start, start + this.itemsPerPage);
        const grid = document.getElementById('clientsGrid');
        
        if (paginated.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:40px;">Нет клиентов</div>';
            this.renderPagination();
            return;
        }

        grid.innerHTML = paginated.map(client => this.createClientCard(client)).join('');
        this.renderPagination();
    }

    createClientCard(client) {
        const typeText = client.type === 'buyer' ? 'Покупатель' : 'Арендатор';
        const typeIcon = client.type === 'buyer' ? 'fa-shopping-cart' : 'fa-key';
        const statusText = { active: 'Активный', inactive: 'Неактивный', completed: 'Сделка завершена' };
        
        const interestedProps = (client.interestedProperties || []);
        const interestedHTML = interestedProps.length > 0 ? `
            <div class="interested-properties">
                <div class="interested-title">Интересуется:</div>
                ${interestedProps.map(propId => {
                    const prop = this.objects.find(p => p.id === propId);
                    return prop ? `<span class="property-tag" onclick="clientManager.viewProperty(${prop.id})">${prop.title}</span>` : '';
                }).join('')}
            </div>
        ` : '';

        const lastHistory = (client.history || []).slice(-2).reverse();
        const historyHTML = lastHistory.length > 0 ? `
            <div class="interested-properties">
                <div class="interested-title">Последние действия:</div>
                ${lastHistory.map(h => `<div class="info-row"><i class="fas ${h.type === 'call' ? 'fa-phone' : h.type === 'meeting' ? 'fa-handshake' : h.type === 'viewing' ? 'fa-building' : 'fa-sticky-note'}"></i> <span>${h.description.substring(0, 50)}...</span></div>`).join('')}
            </div>
        ` : '';

        return `
            <div class="client-card">
                <div class="client-header">
                    <div class="client-avatar">${client.firstName.charAt(0)}${client.lastName.charAt(0)}</div>
                    <div class="client-name">${client.firstName} ${client.lastName}</div>
                    <span class="client-type"><i class="fas ${typeIcon}"></i> ${typeText} • ${statusText[client.status]}</span>
                </div>
                <div class="client-body">
                    <div class="client-info">
                        <div class="info-row"><i class="fas fa-phone"></i> ${client.phone}</div>
                        ${client.email ? `<div class="info-row"><i class="fas fa-envelope"></i> ${client.email}</div>` : ''}
                        ${client.budget ? `<div class="info-row"><i class="fas fa-ruble-sign"></i> Бюджет: ${this.formatPrice(client.budget)}</div>` : ''}
                        ${client.preferences ? `<div class="info-row"><i class="fas fa-heart"></i> ${client.preferences}</div>` : ''}
                    </div>
                    ${interestedHTML}
                    ${historyHTML}
                </div>
                <div class="client-footer">
                    <button class="btn btn-sm btn-secondary" onclick="clientManager.openHistoryModal(${client.id})"><i class="fas fa-history"></i> История</button>
                    <button class="btn btn-sm btn-primary" onclick="clientManager.openScheduleModal(${client.id})"><i class="fas fa-calendar-plus"></i> Показ</button>
                    <button class="btn btn-sm btn-primary" onclick="clientManager.openInterestedModal(${client.id})"><i class="fas fa-heart"></i> Объекты</button>
                    <div class="action-buttons" style="margin-left: auto;">
                        <button class="icon-btn edit" onclick="clientManager.openClientModal(${client.id})"><i class="fas fa-edit"></i></button>
                        <button class="icon-btn delete" onclick="clientManager.deleteClient(${client.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredClients.length / this.itemsPerPage);
        const container = document.getElementById('pagination');
        if (totalPages <= 1) { container.innerHTML = ''; return; }
        
        let html = '';
        for (let i = 1; i <= Math.min(totalPages, 5); i++) {
            html += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" onclick="clientManager.goToPage(${i})">${i}</button>`;
        }
        container.innerHTML = html;
    }

    goToPage(page) { this.currentPage = page; this.renderClients(); }

    openClientModal(id = null) {
        if (id) {
            const client = this.clients.find(c => c.id === id);
            if (client) {
                document.getElementById('clientModalTitle').textContent = 'Редактирование клиента';
                document.getElementById('clientId').value = client.id;
                document.getElementById('clientFirstName').value = client.firstName;
                document.getElementById('clientLastName').value = client.lastName;
                document.getElementById('clientPhone').value = client.phone;
                document.getElementById('clientEmail').value = client.email || '';
                document.getElementById('clientType').value = client.type;
                document.getElementById('clientBudget').value = client.budget || '';
                document.getElementById('clientPreferences').value = client.preferences || '';
                document.getElementById('clientNotes').value = client.notes || '';
            }
        } else {
            document.getElementById('clientModalTitle').textContent = 'Добавление клиента';
            document.getElementById('clientForm').reset();
            document.getElementById('clientId').value = '';
        }
        document.getElementById('clientModal').classList.add('active');
    }

    saveClient() {
        const id = document.getElementById('clientId').value;
        const clientData = {
            id: id ? parseInt(id) : Date.now(),
            firstName: document.getElementById('clientFirstName').value,
            lastName: document.getElementById('clientLastName').value,
            phone: document.getElementById('clientPhone').value,
            email: document.getElementById('clientEmail').value,
            type: document.getElementById('clientType').value,
            budget: parseInt(document.getElementById('clientBudget').value) || null,
            preferences: document.getElementById('clientPreferences').value,
            notes: document.getElementById('clientNotes').value,
            status: 'active',
            interestedProperties: [],
            history: [],
            createdAt: new Date().toISOString().split('T')[0]
        };

        if (id) {
            const index = this.clients.findIndex(c => c.id === parseInt(id));
            clientData.history = this.clients[index].history;
            clientData.interestedProperties = this.clients[index].interestedProperties;
            this.clients[index] = clientData;
        } else {
            this.clients.unshift(clientData);
        }

        localStorage.setItem('hermes_clients', JSON.stringify(this.clients));
        this.loadClients();
        this.renderStats();
        this.renderClients();
        this.closeClientModal();
        this.showNotification(id ? 'Клиент обновлен' : 'Клиент добавлен', 'success');
    }

    deleteClient(id) {
        if (confirm('Удалить клиента? Все данные будут потеряны.')) {
            this.clients = this.clients.filter(c => c.id !== id);
            localStorage.setItem('hermes_clients', JSON.stringify(this.clients));
            this.loadClients();
            this.renderStats();
            this.renderClients();
            this.showNotification('Клиент удален', 'warning');
        }
    }

    openHistoryModal(clientId) {
        const client = this.clients.find(c => c.id === clientId);
        if (client) {
            const historyList = document.getElementById('historyModal').querySelector('.history-list') || 
                (() => { const div = document.createElement('div'); div.className = 'history-list'; document.getElementById('historyModal').querySelector('.modal-body').prepend(div); return div; })();
            
            historyList.innerHTML = (client.history || []).map(h => `
                <div class="history-item">
                    <div class="history-icon ${h.type}"><i class="fas ${h.type === 'call' ? 'fa-phone' : h.type === 'meeting' ? 'fa-handshake' : h.type === 'viewing' ? 'fa-building' : 'fa-sticky-note'}"></i></div>
                    <div class="history-content">
                        <div class="history-text">${h.description}</div>
                        <div class="history-date">${new Date(h.date).toLocaleString()}</div>
                    </div>
                </div>
            `).join('');
            
            document.getElementById('historyClientId').value = clientId;
            document.getElementById('historyModal').classList.add('active');
        }
    }

    addHistory() {
        const clientId = parseInt(document.getElementById('historyClientId').value);
        const type = document.getElementById('historyType').value;
        const description = document.getElementById('historyDescription').value;
        
        if (!description) { this.showNotification('Введите описание', 'error'); return; }
        
        const client = this.clients.find(c => c.id === clientId);
        if (client) {
            if (!client.history) client.history = [];
            client.history.push({
                id: Date.now(),
                type: type,
                description: description,
                date: new Date().toISOString()
            });
            localStorage.setItem('hermes_clients', JSON.stringify(this.clients));
            this.loadClients();
            this.renderClients();
            this.closeHistoryModal();
            this.showNotification('Запись добавлена', 'success');
        }
    }

    openInterestedModal(clientId) {
        const client = this.clients.find(c => c.id === clientId);
        if (client) {
            const availableProps = this.objects.filter(p => p.status === 'available');
            const propList = availableProps.map(p => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid var(--border-color);">
                    <span>${p.title} - ${this.formatPrice(p.price)}</span>
                    <button class="btn btn-sm ${client.interestedProperties?.includes(p.id) ? 'btn-danger' : 'btn-primary'}" 
                        onclick="clientManager.toggleInterest(${client.id}, ${p.id})">
                        ${client.interestedProperties?.includes(p.id) ? 'Удалить' : 'Добавить'}
                    </button>
                </div>
            `).join('');
            
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.style.display = 'flex';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header"><h3>Интересующие объекты - ${client.firstName} ${client.lastName}</h3><button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button></div>
                    <div class="modal-body">${propList || '<p>Нет доступных объектов</p>'}</div>
                    <div class="modal-footer"><button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Закрыть</button></div>
                </div>
            `;
            document.body.appendChild(modal);
        }
    }

    toggleInterest(clientId, propertyId) {
        const client = this.clients.find(c => c.id === clientId);
        if (client) {
            if (!client.interestedProperties) client.interestedProperties = [];
            const index = client.interestedProperties.indexOf(propertyId);
            if (index === -1) {
                client.interestedProperties.push(propertyId);
                this.showNotification('Объект добавлен в интересующие', 'success');
            } else {
                client.interestedProperties.splice(index, 1);
                this.showNotification('Объект удален из интересующих', 'info');
            }
            localStorage.setItem('hermes_clients', JSON.stringify(this.clients));
            this.loadClients();
            this.renderClients();
            this.openInterestedModal(clientId);
        }
    }

    openScheduleModal(clientId) {
        const client = this.clients.find(c => c.id === clientId);
        if (client) {
            const availableProps = this.objects.filter(p => p.status === 'available');
            const propOptions = availableProps.map(p => `<option value="${p.id}">${p.title}</option>`).join('');
            
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.style.display = 'flex';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 450px;">
                    <div class="modal-header"><h3>Запланировать показ - ${client.firstName} ${client.lastName}</h3><button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button></div>
                    <div class="modal-body">
                        <div class="form-group"><label>Объект</label><select id="schedulePropertyId">${propOptions}</select></div>
                        <div class="form-row"><div class="form-group"><label>Дата</label><input type="date" id="scheduleDate" value="${new Date().toISOString().split('T')[0]}"></div>
                        <div class="form-group"><label>Время</label><input type="time" id="scheduleTime" value="14:00"></div></div>
                        <div class="form-group"><label>Заметки</label><textarea id="scheduleNotes" rows="2"></textarea></div>
                    </div>
                    <div class="modal-footer"><button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Отмена</button><button class="btn btn-primary" onclick="clientManager.createSchedule(${client.id}, this.closest('.modal'))">Запланировать</button></div>
                </div>
            `;
            document.body.appendChild(modal);
        }
    }

    createSchedule(clientId, modal) {
        const propertyId = parseInt(modal.querySelector('#schedulePropertyId').value);
        const date = modal.querySelector('#scheduleDate').value;
        const time = modal.querySelector('#scheduleTime').value;
        const notes = modal.querySelector('#scheduleNotes').value;
        
        const client = this.clients.find(c => c.id === clientId);
        const property = this.objects.find(p => p.id === propertyId);
        
        if (client && property) {
            if (!client.history) client.history = [];
            client.history.push({
                id: Date.now(),
                type: 'viewing',
                description: `Запланирован показ объекта "${property.title}" на ${date} в ${time}. ${notes}`,
                date: new Date().toISOString()
            });
            
            if (!client.interestedProperties.includes(propertyId)) {
                client.interestedProperties.push(propertyId);
            }
            
            localStorage.setItem('hermes_clients', JSON.stringify(this.clients));
            this.loadClients();
            this.renderClients();
            modal.remove();
            this.showNotification(`Показ на ${date} в ${time} запланирован`, 'success');
        }
    }

    viewProperty(id) { window.location.href = `apartment-detail.html?id=${id}`; }

    closeClientModal() { document.getElementById('clientModal').classList.remove('active'); }
    closeHistoryModal() { 
        document.getElementById('historyModal').classList.remove('active');
        document.getElementById('historyDescription').value = '';
        const historyList = document.querySelector('#historyModal .history-list');
        if (historyList) historyList.remove();
    }

    formatPrice(price) { return new Intl.NumberFormat('ru-RU').format(price) + ' ₽'; }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `position:fixed; bottom:20px; right:20px; background:var(--bg-primary); padding:12px 20px; border-radius:10px; box-shadow:0 4px 15px rgba(0,0,0,0.2); z-index:10001; border-left:4px solid ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#f39c12'}; animation:slideIn 0.3s ease;`;
        notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}" style="margin-right:8px;"></i> ${message}`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    updateAuthUI() {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const authSection = document.getElementById('authSection');
        if (authSection) {
            if (user) {
                authSection.innerHTML = `<div class="user-menu"><div class="user-avatar">${user.firstName?.charAt(0)}</div></div>`;
            } else {
                authSection.innerHTML = '<a href="login.html" class="auth-btn auth-login">Войти</a><a href="register.html" class="auth-btn auth-register">Регистрация</a>';
            }
        }
    }
}

let clientManager;
document.addEventListener('DOMContentLoaded', () => {
    clientManager = new ClientManager();
    window.clientManager = clientManager;
    window.openClientModal = (id) => clientManager.openClientModal(id);
    window.closeClientModal = () => clientManager.closeClientModal();
    window.saveClient = () => clientManager.saveClient();
    window.openHistoryModal = (id) => clientManager.openHistoryModal(id);
    window.closeHistoryModal = () => clientManager.closeHistoryModal();
    window.addHistory = () => clientManager.addHistory();
    window.applyFilters = () => clientManager.applyFilters();
    window.resetFilters = () => clientManager.resetFilters();
});