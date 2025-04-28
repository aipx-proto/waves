// import './waves.css';

/**
 * Creates an animated wave background using Canvas.
 * Each wave layer can have its own properties for amplitude, speed, and movement.
 */
export class Waves {
  /**
   * Default configuration for a wave layer
   */
  static defaultWaveConfig = {
    amplitude: 20,         // Height of the wave
    frequency: 0.02,      // How many waves appear across the width
    phase: 0,             // Starting position offset
    speed: 0.05,         // How fast the wave moves
    color: 'rgba(33, 150, 243, 0.6)',
    baseHeight: 0.6,      // Vertical position in the container (0 = top, 1 = bottom)
    verticalAmplitude: 10, // How much the entire wave moves up and down
    verticalFreq: 0.02,   // Speed of vertical movement
    verticalPhase: 0,     // Vertical movement offset
    heightScale: 1.0,     // Overall height multiplier
    parallaxFactor: 1.0   // Movement speed relative to other layers (1 = fastest)
  };

  /**
   * @param {Object} options Configuration options
   * @param {HTMLElement} options.container The container element for the waves
   * @param {Array} options.waves Array of wave layer configurations
   */
  constructor(options = {}) {
    // Merge provided options with defaults
    this.options = {
      container: null,
      waves: [
        // Front wave
        {
          ...Waves.defaultWaveConfig,
          color: 'rgba(33, 150, 243, 0.6)',
          baseHeight: 0.75,
          parallaxFactor: 1.0
        },
        // Middle wave
        {
          ...Waves.defaultWaveConfig,
          amplitude: 15,
          frequency: 0.015,
          phase: 2,
          speed: 0.03,
          color: 'rgba(33, 150, 243, 0.4)',
          baseHeight: 0.65,
          verticalAmplitude: 15,
          parallaxFactor: 0.7
        },
        // Back wave
        {
          ...Waves.defaultWaveConfig,
          amplitude: 10,
          frequency: 0.01,
          phase: 4,
          speed: 0.02,
          color: 'rgba(33, 150, 243, 0.2)',
          baseHeight: 0.55,
          verticalAmplitude: 20,
          parallaxFactor: 0.4
        }
      ],
      ...options
    };

    this.init();
  }

  /**
   * Initialize the canvas and start the animation
   */
  init() {
    if (!this.options.container) {
      throw new Error('Container element is required');
    }

    console.log('Initializing waves with container:', this.options.container);

    // Setup canvas
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', {
      alpha: true  // Enable transparency
    });
    
    // Ensure canvas takes full container size
    this.canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: block;
    `;
    
    this.options.container.innerHTML = '';
    this.options.container.appendChild(this.canvas);

    console.log('Canvas created with size:', {
      width: this.canvas.width,
      height: this.canvas.height,
      styleWidth: this.canvas.style.width,
      styleHeight: this.canvas.style.height
    });

    // Handle window resizing
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Initialize animation timing
    this.time = 0;
    this.lastTime = performance.now();
    
    console.log('Starting animation loop');
    this.animate();
  }

  /**
   * Update canvas size to match container
   */
  resize() {
    const container = this.options.container;
    const rect = container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    
    console.log('Canvas resized:', {
      containerWidth: rect.width,
      containerHeight: rect.height,
      canvasWidth: this.canvas.width,
      canvasHeight: this.canvas.height
    });
  }

  /**
   * Calculate wave height variation using composite sine waves
   * @param {number} position Current wave position
   * @returns {number} Height variation multiplier
   */
  calculateHeightVariation(position) {
    return (
      Math.sin(position * 0.5) * 0.3 + // Slower wave with 30% influence
      Math.sin(position * 0.25) * 0.2   // Even slower wave with 20% influence
    );
  }

  /**
   * Draw a single wave layer
   * @param {Object} wave Wave configuration
   * @param {number} waveIndex Index of the wave layer
   */
  drawWave(wave, waveIndex) {
    const { 
      amplitude, frequency, phase, speed, color, baseHeight,
      verticalAmplitude, verticalFreq, verticalPhase, heightScale,
      parallaxFactor
    } = wave;
    
    const { width, height } = this.canvas;
    
    // Calculate vertical oscillation
    const verticalOffset = verticalAmplitude * Math.sin(
      (this.time * (verticalFreq || 0.02) * parallaxFactor) + (verticalPhase || 0)
    );

    // Begin drawing path
    this.ctx.beginPath();
    this.ctx.moveTo(0, height);

    // Draw wave points
    const steps = Math.ceil(width);
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * width;
      const wavePos = (x * frequency) + (this.time * speed * parallaxFactor) + (phase || 0);
      
      // Calculate wave height with simple sine wave
      const waveHeight = Math.sin(wavePos) * amplitude * (heightScale || 1.0);

      // Calculate final position
      const y = (height * baseHeight) + (verticalOffset * parallaxFactor) + waveHeight;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    // Complete the wave path
    this.ctx.lineTo(width, height);
    this.ctx.lineTo(0, height);
    this.ctx.closePath();

    // Fill the wave
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  /**
   * Main animation loop
   */
  animate = () => {
    // Calculate smooth delta time
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    // Update animation time
    this.time += deltaTime * 50;

    // Clear canvas completely
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw all waves from back to front
    [...this.options.waves].reverse().forEach((wave, reversedIndex) => {
      const waveIndex = this.options.waves.length - 1 - reversedIndex;
      this.drawWave(wave, waveIndex);
    });

    requestAnimationFrame(this.animate);
  }

  /**
   * Update parameters for a specific wave layer
   * @param {number} waveIndex Index of the wave to update
   * @param {Object} parameters New parameter values
   */
  setWaveParameters(waveIndex, parameters) {
    if (waveIndex >= 0 && waveIndex < this.options.waves.length) {
      this.options.waves[waveIndex] = {
        ...this.options.waves[waveIndex],
        ...parameters
      };
    }
  }

  /**
   * Replace all wave configurations
   * @param {Array} waves New wave configurations
   */
  setWaves(waves) {
    this.options.waves = waves;
  }
} 