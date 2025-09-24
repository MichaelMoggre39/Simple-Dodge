// render.js
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';
import { drawStar } from './shapes.js';

export function render(ctx, canvas, gameState) {
  const { player, pickups } = gameState;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(1, '#2a5298');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Scaling
  const scaleX = canvas.width / GAME_WIDTH;
  const scaleY = canvas.height / GAME_HEIGHT;
  const scale = Math.min(scaleX, scaleY);
  const offsetX = (canvas.width / scale - GAME_WIDTH) / 2;
  const offsetY = (canvas.height / scale - GAME_HEIGHT) / 2;

  // Letterbox areas
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(0, 0, canvas.width, offsetY * scale);
  ctx.fillRect(0, canvas.height - offsetY * scale, canvas.width, offsetY * scale);
  ctx.fillRect(0, 0, offsetX * scale, canvas.height);
  ctx.fillRect(canvas.width - offsetX * scale, 0, offsetX * scale, canvas.height);

  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(offsetX, offsetY);

  // Border
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Pickups
  for (const p of pickups) {
    ctx.fillStyle = 'gold';
    ctx.beginPath();
    ctx.arc(p.x + p.size / 2, p.y + p.size / 2, p.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Player
  ctx.fillStyle = 'red';
  ctx.beginPath();
  if (player.currentShape === 'square') {
    ctx.fillRect(player.x, player.y, player.size, player.size);
  } else if (player.currentShape === 'circle') {
    ctx.arc(player.x + player.size / 2, player.y + player.size / 2, player.size / 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (player.currentShape === 'triangle') {
    ctx.moveTo(player.x + player.size / 2, player.y);
    ctx.lineTo(player.x, player.y + player.size);
    ctx.lineTo(player.x + player.size, player.y + player.size);
    ctx.closePath();
    ctx.fill();
  } else if (player.currentShape === 'star') {
    drawStar(ctx, player.x + player.size / 2, player.y + player.size / 2, 5, player.size / 2, player.size / 4);
    ctx.fill();
  }

  ctx.restore();
}
