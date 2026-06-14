// deal-manager.js - Управление сделками и документами

class DealManager {
    constructor() {
        this.deals = [];
        this.clients = [];
        this.properties = [];
        this.agents = [];
        this.currentUser = null;
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.sortField = 'createdAt';
        this.sortOrder = 'desc';
        this.init();
    }

    async init() {
        this.currentUser = AuthService.getCurrentUser();
        if (!this.currentUser || (this.currentUser.role !== 'admin' && this.currentUser.role !== 'agent')) {
            window.location.href = 'index.html';
            return;
        }
        this.loadData();
        this.setupEventListeners();
        this.renderStats();
        this.renderDeals();
        this.loadSelects();
        this.updateAuthUI();
    }

    loadData() {
        const savedDeals = localStorage.getItem('hermes_deals');
        if (savedDeals) this.deals = JSON.parse(savedDeals);
        else this.deals = this.getDefaultDeals();
        const savedClients = localStorage.getItem('hermes_clients');
        this.clients = savedClients ? JSON.parse(savedClients) : [];
        this.properties = database.getProperties();
        const users = JSON.parse(localStorage.getItem('hermes_users')) || [];
        this.agents = users.filter(u => u.role === 'agent' || u.role === 'admin');
    }

    getDefaultDeals() {
        return [{
            id: 1, clientId: 1, propertyId: 1, amount: 12500000, commissionPercent: 5, commissionAmount: 625000,
            stage: 'contract', date: '2025-05-01', notes: 'Договор подписан', agentId: 2, createdAt: '2025-04-25',
            documents: [{ name: 'Предварительный договор.pdf', url: '#', uploadedAt: '2025-04-26' }]
        }];
    }

    setupEventListeners() {
        document.getElementById('searchDeal').addEventListener('input', () => this.renderDeals());
        document.getElementById('filterStage').addEventListener('change', () => this.renderDeals());
        document.getElementById('filterAgent').addEventListener('change', () => this.renderDeals());
        document.getElementById('filterDateFrom').addEventListener('change', () => this.renderDeals());
        document.getElementById('filterDateTo').addEventListener('change', () => this.renderDeals());
        document.getElementById('dealAmount').addEventListener('input', () => this.updateCommission());
        document.getElementById('dealCommissionPercent').addEventListener('input', () => this.updateCommission());
    }

    updateCommission() {
        const amount = parseFloat(document.getElementById('dealAmount').value) || 0;
        const percent = parseFloat(document.getElementById('dealCommissionPercent').value) || 0;
        const commission = amount * percent / 100;
        document.getElementById('commissionInfo').innerHTML = `<strong>Сумма комиссии:</strong> ${this.formatPrice(commission)} (${percent}% от суммы сделки)`;
    }

    getFilteredDeals() {
        let filtered = [...this.deals];
        if (this.currentUser.role === 'agent') filtered = filtered.filter(d => d.agentId === this.currentUser.id);
        const search = document.getElementById('searchDeal').value.toLowerCase();
        if (search) {
            filtered = filtered.filter(d => {
                const client = this.clients.find(c => c.id === d.clientId);
                const property = this.properties.find(p => p.id === d.propertyId);
                return (client && `${client.firstName} ${client.lastName}`.toLowerCase().includes(search)) ||
                       (property && property.title.toLowerCase().includes(search));
            });
        }
        const stage = document.getElementById('filterStage').value;
        if (stage) filtered = filtered.filter(d => d.stage === stage);
        const agent = document.getElementById('filterAgent').value;
        if (agent) filtered = filtered.filter(d => d.agentId === parseInt(agent));
        const dateFrom = document.getElementById('filterDateFrom').value;
        if (dateFrom) filtered = filtered.filter(d => d.date >= dateFrom);
        const dateTo = document.getElementById('filterDateTo').value;
        if (dateTo) filtered = filtered.filter(d => d.date <= dateTo);
        filtered.sort((a, b) => {
            let aVal = a[this.sortField], bVal = b[this.sortField];
            if (this.sortField === 'client') {
                const ca = this.clients.find(c => c.id === a.clientId);
                const cb = this.clients.find(c => c.id === b.clientId);
                aVal = ca ? `${ca.firstName} ${ca.lastName}` : ''; bVal = cb ? `${cb.firstName} ${cb.lastName}` : '';
            }
            if (this.sortField === 'property') {
                const pa = this.properties.find(p => p.id === a.propertyId);
                const pb = this.properties.find(p => p.id === b.propertyId);
                aVal = pa ? pa.title : ''; bVal = pb ? pb.title : '';
            }
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            return this.sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
        });
        return filtered;
    }

