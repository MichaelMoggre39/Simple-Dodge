// particles.js -- Visual effects and particle system

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
  EXPLOSION: 'explosion',
  SPARK: 'spark',
  TRAIL: 'trail',
  PICKUP: 'pickup',
  DAMAGE: 'damage',
  HEALING: 'healing'
};

// --- Create different types of particle effects ---
export function createExplosion(x, y, color = '#ff6600', count = 8) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 3 + Math.random() * 4;
    particles.push({
      type: PARTICLE_TYPES.EXPLOSION,
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 30,
      maxLife: 30,
      size: 4 + Math.random() * 4,
      color: color,
      alpha: 1.0
    });
  }
}

export function createSparks(x, y, count = 5) {
  for (let i = 0; i < count; i++) {
    particles.push({
      type: PARTICLE_TYPES.SPARK,
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      life: 20,
      maxLife: 20,
      size: 2 + Math.random() * 2,
      color: '#ffff00',
      alpha: 1.0
    });
  }
}

// Allow callers to pass specific spark colors
export function createColoredSparks(x, y, color = '#ffff00', count = 5) {
  for (let i = 0; i < count; i++) {
    particles.push({
      type: PARTICLE_TYPES.SPARK,
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      life: 20,
      maxLife: 20,
      size: 2 + Math.random() * 2,
      color,
      alpha: 1.0
    });
  }
}

export function createTrail(x, y, vx, vy, color = COLORS.playerBullet) {
  particles.push({
    type: PARTICLE_TYPES.TRAIL,
    x: x,
    y: y,
    vx: vx * 0.1,
    vy: vy * 0.1,
    life: 15,
    maxLife: 15,
    size: 3,
    color: color,
    alpha: 0.8
  });
}

export function createPickupEffect(x, y, color = COLORS.pickup) {
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12;
    const speed = 2 + Math.random() * 2;
    particles.push({
      type: PARTICLE_TYPES.PICKUP,
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 40,
      maxLife: 40,
      size: 3,
      color: color,
      alpha: 1.0
    });
  }
}

export function createDamageNumbers(x, y, damage) {
  particles.push({
    type: PARTICLE_TYPES.DAMAGE,
    x: x,
    y: y,
    vx: (Math.random() - 0.5) * 2,
    vy: -3 - Math.random() * 2,
    life: 60,
    maxLife: 60,
    size: 20,
    text: damage.toString(),
    color: COLORS.enemyDamage,
    alpha: 1.0
  });
}

// --- Update all particles ---
export function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    
    // Update position
    p.x += p.vx;
    p.y += p.vy;
    
    // Apply physics based on type
    if (p.type === PARTICLE_TYPES.EXPLOSION || p.type === PARTICLE_TYPES.SPARK) {
      p.vx *= 0.95; // Friction
      p.vy *= 0.95;
      p.vy += 0.2; // Gravity
    } else if (p.type === PARTICLE_TYPES.TRAIL) {
      p.vx *= 0.9;
      p.vy *= 0.9;
    } else if (p.type === PARTICLE_TYPES.PICKUP) {
      p.vy += 0.1; // Light gravity
      p.vx *= 0.98;
    } else if (p.type === PARTICLE_TYPES.DAMAGE) {
      p.vy += 0.1; // Gravity for damage numbers
    }
    
    // Update life and alpha
    p.life--;
    p.alpha = p.life / p.maxLife;
    
    // Remove dead particles
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

// --- Render all particles ---
export function renderParticles(ctx) {
  ctx.save();
  
  for (const p of particles) {
    ctx.globalAlpha = p.alpha;
    
    if (p.type === PARTICLE_TYPES.DAMAGE) {
      // Render damage numbers
      ctx.fillStyle = p.color;
      ctx.font = `bold ${p.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(p.text, p.x, p.y);
    } else {
      // Render particle dots
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  ctx.restore();
}

// --- Screen shake effect ---
let screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };

export function addScreenShake(intensity = 5, duration = 10) {
  screenShake.intensity = Math.max(screenShake.intensity, intensity);
  screenShake.duration = Math.max(screenShake.duration, duration);
}

export function updateScreenShake() {
  if (screenShake.duration > 0) {
    screenShake.x = (Math.random() - 0.5) * screenShake.intensity;
    screenShake.y = (Math.random() - 0.5) * screenShake.intensity;
    screenShake.duration--;
    screenShake.intensity *= 0.9; // Fade out
  } else {
    screenShake.x = 0;
    screenShake.y = 0;
    screenShake.intensity = 0;
  }
}

export function getScreenShake() {
  return { x: screenShake.x, y: screenShake.y };
}

// --- Clear all particles (for level transitions) ---
export function clearParticles() {
  particles.length = 0;
  screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
}