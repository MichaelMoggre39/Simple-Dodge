// enemies.js -- Handles enemy state and logic

export const enemies = [];

// Spawns a new enemy at (x, y) that moves toward the player
export function spawnEnemy(x, y, speed = 2) {
  enemies.push({ x, y, size: 30, speed });
}

// Updates all enemies to move toward the player, avoid overlap, and handle collisions
// onPlayerHit: called when player is hit
// onEnemyDestroyed: called when enemy is destroyed (for scoring)
export function updateEnemies(player, bullets, onPlayerHit, onEnemyDestroyed) {
  // Move enemies toward player
  for (const enemy of enemies) {
    const dx = player.x + player.size / 2 - (enemy.x + enemy.size / 2);
    const dy = player.y + player.size / 2 - (enemy.y + enemy.size / 2);
    const dist = Math.hypot(dx, dy);
    if (dist > 0) {
      enemy.x += (dx / dist) * enemy.speed;
      enemy.y += (dy / dist) * enemy.speed;
    }
  }
  // Simple enemy separation (repel if overlapping)
  for (let i = 0; i < enemies.length; i++) {
    for (let j = i + 1; j < enemies.length; j++) {
      const a = enemies[i];
      const b = enemies[j];
      const dx = (a.x + a.size / 2) - (b.x + b.size / 2);
      const dy = (a.y + a.size / 2) - (b.y + b.size / 2);
      const dist = Math.hypot(dx, dy);
      const minDist = (a.size + b.size) / 2;
      if (dist < minDist && dist > 0) {
        const overlap = (minDist - dist) / 2;
        const ox = (dx / dist) * overlap;
        const oy = (dy / dist) * overlap;
        a.x += ox;
        a.y += oy;
        b.x -= ox;
        b.y -= oy;
      }
    }
  }
  // Bullet-enemy collision
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    for (let j = bullets.length - 1; j >= 0; j--) {
      const b = bullets[j];
      if (rectCircleColliding(enemy, b)) {
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        if (onEnemyDestroyed) onEnemyDestroyed(2); // 2 points for bullet
        break;
      }
    }
  }
  // Star spin attack: destroy enemies on contact while spinning
  if (player.currentShape === 'star' && player.spinning && player.spinTime > 0) {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      if (rectRectColliding(player, enemy)) {
        enemies.splice(i, 1);
        if (onEnemyDestroyed) onEnemyDestroyed(2); // 2 points for spin
      }
    }
  }
  // Circle dash attack: destroy enemies on contact while dashing
  if (player.currentShape === 'circle' && player.dashTime > 0) {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      if (rectRectColliding(player, enemy)) {
        enemies.splice(i, 1);
        if (onEnemyDestroyed) onEnemyDestroyed(2); // 2 points for dash
      }
    }
  }
  // Player-enemy collision (only if not spinning/dashing)
  let vulnerable = true;
  if ((player.currentShape === 'star' && player.spinning && player.spinTime > 0) ||
      (player.currentShape === 'circle' && player.dashTime > 0)) {
    vulnerable = false;
  }
  if (vulnerable) {
    for (const enemy of enemies) {
      if (rectRectColliding(player, enemy)) {
        if (onPlayerHit) onPlayerHit();
      }
    }
  }
}

// Resets all enemies
export function clearEnemies() {
  enemies.length = 0;
}

// Helper: Rectangle-rectangle collision
function rectRectColliding(a, b) {
  return (
    a.x < b.x + b.size &&
    a.x + a.size > b.x &&
    a.y < b.y + b.size &&
    a.y + a.size > b.y
  );
}

// Helper: Rectangle-circle collision
function rectCircleColliding(rect, circle) {
  // Find closest point to circle within rectangle
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.size));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.size));
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return (dx * dx + dy * dy) < (circle.radius * circle.radius);
}
