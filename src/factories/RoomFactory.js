const Room = require('../dungeon/Room');
const RoomType = require('../dungeon/RoomType');

/**
 * Fabryka abstrakcji (Abstract Factory) — tworzy pokoje odpowiedniego typu
 * i wypełnia je domyślną zawartością (skrzynki, spawn wrogów) zgodnie
 * z zasadami z sekcji 3 i 4 info.md.
 */
class RoomFactory {
  static create(type, params) {
    const room = new Room({ ...params, type });

    switch (type) {
      case RoomType.START:
        // Pusty pokój startowy - zawsze dokładnie 1 skrzynka, brak wrogów.
        room.chestCount = 1;
        break;

      case RoomType.NORMAL:
        // Zwykły pokój - od 0 do 2 skrzynek + kilku losowych wrogów.
        room.chestCount = Math.floor(Math.random() * 3);
        room.enemySpawns = RoomFactory._randomEnemySpawns();
        break;

      case RoomType.MINIBOSS:
        room.chestCount = 0;
        room.enemySpawns = [{ enemyId: 'miniboss_ogre', x: 400, y: 300 }];
        break;

      case RoomType.BOSS:
        room.chestCount = 0;
        room.enemySpawns = [{ enemyId: 'boss_lich', x: 400, y: 300 }];
        break;

      default:
        throw new Error(`Nieznany typ pokoju: ${type}`);
    }

    return room;
  }

  static _randomEnemySpawns() {
    const pool = ['rat', 'archer', 'coward'];
    const count = 2 + Math.floor(Math.random() * 3); // 2-4 wrogów
    const spawns = [];
    for (let i = 0; i < count; i += 1) {
      const enemyId = pool[Math.floor(Math.random() * pool.length)];
      spawns.push({
        enemyId,
        x: Math.round(100 + Math.random() * 600),
        y: Math.round(100 + Math.random() * 400)
      });
    }
    return spawns;
  }
}

module.exports = RoomFactory;
