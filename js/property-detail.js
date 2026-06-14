// property-detail.js - Карточка объекта с раскрывающимися блоками

class PropertyDetail {
    constructor() {
        this.property = null;
        this.currentUser = null;
        this.showings = [];
        this.photos = [];
        this.documents = [];
        this.notes = [];
        this.init();
    }

    async init() {
        this.currentUser = AuthService.getCurrentUser();
        const urlParams = new URLSearchParams(window.location.search);
        const propertyId = parseInt(urlParams.get('id'));
        if (!propertyId) { window.location.href = 'catalog.html'; return; }
        this.loadProperty(propertyId);
        this.loadAdditionalData(propertyId);
        this.render();
        this.updateAuthUI();
    }

    loadProperty(id) {
        const properties = database.getProperties();
        this.property = properties.find(p => p.id === id);
        if (!this.property) { window.location.href = 'catalog.html'; return; }
        document.title = `${this.property.title} - Гермес`;
        document.getElementById('breadcrumbTitle').textContent = this.property.title;
    }

    loadAdditionalData(propertyId) {
        const savedShowings = localStorage.getItem('hermes_showings');
        this.showings = savedShowings ? JSON.parse(savedShowings).filter(s => s.propertyId === propertyId) : this.getDefaultShowings(propertyId);
        const savedDocs = localStorage.getItem(`property_docs_${propertyId}`);
        this.documents = savedDocs ? JSON.parse(savedDocs) : [];
        const savedNotes = localStorage.getItem(`property_notes_${propertyId}`);
        this.notes = savedNotes ? JSON.parse(savedNotes) : [];
        const savedPhotos = localStorage.getItem(`property_photos_${propertyId}`);
        this.photos = savedPhotos ? JSON.parse(savedPhotos) : (this.property.image ? [this.property.image] : []);
    }

    getDefaultShowings(propertyId) {
        return [
            { id: 1, clientId: 1, clientName: 'Иван Петров', date: '2025-05-10', time: '14:00', status: 'completed', notes: 'Клиенту понравилось' },
            { id: 2, clientId: 2, clientName: 'Мария Иванова', date: '2025-05-15', time: '11:00', status: 'scheduled', notes: 'Будет семья' }
        ].filter(s => s.clientId === propertyId);
    }

