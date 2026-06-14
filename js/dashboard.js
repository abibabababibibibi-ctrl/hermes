// dashboard.js - логика личного кабинета

class Dashboard {
    constructor() {
        this.currentUser = null;
        this.allProperties = [];
        this.init();
    }

    async init() {
        // Проверяем авторизацию
        this.currentUser = AuthService.getCurrentUser();
        
        if (!this.currentUser) {
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            window.location.href = 'login.html';
            return;
        }
        
        // Загружаем данные
        this.allProperties = database.getProperties();
        
        // Загружаем все секции
        this.loadUserData();
        this.loadRecommendations();
        this.loadActiveBookings();
        this.loadAllBookings();
        this.loadFavorites();
        this.loadRecentViews();
        this.loadUserStats();
        
        // Настраиваем навигацию
        this.setupNavigation();
        
        // Настраиваем формы
        this.setupForms();
        
        // Обновляем UI авторизации
        AuthService.updateAuthUI();
        
        // Получаем параметр tab из URL
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab');
        if (tab) {
            this.switchTab(tab);
        }
    }

    loadUserData() {
        document.getElementById('userName').textContent = 
            `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        
        document.getElementById('firstName').value = this.currentUser.firstName;
        document.getElementById('lastName').value = this.currentUser.lastName;
        document.getElementById('email').value = this.currentUser.email;
        document.getElementById('phone').value = this.currentUser.phone || '';
        document.getElementById('bio').value = this.currentUser.bio || '';
    }

    async loadUserStats() {
        const favorites = this.getFavorites();
        const bookings = this.getBookings();
        const views = this.getViews();
        
        const statsHTML = `
            <div class="welcome-stat">
                <i class="fas fa-heart"></i> ${favorites.length} в избранном
            </div>
            <div class="welcome-stat">
                <i class="fas fa-calendar-check"></i> ${bookings.filter(b => b.status === 'active').length} активных броней
            </div>
            <div class="welcome-stat">
                <i class="fas fa-eye"></i> ${views.length} просмотров
            </div>
        `;
        
        document.getElementById('userStats').innerHTML = statsHTML;
    }

    loadRecommendations() {
        // Показываем рекомендуемые объекты (не из избранного)
        const favorites = this.getFavorites();
        const recommendations = this.allProperties
            .filter(p => !favorites.includes(p.id) && p.status === 'available')
            .slice(0, 3);
        
        const grid = document.getElementById('recommendationsGrid');
        
        if (recommendations.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-smile-wink"></i>
                    <p>Скоро появятся рекомендации</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = recommendations.map(prop => this.createPropertyCard(prop)).join('');
    }

    loadActiveBookings() {
        const bookings = this.getBookings();
        const activeBookings = bookings.filter(b => b.status === 'active');
        const card = document.getElementById('activeBookingsCard');
        const container = document.getElementById('activeBookingsList');
        
        if (activeBookings.length === 0) {
            card.style.display = 'none';
            return;
        }
        
        card.style.display = 'block';
        
        container.innerHTML = activeBookings.slice(0, 3).map(booking => {
            const property = this.allProperties.find(p => p.id === booking.propertyId);
            if (!property) return '';
            
            const deadline = new Date(booking.purchaseDeadline);
            const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
            
            return `
                <div style="padding: 1rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <strong>${property.title}</strong>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">${property.location}</div>
                        <div style="font-size: 0.75rem; margin-top: 0.25rem;">
                            <span class="status-badge status-active">Активно</span>
                            <span style="margin-left: 0.5rem;">⏰ ${daysLeft} дн. на покупку</span>
                        </div>
                    </div>
                    <div>
                        <a href="apartment${property.id}.html" class="btn btn-sm btn-secondary">Подробнее</a>
                        <button class="btn btn-sm btn-primary" onclick="dashboard.purchaseBooking(${booking.id})">Купить</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    loadAllBookings() {
        const bookings = this.getBookings();
        const container = document.getElementById('bookingsTable');
        
        if (bookings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <p>У вас пока нет бронирований</p>
                    <a href="catalog.html" class="btn btn-primary">Забронировать объект</a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <table>
                <thead>
                    <tr><th>Объект</th><th>Дата брони</th><th>Сумма</th><th>Статус</th><th>Действия</th></tr>
                </thead>
                <tbody>
                    ${bookings.map(booking => {
                        const property = this.allProperties.find(p => p.id === booking.propertyId);
                        if (!property) return '';
                        
                        const statusText = {
                            'active': 'Активно',
                            'pending': 'Ожидает оплаты',
                            'completed': 'Завершено',
                            'cancelled': 'Отменено',
                            'expired': 'Истекло'
                        }[booking.status] || booking.status;
                        
                        return `
                            <tr>
                                <td>${property.title}</td>
                                <td>${new Date(booking.createdAt).toLocaleDateString()}</td>
                                <td>${this.formatPrice(booking.bookingFee)}</td>
                                <td><span class="status-badge status-${booking.status}">${statusText}</span></td>
                                <td>
                                    <a href="apartment${property.id}.html" class="btn btn-sm btn-secondary">Просмотр</a>
                                    ${booking.status === 'active' ? `<button class="btn btn-sm btn-danger" onclick="dashboard.cancelBooking(${booking.id})">Отменить</button>` : ''}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    loadFavorites() {
        const favorites = this.getFavorites();
        const favoriteProps = this.allProperties.filter(p => favorites.includes(p.id));
        const grid = document.getElementById('favoritesGrid');
        
        if (favoriteProps.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-heart-broken"></i>
                    <p>Нет избранных объектов</p>
                    <a href="catalog.html" class="btn btn-primary">Добавить в избранное</a>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = favoriteProps.map(prop => this.createPropertyCard(prop, true)).join('');
    }

    loadRecentViews() {
        const views = this.getViews();
        const recentProps = views.slice(0, 3).map(v => this.allProperties.find(p => p.id === v.propertyId)).filter(p => p);
        const grid = document.getElementById('recentGrid');
        
        if (recentProps.length === 0) {
            return;
        }
        
        grid.innerHTML = recentProps.map(prop => this.createPropertyCard(prop)).join('');
    }

    createPropertyCard(property, isFavorite = false) {
        return `
            <div class="property-item">
                <div class="property-image">
                    <img src="${property.image}" alt="${property.title}" onerror="this.src='https://via.placeholder.com/400x250?text=Фото'">
                </div>
                <div class="property-info">
                    <div class="property-title">${property.title}</div>
                    <div class="property-location"><i class="fas fa-map-marker-alt"></i> ${property.location}</div>
                    <div class="property-price">${this.formatPrice(property.price)}</div>
                    <div style="display: flex; gap: 0.5rem;">
                        <a href="apartment${property.id}.html" class="btn btn-primary btn-sm">Подробнее</a>
                        ${isFavorite ? 
                            `<button class="btn btn-danger btn-sm" onclick="dashboard.removeFromFavorites(${property.id})"><i class="fas fa-trash"></i></button>` :
                            `<button class="btn btn-secondary btn-sm" onclick="dashboard.addToFavorites(${property.id})"><i class="fas fa-heart"></i></button>`
                        }
                    </div>
                </div>
            </div>
        `;
    }

    async purchaseBooking(bookingId) {
        if (confirm('Вы уверены, что хотите купить этот объект?')) {
            try {
                await bookingSystem.purchaseBookedProperty(bookingId, this.currentUser.id, { method: 'bank_transfer' });
                this.showNotification('Поздравляем с покупкой!', 'success');
                this.loadActiveBookings();
                this.loadAllBookings();
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        }
    }

    async cancelBooking(bookingId) {
        const reason = prompt('Укажите причину отмены:');
        if (!reason) return;
        
        if (confirm('Отменить бронирование?')) {
            try {
                await bookingSystem.cancelBooking(bookingId, this.currentUser.id, reason);
                this.showNotification('Бронирование отменено', 'success');
                this.loadActiveBookings();
                this.loadAllBookings();
                this.loadUserStats();
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        }
    }

    async addToFavorites(propertyId) {
        let favorites = this.getFavorites();
        if (!favorites.includes(propertyId)) {
            favorites.push(propertyId);
            this.saveFavorites(favorites);
            this.showNotification('Добавлено в избранное', 'success');
            this.loadFavorites();
            this.loadUserStats();
        }
    }

    async removeFromFavorites(propertyId) {
        let favorites = this.getFavorites();
        favorites = favorites.filter(id => id !== propertyId);
        this.saveFavorites(favorites);
        this.showNotification('Удалено из избранного', 'success');
        this.loadFavorites();
        this.loadUserStats();
    }

    async updateProfile(event) {
        event.preventDefault();
        
        const userData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            bio: document.getElementById('bio').value
        };
        
        const result = await AuthService.updateProfile(userData);
        
        if (result.success) {
            this.currentUser = result.user;
            this.loadUserData();
            this.showNotification('Профиль обновлен', 'success');
        } else {
            this.showNotification(result.error, 'error');
        }
    }

    async changePassword(event) {
        event.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (newPassword !== confirmPassword) {
            this.showNotification('Пароли не совпадают', 'error');
            return;
        }
        
        if (newPassword.length < 6) {
            this.showNotification('Пароль должен быть не менее 6 символов', 'error');
            return;
        }
        
        const result = await AuthService.changePassword(currentPassword, newPassword);
        
        if (result.success) {
            this.showNotification('Пароль изменен', 'success');
            document.getElementById('passwordForm').reset();
        } else {
            this.showNotification(result.error, 'error');
        }
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.dashboard-nav-item');
        const sections = document.querySelectorAll('.dashboard-section');
        
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const tab = item.dataset.tab;
                this.switchTab(tab);
                
                // Обновляем URL без перезагрузки
                const url = new URL(window.location);
                url.searchParams.set('tab', tab);
                window.history.pushState({}, '', url);
            });
        });
    }

    switchTab(tab) {
        const navItems = document.querySelectorAll('.dashboard-nav-item');
        const sections = document.querySelectorAll('.dashboard-section');
        
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.tab === tab);
        });
        
        sections.forEach(section => {
            section.classList.toggle('active', section.id === `${tab}Tab`);
        });
    }

    setupForms() {
        document.getElementById('profileForm').addEventListener('submit', (e) => this.updateProfile(e));
        document.getElementById('passwordForm').addEventListener('submit', (e) => this.changePassword(e));
    }

    getFavorites() {
        const favorites = JSON.parse(localStorage.getItem('hermes_favorites')) || {};
        return favorites[this.currentUser.id] || [];
    }

    saveFavorites(favorites) {
        const allFavorites = JSON.parse(localStorage.getItem('hermes_favorites')) || {};
        allFavorites[this.currentUser.id] = favorites;
        localStorage.setItem('hermes_favorites', JSON.stringify(allFavorites));
    }

    getBookings() {
        const bookings = database.getBookings();
        return bookings.filter(b => b.userId === this.currentUser.id);
    }

    getViews() {
        const views = JSON.parse(localStorage.getItem('hermes_views')) || {};
        return views[this.currentUser.id] || [];
    }

    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(price);
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `auth-notification ${type}`;
        notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

function deleteAccount() {
    if (confirm('Удалить аккаунт? Это действие нельзя отменить!')) {
        AuthService.logout();
        showNotification('Аккаунт удален', 'success');
        setTimeout(() => window.location.href = 'index.html', 1500);
    }
}

let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new Dashboard();
    window.dashboard = dashboard;
});