// input.js                                              // Keyboard input handling utilities
export function createInput() {                          // Creates and returns an object tracking key states
  const keys = {};                                       // Object mapping key names to boolean pressed states
  window.addEventListener('keydown', e => {              // Listen for key press events
    keys[e.key] = true;                                  // Mark the key as pressed (true)
  });                                                    // End keydown handler
  window.addEventListener('keyup', e => {                // Listen for key release events
    keys[e.key] = false;                                 // Mark the key as released (false)
  });                                                    // End keyup handler
  return keys;                                           // Return the live keys object to caller
}                                                        // End createInput
