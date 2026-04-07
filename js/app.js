function renderHome() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    app.appendChild(createGlobalHeader('BryanGuessr'));

    const main = document.createElement('main');
    main.className = 'game-main page-transition layout-margin';
    main.style.display = 'flex';
    main.style.flexDirection = 'column';

    const title = document.createElement('h1');
    title.className = 'main-title';
    title.textContent = 'Sélectionnez votre parc';

    const grid = document.createElement('div');
    grid.className = 'park-grid';

    parks.forEach(park => {
        const btn = document.createElement('button');
        btn.className = 'park-btn';
        btn.setAttribute('aria-label', `Configurer la partie : ${park.name}`);
        btn.innerHTML = `<i data-lucide="map"></i> ${park.name}`;
        btn.addEventListener('click', () => renderOptions(park));
        grid.appendChild(btn);
    });

    main.appendChild(title);
    main.appendChild(grid);
    app.appendChild(main);

    lucide.createIcons();
}

function renderOptions(park) {
    const app = document.getElementById('app');
    app.innerHTML = '';

    app.appendChild(createGlobalHeader('', renderHome));

    const main = document.createElement('main');
    main.className = 'game-main page-transition layout-margin';
    main.style.display = 'flex';
    main.style.flexDirection = 'column';
    main.style.justifyContent = 'center';

    const title = document.createElement('h2');
    title.className = 'main-title';
    title.textContent = `Configuration - ${park.name}`;

    const form = document.createElement('form');
    form.className = 'options-form';
    form.id = 'game-options-form';
    form.name = 'game-options-form';

    const groupRounds = document.createElement('div');
    groupRounds.className = 'form-group';
    const labelRounds = document.createElement('label');
    labelRounds.setAttribute('for', 'total-rounds');
    labelRounds.textContent = 'Nombre de manches :';
    
    const selectRounds = document.createElement('select');
    selectRounds.id = 'total-rounds';
    selectRounds.name = 'total_rounds';
    
    let roundsOptionsHTML = '';
    for (let i = 1; i <= 10; i++) {
        roundsOptionsHTML += `<option value="${i}" ${i === 5 ? 'selected' : ''}>${i} manche${i > 1 ? 's' : ''}</option>`;
    }
    roundsOptionsHTML += `<option value="custom">Personnalisé...</option>`;
    selectRounds.innerHTML = roundsOptionsHTML;

    const customRoundsWrapper = document.createElement('div');
    customRoundsWrapper.className = 'custom-time-wrapper';
    customRoundsWrapper.style.display = 'none';

    const customRoundsLabel = document.createElement('label');
    customRoundsLabel.setAttribute('for', 'custom-rounds');
    customRoundsLabel.textContent = 'Nombre exact de manches :';
    customRoundsLabel.style.fontSize = '0.9rem';
    customRoundsLabel.style.marginTop = '10px';

    const customRoundsInput = document.createElement('input');
    customRoundsInput.type = 'number';
    customRoundsInput.id = 'custom-rounds';
    customRoundsInput.name = 'custom_rounds';
    customRoundsInput.min = '1';
    customRoundsInput.placeholder = 'Ex: 20';
    customRoundsInput.className = 'custom-time-input';

    customRoundsWrapper.appendChild(customRoundsLabel);
    customRoundsWrapper.appendChild(customRoundsInput);

    selectRounds.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            customRoundsWrapper.style.display = 'flex';
            customRoundsInput.required = true;
        } else {
            customRoundsWrapper.style.display = 'none';
            customRoundsInput.required = false;
            customRoundsInput.value = '';
        }
    });

    groupRounds.appendChild(labelRounds);
    groupRounds.appendChild(selectRounds);
    groupRounds.appendChild(customRoundsWrapper);

    const groupTime = document.createElement('div');
    groupTime.className = 'form-group';
    const labelTime = document.createElement('label');
    labelTime.setAttribute('for', 'time-limit');
    labelTime.textContent = 'Temps par partie :';
    
    const selectTime = document.createElement('select');
    selectTime.id = 'time-limit';
    selectTime.name = 'time_limit';
    selectTime.innerHTML = `
        <option value="0">Illimité</option>
        <option value="60">1 minute</option>
        <option value="120">2 minutes</option>
        <option value="180">3 minutes</option>
        <option value="custom">Personnalisé...</option>
    `;

    const customTimeWrapper = document.createElement('div');
    customTimeWrapper.className = 'custom-time-wrapper';
    customTimeWrapper.style.display = 'none';

    const customTimeLabel = document.createElement('label');
    customTimeLabel.setAttribute('for', 'custom-time');
    customTimeLabel.textContent = 'Durée en secondes :';
    customTimeLabel.style.fontSize = '0.9rem';
    customTimeLabel.style.marginTop = '10px';

    const customTimeInput = document.createElement('input');
    customTimeInput.type = 'number';
    customTimeInput.id = 'custom-time';
    customTimeInput.name = 'custom_time';
    customTimeInput.min = '1';
    customTimeInput.placeholder = 'Ex: 45';
    customTimeInput.className = 'custom-time-input';

    customTimeWrapper.appendChild(customTimeLabel);
    customTimeWrapper.appendChild(customTimeInput);

    selectTime.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            customTimeWrapper.style.display = 'flex';
            customTimeInput.required = true;
        } else {
            customTimeWrapper.style.display = 'none';
            customTimeInput.required = false;
            customTimeInput.value = '';
        }
    });

    groupTime.appendChild(labelTime);
    groupTime.appendChild(selectTime);
    groupTime.appendChild(customTimeWrapper);

    const groupMove = document.createElement('div');
    groupMove.className = 'form-group form-group-checkbox';
    const labelMove = document.createElement('label');
    labelMove.setAttribute('for', 'allow-move');
    labelMove.textContent = 'Possibilité de se déplacer';
    const inputMove = document.createElement('input');
    inputMove.type = 'checkbox';
    inputMove.id = 'allow-move';
    inputMove.name = 'allow_move';
    inputMove.setAttribute('aria-describedby', 'move-desc');
    const descMove = document.createElement('span');
    descMove.id = 'move-desc';
    descMove.className = 'sr-only';
    descMove.textContent = 'Autorise le déplacement entre différents panoramas.';
    groupMove.appendChild(labelMove);
    groupMove.appendChild(inputMove);
    groupMove.appendChild(descMove);

    const groupPan = document.createElement('div');
    groupPan.className = 'form-group form-group-checkbox';
    const labelPan = document.createElement('label');
    labelPan.setAttribute('for', 'allow-pan');
    labelPan.textContent = 'Possibilité de bouger la caméra';
    const inputPan = document.createElement('input');
    inputPan.type = 'checkbox';
    inputPan.id = 'allow-pan';
    inputPan.name = 'allow_pan';
    inputPan.checked = true;
    inputPan.setAttribute('aria-describedby', 'pan-desc');
    const descPan = document.createElement('span');
    descPan.id = 'pan-desc';
    descPan.className = 'sr-only';
    descPan.textContent = 'Autorise la rotation de la vue à 360 degrés.';
    groupPan.appendChild(labelPan);
    groupPan.appendChild(inputPan);
    groupPan.appendChild(descPan);

    const btnSubmit = document.createElement('button');
    btnSubmit.type = 'submit';
    btnSubmit.className = 'btn-start';
    btnSubmit.setAttribute('aria-label', 'Lancer la partie avec ces options');
    btnSubmit.innerHTML = `<i data-lucide="play"></i> Lancer la partie`;

    form.appendChild(groupRounds);
    form.appendChild(groupTime);
    form.appendChild(groupMove);
    form.appendChild(groupPan);
    form.appendChild(btnSubmit);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let timeLimitValue = 0;
        if (selectTime.value === 'custom') {
            timeLimitValue = parseInt(customTimeInput.value, 10);
            if (isNaN(timeLimitValue) || timeLimitValue < 1) {
                timeLimitValue = 0;
            }
        } else {
            timeLimitValue = parseInt(selectTime.value, 10);
        }

        let roundsValue = 5;
        if (selectRounds.value === 'custom') {
            roundsValue = parseInt(customRoundsInput.value, 10);
            if (isNaN(roundsValue) || roundsValue < 1) {
                roundsValue = 1;
            }
        } else {
            roundsValue = parseInt(selectRounds.value, 10);
        }

        const gameState = {
            parkId: park.id,
            options: {
                timeLimit: timeLimitValue,
                allowMove: document.getElementById('allow-move').checked,
                allowPan: document.getElementById('allow-pan').checked,
                totalRounds: roundsValue
            },
            currentRound: 1,
            totalScore: 0,
            endTime: timeLimitValue > 0 ? Date.now() + (timeLimitValue * 1000) : null
        };

        localStorage.setItem('bryanGuessrGameState', JSON.stringify(gameState));
        renderGame(park, gameState);
    });

    main.appendChild(title);
    main.appendChild(form);
    app.appendChild(main);

    lucide.createIcons();
}

