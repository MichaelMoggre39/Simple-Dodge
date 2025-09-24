

// gameLoop.js -- Orchestrates update & render each animation frame

import { updatePlayer } from './player.js'; // Import the function to update the player
import { checkPickupCollisions } from './pickups.js'; // Import the function to check for pickup collisions
import { render } from './render.js'; // Import the function to draw everything on the screen
import { updateBullets } from './bullets.js'; // Import the function to update bullets
import { updateEnemies, spawnEnemy, clearEnemies } from './enemies.js'; // Import enemy functions
import { bullets } from './bullets.js'; // Import the array of bullets

// --- Factory: Build a game controller ---
export function createGame(canvas, ctx, state) { // This function creates the main game controller
  // --- Helper: Check collision with portal ---
  function checkPortalCollision(player, pickups) { // Checks if the player is touching the portal
    for (const p of pickups) { // Go through every pickup
      if (p.type === 'portal') { // If this pickup is a portal
        // Simple AABB collision (checks if rectangles overlap)
        if (
          player.x < p.x + p.size && // Player's left is left of portal's right
          player.x + player.size > p.x && // Player's right is right of portal's left
          player.y < p.y + p.size && // Player's top is above portal's bottom
          player.y + player.size > p.y // Player's bottom is below portal's top
        ) {
          return true; // There is a collision
        }
      }
    }
    return false; // No collision found
  }

  // --- Start Level 1: new room, clear pickups, spawn enemies ---
  function startLevelOne() { // This function starts the first level
    // Move player to new room (e.g., left side)
    state.player.x = 100; // Set player's x position
    state.player.y = 360; // Set player's y position
    // Remove all pickups
    state.pickups = []; // Clear all pickups from the game
    // Clear enemies
    clearEnemies(); // Remove all enemies
    // Health and hit tracking
    state.inLevelOne = true; // Mark that we are in level one
    state.playerHits = 0; // Reset how many times the player has been hit
    state.maxHits = 3; // Set the maximum hits before game over
    state.spawnTimer = 0; // Reset the enemy spawn timer
    state.score = 0; // Reset the score
    state.gameOver = false; // The game is not over
    state.starSpinCooldown = 0; // Reset the star spin cooldown
  }

  // --- Update phase logic ---
  function update() { // This function updates the game state every frame
    if (state.gameOver) return; // If the game is over, do nothing
    updatePlayer(state.player, state.keys, state); // Update the player (movement, actions)
    state.player.keys = state.keys; // Make sure the player has the latest key states
    if (!state.inLevelOne) { // If we are not in level one
      checkPickupCollisions(state.player, state.pickups); // Check if player touches a pickup
      // Only allow entering the portal if not in square form
      if (checkPortalCollision(state.player, state.pickups)) { // If player touches portal
        if (state.player.currentShape !== 'square') { // If player is not a square
          startLevelOne(); // Start level one
        } else {
          // Set a flag to show a notification in render
          state.showPowerupNotification = 60; // Show a message for 1 second (60 frames)
        }
      }
    }
    updateBullets(); // Move all bullets
    // Always decrement star spin cooldown, regardless of room
    if (state.starSpinCooldown > 0) state.starSpinCooldown--; // Reduce star spin cooldown if above 0
    if (state.inLevelOne) { // If we are in level one
      // Spawn enemies from offscreen at intervals
      state.spawnTimer = (state.spawnTimer || 0) + 1; // Increase the spawn timer
      if (state.spawnTimer > 60) { // every 60 frames (~1 sec)
        // Randomly pick a side (top, bottom, left, right)
        const side = Math.floor(Math.random() * 4); // Pick a random side
        let x, y; // Variables for enemy position
        if (side === 0) { // left
          x = -40; y = Math.random() * 720; // Spawn off the left edge
        } else if (side === 1) { // right
          x = 1280 + 40; y = Math.random() * 720; // Spawn off the right edge
        } else if (side === 2) { // top
          x = Math.random() * 1280; y = -40; // Spawn above the top edge
        } else { // bottom
          x = Math.random() * 1280; y = 720 + 40; // Spawn below the bottom edge
        }
        spawnEnemy(x, y); // Create a new enemy
        state.spawnTimer = 0; // Reset the spawn timer
      }
      updateEnemies(state.player, bullets, (destroyed, wasSpin, wasDash) => {
        // Player hit by enemy: lose a life
        if (!state.invuln) { // If not invulnerable
          state.playerHits = (state.playerHits || 0) + 1; // Add a hit
          state.invuln = 60; // 1 second invulnerability
          if (state.playerHits >= (state.maxHits || 3)) { // If too many hits
            state.gameOver = true; // Game over
          }
        }
      }, (scoreInc = 1) => {
        // Score callback: increase score
        state.score = (state.score || 0) + scoreInc; // Add to score
      });
      if (state.invuln) state.invuln--; // Reduce invulnerability timer
    }
  }

  // --- Single animation frame callback ---
  function frame() { // This function is called every animation frame
    update(); // Update the game state
    render(ctx, canvas, state); // Draw everything
    requestAnimationFrame(frame); // Call this function again next frame
  }

  // --- Public API of game controller ---
  return {
    start: () => requestAnimationFrame(frame) // Start the game loop
  };
}
