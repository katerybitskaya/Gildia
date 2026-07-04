const RoomFactory = require('../factories/RoomFactory');
const RoomType = require('./RoomType');

const DIRECTIONS = [
  { dx: 0, dy: -1, dir: 'north', opposite: 'south' },
  { dx: 0, dy: 1, dir: 'south', opposite: 'north' },
  { dx: -1, dy: 0, dir: 'west', opposite: 'east' },
  { dx: 1, dy: 0, dir: 'east', opposite: 'west' }
];

/**
 * Generator proceduralnego labiryntu pokoi (sekcja 3. info.md).
 * Domyślnie 10 pokoi, +5 pokoi za każdy poziom.
 * Liczba pokoi miniboss: 1 (+1 za poziom, max 5).
 */
class DungeonGenerator {
  constructor(level = 1) {
    this._level = Math.max(1, level);
    this._roomCount = 10 + (this._level - 1) * 5;
    this._minibossCount = Math.min(1 + (this._level - 1), 5);
    this._rooms = new Map(); // "x,y" -> Room
  }

  generate() {
    const start = RoomFactory.create(RoomType.START, {
      id: this._makeId(0, 0),
      gridX: 0,
      gridY: 0
    });
    this._rooms.set('0,0', start);

    const frontier = [];
    this._pushFrontier(frontier, 0, 0);

    while (this._rooms.size < this._roomCount && frontier.length > 0) {
      const idx = Math.floor(Math.random() * frontier.length);
      const { x, y, fromX, fromY } = frontier.splice(idx, 1)[0];
      const key = `${x},${y}`;
      if (this._rooms.has(key)) continue;

      const room = RoomFactory.create(RoomType.NORMAL, {
        id: this._makeId(x, y),
        gridX: x,
        gridY: y
      });
      this._rooms.set(key, room);

      this._connect(fromX, fromY, x, y);

      // Dodatkowe połączenia z już istniejącymi sąsiadami (bogatszy labirynt niż zwykłe drzewo)
      for (const d of DIRECTIONS) {
        const nx = x + d.dx;
        const ny = y + d.dy;
        if (nx === fromX && ny === fromY) continue;
        const nkey = `${nx},${ny}`;
        if (this._rooms.has(nkey) && Math.random() < 0.15) {
          this._connect(x, y, nx, ny);
        }
      }

      this._pushFrontier(frontier, x, y);
    }

    this._assignSpecialRooms(start);

    return {
      level: this._level,
      startRoomId: start.id,
      rooms: Array.from(this._rooms.values()).map((r) => r.toJSON())
    };
  }

  _pushFrontier(frontier, x, y) {
    for (const d of DIRECTIONS) {
      const nx = x + d.dx;
      const ny = y + d.dy;
      if (!this._rooms.has(`${nx},${ny}`)) {
        frontier.push({ x: nx, y: ny, fromX: x, fromY: y });
      }
    }
  }

  _connect(x1, y1, x2, y2) {
    const room1 = this._rooms.get(`${x1},${y1}`);
    const room2 = this._rooms.get(`${x2},${y2}`);
    if (!room1 || !room2) return;
    if (room1.findDoorTo(room2.id)) return; // już połączone

    const d = DIRECTIONS.find((dir) => x1 + dir.dx === x2 && y1 + dir.dy === y2);
    if (!d) return;

    room1.addDoor(d.dir, room2.id, false);
    room2.addDoor(d.opposite, room1.id, false);
  }

  _assignSpecialRooms(start) {
    const distances = this._bfsDistances(start.id);
    const candidates = Array.from(this._rooms.values())
      .filter((r) => r.type === RoomType.NORMAL)
      .sort((a, b) => (distances.get(b.id) || 0) - (distances.get(a.id) || 0));

    // Wolimy pokoje ślepe (1 drzwi) na bossa/minibossów - bardziej naturalne w roguelite
    const leaves = candidates.filter((r) => r.doors.length === 1);
    const pool = leaves.length > 0 ? leaves : candidates;

    if (pool.length === 0) return; // za mało pokoi (nie powinno się zdarzyć przy roomCount >= 2)

    // --- Pokój bossa: najdalszy ślepy pokój, drzwi zamknięte na klucz ---
    const bossRoom = pool.shift();
    bossRoom.type = RoomType.BOSS;
    bossRoom.chestCount = 0;
    bossRoom.enemySpawns = [{ enemyId: 'boss_lich', x: 400, y: 300 }];
    for (const door of bossRoom.doors) {
      door.locked = true;
      const neighbor = Array.from(this._rooms.values()).find((r) => r.id === door.connectsTo);
      const backDoor = neighbor && neighbor.findDoorTo(bossRoom.id);
      if (backDoor) backDoor.locked = true;
    }

    // --- Pokoje minibossów ---
    const minibossRooms = pool.splice(0, Math.min(this._minibossCount, pool.length));
    for (const room of minibossRooms) {
      room.type = RoomType.MINIBOSS;
      room.chestCount = 0;
      room.enemySpawns = [{ enemyId: 'miniboss_ogre', x: 400, y: 300 }];
    }

    // Klucz do bossa wypada tylko z JEDNEGO, losowego minibossa (sekcja 5. info.md)
    if (minibossRooms.length > 0) {
      const chosen = minibossRooms[Math.floor(Math.random() * minibossRooms.length)];
      chosen.dropsKey = true;
    }
  }

  _bfsDistances(startId) {
    const distances = new Map([[startId, 0]]);
    const queue = [startId];
    const byId = new Map(Array.from(this._rooms.values()).map((r) => [r.id, r]));

    while (queue.length > 0) {
      const currentId = queue.shift();
      const current = byId.get(currentId);
      const currentDist = distances.get(currentId);
      for (const door of current.doors) {
        if (!distances.has(door.connectsTo)) {
          distances.set(door.connectsTo, currentDist + 1);
          queue.push(door.connectsTo);
        }
      }
    }
    return distances;
  }

  _makeId(x, y) {
    return `r_${x}_${y}`;
  }
}

module.exports = DungeonGenerator;
