const hud = document.createElement('div');
hud.id = 'bryan-pano-hud';
hud.style.position = 'fixed';
hud.style.top = '20px';
hud.style.left = '50%';
hud.style.transform = 'translateX(-50%)';
hud.style.zIndex = '999999';
hud.style.padding = '10px 20px';
hud.style.borderRadius = '8px';
hud.style.fontFamily = 'system-ui, sans-serif';
hud.style.fontSize = '1.1rem';
hud.style.fontWeight = 'bold';
hud.style.boxShadow = '0 4px 15px rgba(0,0,0,0.4)';
hud.style.display = 'none';
hud.style.pointerEvents = 'none';

document.body.appendChild(hud);

let lastPanoId = '';

setInterval(() => {
    chrome.storage.local.get(['isScanning', 'panoList'], (data) => {
        if (!data.isScanning) {
            hud.style.display = 'none';
            return;
        }

        hud.style.display = 'block';
        const url = window.location.href;
        
        const matchId = url.match(/!1s([^!&?]+)/);
        const matchCoords = url.match(/@([0-9.-]+),([0-9.-]+)/);

        if (matchId && matchId[1] && matchCoords && matchCoords[1] && matchCoords[2]) {
            const currentPanoId = matchId[1];
            const currentLat = parseFloat(matchCoords[1]);
            const currentLng = parseFloat(matchCoords[2]);
            
            const list = data.panoList || [];
            
            const isDuplicate = list.some(item => typeof item === 'object' && item.id === currentPanoId);

            if (isDuplicate) {
                hud.style.backgroundColor = '#ffc107';
                hud.style.color = '#000000';
                hud.textContent = '[ DEJA ENREGISTRE ]';
            } else {
                if (currentPanoId !== lastPanoId) {
                    lastPanoId = currentPanoId;
                    list.push({ id: currentPanoId, lat: currentLat, lng: currentLng });
                    chrome.storage.local.set({ panoList: list });
                }
                hud.style.backgroundColor = '#34c759';
                hud.style.color = '#ffffff';
                hud.textContent = '[ NOUVEAU POINT CAPTURE ]';
            }
        } else {
            hud.style.backgroundColor = '#ff3b30';
            hud.style.color = '#ffffff';
            hud.textContent = '[ MODE STREET VIEW REQUIS ]';
        }
    });
}, 500);