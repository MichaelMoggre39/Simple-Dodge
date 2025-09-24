// ui.js -- User interface system with menus and game states

import { audioManager } from './audio.js'; // Import the audio manager for sound and settings

export const UI_STATES = { // Enum for UI states
  MAIN_MENU: 'mainMenu', // Main menu state
  GAME_PLAYING: 'playing', // Game playing state
  GAME_PAUSED: 'paused', // Game paused state
  GAME_OVER: 'gameOver', // Game over state
  SETTINGS: 'settings', // Settings menu state
  TUTORIAL: 'tutorial' // Tutorial state
};

export class UIManager { // UI manager class for handling all UI logic
  constructor() { // Constructor for UIManager
    console.log('UIManager initializing...'); // Log initialization
    this.currentState = UI_STATES.MAIN_MENU; // Set initial state
    this.selectedMenuItem = 0; // Index of selected menu item
    this.menuItems = []; // Array of menu item labels
    this.menuItemPositions = []; // Array of menu item positions for mouse
    this.showControls = false; // Whether to show controls overlay
    this.settings = { // UI settings
      volume: 0.7, // Default volume
      soundEnabled: true, // Sound enabled by default
      showFPS: false // FPS display off by default
    };
    // Load saved settings
    this.loadSettings();
    // FPS tracking
    this.fps = 60; // Initial FPS
    this.frameCount = 0; // Frame count for FPS
    this.lastFPSUpdate = Date.now(); // Last FPS update timestamp
    // Initialize menu items
    this.updateMenuItems();
    console.log('UIManager initialized with state:', this.currentState); // Log state
  }
  
  setState(newState) {
    this.currentState = newState;
    this.selectedMenuItem = 0;
    this.updateMenuItems();
  }
  
  updateMenuItems() {
    switch (this.currentState) {
      case UI_STATES.MAIN_MENU:
        this.menuItems = ['Start Game', 'Toggle Fullscreen'];
        break;
      case UI_STATES.GAME_PAUSED:
        this.menuItems = ['Resume', 'Restart', 'Main Menu'];
        break;
      case UI_STATES.GAME_OVER:
        this.menuItems = ['Restart', 'Main Menu'];
        break;
      default:
        this.menuItems = [];
    }
  }
  
  handleMouseClick(x, y) {
    if (this.currentState === UI_STATES.GAME_PLAYING) {
      return null;
    }
    
    // Check if click is on any menu item
    if (this.menuItemPositions) {
      for (const pos of this.menuItemPositions) {
        if (y >= pos.y && y <= pos.y + pos.height) {
          this.selectedMenuItem = pos.index;
          return this.activateMenuItem();
        }
      }
    }
    
    return null;
  }

  handleKeyPress(key) {
    if (this.currentState === UI_STATES.GAME_PLAYING) {
      if (key === 'Escape' || key === 'p' || key === 'P') {
        this.setState(UI_STATES.GAME_PAUSED);
        return 'pause';
      }
      return null;
    }
    
    if (key === 'ArrowUp' || key === 'w' || key === 'W') {
      this.selectedMenuItem = Math.max(0, this.selectedMenuItem - 1);
      return 'navigate';
    } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
      this.selectedMenuItem = Math.min(this.menuItems.length - 1, this.selectedMenuItem + 1);
      return 'navigate';
    } else if (key === 'Enter' || key === ' ') {
      return this.activateMenuItem();
    } else if (key === 'Escape') {
      if (this.currentState === UI_STATES.GAME_PAUSED) {
        this.setState(UI_STATES.GAME_PLAYING);
        return 'resume';
      } else if (this.currentState !== UI_STATES.MAIN_MENU) {
        this.setState(UI_STATES.MAIN_MENU);
        return 'menu';
      }
    }
    
