// user-manager.js - Управление пользователями (администратор)

class UserManager {
    constructor() {
        this.users = [];
        this.currentUser = null;
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.sortField = 'name';
        this.sortOrder = 'asc';
        this.init();
    }

    async init() {
        this.currentUser = AuthService.getCurrentUser();
        if (!this.currentUser || this.currentUser.role !== 'admin') {
            window.location.href = 'index.html';
            return;
        }
        this.loadUsers();
        this.setupEventListeners();
        this.renderStats();
        this.renderUsers();
        this.updateAuthUI();
    }

    loadUsers() {
        const saved = localStorage.getItem('hermes_users');
        if (saved) {
            this.users = JSON.parse(saved);
        } else {
            this.users = [
                { id: 1, firstName: 'Admin', lastName: 'Системный', email: 'admin@hermes.ru', phone: '+7 (999) 111-11-11', role: 'admin', department: 'admin', status: 'active', createdAt: '2025-01-01' },
                { id: 2, firstName: 'Иван', lastName: 'Агентов', email: 'agent@hermes.ru', phone: '+7 (999) 222-22-22', role: 'agent', department: 'sales', status: 'active', createdAt: '2025-01-15' }
            ];
            localStorage.setItem('hermes_users', JSON.stringify(this.users));
        }
    }

    setupEventListeners() {
        document.getElementById('searchUser').addEventListener('input', () => this.renderUsers());
        document.getElementById('filterRole').addEventListener('change', () => this.renderUsers());
        document.getElementById('filterDepartment').addEventListener('change', () => this.renderUsers());
        document.getElementById('filterStatus').addEventListener('change', () => this.renderUsers());
    }

    getFilteredUsers() {
        let filtered = [...this.users];
        const search = document.getElementById('searchUser').value.toLowerCase();
        if (search) {
            filtered = filtered.filter(u => 
                `${u.firstName} ${u.lastName}`.toLowerCase().includes(search) ||
                u.email.toLowerCase().includes(search) ||
                (u.phone && u.phone.includes(search))
            );
        }
        const role = document.getElementById('filterRole').value;
        if (role) filtered = filtered.filter(u => u.role === role);
        const department = document.getElementById('filterDepartment').value;
        if (department) filtered = filtered.filter(u => u.department === department);
        const status = document.getElementById('filterStatus').value;
        if (status) filtered = filtered.filter(u => u.status === status);
        filtered.sort((a, b) => {
            let aVal = a[this.sortField], bVal = b[this.sortField];
            if (this.sortField === 'name') aVal = `${a.firstName} ${a.lastName}`;
            if (this.sortField === 'name') bVal = `${b.firstName} ${b.lastName}`;
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            return this.sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
        });
        return filtered;
    }

    renderStats() {
        document.getElementById('statsGrid').innerHTML = `
            <div class="stat-card"><div class="stat-number">${this.users.length}</div><div class="stat-label">Всего пользователей</div></div>
            <div class="stat-card"><div class="stat-number">${this.users.filter(u => u.role === 'admin').length}</div><div class="stat-label">Администраторы</div></div>
            <div class="stat-card"><div class="stat-number">${this.users.filter(u => u.role === 'agent').length}</div><div class="stat-label">Агенты</div></div>
            <div class="stat-card"><div class="stat-number">${this.users.filter(u => u.status === 'active').length}</div><div class="stat-label">Активных</div></div>
        `;
    }

