const socket = io();

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const hud = document.getElementById('playerCount');

let myId = null;
let mapSize = { width: 2000, height: 2000, playerRadius: 14 };
let players = {};

// Локальное состояние клавиш — отправляется на сервер, который и решает,
// как реально двигать персонажа (сервер авторитетен, клиент только рисует).
const keysState = { up: false, down: false, left: false, right: false };

const KEY_MAP = {
  KeyW: 'up', ArrowUp: 'up',
  KeyS: 'down', ArrowDown: 'down',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right'
};

function sendKeys() {
  socket.emit('keys', keysState);
}

window.addEventListener('keydown', (e) => {
  const dir = KEY_MAP[e.code];
  if (!dir || keysState[dir]) return;
  keysState[dir] = true;
  sendKeys();
});

window.addEventListener('keyup', (e) => {
  const dir = KEY_MAP[e.code];
  if (!dir || !keysState[dir]) return;
  keysState[dir] = false;
  sendKeys();
});

socket.on('init', (data) => {
  myId = data.id;
  mapSize = data.map;
});

socket.on('state', (serverPlayers) => {
  players = serverPlayers;
  hud.textContent = `Игроков: ${Object.keys(players).length}`;
});

function drawBackground(camX, camY) {
  ctx.fillStyle = '#2c2c44';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // сетка для ориентации на карте
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  const gridSize = 50;
  const offsetX = -camX % gridSize;
  const offsetY = -camY % gridSize;

  for (let x = offsetX; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = offsetY; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawPlayer(p, screenX, screenY, isMe) {
  const r = mapSize.playerRadius || 14;

  ctx.beginPath();
  ctx.arc(screenX, screenY, r, 0, Math.PI * 2);
  ctx.fillStyle = p.color;
  ctx.fill();

  if (isMe) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
  }

  ctx.fillStyle = '#fff';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(p.name, screenX, screenY - r - 6);
}

function gameLoop() {
  const me = players[myId];
  const camX = me ? me.x - canvas.width / 2 : 0;
  const camY = me ? me.y - canvas.height / 2 : 0;

  drawBackground(camX, camY);

  for (const id in players) {
    const p = players[id];
    const screenX = p.x - camX;
    const screenY = p.y - camY;

    // не рисуем игроков, которые сейчас за пределами экрана
    if (screenX < -30 || screenX > canvas.width + 30 || screenY < -30 || screenY > canvas.height + 30) {
      continue;
    }
    drawPlayer(p, screenX, screenY, id === myId);
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