    return null;
  }
  
  activateMenuItem() {
    const selectedItem = this.menuItems[this.selectedMenuItem];
    
    switch (this.currentState) {
      case UI_STATES.MAIN_MENU:
        switch (selectedItem) {
          case 'Start Game':
            this.setState(UI_STATES.GAME_PLAYING);
            return 'startGame';
          case 'Toggle Fullscreen':
            this.toggleFullscreen();
            return 'fullscreen';
        }
        break;
        
      case UI_STATES.GAME_PAUSED:
        switch (selectedItem) {
          case 'Resume':
            this.setState(UI_STATES.GAME_PLAYING);
            return 'resume';
          case 'Restart':
            this.setState(UI_STATES.GAME_PLAYING);
            return 'restart';
          case 'Main Menu':
            this.setState(UI_STATES.MAIN_MENU);
            return 'mainMenu';
        }
        break;
        
      case UI_STATES.GAME_OVER:
        switch (selectedItem) {
          case 'Restart':
            this.setState(UI_STATES.GAME_PLAYING);
            return 'restart';
          case 'Main Menu':
            this.setState(UI_STATES.MAIN_MENU);
            return 'mainMenu';
        }
        break;
    }
    
    return null;
  }
  
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.() ||
      document.documentElement.webkitRequestFullscreen?.() ||
      document.documentElement.msRequestFullscreen?.();
    } else {
      document.exitFullscreen?.() ||
      document.webkitExitFullscreen?.() ||
      document.msExitFullscreen?.();
    }
  }
  
  saveSettings() {
    try {
      localStorage.setItem('simpleDodgeSettings', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Could not save settings');
    }
  }
  
  loadSettings() {
    try {
      const saved = localStorage.getItem('simpleDodgeSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.settings = { ...this.settings, ...parsed };
        audioManager.setVolume(this.settings.volume);
        if (!this.settings.soundEnabled) {
          audioManager.toggleEnabled();
        }
      }
    } catch (e) {
      console.warn('Could not load settings');
    }
  }
  
  updateFPS() {
    this.frameCount++;
    const now = Date.now();
    if (now - this.lastFPSUpdate >= 1000) {
      this.fps = Math.round(this.frameCount * 1000 / (now - this.lastFPSUpdate));
      this.frameCount = 0;
      this.lastFPSUpdate = now;
    }
  }
  
  render(ctx, canvas, gameState = null) {
    this.updateFPS();
    
    switch (this.currentState) {
      case UI_STATES.MAIN_MENU:
        this.renderMainMenu(ctx, canvas);
        break;
      case UI_STATES.GAME_PAUSED:
        this.renderPauseMenu(ctx, canvas);
        break;
      case UI_STATES.GAME_OVER:
        this.renderGameOverMenu(ctx, canvas, gameState);
        break;
      case UI_STATES.GAME_PLAYING:
        this.renderGameUI(ctx, canvas, gameState);
        break;
    }
    
    // Always render FPS if enabled
    if (this.settings.showFPS && this.currentState === UI_STATES.GAME_PLAYING) {
      this.renderFPS(ctx, canvas);
    }
  }
  
  renderMainMenu(ctx, canvas) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title
    ctx.font = 'bold 72px Arial';
    ctx.fillStyle = '#00ff88';
    ctx.textAlign = 'center';
    ctx.fillText('SIMPLE DODGE', canvas.width / 2, canvas.height * 0.25);
    
    // Subtitle
    ctx.font = '24px Arial';
    ctx.fillStyle = '#88ffaa';
    ctx.fillText('Shape-shifting survival game', canvas.width / 2, canvas.height * 0.35);
    
    // Menu items
    this.renderMenuItems(ctx, canvas, canvas.height * 0.5);
    
    ctx.restore();
  }
  
  renderPauseMenu(ctx, canvas) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Pause title
    ctx.font = 'bold 64px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height * 0.3);
    
    // Menu items
    this.renderMenuItems(ctx, canvas, canvas.height * 0.5);
    
    ctx.restore();
  }
  
  renderGameOverMenu(ctx, canvas, gameState) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Game Over title
    ctx.font = 'bold 72px Arial';
    ctx.fillStyle = '#ff4444';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height * 0.25);
    
    // Score
    if (gameState && gameState.score !== undefined) {
      ctx.font = '32px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Final Score: ${gameState.score}`, canvas.width / 2, canvas.height * 0.35);
    }
    
    // Menu items
    this.renderMenuItems(ctx, canvas, canvas.height * 0.5);
    
    ctx.restore();
  }
  

  
  renderGameUI(ctx, canvas, gameState) {
    // This is rendered by the main render function
    // We just add overlay elements here
    if (gameState && gameState.inLevelOne) {
      this.renderGameHUD(ctx, canvas, gameState);
    }
  }
  
  renderGameHUD(ctx, canvas, gameState) {
    // Game HUD is handled by the main render function
    // This is for additional UI elements if needed
  }
  
  renderMenuItems(ctx, canvas, startY) {
    const itemHeight = 60;
    const totalHeight = this.menuItems.length * itemHeight;
    let y = startY - totalHeight / 2;
    
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    
    this.menuItems.forEach((item, index) => {
      ctx.fillStyle = index === this.selectedMenuItem ? '#ffff00' : '#ffffff';
      ctx.fillText(item, canvas.width / 2, y + index * itemHeight);
    });
    
    // Store menu item positions for mouse clicks
    this.menuItemPositions = this.menuItems.map((item, index) => ({
      y: y + index * itemHeight - 20,
      height: 40,
      index: index
    }));
  }
  
  renderFPS(ctx, canvas) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.font = '16px monospace';
    ctx.fillStyle = '#ffff00';
    ctx.textAlign = 'left';
    ctx.fillText(`FPS: ${this.fps}`, 10, 25);
    ctx.restore();
  }
}

export const uiManager = new UIManager();