// object-manager.js - Управление объектами с 15 готовыми объектами

class ObjectManager {
    constructor() {
        this.objects = [];
        this.agents = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filteredObjects = [];
        this.currentImage = null;
        this.init();
    }

    init() {
        this.loadObjects();
        this.loadAgents();
        this.renderObjects();
        this.setupEventListeners();
        this.updateAuthUI();
    }

    // 15 готовых объектов недвижимости
    getDefaultObjects() {
        return [
            {
                id: 1, title: '3-комнатная квартира в центре', type: 'apartment', area: 85, price: 12500000,
                district: 'central', rooms: 3, address: 'ул. Тверская, 15', status: 'available', agentId: null,
                description: 'Просторная квартира в историческом центре, евроремонт, панорамные окна',
                image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'
            },
            {
                id: 2, title: '2-комнатная квартира в спальном районе', type: 'apartment', area: 65, price: 8200000,
                district: 'north', rooms: 2, address: 'ул. Академика Королева, 12', status: 'available', agentId: null,
                description: 'Уютная квартира с балконом, развитая инфраструктура',
                image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400'
            },
            {
                id: 3, title: 'Загородный дом с участком', type: 'house', area: 150, price: 25000000,
                district: 'suburb', rooms: 4, address: 'Новорижское шоссе, 25 км', status: 'available', agentId: null,
                description: 'Дом с гаражом, участок 12 соток, ландшафтный дизайн',
                image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400'
            },
            {
                id: 4, title: 'Студия в новостройке', type: 'apartment', area: 35, price: 4500000,
                district: 'south', rooms: 0, address: 'ул. Южная, 8', status: 'available', agentId: null,
                description: 'Современная студия с отделкой под ключ, дом сдан',
                image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'
            },
            {
                id: 5, title: 'Таунхаус в эко-поселке', type: 'house', area: 120, price: 18000000,
                district: 'west', rooms: 3, address: 'Рублево-Успенское шоссе', status: 'booked', agentId: null,
                description: 'Двухуровневый таунхаус, отдельный вход, парковка',
                image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'
            },
            {
                id: 6, title: 'Элитная квартира с видом на Москву-реку', type: 'apartment', area: 120, price: 35000000,
                district: 'central', rooms: 4, address: 'наб. Тараса Шевченко, 2', status: 'available', agentId: null,
                description: 'Премиум-класс, панорамное остекление, консьерж-сервис',
                image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400'
            },
            {
                id: 7, title: '1-комнатная квартира у метро', type: 'apartment', area: 45, price: 6800000,
                district: 'east', rooms: 1, address: 'ул. Первомайская, 34', status: 'available', agentId: null,
                description: '5 минут до метро, рядом парк, хорошее состояние',
                image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400'
            },
            {
                id: 8, title: 'Пентхаус с террасой', type: 'apartment', area: 200, price: 55000000,
                district: 'central', rooms: 5, address: 'Кутузовский проспект, 48', status: 'sold', agentId: null,
                description: 'Двухуровневый пентхаус, терраса 50 м², вид на город',
                image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400'
            },
            {
                id: 9, title: 'Дача с баней и прудом', type: 'house', area: 100, price: 9500000,
                district: 'suburb', rooms: 3, address: 'Дмитровское шоссе, 45 км', status: 'available', agentId: null,
                description: 'Отличный вариант для загородного отдыха, баня, пруд',
                image: 'https://images.unsplash.com/photo-1523217582562-09d0c9937386?w=400'
            },
            {
                id: 10, title: 'Коммерческое помещение на 1 этаже', type: 'commercial', area: 80, price: 15000000,
                district: 'central', rooms: 0, address: 'ул. Арбат, 25', status: 'available', agentId: null,
                description: 'Отличное место для магазина или кафе, высокий трафик',
                image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400'
            },
            {
                id: 11, title: 'Новостройка от застройщика', type: 'apartment', area: 55, price: 8900000,
                district: 'north', rooms: 2, address: 'ул. Флотская, 7', status: 'available', agentId: null,
                description: 'Квартира в ЖК бизнес-класса, сдача в 2025 году',
                image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'
            },
            {
                id: 12, title: 'Семейный дом с садом', type: 'house', area: 180, price: 28000000,
                district: 'west', rooms: 5, address: 'Можайское шоссе, 30 км', status: 'available', agentId: null,
                description: 'Большой дом для большой семьи, фруктовый сад, беседка',
                image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400'
            },
            {
                id: 13, title: 'Апартаменты в деловом центре', type: 'commercial', area: 45, price: 12000000,
                district: 'central', rooms: 0, address: 'Москва-Сити, башня Федерация', status: 'available', agentId: null,
                description: 'Готовый бизнес под ключ, отдельный вход',
                image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400'
            },
            {
                id: 14, title: 'Квартира рядом с парком', type: 'apartment', area: 68, price: 9500000,
                district: 'south', rooms: 2, address: 'ул. Дорожная, 22', status: 'booked', agentId: null,
                description: 'Вид на парк, тихий двор, школа рядом',
                image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400'
            },
            {
                id: 15, title: 'Престижная квартира в ЖК Скандинавия', type: 'apartment', area: 92, price: 16500000,
                district: 'north', rooms: 3, address: 'ул. Фестивальная, 45', status: 'available', agentId: null,
                description: 'Европейский ремонт, подземный паркинг, закрытая территория',
                image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400'
            }
        ];
    }

