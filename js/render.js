
// render.js -- Handles drawing the entire frame

import { GAME_WIDTH, GAME_HEIGHT } from './constants.js'; // Import logical world dimensions
import { drawStar } from './shapes.js'; // Import helper for star shape
import { bullets } from './bullets.js'; // Import bullets array
import { enemies } from './enemies.js'; // Import enemies array
import { renderParticles, getScreenShake, COLORS } from './particles.js'; // Import particle system and shared colors

// --- Helper: Calculate scale and offset for world-to-canvas transform ---
function getWorldTransform(canvas) { // Calculates how to scale and center the game
  const scaleX = canvas.width / GAME_WIDTH; // Calculate horizontal scale
  const scaleY = canvas.height / GAME_HEIGHT; // Calculate vertical scale
  const scale = Math.min(scaleX, scaleY); // Use the smaller scale to fit the game
  const offsetX = (canvas.width / scale - GAME_WIDTH) / 2; // Calculate horizontal offset for centering
  const offsetY = (canvas.height / scale - GAME_HEIGHT) / 2; // Calculate vertical offset for centering
  return { scale, offsetX, offsetY }; // Return scale and offsets
}

export function render(ctx, canvas, gameState) { // Draws everything on the screen
  // --- Detect if player is over a pickup ---
  let hoveredPickup = null; // Track if player is over a pickup
  for (const p of gameState.pickups) { // For each pickup
    if (p.type !== 'portal') { // Ignore portal
      // Simple AABB collision
      if (
        gameState.player.x < p.x + p.size &&
        gameState.player.x + gameState.player.size > p.x &&
        gameState.player.y < p.y + p.size &&
        gameState.player.y + gameState.player.size > p.y
      ) {
        hoveredPickup = p; // Player is over this pickup
        break;
      }
    }
  }
  // --- Clear previous frame ---
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the whole canvas

  // --- Draw background gradient ---
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height); // Create a gradient
  gradient.addColorStop(1, '#2a5298'); // Set color
  ctx.fillStyle = gradient; // Use gradient as fill
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the background

  // --- Calculate world transform (scaling and letterboxing) ---
  const { scale, offsetX, offsetY } = getWorldTransform(canvas); // Get scale and offsets

  // --- Draw letterbox bars (outside game area) ---
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; // Set color for bars
  ctx.fillRect(0, 0, canvas.width, offsetY * scale); // Top bar
  ctx.fillRect(0, canvas.height - offsetY * scale, canvas.width, offsetY * scale); // Bottom bar
  ctx.fillRect(0, 0, offsetX * scale, canvas.height); // Left bar
  ctx.fillRect(canvas.width - offsetX * scale, 0, offsetX * scale, canvas.height); // Right bar

  // --- Apply world transform with screen shake ---
  ctx.save(); // Save current state
  ctx.scale(scale, scale); // Scale drawing
  
  // Apply screen shake
  const shake = getScreenShake();
  ctx.translate(offsetX + shake.x, offsetY + shake.y); // Move drawing with shake

  // --- Draw game area border ---
  ctx.strokeStyle = 'black'; // Border color
  ctx.lineWidth = 1; // Border width
  ctx.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT); // Draw border

  // --- Draw pickups and portal ---
  for (const p of gameState.pickups) { // For each pickup
    if (p.type === 'portal') { // If it's a portal
      // Draw portal as a glowing blue square
      ctx.save();
      ctx.shadowColor = '#00f6ff'; // Glow color
      ctx.shadowBlur = 20; // Glow size
      ctx.fillStyle = '#00bfff'; // Fill color
      ctx.fillRect(p.x, p.y, p.size, p.size); // Draw portal
      ctx.restore();
      // Optionally, draw a label
      ctx.save();
      ctx.fillStyle = 'white'; // Text color
      ctx.font = '20px Arial'; // Font
      ctx.textAlign = 'center'; // Center text
      ctx.fillText('START', p.x + p.size / 2, p.y + p.size + 22); // Draw label
      ctx.restore();
    } else if (p.type === 'circle') { // If it's a circle pickup
      // Gold circle
      ctx.save();
      ctx.fillStyle = 'gold'; // Fill color
      ctx.beginPath();
      ctx.arc(p.x + p.size / 2, p.y + p.size / 2, p.size / 2, 0, Math.PI * 2); // Draw circle
      ctx.fill();
      ctx.lineWidth = 2; // Border width
      ctx.strokeStyle = '#fff'; // Border color
      ctx.stroke();
      ctx.restore();
    } else if (p.type === 'triangle') { // If it's a triangle pickup
      // Gold triangle
      ctx.save();
      ctx.fillStyle = 'gold'; // Fill color
      ctx.strokeStyle = '#fff'; // Border color
      ctx.lineWidth = 2; // Border width
      ctx.beginPath();
      const cx = p.x + p.size / 2, cy = p.y + p.size / 2, r = p.size / 2; // Center and radius
      for (let i = 0; i < 3; i++) { // Draw triangle
        const angle = Math.PI / 2 + i * (2 * Math.PI / 3); // Angle for each point
        const x = cx + Math.cos(angle) * r; // X position
        const y = cy + Math.sin(angle) * r; // Y position
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); // Move or draw line
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (p.type === 'star') { // If it's a star pickup
      // Gold star
      ctx.save();
      ctx.fillStyle = 'gold'; // Fill color
      ctx.strokeStyle = '#fff'; // Border color
      ctx.lineWidth = 2; // Border width
      drawStar(ctx, p.x + p.size / 2, p.y + p.size / 2, 5, p.size / 2, p.size / 4); // Draw star
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  // --- Draw info box if hovering a pickup ---
  if (hoveredPickup) { // If player is over a pickup
    let info = '';
    if (hoveredPickup.type === 'circle') {
      info = 'Circle: Dash with Left Click. Fast movement burst.';
    } else if (hoveredPickup.type === 'triangle') {
      info = 'Triangle: Aim with mouse, shoot with click.';
    } else if (hoveredPickup.type === 'star') {
      info = 'Star: AOE Spin attack with Left Click. Destroys enemies in wide range!';
    }
    // Draw info box higher above the pickup
    ctx.save();
    ctx.globalAlpha = 0.95; // Slightly transparent
    ctx.fillStyle = '#222'; // Box color
    ctx.strokeStyle = '#fff'; // Border color
    ctx.lineWidth = 2; // Border width
    const boxWidth = 380; // Width of info box
    // Use smaller font for info text
    ctx.font = '20px Arial'; // Font
    const infoLineHeight = 26; // Line height
    const promptPadding = 18; // Padding for prompt
    const promptHeight = 24; // Height for prompt
    const lines = wrapTextLines(ctx, info, boxWidth - 30); // Split info into lines
    const boxHeight = 32 + lines.length * infoLineHeight + promptPadding + promptHeight + 16; // Total height
    // Calculate world transform for clamping
    const { scale, offsetX, offsetY } = (typeof getWorldTransform === 'function') ? getWorldTransform(canvas) : { scale: 1, offsetX: 0, offsetY: 0 };
    let boxX = hoveredPickup.x + hoveredPickup.size / 2 - boxWidth / 2; // Center box
    // Clamp boxX to stay within world bounds
    boxX = Math.max(0, Math.min(boxX, GAME_WIDTH - boxWidth)); // Keep inside game area
    // Add more vertical space between box and pickup
    const boxY = Math.max(10, hoveredPickup.y - boxHeight - 60); // Place above pickup
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight); // Draw box
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight); // Draw border
    ctx.fillStyle = '#fff'; // Text color
    ctx.font = '20px Arial'; // Font
    ctx.textAlign = 'center'; // Center text
    const centerX = boxX + boxWidth / 2; // Center x
    // Draw info text lines (smaller font, wrapped)
    lines.forEach((line, i) => {
      ctx.fillText(line, centerX, boxY + 40 + i * infoLineHeight); // Draw each line
    });
    // Draw prompt with extra padding below info text
    ctx.font = '20px Arial'; // Font
    ctx.fillStyle = '#0ff'; // Prompt color
    ctx.fillText('Press SPACE to confirm this transform', centerX, boxY + 40 + lines.length * infoLineHeight + promptPadding); // Draw prompt
    ctx.restore();
  }

// --- Helper: Word wrap for info box ---
function wrapTextLines(ctx, text, maxWidth) { // Splits text into lines that fit the box
  const words = text.split(' '); // Split into words
  const lines = []; // Array of lines
  let line = ''; // Current line
  for (let n = 0; n < words.length; n++) { // For each word
    const testLine = line + words[n] + ' '; // Try adding word
    const metrics = ctx.measureText(testLine); // Measure width
    if (metrics.width > maxWidth && n > 0) { // If too wide
      lines.push(line.trim()); // Add current line
      line = words[n] + ' '; // Start new line
    } else {
      line = testLine; // Add word to line
    }
  }
  lines.push(line.trim()); // Add last line
  return lines; // Return array of lines
}

  // --- Draw player (supports multiple shapes) ---
  drawPlayer(ctx, gameState.player); // Draw the player

  // --- Draw player health and score (level one) ---
  if (gameState.inLevelOne) { // If in level one
    ctx.save();
    ctx.font = '28px Arial'; // Font
    ctx.fillStyle = '#fff'; // Text color
    ctx.strokeStyle = '#000'; // Border color
    ctx.lineWidth = 4; // Border width
    const health = (gameState.maxHits || 3) - (gameState.playerHits || 0); // Calculate health
    const text = `Health: ${health}`; // Health text
    ctx.strokeText(text, 30, 50); // Draw border
    ctx.fillText(text, 30, 50); // Draw text
    // Draw score top right
    const score = gameState.score || 0; // Get score
    const scoreText = `Score: ${score}`; // Score text
    ctx.strokeText(scoreText, GAME_WIDTH - 200, 50); // Draw border
    ctx.fillText(scoreText, GAME_WIDTH - 200, 50); // Draw text
    ctx.restore();
  }

  // --- Draw notification if player tries to enter portal as square ---
  if (gameState.showPowerupNotification) { // If notification should show
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    ctx.globalAlpha = 0.92; // Slightly transparent
    ctx.font = 'bold 32px Arial'; // Font
    const notifText = 'Pick a powerup before entering the portal!'; // Notification text
    const textMetrics = ctx.measureText(notifText); // Measure width
    const paddingX = 48; // Horizontal padding
    const paddingY = 28; // Vertical padding
    const notifWidth = textMetrics.width + paddingX * 2; // Box width
    const notifHeight = 64 + paddingY; // Box height
    ctx.fillStyle = '#222'; // Box color
    ctx.strokeStyle = '#fff'; // Border color
    ctx.lineWidth = 4; // Border width
    ctx.textAlign = 'center'; // Center text
    ctx.textBaseline = 'middle'; // Middle align
    const x = ctx.canvas.width / 2, y = ctx.canvas.height / 2; // Center of screen
    ctx.fillRect(x - notifWidth/2, y - notifHeight/2, notifWidth, notifHeight); // Draw box
    ctx.strokeRect(x - notifWidth/2, y - notifHeight/2, notifWidth, notifHeight); // Draw border
    ctx.fillStyle = '#fff'; // Text color
    ctx.fillText(notifText, x, y); // Draw text
    ctx.restore();
    gameState.showPowerupNotification--; // Decrease timer
    if (gameState.showPowerupNotification <= 0) gameState.showPowerupNotification = 0; // Stop at 0
  }

  // --- Draw custom game over overlay ---
  if (gameState.gameOver) { // If game is over
    // Reset transform so overlay is always drawn in screen space
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    ctx.globalAlpha = 0.85; // Slightly transparent
    ctx.fillStyle = '#111'; // Box color
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill screen
    ctx.globalAlpha = 1.0; // Opaque
    ctx.fillStyle = '#fff'; // Text color
    ctx.textAlign = 'center'; // Center text
    ctx.textBaseline = 'top'; // Top align
    // Center overlay in the visible game world
    const { scale, offsetX, offsetY } = getWorldTransform(canvas); // Get scale and offsets
    const worldCenterX = (GAME_WIDTH / 2 + offsetX) * scale; // Center x
    const worldCenterY = (GAME_HEIGHT / 2 + offsetY) * scale; // Center y
    // Calculate vertical layout
    const titleFont = 'bold 80px Arial'; // Title font
    const scoreFont = '40px Arial'; // Score font
    const promptFont = '32px Arial'; // Prompt font
    const titleText = 'Game Over'; // Title text
    const scoreText = `Score: ${gameState.score || 0}`; // Score text
    const promptText = 'Click to Restart'; // Prompt text
    // Heights
    const titleHeight = 80; // Title height
    const scoreHeight = 40; // Score height
    const promptHeight = 32; // Prompt height
    const gap1 = 32; // Gap between title and score
    const gap2 = 32; // Gap between score and prompt
    // Total height for vertical centering
    const totalHeight = titleHeight + gap1 + scoreHeight + gap2 + promptHeight; // Total height
    let y = worldCenterY - totalHeight / 2; // Start y
    // Draw title
    ctx.font = titleFont; // Set font
    ctx.fillStyle = '#fff'; // Text color
    ctx.fillText(titleText, worldCenterX, y); // Draw title
    y += titleHeight + gap1; // Move down
    // Draw score
    ctx.font = scoreFont; // Set font
    ctx.fillStyle = '#fff'; // Text color
    ctx.fillText(scoreText, worldCenterX, y); // Draw score
    y += scoreHeight + gap2; // Move down
    // Draw prompt
    ctx.font = promptFont; // Set font
    ctx.fillStyle = '#0ff'; // Prompt color
    ctx.fillText(promptText, worldCenterX, y); // Draw prompt
    ctx.restore();
    // Add click-to-restart event (only once)
    if (!canvas._restartHandler) { // If not already set
      canvas._restartHandler = () => window.location.reload(); // Reload page on click
      canvas.addEventListener('mousedown', canvas._restartHandler); // Add event
    }
  } else if (canvas._restartHandler) { // If not game over but handler exists
    // Remove handler if not game over
    canvas.removeEventListener('mousedown', canvas._restartHandler); // Remove event
    canvas._restartHandler = null; // Clear handler
  }

  // --- Draw all bullets ---
  for (const b of bullets) { // For each bullet
    ctx.fillStyle = b.color || 'lime'; // Bullet color from bullet data
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); // Draw bullet
    ctx.fill();
  }

  // --- Draw all enemies as stylized squares (level one)
  for (const enemy of enemies) { // For each enemy
    ctx.save();
    const ex = enemy.x;
    const ey = enemy.y;
    const es = enemy.size;
    const cx = ex + es / 2;
    const cy = ey + es / 2;
    // Subtle glow
    ctx.shadowColor = COLORS.enemyDamage + 'aa';
    ctx.shadowBlur = 12;
    // Vertical purple gradient
    const grad = ctx.createLinearGradient(ex, ey, ex, ey + es);
    grad.addColorStop(0, '#d1c4e9');
    grad.addColorStop(0.6, '#b39ddb');
    grad.addColorStop(1, COLORS.enemyDamage);
    ctx.fillStyle = grad;
    ctx.fillRect(ex, ey, es, es);
    // Outline
    ctx.shadowBlur = 0;
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(ex, ey, es, es);
    ctx.restore();
  }

  // --- Draw all particles ---
  renderParticles(ctx); // Draw particle effects

  ctx.restore(); // Restore to pre-transform state
}

