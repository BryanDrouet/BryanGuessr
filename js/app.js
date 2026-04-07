const initBryanGuessr = () => {
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

    const parks = [
        { id: 'puydufou', name: 'Puy du Fou', lat: 46.892, lng: -0.930, zoom: 15, defaultPano: 'https://pannellum.org/images/alma.jpg' },
        { id: 'asterix', name: 'Parc Astérix', lat: 49.134, lng: 2.571, zoom: 15, defaultPano: 'https://pannellum.org/images/alma.jpg' },
        { id: 'disneyland', name: 'Disneyland Paris', lat: 48.872, lng: 2.775, zoom: 14, defaultPano: 'https://pannellum.org/images/alma.jpg' },
        { id: 'futuroscope', name: 'Futuroscope', lat: 46.669, lng: 0.366, zoom: 15, defaultPano: 'https://pannellum.org/images/alma.jpg' },
        { id: 'ogliss', name: 'O\'Gliss Parc', lat: 46.425, lng: -1.488, zoom: 16, defaultPano: 'https://pannellum.org/images/alma.jpg' }
    ];

    const showNotification = (message, type = 'error') => {
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
        lucide.createIcons();

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    };

    window.addEventListener('error', (e) => {
        showNotification(`Erreur système : ${e.message}`, 'error');
    });

    const renderHome = () => {
        app.innerHTML = '';

        const title = document.createElement('h1');
        title.textContent = 'Sélectionnez votre parc';

        const grid = document.createElement('div');
        grid.className = 'park-grid';

        parks.forEach(park => {
            const btn = document.createElement('button');
            btn.className = 'park-btn';
            btn.setAttribute('aria-label', `Configurer la partie : ${park.name}`);
            btn.innerHTML = `<i data-lucide="map"></i> ${park.name}`;
            btn.addEventListener('click', () => renderOptions(park));
            grid.appendChild(btn);
        });

        app.appendChild(title);
        app.appendChild(grid);
        lucide.createIcons();
    };

    const renderOptions = (park) => {
        app.innerHTML = '';

        const header = document.createElement('header');
        const btnBack = document.createElement('button');
        btnBack.className = 'btn-back';
        btnBack.setAttribute('aria-label', 'Retour à la sélection des parcs');
        btnBack.innerHTML = `<i data-lucide="arrow-left"></i> Retour`;
        btnBack.addEventListener('click', renderHome);
        header.appendChild(btnBack);

        const main = document.createElement('main');
        main.className = 'game-main';
        main.style.display = 'flex';
        main.style.flexDirection = 'column';
        main.style.justifyContent = 'center';

        const title = document.createElement('h2');
        title.textContent = `Configuration - ${park.name}`;
        title.style.textAlign = 'center';
        title.style.marginBottom = '30px';

        const form = document.createElement('form');
        form.className = 'options-form';
        form.id = 'game-options-form';
        form.name = 'game-options-form';

        const groupTime = document.createElement('div');
        groupTime.className = 'form-group';
        const labelTime = document.createElement('label');
        labelTime.setAttribute('for', 'time-limit');
        labelTime.textContent = 'Temps par partie :';
        const selectTime = document.createElement('select');
        selectTime.id = 'time-limit';
        selectTime.name = 'time_limit';
        selectTime.innerHTML = `
            <option value="0">Illimité</option>
            <option value="60">1 minute</option>
            <option value="120">2 minutes</option>
            <option value="180">3 minutes</option>
        `;
        groupTime.appendChild(labelTime);
        groupTime.appendChild(selectTime);

        const groupMove = document.createElement('div');
        groupMove.className = 'form-group form-group-checkbox';
        const inputMove = document.createElement('input');
        inputMove.type = 'checkbox';
        inputMove.id = 'allow-move';
        inputMove.name = 'allow_move';
        inputMove.setAttribute('aria-describedby', 'move-desc');
        const labelMove = document.createElement('label');
        labelMove.setAttribute('for', 'allow-move');
        labelMove.textContent = 'Possibilité de se déplacer';
        const descMove = document.createElement('span');
        descMove.id = 'move-desc';
        descMove.className = 'sr-only';
        descMove.textContent = 'Autorise le déplacement entre différents panoramas.';
        groupMove.appendChild(inputMove);
        groupMove.appendChild(labelMove);
        groupMove.appendChild(descMove);

        const groupPan = document.createElement('div');
        groupPan.className = 'form-group form-group-checkbox';
        const inputPan = document.createElement('input');
        inputPan.type = 'checkbox';
        inputPan.id = 'allow-pan';
        inputPan.name = 'allow_pan';
        inputPan.checked = true;
        inputPan.setAttribute('aria-describedby', 'pan-desc');
        const labelPan = document.createElement('label');
        labelPan.setAttribute('for', 'allow-pan');
        labelPan.textContent = 'Possibilité de bouger la caméra';
        const descPan = document.createElement('span');
        descPan.id = 'pan-desc';
        descPan.className = 'sr-only';
        descPan.textContent = 'Autorise la rotation de la vue à 360 degrés.';
        groupPan.appendChild(inputPan);
        groupPan.appendChild(labelPan);
        groupPan.appendChild(descPan);

        const btnSubmit = document.createElement('button');
        btnSubmit.type = 'submit';
        btnSubmit.className = 'btn-start';
        btnSubmit.setAttribute('aria-label', 'Lancer la partie avec ces options');
        btnSubmit.innerHTML = `<i data-lucide="play"></i> Lancer la partie`;

        form.appendChild(groupTime);
        form.appendChild(groupMove);
        form.appendChild(groupPan);
        form.appendChild(btnSubmit);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const options = {
                timeLimit: parseInt(document.getElementById('time-limit').value, 10),
                allowMove: document.getElementById('allow-move').checked,
                allowPan: document.getElementById('allow-pan').checked
            };

            let endTime = null;
            if (options.timeLimit > 0) {
                endTime = Date.now() + (options.timeLimit * 1000);
            }

            localStorage.setItem('bryanGuessrGameState', JSON.stringify({
                parkId: park.id,
                options: options,
                endTime: endTime
            }));

            renderGame(park, options, endTime);
        });

        main.appendChild(title);
        main.appendChild(form);

        app.appendChild(header);
        app.appendChild(main);
        lucide.createIcons();
    };

    const renderGame = (park, options, endTime) => {
        app.innerHTML = '';

        const header = document.createElement('header');
        
        const btnBack = document.createElement('button');
        btnBack.className = 'btn-back';
        btnBack.setAttribute('aria-label', 'Quitter la partie');
        btnBack.innerHTML = `<i data-lucide="arrow-left"></i> Quitter`;
        btnBack.addEventListener('click', () => {
            localStorage.removeItem('bryanGuessrGameState');
            renderOptions(park);
        });

        const scoreBoard = document.createElement('div');
        scoreBoard.className = 'score-board';
        scoreBoard.setAttribute('aria-live', 'polite');
        
        let timerHTML = '';
        if (options.timeLimit > 0) {
            timerHTML = `<span id="timer" style="margin-right: 20px;"><i data-lucide="clock"></i> --s</span>`;
        }
        scoreBoard.innerHTML = `${timerHTML}<span id="current-score">0</span> pts`;

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
        initMapAndPanorama(park, options, endTime, showNotification);
    };

    const initMapAndPanorama = (park, options, endTime, notify) => {
        const panoContainer = document.getElementById('panorama-container');
        panoContainer.innerHTML = '';

        const scene = document.createElement('a-scene');
        scene.setAttribute('embedded', '');
        scene.setAttribute('vr-mode-ui', 'enabled: false');
        scene.setAttribute('loading-screen', 'enabled: false');

        const sky = document.createElement('a-sky');
        sky.setAttribute('src', park.defaultPano);
        
        sky.addEventListener('materialtextureloaded', () => {
            notify('Panorama chargé avec succès.', 'success');
        });

        const camera = document.createElement('a-camera');
        camera.setAttribute('look-controls', `enabled: ${options.allowPan}; reverseMouseDrag: true`);
        camera.setAttribute('wasd-controls', 'enabled: false');

        scene.appendChild(sky);
        scene.appendChild(camera);
        panoContainer.appendChild(scene);

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

        let timerInterval = null;

        const handleValidation = (isTimeout = false) => {
            if (!currentMarker && !isTimeout) {
                notify('Veuillez placer un marqueur sur la carte avant de valider.', 'error');
                return;
            }

            if (timerInterval) {
                clearInterval(timerInterval);
            }

            const btn = document.getElementById('btn-guess');
            map.off('click');

            let distance = 0;
            let points = 0;

            if (currentMarker) {
                const pos = currentMarker.getLatLng();
                const R = 6371e3;
                const p1 = pos.lat * Math.PI / 180;
                const p2 = park.lat * Math.PI / 180;
                const dp = (park.lat - pos.lat) * Math.PI / 180;
                const dl = (park.lng - pos.lng) * Math.PI / 180;
                const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                distance = R * c;

                if (distance < 20) {
                    points = 5000;
                } else {
                    points = Math.max(0, Math.floor(5000 * Math.exp(-distance / 1000)));
                }

                document.getElementById('current-score').textContent = points;
                
                L.marker([park.lat, park.lng]).addTo(map);
                L.polyline([pos, [park.lat, park.lng]], {color: 'red', weight: 3}).addTo(map);
                map.fitBounds([pos, [park.lat, park.lng]], {padding: [30, 30]});
            } else {
                L.marker([park.lat, park.lng]).addTo(map);
                map.setView([park.lat, park.lng], park.zoom);
            }

            if (!currentMarker && isTimeout) {
                notify('Temps écoulé ! Aucun point marqué.', 'warning');
            } else {
                notify(`Fin de la manche ! Distance : ${Math.round(distance)}m (+${points} pts)`, 'success');
            }

            localStorage.removeItem('bryanGuessrGameState');

            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.innerHTML = '<i data-lucide="home"></i> Menu principal';
            
            newBtn.addEventListener('click', () => {
                renderHome();
            });

            document.getElementById('panorama-container').style.display = 'none';

            const endScreen = document.createElement('div');
            endScreen.id = 'end-screen';
            endScreen.setAttribute('role', 'dialog');
            endScreen.setAttribute('aria-labelledby', 'end-title');

            const endTitle = document.createElement('h2');
            endTitle.id = 'end-title';
            endTitle.className = 'end-title';
            endTitle.textContent = (!currentMarker && isTimeout) ? 'Temps écoulé !' : 'Manche terminée !';

            const endStats = document.createElement('div');
            endStats.className = 'end-stats';
            if (!currentMarker && isTimeout) {
                endStats.innerHTML = `Aucun point marqué.`;
            } else {
                endStats.innerHTML = `Distance : ${Math.round(distance)}m<br><span class="end-score">+${points} pts</span>`;
            }

            const btnSame = document.createElement('button');
            btnSame.className = 'btn-replay-same';
            btnSame.innerHTML = `<i data-lucide="rotate-cw"></i> Rejouer (Mêmes réglages)`;
            btnSame.addEventListener('click', () => {
                let newEndTime = null;
                if (options.timeLimit > 0) {
                    newEndTime = Date.now() + (options.timeLimit * 1000);
                }
                localStorage.setItem('bryanGuessrGameState', JSON.stringify({
                    parkId: park.id,
                    options: options,
                    endTime: newEndTime
                }));
                renderGame(park, options, newEndTime);
            });

            const btnDiff = document.createElement('button');
            btnDiff.className = 'btn-replay-diff';
            btnDiff.innerHTML = `<i data-lucide="settings"></i> Modifier les réglages`;
            btnDiff.addEventListener('click', () => {
                renderOptions(park);
            });

            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'end-content-wrapper';
            contentWrapper.appendChild(endTitle);
            contentWrapper.appendChild(endStats);
            contentWrapper.appendChild(btnSame);
            contentWrapper.appendChild(btnDiff);

            endScreen.appendChild(contentWrapper);

            document.getElementById('btn-toggle-map').style.display = 'none';
            document.getElementById('map-interface').style.display = 'none';

            const mapContainer = document.getElementById('map-container');
            endScreen.appendChild(mapContainer);

            document.querySelector('.game-main').appendChild(endScreen);

            setTimeout(() => {
                map.invalidateSize();
            }, 100);

            lucide.createIcons();
        };

        if (endTime) {
            const timerElement = document.getElementById('timer');
            timerInterval = setInterval(() => {
                const now = Date.now();
                const timeLeft = Math.max(0, Math.ceil((endTime - now) / 1000));
                
                timerElement.innerHTML = `<i data-lucide="clock"></i> ${timeLeft}s`;
                lucide.createIcons();
                
                if (timeLeft <= 0) {
                    handleValidation(true);
                }
            }, 1000);
        }

        document.getElementById('btn-guess').addEventListener('click', () => {
            handleValidation(false);
        });
    };

    const savedState = localStorage.getItem('bryanGuessrGameState');
    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            const park = parks.find(p => p.id === state.parkId);
            if (park) {
                if (state.endTime && Date.now() >= state.endTime) {
                    localStorage.removeItem('bryanGuessrGameState');
                    renderHome();
                } else {
                    renderGame(park, state.options, state.endTime);
                }
            } else {
                renderHome();
            }
        } catch (e) {
            localStorage.removeItem('bryanGuessrGameState');
            renderHome();
        }
    } else {
        renderHome();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBryanGuessr);
} else {
    initBryanGuessr();
}
