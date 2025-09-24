

// gameLoop.js -- Orchestrates update & render each animation frame

import { updatePlayer } from './player.js'; // Import the function to update the player
import { checkPickupCollisions, createInitialPickups } from './pickups.js'; // Import the function to check for pickup collisions
import { render } from './render.js'; // Import the function to draw everything on the screen
import { updateBullets } from './bullets.js'; // Import the function to update bullets
import { updateEnemies, spawnEnemy, clearEnemies } from './enemies.js'; // Import enemy functions
import { bullets } from './bullets.js'; // Import the array of bullets
import { updateParticles, updateScreenShake, clearParticles } from './particles.js'; // Import particle system
import { uiManager, UI_STATES } from './ui.js'; // Import UI system
import { playSound, audioManager } from './audio.js'; // Import audio system
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js'; // Import game dimensions

// --- Factory: Build a game controller ---
export function createGame(canvas, ctx, state) { // This function creates the main game controller
  
  // Initialize UI system
  let gameState = 'menu'; // Track overall game state
  let isPaused = false;
  let gameOverSoundPlayed = false; // Gate to avoid looping game-over sound
  
  // Set up UI mouse controls
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (gameState === 'menu' || isPaused || state.gameOver) {
      const uiAction = uiManager.handleMouseClick(x, y);
      console.log('Mouse click UI action:', uiAction);
      if (uiAction) {
        handleUIAction(uiAction);
      }
    }
  });
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
    // Clear particles
    clearParticles(); // Remove all particles
    // Health and hit tracking
    state.inLevelOne = true; // Mark that we are in level one
    state.playerHits = 0; // Reset how many times the player has been hit
    state.maxHits = 3; // Set the maximum hits before game over
    state.spawnTimer = 0; // Reset the enemy spawn timer
    state.score = 0; // Reset the score
    state.gameOver = false; // The game is not over
    state.starSpinCooldown = 0; // Reset the star spin cooldown
    
    // Play level start sound and music
    playSound.levelStart();
    audioManager.startAmbientMusic();

    // Reset game over sound gate when starting level
    gameOverSoundPlayed = false;
  }

  // --- Handle UI input ---
  function handleInput() {
    // Handle different keys based on game state
    if (gameState === 'menu' || isPaused || state.gameOver) {
      // Menu navigation
      if (state.keys['Enter'] && !state.previousKeys['Enter']) {
        const uiAction = uiManager.handleKeyPress('Enter');
        handleUIAction(uiAction);
      }
      
      if (state.keys['Escape'] && !state.previousKeys['Escape']) {
        const uiAction = uiManager.handleKeyPress('Escape');
        handleUIAction(uiAction);
      }
      
      if (state.keys['ArrowUp'] && !state.previousKeys['ArrowUp']) {
        uiManager.handleKeyPress('ArrowUp');
      }
      
      if (state.keys['ArrowDown'] && !state.previousKeys['ArrowDown']) {
        uiManager.handleKeyPress('ArrowDown');
      }
      
      if ((state.keys['w'] || state.keys['W']) && !(state.previousKeys['w'] || state.previousKeys['W'])) {
        uiManager.handleKeyPress('ArrowUp');
      }
      
      if ((state.keys['s'] || state.keys['S']) && !(state.previousKeys['s'] || state.previousKeys['S'])) {
        uiManager.handleKeyPress('ArrowDown');
      }
    } else if (gameState === 'playing') {
      // Game controls
      if ((state.keys['Escape'] || state.keys['p'] || state.keys['P']) && 
          !(state.previousKeys['Escape'] || state.previousKeys['p'] || state.previousKeys['P'])) {
        const uiAction = uiManager.handleKeyPress('Escape');
        handleUIAction(uiAction);
      }
    }
    
    // Store previous key states
    state.previousKeys = { ...state.keys };
  }
  
  function handleUIAction(uiAction) {
    console.log('UI Action:', uiAction);
    if (uiAction === 'startGame' || uiAction === 'restart') {
      // Reset game state - always go back to starting room
      state.inLevelOne = false;
      state.gameOver = false;
      state.player.currentShape = 'square';
      state.player.x = GAME_WIDTH / 2 - state.player.size / 2;
      state.player.y = GAME_HEIGHT / 2 - state.player.size / 2;
      state.player.mouseX = GAME_WIDTH / 2;
      state.player.mouseY = GAME_HEIGHT / 2;
      state.score = 0;
      state.playerHits = 0;
      state.invuln = 0;
      
      // Clear everything
      clearEnemies();
      clearParticles();
      audioManager.stopAmbientMusic();
  gameOverSoundPlayed = false; // Reset gate on restart
      
      // Restore pickups for starting room (for both start game and restart)
      state.pickups = createInitialPickups();
      
      gameState = 'playing';
      console.log('Game started, state:', gameState);
    } else if (uiAction === 'pause') {
      isPaused = true;
    } else if (uiAction === 'resume') {
      isPaused = false;
    } else if (uiAction === 'mainMenu') {
      gameState = 'menu';
      clearEnemies();
      clearParticles();
      audioManager.stopAmbientMusic();
      gameOverSoundPlayed = false; // Reset when going to menu
    }
  }

  // --- Update phase logic ---
  function update() { // This function updates the game state every frame
    // Always update particles and screen shake
    updateParticles();
    updateScreenShake();
    
    // Handle UI input
    handleInput();
    
    // Update UI state based on game state
    if (gameState === 'menu') {
      uiManager.setState(UI_STATES.MAIN_MENU);
      return;
    } else if (isPaused) {
      uiManager.setState(UI_STATES.GAME_PAUSED);
      return;
    } else if (state.gameOver) {
      uiManager.setState(UI_STATES.GAME_OVER);
      audioManager.stopAmbientMusic();
      // Play game-over sound once when entering game over
      if (!gameOverSoundPlayed) {
        playSound.gameOver();
        gameOverSoundPlayed = true;
      }
      return;
    } else {
      uiManager.setState(UI_STATES.GAME_PLAYING);
    }
    
    if (state.gameOver || isPaused || gameState === 'menu') return; // If the game is paused/over/menu, do nothing
    
    // Only update player if actually playing the game
    if (gameState === 'playing') {
      updatePlayer(state.player, state.keys, state); // Update the player (movement, actions)
    }
    state.player.keys = state.keys; // Make sure the player has the latest key states
    if (!state.inLevelOne) { // If we are not in level one
      checkPickupCollisions(state.player, state.pickups); // Check if player touches a pickup
      // Only allow entering the portal if not in square form
      if (checkPortalCollision(state.player, state.pickups)) { // If player touches portal
        if (state.player.currentShape !== 'square') { // If player is not a square
          playSound.portalEnter(); // Play portal sound
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
    try {
      update(); // Update the game state
      
      // Render based on current state
      if (gameState === 'menu' || isPaused || state.gameOver) {
        // Still render the game background if paused
        if (isPaused) {
          render(ctx, canvas, state); // Draw game
        }
        uiManager.render(ctx, canvas, state); // Draw UI overlay
      } else {
        render(ctx, canvas, state); // Draw everything
        uiManager.render(ctx, canvas, state); // Draw game UI
      }
    } catch (error) {
      console.error('Error in frame:', error);
    }
    
    requestAnimationFrame(frame); // Call this function again next frame
  }

  // --- Public API of game controller ---
  return {
    start: () => requestAnimationFrame(frame) // Start the game loop
  };
}
