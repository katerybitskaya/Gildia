/** Skrzynka - po otwarciu daje losowy przedmiot pasywny, zużywalny lub peta. */
class Chest {
  constructor(x, y) {
    this._x = x;
    this._y = y;
    this._radius = 22;
    this._opened = false;
  }

  get x() { return this._x; }
  get y() { return this._y; }
  get radius() { return this._radius; }
  get opened() { return this._opened; }

  open() { this._opened = true; }
}

export default Chest;
