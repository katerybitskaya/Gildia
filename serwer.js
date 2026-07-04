const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// SSL-сертификаты для HTTPS (самоподписанные ss.crt / ss.key лежат рядом с сервером)
const options = {
  key: fs.readFileSync(path.join(__dirname, 'ss.key')),
  cert: fs.readFileSync(path.join(__dirname, 'ss.crt'))
};

const server = https.createServer(options, app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

// --- Настройки игры ---
const MAP_WIDTH = 2000;
const MAP_HEIGHT = 2000;
const PLAYER_SPEED = 4; // пикселей за тик
const TICK_RATE = 33; // мс (~30 обновлений в секунду)
const PLAYER_RADIUS = 14;

const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c', '#e67e22'];
function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

// Состояние всех игроков, хранится на сервере (клиент не может подделать позицию)
const players = {};

io.on('connection', (socket) => {
  console.log(`Игрок подключился: ${socket.id}`);

  players[socket.id] = {
    id: socket.id,
    x: Math.random() * MAP_WIDTH,
    y: Math.random() * MAP_HEIGHT,
    color: randomColor(),
    name: `Игрок-${socket.id.slice(0, 4)}`,
    keys: { up: false, down: false, left: false, right: false }
  };

  // Сообщаем новому клиенту его id и размеры карты
  socket.emit('init', {
    id: socket.id,
    map: { width: MAP_WIDTH, height: MAP_HEIGHT, playerRadius: PLAYER_RADIUS }
  });

  // Клиент присылает, какие клавиши сейчас зажаты
  socket.on('keys', (keys) => {
    const player = players[socket.id];
    if (!player || typeof keys !== 'object' || keys === null) return;
    player.keys = {
      up: !!keys.up,
      down: !!keys.down,
      left: !!keys.left,
      right: !!keys.right
    };
  });

  socket.on('setName', (name) => {
    const player = players[socket.id];
    if (!player) return;
    const clean = String(name || '').trim().slice(0, 20);
    if (clean) player.name = clean;
  });

  socket.on('disconnect', () => {
    console.log(`Игрок отключился: ${socket.id}`);
    delete players[socket.id];
  });
});

// Игровой цикл: двигаем всех игроков и рассылаем актуальное состояние
setInterval(() => {
  for (const id in players) {
    const p = players[id];
    let dx = 0;
    let dy = 0;
    if (p.keys.up) dy -= 1;
    if (p.keys.down) dy += 1;
    if (p.keys.left) dx -= 1;
    if (p.keys.right) dx += 1;

    if (dx !== 0 && dy !== 0) {
      // нормализация диагонального движения, чтобы не было ускорения по диагонали
      dx *= Math.SQRT1_2;
      dy *= Math.SQRT1_2;
    }

    p.x = Math.min(MAP_WIDTH, Math.max(0, p.x + dx * PLAYER_SPEED));
    p.y = Math.min(MAP_HEIGHT, Math.max(0, p.y + dy * PLAYER_SPEED));
  }

  io.emit('state', players);
}, TICK_RATE);

server.listen(PORT, () => {
  console.log(`HTTPS-сервер запущен: https://localhost:${PORT}`);
});
