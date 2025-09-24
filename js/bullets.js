
// bullets.js -- Handles bullet state and logic for pea shooter

// --- Array to hold all active bullets ---
export const bullets = []; // This array stores all the bullets currently in the game

// --- Add a new bullet at (x, y) with velocity (vx, vy) ---
export function shootBullet(x, y, vx, vy) { // This function creates a new bullet
  bullets.push({ x, y, vx, vy, radius: 6 }); // Add a bullet object to the array (radius is bullet size)
}

// --- Update all bullets' positions and remove offscreen ones ---
export function updateBullets() { // This function updates all bullets every frame
  for (let i = bullets.length - 1; i >= 0; i--) { // Go through all bullets backwards
    const b = bullets[i]; // Get the bullet
    b.x += b.vx; // Move bullet horizontally
    b.y += b.vy; // Move bullet vertically
    // Remove bullet if it leaves the game area
    if (
      b.x < 0 || b.x > 1280 || // If bullet is off the left or right edge
      b.y < 0 || b.y > 720 // If bullet is off the top or bottom edge
    ) {
      bullets.splice(i, 1); // Remove the bullet from the array
    }
  }
}
