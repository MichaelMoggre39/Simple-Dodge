
// shapes.js -- Shape helper drawing utilities

// --- Draws a star path (not filled here) ---
export function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) { // Draws a star shape
  let rot = Math.PI / 2 * 3; // Start angle (points upward)
  let x = cx; // Current x position
  let y = cy; // Current y position
  const step = Math.PI / spikes; // Angle between points

  ctx.beginPath(); // Start drawing
  ctx.moveTo(cx, cy - outerRadius); // Move to the top point
  for (let i = 0; i < spikes; i++) { // For each spike
    x = cx + Math.cos(rot) * outerRadius; // Outer point x
    y = cy + Math.sin(rot) * outerRadius; // Outer point y
    ctx.lineTo(x, y); // Draw line to outer point
    rot += step; // Move angle

    x = cx + Math.cos(rot) * innerRadius; // Inner point x
    y = cy + Math.sin(rot) * innerRadius; // Inner point y
    ctx.lineTo(x, y); // Draw line to inner point
    rot += step; // Move angle
  }
  ctx.lineTo(cx, cy - outerRadius); // Close path back to top
  ctx.closePath(); // Finish drawing
}
