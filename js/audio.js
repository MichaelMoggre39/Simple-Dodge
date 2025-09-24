// audio.js -- Sound effects and music system
// This file handles all sound effects and music for the game using the Web Audio API.

// Main class for managing all audio in the game
class AudioManager {
  constructor() {
    this.sounds = {}; // Object to store loaded sounds (not used in this version)
    this.enabled = true; // Whether audio is enabled
    this.volume = 0.7; // Master volume for sound effects
    this.musicVolume = 0.4; // Volume for music (not used in this version)
    this.currentMusic = null; // Tracks if music is playing
    // Initialize Web Audio API for better sound control
    this.audioContext = null; // The Web Audio API context
    this.initAudioContext(); // Set up the audio context
  }
  
  // Initializes the Web Audio API context
  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)(); // Create audio context
    } catch (e) {
      console.warn('Web Audio API not supported'); // Warn if not supported
    }
  }
  
  // Create a simple tone using the Web Audio API
  createTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.audioContext || !this.enabled) return; // Do nothing if audio is disabled
    const oscillator = this.audioContext.createOscillator(); // Create oscillator node
    const gainNode = this.audioContext.createGain(); // Create gain node for volume
    oscillator.connect(gainNode); // Connect oscillator to gain
    gainNode.connect(this.audioContext.destination); // Connect gain to speakers
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime); // Set frequency
    oscillator.type = type; // Set waveform type
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime); // Start at 0 volume
    gainNode.gain.linearRampToValueAtTime(volume * this.volume, this.audioContext.currentTime + 0.01); // Fade in
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration); // Fade out
    oscillator.start(this.audioContext.currentTime); // Start sound
    oscillator.stop(this.audioContext.currentTime + duration); // Stop after duration
  }
  
  // Create a noise sound (like an explosion or static)
  createNoise(duration, volume = 0.2) {
    if (!this.audioContext || !this.enabled) return; // Do nothing if audio is disabled
    const bufferSize = this.audioContext.sampleRate * duration; // Calculate buffer size
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate); // Create buffer
    const data = buffer.getChannelData(0); // Get buffer data array
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * volume * this.volume; // Fill with random noise
    }
    const source = this.audioContext.createBufferSource(); // Create buffer source
    const gainNode = this.audioContext.createGain(); // Create gain node
    source.buffer = buffer; // Set buffer
    source.connect(gainNode); // Connect source to gain
    gainNode.connect(this.audioContext.destination); // Connect gain to speakers
    gainNode.gain.setValueAtTime(1, this.audioContext.currentTime); // Start at full volume
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration); // Fade out
    source.start(this.audioContext.currentTime); // Play noise
  }
  
  // Play the shooting sound effect
  playShoot() {
    this.createTone(800, 0.1, 'square', 0.2); // First part of the sound
    setTimeout(() => this.createTone(600, 0.05, 'square', 0.15), 50); // Second part, slightly lower
  }
  
  // Play sound when enemy is hit
  playEnemyHit() {
    this.createTone(300, 0.15, 'sawtooth', 0.3); // Main hit sound
    this.createNoise(0.1, 0.1); // Add a bit of noise
  }
  
  // Play sound when enemy is destroyed
  playEnemyDestroy() {
    this.createTone(150, 0.3, 'sawtooth', 0.4); // First part
    setTimeout(() => this.createTone(100, 0.2, 'triangle', 0.3), 100); // Second part
    this.createNoise(0.2, 0.15); // Add noise for explosion
  }
  
  // Play sound when player is hit
  playPlayerHit() {
    // Softer, shorter player damage sound
    this.createTone(220, 0.2, 'triangle', 0.25); // Main tone
    this.createNoise(0.15, 0.12); // Add noise
  }
  
  // Play sound when player picks up an item
  playPickup() {
    this.createTone(523, 0.1, 'sine', 0.3); // C note
    setTimeout(() => this.createTone(659, 0.1, 'sine', 0.3), 80); // E note
    setTimeout(() => this.createTone(784, 0.15, 'sine', 0.3), 160); // G note
  }
  
  // Play sound when player dashes
  playDash() {
    this.createTone(1000, 0.2, 'sawtooth', 0.25); // First part
    setTimeout(() => this.createTone(1200, 0.1, 'square', 0.2), 100); // Second part
  }
  
  // Play sound when player spins
  playSpin() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.createTone(400 + i * 100, 0.05, 'triangle', 0.2); // Play a rising sequence
      }, i * 30);
    }
  }
  
  // Play sound when entering a portal
  playPortalEnter() {
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        this.createTone(200 + i * 50, 0.1, 'sine', 0.3); // Play a sequence of rising notes
      }, i * 50);
    }
  }
  
  // Play sound when the game is over
  playGameOver() {
    // Short, non-intrusive descending motif
    const notes = [440, 392, 349, 330, 294]; // Descending notes
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.createTone(freq, 0.16, 'triangle', 0.3); // Play each note in sequence
      }, i * 140);
    });
  }
  
  // Play sound when a new level starts
  playLevelStart() {
    const melody = [392, 523, 659, 784]; // Ascending melody
    melody.forEach((freq, i) => {
      setTimeout(() => {
        this.createTone(freq, 0.2, 'sine', 0.3); // Play each note in sequence
      }, i * 150);
    });
  }
  
  // Start playing simple ambient background music
  startAmbientMusic() {
    if (!this.enabled || this.currentMusic) return; // Only play if enabled and not already playing
    const playAmbientNote = () => {
      if (!this.currentMusic) return; // Stop if music is stopped
      const notes = [130.81, 146.83, 164.81, 174.61, 196.00, 220.00]; // Low notes
      const note = notes[Math.floor(Math.random() * notes.length)]; // Pick a random note
      this.createTone(note, 2, 'sine', 0.1); // Play the note
      setTimeout(playAmbientNote, 2000 + Math.random() * 3000); // Schedule next note
    };
    this.currentMusic = true; // Mark music as playing
    playAmbientNote(); // Start the loop
  }
  
  // Stop the ambient music
  stopAmbientMusic() {
    this.currentMusic = null; // Set to null to stop music
  }
  
  // Set the master volume (0 to 1)
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
  }
  // Toggle audio on/off
  toggleEnabled() {
    this.enabled = !this.enabled; // Flip enabled state
    if (!this.enabled) {
      this.stopAmbientMusic(); // Stop music if disabling
    }
    return this.enabled; // Return new state
  }
}

// Create global audio manager instance
export const audioManager = new AudioManager(); // Singleton for use throughout the game

// Convenience object for playing sounds by name
export const playSound = {
  shoot: () => audioManager.playShoot(), // Play shoot sound
  enemyHit: () => audioManager.playEnemyHit(), // Play enemy hit sound
  enemyDestroy: () => audioManager.playEnemyDestroy(), // Play enemy destroy sound
  playerHit: () => audioManager.playPlayerHit(), // Play player hit sound
  pickup: () => audioManager.playPickup(), // Play pickup sound
  dash: () => audioManager.playDash(), // Play dash sound
  spin: () => audioManager.playSpin(), // Play spin sound
  portalEnter: () => audioManager.playPortalEnter(), // Play portal enter sound
  gameOver: () => audioManager.playGameOver(), // Play game over sound
  levelStart: () => audioManager.playLevelStart() // Play level start sound
};