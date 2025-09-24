// render.js                                                             // Handles drawing the entire frame

import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';               // Import logical world dimensions
import { drawStar } from './shapes.js';                                 // Import helper for star shape
import { bullets } from './bullets.js';                                 // Import bullets array

// --- Helper: Calculate scale and offset for world-to-canvas transform ---
function getWorldTransform(canvas) {
  const scaleX = canvas.width / GAME_WIDTH;
  const scaleY = canvas.height / GAME_HEIGHT;
  const scale = Math.min(scaleX, scaleY);
  const offsetX = (canvas.width / scale - GAME_WIDTH) / 2;
  const offsetY = (canvas.height / scale - GAME_HEIGHT) / 2;
  return { scale, offsetX, offsetY };
}


export function render(ctx, canvas, gameState) {
  // --- Detect if player is over a pickup ---
  let hoveredPickup = null;
  for (const p of gameState.pickups) {
    if (p.type !== 'portal') {
      // Simple AABB collision
      if (
        gameState.player.x < p.x + p.size &&
        gameState.player.x + gameState.player.size > p.x &&
        gameState.player.y < p.y + p.size &&
        gameState.player.y + gameState.player.size > p.y
      ) {
        hoveredPickup = p;
        break;
      }
    }
  }
  // --- Clear previous frame ---
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // --- Draw background gradient ---
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(1, '#2a5298');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // --- Calculate world transform (scaling and letterboxing) ---
  const { scale, offsetX, offsetY } = getWorldTransform(canvas);

  // --- Draw letterbox bars (outside game area) ---
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(0, 0, canvas.width, offsetY * scale); // Top
  ctx.fillRect(0, canvas.height - offsetY * scale, canvas.width, offsetY * scale); // Bottom
  ctx.fillRect(0, 0, offsetX * scale, canvas.height); // Left
  ctx.fillRect(canvas.width - offsetX * scale, 0, offsetX * scale, canvas.height); // Right

  // --- Apply world transform ---
  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(offsetX, offsetY);

  // --- Draw game area border ---
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // --- Draw pickups and portal ---
  for (const p of gameState.pickups) {
    if (p.type === 'portal') {
      // Draw portal as a glowing blue square
      ctx.save();
      ctx.shadowColor = '#00f6ff';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#00bfff';
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.restore();
      // Optionally, draw a label
      ctx.save();
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('START', p.x + p.size / 2, p.y + p.size + 22);
      ctx.restore();
    } else {
      ctx.fillStyle = 'gold';
      ctx.beginPath();
      ctx.arc(p.x + p.size / 2, p.y + p.size / 2, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- Draw info box if hovering a pickup ---
  if (hoveredPickup) {
    let info = '';
    if (hoveredPickup.type === 'circle') {
      info = 'Circle: Dash with Left Click. Fast movement burst.';
    } else if (hoveredPickup.type === 'triangle') {
      info = 'Triangle: Aim with mouse, shoot with click.';
    } else if (hoveredPickup.type === 'star') {
      info = 'Star: Spin attack with Left Click. Invulnerable while spinning.';
    }
    // Draw info box higher above the pickup
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = '#222';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
  const boxWidth = 380;
  // Use smaller font for info text
  ctx.font = '20px Arial';
  const infoLineHeight = 26;
  const promptPadding = 18;
  const promptHeight = 24;
  const lines = wrapTextLines(ctx, info, boxWidth - 30);
  const boxHeight = 32 + lines.length * infoLineHeight + promptPadding + promptHeight + 16; // 32 top pad, 16 bottom pad
    // Calculate world transform for clamping
    const { scale, offsetX, offsetY } = (typeof getWorldTransform === 'function') ? getWorldTransform(canvas) : { scale: 1, offsetX: 0, offsetY: 0 };
    let boxX = hoveredPickup.x + hoveredPickup.size / 2 - boxWidth / 2;
    // Clamp boxX to stay within world bounds
    boxX = Math.max(0, Math.min(boxX, GAME_WIDTH - boxWidth));
    // Add more vertical space between box and pickup
    const boxY = Math.max(10, hoveredPickup.y - boxHeight - 60); // 60px gap
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    const centerX = boxX + boxWidth / 2;
    // Draw info text lines (smaller font, wrapped)
    lines.forEach((line, i) => {
      ctx.fillText(line, centerX, boxY + 40 + i * infoLineHeight);
    });
    // Draw prompt with extra padding below info text
    ctx.font = '20px Arial';
    ctx.fillStyle = '#0ff';
    ctx.fillText('Press SPACE to confirm this transform', centerX, boxY + 40 + lines.length * infoLineHeight + promptPadding);
    ctx.restore();
  }

// --- Helper: Word wrap for info box ---
function wrapTextLines(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());
  return lines;
}

  // --- Draw player (supports multiple shapes) ---
  drawPlayer(ctx, gameState.player);

  // --- Draw all bullets ---
  ctx.fillStyle = 'lime';
  for (const b of bullets) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore(); // Restore to pre-transform state
}

// --- Helper: Draw the player in its current shape ---
function drawPlayer(ctx, player) {
  ctx.fillStyle = 'red';
  ctx.beginPath();
  if (player.currentShape === 'square') {
    // Draw a filled square
    ctx.fillRect(player.x, player.y, player.size, player.size);
  } else if (player.currentShape === 'circle') {
    // Draw a filled circle
    ctx.arc(player.x + player.size / 2, player.y + player.size / 2, player.size / 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (player.currentShape === 'triangle') {
    // Draw a triangle pointing in aim direction
    ctx.save();
    ctx.translate(player.x + player.size / 2, player.y + player.size / 2);
    ctx.rotate(player.aimAngle || 0);
    ctx.beginPath();
    ctx.moveTo(player.size / 2, 0); // Tip (front)
    ctx.lineTo(-player.size / 2, -player.size / 2); // Back left
    ctx.lineTo(-player.size / 2, player.size / 2); // Back right
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else if (player.currentShape === 'star') {
    // Draw a spinning star
    ctx.save();
    ctx.translate(player.x + player.size / 2, player.y + player.size / 2);
    let spinAngle = 0;
    if (player.spinning && player.spinTime > 0) {
      // Spin angle based on remaining spinTime (full spin in 15 frames)
      spinAngle = (2 * Math.PI) * (1 - player.spinTime / 15);
    }
    ctx.rotate(spinAngle);
    drawStar(ctx, 0, 0, 5, player.size / 2, player.size / 4);
    ctx.fill();
    ctx.restore();
  }
}
