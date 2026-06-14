// calendar.js - Календарь показов с 15 событиями и таблицей

class CalendarManager {
    constructor() {
        this.events = [];
        this.clients = [];
        this.properties = [];
        this.currentUser = null;
        this.calendar = null;
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        this.currentUser = AuthService.getCurrentUser();
        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }
        this.loadData();
        this.initCalendar();
        this.renderStats();
        this.renderShowingsTable();
        this.loadSelects();
        this.updateAuthUI();
    }

    // 15 готовых показов
    getDefaultEvents() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return [
            { id: 1, clientId: 1, clientName: 'Иван Петров', clientPhone: '+7 (999) 123-45-67', propertyId: 1, propertyTitle: '3-комнатная квартира в центре', propertyAddress: 'ул. Тверская, 15', date: this.formatDate(today), time: '10:00', duration: 60, notes: 'Клиент хочет посмотреть квартиру с панорамными окнами', status: 'scheduled', notified: false },
            { id: 2, clientId: 2, clientName: 'Мария Иванова', clientPhone: '+7 (999) 234-56-78', propertyId: 4, propertyTitle: 'Студия в новостройке', propertyAddress: 'ул. Южная, 8', date: this.formatDate(today), time: '12:00', duration: 30, notes: 'Студия в новостройке, клиент хочет срочно посмотреть', status: 'scheduled', notified: false },
            { id: 3, clientId: 3, clientName: 'Алексей Сидоров', clientPhone: '+7 (999) 345-67-89', propertyId: 3, propertyTitle: 'Загородный дом с участком', propertyAddress: 'Новорижское шоссе, 25 км', date: this.formatDate(tomorrow), time: '11:00', duration: 90, notes: 'Осмотр дома с участком, семья с детьми', status: 'scheduled', notified: false },
            { id: 4, clientId: 4, clientName: 'Екатерина Козлова', clientPhone: '+7 (999) 456-78-90', propertyId: 7, propertyTitle: '1-комнатная квартира у метро', propertyAddress: 'ул. Первомайская, 34', date: this.formatDate(tomorrow), time: '15:00', duration: 60, notes: 'Квартира у метро, важна транспортная доступность', status: 'scheduled', notified: false },
            { id: 5, clientId: 5, clientName: 'Дмитрий Морозов', clientPhone: '+7 (999) 567-89-01', propertyId: 6, propertyTitle: 'Элитная квартира с видом на Москву-реку', propertyAddress: 'наб. Тараса Шевченко, 2', date: this.formatDate(tomorrow), time: '17:00', duration: 60, notes: 'Элитная квартира, важна отделка', status: 'scheduled', notified: false },
            { id: 6, clientId: 6, clientName: 'Анна Соколова', clientPhone: '+7 (999) 678-90-12', propertyId: 7, propertyTitle: '1-комнатная квартира у метро', propertyAddress: 'ул. Первомайская, 34', date: '2025-05-20', time: '11:00', duration: 30, notes: 'Студентка, нужна квартира с мебелью', status: 'scheduled', notified: false },
            { id: 7, clientId: 7, clientName: 'Сергей Волков', clientPhone: '+7 (999) 789-01-23', propertyId: 2, propertyTitle: '2-комнатная квартира в спальном районе', propertyAddress: 'ул. Академика Королева, 12', date: '2025-05-21', time: '14:00', duration: 60, notes: 'Семья, нужна квартира рядом с парком', status: 'scheduled', notified: false },
            { id: 8, clientId: 8, clientName: 'Ольга Новикова', clientPhone: '+7 (999) 890-12-34', propertyId: 5, propertyTitle: 'Таунхаус в эко-поселке', propertyAddress: 'Рублево-Успенское шоссе', date: '2025-05-22', time: '11:00', duration: 90, notes: 'Осмотр таунхауса, закрытая территория', status: 'scheduled', notified: false },
            { id: 9, clientId: 9, clientName: 'Павел Кузнецов', clientPhone: '+7 (999) 901-23-45', propertyId: 4, propertyTitle: 'Студия в новостройке', propertyAddress: 'ул. Южная, 8', date: '2025-05-15', time: '16:00', duration: 30, notes: 'Показ проведен, клиент доволен', status: 'completed', notified: true },
            { id: 10, clientId: 10, clientName: 'Татьяна Морозова', clientPhone: '+7 (999) 012-34-56', propertyId: 2, propertyTitle: '2-комнатная квартира в спальном районе', propertyAddress: 'ул. Академика Королева, 12', date: '2025-05-23', time: '10:00', duration: 60, notes: 'Аренда на длительный срок', status: 'scheduled', notified: false },
            { id: 11, clientId: 11, clientName: 'Андрей Белов', clientPhone: '+7 (999) 123-45-67', propertyId: 12, propertyTitle: 'Семейный дом с садом', propertyAddress: 'Можайское шоссе, 30 км', date: '2025-05-24', time: '12:00', duration: 90, notes: 'Осмотр дома для большой семьи', status: 'scheduled', notified: false },
            { id: 12, clientId: 12, clientName: 'Наталья Егорова', clientPhone: '+7 (999) 234-56-78', propertyId: 14, propertyTitle: 'Квартира рядом с парком', propertyAddress: 'ул. Дорожная, 22', date: '2025-05-25', time: '15:00', duration: 60, notes: 'Квартира рядом с парком, важна экология', status: 'scheduled', notified: false },
            { id: 13, clientId: 13, clientName: 'Владимир Степанов', clientPhone: '+7 (999) 345-67-89', propertyId: 10, propertyTitle: 'Коммерческое помещение на 1 этаже', propertyAddress: 'ул. Арбат, 25', date: '2025-05-26', time: '11:00', duration: 60, notes: 'Коммерческое помещение для кафе', status: 'scheduled', notified: false },
            { id: 14, clientId: 14, clientName: 'Елена Михайлова', clientPhone: '+7 (999) 456-78-90', propertyId: 1, propertyTitle: '3-комнатная квартира в центре', propertyAddress: 'ул. Тверская, 15', date: '2025-05-10', time: '14:00', duration: 60, notes: 'Клиент отменил показ', status: 'cancelled', notified: true },
            { id: 15, clientId: 15, clientName: 'Максим Федоров', clientPhone: '+7 (999) 567-89-01', propertyId: 15, propertyTitle: 'Престижная квартира в ЖК Скандинавия', propertyAddress: 'ул. Фестивальная, 45', date: '2025-05-27', time: '16:00', duration: 60, notes: 'Престижная квартира в ЖК Скандинавия', status: 'scheduled', notified: false }
        ];
    }

    formatDate(date) {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    }

    loadData() {
        const savedEvents = localStorage.getItem('hermes_calendar_events');
        if (savedEvents) {
            this.events = JSON.parse(savedEvents);
        } else {
            this.events = this.getDefaultEvents();
            localStorage.setItem('hermes_calendar_events', JSON.stringify(this.events));
        }
        
        const savedClients = localStorage.getItem('hermes_clients');
        this.clients = savedClients ? JSON.parse(savedClients) : [];
        const savedObjects = localStorage.getItem('hermes_objects');
        this.properties = savedObjects ? JSON.parse(savedObjects) : [];
    }

    initCalendar() {
        const calendarEl = document.getElementById('calendar');
        this.calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'timeGridWeek',
            locale: 'ru',
            headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' },
            events: this.getCalendarEvents(),
            eventClick: (info) => this.viewEventDetail(parseInt(info.event.id)),
            slotMinTime: '08:00:00',
            slotMaxTime: '21:00:00'
        });
        this.calendar.render();
    }

    getCalendarEvents() {
        return this.events.map(e => {
            let color = '#3498db';
            if (e.status === 'completed') color = '#27ae60';
            if (e.status === 'cancelled') color = '#95a5a6';
            return {
                id: String(e.id),
                title: `${e.clientName} - ${e.propertyTitle}`,
                start: `${e.date}T${e.time}`,
                backgroundColor: color,
                extendedProps: { event: e }
            };
        });
    }

    renderStats() {
        const today = new Date().toISOString().split('T')[0];
        const scheduled = this.events.filter(e => e.status === 'scheduled').length;
        const completed = this.events.filter(e => e.status === 'completed').length;
        const cancelled = this.events.filter(e => e.status === 'cancelled').length;
        const upcoming = this.events.filter(e => e.date >= today && e.status === 'scheduled').length;
        
        document.getElementById('statsGrid').innerHTML = `
            <div class="stat-card" onclick="filterShowings('all')"><div class="stat-number">${this.events.length}</div><div class="stat-label">Всего показов</div></div>
            <div class="stat-card" onclick="filterShowings('scheduled')"><div class="stat-number">${scheduled}</div><div class="stat-label">Запланированных</div></div>
            <div class="stat-card" onclick="filterShowings('completed')"><div class="stat-number">${completed}</div><div class="stat-label">Завершенных</div></div>
            <div class="stat-card" onclick="filterShowings('cancelled')"><div class="stat-number">${cancelled}</div><div class="stat-label">Отмененных</div></div>
            <div class="stat-card" onclick="filterShowings('upcoming')"><div class="stat-number">${upcoming}</div><div class="stat-label">Предстоящих</div></div>
        `;
    }

    renderShowingsTable() {
        const tbody = document.getElementById('showingsTableBody');
        let filtered = [...this.events];
        
        // Применяем фильтр
        if (this.currentFilter !== 'all') {
            if (this.currentFilter === 'upcoming') {
                const today = new Date().toISOString().split('T')[0];
                filtered = filtered.filter(e => e.date >= today && e.status === 'scheduled');
            } else {
                filtered = filtered.filter(e => e.status === this.currentFilter);
            }
        }
        
        // Сортировка по дате
        filtered.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
        
        const statusText = { scheduled: 'Запланирован', completed: 'Завершен', cancelled: 'Отменен' };
        
        tbody.innerHTML = filtered.map(e => `
            <tr onclick="calendarManager.viewEventDetail(${e.id})" style="cursor:pointer;">
                <td>${e.id}</td>
                <td>${e.date}</td>
                <td>${e.time}</td>
                <td><span class="badge badge-client">${e.clientName}</span></td>
                <td>${e.clientPhone}</td>
                <td><span class="badge badge-property">${e.propertyTitle}</span></td>
                <td>${e.propertyAddress}</td>
                <td><span class="event-status status-${e.status}">${statusText[e.status]}</span></td>
            </tr>
        `).join('');
    }

    filterShowings(filter) {
        this.currentFilter = filter;
        this.renderShowingsTable();
        
        // Обновляем активный стиль на кнопках
        document.querySelectorAll('.section-header .btn-sm').forEach(btn => {
            btn.style.opacity = btn.innerText.includes(this.getFilterText(filter)) ? '1' : '0.6';
        });
    }

    getFilterText(filter) {
        const map = { all: 'Все', scheduled: 'Запланированные', completed: 'Завершенные', cancelled: 'Отмененные', upcoming: 'Предстоящие' };
        return map[filter];
    }

    filterShowingsList() {
        const search = document.getElementById('searchShowing').value.toLowerCase();
        const status = document.getElementById('filterShowingStatus').value;
        const tbody = document.getElementById('showingsTableBody');
        
        let filtered = [...this.events];
        
        if (status !== 'all') {
            filtered = filtered.filter(e => e.status === status);
        }
        
        if (search) {
            filtered = filtered.filter(e => 
                e.clientName.toLowerCase().includes(search) || 
                e.propertyTitle.toLowerCase().includes(search) ||
                e.propertyAddress.toLowerCase().includes(search)
            );
        }
        
        filtered.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
        
        const statusText = { scheduled: 'Запланирован', completed: 'Завершен', cancelled: 'Отменен' };
        
        tbody.innerHTML = filtered.map(e => `
            <tr onclick="calendarManager.viewEventDetail(${e.id})" style="cursor:pointer;">
                <td>${e.id}</td><td>${e.date}</td><td>${e.time}</td>
                <td><span class="badge badge-client">${e.clientName}</span></td><td>${e.clientPhone}</td>
                <td><span class="badge badge-property">${e.propertyTitle}</span></td>
                <td>${e.propertyAddress}</td>
                <td><span class="event-status status-${e.status}">${statusText[e.status]}</span></td>
            </tr>
        `).join('');
    }

    loadSelects() {
        const clientSelect = document.getElementById('eventClientId');
        const propertySelect = document.getElementById('eventPropertyId');
        
        clientSelect.innerHTML = '<option value="">Выберите клиента</option>' + 
            (this.clients.length ? this.clients.map(c => `<option value="${c.id}">${c.firstName} ${c.lastName} (${c.phone})</option>`).join('') : '<option value="">Нет клиентов</option>');
        
        propertySelect.innerHTML = '<option value="">Выберите объект</option>' + 
            (this.properties.length ? this.properties.map(p => `<option value="${p.id}">${p.title}</option>`).join('') : '<option value="">Нет объектов</option>');
    }

    openEventModal(eventId = null) {
        if (eventId) {
            const event = this.events.find(e => e.id === eventId);
            if (event) {
                document.getElementById('modalTitle').textContent = 'Редактирование показа';
                document.getElementById('eventId').value = event.id;
                document.getElementById('eventClientId').value = event.clientId;
                document.getElementById('eventPropertyId').value = event.propertyId;
                document.getElementById('eventDate').value = event.date;
                document.getElementById('eventTime').value = event.time;
                document.getElementById('eventDuration').value = event.duration;
                document.getElementById('eventNotes').value = event.notes || '';
            }
        } else {
            document.getElementById('modalTitle').textContent = 'Запланировать показ';
            document.getElementById('eventForm').reset();
            document.getElementById('eventId').value = '';
            document.getElementById('eventDate').value = new Date().toISOString().split('T')[0];
            document.getElementById('eventTime').value = '12:00';
        }
        document.getElementById('eventModal').classList.add('active');
    }

    saveEvent() {
        const id = document.getElementById('eventId').value;
        const clientId = parseInt(document.getElementById('eventClientId').value);
        const propertyId = parseInt(document.getElementById('eventPropertyId').value);
        const date = document.getElementById('eventDate').value;
        const time = document.getElementById('eventTime').value;
        const duration = parseInt(document.getElementById('eventDuration').value);
        
        if (!clientId || !propertyId || !date || !time) {
            alert('Заполните все поля');
            return;
        }
        
        const client = this.clients.find(c => c.id === clientId);
        const property = this.properties.find(p => p.id === propertyId);
        
        const eventData = {
            id: id ? parseInt(id) : Date.now(),
            clientId, clientName: client ? `${client.firstName} ${client.lastName}` : '',
            clientPhone: client?.phone || '', propertyId, propertyTitle: property?.title || '',
            propertyAddress: property?.address || '', date, time, duration,
            notes: document.getElementById('eventNotes').value, status: 'scheduled', notified: false
        };
        
        if (id) {
            const index = this.events.findIndex(e => e.id === parseInt(id));
            this.events[index] = { ...this.events[index], ...eventData };
        } else {
            this.events.push(eventData);
        }
        
        localStorage.setItem('hermes_calendar_events', JSON.stringify(this.events));
        this.calendar.refetchEvents();
        this.renderStats();
        this.renderShowingsTable();
        this.closeEventModal();
        alert(id ? 'Показ обновлен' : 'Показ запланирован');
    }

    viewEventDetail(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;
        
        const statusText = { scheduled: 'Запланирован', completed: 'Завершен', cancelled: 'Отменен' };
        
        document.getElementById('detailModalBody').innerHTML = `
            <div style="margin-bottom:1rem;"><strong>Клиент:</strong> ${event.clientName}<br><small><i class="fas fa-phone"></i> ${event.clientPhone}</small></div>
            <div style="margin-bottom:1rem;"><strong>Объект:</strong> ${event.propertyTitle}<br><small><i class="fas fa-map-marker-alt"></i> ${event.propertyAddress}</small></div>
            <div style="margin-bottom:1rem;"><strong>Дата и время:</strong> ${event.date} в ${event.time} (${event.duration} мин)</div>
            <div style="margin-bottom:1rem;"><strong>Статус:</strong> <span class="event-status status-${event.status}">${statusText[event.status]}</span></div>
            ${event.notes ? `<div><strong>Заметки:</strong> ${event.notes}</div>` : ''}
        `;
        
        const cancelBtn = document.getElementById('cancelEventBtn');
        const completeBtn = document.getElementById('completeEventBtn');
        
        if (event.status === 'scheduled') {
            cancelBtn.style.display = 'block';
            completeBtn.style.display = 'block';
            cancelBtn.onclick = () => { this.updateEventStatus(event.id, 'cancelled'); this.closeDetailModal(); };
            completeBtn.onclick = () => { this.updateEventStatus(event.id, 'completed'); this.closeDetailModal(); };
        } else {
            cancelBtn.style.display = 'none';
            completeBtn.style.display = 'none';
        }
        
        document.getElementById('detailModal').classList.add('active');
    }

    updateEventStatus(eventId, status) {
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            event.status = status;
            localStorage.setItem('hermes_calendar_events', JSON.stringify(this.events));
            this.calendar.refetchEvents();
            this.renderStats();
            this.renderShowingsTable();
            alert(status === 'completed' ? 'Показ завершен' : 'Показ отменен');
        }
    }

    closeEventModal() { document.getElementById('eventModal').classList.remove('active'); }
    closeDetailModal() { document.getElementById('detailModal').classList.remove('active'); }

    updateAuthUI() {
        const user = AuthService.getCurrentUser();
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

function exportShowings() {
    const data = calendarManager.events.map(e => ({
        ID: e.id, Клиент: e.clientName, Телефон: e.clientPhone, Объект: e.propertyTitle,
        Адрес: e.propertyAddress, Дата: e.date, Время: e.time, Статус: e.status
    }));
    const csv = ['ID,Клиент,Телефон,Объект,Адрес,Дата,Время,Статус', 
        ...data.map(d => `${d.ID},"${d.Клиент}","${d.Телефон}","${d.Объект}","${d.Адрес}",${d.Дата},${d.Время},${d.Статус}`)
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `showings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    alert('Экспорт завершен');
}

function filterShowings(filter) {
    calendarManager.filterShowings(filter);
}

function filterShowingsList() {
    calendarManager.filterShowingsList();
}

let calendarManager;
document.addEventListener('DOMContentLoaded', () => {
    calendarManager = new CalendarManager();
    window.calendarManager = calendarManager;
    window.openEventModal = (id) => calendarManager.openEventModal(id);
    window.closeEventModal = () => calendarManager.closeEventModal();
    window.closeDetailModal = () => calendarManager.closeDetailModal();
    window.saveEvent = () => calendarManager.saveEvent();
    window.filterShowings = filterShowings;
    window.filterShowingsList = filterShowingsList;
    window.exportShowings = exportShowings;
});