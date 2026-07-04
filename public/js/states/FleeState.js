import { clamp, frameFactor } from '../utils/MathUtils.js';

/** Zachowanie "Flee - ucieka i zostawia pułapki" (sekcja 4. info.md). */
class FleeState {
  enter() {}
  exit() {}

  update(enemy, dtMs, context) {
    const { player, bounds, now, addTrap } = context;
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const dist = Math.hypot(dx, dy) || 1;
    const factor = frameFactor(dtMs);

    enemy.x = clamp(enemy.x + (dx / dist) * enemy.speed * factor, bounds.minX + enemy.radius, bounds.maxX - enemy.radius);
    enemy.y = clamp(enemy.y + (dy / dist) * enemy.speed * factor, bounds.minY + enemy.radius, bounds.maxY - enemy.radius);

    if (enemy.canAct(now, 2500)) {
      enemy.markActed(now);
      addTrap({
        x: enemy.x,
        y: enemy.y,
        damage: enemy.def.trapDamage || 5,
        radius: 18,
        expiresAt: now + (enemy.def.trapDurationMs || 4000),
        spritePath: enemy.def.trapSpritePath || null // TODO: patrz trapSpritePath w data/enemies.json
      });
    }
  }
}

export default FleeState;
