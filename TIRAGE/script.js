const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const resultAnnouncement = document.getElementById('resultAnnouncement');
const resultDisplay = document.getElementById('resultDisplay');

const options = ["Cœur", "Endurance"];
const colors = ["#ff4444", "#44ff44"];
let currentRotation = 0;
let isSpinning = false;

function drawWheel() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, Math.PI, 0);
    ctx.closePath();
    ctx.fillStyle = colors[0];
    ctx.fill();

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px system-ui";
    ctx.fillText(options[0], radius / 2, 8);
    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, 0, Math.PI);
    ctx.closePath();
    ctx.fillStyle = colors[1];
    ctx.fill();

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px system-ui";
    ctx.fillText(options[1], radius / 2, 8);
    ctx.restore();
}

function spinWheel() {
    if (isSpinning) return;
    isSpinning = true;
    spinButton.disabled = true;
    resultDisplay.textContent = "";
    resultAnnouncement.textContent = "La roue tourne...";

    const randomBuffer = new Uint32Array(2);
    window.crypto.getRandomValues(randomBuffer);

    const spins = (randomBuffer[0] % 5) + 5;
    let extraDegrees = randomBuffer[1] % 360;
    
    if (extraDegrees === 90 || extraDegrees === 270) {
        extraDegrees += 5;
    }

    const totalRotation = currentRotation + (spins * 360) + extraDegrees;
    canvas.style.transform = `rotate(${totalRotation}deg)`;
    currentRotation = totalRotation;

    setTimeout(() => {
        const normalizedRotation = totalRotation % 360;
        let winner = "";
        
        if (normalizedRotation < 90 || normalizedRotation > 270) {
            winner = options[0];
        } else {
            winner = options[1];
        }

        resultDisplay.textContent = winner;
        resultAnnouncement.textContent = `Le résultat est : ${winner}`;

        isSpinning = false;
        spinButton.disabled = false;
        lucide.createIcons();
    }, 4000);
}

drawWheel();
spinButton.addEventListener('click', spinWheel);
lucide.createIcons();