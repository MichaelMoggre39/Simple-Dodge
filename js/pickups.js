
// pickups.js -- Handles creation and collision of transformation pickups

// --- Create the starting set of pickups ---
export function createInitialPickups() { // This function creates the starting pickups
  // Arrange pickups in a horizontal row near the top
  const pickupY = 100; // Y position for all pickups
  const pickupSpacing = 200; // Space between pickups
  const pickupSize = 30; // Size of each pickup
  const startX = 340; // X position of the first pickup
  return [
    { x: startX, y: pickupY, size: pickupSize, type: 'circle' }, // Circle pickup
    { x: startX + pickupSpacing, y: pickupY, size: pickupSize, type: 'triangle' }, // Triangle pickup
    { x: startX + 2 * pickupSpacing, y: pickupY, size: pickupSize, type: 'star' }, // Star pickup
    // Portal on the right side, vertically centered
    { x: 1200, y: 335, size: 50, type: 'portal' } // Portal pickup
  ];
}

// --- Detect and handle collisions between player and pickups ---
export function checkPickupCollisions(player, pickups) { // This function checks if the player touches a pickup
  // Only allow transform change if player confirms
  if (!player.confirmingTransform) player.confirmingTransform = null; // Reset if not set
  let hovering = false; // Track if player is over a pickup
  for (let i = pickups.length - 1; i >= 0; i--) { // Go through all pickups backwards
    const p = pickups[i]; // Get the pickup
    if (p.type !== 'portal' && isColliding(player.x, player.y, player.size, p.x, p.y, p.size)) { // If player touches pickup
      hovering = true; // Player is over a pickup
      // If player presses Space, confirm transform
      if (player.keys && (player.keys[' '] || player.keys['Space'])) { // If space is pressed
        if (player.confirmingTransform !== p.type) { // If not already confirming
          player.currentShape = p.type; // Change player shape
          player.confirmingTransform = p.type; // Mark as confirming
        }
      }
      break; // Stop checking after first collision
    }
  }
  // Reset confirmingTransform if not hovering any pickup
  if (!hovering) player.confirmingTransform = null; // Reset if not over any pickup
}

// --- Helper: Axis-aligned bounding box overlap test ---
function isColliding(ax, ay, asize, bx, by, bsize) { // Checks if two squares overlap
  return (
    ax < bx + bsize && // a's left is left of b's right
    ax + asize > bx && // a's right is right of b's left
    ay < by + bsize && // a's top is above b's bottom
    ay + asize > by // a's bottom is below b's top
  );
}
