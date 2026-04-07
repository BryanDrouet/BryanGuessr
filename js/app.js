document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app');
    const rgpdBanner = document.getElementById('rgpd-banner');
    const btnAcceptRgpd = document.getElementById('btn-accept-rgpd');

    if (!localStorage.getItem('rgpd_consent')) {
        rgpdBanner.classList.remove('hidden');
    }

    btnAcceptRgpd.addEventListener('click', () => {
        localStorage.setItem('rgpd_consent', 'true');
        rgpdBanner.classList.add('hidden');
    });

    const parksData = [
        { 
            id: 'puydufou', 
            name: 'Puy du Fou', 
            centerLat: 46.892, 
            centerLng: -0.930, 
            zoom: 15, 
            radiusLimit: 1200,
            locations: [
                { lat: 46.8925, lng: -0.9301, pano: 'assets/panoramas/puydufou_1.webp' },
                { lat: 46.8902, lng: -0.9284, pano: 'assets/panoramas/puydufou_2.webp' },
                { lat: 46.8941, lng: -0.9332, pano: 'assets/panoramas/puydufou_3.webp' }
            ]
        },
        { 
            id: 'asterix', 
            name: 'Parc Astérix', 
            centerLat: 49.134, 
            centerLng: 2.571, 
            zoom: 15, 
            radiusLimit: 900,
            locations: [
                { lat: 49.1338, lng: 2.5715, pano: 'assets/panoramas/asterix_1.webp' }
            ]
        },
        { 
            id: 'disneyland', 
            name: 'Disneyland Paris', 
            centerLat: 48.872, 
            centerLng: 2.775, 
            zoom: 14, 
            radiusLimit: 2000,
            locations: [
                { lat: 48.8722, lng: 2.7758, pano: 'assets/panoramas/disneyland_1.webp' }
            ]
        },
        { 
            id: 'futuroscope', 
            name: 'Futuroscope', 
            centerLat: 46.669, 
            centerLng: 0.366, 
            zoom: 15, 
            radiusLimit: 1000,
            locations: [
                { lat: 46.6695, lng: 0.3664, pano: 'assets/panoramas/futuroscope_1.webp' }
            ]
        },
        { 
            id: 'ogliss', 
            name: 'O\'Gliss Parc', 
            centerLat: 46.425, 
            centerLng: -1.488, 
            zoom: 16, 
            radiusLimit: 500,
            locations: [
                { lat: 46.4251, lng: -1.4882, pano: 'assets/panoramas/ogliss_1.webp' }
            ]
        }
    ];

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; 
        const p1 = lat1 * Math.PI / 180;
        const p2 = lat2 * Math.PI / 180;
        const dp = (lat2 - lat1) * Math.PI / 180;
        const dl = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const calculateScore = (distance, radiusLimit) => {
        if (distance <= 5) return 5000;
        if (distance > radiusLimit) return 0;
        const ratio = (radiusLimit - distance) / (radiusLimit - 5);
        return Math.round(5000 * Math.pow(ratio, 2));
    };

    const renderHomeScreen = () => {
        appContainer.innerHTML = '';

        const titleElement = document.createElement('h1');
        titleElement.textContent = 'Sélectionnez votre parc';

        const gridElement = document.createElement('div');
        gridElement.className = 'park-grid';

        parksData.forEach(park => {
            const btnElement = document.createElement('button');
            btnElement.className = 'park-btn';
            btnElement.setAttribute('aria-label', `Configurer la partie pour ${park.name}`);
            btnElement.innerHTML = `<i data-lucide="map"></i> ${park.name}`;
            btnElement.addEventListener('click', () => renderOptionsScreen(park));
            gridElement.appendChild(btnElement);
        });

        appContainer.appendChild(titleElement);
        appContainer.appendChild(gridElement);
        lucide.createIcons();
    };

    const renderOptionsScreen = (park) => {
        appContainer.innerHTML = '';

        const headerElement = document.createElement('header');
        const btnBackElement = document.createElement('button');
        btnBackElement.className = 'btn-back';
        btnBackElement.setAttribute('aria-label', 'Retour au menu principal');
        btnBackElement.innerHTML = `<i data-lucide="arrow-left"></i> Retour`;
        btnBackElement.addEventListener('click', renderHomeScreen);
        headerElement.appendChild(btnBackElement);

        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'options-container';

        const titleElement = document.createElement('h2');
        titleElement.textContent = `Configuration : ${park.name}`;
        titleElement.style.marginBottom = '30px';

        const formElement = document.createElement('form');
        formElement.className = 'options-form';
        formElement.id = 'game-options-form';
        formElement.name = 'game_options_form';

        const createSelectGroup = (id, name, labelText, options) => {
            const group = document.createElement('div');
            group.className = 'form-group';
            const label = document.createElement('label');
            label.setAttribute('for', id);
            label.textContent = labelText;
            const select = document.createElement('select');
            select.id = id;
            select.name = name;
            options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.text;
                select.appendChild(option);
            });
            group.appendChild(label);
            group.appendChild(select);
            return group;
        };

        const createCheckboxGroup = (id, name, labelText, description, defaultChecked) => {
            const group = document.createElement('div');
            group.className = 'form-group form-group-checkbox';
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = id;
            input.name = name;
            input.checked = defaultChecked;
            input.setAttribute('aria-describedby', `${id}-desc`);
            const label = document.createElement('label');
            label.setAttribute('for', id);
            label.textContent = labelText;
            const desc = document.createElement('span');
            desc.id = `${id}-desc`;
            desc.className = 'sr-only';
            desc.textContent = description;
            group.appendChild(input);
            group.appendChild(label);
            group.appendChild(desc);
            return group;
        };

        const timeGroup = createSelectGroup('time-limit', 'time_limit', 'Temps par manche :', [
            { value: '0', text: 'Illimité' },
            { value: '60', text: '1 minute' },
            { value: '120', text: '2 minutes' },
            { value: '180', text: '3 minutes' }
        ]);

        const moveGroup = createCheckboxGroup('allow-move', 'allow_move', 'Autoriser le déplacement', 'Permet de naviguer entre les points.', false);
        const panGroup = createCheckboxGroup('allow-pan', 'allow_pan', 'Autoriser la rotation caméra', 'Permet de regarder autour de soi.', true);
        const zoomGroup = createCheckboxGroup('allow-zoom', 'allow_zoom', 'Autoriser le zoom', 'Permet d\'agrandir l\'image.', true);

        const btnSubmitElement = document.createElement('button');
        btnSubmitElement.type = 'submit';
        btnSubmitElement.className = 'btn-start';
        btnSubmitElement.setAttribute('aria-label', 'Lancer la partie');
        btnSubmitElement.innerHTML = `<i data-lucide="play"></i> Lancer la partie`;

        formElement.appendChild(timeGroup);
        formElement.appendChild(moveGroup);
        formElement.appendChild(panGroup);
        formElement.appendChild(zoomGroup);
        formElement.appendChild(btnSubmitElement);

        formElement.addEventListener('submit', (e) => {
            e.preventDefault();
            const config = {
                timeLimit: parseInt(document.getElementById('time-limit').value, 10),
                allowMove: document.getElementById('allow-move').checked,
                allowPan: document.getElementById('allow-pan').checked,
                allowZoom: document.getElementById('allow-zoom').checked
            };
            renderGameScreen(park, config);
        });

        optionsContainer.appendChild(titleElement);
        optionsContainer.appendChild(formElement);

        appContainer.appendChild(headerElement);
        appContainer.appendChild(optionsContainer);
        lucide.createIcons();
    };

    const renderGameScreen = (park, config) => {
        appContainer.innerHTML = '';
        
        const currentLocation = park.locations[Math.floor(Math.random() * park.locations.length)];
        let totalScore = 0;

        const headerElement = document.createElement('header');
        const btnBackElement = document.createElement('button');
        btnBackElement.className = 'btn-back';
        btnBackElement.setAttribute('aria-label', 'Abandonner la partie');
        btnBackElement.innerHTML = `<i data-lucide="arrow-left"></i> Quitter`;
        btnBackElement.addEventListener('click', () => renderOptionsScreen(park));

        const scoreBoardElement = document.createElement('div');
        scoreBoardElement.className = 'score-board';
        scoreBoardElement.setAttribute('aria-live', 'polite');
        
        let timerDisplay = '';
        if (config.timeLimit > 0) {
            timerDisplay = `<span id="timer-display" style="margin-right: 20px;"><i data-lucide="clock"></i> ${config.timeLimit}s</span>`;
        }
        scoreBoardElement.innerHTML = `${timerDisplay}<span id="score-display">${totalScore}</span> pts`;

        headerElement.appendChild(btnBackElement);
        headerElement.appendChild(scoreBoardElement);

        const mainElement = document.createElement('main');
        mainElement.className = 'game-main';

        const panoramaSection = document.createElement('section');
        panoramaSection.id = 'panorama-container';
        panoramaSection.setAttribute('aria-label', 'Visualiseur 360 degrés');

        const mapSection = document.createElement('section');
        mapSection.id = 'map-interface';
        mapSection.className = 'hidden';
        mapSection.setAttribute('aria-hidden', 'true');

        const mapDiv = document.createElement('div');
        mapDiv.id = 'map-container';

        const btnGuessElement = document.createElement('button');
        btnGuessElement.id = 'btn-guess';
        btnGuessElement.setAttribute('aria-label', 'Valider la position');
        btnGuessElement.innerHTML = `<i data-lucide="map-pin"></i> Valider`;
        btnGuessElement.disabled = true;

        mapSection.appendChild(mapDiv);
        mapSection.appendChild(btnGuessElement);

        const btnToggleMapElement = document.createElement('button');
        btnToggleMapElement.id = 'btn-toggle-map';
        btnToggleMapElement.setAttribute('aria-expanded', 'false');
        btnToggleMapElement.setAttribute('aria-controls', 'map-interface');
        btnToggleMapElement.innerHTML = `<i data-lucide="map"></i>`;

        btnToggleMapElement.addEventListener('click', () => {
            const expanded = btnToggleMapElement.getAttribute('aria-expanded') === 'true';
            btnToggleMapElement.setAttribute('aria-expanded', String(!expanded));
            mapSection.classList.toggle('hidden');
            mapSection.setAttribute('aria-hidden', String(expanded));
            if (!expanded) {
                setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
            }
        });

        mainElement.appendChild(panoramaSection);
        mainElement.appendChild(mapSection);
        mainElement.appendChild(btnToggleMapElement);

        appContainer.appendChild(headerElement);
        appContainer.appendChild(mainElement);
        lucide.createIcons();

        initializeGameEngine(park, currentLocation, config);
    };

    const initializeGameEngine = (park, location, config) => {
        pannellum.viewer('panorama-container', {
            type: 'equirectangular',
            panorama: location.pano,
            autoLoad: true,
            compass: false,
            showControls: false,
            draggable: config.allowPan,
            mouseZoom: config.allowZoom,
            keyboardZoom: config.allowZoom,
            disableKeyboardCtrl: !config.allowPan
        });

        const mapInstance = L.map('map-container').setView([park.centerLat, park.centerLng], park.zoom);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
        }).addTo(mapInstance);

        let userMarker = null;
        const btnGuess = document.getElementById('btn-guess');

        mapInstance.on('click', (e) => {
            if (userMarker) {
                mapInstance.removeLayer(userMarker);
            }
            userMarker = L.marker(e.latlng).addTo(mapInstance);
            btnGuess.disabled = false;
        });

        let timerInterval = null;
        let timeLeft = config.timeLimit;

        if (config.timeLimit > 0) {
            const timerEl = document.getElementById('timer-display');
            timerInterval = setInterval(() => {
                timeLeft--;
                timerEl.innerHTML = `<i data-lucide="clock"></i> ${timeLeft}s`;
                lucide.createIcons();
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    processGuess(mapInstance, userMarker, location, park);
                }
            }, 1000);
        }

        btnGuess.addEventListener('click', () => {
            if (timerInterval) clearInterval(timerInterval);
            processGuess(mapInstance, userMarker, location, park);
        });
    };

    const processGuess = (mapInstance, userMarker, location, park) => {
        const btnGuess = document.getElementById('btn-guess');
        btnGuess.disabled = true;
        document.getElementById('map-interface').classList.remove('hidden');

        L.marker([location.lat, location.lng], {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })
        }).addTo(mapInstance);

        let distance = 99999;
        let score = 0;

        if (userMarker) {
            const userPos = userMarker.getLatLng();
            distance = calculateDistance(userPos.lat, userPos.lng, location.lat, location.lng);
            score = calculateScore(distance, park.radiusLimit);
            
            L.polyline([
                [userPos.lat, userPos.lng],
                [location.lat, location.lng]
            ], {color: 'red', dashArray: '5, 5'}).addTo(mapInstance);
            
            mapInstance.fitBounds([
                [userPos.lat, userPos.lng],
                [location.lat, location.lng]
            ], { padding: [50, 50] });
        } else {
            mapInstance.setView([location.lat, location.lng], 16);
        }

        showResultOverlay(score, distance);
    };

    const showResultOverlay = (score, distance) => {
        const overlay = document.createElement('div');
        overlay.id = 'result-overlay';
        
        const card = document.createElement('div');
        card.className = 'result-card';
        
        const title = document.createElement('h3');
        title.textContent = 'Résultat de la manche';
        
        const scoreDisplay = document.createElement('div');
        scoreDisplay.className = 'result-score';
        scoreDisplay.textContent = `${score} pts`;
        
        const distanceDisplay = document.createElement('div');
        distanceDisplay.className = 'result-distance';
        distanceDisplay.textContent = distance === 99999 ? 'Temps écoulé !' : `Vous étiez à ${Math.round(distance)} mètres.`;
        
        const btnNext = document.createElement('button');
        btnNext.className = 'btn-start';
        btnNext.style.width = '100%';
        btnNext.innerHTML = `<i data-lucide="home"></i> Retour au menu`;
        btnNext.addEventListener('click', () => {
            overlay.remove();
            renderHomeScreen();
        });

        card.appendChild(title);
        card.appendChild(scoreDisplay);
        card.appendChild(distanceDisplay);
        card.appendChild(btnNext);
        overlay.appendChild(card);
        
        document.getElementById('app').appendChild(overlay);
        lucide.createIcons();
    };

    renderHomeScreen();
});
