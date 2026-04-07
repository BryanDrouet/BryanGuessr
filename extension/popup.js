document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('scan-toggle');
    const panoListTextarea = document.getElementById('pano-list');
    const countDisplay = document.getElementById('count');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');
    const convertBtn = document.getElementById('convert-btn');
    const notification = document.getElementById('notification');

    function updateUI(data) {
        const list = data.panoList || [];
        const isScanning = data.isScanning || false;
        
        toggle.checked = isScanning;
        
        const formattedArray = list.map(p => {
            if (typeof p === 'object' && p.lat) {
                return `            { pano: 'img/puydufou/${p.id}.jpg', lat: ${p.lat}, lng: ${p.lng} }`;
            }
            return p;
        });
        
        panoListTextarea.value = formattedArray.join(',\n');
        countDisplay.textContent = list.length;
    }

    chrome.storage.local.get(['isScanning', 'panoList'], updateUI);

    chrome.storage.onChanged.addListener(() => {
        chrome.storage.local.get(['isScanning', 'panoList'], updateUI);
    });

    toggle.addEventListener('change', (e) => {
        chrome.storage.local.set({ isScanning: e.target.checked });
    });

    copyBtn.addEventListener('click', async () => {
        const text = panoListTextarea.value;
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            notification.textContent = 'LISTE COPIEE AVEC SUCCES';
            notification.style.color = '#32d74b';
            setTimeout(() => notification.textContent = '', 2000);
        } catch (err) {
            notification.textContent = 'ERREUR LORS DE LA COPIE';
            notification.style.color = '#ff453a';
        }
    });

    clearBtn.addEventListener('click', () => {
        chrome.storage.local.set({ panoList: [] });
        notification.textContent = 'LISTE VIDEE';
        notification.style.color = '#ff453a';
        setTimeout(() => notification.textContent = '', 2000);
    });

    convertBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('convertisseur.html') });
    });
});