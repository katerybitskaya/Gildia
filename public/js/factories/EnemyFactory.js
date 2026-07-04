import Enemy from '../entities/Enemy.js';

/** Fabryka abstrakcji (sekcja 6. info.md) - tworzy wrogów na podstawie definicji z data/enemies.json. */
class EnemyFactory {
  static create(defId, defs, x, y) {
    const def = defs.find((d) => d.id === defId);
    if (!def) throw new Error(`Nieznany typ wroga: ${defId}`);
    return new Enemy(def, x, y);
  }
}

export default EnemyFactory;
