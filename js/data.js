const isDebug = new URLSearchParams(window.location.search).get('debug') === 'true';

const parks = [
    { 
        id: 'puydufou', 
        name: 'Puy du Fou', 
        centerLat: 46.892, 
        centerLng: -0.930, 
        zoom: 15, 
        locations: [
            { pano: 'img/puydufou/CIHM0ogKEICAgIDOqNnwrgE.jpg', lat: 46.8934002, lng: -0.9323215 }
        ]
    },
    { 
        id: 'asterix', 
        name: 'Parc Astérix', 
        centerLat: 49.134, 
        centerLng: 2.571, 
        zoom: 15, 
        locations: [
            { pano: 'img/asterix/REMPLACER_PAR_ID.jpg', lat: 49.134, lng: 2.571 }
        ]
    },
    { 
        id: 'disneyland', 
        name: 'Disneyland Paris', 
        centerLat: 48.872, 
        centerLng: 2.775, 
        zoom: 14, 
        locations: [
            { pano: 'img/disneyland/REMPLACER_PAR_ID.jpg', lat: 48.872, lng: 2.775 }
        ]
    },
    { 
        id: 'futuroscope', 
        name: 'Futuroscope', 
        centerLat: 46.669, 
        centerLng: 0.366, 
        zoom: 15, 
        locations: [
            { pano: 'img/futuroscope/REMPLACER_PAR_ID.jpg', lat: 46.669, lng: 0.366 }
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