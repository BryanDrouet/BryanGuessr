const initBryanGuessr = () => {
    const isDebug = new URLSearchParams(window.location.search).get('debug') === 'true';

    const applyTheme = (theme) => {
        if (theme === 'system') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
        localStorage.setItem('bryanGuessrTheme', theme);
    };

    const currentTheme = localStorage.getItem('bryanGuessrTheme') || 'system';
    applyTheme(currentTheme);

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
        if (isDebug) {
            showNotification(`Erreur système : ${e.message}`, 'error');
        }
    });

    const createGlobalHeader = (titleText, backAction = null) => {
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
    };

    const renderHome = () => {
        app.innerHTML = '';

        app.appendChild(createGlobalHeader('BryanGuessr'));

        const main = document.createElement('main');
        main.className = 'game-main page-transition';
        main.style.display = 'flex';
        main.style.flexDirection = 'column';

        const title = document.createElement('h1');
        title.className = 'main-title';
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

        main.appendChild(title);
        main.appendChild(grid);
        app.appendChild(main);

        lucide.createIcons();
    };

    const renderOptions = (park) => {
        app.innerHTML = '';

        app.appendChild(createGlobalHeader('', renderHome));

        const main = document.createElement('main');
        main.className = 'game-main page-transition';
        main.style.display = 'flex';
        main.style.flexDirection = 'column';
        main.style.justifyContent = 'center';

        const title = document.createElement('h2');
        title.className = 'main-title';
        title.textContent = `Configuration - ${park.name}`;

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
            <option value="custom">Personnalisé...</option>
        `;

        const customTimeWrapper = document.createElement('div');
        customTimeWrapper.className = 'custom-time-wrapper';
        customTimeWrapper.style.display = 'none';

        const customTimeLabel = document.createElement('label');
        customTimeLabel.setAttribute('for', 'custom-time');
        customTimeLabel.textContent = 'Durée en secondes :';
        customTimeLabel.style.fontSize = '0.9rem';
        customTimeLabel.style.marginTop = '10px';

        const customTimeInput = document.createElement('input');
        customTimeInput.type = 'number';
        customTimeInput.id = 'custom-time';
        customTimeInput.name = 'custom_time';
        customTimeInput.min = '1';
        customTimeInput.placeholder = 'Ex: 45';
        customTimeInput.className = 'custom-time-input';

        customTimeWrapper.appendChild(customTimeLabel);
        customTimeWrapper.appendChild(customTimeInput);

        selectTime.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customTimeWrapper.style.display = 'flex';
                customTimeInput.required = true;
            } else {
                customTimeWrapper.style.display = 'none';
                customTimeInput.required = false;
                customTimeInput.value = '';
            }
        });

        groupTime.appendChild(labelTime);
        groupTime.appendChild(selectTime);
        groupTime.appendChild(customTimeWrapper);

        const groupMove = document.createElement('div');
        groupMove.className = 'form-group form-group-checkbox';
        const labelMove = document.createElement('label');
        labelMove.setAttribute('for', 'allow-move');
        labelMove.textContent = 'Possibilité de se déplacer';
        const inputMove = document.createElement('input');
        inputMove.type = 'checkbox';
        inputMove.id = 'allow-move';
        inputMove.name = 'allow_move';
        inputMove.setAttribute('aria-describedby', 'move-desc');
        const descMove = document.createElement('span');
        descMove.id = 'move-desc';
        descMove.className = 'sr-only';
        descMove.textContent = 'Autorise le déplacement entre différents panoramas.';
        groupMove.appendChild(labelMove);
        groupMove.appendChild(inputMove);
        groupMove.appendChild(descMove);

        const groupPan = document.createElement('div');
        groupPan.className = 'form-group form-group-checkbox';
        const labelPan = document.createElement('label');
        labelPan.setAttribute('for', 'allow-pan');
        labelPan.textContent = 'Possibilité de bouger la caméra';
        const inputPan = document.createElement('input');
        inputPan.type = 'checkbox';
        inputPan.id = 'allow-pan';
        inputPan.name = 'allow_pan';
        inputPan.checked = true;
        inputPan.setAttribute('aria-describedby', 'pan-desc');
        const descPan = document.createElement('span');
        descPan.id = 'pan-desc';
        descPan.className = 'sr-only';
        descPan.textContent = 'Autorise la rotation de la vue à 360 degrés.';
        groupPan.appendChild(labelPan);
        groupPan.appendChild(inputPan);
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
            
            let timeLimitValue = 0;
            if (selectTime.value === 'custom') {
                timeLimitValue = parseInt(customTimeInput.value, 10);
                if (isNaN(timeLimitValue) || timeLimitValue < 1) {
                    timeLimitValue = 0;
                }
            } else {
                timeLimitValue = parseInt(selectTime.value, 10);
            }

            const options = {
                timeLimit: timeLimitValue,
                allowMove: document.getElementById('allow-move').checked,
                allowPan: document.getElementById('allow-pan').checked
            };

            renderGame(park, options, null);
        });

        main.appendChild(title);
        main.appendChild(form);
        app.appendChild(main);

        lucide.createIcons();
    };

    const renderGame = (park, options, restoredEndTime) => {
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
        main.className = 'game-main page-transition';

        const panoramaContainer = document.createElement('section');
        panoramaContainer.id = 'panorama-container';
        panoramaContainer.setAttribute('aria-label', `Vue à 360 degrés - ${park.name}`);

        const mapInterface = document.createElement('section');
        mapInterface.id = 'map-interface';
        mapInterface.setAttribute('aria-label', 'Interface de la carte');

        const mapHeader = document.createElement('div');
        mapHeader.className = 'map-header';

        const mapTitle = document.createElement('span');
        mapTitle.textContent = 'Carte';

        const btnResizeMap = document.createElement('button');
        btnResizeMap.id = 'btn-resize-map';
        btnResizeMap.type = 'button';
        btnResizeMap.setAttribute('aria-label', 'Agrandir la carte');
        btnResizeMap.innerHTML = '<i data-lucide="maximize"></i>';

        mapHeader.appendChild(mapTitle);
        mapHeader.appendChild(btnResizeMap);

        const mapContainer = document.createElement('div');
        mapContainer.id = 'map-container';

        const btnGuess = document.createElement('button');
        btnGuess.id = 'btn-guess';
        btnGuess.setAttribute('aria-label', 'Valider ma position géographique');
        btnGuess.innerHTML = `<i data-lucide="map-pin"></i> Valider`;

        btnResizeMap.addEventListener('click', () => {
            const isExpanded = mapInterface.classList.toggle('expanded');
            btnResizeMap.innerHTML = isExpanded ? '<i data-lucide="minimize"></i>' : '<i data-lucide="maximize"></i>';
            btnResizeMap.setAttribute('aria-label', isExpanded ? 'Rétrécir la carte' : 'Agrandir la carte');
            lucide.createIcons();
            
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 300);
        });

        mapInterface.appendChild(mapHeader);
        mapInterface.appendChild(mapContainer);
        mapInterface.appendChild(btnGuess);

        main.appendChild(panoramaContainer);
        main.appendChild(mapInterface);

        app.appendChild(header);
        app.appendChild(main);
        
        lucide.createIcons();

        if (restoredEndTime) {
            initMapAndPanorama(park, options, restoredEndTime, showNotification);
        } else {
            const overlay = document.createElement('div');
            overlay.className = 'countdown-overlay';
            app.appendChild(overlay);

            let count = 3;
            const countSpan = document.createElement('span');
            countSpan.textContent = count;
            overlay.appendChild(countSpan);

            const countInterval = setInterval(() => {
                count--;
                if (count > 0) {
                    countSpan.textContent = count;
                    countSpan.style.animation = 'none';
                    countSpan.offsetHeight;
                    countSpan.style.animation = null;
                } else if (count === 0) {
                    countSpan.textContent = 'GO!';
                    countSpan.style.animation = 'none';
                    countSpan.offsetHeight;
                    countSpan.style.animation = null;
                } else {
                    clearInterval(countInterval);
                    overlay.remove();

                    let newEndTime = null;
                    if (options.timeLimit > 0) {
                        newEndTime = Date.now() + (options.timeLimit * 1000);
                    }

                    localStorage.setItem('bryanGuessrGameState', JSON.stringify({
                        parkId: park.id,
                        options: options,
                        endTime: newEndTime
                    }));

                    initMapAndPanorama(park, options, newEndTime, showNotification);
                }
            }, 1000);
        }
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
            if (isDebug) {
                notify('Panorama chargé avec succès.', 'success');
            }
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

            const mainContainer = document.querySelector('.game-main');
            if (mainContainer) {
                mainContainer.classList.remove('time-critical', 'active');
            }
            const timerElement = document.getElementById('timer');
            if (timerElement) {
                timerElement.classList.remove('timer-critical');
            }

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

            document.getElementById('panorama-container').style.display = 'none';

            const endScreen = document.createElement('div');
            endScreen.id = 'end-screen';
            endScreen.className = 'page-transition';
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
                renderGame(park, options, null);
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

            document.getElementById('map-interface').style.display = 'none';

            const mapContainerToMove = document.getElementById('map-container');
            endScreen.appendChild(mapContainerToMove);

            document.querySelector('.game-main').appendChild(endScreen);

            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);

            lucide.createIcons();
        };

        if (endTime) {
            const timerElement = document.getElementById('timer');
            const mainContainer = document.querySelector('.game-main');

            timerInterval = setInterval(() => {
                const now = Date.now();
                const timeLeft = Math.max(0, Math.ceil((endTime - now) / 1000));
                
                timerElement.innerHTML = `<i data-lucide="clock"></i> ${timeLeft}s`;
                lucide.createIcons();
                
                if (timeLeft <= 10 && timeLeft > 0) {
                    mainContainer.classList.add('time-critical', 'active');
                    timerElement.classList.add('timer-critical');
                } else {
                    mainContainer.classList.remove('time-critical', 'active');
                    timerElement.classList.remove('timer-critical');
                }

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