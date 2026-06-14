// Theme switching functionality
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.currentTheme = this.getSavedTheme() || 'light';
        console.log('ThemeManager initialized, current theme:', this.currentTheme);
    }

    init() {
        console.log('Initializing theme manager...');

        // Apply saved theme
        this.applyTheme(this.currentTheme);

        // Find or create theme toggle button
        if (!this.themeToggle) {
            console.log('Theme toggle not found, searching...');
            this.themeToggle = document.querySelector('.theme-toggle');
        }

        if (this.themeToggle) {
            console.log('Found theme toggle:', this.themeToggle);
            this.themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Theme toggle clicked');
                this.toggleTheme();
            });

            // Update button text immediately
            this.updateToggleButton(this.currentTheme);
        } else {
            console.warn('Theme toggle button not found!');
            // Create one if missing
            this.createThemeToggle();
        }

        // Listen for theme changes from other tabs/windows
        window.addEventListener('storage', (e) => {
            if (e.key === 'theme') {
                console.log('Theme changed from another tab:', e.newValue);
                this.applyTheme(e.newValue);
            }
        });

        console.log('Theme manager initialized successfully');
    }

    createThemeToggle() {
        console.log('Creating theme toggle button...');
        const toggle = document.createElement('button');
        toggle.id = 'themeToggle';
        toggle.className = 'theme-toggle';
        toggle.innerHTML = '<span class="theme-icon">🌙</span><span class="theme-text">Темная тема</span>';
        toggle.setAttribute('aria-label', 'Переключить тему');

        // Add to navigation
        const navActions = document.querySelector('.nav-actions');
        if (navActions) {
            navActions.prepend(toggle);
            this.themeToggle = toggle;
            this.themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
            console.log('Theme toggle created and added to nav');
        }
    }

    getSavedTheme() {
        // Check localStorage
        const savedTheme = localStorage.getItem('theme');
        console.log('Saved theme from localStorage:', savedTheme);

        // Check system preference if no saved theme
        if (!savedTheme) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            console.log('System prefers dark theme:', prefersDark);
            return prefersDark ? 'dark' : 'light';
        }

        return savedTheme;
    }

    applyTheme(theme) {
        console.log('Applying theme:', theme);

        // Set data attribute on html element
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;

        // Update toggle button
        this.updateToggleButton(theme);

        // Save to localStorage
        try {
            localStorage.setItem('theme', theme);
            console.log('Theme saved to localStorage:', theme);
        } catch (e) {
            console.error('Failed to save theme to localStorage:', e);
        }

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    }

    updateToggleButton(theme) {
        const icon = this.themeToggle?.querySelector('.theme-icon');
        const text = this.themeToggle?.querySelector('.theme-text');

        if (!this.themeToggle || !icon) return;

        console.log('Updating toggle button for theme:', theme);

        if (theme === 'dark') {
            icon.textContent = '☀️';
            if (text) text.textContent = 'Светлая тема';
            this.themeToggle.setAttribute('aria-label', 'Переключить на светлую тему');
        } else {
            icon.textContent = '🌙';
            if (text) text.textContent = 'Темная тема';
            this.themeToggle.setAttribute('aria-label', 'Переключить на темную тему');
        }
    }

    toggleTheme() {
        console.log('Toggling theme from', this.currentTheme);
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        console.log('New theme will be:', newTheme);
        this.applyTheme(newTheme);
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            console.log('Setting theme to:', theme);
            this.applyTheme(theme);
        }
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing theme...');

    // Create global theme manager
    window.themeManager = new ThemeManager();
    window.themeManager.init();

    // Add debug function
    window.debugTheme = function() {
        console.log('Current theme:', window.themeManager.getCurrentTheme());
        console.log('HTML data-theme:', document.documentElement.getAttribute('data-theme'));
        console.log('LocalStorage theme:', localStorage.getItem('theme'));
        console.log('Theme toggle element:', document.getElementById('themeToggle'));
    };

    console.log('Theme system ready. Use debugTheme() for troubleshooting.');
});

// Simple fallback if class doesn't load
if (typeof ThemeManager === 'undefined') {
    console.warn('ThemeManager class not found, using fallback');

    document.addEventListener('DOMContentLoaded', () => {
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                const html = document.documentElement;
                const currentTheme = html.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

                html.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);

                // Update button
                const icon = this.querySelector('.theme-icon');
                const text = this.querySelector('.theme-text');

                if (newTheme === 'dark') {
                    if (icon) icon.textContent = '☀️';
                    if (text) text.textContent = 'Светлая тема';
                } else {
                    if (icon) icon.textContent = '🌙';
                    if (text) text.textContent = 'Темная тема';
                }

                console.log('Theme toggled to:', newTheme);
            });
        }

        // Apply saved theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    });
}