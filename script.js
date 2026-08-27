const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorInput = document.getElementById('colorInput');
const sizeInput = document.getElementById('sizeInput');
const sizeValue = document.getElementById('sizeValue');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');

canvas.width = Math.min(window.innerWidth - 40, 800);
canvas.height = 500;
canvas.tabIndex = 1;

let isDrawing = false;
let cursorX = canvas.width / 2;
let cursorY = canvas.height / 2;
let cursorVisible = true;

const keys = {};

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

const drawCursor = () => {
    ctx.save();
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, parseInt(sizeInput.value) / 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(cursorX - 10, cursorY);
    ctx.lineTo(cursorX + 10, cursorY);
    ctx.moveTo(cursorX, cursorY - 10);
    ctx.lineTo(cursorX, cursorY + 10);
    ctx.stroke();
    ctx.restore();
};

const saveState = () => {
    return canvas.toDataURL();
};

let undoStack = [saveState()];
let drawingPixels = null;

const redrawWithCursor = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (drawingPixels) {
        ctx.putImageData(drawingPixels, 0, 0);
    }

    drawCursor();
};

const moveCursor = (dx, dy) => {
    cursorX = Math.max(0, Math.min(canvas.width, cursorX + dx));
    cursorY = Math.max(0, Math.min(canvas.height, cursorY + dy));
};

canvas.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    const step = 5;

    if (e.key === 'ArrowUp') {
        moveCursor(0, -step);
        e.preventDefault();
    } else if (e.key === 'ArrowDown') {
        moveCursor(0, step);
        e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
        moveCursor(-step, 0);
        e.preventDefault();
    } else if (e.key === 'ArrowRight') {
        moveCursor(step, 0);
        e.preventDefault();
    } else if (e.key === ' ') {
        e.preventDefault();
        isDrawing = !isDrawing;
    }
});

canvas.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('focus', () => {
    canvas.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.5)';
});

canvas.addEventListener('blur', () => {
    canvas.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
});

canvas.addEventListener('mousedown', () => {
    isDrawing = true;
    canvas.focus();
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    drawingPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    cursorX = e.clientX - rect.left;
    cursorY = e.clientY - rect.top;
    canvas.focus();
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
        drawingPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
};

const animate = () => {
    draw();
    redrawWithCursor();
    requestAnimationFrame(animate);
};

animate();

window.addEventListener('load', () => {
    canvas.focus();
});

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
