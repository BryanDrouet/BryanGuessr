chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchPanoData') {
        // L'URL officielle pour forcer la redirection vers un Pano avec ses coordonnées GPS
        const url = `https://www.google.com/maps/@?api=1&map_action=pano&pano=${request.panoId}`;
        
        fetch(url, { redirect: 'follow' })
            .then(response => {
                sendResponse({ success: true, finalUrl: response.url });
            })
            .catch(error => {
                sendResponse({ success: false, error: error.toString() });
            });
            
        return true; 
    }
});