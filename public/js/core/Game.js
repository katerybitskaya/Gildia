import Room from '../world/Room.js';
import Player from '../entities/Player.js';
import ItemFactory from '../factories/ItemFactory.js';
import PetFactory from '../factories/PetFactory.js';
import HUD from '../ui/HUD.js';
import SpriteLoader from '../utils/SpriteLoader.js';

/**
 * Główna pętla gry: pobiera dane z backendu (labirynt + definicje z JSON),
 * obsługuje input, aktualizuje stan i renderuje bieżący pokój (sekcja 3. info.md:
 * "gracz widzi na raz tylko jeden pokój").
 */
class Game {
  constructor(canvas) {
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d');
    this._hud = new HUD(this._ctx, canvas);

    this._rooms = new Map();
    this._currentRoomId = null;
    this._player = null;

    this._enemyDefs = [];
    this._itemDefs = [];
    this._petDefs = [];
    this._sprites = {};

    this._playerProjectiles = [];
    this._enemyProjectiles = [];

    this._keys = { up: false, down: false, left: false, right: false, shoot: false };
    this._lastFrameAt = 0;
    this._message = null;
    this._messageUntil = 0;
    this._gameOver = false;
    this._level = 1;

    this._bindInput();
  }

  async start() {
    const [dungeon, enemyDefs, itemDefs, petDefs, sprites] = await Promise.all([
      fetch(`/api/dungeon/new?level=${this._level}`).then((r) => r.json()),
      fetch('/api/enemies').then((r) => r.json()),
      fetch('/api/items').then((r) => r.json()),
      fetch('/api/pets').then((r) => r.json()),
      fetch('/api/sprites').then((r) => r.json())
    ]);

    this._enemyDefs = enemyDefs;
    this._itemDefs = itemDefs;
    this._petDefs = petDefs;
    this._sprites = sprites;

    this._loadDungeon(dungeon);
    requestAnimationFrame((t) => this._loop(t));
  }

  /**
   * Rysuje obrazek, jeśli ścieżka jest ustawiona i grafika już się załadowała.
   * W przeciwnym razie woła fallbackFn (kolorowy placeholder) - dzięki temu
   * podmiana grafiki w data/*.json działa "od ręki", bez zmian w kodzie.
   */
  _drawSprite(path, x, y, w, h, fallbackFn) {
    const img = path ? SpriteLoader.get(path) : null;
    if (img) {
      this._ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
    } else {
      fallbackFn();
    }
  }

  _loadDungeon(dungeon) {
    this._rooms.clear();
    for (const layout of dungeon.rooms) {
      this._rooms.set(layout.id, new Room(layout));
    }
    this._currentRoomId = dungeon.startRoomId;

    const bounds = Room.BOUNDS;
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    this._player = new Player(cx, cy);

    this._enterCurrentRoom();
  }

  _enterCurrentRoom() {
    const room = this._rooms.get(this._currentRoomId);
    room.ensurePopulated(this._enemyDefs);
    for (const pet of this._player.pets) pet.placeRandomly(room.bounds);
    this._playerProjectiles = [];
    this._enemyProjectiles = [];
  }

