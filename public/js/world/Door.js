/**
 * Drzwi między pokojami (sekcja 3. info.md). Pozycja liczona dynamicznie
 * względem granic pokoju (bounds), więc nie trzeba jej duplikować przy rysowaniu i kolizji.
 */
class Door {
  constructor({ direction, connectsTo, locked }) {
    this._direction = direction; // 'north' | 'south' | 'east' | 'west'
    this._connectsTo = connectsTo;
    this._locked = !!locked;
  }

  get direction() { return this._direction; }
  get connectsTo() { return this._connectsTo; }
  get locked() { return this._locked; }
  set locked(value) { this._locked = value; }

  center(bounds) {
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    switch (this._direction) {
      case 'north': return { x: cx, y: bounds.minY };
      case 'south': return { x: cx, y: bounds.maxY };
      case 'west': return { x: bounds.minX, y: cy };
      case 'east': return { x: bounds.maxX, y: cy };
      default: return { x: cx, y: cy };
    }
  }

  /**
   * playerRadius jest wymagany, bo Player.move() nie pozwala podejść do ściany bliżej
   * niż na swój promień - jeśli próg wykrywania drzwi byłby mniejszy niż promień gracza,
   * drzwi stałyby się fizycznie nieosiągalne (dokładnie ten błąd po powiększeniu bohatera).
   */
  isPlayerAt(px, py, bounds, playerRadius = 16) {
    const c = this.center(bounds);
    const halfSpan = 45;
    const threshold = playerRadius + 12;
    if (this._direction === 'north') return py <= bounds.minY + threshold && Math.abs(px - c.x) < halfSpan;
    if (this._direction === 'south') return py >= bounds.maxY - threshold && Math.abs(px - c.x) < halfSpan;
    if (this._direction === 'west') return px <= bounds.minX + threshold && Math.abs(py - c.y) < halfSpan;
    if (this._direction === 'east') return px >= bounds.maxX - threshold && Math.abs(py - c.y) < halfSpan;
    return false;
  }
}

export default Door;
