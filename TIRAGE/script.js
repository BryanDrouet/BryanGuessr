const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const resultAnnouncement = document.getElementById('resultAnnouncement');
const wheelTitle = document.getElementById('wheelTitle');
const titleText = document.getElementById('titleText');
const wheelIcon = document.getElementById('wheelIcon');

let wheelData = null;
let options = [];
let colors = [];
let images = {};
let currentRotation = 0;
let isSpinning = false;
let wheelSize = 300;

// Récupérer le paramètre ?v=
function getWheelVersion() {
    const params = new URLSearchParams(window.location.search);
    let version = params.get('v') || 'BOTW';
    
    // Rediriger vers ?v=BOTW si aucun paramètre n'est présent
    if (!params.get('v')) {
        const newUrl = window.location.pathname + '?v=' + version;
        window.history.replaceState({}, '', newUrl);
    }
    
    return version;
}

// Charger les données de la roue
async function loadWheelData() {
    const version = getWheelVersion();
    
    try {
        // Charger le JSON
        const response = await fetch(`/TIRAGE/${version.toLowerCase()}/roue.json`);
        if (!response.ok) throw new Error(`Impossible de charger roue.json pour ${version}`);
        
        wheelData = await response.json();
        
        // Charger le CSS spécifique
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `/TIRAGE/${version.toLowerCase()}/style${version}.css`;
        document.head.appendChild(link);
        
        // Extraire les options et les couleurs
        options = wheelData.options.map(opt => opt.label);
        colors = wheelData.options.map(opt => opt.color);
        
        // Charger les images si elles existent
        const imagePromises = [];
        for (let i = 0; i < wheelData.options.length; i++) {
            const opt = wheelData.options[i];
            if (opt.image) {
                imagePromises.push(
                    new Promise((resolve) => {
                        const img = new Image();
                        img.onload = () => {
                            images[i] = img;
                            resolve();
                        };
                        img.onerror = () => {
                            console.warn(`Image non trouvée: ${opt.image}`);
                            resolve();
                        };
                        img.src = `/TIRAGE/${version.toLowerCase()}/assets/${opt.image}`;
                    })
                );
            }
        }
        
        // Attendre que toutes les images soient chargées
        await Promise.all(imagePromises);
        
        // Mettre à jour le titre et l'icône
        titleText.textContent = wheelData.title;
        if (wheelData.icon) {
            wheelIcon.setAttribute('data-lucide', wheelData.icon);
            wheelIcon.style.display = '';
        } else {
            wheelIcon.removeAttribute('data-lucide');
            wheelIcon.style.display = 'none';
        }
        lucide.createIcons();
        
        // Gérer les options de visibilité
        if (wheelData.hideTitle) {
            document.querySelector('header').style.display = 'none';
        }

        // Activer le clic sur la roue pour lancer
        canvas.style.cursor = 'pointer';
        // utiliser onclick pour éviter d'empiler les handlers lors des reloads
        canvas.onclick = () => {
            if (!isSpinning) spinWheel();
        };
        
        // Initialiser le canvas
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        drawWheel();

        requestAnimationFrame(() => {
            document.body.classList.add('ready');
        });
        
        // Auto-spin si activé
        if (wheelData.autoSpin) {
            setTimeout(() => {
                spinWheel();
            }, 500);
        }
        
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        resultAnnouncement.textContent = 'Erreur lors du chargement des données';
    }
}

function resizeCanvas() {
    const container = canvas.parentElement;
    const maxSize = Math.min(container.clientWidth, container.clientHeight) * 0.985;
    wheelSize = Math.max(220, maxSize);
    
    // Utiliser la résolution de l'écran pour la qualité
    const dpr = window.devicePixelRatio || 1;
    canvas.width = wheelSize * dpr;
    canvas.height = wheelSize * dpr;
    
    ctx.scale(dpr, dpr);
    ctx.canvas.style.width = wheelSize + 'px';
    ctx.canvas.style.height = wheelSize + 'px';
    
    drawWheel();
}

