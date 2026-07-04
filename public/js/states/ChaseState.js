import { clamp, frameFactor } from '../utils/MathUtils.js';

/** Zachowanie "Melee - goni gracza" (sekcja 4. info.md). */
class ChaseState {
  enter() {}
  exit() {}

  update(enemy, dtMs, context) {
    const { player, bounds, now } = context;
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.hypot(dx, dy) || 1;
    const factor = frameFactor(dtMs);

    enemy.x = clamp(enemy.x + (dx / dist) * enemy.speed * factor, bounds.minX + enemy.radius, bounds.maxX - enemy.radius);
    enemy.y = clamp(enemy.y + (dy / dist) * enemy.speed * factor, bounds.minY + enemy.radius, bounds.maxY - enemy.radius);

    if (dist < enemy.radius + player.radius + 4 && enemy.canContactDamage(now)) {
      player.takeDamage(enemy.damage);
      enemy.markContact(now);
    }
  }
}

export default ChaseState;
