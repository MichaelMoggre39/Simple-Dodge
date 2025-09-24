// particles.js -- Visual effects and particle system
// This file manages all particle effects, colors, and screen shake in the game.

export const particles = []; // Array to store all active particles

// Common palette for consistency across systems
export const COLORS = {
  playerBullet: '#00ff00', // Pea shooter
  enemyDamage: '#a020f0',  // Enemy hit/destroyed (purple)
  starKill: '#ffff00',     // Star spin kills (yellow)
  dashKill: '#ff4444',     // Dash kills (red)
  playerHit: '#ff4444',    // Player taking damage (red)
  pickup: '#ffd700'        // Pickups (gold)
};

// --- Particle Types ---
export const PARTICLE_TYPES = {
  EXPLOSION: 'explosion', // Explosion effect
  SPARK: 'spark',         // Spark effect
  TRAIL: 'trail',         // Bullet trail
  PICKUP: 'pickup',       // Pickup effect
  DAMAGE: 'damage',       // Damage numbers
  HEALING: 'healing'      // Healing effect (not used)
};

// --- Create different types of particle effects ---
export function createExplosion(x, y, color = '#ff6600', count = 8) {
  for (let i = 0; i < count; i++) { // For each particle
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5; // Spread angle
    const speed = 3 + Math.random() * 4; // Random speed
    particles.push({
      type: PARTICLE_TYPES.EXPLOSION, // Type of particle
      x: x, // X position
      y: y, // Y position
      vx: Math.cos(angle) * speed, // X velocity
      vy: Math.sin(angle) * speed, // Y velocity
      life: 30, // Lifetime
      maxLife: 30, // Max lifetime
      size: 4 + Math.random() * 4, // Size
      color: color, // Color
      alpha: 1.0 // Opacity
    });
  }
}

export function createSparks(x, y, count = 5) {
  for (let i = 0; i < count; i++) { // For each spark
    particles.push({
      type: PARTICLE_TYPES.SPARK, // Type
      x: x + (Math.random() - 0.5) * 20, // X position
      y: y + (Math.random() - 0.5) * 20, // Y position
      vx: (Math.random() - 0.5) * 6, // X velocity
      vy: (Math.random() - 0.5) * 6, // Y velocity
      life: 20, // Lifetime
      maxLife: 20, // Max lifetime
      size: 2 + Math.random() * 2, // Size
      color: '#ffff00', // Color
      alpha: 1.0 // Opacity
    });
  }
}

// Allow callers to pass specific spark colors
export function createColoredSparks(x, y, color = '#ffff00', count = 5) {
  for (let i = 0; i < count; i++) { // For each spark
    particles.push({
      type: PARTICLE_TYPES.SPARK, // Type
      x: x + (Math.random() - 0.5) * 20, // X position
      y: y + (Math.random() - 0.5) * 20, // Y position
      vx: (Math.random() - 0.5) * 6, // X velocity
      vy: (Math.random() - 0.5) * 6, // Y velocity
      life: 20, // Lifetime
      maxLife: 20, // Max lifetime
      size: 2 + Math.random() * 2, // Size
      color, // Color
      alpha: 1.0 // Opacity
    });
  }
}

export function createTrail(x, y, vx, vy, color = COLORS.playerBullet) {
  particles.push({
    type: PARTICLE_TYPES.TRAIL, // Type
    x: x, // X position
    y: y, // Y position
    vx: vx * 0.1, // X velocity (slower than bullet)
    vy: vy * 0.1, // Y velocity
    life: 15, // Lifetime
    maxLife: 15, // Max lifetime
    size: 3, // Size
    color: color, // Color
    alpha: 0.8 // Opacity
  });
}

export function createPickupEffect(x, y, color = COLORS.pickup) {
  for (let i = 0; i < 12; i++) { // For each pickup particle
    const angle = (Math.PI * 2 * i) / 12; // Spread angle
    const speed = 2 + Math.random() * 2; // Random speed
    particles.push({
      type: PARTICLE_TYPES.PICKUP, // Type
      x: x, // X position
      y: y, // Y position
      vx: Math.cos(angle) * speed, // X velocity
      vy: Math.sin(angle) * speed, // Y velocity
      life: 40, // Lifetime
      maxLife: 40, // Max lifetime
      size: 3, // Size
      color: color, // Color
      alpha: 1.0 // Opacity
    });
  }
}

