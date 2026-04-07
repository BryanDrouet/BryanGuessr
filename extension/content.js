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
hud.style.transition = 'background-color 0.2s ease, color 0.2s ease';
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
        const match = url.match(/!1s([^!&?]+)/);

        if (match && match[1]) {
            const currentPanoId = match[1];
            const list = data.panoList || [];

            if (list.includes(currentPanoId)) {
                hud.style.backgroundColor = '#ffc107';
                hud.style.color = '#000000';
                hud.textContent = 'DEJA ENREGISTRE';
            } else {
                if (currentPanoId !== lastPanoId) {
                    lastPanoId = currentPanoId;
                    list.push(currentPanoId);
                    chrome.storage.local.set({ panoList: list });
                }
                hud.style.backgroundColor = '#34c759';
                hud.style.color = '#ffffff';
                hud.textContent = 'NOUVEAU POINT CAPTURE';
            }
        } else {
            hud.style.backgroundColor = '#ff3b30';
            hud.style.color = '#ffffff';
            hud.textContent = 'MODE STREET VIEW REQUIS';
        }
    });
}, 500);