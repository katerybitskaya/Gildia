import { clamp, frameFactor } from '../utils/MathUtils.js';
import Projectile from './Projectile.js';

/**
 * Gracz - sekcja 2. info.md (Player Controller).
 * Statystyki do balansowania: moveSpeed, damage, fireRateMs, shotSpeed,
 * invincible, projectileCount (każdy pocisk ma kąt względem kierunku patrzenia).
 */
class Player {
  constructor(x, y) {
    this._x = x;
    this._y = y;
    this._radius = 16;
    this._facingAngle = -Math.PI / 2; // domyślnie patrzy w górę

    this._maxHp = 100;
    this._hp = 100;
    this._invincibilityTimerMs = 0; // krótka nietykalność po otrzymaniu obrażeń

    this._stats = {
      moveSpeed: 3.2,
      damage: 10,
      fireRateMs: 350,
      shotSpeed: 7,
      invincible: false,
      projectileCount: 1,
      projectileBounce: false,
      projectileMaxBounces: 3 // limit dla "Soczewki Rykoszetu" - inaczej pocisk odbijałby się w nieskończoność
    };

    this._lastShotAt = -Infinity;
    this._passiveItems = []; // lista zastosowanych przedmiotów pasywnych (synergie)
    this._inventory = { keys: 0 };
    this._pets = []; // instancje Pet, patrz entities/Pet.js

    this._spritePath = null; // TODO: data/sprites.json -> player.idle / player.walk
  }

  get x() { return this._x; }
  get y() { return this._y; }
  get radius() { return this._radius; }
  get facingAngle() { return this._facingAngle; }
  get hp() { return this._hp; }
  get maxHp() { return this._maxHp; }
  get stats() { return this._stats; }
  get inventory() { return this._inventory; }
  get pets() { return this._pets; }
  get passiveItems() { return this._passiveItems; }
  get isInvincibleNow() { return this._stats.invincible || this._invincibilityTimerMs > 0; }

  setPosition(x, y) {
    this._x = x;
    this._y = y;
  }

  /** dx, dy w zakresie [-1, 0, 1] - wynik wejścia z klawiatury (8 kierunków). */
  move(dx, dy, dtMs, bounds) {
    if (dx === 0 && dy === 0) return;
    const len = Math.hypot(dx, dy) || 1;
    const nx = dx / len;
    const ny = dy / len;
    this._facingAngle = Math.atan2(ny, nx);

    const speed = this._stats.moveSpeed * frameFactor(dtMs);
    this._x = clamp(this._x + nx * speed, bounds.minX + this._radius, bounds.maxX - this._radius);
    this._y = clamp(this._y + ny * speed, bounds.minY + this._radius, bounds.maxY - this._radius);
  }

  /** Strzelanie pod spację - w kierunku patrzenia postaci (sekcja 2. info.md). */
  tryShoot(nowMs) {
    if (nowMs - this._lastShotAt < this._stats.fireRateMs) return [];
    this._lastShotAt = nowMs;

    const count = Math.max(1, Math.round(this._stats.projectileCount));
    const spreadStep = 0.15; // ok. 8.6 stopnia między pociskami
    const startOffset = -((count - 1) / 2) * spreadStep;
    const projectiles = [];

    for (let i = 0; i < count; i += 1) {
      const angle = this._facingAngle + startOffset + i * spreadStep;
      projectiles.push(new Projectile({
        x: this._x,
        y: this._y,
        angle,
        speed: this._stats.shotSpeed,
        damage: this._stats.damage,
        owner: 'player',
        bounce: this._stats.projectileBounce === true,
        maxBounces: this._stats.projectileMaxBounces
      }));
    }
    return projectiles;
  }

  takeDamage(amount) {
    if (this.isInvincibleNow) return;
    this._hp = Math.max(0, this._hp - amount);
    this._invincibilityTimerMs = 600;
  }

  heal(amount) {
    this._hp = Math.min(this._maxHp, this._hp + amount);
  }

  isDead() {
    return this._hp <= 0;
  }

  update(dtMs) {
    if (this._invincibilityTimerMs > 0) {
      this._invincibilityTimerMs = Math.max(0, this._invincibilityTimerMs - dtMs);
    }
  }

  /**
   * Stosuje przedmiot pasywny. Mechanika synergii: efekt to zawsze modyfikator
   * dopisywany do statystyk gracza, więc kolejne przedmioty naturalnie się sumują
   * (sekcja 5. info.md - "Zasady tworzenia synergii").
   */
  applyPassiveItem(item) {
    const { stat, modifier, value } = item.effect;
    this._passiveItems.push(item);

    if (modifier === 'add') this._stats[stat] = (this._stats[stat] || 0) + value;
    else if (modifier === 'multiply') this._stats[stat] = (this._stats[stat] || 1) * value;
    else if (modifier === 'set') this._stats[stat] = value;
  }

  addKey() { this._inventory.keys += 1; }

  useKey() {
    if (this._inventory.keys > 0) {
      this._inventory.keys -= 1;
      return true;
    }
    return false;
  }

  addPet(pet) { this._pets.push(pet); }

  findPetById(petId) {
    return this._pets.find((p) => p.id === petId) || null;
  }
}

export default Player;