    loadObjects() {
        const saved = localStorage.getItem('hermes_objects');
        if (saved) {
            this.objects = JSON.parse(saved);
        } else {
            this.objects = this.getDefaultObjects();
            localStorage.setItem('hermes_objects', JSON.stringify(this.objects));
        }
        this.filteredObjects = [...this.objects];
    }

    loadAgents() {
        const users = JSON.parse(localStorage.getItem('hermes_users')) || [];
        this.agents = users.filter(u => u.role === 'agent' || u.role === 'admin');
        this.updateAgentSelects();
    }

    updateAgentSelects() {
        const options = '<option value="">Не назначен</option>' + 
            this.agents.map(a => `<option value="${a.id}">${a.firstName} ${a.lastName}</option>`).join('');
        document.getElementById('objAgent').innerHTML = options;
        document.getElementById('agentSelect').innerHTML = options;
    }

    setupEventListeners() {
        document.getElementById('searchInput').addEventListener('input', () => this.applyFilters());
        document.getElementById('filterDistrict').addEventListener('change', () => this.applyFilters());
        document.getElementById('filterPriceFrom').addEventListener('input', () => this.applyFilters());
        document.getElementById('filterPriceTo').addEventListener('input', () => this.applyFilters());
        document.getElementById('filterRooms').addEventListener('change', () => this.applyFilters());
        document.getElementById('filterStatus').addEventListener('change', () => this.applyFilters());
    }

    applyFilters() {
        const search = document.getElementById('searchInput').value.toLowerCase();
        const district = document.getElementById('filterDistrict').value;
        const priceFrom = parseFloat(document.getElementById('filterPriceFrom').value) || 0;
        const priceTo = parseFloat(document.getElementById('filterPriceTo').value) || Infinity;
        const rooms = document.getElementById('filterRooms').value;
        const status = document.getElementById('filterStatus').value;

        this.filteredObjects = this.objects.filter(obj => {
            if (search && !obj.title.toLowerCase().includes(search) && !obj.address.toLowerCase().includes(search)) return false;
            if (district && obj.district !== district) return false;
            if (obj.price < priceFrom || obj.price > priceTo) return false;
            if (rooms && obj.rooms.toString() !== rooms) return false;
            if (status && obj.status !== status) return false;
            return true;
        });
        
        this.currentPage = 1;
        this.renderObjects();
    }

    resetFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('filterDistrict').value = '';
        document.getElementById('filterPriceFrom').value = '';
        document.getElementById('filterPriceTo').value = '';
        document.getElementById('filterRooms').value = '';
        document.getElementById('filterStatus').value = '';
        this.applyFilters();
    }

    renderObjects() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const paginated = this.filteredObjects.slice(start, start + this.itemsPerPage);
        const tbody = document.getElementById('objectsTableBody');
        
        if (paginated.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:40px;">Нет объектов</td></tr>';
            this.renderPagination();
            return;
        }

        tbody.innerHTML = paginated.map(obj => {
            const agent = this.agents.find(a => a.id === obj.agentId);
            const statusText = { available: 'Доступен', booked: 'Забронирован', sold: 'Продан', archived: 'В архиве' };
            const typeText = { apartment: 'Квартира', house: 'Дом', commercial: 'Коммерческая' };
            const districtText = { central: 'Центральный', north: 'Северный', south: 'Южный', east: 'Восточный', west: 'Западный', suburb: 'Пригород' };
            
            return `
                <tr>
                    <td><img src="${obj.image}" style="width:50px; height:50px; object-fit:cover; border-radius:8px;" onerror="this.src='https://via.placeholder.com/50'"></td>
                    <td><strong>${obj.title}</strong><br><small style="color:var(--text-tertiary);">${obj.address}</small></td>
                    <td>${typeText[obj.type]}</td>
                    <td>${obj.area} м²</td>
                    <td>${this.formatPrice(obj.price)}</td>
                    <td>${districtText[obj.district]}</td>
                    <td>${obj.rooms === 0 ? 'Студия' : obj.rooms + ' комн.'}</td>
                    <td>${agent ? agent.firstName + ' ' + agent.lastName : '<span style="color:var(--text-tertiary);">Не назначен</span>'}</td>
                    <td><span class="status-badge status-${obj.status}">${statusText[obj.status]}</span></td>
                    <td class="action-buttons">
                        <button class="icon-btn edit" onclick="objectManager.openEditModal(${obj.id})"><i class="fas fa-edit"></i></button>
                        <button class="icon-btn agent" onclick="objectManager.openAgentModal(${obj.id})"><i class="fas fa-user-check"></i></button>
                        <button class="icon-btn archive" onclick="objectManager.archiveObject(${obj.id})"><i class="fas fa-archive"></i></button>
                        <button class="icon-btn delete" onclick="objectManager.deleteObject(${obj.id})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
        
        this.renderPagination();
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredObjects.length / this.itemsPerPage);
        const container = document.getElementById('pagination');
        if (totalPages <= 1) { container.innerHTML = ''; return; }
        
        let html = '';
        for (let i = 1; i <= Math.min(totalPages, 5); i++) {
            html += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" onclick="objectManager.goToPage(${i})">${i}</button>`;
        }
        container.innerHTML = html;
    }

    goToPage(page) { this.currentPage = page; this.renderObjects(); }

    openObjectModal(id = null) {
        if (id) {
            const obj = this.objects.find(o => o.id === id);
            if (obj) {
                document.getElementById('modalTitle').textContent = 'Редактирование объекта';
                document.getElementById('objectId').value = obj.id;
                document.getElementById('objTitle').value = obj.title;
                document.getElementById('objType').value = obj.type;
                document.getElementById('objArea').value = obj.area;
                document.getElementById('objPrice').value = obj.price;
                document.getElementById('objDistrict').value = obj.district;
                document.getElementById('objRooms').value = obj.rooms;
                document.getElementById('objAddress').value = obj.address;
                document.getElementById('objAgent').value = obj.agentId || '';
                document.getElementById('objDescription').value = obj.description || '';
                this.currentImage = obj.image;
                this.updateImagePreview(obj.image);
            }
        } else {
            document.getElementById('modalTitle').textContent = 'Добавление объекта';
            document.getElementById('objectForm').reset();
            document.getElementById('objectId').value = '';
            this.currentImage = null;
            this.updateImagePreview(null);
        }
        document.getElementById('objectModal').classList.add('active');
    }

    openEditModal(id) { this.openObjectModal(id); }

    handleImageUpload(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.currentImage = e.target.result;
                this.updateImagePreview(this.currentImage);
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    updateImagePreview(src) {
        const container = document.getElementById('imagePreview');
        if (src) {
            container.innerHTML = `<div class="preview-item"><img src="${src}"><div class="remove" onclick="document.getElementById('imagePreview').innerHTML = ''; objectManager.currentImage = null"><i class="fas fa-times"></i></div></div>`;
        } else {
            container.innerHTML = '';
        }
    }

    saveObject() {
        const id = document.getElementById('objectId').value;
        const objData = {
            id: id ? parseInt(id) : Date.now(),
            title: document.getElementById('objTitle').value,
            type: document.getElementById('objType').value,
            area: parseInt(document.getElementById('objArea').value),
            price: parseInt(document.getElementById('objPrice').value),
            district: document.getElementById('objDistrict').value,
            rooms: parseInt(document.getElementById('objRooms').value),
            address: document.getElementById('objAddress').value,
            agentId: document.getElementById('objAgent').value || null,
            description: document.getElementById('objDescription').value,
            image: this.currentImage || 'https://via.placeholder.com/400',
            status: 'available'
        };

        if (id) {
            const index = this.objects.findIndex(o => o.id === parseInt(id));
            this.objects[index] = { ...this.objects[index], ...objData };
            this.showNotification('Объект обновлен', 'success');
        } else {
            this.objects.unshift(objData);
            this.showNotification('Объект добавлен', 'success');
        }

        localStorage.setItem('hermes_objects', JSON.stringify(this.objects));
        this.loadObjects();
        this.applyFilters();
        this.closeModal();
    }

    archiveObject(id) {
        if (confirm('Архивировать объект?')) {
            const obj = this.objects.find(o => o.id === id);
            if (obj) {
                obj.status = 'archived';
                localStorage.setItem('hermes_objects', JSON.stringify(this.objects));
                this.loadObjects();
                this.applyFilters();
                this.showNotification(`Объект "${obj.title}" архивирован`, 'info');
            }
        }
    }

    deleteObject(id) {
        if (confirm('Удалить объект безвозвратно?')) {
            const obj = this.objects.find(o => o.id === id);
            if (obj.status === 'sold') {
                this.showNotification('Нельзя удалить проданный объект без архивации', 'error');
                return;
            }
            this.objects = this.objects.filter(o => o.id !== id);
            localStorage.setItem('hermes_objects', JSON.stringify(this.objects));
            this.loadObjects();
            this.applyFilters();
            this.showNotification(`Объект "${obj.title}" удален`, 'warning');
        }
    }

    openAgentModal(objectId) {
        const obj = this.objects.find(o => o.id === objectId);
        if (obj) {
            document.getElementById('agentObjectId').value = objectId;
            document.getElementById('agentObjectTitle').value = obj.title;
            document.getElementById('agentSelect').value = obj.agentId || '';
            document.getElementById('agentModal').classList.add('active');
        }
    }

    assignAgent() {
        const objectId = parseInt(document.getElementById('agentObjectId').value);
        const agentId = document.getElementById('agentSelect').value || null;
        const obj = this.objects.find(o => o.id === objectId);
        
        if (obj) {
            obj.agentId = agentId;
            localStorage.setItem('hermes_objects', JSON.stringify(this.objects));
            this.loadObjects();
            this.applyFilters();
            const agent = this.agents.find(a => a.id == agentId);
            this.showNotification(`Агент ${agent ? agent.firstName + ' ' + agent.lastName : 'не назначен'} для объекта "${obj.title}"`, 'success');
            this.closeAgentModal();
        }
    }

    closeModal() { document.getElementById('objectModal').classList.remove('active'); }
    closeAgentModal() { document.getElementById('agentModal').classList.remove('active'); }

    formatPrice(price) { return new Intl.NumberFormat('ru-RU').format(price) + ' ₽'; }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `toast-notification`;
        notification.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; background: var(--bg-primary);
            padding: 12px 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10001; border-left: 4px solid ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#f39c12'};
            animation: slideIn 0.3s ease;
        `;
        notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}" style="margin-right: 8px;"></i> ${message}`;
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

let objectManager;
document.addEventListener('DOMContentLoaded', () => {
    objectManager = new ObjectManager();
    window.objectManager = objectManager;
    window.openObjectModal = (id) => objectManager.openObjectModal(id);
    window.openEditModal = (id) => objectManager.openEditModal(id);
    window.closeModal = () => objectManager.closeModal();
    window.closeAgentModal = () => objectManager.closeAgentModal();
    window.saveObject = () => objectManager.saveObject();
    window.assignAgent = () => objectManager.assignAgent();
    window.applyFilters = () => objectManager.applyFilters();
    window.resetFilters = () => objectManager.resetFilters();
    window.handleImageUpload = (input) => objectManager.handleImageUpload(input);
});