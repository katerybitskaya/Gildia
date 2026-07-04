/**
 * Bazowa klasa przedmiotu (sekcja 5. info.md). Przedmioty są obiektami,
 * żeby dało się je swobodnie łączyć w synergie (patrz PassiveItem.applyTo).
 */
class Item {
  constructor(def) {
    this._id = def.id;
    this._name = def.name;
    this._type = def.type; // 'passive' | 'consumable'
    this._description = def.description || '';
    this._effect = def.effect;
    this._spritePath = def.spritePath; // TODO: patrz _spriteNote w data/items.json
  }

  get id() { return this._id; }
  get name() { return this._name; }
  get type() { return this._type; }
  get description() { return this._description; }
  get effect() { return this._effect; }
  get spritePath() { return this._spritePath; }
}

export default Item;