  _bindInput() {
    const KEY_MAP = {
      KeyW: 'up', ArrowUp: 'up',
      KeyS: 'down', ArrowDown: 'down',
      KeyA: 'left', ArrowLeft: 'left',
      KeyD: 'right', ArrowRight: 'right'
    };

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        this._keys.shoot = true;
        e.preventDefault();
        return;
      }
      const dir = KEY_MAP[e.code];
      if (dir) this._keys[dir] = true;
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this._keys.shoot = false;
        return;
      }
      const dir = KEY_MAP[e.code];
      if (dir) this._keys[dir] = false;
    });
  }

  _loop(t) {
    const dtMs = this._lastFrameAt ? Math.min(50, t - this._lastFrameAt) : 16.6667;
    this._lastFrameAt = t;

    if (!this._gameOver) this._update(dtMs, t);
    this._render();

    requestAnimationFrame((next) => this._loop(next));
  }

  _update(dtMs, now) {
    const room = this._rooms.get(this._currentRoomId);
    const bounds = room.bounds;

    this._player.update(dtMs);

    let dx = 0;
    let dy = 0;
    if (this._keys.up) dy -= 1;
    if (this._keys.down) dy += 1;
    if (this._keys.left) dx -= 1;
    if (this._keys.right) dx += 1;
    this._player.move(dx, dy, dtMs, bounds);

    if (this._keys.shoot) {
      this._playerProjectiles.push(...this._player.tryShoot(now));
    }

    const context = {
      player: this._player,
      bounds,
      now,
      addEnemyProjectile: (p) => this._enemyProjectiles.push(p),
      addTrap: (trap) => room.addTrap(trap)
    };

    for (const enemy of room.enemies) {
      if (!enemy.isMarkedForRemoval) enemy.update(dtMs, context);
    }
    room.removeDeadEnemies();

    for (const p of this._playerProjectiles) p.update(dtMs, bounds);
    for (const p of this._enemyProjectiles) p.update(dtMs, bounds);

    this._resolveCombat(room);

    const trapDamage = room.checkTrapHits(this._player.x, this._player.y, this._player.radius);
    if (trapDamage > 0) this._player.takeDamage(trapDamage);

    this._resolveChests(room);
    this._resolvePets(room, now);
    this._resolveDoors(room);

    this._playerProjectiles = this._playerProjectiles.filter((p) => p.alive);
    this._enemyProjectiles = this._enemyProjectiles.filter((p) => p.alive);

    if (this._player.isDead()) this._gameOver = true;
  }

  _resolveCombat(room) {
    for (const proj of this._playerProjectiles) {
      if (!proj.alive) continue;
      for (const enemy of room.enemies) {
        if (enemy.isMarkedForRemoval) continue;
        const dist = Math.hypot(proj.x - enemy.x, proj.y - enemy.y);
        if (dist < proj.radius + enemy.radius) {
          enemy.takeDamage(proj.damage);
          proj.kill();
          break;
        }
      }
    }

    for (const proj of this._enemyProjectiles) {
      if (!proj.alive) continue;
      const dist = Math.hypot(proj.x - this._player.x, proj.y - this._player.y);
      if (dist < proj.radius + this._player.radius) {
        this._player.takeDamage(proj.damage);
        proj.kill();
      }
    }

    room.removeDeadEnemies();
  }

  _resolveChests(room) {
    for (const chest of room.chests) {
      if (chest.opened) continue;
      const dist = Math.hypot(chest.x - this._player.x, chest.y - this._player.y);
      if (dist < chest.radius + this._player.radius) {
        chest.open();
        this._grantChestLoot(room);
      }
    }
  }

  _grantChestLoot(room) {
    const rollPet = Math.random() < 0.2;

    if (rollPet && this._petDefs.length > 0) {
      const defId = PetFactory.randomDefId(this._petDefs);
      const existing = this._player.findPetById(defId);
      if (existing) {
        existing.levelUp();
        this._showMessage(`${existing.name} awansował na poziom ${existing.level}!`);
      } else {
        const pet = PetFactory.create(defId, this._petDefs, 1);
        pet.placeRandomly(room.bounds);
        this._player.addPet(pet);
        this._showMessage(`Nowy pet: ${pet.name}!`);
      }
      return;
    }

    const item = ItemFactory.randomLoot(this._itemDefs);
    if (item.type === 'passive') this._player.applyPassiveItem(item);
    else item.applyTo(this._player);
    this._showMessage(`Znaleziono: ${item.name}`);
  }

  _resolvePets(room, now) {
    for (const pet of this._player.pets) {
      pet.update(16.6667, room.bounds, now);
      if (pet.charges <= 0 || !pet.canUse(now)) continue;

      const dist = Math.hypot(pet.x - this._player.x, pet.y - this._player.y);
      if (dist < pet.radius + this._player.radius) {
        pet.applyTo(this._player);
        pet.consumeCharge();
        pet.markUsed(now);
      }
    }
  }

  _resolveDoors(room) {
    const door = room.findDoorAt(this._player.x, this._player.y);
    if (!door) return;

    if (door.locked) {
      if (this._player.useKey()) {
        this._unlockDoorPair(room, door);
        this._showMessage('Drzwi bossa otwarte!');
      } else {
        this._showMessage('Potrzebujesz klucza, aby wejść do pokoju bossa.');
        return;
      }
    }

    this._currentRoomId = door.connectsTo;
    this._enterCurrentRoom();
    this._repositionPlayerAfterTransition(door.direction);
  }

  _unlockDoorPair(room, door) {
    door.locked = false;
    const target = this._rooms.get(door.connectsTo);
    const backDoor = target.doors.find((d) => d.connectsTo === room.id);
    if (backDoor) backDoor.locked = false;
  }

  _repositionPlayerAfterTransition(direction) {
    const b = Room.BOUNDS;
    const cx = (b.minX + b.maxX) / 2;
    const cy = (b.minY + b.maxY) / 2;

    if (direction === 'north') this._player.setPosition(cx, b.maxY - 40);
    else if (direction === 'south') this._player.setPosition(cx, b.minY + 40);
    else if (direction === 'west') this._player.setPosition(b.maxX - 40, cy);
    else if (direction === 'east') this._player.setPosition(b.minX + 40, cy);
  }

  _showMessage(text) {
    this._message = text;
    this._messageUntil = performance.now() + 2200;
  }

  _render() {
    const room = this._rooms.get(this._currentRoomId);
    const ctx = this._ctx;
    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

    this._renderRoom(room);
    this._renderChests(room);
    this._renderTraps(room);
    this._renderEnemies(room);
    this._renderPets();
    this._renderProjectiles();
    this._renderPlayer();

    const activeMessage = this._message && performance.now() < this._messageUntil ? this._message : null;
    this._hud.draw(this._player, room, activeMessage);

    if (this._gameOver) this._renderGameOver();
  }

  _renderRoom(room) {
    const ctx = this._ctx;
    const b = room.bounds;
    const tiles = this._sprites.tiles || {};

    ctx.fillStyle = '#14141f';
    ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

    // Ściany - grafika rysowana jako "rama" pod podłogą, żeby nie trzeba było kaflować ręcznie
    const wallImg = tiles.wall ? SpriteLoader.get(tiles.wall) : null;
    if (wallImg) {
      const margin = 40;
      ctx.drawImage(wallImg, b.minX - margin, b.minY - margin, (b.maxX - b.minX) + margin * 2, (b.maxY - b.minY) + margin * 2);
    }

    // Podłoga
    const floorImg = tiles.floor ? SpriteLoader.get(tiles.floor) : null;
    if (floorImg) {
      ctx.drawImage(floorImg, b.minX, b.minY, b.maxX - b.minX, b.maxY - b.minY);
    } else {
      ctx.fillStyle = room.type === 'boss' ? '#3a1a1a' : room.type === 'miniboss' ? '#3a2a12' : '#23233a';
      ctx.fillRect(b.minX, b.minY, b.maxX - b.minX, b.maxY - b.minY);
    }

    if (!wallImg) {
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 6;
      ctx.strokeRect(b.minX, b.minY, b.maxX - b.minX, b.maxY - b.minY);
    }

    for (const door of room.doors) {
      const c = door.center(b);
      const doorPath = door.locked ? tiles.doorLocked : tiles.door;
      this._drawSprite(doorPath, c.x, c.y, 48, 48, () => {
        ctx.fillStyle = door.locked ? '#7a1f1f' : '#c9a227';
        ctx.beginPath();
        ctx.arc(c.x, c.y, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
  }

  _renderChests(room) {
    const ctx = this._ctx;
    const chestSprites = this._sprites.chest || {};
    for (const chest of room.chests) {
      if (chest.opened) continue;
      this._drawSprite(chestSprites.closed, chest.x, chest.y, chest.radius * 2, chest.radius * 1.5, () => {
        ctx.fillStyle = '#a5682a';
        ctx.fillRect(chest.x - chest.radius, chest.y - chest.radius, chest.radius * 2, chest.radius * 1.5);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(chest.x - chest.radius, chest.y - chest.radius, chest.radius * 2, chest.radius * 1.5);
      });
    }
  }

  _renderTraps(room) {
    const ctx = this._ctx;
    for (const trap of room.traps) {
      ctx.beginPath();
      ctx.arc(trap.x, trap.y, trap.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(155, 89, 182, 0.5)';
      ctx.fill();
    }
  }

  _renderEnemies(room) {
    const ctx = this._ctx;
    for (const enemy of room.enemies) {
      if (enemy.isMarkedForRemoval) continue;

      this._drawSprite(enemy.spritePath, enemy.x, enemy.y, enemy.radius * 2, enemy.radius * 2, () => {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fillStyle = enemy.isBoss ? '#8e2de2' : enemy.isMiniboss ? '#d35400' : '#c0392b';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      const barWidth = enemy.radius * 2;
      const pct = Math.max(0, enemy.hp) / enemy.maxHp;
      ctx.fillStyle = '#000';
      ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.radius - 10, barWidth, 5);
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.radius - 10, barWidth * pct, 5);
    }
  }

  _renderPets() {
    const ctx = this._ctx;
    for (const pet of this._player.pets) {
      this._drawSprite(pet.spritePath, pet.x, pet.y, pet.radius * 2, pet.radius * 2, () => {
        ctx.beginPath();
        ctx.arc(pet.x, pet.y, pet.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#f39c12';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();
      });
    }
  }

  _renderProjectiles() {
    const ctx = this._ctx;
    const projSprites = this._sprites.projectile || {};

    for (const p of this._playerProjectiles) {
      this._drawSprite(projSprites.player, p.x, p.y, p.radius * 2, p.radius * 2, () => {
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    for (const p of this._enemyProjectiles) {
      this._drawSprite(projSprites.enemy, p.x, p.y, p.radius * 2, p.radius * 2, () => {
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  _renderPlayer() {
    const ctx = this._ctx;
    const p = this._player;
    const playerSprites = this._sprites.player || {};

    this._drawSprite(playerSprites.idle, p.x, p.y, p.radius * 2, p.radius * 2, () => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.isInvincibleNow ? 'rgba(52,152,219,0.6)' : '#3498db';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + Math.cos(p.facingAngle) * (p.radius + 10), p.y + Math.sin(p.facingAngle) * (p.radius + 10));
    ctx.stroke();
  }

  _renderGameOver() {
    const ctx = this._ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Zginąłeś', this._canvas.width / 2, this._canvas.height / 2 - 10);
    ctx.font = '16px sans-serif';
    ctx.fillText('Odśwież stronę, aby zacząć od nowa', this._canvas.width / 2, this._canvas.height / 2 + 20);
  }
}

export default Game;