// --- Helper: Draw the player in its current shape ---
function drawPlayer(ctx, player) { // Draws the player based on its shape
  if (player.currentShape === 'square') { // Base form: white square
    ctx.save();
    // Subtle white glow
    ctx.shadowColor = '#ffffff55';
    ctx.shadowBlur = 8;
    // Vertical white-to-light-gray gradient
    const grad = ctx.createLinearGradient(player.x, player.y, player.x, player.y + player.size);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#e0e0e0');
    ctx.fillStyle = grad;
    ctx.fillRect(player.x, player.y, player.size, player.size);
    // Outline
    ctx.shadowBlur = 0; // No glow on outline for crispness
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#bdbdbd';
    ctx.strokeRect(player.x, player.y, player.size, player.size);
    ctx.restore();
  } else if (player.currentShape === 'circle') { // Dash form: red circle
    ctx.save();
    const cx = player.x + player.size / 2;
    const cy = player.y + player.size / 2;
    const r = player.size / 2;
    // Dash glow when active
    if (player.dashTime > 0) {
      ctx.shadowColor = COLORS.dashKill;
      ctx.shadowBlur = 25;
    }
    // Red radial gradient
    const grad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
    grad.addColorStop(0, '#ff8a80');
    grad.addColorStop(0.6, '#ff5252');
    grad.addColorStop(1, '#e53935');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    // White outline
    ctx.shadowBlur = 0;
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.restore();
  } else if (player.currentShape === 'triangle') { // Shooter form: green triangle
    ctx.save();
    ctx.translate(player.x + player.size / 2, player.y + player.size / 2); // Move to center
    ctx.rotate(player.aimAngle || 0); // Rotate to aim
    // Shooting glow
    if (player.shooting) {
      ctx.shadowColor = COLORS.playerBullet;
      ctx.shadowBlur = 18;
    }
    // Green gradient from back to tip
    const grad = ctx.createLinearGradient(-player.size / 2, 0, player.size / 2, 0);
    grad.addColorStop(0, '#b9f6ca');
    grad.addColorStop(0.6, '#00e676');
    grad.addColorStop(1, '#00c853');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(player.size / 2, 0); // Tip (front)
    ctx.lineTo(-player.size / 2, -player.size / 2); // Back left
    ctx.lineTo(-player.size / 2, player.size / 2); // Back right
    ctx.closePath();
    ctx.fill();
    // White outline
    ctx.shadowBlur = 0;
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.restore();
  } else if (player.currentShape === 'star') { // If star
    // Draw AOE range indicator when spinning
    if (player.spinning && player.spinTime > 0) {
      ctx.save();
      const centerX = player.x + player.size / 2;
      const centerY = player.y + player.size / 2;
      const spinRadius = player.size * 1.8; // Match the collision radius
      
      // Draw pulsing AOE ring
      const pulseIntensity = Math.sin(Date.now() * 0.02) * 0.3 + 0.7; // Pulsing effect
      ctx.globalAlpha = 0.3 * pulseIntensity;
      
      // Outer ring
      ctx.strokeStyle = COLORS.starKill;
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 4]); // Dashed line
      ctx.beginPath();
      ctx.arc(centerX, centerY, spinRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Inner filled circle for more dramatic effect
      ctx.globalAlpha = 0.15 * pulseIntensity;
      const aoeGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, spinRadius);
      aoeGradient.addColorStop(0, COLORS.starKill + '40'); // Semi-transparent center
      aoeGradient.addColorStop(1, COLORS.starKill + '00'); // Fully transparent edge
      ctx.fillStyle = aoeGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, spinRadius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.setLineDash([]); // Reset line dash
      ctx.restore();
    }
    
    // Draw a spinning star
    ctx.save();
    ctx.translate(player.x + player.size / 2, player.y + player.size / 2); // Move to center
    let spinAngle = 0; // Start angle
    if (player.spinning && player.spinTime > 0) { // If spinning
      // Spin angle based on remaining spinTime (full spin in 15 frames)
      spinAngle = (2 * Math.PI) * (1 - player.spinTime / 15); // Calculate angle
      // Enhanced glow while spinning
      ctx.shadowColor = COLORS.starKill;
      ctx.shadowBlur = 35; // Increased glow
      
      // Add rotating energy trails around the star
      for (let i = 0; i < 8; i++) {
        const trailAngle = spinAngle + (i * Math.PI / 4);
        const trailDistance = player.size * 0.8;
        const trailX = Math.cos(trailAngle) * trailDistance;
        const trailY = Math.sin(trailAngle) * trailDistance;
        
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = COLORS.starKill;
        ctx.beginPath();
        ctx.arc(trailX, trailY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.rotate(spinAngle); // Rotate
    // Golden gradient fill for star
    const outerR = player.size / 2;
    const innerR = player.size / 6;
    const grad = ctx.createRadialGradient(0, 0, innerR, 0, 0, outerR);
    grad.addColorStop(0, '#fff59d'); // light yellow
    grad.addColorStop(0.6, '#ffeb3b'); // rich yellow
    grad.addColorStop(1, '#fbc02d'); // golden
    ctx.fillStyle = grad;
    drawStar(ctx, 0, 0, 5, outerR, player.size / 4); // Draw star
    ctx.fill();
    // White outline to make the star pop
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.restore();
  }
}
