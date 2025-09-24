
// pickups.js -- Handles creation and collision of transformation pickups

// --- Create the starting set of pickups ---
export function createInitialPickups() {
  return [
    { x: 200, y: 150, size: 30, type: 'circle' },   // Circle form pickup
    { x: 600, y: 500, size: 30, type: 'triangle' },  // Triangle form pickup
    { x: 1000, y: 300, size: 30, type: 'star' }      // Star form pickup
  ];
}

// --- Detect and handle collisions between player and pickups ---
export function checkPickupCollisions(player, pickups) {
  for (let i = pickups.length - 1; i >= 0; i--) {
    const p = pickups[i];
    if (isColliding(player.x, player.y, player.size, p.x, p.y, p.size)) {
      player.currentShape = p.type; // Change the player's shape to pickup type
      // Pickup is not removed, so player can swap forms freely
    }
  }
}

// --- Helper: Axis-aligned bounding box overlap test ---
function isColliding(ax, ay, asize, bx, by, bsize) {
  return (
    ax < bx + bsize &&
    ax + asize > bx &&
    ay < by + bsize &&
    ay + asize > by
  );
}