    renderStats() {
        const userDeals = this.currentUser.role === 'admin' ? this.deals : this.deals.filter(d => d.agentId === this.currentUser.id);
        const totalAmount = userDeals.reduce((sum, d) => sum + d.amount, 0);
        const totalCommission = userDeals.reduce((sum, d) => sum + (d.commissionAmount || 0), 0);
        document.getElementById('statsGrid').innerHTML = `
            <div class="stat-card"><div class="stat-number">${userDeals.length}</div><div class="stat-label">Всего сделок</div></div>
            <div class="stat-card"><div class="stat-number">${userDeals.filter(d => d.stage === 'completed').length}</div><div class="stat-label">Завершено</div></div>
            <div class="stat-card"><div class="stat-number">${this.formatPrice(totalAmount)}</div><div class="stat-label">Общая сумма</div></div>
            <div class="stat-card"><div class="stat-number">${this.formatPrice(totalCommission)}</div><div class="stat-label">Общая комиссия</div></div>
        `;
    }

    renderDeals() {
        const filtered = this.getFilteredDeals();
        const totalPages = Math.ceil(filtered.length / this.itemsPerPage);
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const paginated = filtered.slice(start, start + this.itemsPerPage);
        const tbody = document.getElementById('dealsTableBody');
        if (paginated.length === 0) { tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Нет сделок</td></tr>'; return; }
        tbody.innerHTML = paginated.map(d => {
            const client = this.clients.find(c => c.id === d.clientId);
            const property = this.properties.find(p => p.id === d.propertyId);
            const agent = this.agents.find(a => a.id === d.agentId);
            const stageNames = { prelim: 'Предварительный', contract: 'Договор', payment: 'Оплата', registration: 'Регистрация', completed: 'Завершена', cancelled: 'Отменена' };
            return `
                <tr>
                    <td>${d.id}</td>
                    <td><a class="client-link" onclick="dealManager.viewClient(${d.clientId})">${client ? `${client.firstName} ${client.lastName}` : '—'}</a></td>
                    <td><a class="property-link" onclick="dealManager.viewProperty(${d.propertyId})">${property ? property.title : '—'}</a></td>
                    <td>${this.formatPrice(d.amount)}</td>
                    <td>${this.formatPrice(d.commissionAmount)}</td>
                    <td><span class="stage-badge stage-${d.stage}">${stageNames[d.stage]}</span></td>
                    <td>${agent ? `${agent.firstName} ${agent.lastName}` : '—'}</td>
                    <td class="action-buttons"><button class="icon-btn view" onclick="dealManager.viewDeal(${d.id})"><i class="fas fa-eye"></i></button><button class="icon-btn docs" onclick="dealManager.openDocsModal(${d.id})"><i class="fas fa-file-alt"></i></button></td>
                </tr>
            `;
        }).join('');
        this.renderPagination(totalPages);
    }

    renderPagination(totalPages) {
        const container = document.getElementById('pagination');
        if (totalPages <= 1) { container.innerHTML = ''; return; }
        let html = '';
        for (let i = 1; i <= Math.min(totalPages, 5); i++) {
            html += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" onclick="dealManager.goToPage(${i})">${i}</button>`;
        }
        container.innerHTML = html;
    }

    goToPage(page) { this.currentPage = page; this.renderDeals(); }
    sortTable(field) { if (this.sortField === field) this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'; else { this.sortField = field; this.sortOrder = 'asc'; } this.renderDeals(); }

    loadSelects() {
        const clientSelect = document.getElementById('dealClientId');
        const propertySelect = document.getElementById('dealPropertyId');
        const agentFilter = document.getElementById('filterAgent');
        if (clientSelect) clientSelect.innerHTML = '<option value="">Выберите клиента</option>' + this.clients.filter(c => c.agentId === this.currentUser.id || this.currentUser.role === 'admin').map(c => `<option value="${c.id}">${c.firstName} ${c.lastName}</option>`).join('');
        if (propertySelect) propertySelect.innerHTML = '<option value="">Выберите объект</option>' + this.properties.filter(p => p.status === 'available').map(p => `<option value="${p.id}">${p.title} - ${this.formatPrice(p.price)}</option>`).join('');
        if (agentFilter) agentFilter.innerHTML = '<option value="">Все</option>' + this.agents.map(a => `<option value="${a.id}">${a.firstName} ${a.lastName}</option>`).join('');
    }

    openDealModal(id = null) {
        if (id) { const d = this.deals.find(d => d.id === id); if (d) { document.getElementById('dealModalTitle').textContent = 'Редактирование сделки'; document.getElementById('dealId').value = d.id; document.getElementById('dealClientId').value = d.clientId; document.getElementById('dealPropertyId').value = d.propertyId; document.getElementById('dealAmount').value = d.amount; document.getElementById('dealCommissionPercent').value = d.commissionPercent; document.getElementById('dealStage').value = d.stage; document.getElementById('dealDate').value = d.date; document.getElementById('dealNotes').value = d.notes || ''; this.updateCommission(); } }
        else { document.getElementById('dealModalTitle').textContent = 'Новая сделка'; document.getElementById('dealForm').reset(); document.getElementById('dealId').value = ''; document.getElementById('dealDate').value = new Date().toISOString().split('T')[0]; document.getElementById('dealCommissionPercent').value = 5; this.updateCommission(); }
        document.getElementById('dealModal').classList.add('active');
    }

    saveDeal() {
        const id = document.getElementById('dealId').value;
        const amount = parseFloat(document.getElementById('dealAmount').value);
        const percent = parseFloat(document.getElementById('dealCommissionPercent').value);
        const dealData = {
            id: id ? parseInt(id) : Date.now(),
            clientId: parseInt(document.getElementById('dealClientId').value),
            propertyId: parseInt(document.getElementById('dealPropertyId').value),
            amount: amount,
            commissionPercent: percent,
            commissionAmount: amount * percent / 100,
            stage: document.getElementById('dealStage').value,
            date: document.getElementById('dealDate').value,
            notes: document.getElementById('dealNotes').value,
            agentId: this.currentUser.role === 'admin' ? (this.currentUser.id) : this.currentUser.id,
            createdAt: id ? this.deals.find(d => d.id === parseInt(id)).createdAt : new Date().toISOString().split('T')[0],
            documents: id ? this.deals.find(d => d.id === parseInt(id)).documents || [] : []
        };
        if (id) { const index = this.deals.findIndex(d => d.id === parseInt(id)); this.deals[index] = dealData; }
        else this.deals.unshift(dealData);
        localStorage.setItem('hermes_deals', JSON.stringify(this.deals));
        this.renderStats(); this.renderDeals(); this.closeDealModal();
        this.showNotification(id ? 'Сделка обновлена' : 'Сделка создана', 'success');
    }

    viewDeal(id) { window.location.href = `deal-detail.html?id=${id}`; }
    viewClient(id) { window.location.href = `client-detail.html?id=${id}`; }
    viewProperty(id) { window.location.href = `apartment${id}.html`; }

    openDocsModal(dealId) {
        const deal = this.deals.find(d => d.id === dealId);
        if (!deal) return;
        const docs = deal.documents || [];
        document.getElementById('docsModalBody').innerHTML = `
            <div class="documents-list">${docs.map(doc => `<div class="doc-item"><span><i class="fas fa-file-pdf"></i> ${doc.name}</span><button class="btn-download" onclick="dealManager.downloadDoc('${doc.url}')"><i class="fas fa-download"></i></button></div>`).join('') || '<p>Нет загруженных документов</p>'}</div>
            <div class="file-upload" onclick="document.getElementById('docFileInput').click()"><i class="fas fa-cloud-upload-alt"></i> Загрузить документ<input type="file" id="docFileInput" style="display:none" onchange="dealManager.uploadDocument(${dealId}, this)"></div>
            <div class="template-buttons" style="margin-top: 1rem;"><button class="btn btn-secondary" onclick="dealManager.generateContract(${dealId})"><i class="fas fa-file-contract"></i> Шаблон договора</button><button class="btn btn-secondary" onclick="dealManager.generateAct(${dealId})"><i class="fas fa-file-signature"></i> Акт приема-передачи</button></div>
        `;
        document.getElementById('docsModal').classList.add('active');
    }

    uploadDocument(dealId, input) {
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const deal = this.deals.find(d => d.id === dealId);
                if (deal) { if (!deal.documents) deal.documents = []; deal.documents.push({ name: file.name, url: e.target.result, uploadedAt: new Date().toISOString() }); localStorage.setItem('hermes_deals', JSON.stringify(this.deals)); this.openDocsModal(dealId); this.showNotification('Документ загружен', 'success'); }
            };
            reader.readAsDataURL(file);
        }
    }

