const isDebug = new URLSearchParams(window.location.search).get('debug') === 'true';

const parks = [
    { 
        id: 'puydufou', 
        name: 'Puy du Fou', 
        centerLat: 46.892, 
        centerLng: -0.930, 
        zoom: 15, 
        locations: [
            { pano: 'https://pannellum.org/images/alma.jpg', lat: 46.8925, lng: -0.9305 },
            { pano: 'https://pannellum.org/images/bma-0.jpg', lat: 46.8910, lng: -0.9290 },
            { pano: 'https://pannellum.org/images/alma.jpg', lat: 46.8930, lng: -0.9315 }
        ]
    },
    { 
        id: 'asterix', 
        name: 'Parc Astérix', 
        centerLat: 49.134, 
        centerLng: 2.571, 
        zoom: 15, 
        locations: [
            { pano: 'https://pannellum.org/images/alma.jpg', lat: 49.1345, lng: 2.5715 },
            { pano: 'https://pannellum.org/images/bma-0.jpg', lat: 49.1330, lng: 2.5700 },
            { pano: 'https://pannellum.org/images/alma.jpg', lat: 49.1350, lng: 2.5720 }
        ]
    },
    { 
        id: 'disneyland', 
        name: 'Disneyland Paris', 
        centerLat: 48.872, 
        centerLng: 2.775, 
        zoom: 14, 
        locations: [
            { pano: 'https://pannellum.org/images/alma.jpg', lat: 48.8725, lng: 2.7755 },
            { pano: 'https://pannellum.org/images/bma-0.jpg', lat: 48.8710, lng: 2.7740 },
            { pano: 'https://pannellum.org/images/alma.jpg', lat: 48.8730, lng: 2.7760 }
        ]
    },
    { 
        id: 'futuroscope', 
        name: 'Futuroscope', 
        centerLat: 46.669, 
        centerLng: 0.366, 
        zoom: 15, 
        locations: [
            { pano: 'https://pannellum.org/images/alma.jpg', lat: 46.6695, lng: 0.3665 },
            { pano: 'https://pannellum.org/images/bma-0.jpg', lat: 46.6680, lng: 0.3650 },
            { pano: 'https://pannellum.org/images/alma.jpg', lat: 46.6700, lng: 0.3670 }
        ]
    },
    { 
        id: 'ogliss', 
        name: 'O\'Gliss Parc', 
        centerLat: 46.425, 
        centerLng: -1.488, 
        zoom: 16, 
        locations: [
            { pano: 'https://pannellum.org/images/alma.jpg', lat: 46.4255, lng: -1.4885 },
            { pano: 'https://pannellum.org/images/bma-0.jpg', lat: 46.4240, lng: -1.4870 },
            { pano: 'https://pannellum.org/images/alma.jpg', lat: 46.4260, lng: -1.4890 }
        ]
    }
];

function generateRoundLocations(park, totalRounds) {
    const shuffled = [...park.locations].sort(() => 0.5 - Math.random());
    const selected = [];
    for (let i = 0; i < totalRounds; i++) {
        selected.push(shuffled[i % shuffled.length]);
    }
    return selected;
}

function showNotification(message, type = 'error') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.setAttribute('aria-live', 'assertive');
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconName = 'info';
    if (type === 'error') iconName = 'alert-triangle';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'warning') iconName = 'alert-circle';

    toast.innerHTML = `<i data-lucide="${iconName}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function applyTheme(theme) {
    if (theme === 'system') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('bryanGuessrTheme', theme);
}

function createGlobalHeader(titleText, backAction = null) {
    const header = document.createElement('header');
    
    if (backAction) {
        const btnBack = document.createElement('button');
        btnBack.className = 'btn-back';
        btnBack.setAttribute('aria-label', 'Retour');
        btnBack.innerHTML = `<i data-lucide="arrow-left"></i> Retour`;
        btnBack.addEventListener('click', backAction);
        header.appendChild(btnBack);
    } else {
        const title = document.createElement('div');
        title.textContent = titleText;
        title.style.fontWeight = 'bold';
        header.appendChild(title);
    }

    const themeContainer = document.createElement('div');
    themeContainer.className = 'theme-selector-container';

    const themeLabel = document.createElement('label');
    themeLabel.setAttribute('for', 'theme-selector');
    themeLabel.className = 'sr-only';
    themeLabel.textContent = 'Thème';

    const selectTheme = document.createElement('select');
    selectTheme.id = 'theme-selector';
    selectTheme.name = 'theme_selector';
    selectTheme.className = 'theme-selector';
    
    const themes = [
        { val: 'system', text: 'Système' },
        { val: 'light', text: 'Clair' },
        { val: 'dark', text: 'Sombre' }
    ];

    const savedTheme = localStorage.getItem('bryanGuessrTheme') || 'system';

    themes.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.val;
        opt.textContent = t.text;
        if (t.val === savedTheme) opt.selected = true;
        selectTheme.appendChild(opt);
    });

    selectTheme.addEventListener('change', (e) => {
        applyTheme(e.target.value);
    });

    const iconContainer = document.createElement('div');
    iconContainer.className = 'theme-selector-icon';
    iconContainer.innerHTML = '<i data-lucide="chevron-down"></i>';

    themeContainer.appendChild(themeLabel);
    themeContainer.appendChild(selectTheme);
    themeContainer.appendChild(iconContainer);
    
    header.appendChild(themeContainer);
    return header;
}