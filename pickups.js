
// pickups.js -- Handles creation and collision of transformation pickups

// --- Create the starting set of pickups ---
export function createInitialPickups() {
  // Arrange pickups in a horizontal row near the top
  const pickupY = 100;
  const pickupSpacing = 200;
  const pickupSize = 30;
  const startX = 340;
  return [
    { x: startX, y: pickupY, size: pickupSize, type: 'circle' },
    { x: startX + pickupSpacing, y: pickupY, size: pickupSize, type: 'triangle' },
    { x: startX + 2 * pickupSpacing, y: pickupY, size: pickupSize, type: 'star' },
    // Portal on the right side, vertically centered
    { x: 1200, y: 335, size: 50, type: 'portal' }
  ];
}

// --- Detect and handle collisions between player and pickups ---
export function checkPickupCollisions(player, pickups) {
  // Only allow transform change if player confirms
  if (!player.confirmingTransform) player.confirmingTransform = null;
  let hovering = false;
  for (let i = pickups.length - 1; i >= 0; i--) {
    const p = pickups[i];
    if (p.type !== 'portal' && isColliding(player.x, player.y, player.size, p.x, p.y, p.size)) {
      hovering = true;
      // If player presses Space, confirm transform
      if (player.keys && (player.keys[' '] || player.keys['Space'])) {
        if (player.confirmingTransform !== p.type) {
          player.currentShape = p.type;
          player.confirmingTransform = p.type;
        }
      }
      break;
    }
  }
  // Reset confirmingTransform if not hovering any pickup
  if (!hovering) player.confirmingTransform = null;
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