    generateContract(dealId) { this.showNotification('Договор сформирован и готов к скачиванию', 'success'); }
    generateAct(dealId) { this.showNotification('Акт приема-передачи сформирован', 'success'); }
    downloadDoc(url) { window.open(url, '_blank'); }

    closeDealModal() { document.getElementById('dealModal').classList.remove('active'); }
    closeDocsModal() { document.getElementById('docsModal').classList.remove('active'); }
    formatPrice(price) { return new Intl.NumberFormat('ru-RU').format(price) + ' ₽'; }
    showNotification(msg, type) { const n = document.createElement('div'); n.className = `auth-notification ${type}`; n.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${msg}`; document.body.appendChild(n); setTimeout(() => n.remove(), 3000); }
    updateAuthUI() { const auth = document.getElementById('authSection'); if (auth && this.currentUser) auth.innerHTML = `<div class="user-menu"><div class="user-avatar">${this.currentUser.firstName?.charAt(0)}</div><div class="user-dropdown"><a href="dashboard.html">Кабинет</a><a href="#" onclick="AuthService.logout()">Выйти</a></div></div>`; }
}

let dealManager; document.addEventListener('DOMContentLoaded', () => { dealManager = new DealManager(); window.dealManager = dealManager; window.sortTable = (f) => dealManager.sortTable(f); window.openDealModal = (id) => dealManager.openDealModal(id); window.closeDealModal = () => dealManager.closeDealModal(); window.closeDocsModal = () => dealManager.closeDocsModal(); window.saveDeal = () => dealManager.saveDeal(); });