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
  HEALING: 'healing',     // Healing effect (not used)
  ENERGY_LINE: 'energyLine', // Energy line for star AOE
  FLAME_TRAIL: 'flameTrail' // Flame trail for circle dash
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

export function createEnergyLine(startX, startY, endX, endY, color = COLORS.starKill) {
  // Create a series of particles along the line from start to end
  const distance = Math.hypot(endX - startX, endY - startY);
  const steps = Math.max(8, Math.floor(distance / 10)); // At least 8 particles, more for longer distances
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps; // Interpolation factor (0 to 1)
    const x = startX + (endX - startX) * t;
    const y = startY + (endY - startY) * t;
    
    particles.push({
      type: 'energyLine', // New particle type
      x: x + (Math.random() - 0.5) * 4, // Small random offset
      y: y + (Math.random() - 0.5) * 4, // Small random offset
      vx: (Math.random() - 0.5) * 1, // Small random movement
      vy: (Math.random() - 0.5) * 1, // Small random movement
      life: 8, // Short lifetime for quick flash
      maxLife: 8, // Max lifetime
      size: 3 + Math.random() * 2, // Varying size
      color: color, // Energy color
      alpha: 0.9 // Bright alpha
    });
  }
}

export function createFlameTrail(x, y, vx, vy, intensity = 1) {
  // Create flame particles behind the dashing circle
  const flameColors = ['#ff4400', '#ff6600', '#ff8800', '#ffaa00', '#ffcc44']; // Hot to cool flame colors
  const particleCount = Math.floor(3 * intensity) + 2; // More particles for higher intensity
  
  for (let i = 0; i < particleCount; i++) {
    const color = flameColors[Math.floor(Math.random() * flameColors.length)]; // Random flame color
    const spread = 15; // How much the flames spread out
    
    particles.push({
      type: PARTICLE_TYPES.FLAME_TRAIL, // Flame trail type
      x: x + (Math.random() - 0.5) * spread, // Random spread around position
      y: y + (Math.random() - 0.5) * spread, // Random spread around position
      vx: -vx * 0.3 + (Math.random() - 0.5) * 2, // Move opposite to dash direction with random spread
      vy: -vy * 0.3 + (Math.random() - 0.5) * 2, // Move opposite to dash direction with random spread
      life: 20 + Math.random() * 15, // Variable lifetime (20-35 frames)
      maxLife: 35, // Max lifetime for alpha calculation
      size: 2 + Math.random() * 4, // Variable size (2-6)
      color: color, // Flame color
      alpha: 0.8 + Math.random() * 0.2, // Bright start alpha
      heat: 1.0 // Heat level for color shifting
    });
  }
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
    } else if (p.type === 'energyLine') {
      p.vx *= 0.8; // Slow down quickly
      p.vy *= 0.8; // Slow down quickly
    } else if (p.type === PARTICLE_TYPES.FLAME_TRAIL) {
      p.vx *= 0.92; // Gradual slowdown
      p.vy *= 0.92; // Gradual slowdown
      p.vy -= 0.15; // Float upward like real flames
      p.heat *= 0.97; // Cool down over time
      
      // Shift color from hot to cool as flame cools
      if (p.heat < 0.7) {
        p.color = '#ff8800'; // Orange
      }
      if (p.heat < 0.4) {
        p.color = '#ffaa00'; // Yellow-orange
      }
      if (p.heat < 0.2) {
        p.color = '#ffcc44'; // Yellow
      }
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
    } else if (p.type === 'energyLine') {
      // Render energy line particles with glow
      ctx.shadowColor = p.color; // Glow color
      ctx.shadowBlur = 8; // Glow intensity
      ctx.fillStyle = p.color; // Set color
      ctx.beginPath(); // Start drawing
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); // Draw circle
      ctx.fill(); // Fill circle
      ctx.shadowBlur = 0; // Reset shadow
    } else if (p.type === PARTICLE_TYPES.FLAME_TRAIL) {
      // Render flame particles with intense glow and varying opacity
      ctx.shadowColor = p.color; // Flame glow
      ctx.shadowBlur = 12 + p.size; // Glow intensity based on size
      ctx.fillStyle = p.color; // Set flame color
      ctx.beginPath(); // Start drawing
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); // Draw flame particle
      ctx.fill(); // Fill particle
      
      // Add inner bright core for hot flames
      if (p.heat > 0.5) {
        ctx.shadowBlur = 6; // Smaller inner glow
        ctx.fillStyle = '#ffffff'; // White hot core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2); // Smaller inner circle
        ctx.fill();
      }
      ctx.shadowBlur = 0; // Reset shadow
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