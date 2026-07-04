/**
 * Pojedynczy pokój w labiryncie. Gracz widzi na raz tylko jeden pokój.
 * Konwencja: pola prywatne z podłogą (_pole), klasy PascalCase.
 */
class Room {
  constructor({ id, gridX, gridY, type }) {
    this._id = id;
    this._gridX = gridX;
    this._gridY = gridY;
    this._type = type;
    this._doors = []; // { direction, connectsTo, locked }
    this._chestCount = 0;
    this._enemySpawns = []; // { enemyId, x, y }
    this._mineSpawns = []; // { x, y } - statyczne miny/pułapki wygenerowane razem z pokojem
    this._dropsKey = false; // true dla jednego, losowego pokoju miniboss
    this._theme = null; // { floor, wall } - patrz data/roomThemes.json
  }

  get id() { return this._id; }
  get gridX() { return this._gridX; }
  get gridY() { return this._gridY; }

  get type() { return this._type; }
  set type(value) { this._type = value; }

  get doors() { return this._doors; }

  get chestCount() { return this._chestCount; }
  set chestCount(value) { this._chestCount = value; }

  get enemySpawns() { return this._enemySpawns; }
  set enemySpawns(value) { this._enemySpawns = value; }

  get mineSpawns() { return this._mineSpawns; }
  set mineSpawns(value) { this._mineSpawns = value; }

  get dropsKey() { return this._dropsKey; }
  set dropsKey(value) { this._dropsKey = value; }

  get theme() { return this._theme; }
  set theme(value) { this._theme = value; }

  addDoor(direction, connectsTo, locked = false) {
    this._doors.push({ direction, connectsTo, locked });
  }

  /** Zwraca drzwi prowadzące do podanego pokoju, jeśli istnieją. */
  findDoorTo(roomId) {
    return this._doors.find((d) => d.connectsTo === roomId) || null;
  }

  toJSON() {
    return {
      id: this._id,
      gridX: this._gridX,
      gridY: this._gridY,
      type: this._type,
      doors: this._doors,
      chestCount: this._chestCount,
      enemySpawns: this._enemySpawns,
      mineSpawns: this._mineSpawns,
      dropsKey: this._dropsKey,
      theme: this._theme
    };
  }
}

module.exports = Room;
