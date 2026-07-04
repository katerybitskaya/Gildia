import EnemyFactory from '../factories/EnemyFactory.js';
import Door from './Door.js';
import Chest from './Chest.js';

// Wnętrze pokoju (canvas 800x600, margines na "ściany" ok. 60px) - sekcja 3. info.md.
const ROOM_BOUNDS = { minX: 60, maxX: 740, minY: 60, maxY: 540 };

/**
 * Pokój labiryntu. Gracz widzi na raz tylko jeden pokój (sekcja 3. info.md).
 * Wrogowie i skrzynki są tworzone leniwie, dopiero przy pierwszym wejściu gracza.
 */
class Room {
  static get BOUNDS() { return ROOM_BOUNDS; }

  constructor(layout) {
    this._id = layout.id;
    this._type = layout.type;
    this._chestCount = layout.chestCount;
    this._enemySpawnDefs = layout.enemySpawns;
    this._dropsKey = !!layout.dropsKey;

    this._doors = layout.doors.map((d) => new Door(d));
    this._visited = false;
    this._enemies = [];
    this._chests = [];
    this._traps = [];
    this._keyDropped = false; // zabezpiecza przed wypuszczeniem klucza więcej niż raz z tego pokoju
  }

  get id() { return this._id; }
  get type() { return this._type; }
  get doors() { return this._doors; }
  get enemies() { return this._enemies; }
  get chests() { return this._chests; }
  get traps() { return this._traps; }
  get dropsKey() { return this._dropsKey; }
  get bounds() { return ROOM_BOUNDS; }

  get isCleared() {
    return this._enemies.every((e) => e.isMarkedForRemoval);
  }

  ensurePopulated(enemyDefs) {
    if (this._visited) return;
    this._visited = true;

    for (const spawn of this._enemySpawnDefs) {
      this._enemies.push(EnemyFactory.create(spawn.enemyId, enemyDefs, spawn.x, spawn.y));
    }
    for (let i = 0; i < this._chestCount; i += 1) {
      const pos = this._randomInteriorPosition();
      this._chests.push(new Chest(pos.x, pos.y));
    }
  }

  _randomInteriorPosition() {
    const b = ROOM_BOUNDS;
    const margin = 90;
    return {
      x: b.minX + margin + Math.random() * (b.maxX - b.minX - margin * 2),
      y: b.minY + margin + Math.random() * (b.maxY - b.minY - margin * 2)
    };
  }

  findDoorAt(px, py, playerRadius) {
    return this._doors.find((d) => d.isPlayerAt(px, py, ROOM_BOUNDS, playerRadius)) || null;
  }

  addTrap(trap) { this._traps.push(trap); }

  removeExpiredTraps(now) {
    this._traps = this._traps.filter((t) => t.expiresAt > now);
  }

  /** Sprawdza kolizje gracza z pułapkami, usuwa trafione i zwraca sumę obrażeń. */
  checkTrapHits(px, py, playerRadius) {
    let damage = 0;
    this._traps = this._traps.filter((trap) => {
      const dist = Math.hypot(trap.x - px, trap.y - py);
      if (dist < trap.radius + playerRadius) {
        damage += trap.damage;
        return false;
      }
      return true;
    });
    return damage;
  }

  /** Usuwa martwych wrogów z pokoju i zwraca ich listę (żeby Game mógł np. przyznać loot). */
  removeDeadEnemies() {
    const removed = this._enemies.filter((e) => e.isMarkedForRemoval);
    this._enemies = this._enemies.filter((e) => !e.isMarkedForRemoval);
    return removed;
  }

  /**
   * Klucz do bossa wypada tylko z minibossa w JEDNYM, losowo wyznaczonym pokoju
   * (sekcja 5. info.md: "jeśli więcej to z jednego losowego") i tylko raz.
   */
  shouldDropKeyFrom(enemy) {
    return this._dropsKey && enemy.isMiniboss && !this._keyDropped;
  }

  markKeyDropped() {
    this._keyDropped = true;
  }
}

export default Room;
