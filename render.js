// render.js                                                             // Handles drawing the entire frame
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';               // Import logical world dimensions
import { drawStar } from './shapes.js';                                 // Import helper for star shape

export function render(ctx, canvas, gameState) {                        // Render a single frame to the canvas
  const { player, pickups } = gameState;                                // Destructure player and pickups from state
  ctx.clearRect(0, 0, canvas.width, canvas.height);                     // Clear previous frame pixels

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height); // Create background gradient object
  gradient.addColorStop(1, '#2a5298');                                  // Add a single color stop (solid fill effect)
  ctx.fillStyle = gradient;                                             // Set fill style to gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height);                      // Paint background rectangle

  const scaleX = canvas.width / GAME_WIDTH;                             // Horizontal scale factor from world -> screen
  const scaleY = canvas.height / GAME_HEIGHT;                           // Vertical scale factor from world -> screen
  const scale = Math.min(scaleX, scaleY);                               // Use smallest to preserve aspect ratio
  const offsetX = (canvas.width / scale - GAME_WIDTH) / 2;              // Horizontal letterbox offset (world units)
  const offsetY = (canvas.height / scale - GAME_HEIGHT) / 2;            // Vertical letterbox offset (world units)

  ctx.fillStyle = 'rgba(0,0,0,0.3)';                                    // Semi-transparent overlay color for letterboxes
  ctx.fillRect(0, 0, canvas.width, offsetY * scale);                    // Top letterbox bar
  ctx.fillRect(0, canvas.height - offsetY * scale, canvas.width, offsetY * scale); // Bottom letterbox bar
  ctx.fillRect(0, 0, offsetX * scale, canvas.height);                   // Left letterbox bar
  ctx.fillRect(canvas.width - offsetX * scale, 0, offsetX * scale, canvas.height); // Right letterbox bar

  ctx.save();                                                           // Save state before applying world transform
  ctx.scale(scale, scale);                                              // Scale drawing to fit viewport
  ctx.translate(offsetX, offsetY);                                      // Center the world inside the scaled space

  ctx.strokeStyle = 'black';                                            // Border stroke color
  ctx.lineWidth = 1;                                                    // Border thickness
  ctx.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);                        // Outline the logical game area

  for (const p of pickups) {                                            // Loop through each pickup to draw it
    ctx.fillStyle = 'gold';                                             // Fill color for pickup
    ctx.beginPath();                                                    // Start a new path for the circle
    ctx.arc(p.x + p.size / 2, p.y + p.size / 2, p.size / 2, 0, Math.PI * 2); // Draw circle centered in its square area
    ctx.fill();                                                         // Fill the circle
  }                                                                     // End pickups loop

  ctx.fillStyle = 'red';                                                // Base fill color for the player shapes
  ctx.beginPath();                                                      // Start path for shape (triangle/star need path)
  if (player.currentShape === 'square') {                               // If player is a square
    ctx.fillRect(player.x, player.y, player.size, player.size);         // Draw a filled square
  } else if (player.currentShape === 'circle') {                        // If player is a circle
    ctx.arc(player.x + player.size / 2,                                   // Center X of circle
            player.y + player.size / 2,                                   // Center Y of circle
            player.size / 2, 0, Math.PI * 2);                             // Radius and full circle angle
    ctx.fill();                                                         // Fill the circle path
  } else if (player.currentShape === 'triangle') {                      // If player is a triangle
    ctx.moveTo(player.x + player.size / 2, player.y);                   // Top vertex
    ctx.lineTo(player.x, player.y + player.size);                       // Bottom-left vertex
    ctx.lineTo(player.x + player.size, player.y + player.size);         // Bottom-right vertex
    ctx.closePath();                                                    // Close triangle path
    ctx.fill();                                                         // Fill triangle
  } else if (player.currentShape === 'star') {                          // If player is a star
    drawStar(ctx,                                                       // Drawing context
             player.x + player.size / 2,                                // Center X of star
             player.y + player.size / 2,                                // Center Y of star
             5,                                                         // Number of spikes
             player.size / 2,                                           // Outer radius
             player.size / 4);                                          // Inner radius
    ctx.fill();                                                         // Fill star shape
  }                                                                     // End shape conditional chain

  ctx.restore();                                                        // Restore pre-transform canvas state
}                                                                       // End render