function renderGame(park, gameState) {
    const app = document.getElementById('app');
    app.innerHTML = '';

    const header = document.createElement('header');
    
    const btnBack = document.createElement('button');
    btnBack.className = 'btn-back';
    btnBack.setAttribute('aria-label', 'Quitter la partie');
    btnBack.innerHTML = `<i data-lucide="arrow-left"></i> Quitter`;
    btnBack.addEventListener('click', () => {
        localStorage.removeItem('bryanGuessrGameState');
        renderOptions(park);
    });

    const scoreBoard = document.createElement('div');
    scoreBoard.className = 'score-board';
    scoreBoard.setAttribute('aria-live', 'polite');
    
    let timerHTML = '';
    if (gameState.options.timeLimit > 0) {
        timerHTML = `<span id="timer" style="display: flex; align-items: center; gap: 5px;"><i data-lucide="clock"></i> --s</span>`;
    }

    const maxPoints = gameState.options.totalRounds * 5000;
    const formattedScore = gameState.totalScore.toLocaleString('fr-FR');
    const formattedMax = maxPoints.toLocaleString('fr-FR');

    scoreBoard.innerHTML = `
        ${timerHTML}
        <span class="round-badge">Manche ${gameState.currentRound} / ${gameState.options.totalRounds}</span>
        <span><strong id="current-score">${formattedScore}</strong> / ${formattedMax} pts</span>
    `;

    header.appendChild(btnBack);
    header.appendChild(scoreBoard);

    const main = document.createElement('main');
    main.className = 'game-main page-transition';

    const panoramaContainer = document.createElement('section');
    panoramaContainer.id = 'panorama-container';
    panoramaContainer.setAttribute('aria-label', `Vue à 360 degrés - ${park.name}`);

    const mapInterface = document.createElement('section');
    mapInterface.id = 'map-interface';
    mapInterface.setAttribute('aria-label', 'Interface de la carte');

    const mapHeader = document.createElement('div');
    mapHeader.className = 'map-header';

    const mapTitle = document.createElement('span');
    mapTitle.textContent = 'Carte';

    const btnResizeMap = document.createElement('button');
    btnResizeMap.id = 'btn-resize-map';
    btnResizeMap.type = 'button';
    btnResizeMap.setAttribute('aria-label', 'Agrandir la carte');
    btnResizeMap.innerHTML = '<i data-lucide="maximize"></i>';

    mapHeader.appendChild(mapTitle);
    mapHeader.appendChild(btnResizeMap);

    const mapContainer = document.createElement('div');
    mapContainer.id = 'map-container';

    const btnGuess = document.createElement('button');
    btnGuess.id = 'btn-guess';
    btnGuess.setAttribute('aria-label', 'Valider ma position géographique');
    btnGuess.innerHTML = `<i data-lucide="map-pin"></i> Valider`;

    mapHeader.addEventListener('click', () => {
        const isExpanded = mapInterface.classList.toggle('expanded');
        btnResizeMap.innerHTML = isExpanded ? '<i data-lucide="minimize"></i>' : '<i data-lucide="maximize"></i>';
        btnResizeMap.setAttribute('aria-label', isExpanded ? 'Rétrécir la carte' : 'Agrandir la carte');
        lucide.createIcons();
        
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 300);
    });

    mapInterface.appendChild(mapHeader);
    mapInterface.appendChild(mapContainer);
    mapInterface.appendChild(btnGuess);

    main.appendChild(panoramaContainer);
    main.appendChild(mapInterface);

    app.appendChild(header);
    app.appendChild(main);
    
    lucide.createIcons();

    if (gameState.endTime || gameState.options.timeLimit === 0) {
        initMapAndPanorama(park, gameState, showNotification);
    } else {
        const overlay = document.createElement('div');
        overlay.className = 'countdown-overlay';
        app.appendChild(overlay);

        let count = 3;
        const countSpan = document.createElement('span');
        countSpan.textContent = count;
        overlay.appendChild(countSpan);

        const countInterval = setInterval(() => {
            count--;
            if (count > 0) {
                countSpan.textContent = count;
                countSpan.style.animation = 'none';
                countSpan.offsetHeight;
                countSpan.style.animation = null;
            } else if (count === 0) {
                countSpan.textContent = 'GO!';
                countSpan.style.animation = 'none';
                countSpan.offsetHeight;
                countSpan.style.animation = null;
            } else {
                clearInterval(countInterval);
                overlay.remove();

                if (gameState.options.timeLimit > 0) {
                    gameState.endTime = Date.now() + (gameState.options.timeLimit * 1000);
                    localStorage.setItem('bryanGuessrGameState', JSON.stringify(gameState));
                }

                initMapAndPanorama(park, gameState, showNotification);
            }
        }, 1000);
    }
}

