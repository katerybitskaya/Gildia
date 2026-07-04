import PassiveItem from '../items/PassiveItem.js';
import Consumable from '../items/Consumable.js';

/** Fabryka abstrakcji dla przedmiotów (sekcja 6. info.md). */
class ItemFactory {
  static create(defId, defs) {
    const def = defs.find((d) => d.id === defId);
    if (!def) throw new Error(`Nieznany przedmiot: ${defId}`);
    if (def.type === 'passive') return new PassiveItem(def);
    if (def.type === 'consumable') return new Consumable(def);
    throw new Error(`Nieznany typ przedmiotu: ${def.type}`);
  }

  /** Losuje nagrodę ze skrzynki (bez klucza - klucz wypada tylko z minibossa). */
  static randomLoot(defs) {
    const passives = defs.filter((d) => d.type === 'passive');
    const consumables = defs.filter((d) => d.type === 'consumable' && d.id !== 'key');
    const pool = Math.random() < 0.7 ? passives : consumables;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    return ItemFactory.create(chosen.id, defs);
  }
}

export default ItemFactory;
