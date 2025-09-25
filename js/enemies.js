
// enemies.js -- Handles enemy state and logic
// This file manages all enemy creation, movement, collision, and removal in the game.

import { createExplosion, createSparks, createColoredSparks, createEnergyLine, addScreenShake, COLORS } from './particles.js'; // Import particle effects and color palette
import { playSound } from './audio.js'; // Import sound effects

export const enemies = []; // This array stores all the enemies currently in the game

// Spawns a new enemy at (x, y) that moves toward the player
export function spawnEnemy(x, y, speed = 2) { // This function creates a new enemy
  enemies.push({ x, y, size: 30, speed }); // Add an enemy object to the array
}

// Updates all enemies to move toward the player, avoid overlap, and handle collisions
// onPlayerHit: called when player is hit
// onEnemyDestroyed: called when enemy is destroyed (for scoring)
export function updateEnemies(player, bullets, onPlayerHit, onEnemyDestroyed) { // This function updates all enemies every frame
  // Move enemies toward player
  for (const enemy of enemies) { // For each enemy
    const dx = player.x + player.size / 2 - (enemy.x + enemy.size / 2); // Distance x to player
    const dy = player.y + player.size / 2 - (enemy.y + enemy.size / 2); // Distance y to player
    const dist = Math.hypot(dx, dy); // Distance to player
    if (dist > 0) {
      enemy.x += (dx / dist) * enemy.speed; // Move toward player x
      enemy.y += (dy / dist) * enemy.speed; // Move toward player y
    }
  }
  // Simple enemy separation (repel if overlapping)
  for (let i = 0; i < enemies.length; i++) { // For each enemy
    for (let j = i + 1; j < enemies.length; j++) { // Compare to every other enemy
      const a = enemies[i];
      const b = enemies[j];
      const dx = (a.x + a.size / 2) - (b.x + b.size / 2); // Distance x between enemies
      const dy = (a.y + a.size / 2) - (b.y + b.size / 2); // Distance y between enemies
      const dist = Math.hypot(dx, dy); // Distance between enemies
      const minDist = (a.size + b.size) / 2; // Minimum allowed distance
      if (dist < minDist && dist > 0) { // If too close
        const overlap = (minDist - dist) / 2; // How much they overlap
        const ox = (dx / dist) * overlap; // Offset x
        const oy = (dy / dist) * overlap; // Offset y
        a.x += ox; // Move one enemy
        a.y += oy;
        b.x -= ox; // Move the other enemy
        b.y -= oy;
      }
    }
  }
  // Bullet-enemy collision
  for (let i = enemies.length - 1; i >= 0; i--) { // Go through all enemies backwards
    const enemy = enemies[i]; // Get the enemy
    for (let j = bullets.length - 1; j >= 0; j--) { // Go through all bullets backwards
      const b = bullets[j]; // Get the bullet
      if (rectCircleColliding(enemy, b)) { // If bullet hits enemy
        // Visual and audio effects
        // Explosion matches the bullet color (pea shooter green by default)
        createExplosion(
          enemy.x + enemy.size / 2,
          enemy.y + enemy.size / 2,
          b.color || COLORS.playerBullet,
          6
        );
        // Sparks tinted to enemy damage color for contrast
        createColoredSparks(
          enemy.x + enemy.size / 2,
          enemy.y + enemy.size / 2,
          COLORS.enemyDamage,
          4
        );
        addScreenShake(3, 5); // Add a small screen shake
        playSound.enemyDestroy(); // Play enemy destroy sound
        enemies.splice(i, 1); // Remove enemy
        bullets.splice(j, 1); // Remove bullet
        if (onEnemyDestroyed) onEnemyDestroyed(2); // 2 points for bullet
        break; // Stop checking this enemy
      }
    }
  }
  // Star spin attack: destroy enemies within AOE range while spinning
  if (player.currentShape === 'star' && player.spinning && player.spinTime > 0) { // If player is spinning star
    const spinRadius = player.size * 1.8; // Extended AOE radius (about 3.6x larger area)
    const playerCenterX = player.x + player.size / 2; // Player center X
    const playerCenterY = player.y + player.size / 2; // Player center Y
    
    for (let i = enemies.length - 1; i >= 0; i--) { // Go through all enemies backwards
      const enemy = enemies[i];
      const enemyCenterX = enemy.x + enemy.size / 2; // Enemy center X
      const enemyCenterY = enemy.y + enemy.size / 2; // Enemy center Y
      
      // Calculate distance from player center to enemy center
      const dx = enemyCenterX - playerCenterX;
      const dy = enemyCenterY - playerCenterY;
      const distance = Math.hypot(dx, dy);
      
      // Check if enemy is within the spin AOE radius
      if (distance <= spinRadius) {
        // Visual and audio effects - enhanced for AOE
        createExplosion(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, COLORS.starKill, 12); // Bigger explosion
        createColoredSparks(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, COLORS.starKill, 8); // Extra sparks
        
        // Create connecting energy line effect from player to enemy
        createEnergyLine(playerCenterX, playerCenterY, enemyCenterX, enemyCenterY, COLORS.starKill);
        
        addScreenShake(5, 8); // Stronger screen shake for AOE
        playSound.enemyDestroy(); // Play enemy destroy sound
        enemies.splice(i, 1); // Remove enemy
        if (onEnemyDestroyed) onEnemyDestroyed(2); // 2 points for AOE spin
      }
    }
  }
  // Circle dash attack: destroy enemies on contact while dashing
  if (player.currentShape === 'circle' && player.dashTime > 0) { // If player is dashing circle
    for (let i = enemies.length - 1; i >= 0; i--) { // Go through all enemies backwards
      const enemy = enemies[i];
      if (rectRectColliding(player, enemy)) { // If player touches enemy
        // Visual and audio effects
        createExplosion(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, COLORS.dashKill, 7); // Dash kill explosion
        createColoredSparks(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, COLORS.dashKill, 5); // Dash kill sparks
        addScreenShake(4, 6); // Add a bigger screen shake
        playSound.enemyDestroy(); // Play enemy destroy sound
        enemies.splice(i, 1); // Remove enemy
        if (onEnemyDestroyed) onEnemyDestroyed(2); // 2 points for dash
      }
    }
  }
  // Player-enemy collision (only if not spinning/dashing)
  let vulnerable = true; // Assume player is vulnerable
  if ((player.currentShape === 'star' && player.spinning && player.spinTime > 0) ||
      (player.currentShape === 'circle' && player.dashTime > 0)) {
    vulnerable = false; // Not vulnerable if spinning or dashing
  }
  if (vulnerable) { // If player can be hit
    for (const enemy of enemies) { // For each enemy
      if (rectRectColliding(player, enemy)) { // If player touches enemy
        // Visual and audio effects for player hit
        createColoredSparks(player.x + player.size / 2, player.y + player.size / 2, COLORS.playerHit, 8); // Player hit sparks
        addScreenShake(8, 12); // Big screen shake
        playSound.playerHit(); // Play player hit sound
        if (onPlayerHit) onPlayerHit(); // Call the hit callback
      }
    }
  }
}

// Resets all enemies
export function clearEnemies() { // This function removes all enemies from the game
  enemies.length = 0; // Clear the array
}

// Helper: Rectangle-rectangle collision
function rectRectColliding(a, b) { // Checks if two rectangles overlap
  return (
    a.x < b.x + b.size && // a's left is left of b's right
    a.x + a.size > b.x && // a's right is right of b's left
    a.y < b.y + b.size && // a's top is above b's bottom
    a.y + a.size > b.y // a's bottom is below b's top
  );
}

// Helper: Rectangle-circle collision
function rectCircleColliding(rect, circle) { // Checks if a rectangle and circle overlap
  // Find closest point to circle within rectangle
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.size)); // Closest x on rect
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.size)); // Closest y on rect
  const dx = circle.x - closestX; // Distance x from circle to rect
  const dy = circle.y - closestY; // Distance y from circle to rect
  return (dx * dx + dy * dy) < (circle.radius * circle.radius); // True if inside circle
}
