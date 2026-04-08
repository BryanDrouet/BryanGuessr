function initMapAndPanorama(park, gameState, currentLocation, notify) {
    const panoContainer = document.getElementById('panorama-container');
    const pano = currentLocation.pano;
    
    panoContainer.innerHTML = '';
    
    if (window.pannellumViewer) {
        window.pannellumViewer.destroy();
    }
    
    window.pannellumViewer = pannellum.viewer('panorama-container', {
        type: 'equirectangular',
        panorama: pano,
        autoLoad: true,
        showControls: true,
        mouseZoom: true,
        doubleClickZoom: true,
        haov: 360,
        vaov: 180,
        vOffset: 0,
        minHfov: 50,
        maxHfov: 120,
        compass: false,
        showFullscreenCtrl: false,
        showZoomCtrl: true,
        hotSpotDebug: isDebug,
        hotSpots: currentLocation.hotspots || [],
        onError: (error) => {
            notify('Erreur de chargement');
        },
        onLoad: () => {
        }
    });
    
    if (currentLocation.hotspots && currentLocation.hotspots.length > 0) {
        currentLocation.hotspots.forEach((hotspot, idx) => {
            if (hotspot.clickHandlerFunc) {
                document.addEventListener('hotspotClick', (e) => {
                    if (e.detail.id === hotspot.id) {
                        hotspot.clickHandlerFunc();
                    }
                });
            }
        });
    }
    
    createMapInterface(park, gameState, currentLocation, notify);
}

function createMapInterface(park, gameState, currentLocation, notify) {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;
    
    if (window.leafletMap) {
        window.leafletMap.remove();
        window.leafletMap = null;
    }
    
    mapContainer.innerHTML = '';
    
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

    window.leafletMap = map;

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

    window.currentMapData = {
        map: map,
        currentMarker: null,
        updateMarker: (latlng) => {
            if (window.currentMapData.currentMarker) {
                map.removeLayer(window.currentMapData.currentMarker);
            }
            window.currentMapData.currentMarker = L.marker(latlng, {icon: userIcon})
                .bindTooltip('Votre position', {direction: 'top', className: 'custom-map-tooltip'})
                .addTo(map);
        }
    };
}

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

