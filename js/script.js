// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Function to scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Header background on scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = '#fff';
        header.style.backdropFilter = 'none';
    }
});

// Form submission
document.querySelector('.contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: this.querySelector('input[type="text"]').value,
        phone: this.querySelector('input[type="tel"]').value,
        email: this.querySelector('input[type="email"]').value,
        message: this.querySelector('textarea').value
    };
    
    // Here you would typically send the data to a server
    console.log('Form submitted:', formData);
    
    // Show success message
    alert('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
    
    // Reset form
    this.reset();
});

// Simple property data (you can expand this)
const properties = [
    {
        title: "3-комн. квартира",
        location: "Центральный район",
        price: "12 500 000 ₽",
        area: "85 м²"
    },
    {
        title: "2-комн. квартира",
        location: "Северный район",
        price: "8 200 000 ₽",
        area: "65 м²"
    },
    {
        title: "Загородный дом",
        location: "Пригород",
        price: "25 000 000 ₽",
        area: "150 м²"
    }
];

// You can use this data to dynamically populate properties
function loadProperties() {
    // Implementation for dynamic property loading
    console.log('Properties loaded:', properties);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadProperties();
});

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

function initThemeFeatures() {
    // Проверяем, есть ли переключатель темы
    if (!document.getElementById('themeToggle')) {
        // Создаем переключатель, если его нет
        const themeToggle = document.createElement('button');
        themeToggle.id = 'themeToggle';
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = '<span class="theme-icon">🌙</span><span class="theme-text">Темная тема</span>';
        themeToggle.setAttribute('aria-label', 'Переключить тему');

        // Добавляем в навигацию
        const navActions = document.querySelector('.nav-actions');
        if (navActions) {
            navActions.prepend(themeToggle);
        }
    }

    // Инициализируем тему
    if (window.themeManager) {
        window.themeManager.init();
    }
}

// Вызовите эту функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initThemeFeatures();

    // ... остальной код ...
});