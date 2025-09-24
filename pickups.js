// pickups.js                                                         // Handles creation & collision of transformation pickups
export function createInitialPickups() {                              // Create the starting set of pickups
  return [                                                            // Return an array of pickup objects
    { x: 200, y: 150, size: 30, type: 'circle' },                     // Pickup that transforms player into a circle
    { x: 600, y: 500, size: 30, type: 'triangle' },                   // Pickup that transforms player into a triangle
    { x: 1000, y: 300, size: 30, type: 'star' }                       // Pickup that transforms player into a star
  ];                                                                  // End of array
}                                                                     // End createInitialPickups

export function checkPickupCollisions(player, pickups) {              // Detect and handle collisions between player and pickups
  function isColliding(ax, ay, asize, bx, by, bsize) {                // AABB (axis-aligned bounding box) overlap test
    return ax < bx + bsize &&                                         // Left edge of A is left of right edge of B
           ax + asize > bx &&                                         // Right edge of A is right of left edge of B
           ay < by + bsize &&                                         // Top edge of A is above bottom edge of B
           ay + asize > by;                                           // Bottom edge of A is below top edge of B
  }                                                                   // End isColliding

  for (let i = pickups.length - 1; i >= 0; i--) {                     // Iterate backwards so we can remove safely
    const p = pickups[i];                                             // Current pickup reference
    if (isColliding(player.x, player.y, player.size, p.x, p.y, p.size)) { // If player overlaps this pickup
      player.currentShape = p.type;                                   // Change the player's shape to pickup type
      pickups.splice(i, 1);                                           // Remove pickup from the array
    }                                                                 // End collision if
  }                                                                   // End for loop
}                                                                     // End checkPickupCollisions