    render() {
        this.renderHeader();
        this.renderAccordions();
        if (this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.role === 'agent')) this.renderAgentActions();
    }

    renderHeader() {
        const statusMap = { available: 'В продаже', rent: 'В аренде', booked: 'Забронирован', sold: 'Продан' };
        const statusClass = this.property.status === 'available' ? 'sale' : this.property.status;
        document.getElementById('propertyHeader').innerHTML = `
            <div class="property-title"><span>${this.property.title}</span><span class="property-price">${this.formatPrice(this.property.price)}</span></div>
            <div class="property-address"><i class="fas fa-map-marker-alt"></i> ${this.property.address || this.property.location}</div>
            <div><span class="status-badge status-${statusClass === 'available' ? 'sale' : statusClass}">${statusMap[this.property.status] || 'В продаже'}</span></div>
        `;
    }

    renderAccordions() {
        const container = document.getElementById('accordionContainer');
        container.innerHTML = `
            ${this.renderAccordion('Характеристики', 'chars', this.renderChars())}
            ${this.renderAccordion('Фотографии', 'photos', this.renderPhotos())}
            ${this.renderAccordion('История показов', 'showings', this.renderShowings())}
            ${this.renderAccordion('Документы', 'docs', this.renderDocs())}
            ${this.renderAccordion('Заметки', 'notes', this.renderNotes())}
        `;
        document.querySelectorAll('.accordion-header').forEach(header => { header.addEventListener('click', () => this.toggleAccordion(header)); });
    }

    renderAccordion(title, id, content) { return `<div class="accordion-section"><div class="accordion-header" data-id="${id}"><h3><i class="fas ${this.getIconForSection(id)}"></i> ${title}</h3><i class="fas fa-chevron-down"></i></div><div class="accordion-body" id="accordion-${id}">${content}</div></div>`; }
    getIconForSection(id) { const icons = { chars: 'fa-info-circle', photos: 'fa-images', showings: 'fa-calendar-alt', docs: 'fa-file-alt', notes: 'fa-sticky-note' }; return icons[id]; }
    toggleAccordion(header) { const body = document.getElementById(`accordion-${header.dataset.id}`); header.classList.toggle('open'); body.classList.toggle('open'); }

    renderChars() { return `<div class="chars-grid">${Object.entries({ 'Тип': this.getTypeName(), 'Площадь': `${this.property.area} м²`, 'Комнат': this.property.rooms === 0 ? 'Студия' : `${this.property.rooms} комн.`, 'Район': this.getDistrictName(), 'Агент': this.getAgentName() }).map(([k,v]) => `<div class="char-item"><span class="char-label">${k}:</span><span class="char-value">${v}</span></div>`).join('')}</div>`; }
    getTypeName() { const types = { apartment: 'Квартира', house: 'Дом', commercial: 'Коммерческая', land: 'Участок' }; return types[this.property.type] || 'Квартира'; }
    getDistrictName() { const districts = { central: 'Центральный', north: 'Северный', south: 'Южный', east: 'Восточный', west: 'Западный', suburb: 'Пригород' }; return districts[this.property.district] || this.property.district; }
    getAgentName() { const users = JSON.parse(localStorage.getItem('hermes_users')) || []; const agent = users.find(u => u.id === this.property.agentId); return agent ? `${agent.firstName} ${agent.lastName}` : 'Не назначен'; }

    renderPhotos() { return `<div class="gallery-grid" id="photosGrid">${this.photos.map((p,i) => `<div class="gallery-item"><img src="${p}" alt="Фото ${i+1}" onclick="openLightbox('${p}')">${(this.currentUser?.role === 'admin' || this.currentUser?.role === 'agent') ? `<div class="delete-photo" onclick="propertyDetail.deletePhoto(${i})"><i class="fas fa-trash"></i></div>` : ''}</div>`).join('')}<div class="add-photo" onclick="propertyDetail.addPhoto()"><i class="fas fa-plus-circle fa-2x"></i><span>Добавить фото</span></div></div>`; }

    renderShowings() { if (this.showings.length === 0) return '<div class="empty-state"><i class="fas fa-calendar-alt"></i><p>Показов не было</p></div>'; return `<div class="showings-list">${this.showings.map(s => `<div class="showing-item"><div><div class="showing-date">${s.date} в ${s.time}</div><div><a class="showing-client" onclick="propertyDetail.viewClient(${s.clientId})">${s.clientName}</a></div><div class="showing-notes">${s.notes || ''}</div></div><span class="showing-status ${s.status}">${s.status === 'completed' ? 'Завершен' : s.status === 'scheduled' ? 'Запланирован' : 'Отменен'}</span></div>`).join('')}</div>`; }

    renderDocs() { return `<div class="docs-list" id="docsList">${this.documents.map((d,i) => `<div class="doc-item"><div class="doc-name"><i class="fas fa-file-${d.type === 'pdf' ? 'pdf' : 'alt'}"></i> ${d.name}</div><div class="doc-actions"><button onclick="propertyDetail.downloadDoc(${i})"><i class="fas fa-download"></i></button><button onclick="propertyDetail.deleteDoc(${i})"><i class="fas fa-trash"></i></button></div></div>`).join('')}</div><div class="upload-doc" onclick="document.getElementById('docInput').click()"><i class="fas fa-cloud-upload-alt"></i> Загрузить документ<input type="file" id="docInput" style="display:none" onchange="propertyDetail.uploadDoc(this)"></div>`; }

    renderNotes() { return `<div class="notes-list" id="notesList">${this.notes.map((n,i) => `<div class="note-item"><div class="note-header"><span><i class="fas fa-user"></i> ${n.author}</span><span>${new Date(n.date).toLocaleString()}</span></div><div class="note-text">${n.text}</div><div style="text-align:right; margin-top:0.5rem;"><button class="btn btn-sm btn-danger" onclick="propertyDetail.deleteNote(${i})">Удалить</button></div></div>`).join('')}</div><div class="add-note"><textarea id="newNote" rows="2" placeholder="Добавить заметку..."></textarea><button class="btn btn-primary" onclick="propertyDetail.addNote()">Добавить</button></div>`; }

    renderAgentActions() {
        if (this.property.status === 'sold') return;
        const container = document.getElementById('agentActions');
        container.style.display = 'flex';
        container.innerHTML = `
            <select id="statusSelect"><option value="available" ${this.property.status === 'available' ? 'selected' : ''}>В продаже</option><option value="rent" ${this.property.status === 'rent' ? 'selected' : ''}>В аренде</option><option value="booked" ${this.property.status === 'booked' ? 'selected' : ''}>Забронирован</option><option value="sold" ${this.property.status === 'sold' ? 'selected' : ''}>Продан</option></select>
            <input type="number" id="priceInput" value="${this.property.price}" placeholder="Цена">
            <button class="btn btn-primary" onclick="propertyDetail.updateProperty()"><i class="fas fa-save"></i> Сохранить изменения</button>
        `;
    }

    updateProperty() {
        this.property.status = document.getElementById('statusSelect').value;
        this.property.price = parseInt(document.getElementById('priceInput').value);
        const properties = database.getProperties();
        const index = properties.findIndex(p => p.id === this.property.id);
        if (index !== -1) { properties[index] = this.property; localStorage.setItem('hermes_properties', JSON.stringify(properties)); }
        this.renderHeader();
        this.showNotification('Данные обновлены', 'success');
    }

    addPhoto() { const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.onchange = (e) => { if (e.target.files[0]) { const reader = new FileReader(); reader.onload = (ev) => { this.photos.push(ev.target.result); this.savePhotos(); this.renderAccordions(); }; reader.readAsDataURL(e.target.files[0]); } }; input.click(); }
    deletePhoto(index) { if (confirm('Удалить фото?')) { this.photos.splice(index, 1); this.savePhotos(); this.renderAccordions(); } }
    savePhotos() { localStorage.setItem(`property_photos_${this.property.id}`, JSON.stringify(this.photos)); }

    uploadDoc(input) { if (input.files[0]) { const reader = new FileReader(); reader.onload = (e) => { this.documents.push({ name: input.files[0].name, url: e.target.result, type: 'pdf', uploadedAt: new Date().toISOString() }); this.saveDocs(); this.renderAccordions(); }; reader.readAsDataURL(input.files[0]); } }
    deleteDoc(index) { if (confirm('Удалить документ?')) { this.documents.splice(index, 1); this.saveDocs(); this.renderAccordions(); } }
    saveDocs() { localStorage.setItem(`property_docs_${this.property.id}`, JSON.stringify(this.documents)); }
    downloadDoc(index) { window.open(this.documents[index].url, '_blank'); }

    addNote() { const text = document.getElementById('newNote').value.trim(); if (!text) return; this.notes.push({ text, author: `${this.currentUser.firstName} ${this.currentUser.lastName}`, date: new Date().toISOString() }); this.saveNotes(); document.getElementById('newNote').value = ''; this.renderAccordions(); }
    deleteNote(index) { if (confirm('Удалить заметку?')) { this.notes.splice(index, 1); this.saveNotes(); this.renderAccordions(); } }
    saveNotes() { localStorage.setItem(`property_notes_${this.property.id}`, JSON.stringify(this.notes)); }

    viewClient(clientId) { window.location.href = `client-detail.html?id=${clientId}`; }
    formatPrice(price) { return new Intl.NumberFormat('ru-RU').format(price) + ' ₽'; }
    showNotification(msg, type) { const n = document.createElement('div'); n.className = `auth-notification ${type}`; n.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${msg}`; document.body.appendChild(n); setTimeout(() => n.remove(), 3000); }
    updateAuthUI() { const auth = document.getElementById('authSection'); if (auth && this.currentUser) auth.innerHTML = `<div class="user-menu"><div class="user-avatar">${this.currentUser.firstName?.charAt(0)}</div><div class="user-dropdown"><a href="dashboard.html">Кабинет</a><a href="#" onclick="AuthService.logout()">Выйти</a></div></div>`; }
}

function openLightbox(src) { document.getElementById('lightboxImg').src = src; document.getElementById('lightbox').classList.add('active'); }
function closeLightbox() { document.getElementById('lightbox').classList.remove('active'); }

let propertyDetail;
document.addEventListener('DOMContentLoaded', () => { propertyDetail = new PropertyDetail(); window.propertyDetail = propertyDetail; });