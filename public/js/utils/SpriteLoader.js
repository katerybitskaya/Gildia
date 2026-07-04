/**
 * Ładuje grafiki na podstawie ścieżek z JSON (data/sprites.json).
 * Jeśli spritePath jest null/niepoprawny, zwraca null i wywołujący
 * kod rysuje placeholder (kolorowy kształt) zamiast obrazka.
 * TODO: gdy dojdą prawdziwe grafiki, wystarczy podmienić ścieżki w data/sprites.json.
 */
class SpriteLoader {
  constructor() {
    this._cache = new Map();
  }

  /** Zwraca gotowy HTMLImageElement albo null, jeśli path jest pusty lub obrazek się nie załadował. */
  get(path) {
    if (!path) return null;
    if (this._cache.has(path)) {
      const entry = this._cache.get(path);
      return entry.loaded ? entry.img : null;
    }

    const img = new Image();
    const entry = { img, loaded: false };
    img.onload = () => { entry.loaded = true; };
    img.onerror = () => { entry.loaded = false; };
    img.src = path;
    this._cache.set(path, entry);
    return null;
  }
}

export default new SpriteLoader();
