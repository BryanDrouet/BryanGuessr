document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    const rgpdBanner = document.getElementById('rgpd-banner');
    const btnAcceptRgpd = document.getElementById('btn-accept-rgpd');

    if (!localStorage.getItem('rgpd_consent')) {
        rgpdBanner.classList.remove('hidden');
    }

    btnAcceptRgpd.addEventListener('click', () => {
        localStorage.setItem('rgpd_consent', 'true');
        rgpdBanner.classList.add('hidden');
    });

    const renderHome = () => {
        app.innerHTML = '';

        const title = document.createElement('h1');
        title.textContent = 'Sélectionnez votre parc';

        const grid = document.createElement('div');
        grid.className = 'park-grid';

        const parks = [
            { id: 'puydufou', name: 'Puy du Fou', lat: 46.892, lng: -0.930, zoom: 15 },
            { id: 'asterix', name: 'Parc Astérix', lat: 49.134, lng: 2.571, zoom: 15 },
            { id: 'disneyland', name: 'Disneyland Paris', lat: 48.872, lng: 2.775, zoom: 14 },
            { id: 'futuroscope', name: 'Futuroscope', lat: 46.669, lng: 0.366, zoom: 15 },
            { id: 'ogliss', name: 'O\'Gliss Parc', lat: 46.425, lng: -1.488, zoom: 16 }
        ];

        parks.forEach(park => {
            const btn = document.createElement('button');
            btn.className = 'park-btn';
            btn.setAttribute('aria-label', `Lancer la partie : ${park.name}`);
            btn.innerHTML = `<i data-lucide="map"></i> ${park.name}`;
            btn.addEventListener('click', () => renderGame(park));
            grid.appendChild(btn);
        });

        app.appendChild(title);
        app.appendChild(grid);
        lucide.createIcons();
    };

    const renderGame = (park) => {
        app.innerHTML = '';

        const header = document.createElement('header');
        
        const btnBack = document.createElement('button');
        btnBack.className = 'btn-back';
        btnBack.setAttribute('aria-label', 'Retour au menu principal');
        btnBack.innerHTML = `<i data-lucide="arrow-left"></i> Quitter`;
        btnBack.addEventListener('click', renderHome);

        const scoreBoard = document.createElement('div');
        scoreBoard.className = 'score-board';
        scoreBoard.setAttribute('aria-live', 'polite');
        scoreBoard.innerHTML = `<span id="current-score">0</span> pts`;

        header.appendChild(btnBack);
        header.appendChild(scoreBoard);

        const main = document.createElement('main');
        main.className = 'game-main';

        const panoramaContainer = document.createElement('section');
        panoramaContainer.id = 'panorama-container';
        panoramaContainer.setAttribute('aria-label', `Vue à 360 degrés - ${park.name}`);

        const mapInterface = document.createElement('section');
        mapInterface.id = 'map-interface';
        mapInterface.className = 'hidden';
        mapInterface.setAttribute('aria-hidden', 'true');

        const mapContainer = document.createElement('div');
        mapContainer.id = 'map-container';

        const btnGuess = document.createElement('button');
        btnGuess.id = 'btn-guess';
        btnGuess.setAttribute('aria-label', 'Valider ma position géographique');
        btnGuess.innerHTML = `<i data-lucide="map-pin"></i> Valider`;

        mapInterface.appendChild(mapContainer);
        mapInterface.appendChild(btnGuess);

        const btnToggleMap = document.createElement('button');
        btnToggleMap.id = 'btn-toggle-map';
        btnToggleMap.setAttribute('aria-expanded', 'false');
        btnToggleMap.setAttribute('aria-controls', 'map-interface');
        btnToggleMap.innerHTML = `<i data-lucide="map"></i>`;

        btnToggleMap.addEventListener('click', () => {
            const isExpanded = btnToggleMap.getAttribute('aria-expanded') === 'true';
            btnToggleMap.setAttribute('aria-expanded', String(!isExpanded));
            mapInterface.classList.toggle('hidden');
            mapInterface.setAttribute('aria-hidden', String(isExpanded));
        });

        main.appendChild(panoramaContainer);
        main.appendChild(mapInterface);
        main.appendChild(btnToggleMap);

        app.appendChild(header);
        app.appendChild(main);
        
        lucide.createIcons();
        initMapAndPanorama(park);
    };

    const initMapAndPanorama = (park) => {
        pannellum.viewer('panorama-container', {
            type: 'equirectangular',
            panorama: 'https://pannellum.org/images/alma.jpg',
            autoLoad: true,
            compass: false,
            showControls: false
        });

        const map = L.map('map-container').setView([park.lat, park.lng], park.zoom);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        let currentMarker = null;

        map.on('click', (e) => {
            if (currentMarker) {
                map.removeLayer(currentMarker);
            }
            currentMarker = L.marker(e.latlng).addTo(map);
        });

        document.getElementById('btn-guess').addEventListener('click', () => {
            if (currentMarker) {
                const btn = document.getElementById('btn-guess');
                btn.innerHTML = '<i data-lucide="check"></i> Position enregistrée';
                lucide.createIcons();
            }
        });
    };

    renderHome();
});
