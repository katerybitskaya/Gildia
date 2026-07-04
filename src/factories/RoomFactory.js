const Room = require('../dungeon/Room');
const RoomType = require('../dungeon/RoomType');
const ROOM_THEMES = require('../../data/roomThemes.json');

/**
 * Fabryka abstrakcji (Abstract Factory) — tworzy pokoje odpowiedniego typu
 * i wypełnia je domyślną zawartością (skrzynki, spawn wrogów, miny, motyw
 * graficzny z data/roomThemes.json) zgodnie z zasadami z sekcji 3 i 4 info.md.
 */
class RoomFactory {
  static create(type, params) {
    const room = new Room({ ...params, type });
    room.theme = RoomFactory.pickTheme(type);

    switch (type) {
      case RoomType.START:
        // Pusty pokój startowy - zawsze dokładnie 1 skrzynka, brak wrogów, brak min.
        room.chestCount = 1;
        break;

      case RoomType.NORMAL:
        // Zwykły pokój - od 0 do 2 skrzynek, kilku losowych wrogów i 0-2 min.
        room.chestCount = Math.floor(Math.random() * 3);
        room.enemySpawns = RoomFactory._randomEnemySpawns();
        room.mineSpawns = RoomFactory._randomMineSpawns();
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

  /**
   * Pokój startowy ma zawsze ten sam, stały motyw (floor_default + room_1).
   * Inne typy losują jeden motyw z listy w data/roomThemes.json - raz, przy
   * generowaniu labiryntu, więc pokój zachowuje swój wygląd na stałe.
   */
  static pickTheme(type) {
    const themes = ROOM_THEMES[type];
    if (!themes) return null;
    if (Array.isArray(themes)) {
      return themes[Math.floor(Math.random() * themes.length)];
    }
    return themes;
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

  static _randomMineSpawns() {
    const count = Math.floor(Math.random() * 3); // 0-2 miny na pokój
    const spawns = [];
    for (let i = 0; i < count; i += 1) {
      spawns.push({
        x: Math.round(100 + Math.random() * 600),
        y: Math.round(100 + Math.random() * 400)
      });
    }
    return spawns;
  }
}

module.exports = RoomFactory;