function bootstrapBryanGuessr() {
    const currentTheme = localStorage.getItem('bryanGuessrTheme') || 'system';
    applyTheme(currentTheme);

    const rgpdBanner = document.getElementById('rgpd-banner');
    const btnAcceptRgpd = document.getElementById('btn-accept-rgpd');

    if (!localStorage.getItem('rgpd_consent')) {
        rgpdBanner.classList.remove('hidden');
    }

    btnAcceptRgpd.addEventListener('click', () => {
        localStorage.setItem('rgpd_consent', 'true');
        rgpdBanner.classList.add('hidden');
    });

    window.addEventListener('error', (e) => {
        if (typeof isDebug !== 'undefined' && isDebug) {
            showNotification(`Erreur système : ${e.message}`, 'error');
        }
    });

    const savedState = localStorage.getItem('bryanGuessrGameState');
    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            const park = parks.find(p => p.id === state.parkId);
            if (park) {
                if (state.endTime && Date.now() >= state.endTime) {
                    localStorage.removeItem('bryanGuessrGameState');
                    renderHome();
                } else {
                    renderGame(park, state);
                }
            } else {
                renderHome();
            }
        } catch (e) {
            localStorage.removeItem('bryanGuessrGameState');
            renderHome();
        }
    } else {
        renderHome();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapBryanGuessr);
} else {
    bootstrapBryanGuessr();
}