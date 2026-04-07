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
        
        chrome.storage.local.get(['panoList'], async (dataLocal) => {
            const list = dataLocal.panoList || [];
            if (list.length === 0) {
                console.log("Liste vide, annulation");
                return;
            }

            downloadBtn.disabled = true;
            notification.textContent = "Initialisation...";
            let successCount = 0;
            let errorCount = 0;
            
            try {
                const zip = new JSZip();
                console.log("JSZip initialisé");

                for (let i = 0; i < list.length; i++) {
                    const item = list[i];
                    notification.textContent = `Téléchargement panorama ${i + 1}/${list.length}...`;
                    
                    console.log(`Récupération du panorama ${item.id}...`);
                    
                    try {
                        // Créer un dossier pour ce panorama
                        const panoFolder = zip.folder(item.id);
                        
                        // Télécharger les tuiles panoramiques (images cubiques: top, bottom, left, right, front, back)
                        // Pour chaque niveau de zoom (0 = basse, 5 = haute résolution)
                        const zoom = 3; // Bon compromis qualité/taille
                        const tiles = ['0', '1', '2', '3', '4', '5']; // 6 faces du cube
                        
                        let tilesDownloaded = 0;
                        for (const tile of tiles) {
                            const tileUrl = `https://cbk0.google.com/cbk?output=tile&panoid=${item.id}&zoom=${zoom}&x=${tile}&y=0`;
                            
                            try {
                                const response = await fetch(tileUrl, { mode: 'no-cors' });
                                if (response.ok) {
                                    const blob = await response.blob();
                                    panoFolder.file(`tile_${zoom}_${tile}.jpg`, blob);
                                    tilesDownloaded++;
                                }
                            } catch (e) {
                                console.warn(`Erreur tuile ${tile} pour ${item.id}: ${e.message}`);
                            }
                            
                            // Petit délai pour ne pas spammer Google
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }
                        
                        // Sauvegarder aussi les métadonnées
                        panoFolder.file('metadata.json', JSON.stringify({
                            id: item.id,
                            lat: item.lat,
                            lng: item.lng,
                            tiles: tilesDownloaded,
                            zoom: zoom
                        }, null, 2));
                        
                        if (tilesDownloaded > 0) {
                            successCount++;
                            console.log(`✓ Panorama ${item.id}: ${tilesDownloaded} tuiles téléchargées`);
                        } else {
                            errorCount++;
                            console.warn(`✗ Aucune tuile trouvée pour ${item.id}`);
                            zip.remove(item.id);
                        }
                    } catch (error) {
                        console.error(`Erreur pour ${item.id}:`, error.message);
                        errorCount++;
                    }
                }

                if (successCount === 0) {
                    throw new Error("Aucun panorama téléchargé - Vérifiez les pano IDs");
                }

                notification.textContent = "Compression du ZIP...";
                const content = await zip.generateAsync({type: "blob"});
                const url = URL.createObjectURL(content);
                
                console.log(`Téléchargement: ${successCount} panoramas, ${errorCount} erreurs`);
                chrome.downloads.download({
                    url: url,
                    filename: "panoramas_puydufou.zip",
                    saveAs: true
                });

                notification.textContent = `✓ ${successCount} panoramas téléchargés`;
            } catch (error) {
                console.error("Crash du téléchargement:", error);
                notification.textContent = `❌ ${error.message}`;
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