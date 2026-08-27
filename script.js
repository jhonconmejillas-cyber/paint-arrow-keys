const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorInput = document.getElementById('colorInput');
const sizeInput = document.getElementById('sizeInput');
const sizeValue = document.getElementById('sizeValue');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');

canvas.width = Math.min(window.innerWidth - 40, 800);
canvas.height = 500;

let isDrawing = false;
let cursorX = canvas.width / 2;
let cursorY = canvas.height / 2;
let cursorVisible = true;

const keys = {};

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

const drawCursor = () => {
    ctx.save();
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, parseInt(sizeInput.value), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
};

const saveState = () => {
    return canvas.toDataURL();
};

let undoStack = [saveState()];

const redrawWithCursor = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);

    drawCursor();
};

const moveCursor = (dx, dy) => {
    cursorX = Math.max(0, Math.min(canvas.width, cursorX + dx));
    cursorY = Math.max(0, Math.min(canvas.height, cursorY + dy));
};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    let moved = false;
    const step = 5;

    if (e.key === 'ArrowUp') {
        moveCursor(0, -step);
        moved = true;
        e.preventDefault();
    }
    if (e.key === 'ArrowDown') {
        moveCursor(0, step);
        moved = true;
        e.preventDefault();
    }
    if (e.key === 'ArrowLeft') {
        moveCursor(-step, 0);
        moved = true;
        e.preventDefault();
    }
    if (e.key === 'ArrowRight') {
        moveCursor(step, 0);
        moved = true;
        e.preventDefault();
    }

    if (e.key === ' ') {
        e.preventDefault();
        isDrawing = !isDrawing;
    }

    if (e.key === 'Control' || e.key === 'Meta') {
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousedown', () => {
    isDrawing = true;
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    cursorX = e.clientX - rect.left;
    cursorY = e.clientY - rect.top;
});

canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
});

sizeInput.addEventListener('input', (e) => {
    sizeValue.textContent = e.target.value;
});

const draw = () => {
    if (isDrawing) {
        ctx.fillStyle = colorInput.value;
        ctx.beginPath();
        ctx.arc(cursorX, cursorY, parseInt(sizeInput.value) / 2, 0, Math.PI * 2);
        ctx.fill();
    }
};

const animate = () => {
    draw();
    redrawWithCursor();
    requestAnimationFrame(animate);
};

animate();

clearBtn.addEventListener('click', () => {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    undoStack = [saveState()];
});

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = `paint-${Date.now()}.png`;
    link.click();
});

window.addEventListener('resize', () => {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.drawImage(canvas, 0, 0);

    canvas.width = Math.min(window.innerWidth - 40, 800);
    ctx.drawImage(tempCanvas, 0, 0);
});
