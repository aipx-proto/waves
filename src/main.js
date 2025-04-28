import "./style.css";
import { Waves } from "./components/Waves";

console.log("Main.js is loading...");

// Create container for waves
const container = document.createElement("div");
container.id = "waves-container";
container.style.cssText = `
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 300px;
  z-index: 1;
  background: transparent;
  overflow: hidden;
`;

document.body.appendChild(container);

// Set body background to black
document.body.style.background = "#262626";

console.log("Waves container created:", container);

// Initialize waves with custom configuration
const waves = new Waves({
  container,
  waves: [
    // Front wave - moves fastest and is most prominent
    {
      amplitude: 20,
      frequency: 0.01,
      speed: 0.02,
      color: "hsla(0, 0%, 40%, 0.2)",
      baseHeight: 0.85,
      verticalAmplitude: 8,
      parallaxFactor: 1.0,
    },
    // Middle wave - moderate movement
    {
      amplitude: 15,
      frequency: 0.008,
      speed: 0.015,
      color: "hsla(0, 0%, 30%, 0.2)",
      baseHeight: 0.7,
      verticalAmplitude: 12,
      parallaxFactor: 0.7,
    },
    // Back wave - slowest movement
    {
      amplitude: 12,
      frequency: 0.01,
      speed: 0.01,
      color: "hsla(0, 0%, 20%, 0.2)",
      baseHeight: 0.6,
      verticalAmplitude: 15,
      parallaxFactor: 0.4,
    },
  ],
});

console.log("Waves initialized:", waves);

// Remove any existing content
document.getElementById("app").innerHTML = "";

// Example of how to update wave parameters dynamically
// Uncomment to see waves change after 3 seconds
/*
setTimeout(() => {
  waves.setWaveParameters(0, {
    amplitude: 30,
    frequency: 0.03,
    speed: 0.06
  });
}, 3000);
*/
