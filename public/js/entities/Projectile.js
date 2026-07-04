import { clamp, frameFactor } from '../utils/MathUtils.js';

/** Pocisk (gracza lub wroga). Klasa PascalCase, pola prywatne z podłogą. */
class Projectile {
  constructor({ x, y, angle, speed, damage, owner, bounce = false, maxBounces = 3, spritePath = null }) {
    this._x = x;
    this._y = y;
    this._angle = angle;
    this._speed = speed;
    this._damage = damage;
    this._owner = owner; // 'player' | 'enemy'
    this._bounce = bounce; // z przedmiotu "Soczewka Rykoszetu"
    this._bouncesLeft = maxBounces; // limit odbić - bez tego pocisk latałby w nieskończoność
    this._radius = 5;
    this._alive = true;
    this._spritePath = spritePath; // TODO: podmienić grafikę pocisku w data/sprites.json
  }

  get x() { return this._x; }
  get y() { return this._y; }
  get radius() { return this._radius; }
  get damage() { return this._damage; }
  get owner() { return this._owner; }
  get alive() { return this._alive; }
  get spritePath() { return this._spritePath; }

  kill() { this._alive = false; }

  update(dtMs, bounds) {
    const factor = frameFactor(dtMs);
    this._x += Math.cos(this._angle) * this._speed * factor;
    this._y += Math.sin(this._angle) * this._speed * factor;

    if (this._x < bounds.minX || this._x > bounds.maxX) {
      if (this._bounce && this._bouncesLeft > 0) {
        this._angle = Math.PI - this._angle;
        this._x = clamp(this._x, bounds.minX, bounds.maxX);
        this._bouncesLeft -= 1;
      } else {
        this._alive = false;
      }
    }
    if (this._y < bounds.minY || this._y > bounds.maxY) {
      if (this._bounce && this._bouncesLeft > 0) {
        this._angle = -this._angle;
        this._y = clamp(this._y, bounds.minY, bounds.maxY);
        this._bouncesLeft -= 1;
      } else {
        this._alive = false;
      }
    }
  }
}

export default Projectile;
