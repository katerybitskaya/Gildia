import { clamp, frameFactor } from '../utils/MathUtils.js';
import Projectile from '../entities/Projectile.js';

/** Zachowanie bossa: goni jak melee, ale co jakiś czas robi falę pocisków (sekcja 4. info.md). */
class BossState {
  enter() {}
  exit() {}

  update(enemy, dtMs, context) {
    const { player, bounds, now, addEnemyProjectile } = context;
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.hypot(dx, dy) || 1;
    const factor = frameFactor(dtMs);

    enemy.x = clamp(enemy.x + (dx / dist) * enemy.speed * factor, bounds.minX + enemy.radius, bounds.maxX - enemy.radius);
    enemy.y = clamp(enemy.y + (dy / dist) * enemy.speed * factor, bounds.minY + enemy.radius, bounds.maxY - enemy.radius);

    if (dist < enemy.radius + player.radius + 6 && enemy.canContactDamage(now)) {
      player.takeDamage(enemy.damage);
      enemy.markContact(now);
    }

    if (enemy.canAct(now, enemy.def.specialAttackCooldownMs || 6000)) {
      enemy.markActed(now);
      const count = enemy.def.specialAttackProjectiles || 12;
      for (let i = 0; i < count; i += 1) {
        const angle = (i / count) * Math.PI * 2;
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
}

export default BossState;
