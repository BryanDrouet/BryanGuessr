function createSvgIcon(type, fillColor) {
    let path = '';
    let anchor = [18, 33];
    let tooltipAnchor = [0, -33];

    if (type === 'pin') {
        path = `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3" fill="#ffffff"></circle>`;
        anchor = [18, 33];
        tooltipAnchor = [0, -33];
    } else if (type === 'flag') {
        path = `<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" x2="4" y1="22" y2="3"></line>`;
        anchor = [6, 33];
        tooltipAnchor = [6, -33];
    }

    return L.divIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${fillColor}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%; filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.4));">${path}</svg>`,
        className: 'custom-svg-marker',
        iconSize: [36, 36],
        iconAnchor: anchor,
        tooltipAnchor: tooltipAnchor
    });
}

function initMapAndPanorama(park, gameState, currentLocation, notify) {
    const panoContainer = document.getElementById('panorama-container');
    panoContainer.innerHTML = '';

    // Créer une carte Leaflet pour la visualisation de l'image
    const imageMap = L.map('panorama-container', {
        maxZoom: 4,
        minZoom: 0,
        zoom: 1,
        zoomControl: true,
        attributionControl: false,
        boxZoom: false,
        doubleClickZoom: false,
        scrollWheelZoom: true,
        dragging: true,
        touchZoom: true,
        bounceAtZoomLimits: false,
        crs: L.CRS.Simple,
        maxBoundsViscosity: 1.0
    });

    // Avec CRS.Simple, les limites doivent être en pixels, pas en lat/lng
    // Supposons que l'image fait environ 1024x680
    const imageDimensions = {
        width: 1024,
        height: 680
    };

    const imageBounds = [
        [0, 0],
        [imageDimensions.height, imageDimensions.width]
    ];

    // Définir les limites maximales pour empêcher le pan en dehors de l'image
    imageMap.setMaxBounds(imageBounds);

    // Ajouter l'image comme ImageOverlay
    L.imageOverlay(currentLocation.pano, imageBounds, {
        className: 'pano-image-overlay'
    }).addTo(imageMap);

    // Centrer et ajuster le zoom pour voir toute l'image sans distorsion
    // Utiliser fitBounds pour remplir l'écran au minimum nécessaire
    imageMap.fitBounds(imageBounds, {
        padding: [0, 0]
    });

    // Ajouter les hotspots de navigation si allowMove
    if (gameState.options.allowMove) {
        park.locations.forEach(loc => {
            if (loc.pano !== currentLocation.pano) {
                const dist = Math.sqrt(Math.pow(loc.lat - currentLocation.lat, 2) + Math.pow(loc.lng - currentLocation.lng, 2));
                if (dist < 0.0008) {
                    // Créer un marqueur circulaire au centre de l'image
                    const marker = L.circleMarker([imageDimensions.height / 2, imageDimensions.width / 2], {
                        radius: 30,
                        fillColor: 'rgba(52, 199, 89, 0.4)',
                        color: 'rgba(52, 199, 89, 0.9)',
                        weight: 3,
                        opacity: 0.9,
                        fillOpacity: 0.4
                    }).addTo(imageMap);

                    marker.on('click', () => {
                        initMapAndPanorama(park, gameState, loc, notify);
                    });

                    // Label au centre
                    const label = L.divIcon({
                        html: '<div style="color: white; font-weight: bold; font-size: 16px; text-align: center;">→</div>',
                        iconSize: [30, 30],
                        className: 'hotspot-label'
                    });

                    L.marker([imageDimensions.height / 2, imageDimensions.width / 2], {
                        icon: label,
                        interactive: false
                    }).addTo(imageMap);
                }
            }
        });
    }

    if (typeof isDebug !== 'undefined' && isDebug) {
        notify('Image chargée avec succès.', 'success');
    };

    const baseMaps = {
        "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap', crossOrigin: true, className: 'map-tile-layer' }),
        "CartoDB Clair": L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, attribution: '&copy; CartoDB', crossOrigin: true, className: 'map-tile-layer' }),
        "CartoDB Sombre": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, attribution: '&copy; CartoDB', crossOrigin: true, className: 'map-tile-layer' }),
        "OpenTopoMap": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 17, attribution: '&copy; OpenTopoMap', crossOrigin: true, className: 'map-tile-layer' })
    };

    const savedMapLayerName = localStorage.getItem('bryanGuessrMapLayer') || "OpenStreetMap";
    let defaultLayer = baseMaps[savedMapLayerName] || baseMaps["OpenStreetMap"];

    const map = L.map('map-container', {
        layers: [defaultLayer],
        zoomAnimation: false,
        fadeAnimation: false,
        zoomSnap: 1
    }).setView([park.centerLat, park.centerLng], park.zoom);

    L.control.layers(baseMaps).addTo(map);

    map.on('baselayerchange', (e) => {
        localStorage.setItem('bryanGuessrMapLayer', e.name);
    });

    const userIcon = createSvgIcon('pin', '#007bff');
    const targetIcon = createSvgIcon('flag', '#34c759');

    let currentMarker = null;

    map.on('click', (e) => {
        if (currentMarker) {
            map.removeLayer(currentMarker);
        }
        currentMarker = L.marker(e.latlng, {icon: userIcon})
            .bindTooltip('Votre position', {direction: 'top', className: 'custom-map-tooltip'})
            .addTo(map);
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
            const p2 = currentLocation.lat * Math.PI / 180;
            const dp = (currentLocation.lat - pos.lat) * Math.PI / 180;
            const dl = (currentLocation.lng - pos.lng) * Math.PI / 180;
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
            
            L.marker([currentLocation.lat, currentLocation.lng], {icon: targetIcon})
                .bindTooltip('Lieu à trouver', {direction: 'top', className: 'custom-map-tooltip'})
                .addTo(map);
                
            L.polyline([pos, [currentLocation.lat, currentLocation.lng]], {color: 'red', weight: 3}).addTo(map);
            map.fitBounds([pos, [currentLocation.lat, currentLocation.lng]], {padding: [30, 30]});
        } else {
            L.marker([currentLocation.lat, currentLocation.lng], {icon: targetIcon})
                .bindTooltip('Lieu à trouver', {direction: 'top', className: 'custom-map-tooltip'})
                .addTo(map);
                
            map.setView([currentLocation.lat, currentLocation.lng], park.zoom);
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
            endStats.innerHTML = `Distance : ${Math.round(distance)}m<br><span class=\"end-score\">+${formattedRoundPoints} pts</span>`;
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
            btnSame.innerHTML = `<i data-lucide=\"rotate-cw\"></i> Rejouer (Mêmes réglages)`;
            btnSame.addEventListener('click', () => {
                const newGameState = {
                    ...gameState,
                    currentRound: 1,
                    totalScore: 0,
                    roundLocations: generateRoundLocations(park, gameState.options.totalRounds),
                    endTime: gameState.options.timeLimit > 0 ? Date.now() + (gameState.options.timeLimit * 1000) : null
                };
                localStorage.setItem('bryanGuessrGameState', JSON.stringify(newGameState));
                renderGame(park, newGameState);
            });

            const btnDiff = document.createElement('button');
            btnDiff.className = 'btn-replay-diff';
            btnDiff.innerHTML = `<i data-lucide=\"settings\"></i> Modifier les réglages`;
            btnDiff.addEventListener('click', () => {
                renderOptions(park);
            });

            actionButtonsWrapper.appendChild(btnSame);
            actionButtonsWrapper.appendChild(btnDiff);
        } else {
            const btnNext = document.createElement('button');
            btnNext.className = 'btn-replay-same';
            btnNext.innerHTML = `Manche suivante <i data-lucide=\"arrow-right\"></i>`;
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
            
            timerElement.innerHTML = `<i data-lucide=\"clock\"></i> ${timeLeft}s`;
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