// shapes.js                                                        // Shape helper drawing utilities
export function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) { // Draws a star path (not filled here)
  let rot = Math.PI / 2 * 3;                                        // Starting rotation angle (points upward)
  let x = cx;                                                       // Working X coordinate (initialized to center)
  let y = cy;                                                       // Working Y coordinate (initialized to center)
  const step = Math.PI / spikes;                                    // Angle step between outer/inner points

  ctx.beginPath();                                                  // Begin a new drawing path
  ctx.moveTo(cx, cy - outerRadius);                                 // Move to initial top point of star
  for (let i = 0; i < spikes; i++) {                                // Loop once per spike
    x = cx + Math.cos(rot) * outerRadius;                           // Compute outer point X
    y = cy + Math.sin(rot) * outerRadius;                           // Compute outer point Y
    ctx.lineTo(x, y);                                               // Draw line to outer point
    rot += step;                                                    // Advance angle by one step

    x = cx + Math.cos(rot) * innerRadius;                           // Compute inner point X
    y = cy + Math.sin(rot) * innerRadius;                           // Compute inner point Y
    ctx.lineTo(x, y);                                               // Draw line to inner point
    rot += step;                                                    // Advance angle again for next outer point
  }                                                                 // End loop
  ctx.lineTo(cx, cy - outerRadius);                                 // Close path back to top
  ctx.closePath();                                                  // Explicitly close the shape path
}                                                                   // End drawStar
