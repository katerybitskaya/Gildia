import Item from './Item.js';

/** Przedmiot zużywalny: klucz do bossa lub leczenie (sekcja 5. info.md). */
class Consumable extends Item {
  constructor(def) {
    super(def);
  }

  /** Zużywa przedmiot natychmiast na graczu. */
  applyTo(player) {
    switch (this.effect.action) {
      case 'heal':
        player.heal(this.effect.value);
        break;
      case 'unlockBossDoor':
        player.addKey();
        break;
      default:
        break;
    }
  }
}

export default Consumable;
