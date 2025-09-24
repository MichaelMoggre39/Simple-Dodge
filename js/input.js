
// input.js -- Keyboard input handling utilities
// This file manages keyboard input and tracks which keys are pressed.

// --- Creates and returns an object tracking key states ---
export function createInput() {
  const keys = {}; // Object to store key states
  // Listen for key press events
  window.addEventListener('keydown', e => { // When a key is pressed
    keys[e.key] = true; // Mark key as pressed (including Shift)
  });
  // Listen for key release events
  window.addEventListener('keyup', e => { // When a key is released
    // Always clear both lowercase and uppercase versions to prevent stuck keys
    const key = e.key;
    if (typeof key === 'string' && key.length === 1) {
      keys[key.toLowerCase()] = false;
      keys[key.toUpperCase()] = false;
    } else {
      keys[key] = false;
    }
  });
  return keys; // Return the keys object
}
