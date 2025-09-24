
// bullets.js -- Handles bullet state and logic for pea shooter

// --- Array to hold all active bullets ---
export const bullets = [];

// --- Add a new bullet at (x, y) with velocity (vx, vy) ---
export function shootBullet(x, y, vx, vy) {
  bullets.push({ x, y, vx, vy, radius: 6 }); // radius is bullet size
}

// --- Update all bullets' positions and remove offscreen ones ---
export function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx;
    b.y += b.vy;
    // Remove bullet if it leaves the game area
    if (
      b.x < 0 || b.x > 1280 ||
      b.y < 0 || b.y > 720
    ) {
      bullets.splice(i, 1);
    }
  }
}
