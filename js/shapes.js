
// shapes.js -- Shape helper drawing utilities

// --- Draws a star path (not filled here) ---
export function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) { // Function to draw a star shape
  let rot = Math.PI / 2 * 3; // Start angle (points upward)
  let x = cx; // Current x position (initialized to center x)
  let y = cy; // Current y position (initialized to center y)
  const step = Math.PI / spikes; // Angle between each spike

  ctx.beginPath(); // Start a new path for the star
  ctx.moveTo(cx, cy - outerRadius); // Move to the top point of the star
  for (let i = 0; i < spikes; i++) { // Loop through each spike
    x = cx + Math.cos(rot) * outerRadius; // Calculate x for outer point
    y = cy + Math.sin(rot) * outerRadius; // Calculate y for outer point
    ctx.lineTo(x, y); // Draw line to the outer point
    rot += step; // Increment angle for next point

    x = cx + Math.cos(rot) * innerRadius; // Calculate x for inner point
    y = cy + Math.sin(rot) * innerRadius; // Calculate y for inner point
    ctx.lineTo(x, y); // Draw line to the inner point
    rot += step; // Increment angle for next spike
  }
  ctx.lineTo(cx, cy - outerRadius); // Draw line back to the top point to close the star
  ctx.closePath(); // Close the path to finish the star shape
}
