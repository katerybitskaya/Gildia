import Item from './Item.js';

/**
 * Przedmiot pasywny - na stałe zmienia statystyki gracza lub modyfikuje atak.
 * Zasada synergii (sekcja 5. info.md): efekt to zawsze { stat, modifier, value },
 * więc Player.applyPassiveItem po prostu dokłada kolejny modyfikator do statystyk -
 * dowolna liczba przedmiotów pasywnych naturalnie się ze sobą łączy.
 */
class PassiveItem extends Item {
  constructor(def) {
    super(def);
  }
}

export default PassiveItem;
