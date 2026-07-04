/** Interfejs gracza: pasek HP (lewy górny róg), pety z boku ekranu, ekwipunek, pasek HP bossa. */
class HUD {
  constructor(ctx, canvas) {
    this._ctx = ctx;
    this._canvas = canvas;
  }

  draw(player, currentRoom, message) {
    this._drawHpBar(player);
    this._drawInventory(player);
    this._drawPetsSidebar(player);

    const boss = currentRoom.enemies.find((e) => e.isBoss && !e.isMarkedForRemoval);
    if (boss) this._drawBossBar(boss);

    if (message) this._drawMessage(message);
  }

  _drawHpBar(player) {
    const ctx = this._ctx;
    const x = 20;
    const y = 20;
    const w = 220;
    const h = 22;

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x, y, w, h);

    const pct = Math.max(0, player.hp) / player.maxHp;
    ctx.fillStyle = pct > 0.5 ? '#2ecc71' : pct > 0.25 ? '#f1c40f' : '#e74c3c';
    ctx.fillRect(x, y, w * pct, h);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = '#fff';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.ceil(player.hp)} / ${player.maxHp}`, x + w / 2, y + h / 2 + 5);
  }

  _drawInventory(player) {
    const ctx = this._ctx;
    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Klucze: ${player.inventory.keys}`, 20, 70);
  }

  // Pety wyświetlane jako miniatury z boku ekranu, pomniejszone (sekcja 1. info.md: "o np 80%")
  _drawPetsSidebar(player) {
    const ctx = this._ctx;
    const baseX = this._canvas.width - 46;
    let y = 40;

    for (const pet of player.pets) {
      ctx.beginPath();
      ctx.arc(baseX, y, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#8e44ad';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pet.name.slice(0, 2).toUpperCase(), baseX, y + 3);
      ctx.fillText(`Lv${pet.level} (${pet.charges})`, baseX, y + 34);

      y += 62;
    }
  }

  _drawBossBar(boss) {
    const ctx = this._ctx;
    const w = 400;
    const h = 26;
    const x = (this._canvas.width - w) / 2;
    const y = this._canvas.height - 50;

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x, y, w, h);

    const pct = Math.max(0, boss.hp) / boss.maxHp;
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(x, y, w * pct, h);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = '#fff';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(boss.name, x + w / 2, y + h / 2 + 5);
  }

  _drawMessage(message) {
    const ctx = this._ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(this._canvas.width / 2 - 160, 90, 320, 34);
    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(message, this._canvas.width / 2, 112);
  }
}

export default HUD;
