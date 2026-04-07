function createSvgIcon(fillColor) {
    return L.divIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${fillColor}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%; filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.4));"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3" fill="#ffffff"></circle></svg>`,
        className: 'custom-svg-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 36]
    });
}

function initMapAndPanorama(park, gameState, notify) {
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
    camera.setAttribute('look-controls', `enabled: ${gameState.options.allowPan}; reverseMouseDrag: true`);
    camera.setAttribute('wasd-controls', 'enabled: false');

    scene.appendChild(sky);
    scene.appendChild(camera);
    panoContainer.appendChild(scene);

    const baseMaps = {
        "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }),
        "CartoDB Clair": L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, attribution: '&copy; CartoDB' }),
        "CartoDB Sombre": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, attribution: '&copy; CartoDB' }),
        "OpenTopoMap": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 17, attribution: '&copy; OpenTopoMap' })
    };

    const savedMapLayerName = localStorage.getItem('bryanGuessrMapLayer') || "OpenStreetMap";
    let defaultLayer = baseMaps[savedMapLayerName] || baseMaps["OpenStreetMap"];

    const map = L.map('map-container', {
        layers: [defaultLayer]
    }).setView([park.lat, park.lng], park.zoom);

    L.control.layers(baseMaps).addTo(map);

    map.on('baselayerchange', (e) => {
        localStorage.setItem('bryanGuessrMapLayer', e.name);
    });

    const userIcon = createSvgIcon('#007bff');
    const targetIcon = createSvgIcon('#34c759');

    let currentMarker = null;

    map.on('click', (e) => {
        if (currentMarker) {
            map.removeLayer(currentMarker);
        }
        currentMarker = L.marker(e.latlng, {icon: userIcon}).addTo(map);
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

            gameState.totalScore += points;
            document.getElementById('current-score').textContent = gameState.totalScore.toLocaleString('fr-FR');
            
            L.marker([park.lat, park.lng], {icon: targetIcon}).addTo(map);
            L.polyline([pos, [park.lat, park.lng]], {color: 'red', weight: 3}).addTo(map);
            map.fitBounds([pos, [park.lat, park.lng]], {padding: [30, 30]});
        } else {
            L.marker([park.lat, park.lng], {icon: targetIcon}).addTo(map);
            map.setView([park.lat, park.lng], park.zoom);
        }

        if (!currentMarker && isTimeout) {
            notify('Temps écoulé ! Aucun point marqué.', 'warning');
        } else {
            notify(`Fin de la manche ! Distance : ${Math.round(distance)}m (+${points.toLocaleString('fr-FR')} pts)`, 'success');
        }

        document.getElementById('panorama-container').style.display = 'none';

        const isLastRound = gameState.currentRound >= gameState.options.totalRounds;
        
        const endScreen = document.createElement('div');
        endScreen.id = 'end-screen';
        endScreen.className = 'page-transition';
        endScreen.setAttribute('role', 'dialog');
        endScreen.setAttribute('aria-labelledby', 'end-title');

        const endTitle = document.createElement('h2');
        endTitle.id = 'end-title';
        endTitle.className = 'end-title';

        if (isLastRound) {
            endTitle.textContent = 'Partie terminée !';
            localStorage.removeItem('bryanGuessrGameState');
        } else {
            endTitle.textContent = (!currentMarker && isTimeout) ? 'Temps écoulé !' : `Manche ${gameState.currentRound} terminée`;
        }

        const endStats = document.createElement('div');
        endStats.className = 'end-stats';
        const formattedRoundPoints = points.toLocaleString('fr-FR');

        if (!currentMarker && isTimeout) {
            endStats.innerHTML = `Aucun point marqué.`;
        } else {
            endStats.innerHTML = `Distance : ${Math.round(distance)}m<br><span class="end-score">+${formattedRoundPoints} pts</span>`;
        }

        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'end-content-wrapper';
        contentWrapper.appendChild(endTitle);
        contentWrapper.appendChild(endStats);

        const actionButtonsWrapper = document.createElement('div');
        actionButtonsWrapper.className = 'end-action-buttons';

        if (isLastRound) {
            const btnSame = document.createElement('button');
            btnSame.className = 'btn-replay-same';
            btnSame.innerHTML = `<i data-lucide="rotate-cw"></i> Rejouer (Mêmes réglages)`;
            btnSame.addEventListener('click', () => {
                const newGameState = {
                    ...gameState,
                    currentRound: 1,
                    totalScore: 0,
                    endTime: gameState.options.timeLimit > 0 ? Date.now() + (gameState.options.timeLimit * 1000) : null
                };
                localStorage.setItem('bryanGuessrGameState', JSON.stringify(newGameState));
                renderGame(park, newGameState);
            });

            const btnDiff = document.createElement('button');
            btnDiff.className = 'btn-replay-diff';
            btnDiff.innerHTML = `<i data-lucide="settings"></i> Modifier les réglages`;
            btnDiff.addEventListener('click', () => {
                renderOptions(park);
            });

            actionButtonsWrapper.appendChild(btnSame);
            actionButtonsWrapper.appendChild(btnDiff);
        } else {
            const btnNext = document.createElement('button');
            btnNext.className = 'btn-replay-same';
            btnNext.innerHTML = `Manche suivante <i data-lucide="arrow-right"></i>`;
            btnNext.addEventListener('click', () => {
                gameState.currentRound++;
                gameState.endTime = gameState.options.timeLimit > 0 ? Date.now() + (gameState.options.timeLimit * 1000) : null;
                localStorage.setItem('bryanGuessrGameState', JSON.stringify(gameState));
                renderGame(park, gameState);
            });
            actionButtonsWrapper.appendChild(btnNext);
        }

        contentWrapper.appendChild(actionButtonsWrapper);
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

    if (gameState.endTime) {
        const timerElement = document.getElementById('timer');
        const mainContainer = document.querySelector('.game-main');

        timerInterval = setInterval(() => {
            const now = Date.now();
            const timeLeft = Math.max(0, Math.ceil((gameState.endTime - now) / 1000));
            
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
}