    renderUsers() {
        const filtered = this.getFilteredUsers();
        const totalPages = Math.ceil(filtered.length / this.itemsPerPage);
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const paginated = filtered.slice(start, start + this.itemsPerPage);
        const tbody = document.getElementById('usersTableBody');
        if (paginated.length === 0) { tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Нет пользователей</td></tr>'; return; }
        tbody.innerHTML = paginated.map(u => `
            <tr>
                <td><div style="display: flex; align-items: center; gap: 0.75rem;"><div class="user-avatar-small">${u.firstName?.charAt(0)}${u.lastName?.charAt(0)}</div><div><strong>${u.firstName} ${u.lastName}</strong><br><small style="color: var(--text-tertiary);">${u.email}</small></div></div></td>
                <td>${u.email}</td><td>${u.phone || '—'}</td>
                <td><span class="role-badge role-${u.role}">${u.role === 'admin' ? 'Администратор' : u.role === 'agent' ? 'Агент' : 'Пользователь'}</span></td>
                <td>${u.department === 'sales' ? 'Отдел продаж' : u.department === 'rental' ? 'Отдел аренды' : 'Администрация'}</td>
                <td><span class="${u.status === 'active' ? 'status-active' : 'status-blocked'}"><i class="fas ${u.status === 'active' ? 'fa-circle' : 'fa-ban'}"></i> ${u.status === 'active' ? 'Активен' : 'Заблокирован'}</span></td>
                <td class="action-buttons"><button class="icon-btn view" onclick="userManager.viewUser(${u.id})"><i class="fas fa-eye"></i></button><button class="icon-btn edit" onclick="userManager.openUserModal(${u.id})"><i class="fas fa-edit"></i></button>${u.status === 'active' ? `<button class="icon-btn block" onclick="userManager.blockUser(${u.id})"><i class="fas fa-lock"></i></button>` : `<button class="icon-btn view" onclick="userManager.unblockUser(${u.id})" style="background:#27ae60"><i class="fas fa-unlock-alt"></i></button>`}</td>
            </tr>
        `).join('');
        this.renderPagination(totalPages);
    }

    renderPagination(totalPages) {
        const container = document.getElementById('pagination');
        if (totalPages <= 1) { container.innerHTML = ''; return; }
        let html = '';
        for (let i = 1; i <= Math.min(totalPages, 5); i++) {
            html += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" onclick="userManager.goToPage(${i})">${i}</button>`;
        }
        container.innerHTML = html;
    }

    goToPage(page) { this.currentPage = page; this.renderUsers(); }
    sortTable(field) { if (this.sortField === field) this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'; else { this.sortField = field; this.sortOrder = 'asc'; } this.renderUsers(); }

    viewUser(id) { window.location.href = `user-profile.html?id=${id}`; }

    openUserModal(id = null) {
        if (id) { const u = this.users.find(u => u.id === id); if (u) { document.getElementById('userModalTitle').textContent = 'Редактирование пользователя'; document.getElementById('userId').value = u.id; document.getElementById('userFirstName').value = u.firstName; document.getElementById('userLastName').value = u.lastName; document.getElementById('userEmail').value = u.email; document.getElementById('userPhone').value = u.phone || ''; document.getElementById('userRole').value = u.role; document.getElementById('userDepartment').value = u.department || 'sales'; document.getElementById('userPassword').value = ''; } }
        else { document.getElementById('userModalTitle').textContent = 'Добавление пользователя'; document.getElementById('userForm').reset(); document.getElementById('userId').value = ''; }
        document.getElementById('userModal').classList.add('active');
    }

    saveUser() {
        const id = document.getElementById('userId').value;
        const password = document.getElementById('userPassword').value;
        const userData = {
            id: id ? parseInt(id) : Date.now(),
            firstName: document.getElementById('userFirstName').value,
            lastName: document.getElementById('userLastName').value,
            email: document.getElementById('userEmail').value,
            phone: document.getElementById('userPhone').value,
            role: document.getElementById('userRole').value,
            department: document.getElementById('userDepartment').value,
            status: 'active',
            createdAt: id ? this.users.find(u => u.id === parseInt(id)).createdAt : new Date().toISOString().split('T')[0]
        };
        if (password) userData.password = AuthService.hashPassword(password);
        if (id) { const index = this.users.findIndex(u => u.id === parseInt(id)); this.users[index] = { ...this.users[index], ...userData }; }
        else this.users.unshift(userData);
        localStorage.setItem('hermes_users', JSON.stringify(this.users));
        this.renderStats(); this.renderUsers(); this.closeUserModal();
        this.showNotification(id ? 'Пользователь обновлен' : 'Пользователь добавлен', 'success');
    }

    blockUser(id) { if (confirm('Заблокировать пользователя?')) { const u = this.users.find(u => u.id === id); if (u) { u.status = 'blocked'; localStorage.setItem('hermes_users', JSON.stringify(this.users)); this.renderUsers(); this.showNotification('Пользователь заблокирован', 'success'); } } }
    unblockUser(id) { if (confirm('Разблокировать пользователя?')) { const u = this.users.find(u => u.id === id); if (u) { u.status = 'active'; localStorage.setItem('hermes_users', JSON.stringify(this.users)); this.renderUsers(); this.showNotification('Пользователь разблокирован', 'success'); } } }

    closeUserModal() { document.getElementById('userModal').classList.remove('active'); }
    showNotification(msg, type) { const n = document.createElement('div'); n.className = `auth-notification ${type}`; n.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${msg}`; document.body.appendChild(n); setTimeout(() => n.remove(), 3000); }
    updateAuthUI() { const authSection = document.getElementById('authSection'); if (authSection && this.currentUser) authSection.innerHTML = `<div class="user-menu"><div class="user-avatar">${this.currentUser.firstName?.charAt(0)}</div><div class="user-dropdown"><a href="dashboard.html">Кабинет</a><a href="#" onclick="AuthService.logout()">Выйти</a></div></div>`; }
}

let userManager; document.addEventListener('DOMContentLoaded', () => { userManager = new UserManager(); window.userManager = userManager; window.sortTable = (f) => userManager.sortTable(f); window.openUserModal = (id) => userManager.openUserModal(id); window.closeUserModal = () => userManager.closeUserModal(); window.saveUser = () => userManager.saveUser(); });