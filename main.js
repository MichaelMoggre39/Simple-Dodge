// main.js (entry point)                                              // Initializes the game and starts the loop
import { createPlayer } from './player.js';                           // Player factory
import { createInitialPickups } from './pickups.js';                  // Pickup list factory
import { createInput } from './input.js';                             // Input tracking factory
import { createGame } from './gameLoop.js';                           // Game loop controller factory

const canvas = document.getElementById('gameCanvas');                 // Reference to the <canvas> element
const ctx = canvas.getContext('2d');                                  // 2D drawing context for rendering

function resizeCanvas() {                                             // Function to match canvas size to window
  canvas.width = window.innerWidth;                                   // Set canvas width to current viewport width
  canvas.height = window.innerHeight;                                 // Set canvas height to current viewport height
}                                                                     // End resizeCanvas
window.addEventListener('resize', resizeCanvas);                      // Update canvas when window is resized
resizeCanvas();                                                       // Perform initial size setup

const state = {                                                       // Central game state object
  player: createPlayer(),                                             // Player entity
  pickups: createInitialPickups(),                                    // Pickup entities array
  keys: createInput()                                                 // Live key state map
};                                                                    // End state object

const game = createGame(canvas, ctx, state);                          // Create game loop controller with dependencies
game.start();                                                         // Start the animation loop
