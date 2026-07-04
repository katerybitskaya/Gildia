import ChaseState from './ChaseState.js';
import ShooterState from './ShooterState.js';
import FleeState from './FleeState.js';
import BossState from './BossState.js';
import DeadState from './DeadState.js';

/**
 * Hierarchiczna maszyna stanów (HSM) dla wrogów (sekcja 6. info.md).
 * Nadrzędny stan "żywy" deleguje do konkretnego zachowania (Chase/Shooter/Flee/Boss),
 * ale śmierć (hp <= 0) ma priorytet nad każdym z nich i przerywa dowolne zachowanie -
 * to właśnie czyni tę maszynę hierarchiczną, a nie płaską.
 */
class EnemyStateMachine {
  constructor(enemy) {
    this._enemy = enemy;
    this._current = EnemyStateMachine._pickBehaviorState(enemy.behavior);
    this._deadState = new DeadState();
    this._isDead = false;
  }

  static _pickBehaviorState(behavior) {
    switch (behavior) {
      case 'melee': return new ChaseState();
      case 'shooter': return new ShooterState();
      case 'flee': return new FleeState();
      case 'boss': return new BossState();
      default: return new ChaseState();
    }
  }

  get isDead() { return this._isDead; }

  update(dtMs, context) {
    if (!this._isDead && this._enemy.isDead()) {
      this._current.exit(this._enemy, context);
      this._isDead = true;
      this._current = this._deadState;
      this._current.enter(this._enemy, context);
      return;
    }
    this._current.update(this._enemy, dtMs, context);
  }
}

export default EnemyStateMachine;
