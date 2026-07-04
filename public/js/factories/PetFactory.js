import Pet from '../entities/Pet.js';

/** Fabryka abstrakcji dla petów (sekcja 6. info.md). */
class PetFactory {
  static create(defId, defs, level = 1) {
    const def = defs.find((d) => d.id === defId);
    if (!def) throw new Error(`Nieznany pet: ${defId}`);
    return new Pet(def, level);
  }

  static randomDefId(defs) {
    return defs[Math.floor(Math.random() * defs.length)].id;
  }
}

export default PetFactory;