function handleValidation(park, gameState, currentLocation, notify) {
    const map = window.leafletMap;
    if (!map) {
        notify('Erreur: carte non initialisée', 'error');
        return;
    }
    
    let userMarker = null;
    map.eachLayer(layer => {
        if (layer instanceof L.Marker && !userMarker) {
            userMarker = layer;
        }
    });
    
    if (!userMarker) {
        notify('Veuillez placer un marqueur sur la carte avant de valider.', 'error');
        return;
    }
    
    const userPos = userMarker.getLatLng();
    const targetPos = {lat: currentLocation.lat, lng: currentLocation.lng};
    
    const R = 6371e3;
    const p1 = userPos.lat * Math.PI / 180;
    const p2 = targetPos.lat * Math.PI / 180;
    const dp = (targetPos.lat - userPos.lat) * Math.PI / 180;
    const dl = (targetPos.lng - userPos.lng) * Math.PI / 180;
    const a = Math.sin(dp/2) * Math.sin(dp/2) + 
              Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    let points = 0;
    if (distance < 20) {
        points = 5000;
    } else {
        points = Math.max(0, Math.floor(5000 * Math.exp(-distance / 1000)));
    }
    
    gameState.totalScore += points;
    document.getElementById('current-score').textContent = gameState.totalScore.toLocaleString('fr-FR');
    
    const targetIcon = createSvgIcon('flag', '#34c759');
    L.marker([currentLocation.lat, currentLocation.lng], {icon: targetIcon})
        .bindTooltip('Lieu à trouver', {direction: 'top', className: 'custom-map-tooltip'})
        .addTo(map);
    
    L.polyline([userPos, targetPos], {color: 'red', weight: 3}).addTo(map);
    
    map.fitBounds([userPos, targetPos], {padding: [30, 30]});
    
    map.off('click');
    const btnGuess = document.getElementById('btn-guess');
    btnGuess.disabled = true;
    btnGuess.style.opacity = '0.5';
    btnGuess.style.pointerEvents = 'none';
    
    const isLastRound = gameState.currentRound >= gameState.options.totalRounds;
    
    const endScreen = document.createElement('div');
    endScreen.id = 'end-screen';
    endScreen.className = 'page-transition';
    endScreen.setAttribute('role', 'dialog');
    endScreen.setAttribute('aria-labelledby', 'end-title');
    
    const endTitle = document.createElement('h2');
    endTitle.id = 'end-title';
    endTitle.className = 'end-title';
    endTitle.textContent = isLastRound ? 'Partie terminée !' : `Manche ${gameState.currentRound} terminée`;
    
    const endStats = document.createElement('div');
    endStats.className = 'end-stats';
    endStats.innerHTML = `Distance : ${Math.round(distance)}m<br><span class="end-score">+${points.toLocaleString('fr-FR')} pts</span>`;
    
    const actionButtonsWrapper = document.createElement('div');
    actionButtonsWrapper.className = 'end-action-buttons';
    
    if (isLastRound) {
        const btnReplay = document.createElement('button');
        btnReplay.className = 'btn-replay-same';
        btnReplay.innerHTML = '<i data-lucide="rotate-cw"></i> Rejouer';
        btnReplay.addEventListener('click', () => {
            localStorage.removeItem('bryanGuessrGameState');
            renderOptions(park);
        });
        
        const btnHome = document.createElement('button');
        btnHome.className = 'btn-replay-diff';
        btnHome.innerHTML = '<i data-lucide="arrow-left"></i> Accueil';
        btnHome.addEventListener('click', renderHome);
        
        actionButtonsWrapper.appendChild(btnReplay);
        actionButtonsWrapper.appendChild(btnHome);
    } else {
        const btnNext = document.createElement('button');
        btnNext.className = 'btn-replay-diff';
        btnNext.innerHTML = '<i data-lucide="arrow-right"></i> Manche suivante';
        btnNext.addEventListener('click', () => {
            gameState.currentRound++;
            localStorage.setItem('bryanGuessrGameState', JSON.stringify(gameState));
            renderGame(park, gameState);
        });
        
        actionButtonsWrapper.appendChild(btnNext);
    }
    
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'end-content-wrapper';
    contentWrapper.appendChild(endTitle);
    contentWrapper.appendChild(endStats);
    contentWrapper.appendChild(actionButtonsWrapper);
    
    endScreen.appendChild(contentWrapper);
    
    const main = document.querySelector('.game-main');
    
    const mapInterface = document.getElementById('map-interface');
    if (mapInterface) {
        mapInterface.classList.add('during-end-screen');
    }
    main.appendChild(endScreen);
    
    lucide.createIcons();
}

function generateHotspots(gameState) {
    const hotspots = [];
    
    hotspots.push({
        pitch: 0,
        yaw: 0,
        type: 'info',
        text: 'Vous êtes ici',
        id: 'start-marker'
    });
    
    return hotspots;
}

function addAnswerMarker(yaw, pitch) {
    if (window.pannellumViewer) {
        window.pannellumViewer.addHotSpot({
            pitch: pitch,
            yaw: yaw,
            type: 'info',
            text: 'Votre réponse',
            id: 'answer-marker',
            cssClass: 'answer-marker'
        });
    }
}

function clearAnswerMarker() {
    if (window.pannellumViewer) {
        try {
            window.pannellumViewer.removeHotSpot('answer-marker');
        } catch (e) {
        }
    }
}

function captureUserAnswer(callback) {
    if (window.pannellumViewer) {
        const pitch = window.pannellumViewer.getPitch();
        const yaw = window.pannellumViewer.getYaw();
        const hfov = window.pannellumViewer.getHfov();
        
        callback({
            yaw,
            pitch,
            hfov
        });
    }
}

function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function calculateScore(distanceKm) {
    const maxDistance = 100;
    
    if (distanceKm <= 1) return 5000;
    if (distanceKm >= maxDistance) return 0;
    
    return Math.round(5000 * (1 - (distanceKm / maxDistance)));
}