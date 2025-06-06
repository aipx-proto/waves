import "./style.css";
import { Waves } from "./components/Waves";
import { WaveControls } from "./components/WaveControls";

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
// document.body.style.background = "#262626";

console.log("Waves container created:", container);

// Initialize waves with custom configuration
const waves = new Waves({
  container,
  waves: [
    // Front wave - moves fastest and is most prominent
    {
      amplitude: 20,
      frequency: 0.004,
      speed: 0.02,
      color: "hsla(0, 0%, 40%, 0.2)",
      baseHeight: 0.9,
      verticalAmplitude: 8,
      parallaxFactor: 1,
    },
    // Middle wave - moves slower than front wave
    {
      amplitude: 15,
      frequency: 0.007,
      speed: 0.015,
      color: "hsla(0, 0%, 30%, 0.2)",
      baseHeight: 0.71,
      verticalAmplitude: 12,
      parallaxFactor: 0.7,
    },
    // Back wave - moves slowest and is least prominent
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

// Initialize wave controls
const waveControls = new WaveControls(waves);

// Remove any existing content
document.getElementById("app").innerHTML = "";
