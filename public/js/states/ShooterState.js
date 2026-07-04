import { clamp, frameFactor } from '../utils/MathUtils.js';
import Projectile from '../entities/Projectile.js';

/** Zachowanie "Shooter - trzyma dystans i strzela prosto" (sekcja 4. info.md). */
class ShooterState {
  enter() {}
  exit() {}

  update(enemy, dtMs, context) {
    const { player, bounds, now, addEnemyProjectile } = context;
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.hypot(dx, dy) || 1;
    const preferred = enemy.def.preferredDistance || 200;
    const factor = frameFactor(dtMs);

    let mx = 0;
    let my = 0;
    if (dist > preferred + 20) { mx = dx / dist; my = dy / dist; }
    else if (dist < preferred - 20) { mx = -dx / dist; my = -dy / dist; }

    enemy.x = clamp(enemy.x + mx * enemy.speed * factor, bounds.minX + enemy.radius, bounds.maxX - enemy.radius);
    enemy.y = clamp(enemy.y + my * enemy.speed * factor, bounds.minY + enemy.radius, bounds.maxY - enemy.radius);

    if (enemy.canAct(now, enemy.def.fireRateMs || 1500)) {
      enemy.markActed(now);
      const angle = Math.atan2(dy, dx);
      addEnemyProjectile(new Projectile({
        x: enemy.x,
        y: enemy.y,
        angle,
        speed: enemy.def.projectileSpeed || 4,
        damage: enemy.damage,
        owner: 'enemy'
      }));
    }
  }
}

export default ShooterState;
