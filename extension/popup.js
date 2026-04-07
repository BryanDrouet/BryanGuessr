document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('scan-toggle');
    const panoListTextarea = document.getElementById('pano-list');
    const countDisplay = document.getElementById('count');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');
    const downloadBtn = document.getElementById('download-zip-btn');
    const notification = document.getElementById('notification');

    function updateUI(data) {
        const list = data.panoList || [];
        const isScanning = data.isScanning || false;
        toggle.checked = isScanning;
        const formattedArray = list.map(p => {
            if (typeof p === 'object' && p.id) {
                return `            { pano: 'img/puydufou/${p.id}.jpg', lat: ${p.lat}, lng: ${p.lng} }`;
            }
            return "";
        }).filter(s => s !== "");
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
            await navigator.clipboard.writeText(text + ",\n");
            notification.textContent = 'LISTE COPIEE';
            setTimeout(() => notification.textContent = '', 2000);
        } catch (err) {
            notification.textContent = 'ERREUR COPIE';
        }
    });

    downloadBtn.addEventListener('click', async () => {
        console.log("Bouton Télécharger cliqué");
        chrome.storage.local.get(['panoList'], async (data) => {
            const list = data.panoList || [];
            if (list.length === 0) {
                console.log("Liste vide, annulation");
                return;
            }

            downloadBtn.disabled = true;
            notification.textContent = "Initialisation...";
            
            try {
                const zip = new JSZip();
                console.log("JSZip initialisé");

                for (let i = 0; i < list.length; i++) {
                    const item = list[i];
                    notification.textContent = `Téléchargement ${i + 1}/${list.length}...`;
                    
                    // Utiliser l'API Google Street View Static pour des images fixes haute qualité
                    const imageUrl = `https://maps.googleapis.com/maps/api/streetview?size=1024x680&location=${item.lat},${item.lng}&heading=0&pitch=0&fov=90&return_error_codes=true`;                    
                    console.log(`Récupération de ${item.id}...`);
                    
                    try {
                        const response = await fetch(imageUrl);
                        if (!response.ok) {
                            console.warn(`Erreur HTTP pour ${item.id}: ${response.status}`);
                            throw new Error(`Erreur HTTP: ${response.status}`);
                        }
                        const blob = await response.blob();
                        zip.file(`${item.id}.jpg`, blob);
                    } catch (error) {
                        console.error(`Erreur pour ${item.id}:`, error);
                        throw error;
                    }
                }

                notification.textContent = "Compression du ZIP...";
                const content = await zip.generateAsync({type: "blob"});
                const url = URL.createObjectURL(content);
                
                console.log("Lancement du téléchargement via Chrome");
                chrome.downloads.download({
                    url: url,
                    filename: "panoramas_puydufou.zip",
                    saveAs: true
                });

                notification.textContent = "Terminé !";
            } catch (error) {
                console.error("Crash du téléchargement:", error);
                notification.textContent = "ERREUR : Voir console";
            } finally {
                downloadBtn.disabled = false;
                setTimeout(() => notification.textContent = "", 5000);
            }
        });
    });

    clearBtn.addEventListener('click', () => {
        if(confirm("Vider la liste ?")) {
            chrome.storage.local.set({ panoList: [] });
            notification.textContent = 'LISTE VIDEE';
            setTimeout(() => notification.textContent = '', 2000);
        }
    });
});