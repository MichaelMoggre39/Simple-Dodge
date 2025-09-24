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

  // --- Draw pickups ---
  for (const p of gameState.pickups) {
    ctx.fillStyle = 'gold';
    ctx.beginPath();
    ctx.arc(p.x + p.size / 2, p.y + p.size / 2, p.size / 2, 0, Math.PI * 2);
    ctx.fill();
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
