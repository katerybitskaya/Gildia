import { clamp, frameFactor } from '../utils/MathUtils.js';

/**
 * Pet (sekcja 5. info.md): unikalny, nieśmiertelny, nieatakowalny, nie atakuje wrogów.
 * Chodzi losowo po bieżącym pokoju. Dotknięcie przez gracza zużywa jedno "użycie"
 * (ładunek) efektu; limit ładunków = poziom peta, ale NA POKÓJ - odświeża się przy
 * każdym wejściu do nowego pokoju (patrz resetForRoom(), wołane z Game._enterCurrentRoom).
 * Poziom rośnie przy kolejnym wylosowaniu tego samego peta ze skrzynki.
 */
class Pet {
  constructor(def, level = 1) {
    this._id = def.id;
    this._name = def.name;
    this._description = def.description || '';
    this._effect = def.effect;
    this._spritePath = def.spritePath; // TODO: patrz _spriteNote w data/pets.json
    this._level = level;
    this._charges = level;

    this._x = 0;
    this._y = 0;
    this._angle = Math.random() * Math.PI * 2;
    this._nextTurnAt = 0;
    this._radius = 20;
    this._lastUsedAt = -Infinity;
  }

  get id() { return this._id; }
  get name() { return this._name; }
  get description() { return this._description; }
  get effect() { return this._effect; }
  get spritePath() { return this._spritePath; }
  get level() { return this._level; }
  get charges() { return this._charges; }
  get x() { return this._x; }
  get y() { return this._y; }
  get radius() { return this._radius; }

  levelUp() {
    this._level += 1;
    this._charges = this._level; // od razu odblokuj pełny limit użyć na bieżący pokój
  }

  /** Wywoływane przy każdym wejściu do pokoju - limit użyć = poziom peta, na nowo. */
  resetForRoom() {
    this._charges = this._level;
  }

  canUse(now) {
    return now - this._lastUsedAt >= 1000;
  }

  markUsed(now) {
    this._lastUsedAt = now;
  }

  consumeCharge() {
    if (this._charges > 0) {
      this._charges -= 1;
      return true;
    }
    return false;
  }

  /** Ustawia losową pozycję startową peta przy wejściu do nowego pokoju. */
  placeRandomly(bounds) {
    this._x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
    this._y = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);
  }

  /** Zastosuj efekt peta na graczu (np. leczenie) - wywoływane przy kolizji. */
  applyTo(player) {
    if (this.effect.action === 'heal') {
      player.heal(this.effect.value);
    }
    // 'extraChestChance' i inne efekty pasywne obsługiwane są przez Game przy otwieraniu skrzynek.
  }

  update(dtMs, bounds, now) {
    if (now > this._nextTurnAt) {
      this._angle = Math.random() * Math.PI * 2;
      this._nextTurnAt = now + 1000 + Math.random() * 1500;
    }
    const speed = 1.0;
    const factor = frameFactor(dtMs);
    this._x = clamp(this._x + Math.cos(this._angle) * speed * factor, bounds.minX + this._radius, bounds.maxX - this._radius);
    this._y = clamp(this._y + Math.sin(this._angle) * speed * factor, bounds.minY + this._radius, bounds.maxY - this._radius);
  }
}

export default Pet;
