
// input.js -- Keyboard input handling utilities

// --- Creates and returns an object tracking key states ---
export function createInput() {
  const keys = {};
  // Listen for key press events
  window.addEventListener('keydown', e => {
    keys[e.key] = true;
  });
  // Listen for key release events
  window.addEventListener('keyup', e => {
    keys[e.key] = false;
  });
  return keys;
}