export function createDamageNumbers(x, y, damage) {
  particles.push({
    type: PARTICLE_TYPES.DAMAGE, // Type
    x: x, // X position
    y: y, // Y position
    vx: (Math.random() - 0.5) * 2, // X velocity
    vy: -3 - Math.random() * 2, // Y velocity (upwards)
    life: 60, // Lifetime
    maxLife: 60, // Max lifetime
    size: 20, // Font size
    text: damage.toString(), // Damage text
    color: COLORS.enemyDamage, // Color
    alpha: 1.0 // Opacity
  });
}

// --- Update all particles ---
export function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) { // Go through all particles backwards
    const p = particles[i]; // Get the particle
    // Update position
    p.x += p.vx; // Move horizontally
    p.y += p.vy; // Move vertically
    // Apply physics based on type
    if (p.type === PARTICLE_TYPES.EXPLOSION || p.type === PARTICLE_TYPES.SPARK) {
      p.vx *= 0.95; // Friction
      p.vy *= 0.95; // Friction
      p.vy += 0.2; // Gravity
    } else if (p.type === PARTICLE_TYPES.TRAIL) {
      p.vx *= 0.9; // Slow down
      p.vy *= 0.9; // Slow down
    } else if (p.type === PARTICLE_TYPES.PICKUP) {
      p.vy += 0.1; // Light gravity
      p.vx *= 0.98; // Slow down
    } else if (p.type === PARTICLE_TYPES.DAMAGE) {
      p.vy += 0.1; // Gravity for damage numbers
    }
    // Update life and alpha
    p.life--; // Decrease life
    p.alpha = p.life / p.maxLife; // Fade out
    // Remove dead particles
    if (p.life <= 0) {
      particles.splice(i, 1); // Remove from array
    }
  }
}

// --- Render all particles ---
export function renderParticles(ctx) {
  ctx.save(); // Save context state
  for (const p of particles) { // For each particle
    ctx.globalAlpha = p.alpha; // Set opacity
    if (p.type === PARTICLE_TYPES.DAMAGE) {
      // Render damage numbers
      ctx.fillStyle = p.color; // Set color
      ctx.font = `bold ${p.size}px Arial`; // Set font
      ctx.textAlign = 'center'; // Center text
      ctx.fillText(p.text, p.x, p.y); // Draw text
    } else {
      // Render particle dots
      ctx.fillStyle = p.color; // Set color
      ctx.beginPath(); // Start drawing
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); // Draw circle
      ctx.fill(); // Fill circle
    }
  }
  ctx.restore(); // Restore context state
}

// --- Screen shake effect ---
let screenShake = { x: 0, y: 0, intensity: 0, duration: 0 }; // Object to track screen shake

export function addScreenShake(intensity = 5, duration = 10) {
  screenShake.intensity = Math.max(screenShake.intensity, intensity); // Set intensity
  screenShake.duration = Math.max(screenShake.duration, duration); // Set duration
}

export function updateScreenShake() {
  if (screenShake.duration > 0) {
    screenShake.x = (Math.random() - 0.5) * screenShake.intensity; // Random x offset
    screenShake.y = (Math.random() - 0.5) * screenShake.intensity; // Random y offset
    screenShake.duration--; // Decrease duration
    screenShake.intensity *= 0.9; // Fade out
  } else {
    screenShake.x = 0; // Reset x
    screenShake.y = 0; // Reset y
    screenShake.intensity = 0; // Reset intensity
  }
}

export function getScreenShake() {
  return { x: screenShake.x, y: screenShake.y }; // Return current shake
}

// --- Clear all particles (for level transitions) ---
export function clearParticles() {
  particles.length = 0; // Remove all particles
  screenShake = { x: 0, y: 0, intensity: 0, duration: 0 }; // Reset screen shake
}