function drawWheel() {
    if (!options || options.length === 0) return;

    const centerX = wheelSize / 2;
    const centerY = wheelSize / 2;
    const borderInset = Math.max(3, Math.round(wheelSize * 0.0125));
    const radius = wheelSize / 2 - borderInset;

    const sliceAngle = (2 * Math.PI) / options.length;

    // Nettoyer le canvas
    ctx.clearRect(0, 0, wheelSize, wheelSize);

    const showLabels = !(wheelData && wheelData.hideLabels);

    // Dessiner chaque section
    for (let i = 0; i < options.length; i++) {
        const startAngle = i * sliceAngle - Math.PI / 2;
        const endAngle = startAngle + sliceAngle;

        // Dessiner le secteur
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colors[i];
        ctx.fill();

        const textAngle = startAngle + sliceAngle / 2;

        // Dessiner l'image si elle existe
        if (images[i] && images[i].complete) {
            // agrandir l'image si les labels sont masqués
            const imgSize = showLabels ? wheelSize / 8 : wheelSize / 5;
            const imgRadius = radius * (showLabels ? 0.45 : 0.5);
            const imgX = centerX + imgRadius * Math.cos(textAngle);
            const imgY = centerY + imgRadius * Math.sin(textAngle);

            ctx.save();
            ctx.translate(imgX, imgY);
            ctx.rotate(textAngle + Math.PI / 2);
            ctx.drawImage(images[i], -imgSize / 2, -imgSize / 2, imgSize, imgSize);
            ctx.restore();
        }

        // Dessiner le texte (si activé)
        if (showLabels) {
            const textRadius = radius * 0.65;
            const textX = centerX + textRadius * Math.cos(textAngle);
            const textY = centerY + textRadius * Math.sin(textAngle);

            ctx.save();
            ctx.translate(textX, textY);
            ctx.rotate(textAngle + Math.PI / 2);
            ctx.fillStyle = '#000';
            ctx.font = `bold ${Math.max(10, Math.min(24, wheelSize / 15))}px system-ui`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(options[i], 0, 0);
            ctx.restore();
        }
    }

    // Séparateurs fins entre les options pour éviter un rendu visuel irrégulier
    ctx.save();
    ctx.strokeStyle = '#111';
    ctx.lineWidth = Math.max(1, Math.round(wheelSize * 0.004));
    ctx.lineCap = 'round';
    for (let i = 0; i < options.length; i++) {
        const angle = i * sliceAngle - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = Math.max(2, Math.round(wheelSize * 0.008));
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
}

function spinWheel() {
    if (isSpinning) return;
    isSpinning = true;
    resultAnnouncement.textContent = 'La roue tourne...';

    const randomBuffer = new Uint32Array(2);
    window.crypto.getRandomValues(randomBuffer);

    const spins = (randomBuffer[0] % 5) + 5;
    let extraDegrees = randomBuffer[1] % 360;
    
    // Éviter d'arrêter sur les bordures
    const sliceAngle = 360 / options.length;
    const invalidZones = [];
    for (let i = 0; i < options.length; i++) {
        const center = i * sliceAngle;
        invalidZones.push([center - 2, center + 2]);
    }
    
    // Vérifier et ajuster si dans une zone interdite
    for (let zone of invalidZones) {
        if (extraDegrees >= zone[0] && extraDegrees <= zone[1]) {
            extraDegrees = (zone[1] + 5) % 360;
            break;
        }
    }

    const totalRotation = currentRotation + (spins * 360) + extraDegrees;
    canvas.style.transform = `rotate(${totalRotation}deg)`;
    currentRotation = totalRotation;

    setTimeout(() => {
        const normalizedRotation = totalRotation % 360;
        
        // Déterminer le gagnant
        const sliceAngle = 360 / options.length;
        const adjustedRotation = (normalizedRotation + sliceAngle / 2) % 360;
        const winnerIndex = Math.floor(adjustedRotation / sliceAngle);
        const winner = options[winnerIndex];

        resultAnnouncement.textContent = `Le résultat est : ${winner}`;

        isSpinning = false;
        lucide.createIcons();
    }, 4000);
}

// Initialisation
loadWheelData();
