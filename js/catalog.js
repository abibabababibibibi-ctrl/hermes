// Catalog JavaScript
(function() {
    'use strict';

    // Configuration
    const config = {
        itemsPerPage: 9,
        currentPage: 1,
        currentView: 'grid',
        sortBy: 'price_asc',
        filters: {
            type: ['apartment', 'house'],
            price: { min: 0, max: 50000000 },
            rooms: [],
            area: { min: 0, max: 500 },
            district: '',
            status: 'all',
            search: ''
        }
    };

    // Sample properties data (in real app, this would come from API)
    const properties = [
        {
            id: 1,
            title: '3-комн. квартира в Центральном районе',
            price: 12500000,
            area: 85,
            rooms: 3,
            location: 'Центральный район, ул. Ленина, 15',
            type: 'apartment',
            status: 'available',
            description: 'Просторная 3-комнатная квартира в современном жилом комплексе с панорамными окнами и евроремонтом.',
            image: 'images/properties/1.jpg',
            images: ['1.jpg', '1-1.jpg', '1-2.jpg', '1-3.jpg'],
            features: ['панорамные окна', 'евроремонт', 'паркинг', 'лифт'],
            district: 'central',
            createdAt: '2024-01-15',
            isFeatured: true
        },
        {
            id: 2,
            title: '2-комн. квартира в Северном районе',
            price: 8200000,
            area: 65,
            rooms: 2,
            location: 'Северный район, пр. Мира, 42',
            type: 'apartment',
            status: 'available',
            description: 'Уютная 2-комнатная квартира в кирпичном доме с чистовой отделкой и новой кухней.',
            image: 'images/properties/2.jpg',
            images: ['2.jpg', '2-1.jpg', '2-2.jpg'],
            features: ['новая кухня', 'балкон', 'охрана', 'детская площадка'],
            district: 'north',
            createdAt: '2024-01-10',
            isFeatured: true
        },
        {
            id: 3,
            title: 'Загородный дом в Пригороде',
            price: 25000000,
            area: 150,
            rooms: 4,
            location: 'Пригород, с. Подгорное, ул. Садовая, 7',
            type: 'house',
            status: 'available',
            description: 'Просторный загородный дом с участком 10 соток, гаражом на 2 авто и зоной барбекю.',
            image: 'images/properties/3.jpg',
            images: ['3.jpg', '3-1.jpg', '3-2.jpg', '3-3.jpg'],
            features: ['участок 10 соток', 'гараж', 'камин', 'терраса'],
            district: 'suburb',
            createdAt: '2024-01-05',
            isFeatured: true
        },
        // Add more properties as needed
        {
            id: 4,
            title: '1-комн. квартира в Южном районе',
            price: 5500000,
            area: 45,
            rooms: 1,
            location: 'Южный район, ул. Солнечная, 25',
            type: 'apartment',
            status: 'available',
            description: 'Современная однокомнатная квартира в новостройке с отделкой под ключ.',
            image: 'images/properties/4.jpg',
            district: 'south',
            createdAt: '2024-01-20',
            isFeatured: false
        },
        {
            id: 5,
            title: 'Таунхаус в Западном районе',
            price: 18000000,
            area: 120,
            rooms: 3,
            location: 'Западный район, ЖК "Европейский", 15',
            type: 'house',
            status: 'reserved',
            description: 'Просторный таунхаус с двумя уровнями, отдельным входом и небольшим садом.',
            image: 'images/properties/5.jpg',
            district: 'west',
            createdAt: '2024-01-18',
            isFeatured: false
        },
        {
            id: 6,
            title: 'Студия в Центральном районе',
            price: 4500000,
            area: 35,
            rooms: 0,
            location: 'Центральный район, ул. Центральная, 8',
            type: 'apartment',
            status: 'available',
            description: 'Уютная студия в историческом центре с высокими потолками и французскими окнами.',
            image: 'images/properties/6.jpg',
            district: 'central',
            createdAt: '2024-01-22',
            isFeatured: false
        }
    ];

    // Initialize catalog
    function initCatalog() {
        console.log('Initializing catalog...');

        // Load properties from localStorage or use sample data
        const savedProperties = JSON.parse(localStorage.getItem('hermes_properties'));
        if (savedProperties && savedProperties.length > 0) {
            window.catalogProperties = savedProperties;
        } else {
            window.catalogProperties = properties;
        }

        // Update filter count
        updateFilterCount();
    }

    // Load and display properties
    function loadProperties() {
        const filteredProperties = filterProperties();
        const sortedProperties = sortProperties(filteredProperties);
        const paginatedProperties = paginateProperties(sortedProperties);

        renderProperties(paginatedProperties);
        renderPagination(filteredProperties.length);

        // Show/hide empty state
        const emptyState = document.getElementById('emptyState');
        if (filteredProperties.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
        }
    }

    // Filter properties based on current filters
    function filterProperties() {
        return window.catalogProperties.filter(property => {
            // Type filter
            if (config.filters.type.length > 0 && !config.filters.type.includes(property.type)) {
                return false;
            }

            // Price filter
            if (property.price < config.filters.price.min || property.price > config.filters.price.max) {
                return false;
            }

            // Rooms filter
            if (config.filters.rooms.length > 0) {
                const roomValue = property.rooms === 0 ? 'studio' : property.rooms.toString();
                if (!config.filters.rooms.includes(roomValue)) {
                    return false;
                }
            }

            // Area filter
            if (property.area < config.filters.area.min || property.area > config.filters.area.max) {
                return false;
            }

            // District filter
            if (config.filters.district && property.district !== config.filters.district) {
                return false;
            }

            // Status filter
            if (config.filters.status !== 'all' && property.status !== config.filters.status) {
                return false;
            }

            // Search filter
            if (config.filters.search) {
                const searchTerm = config.filters.search.toLowerCase();
                const searchFields = [property.title, property.description, property.location, property.district];
                const matches = searchFields.some(field =>
                    field && field.toLowerCase().includes(searchTerm)
                );
                if (!matches) {
                    return false;
                }
            }

            return true;
        });
    }

    // Sort properties
    function sortProperties(propertiesList) {
        return [...propertiesList].sort((a, b) => {
            switch (config.sortBy) {
                case 'price_asc':
                    return a.price - b.price;
                case 'price_desc':
                    return b.price - a.price;
                case 'area_desc':
                    return b.area - a.area;
                case 'date_desc':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'popular':
                    return (b.views || 0) - (a.views || 0);
                default:
                    return 0;
            }
        });
    }

    // Paginate properties
    function paginateProperties(propertiesList) {
        const startIndex = (config.currentPage - 1) * config.itemsPerPage;
        const endIndex = startIndex + config.itemsPerPage;
        return propertiesList.slice(startIndex, endIndex);
    }

    // Render properties in grid view
    function renderProperties(propertiesList) {
        const gridContainer = document.getElementById('propertiesGrid');
        const listContainer = document.getElementById('propertiesList');

        if (config.currentView === 'grid') {
            gridContainer.style.display = 'grid';
            listContainer.style.display = 'none';
            gridContainer.innerHTML = propertiesList.map(property => createPropertyCard(property)).join('');
        } else {
            gridContainer.style.display = 'none';
            listContainer.style.display = 'flex';
            listContainer.innerHTML = propertiesList.map(property => createPropertyListItem(property)).join('');
        }

        // Add event listeners to favorite buttons
        document.querySelectorAll('.property-favorite').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const propertyId = parseInt(this.dataset.propertyId);
                toggleFavorite(propertyId, this);
            });
        });
    }

    // Create property card HTML for grid view
    function createPropertyCard(property) {
        const isFavorite = checkIfFavorite(property.id);

        return `
            <div class="property-card" data-id="${property.id}">
                ${property.status === 'reserved' ? '<div class="property-badge">Забронировано</div>' : ''}

                <div class="property-image">
                    <img src="images/properties/studio.jpeg" alt="${property.title}">
                    <div class="property-favorite ${isFavorite ? 'active' : ''}" data-property-id="${property.id}">
                        <i class="fas fa-heart"></i>
                    </div>
                </div>

                <div class="property-info">
                    <div class="property-header">
                        <h3 class="property-title">
                            <a href="apartment${property.id}.html">${property.title}</a>
                        </h3>
                        <p class="property-location">
                            <i class="fas fa-map-marker-alt"></i> ${property.location}
                        </p>
                    </div>

                    <div class="property-features">
                        <div class="property-feature">
                            <i class="fas fa-vector-square"></i> ${property.area} м²
                        </div>
                        <div class="property-feature">
                            <i class="fas fa-bed"></i> ${property.rooms === 0 ? 'Студия' : property.rooms + ' комн.'}
                        </div>
                        <div class="property-feature">
                            <i class="fas fa-layer-group"></i> ${property.type === 'apartment' ? 'Квартира' : 'Дом'}
                        </div>
                    </div>

                    <div class="property-price">${formatPrice(property.price)}</div>

                    <div class="property-actions">
                        <a href="apartment${property.id}.html" class="btn btn-primary">
                            <i class="fas fa-eye"></i> Подробнее
                        </a>
                        <button class="btn btn-secondary" onclick="scheduleViewing(${property.id})">
                            <i class="fas fa-calendar"></i> Посмотреть
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Create property list item HTML for list view
    function createPropertyListItem(property) {
        const isFavorite = checkIfFavorite(property.id);

        return `
            <div class="property-list-item" data-id="${property.id}">
                <div class="property-list-image">
                    <img src="${property.image}" alt="${property.title}">
                </div>

                <div class="property-list-content">
                    <div class="property-list-header">
                        <div>
                            <h3 class="property-list-title">
                                <a href="properties/apartment${property.id}.html">${property.title}</a>
                            </h3>
                            <p class="property-location">
                                <i class="fas fa-map-marker-alt"></i> ${property.location}
                            </p>
                        </div>
                        <div class="property-favorite ${isFavorite ? 'active' : ''}" data-property-id="${property.id}">
                            <i class="fas fa-heart"></i>
                        </div>
                    </div>

                    <p class="property-list-description">${property.description}</p>

                    <div class="property-list-footer">
                        <div class="property-features">
                            <span class="property-feature">
                                <i class="fas fa-vector-square"></i> ${property.area} м²
                            </span>
                            <span class="property-feature">
                                <i class="fas fa-bed"></i> ${property.rooms === 0 ? 'Студия' : property.rooms + ' комн.'}
                            </span>
                            <span class="property-feature">
                                <i class="fas fa-layer-group"></i> ${property.type === 'apartment' ? 'Квартира' : 'Дом'}
                            </span>
                        </div>

                        <div class="property-list-actions">
                            <div class="property-price">${formatPrice(property.price)}</div>
                            <div class="property-buttons">
                                <a href="apartment${property.id}.html" class="btn btn-primary btn-sm">
                                    <i class="fas fa-eye"></i> Подробнее
                                </a>
                                <button class="btn btn-secondary btn-sm" onclick="scheduleViewing(${property.id})">
                                    <i class="fas fa-calendar"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Render pagination
    function renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / config.itemsPerPage);
        const pagination = document.getElementById('pagination');
        const pageNumbers = document.getElementById('pageNumbers');

        if (totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }

        pagination.style.display = 'flex';

        // Update prev/next buttons
        const prevBtn = pagination.querySelector('.prev');
        const nextBtn = pagination.querySelector('.next');

        prevBtn.disabled = config.currentPage === 1;
        nextBtn.disabled = config.currentPage === totalPages;

        // Generate page numbers
        let pagesHTML = '';
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            // Show all pages
            for (let i = 1; i <= totalPages; i++) {
                pagesHTML += `<span class="page-number ${i === config.currentPage ? 'active' : ''}"
                                      onclick="goToPage(${i})">${i}</span>`;
            }
        } else {
            // Show pages with ellipsis
            let startPage, endPage;

            if (config.currentPage <= 3) {
                startPage = 1;
                endPage = 4;
                pagesHTML = `
                    ${generatePageNumbers(startPage, endPage)}
                    <span class="page-dots">...</span>
                    <span class="page-number" onclick="goToPage(${totalPages})">${totalPages}</span>
                `;
            } else if (config.currentPage >= totalPages - 2) {
                startPage = totalPages - 3;
                endPage = totalPages;
                pagesHTML = `
                    <span class="page-number" onclick="goToPage(1)">1</span>
                    <span class="page-dots">...</span>
                    ${generatePageNumbers(startPage, endPage)}
                `;
            } else {
                startPage = config.currentPage - 1;
                endPage = config.currentPage + 1;
                pagesHTML = `
                    <span class="page-number" onclick="goToPage(1)">1</span>
                    <span class="page-dots">...</span>
                    ${generatePageNumbers(startPage, endPage)}
                    <span class="page-dots">...</span>
                    <span class="page-number" onclick="goToPage(${totalPages})">${totalPages}</span>
                `;
            }
        }

        pageNumbers.innerHTML = pagesHTML;
    }

    function generatePageNumbers(start, end) {
        let html = '';
        for (let i = start; i <= end; i++) {
            html += `<span class="page-number ${i === config.currentPage ? 'active' : ''}"
                           onclick="goToPage(${i})">${i}</span>`;
        }
        return html;
    }

    // Load featured properties
    function loadFeaturedProperties() {
        const featuredProperties = window.catalogProperties.filter(p => p.isFeatured).slice(0, 3);
        const featuredGrid = document.getElementById('featuredGrid');

        if (featuredProperties.length > 0) {
            featuredGrid.innerHTML = featuredProperties.map(property => `
                <div class="property-card">
                    <div class="property-image">
                        <img src="${property.image}" alt="${property.title}">
                        <div class="property-badge">Рекомендуем</div>
                    </div>
                    <div class="property-info">
                        <h3 class="property-title">
                            <a href="apartment${property.id}.html">${property.title}</a>
                        </h3>
                        <p class="property-location">
                            <i class="fas fa-map-marker-alt"></i> ${property.location}
                        </p>
                        <div class="property-features">
                            <div class="property-feature">
                                <i class="fas fa-vector-square"></i> ${property.area} м²
                            </div>
                            <div class="property-feature">
                                <i class="fas fa-bed"></i> ${property.rooms === 0 ? 'Студия' : property.rooms + ' комн.'}
                            </div>
                        </div>
                        <div class="property-price">${formatPrice(property.price)}</div>
                        <a href="apartment${property.id}.html" class="btn btn-primary btn-block">
                            <i class="fas fa-eye"></i> Посмотреть
                        </a>
                    </div>
                </div>
            `).join('');
        }
    }

    // Apply filters from form
    function applyFilters() {
        // Get type filters
        config.filters.type = Array.from(document.querySelectorAll('input[name="type"]:checked'))
            .map(input => input.value);

        // Get price filters
        const minPrice = parseInt(document.getElementById('minPrice').value) || 0;
        const maxPrice = parseInt(document.getElementById('maxPrice').value) || 50000000;
        config.filters.price = { min: minPrice, max: maxPrice };

        // Get rooms filters
        config.filters.rooms = Array.from(document.querySelectorAll('input[name="rooms"]:checked'))
            .map(input => input.value);

        // Get area filters
        const minArea = parseInt(document.getElementById('minArea').value) || 0;
        const maxArea = parseInt(document.getElementById('maxArea').value) || 500;
        config.filters.area = { min: minArea, max: maxArea };

        // Get district filter
        config.filters.district = document.getElementById('districtSelect').value;

        // Get status filter
        const statusRadio = document.querySelector('input[name="status"]:checked');
        config.filters.status = statusRadio ? statusRadio.value : 'all';

        // Reset to first page
        config.currentPage = 1;

        // Save filters to localStorage
        saveFilters();

        // Reload properties
        loadProperties();
    }

    // Reset all filters
    function resetFilters() {
        // Reset checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

        // Check default type filters
        document.querySelectorAll('input[name="type"][value="apartment"], input[name="type"][value="house"]')
            .forEach(cb => cb.checked = true);

        // Reset price inputs
        document.getElementById('minPrice').value = '';
        document.getElementById('maxPrice').value = '';

        // Reset area inputs
        document.getElementById('minArea').value = '';
        document.getElementById('maxArea').value = '';

        // Reset district select
        document.getElementById('districtSelect').value = '';

        // Reset status radio
        document.querySelector('input[name="status"][value="all"]').checked = true;

        // Reset price sliders
        document.getElementById('priceRangeMin').value = 0;
        document.getElementById('priceRangeMax').value = 50000000;

        // Reset config
        config.filters = {
            type: ['apartment', 'house'],
            price: { min: 0, max: 50000000 },
            rooms: [],
            area: { min: 0, max: 500 },
            district: '',
            status: 'all',
            search: ''
        };

        config.currentPage = 1;

        // Clear saved filters
        localStorage.removeItem('catalog_filters');

        // Reload properties
        loadProperties();
    }

    // Save filters to localStorage
    function saveFilters() {
        localStorage.setItem('catalog_filters', JSON.stringify(config.filters));
    }

    // Load saved filters from localStorage
    function loadSavedFilters() {
        const savedFilters = JSON.parse(localStorage.getItem('catalog_filters'));
        if (savedFilters) {
            config.filters = savedFilters;
            applySavedFiltersToUI();
        }
    }

    // Apply saved filters to UI
    function applySavedFiltersToUI() {
        // Apply type filters
        document.querySelectorAll('input[name="type"]').forEach(cb => {
            cb.checked = config.filters.type.includes(cb.value);
        });

        // Apply price filters
        document.getElementById('minPrice').value = config.filters.price.min || '';
        document.getElementById('maxPrice').value = config.filters.price.max || '';

        // Apply rooms filters
        document.querySelectorAll('input[name="rooms"]').forEach(cb => {
            cb.checked = config.filters.rooms.includes(cb.value);
        });

        // Apply area filters
        document.getElementById('minArea').value = config.filters.area.min || '';
        document.getElementById('maxArea').value = config.filters.area.max || '';

        // Apply district filter
        document.getElementById('districtSelect').value = config.filters.district || '';

        // Apply status filter
        document.querySelector(`input[name="status"][value="${config.filters.status}"]`).checked = true;
    }

    // Update filter count
    function updateFilterCount() {
        const filteredProperties = filterProperties();
        document.getElementById('filterCount').textContent = filteredProperties.length;
    }

    // Change view (grid/list)
    function changeView(view) {
        config.currentView = view;

        // Update active button
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Reload properties with new view
        loadProperties();

        // Save preference
        localStorage.setItem('catalog_view', view);
    }

    // Sort properties
    function sortPropertiesHandler() {
        const sortSelect = document.getElementById('sortSelect');
        config.sortBy = sortSelect.value;
        loadProperties();

        // Save preference
        localStorage.setItem('catalog_sort', config.sortBy);
    }

    // Go to specific page
    function goToPage(page) {
        config.currentPage = page;
        loadProperties();

        // Scroll to top of properties
        document.querySelector('.properties-container').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    // Go to previous page
    function prevPage() {
        if (config.currentPage > 1) {
            goToPage(config.currentPage - 1);
        }
    }

    // Go to next page
    function nextPage() {
        const totalItems = filterProperties().length;
        const totalPages = Math.ceil(totalItems / config.itemsPerPage);

        if (config.currentPage < totalPages) {
            goToPage(config.currentPage + 1);
        }
    }

    // Perform search
    function performSearch() {
        const searchInput = document.getElementById('searchInput');
        config.filters.search = searchInput.value.trim();
        config.currentPage = 1;
        loadProperties();
    }

    // Initialize price slider
    function initPriceSlider() {
        const minSlider = document.getElementById('priceRangeMin');
        const maxSlider = document.getElementById('priceRangeMax');
        const minInput = document.getElementById('minPrice');
        const maxInput = document.getElementById('maxPrice');

        function updatePriceInputs() {
            minInput.value = formatNumber(minSlider.value);
            maxInput.value = formatNumber(maxSlider.value);
            config.filters.price.min = parseInt(minSlider.value);
            config.filters.price.max = parseInt(maxSlider.value);
            updateFilterCount();
        }

        minSlider.addEventListener('input', updatePriceInputs);
        maxSlider.addEventListener('input', updatePriceInputs);

        minInput.addEventListener('change', function() {
            const value = parseInt(this.value.replace(/\s/g, '')) || 0;
            minSlider.value = Math.min(value, maxSlider.value);
            updatePriceInputs();
        });

        maxInput.addEventListener('change', function() {
            const value = parseInt(this.value.replace(/\s/g, '')) || 50000000;
            maxSlider.value = Math.max(value, minSlider.value);
            updatePriceInputs();
        });
    }

    // Toggle favorite property
    function toggleFavorite(propertyId, button) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) {
            alert('Для добавления в избранное необходимо войти в систему.');
            window.location.href = 'login.html';
            return;
        }

        let favorites = JSON.parse(localStorage.getItem('user_favorites')) || {};
        if (!favorites[user.id]) {
            favorites[user.id] = [];
        }

        const userFavorites = favorites[user.id];
        const index = userFavorites.indexOf(propertyId);

        if (index === -1) {
            userFavorites.push(propertyId);
            button.classList.add('active');
            showNotification('Объект добавлен в избранное', 'success');
        } else {
            userFavorites.splice(index, 1);
            button.classList.remove('active');
            showNotification('Объект удален из избранного', 'info');
        }

        favorites[user.id] = userFavorites;
        localStorage.setItem('user_favorites', JSON.stringify(favorites));
    }

    // Check if property is in favorites
    function checkIfFavorite(propertyId) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) return false;

        const favorites = JSON.parse(localStorage.getItem('user_favorites')) || {};
        const userFavorites = favorites[user.id] || [];
        return userFavorites.includes(propertyId);
    }

    // Schedule viewing
    function scheduleViewing(propertyId) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) {
            alert('Для записи на просмотр необходимо войти в систему.');
            window.location.href = 'login.html';
            return;
        }

        const property = window.catalogProperties.find(p => p.id === propertyId);
        if (!property) return;

        const message = `Хочу записаться на просмотр объекта: ${property.title}\nСвяжитесь со мной для уточнения времени.`;

        // In a real app, this would create an application
        showNotification('Заявка на просмотр отправлена! Мы свяжемся с вами в ближайшее время.', 'success');

        // Log the action
        console.log('Viewing scheduled:', { propertyId, userId: user.id });
    }

    // Save search
    function saveSearch() {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) {
            alert('Для сохранения поиска необходимо войти в систему.');
            window.location.href = 'login.html';
            return;
        }

        const searchName = prompt('Введите название для сохраненного поиска:', 'Мой поиск');
        if (!searchName) return;

        let savedSearches = JSON.parse(localStorage.getItem('user_saved_searches')) || {};
        if (!savedSearches[user.id]) {
            savedSearches[user.id] = [];
        }

        savedSearches[user.id].push({
            name: searchName,
            filters: { ...config.filters },
            sortBy: config.sortBy,
            date: new Date().toISOString()
        });

        localStorage.setItem('user_saved_searches', JSON.stringify(savedSearches));
        showNotification('Поиск сохранен!', 'success');
    }

    // Share catalog
    function shareCatalog() {
        const url = window.location.href;
        const title = 'Каталог недвижимости - Гермес';
        const text = 'Посмотрите этот каталог недвижимости!';

        if (navigator.share) {
            navigator.share({
                title: title,
                text: text,
                url: url,
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(url).then(() => {
                showNotification('Ссылка скопирована в буфер обмена!', 'success');
            });
        }
    }

    // Utility functions
    function formatPrice(price) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    }

    function formatNumber(num) {
        return new Intl.NumberFormat('ru-RU').format(num);
    }

    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }

        .btn-block { width: 100%; }
        .btn-sm { padding: 8px 16px; font-size: 0.9rem; }
    `;
    document.head.appendChild(style);

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initCatalog();

        // Load saved preferences
        const savedView = localStorage.getItem('catalog_view');
        if (savedView) {
            changeView(savedView);
        }

        const savedSort = localStorage.getItem('catalog_sort');
        if (savedSort) {
            document.getElementById('sortSelect').value = savedSort;
            config.sortBy = savedSort;
        }

        // Set up event listeners
        document.getElementById('sortSelect').addEventListener('change', sortPropertiesHandler);

        // Add input event listeners for real-time filtering
        document.querySelectorAll('.filter-option input, .room-option input, .status-option input')
            .forEach(input => {
                input.addEventListener('change', updateFilterCount);
            });

        document.getElementById('districtSelect').addEventListener('change', updateFilterCount);
        document.getElementById('minPrice').addEventListener('input', updateFilterCount);
        document.getElementById('maxPrice').addEventListener('input', updateFilterCount);
        document.getElementById('minArea').addEventListener('input', updateFilterCount);
        document.getElementById('maxArea').addEventListener('input', updateFilterCount);
        document.getElementById('searchInput').addEventListener('input', function() {
            config.filters.search = this.value.trim();
            updateFilterCount();
        });

        // Load properties
        loadProperties();
        loadFeaturedProperties();
    });

    // Expose functions to global scope
    window.loadProperties = loadProperties;
    window.loadFeaturedProperties = loadFeaturedProperties;
    window.applyFilters = applyFilters;
    window.resetFilters = resetFilters;
    window.changeView = changeView;
    window.sortProperties = sortPropertiesHandler;
    window.goToPage = goToPage;
    window.prevPage = prevPage;
    window.nextPage = nextPage;
    window.performSearch = performSearch;
    window.scheduleViewing = scheduleViewing;
    window.saveSearch = saveSearch;
    window.shareCatalog = shareCatalog;

})();

// Добавьте в catalog.js
function buyFromCatalog(propertyId) {
    const property = window.catalogProperties.find(p => p.id === propertyId);
    if (!property) return;

    // Показываем модальное окно покупки
    if (window.quickOrder && window.quickOrder.buyWithoutRegistration) {
        window.quickOrder.buyWithoutRegistration(propertyId, property);
    } else {
        // Fallback
        alert('Хотите купить этот объект? Позвоните нам: +7 (495) 123-45-67');
    }
}

// Обновите создание карточек в каталоге, добавив кнопку покупки:
function createPropertyCard(property) {
    // ... существующий код ...

    return `
        <div class="property-card" data-id="${property.id}">
            <!-- ... существующий код ... -->

            <div class="property-actions">
                <a href="apartment${property.id}.html" class="btn btn-primary">
                    <i class="fas fa-eye"></i> Подробнее
                </a>
                <button class="btn btn-success" onclick="buyFromCatalog(${property.id})">
                    <i class="fas fa-shopping-cart"></i> Купить
                </button>
            </div>
        </div>
    `;
}

// Добавьте в catalog.js
function initFilterOverlay() {
    const filterToggle = document.getElementById('filterToggle');
    const filterSection = document.querySelector('.filters-section');
    const closeFilterBtn = document.querySelector('.close-filters');

    if (filterToggle && filterSection) {
        // Открытие/закрытие фильтров
        filterToggle.addEventListener('click', () => {
            filterSection.classList.toggle('active');

            // Меняем иконку
            const icon = filterToggle.querySelector('i');
            if (filterSection.classList.contains('active')) {
                icon.className = 'fas fa-times';
                filterToggle.setAttribute('aria-label', 'Закрыть фильтры');
            } else {
                icon.className = 'fas fa-filter';
                filterToggle.setAttribute('aria-label', 'Открыть фильтры');
            }
        });

        // Закрытие при клике вне области фильтров
        document.addEventListener('click', (e) => {
            if (filterSection.classList.contains('active') &&
                !filterSection.contains(e.target) &&
                e.target !== filterToggle &&
                !filterToggle.contains(e.target)) {
                filterSection.classList.remove('active');
                filterToggle.querySelector('i').className = 'fas fa-filter';
                filterToggle.setAttribute('aria-label', 'Открыть фильтры');
            }
        });

        // Закрытие на Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && filterSection.classList.contains('active')) {
                filterSection.classList.remove('active');
                filterToggle.querySelector('i').className = 'fas fa-filter';
                filterToggle.setAttribute('aria-label', 'Открыть фильтры');
            }
        });
    }

    // Закрытие фильтров после применения
    const applyBtn = document.querySelector('.filters-footer .btn-primary');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            setTimeout(() => {
                filterSection.classList.remove('active');
                if (filterToggle) {
                    filterToggle.querySelector('i').className = 'fas fa-filter';
                    filterToggle.setAttribute('aria-label', 'Открыть фильтры');
                }
            }, 500); // Небольшая задержка чтобы пользователь увидел результат
        });
    }
}

// Вызовите функцию при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initFilterOverlay();
    // ... остальной код инициализации
});

// Обновите функцию resetFilters чтобы закрывать шторку
function resetFilters() {
    // ... существующий код сброса фильтров ...

    // Закрываем шторку
    const filterSection = document.querySelector('.filters-section');
    const filterToggle = document.getElementById('filterToggle');

    if (filterSection && filterToggle) {
        filterSection.classList.remove('active');
        filterToggle.querySelector('i').className = 'fas fa-filter';
        filterToggle.setAttribute('aria-label', 'Открыть фильтры');
    }
}

// В catalog.js обновите массив properties:
const properties = [
    {
        id: 4,
        title: '1-комн. квартира в Южном районе',
        price: 5500000,
        area: 45,
        rooms: 1,
        location: 'Южный район, ул. Солнечная, 25',
        type: 'apartment',
        status: 'available',
        description: 'Современная однокомнатная квартира в новостройке с отделкой под ключ.',
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop',
        images: ['1.jpg'],
        features: ['новая отделка', 'панорамные окна', 'встроенная кухня'],
        district: 'south',
        createdAt: '2024-01-20',
        isFeatured: false
    },
    {
        id: 5,
        title: 'Таунхаус в Западном районе',
        price: 18000000,
        area: 120,
        rooms: 3,
        location: 'Западный район, ЖК "Европейский", 15',
        type: 'house',
        status: 'reserved',
        description: 'Просторный таунхаус с двумя уровнями, отдельным входом и небольшим садом.',
        image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w-800&auto=format&fit=crop',
        images: ['2.jpg'],
        features: ['2 уровня', 'отдельный вход', 'сад', 'гараж'],
        district: 'west',
        createdAt: '2024-01-18',
        isFeatured: false
    },
    {
        id: 6,
        title: 'Студия в Центральном районе',
        price: 4500000,
        area: 35,
        rooms: 0,
        location: 'Центральный район, ул. Центральная, 8',
        type: 'apartment',
        status: 'available',
        description: 'Уютная студия в историческом центре с высокими потолками и французскими окнами.',
        images: ['images/properties/studio.jpeg'],
        features: ['высокие потолки', 'французские окна', 'исторический центр'],
        district: 'central',
        createdAt: '2024-01-22',
        isFeatured: false
    }
    // ... остальные объекты
];