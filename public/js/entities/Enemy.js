import EnemyStateMachine from '../states/EnemyStateMachine.js';

/**
 * Bazowa klasa wroga (sekcja 4. info.md). Konkretne zachowanie (melee/shooter/flee/boss)
 * jest realizowane przez hierarchiczną maszynę stanów, nie przez dziedziczenie -
 * dzięki temu jeden wróg mógłby w przyszłości zmieniać zachowanie w locie.
 */
class Enemy {
  constructor(def, x, y) {
    this._defId = def.id;
    this._id = `${def.id}_${Math.random().toString(36).slice(2, 8)}`;
    this._name = def.name;
    this._behavior = def.behavior;
    this._maxHp = def.hp;
    this._hp = def.hp;
    this._damage = def.damage;
    this._speed = def.speed;
    this._x = x;
    this._y = y;
    this._isBoss = !!def.isBoss;
    this._isMiniboss = !!def.isMiniboss;
    this._radius = this._isBoss ? 40 : this._isMiniboss ? 28 : 16;
    this._def = def;
    this._spritePath = def.spritePath; // TODO: patrz _spriteNote w data/enemies.json

    this._lastActionAt = -Infinity;
    this._lastContactAt = -Infinity;
    this._stateMachine = new EnemyStateMachine(this);
  }

  get id() { return this._id; }
  get defId() { return this._defId; }
  get name() { return this._name; }
  get behavior() { return this._behavior; }
  get def() { return this._def; }
  get isBoss() { return this._isBoss; }
  get isMiniboss() { return this._isMiniboss; }
  get spritePath() { return this._spritePath; }

  get x() { return this._x; }
  set x(value) { this._x = value; }
  get y() { return this._y; }
  set y(value) { this._y = value; }

  get radius() { return this._radius; }
  get hp() { return this._hp; }
  get maxHp() { return this._maxHp; }
  get damage() { return this._damage; }
  get speed() { return this._speed; }

  takeDamage(amount) {
    this._hp = Math.max(0, this._hp - amount);
  }

  isDead() { return this._hp <= 0; }
  get isMarkedForRemoval() { return this._stateMachine.isDead; }

  canAct(nowMs, cooldownMs) { return nowMs - this._lastActionAt >= cooldownMs; }
  markActed(nowMs) { this._lastActionAt = nowMs; }

  canContactDamage(nowMs) { return nowMs - this._lastContactAt >= (this._def.contactDamageCooldownMs || 800); }
  markContact(nowMs) { this._lastContactAt = nowMs; }

  update(dtMs, context) {
    this._stateMachine.update(dtMs, context);
  }
}

export default Enemy;
