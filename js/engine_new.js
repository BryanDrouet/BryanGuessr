/**
 * Engine pour GeoGuessr clone - Version Pannellum 360°
 */

function initMapAndPanorama(park, gameState, currentLocation, notify) {
    const panoContainer = document.getElementById('panorama-container');
    const pano = currentLocation.pano;
    
    // Vider le conteneur
    panoContainer.innerHTML = '';
    
    // Détruire le viewer Pannellum existant
    if (window.pannellumViewer) {
        window.pannellumViewer.destroy();
    }
    
    // Initialiser Pannellum avec l'image panoramique
    console.log(`Charger panorama: ${pano}`);
    
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
            console.error('Erreur Pannellum:', error);
            notify('Erreur de chargement');
        },
        onLoad: () => {
            console.log('✓ Panorama chargé');
        }
    });
    
    // Gestion des hotspots (navigation vers autres points)
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
}

function generateHotspots(gameState) {
    // Hotspots pour navigation et marqueur de réponse
    const hotspots = [];
    
    // Ajouter un marqueur au center pour indiquer le point de départ
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
    // Ajouter un marqueur temporaire où l'utilisateur a cliqué
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
            // Hot spot n'existe pas, c'est ok
        }
    }
}

function captureUserAnswer(callback) {
    // En 360°, l'utilisateur pointe là où il pense que c'est
    // On récupère l'orientation actuelle du panorama
    if (window.pannellumViewer) {
        const pitch = window.pannellumViewer.getPitch();
        const yaw = window.pannellumViewer.getYaw();
        const hfov = window.pannellumViewer.getHfov();
        
        console.log(`Réponse: yaw=${yaw}, pitch=${pitch}, hfov=${hfov}`);
        
        callback({
            yaw,
            pitch,
            hfov
        });
    }
}

function calculateDistance(lat1, lng1, lat2, lng2) {
    // Formule de Haversine pour distance géographique
    const R = 6371; // Rayon Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function calculateScore(distanceKm) {
    // Système de points basé sur la distance
    // Max 5000 points si distance < 1km
    const maxDistance = 100; // km (au-delà c'est 0 points)
    
    if (distanceKm <= 1) return 5000;
    if (distanceKm >= maxDistance) return 0;
    
    return Math.round(5000 * (1 - (distanceKm / maxDistance)));
}
