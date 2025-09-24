// audio.js -- Sound effects and music system

class AudioManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.7;
    this.musicVolume = 0.4;
    this.currentMusic = null;
    
    // Initialize Web Audio API for better sound control
    this.audioContext = null;
    this.initAudioContext();
  }
  
  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }
  
  // Create sound effects using Web Audio API (no external files needed)
  createTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.audioContext || !this.enabled) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * this.volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }
  
  // Create more complex sounds
  createNoise(duration, volume = 0.2) {
    if (!this.audioContext || !this.enabled) return;
    
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * volume * this.volume;
    }
    
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
    
    source.start(this.audioContext.currentTime);
  }
  
  // Sound effect methods
  playShoot() {
    this.createTone(800, 0.1, 'square', 0.2);
    setTimeout(() => this.createTone(600, 0.05, 'square', 0.15), 50);
  }
  
  playEnemyHit() {
    this.createTone(300, 0.15, 'sawtooth', 0.3);
    this.createNoise(0.1, 0.1);
  }
  
  playEnemyDestroy() {
    this.createTone(150, 0.3, 'sawtooth', 0.4);
    setTimeout(() => this.createTone(100, 0.2, 'triangle', 0.3), 100);
    this.createNoise(0.2, 0.15);
  }
  
  playPlayerHit() {
    // Softer, shorter player damage sound
    this.createTone(220, 0.2, 'triangle', 0.25);
    this.createNoise(0.15, 0.12);
  }
  
  playPickup() {
    this.createTone(523, 0.1, 'sine', 0.3); // C
    setTimeout(() => this.createTone(659, 0.1, 'sine', 0.3), 80); // E
    setTimeout(() => this.createTone(784, 0.15, 'sine', 0.3), 160); // G
  }
  
  playDash() {
    this.createTone(1000, 0.2, 'sawtooth', 0.25);
    setTimeout(() => this.createTone(1200, 0.1, 'square', 0.2), 100);
  }
  
  playSpin() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.createTone(400 + i * 100, 0.05, 'triangle', 0.2);
      }, i * 30);
    }
  }
  
  playPortalEnter() {
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        this.createTone(200 + i * 50, 0.1, 'sine', 0.3);
      }, i * 50);
    }
  }
  
  playGameOver() {
    // Short, non-intrusive descending motif
    const notes = [440, 392, 349, 330, 294];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.createTone(freq, 0.16, 'triangle', 0.3);
      }, i * 140);
    });
  }
  
  playLevelStart() {
    const melody = [392, 523, 659, 784];
    melody.forEach((freq, i) => {
      setTimeout(() => {
        this.createTone(freq, 0.2, 'sine', 0.3);
      }, i * 150);
    });
  }
  
  // Background music (simple ambient tones)
  startAmbientMusic() {
    if (!this.enabled || this.currentMusic) return;
    
    const playAmbientNote = () => {
      if (!this.currentMusic) return;
      
      const notes = [130.81, 146.83, 164.81, 174.61, 196.00, 220.00]; // Low notes
      const note = notes[Math.floor(Math.random() * notes.length)];
      this.createTone(note, 2, 'sine', 0.1);
      
      setTimeout(playAmbientNote, 2000 + Math.random() * 3000);
    };
    
    this.currentMusic = true;
    playAmbientNote();
  }
  
  stopAmbientMusic() {
    this.currentMusic = null;
  }
  
  // Settings
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }
  
  toggleEnabled() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopAmbientMusic();
    }
    return this.enabled;
  }
}

// Create global audio manager instance
export const audioManager = new AudioManager();

// Convenience functions
export const playSound = {
  shoot: () => audioManager.playShoot(),
  enemyHit: () => audioManager.playEnemyHit(),
  enemyDestroy: () => audioManager.playEnemyDestroy(),
  playerHit: () => audioManager.playPlayerHit(),
  pickup: () => audioManager.playPickup(),
  dash: () => audioManager.playDash(),
  spin: () => audioManager.playSpin(),
  portalEnter: () => audioManager.playPortalEnter(),
  gameOver: () => audioManager.playGameOver(),
  levelStart: () => audioManager.playLevelStart()
};