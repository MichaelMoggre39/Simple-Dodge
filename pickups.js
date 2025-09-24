// pickups.js
export function createInitialPickups() {
  return [
    { x: 200, y: 150, size: 30, type: 'circle' },
    { x: 600, y: 500, size: 30, type: 'triangle' },
    { x: 1000, y: 300, size: 30, type: 'star' }
  ];
}

export function checkPickupCollisions(player, pickups) {
  function isColliding(ax, ay, asize, bx, by, bsize) {
    return ax < bx + bsize &&
           ax + asize > bx &&
           ay < by + bsize &&
           ay + asize > by;
  }

  for (let i = pickups.length - 1; i >= 0; i--) {
    const p = pickups[i];
    if (isColliding(player.x, player.y, player.size, p.x, p.y, p.size)) {
      player.currentShape = p.type;
      pickups.splice(i, 1);
    }
  }
}
