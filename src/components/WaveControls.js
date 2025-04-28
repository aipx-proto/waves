import "./WaveControls.css";

export class WaveControls {
  constructor(wavesInstance, onUpdate) {
    this.waves = wavesInstance;
    this.onUpdate = onUpdate;
    this.container = document.createElement("div");
    this.container.className = "wave-controls";
    this.currentWaveIndex = 0; // Track current wave index
    this.isVisible = false;
    this.init();
  }

  init() {
    // Create config button
    this.configButton = document.createElement("button");
    this.configButton.className = "config-button";
    this.configButton.textContent = "⚙";
    this.configButton.addEventListener("click", () => this.togglePanel());
    this.container.appendChild(this.configButton);

    // Create the main panel
    this.panel = document.createElement("div");
    this.panel.className = "control-panel";

    // Create panel header with close button
    const panelHeader = document.createElement("div");
    panelHeader.className = "panel-header";

    const closeButton = document.createElement("button");
    closeButton.className = "close-button";
    closeButton.textContent = "×";
    closeButton.addEventListener("click", () => this.togglePanel());
    panelHeader.appendChild(closeButton);

    this.panel.appendChild(panelHeader);

    // Add wave count control
    const waveCountControl = this.createWaveCountControl();
    this.panel.appendChild(waveCountControl);

    // Add wave layer selector
    const layerSelector = this.createLayerSelector();
    this.panel.appendChild(layerSelector);

    // Add controls container
    const controlsContainer = document.createElement("div");
    controlsContainer.className = "controls-container";
    this.panel.appendChild(controlsContainer);

    // Add JSON export button
    const exportButton = this.createExportButton();
    this.panel.appendChild(exportButton);

    // Add the panel to the container
    this.container.appendChild(this.panel);

    // Add to document
    document.body.appendChild(this.container);

    // Initialize controls for the first wave
    this.updateControls(0);
  }

  togglePanel() {
    this.isVisible = !this.isVisible;
    if (this.isVisible) {
      this.panel.classList.add("visible");
      this.configButton.classList.add("hidden");
    } else {
      this.panel.classList.remove("visible");
      this.configButton.classList.remove("hidden");
    }
  }

  createWaveCountControl() {
    const control = document.createElement("div");
    control.className = "control";

    const label = document.createElement("label");
    label.textContent = "Wave Count";

    const controlRow = document.createElement("div");
    controlRow.className = "control-row";

    const input = document.createElement("input");
    input.type = "number";
    input.min = 1;
    input.step = 1;
    input.value = this.waves.options.waves.length;
    input.className = "number-input";

    input.addEventListener("change", (e) => {
      const value = Math.max(parseInt(e.target.value) || 1, 1);
      input.value = value; // Ensure the input shows the valid value
      this.updateWaveCount(value);
    });

    controlRow.appendChild(input);
    control.appendChild(label);
    control.appendChild(controlRow);
    return control;
  }

  updateWaveCount(count) {
    const currentCount = this.waves.options.waves.length;
    if (count > currentCount) {
      // Add new waves
      for (let i = currentCount; i < count; i++) {
        const baseConfig = { ...this.waves.constructor.defaultWaveConfig };
        const newWave = {
          ...baseConfig,
          // Each new wave gets progressively smaller and slower
          amplitude: Math.max(5, baseConfig.amplitude - i * 1.5),
          frequency: Math.max(0.005, baseConfig.frequency - i * 0.001),
          speed: Math.max(0.005, baseConfig.speed - i * 0.002),
          // Gradually decrease opacity and move waves lower
          color: `rgba(128, 128, 128, ${Math.max(0.05, 0.3 - i * 0.02)})`,
          baseHeight: Math.max(0.1, 0.85 - i * 0.05),
          // Increase vertical movement slightly for back waves
          verticalAmplitude: Math.min(30, baseConfig.verticalAmplitude + i),
          // Decrease parallax effect for back waves
          parallaxFactor: Math.max(0.1, 1.0 - i * 0.08),
        };
        this.waves.options.waves.push(newWave);
      }
    } else if (count < currentCount) {
      // Remove waves from the end
      this.waves.options.waves = this.waves.options.waves.slice(0, count);
    }

    // Update layer selector
    const select = this.container.querySelector("select");
    const currentValue = parseInt(select.value);

    // Rebuild options
    select.innerHTML = "";
    this.waves.options.waves.forEach((_, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = `Layer ${index + 1}`;
      select.appendChild(option);
    });

    // Keep the same layer selected if it still exists, otherwise select the last layer
    const newSelectedValue = currentValue < count ? currentValue : count - 1;
    select.value = newSelectedValue;

    // Update controls for current layer
    this.updateControls(newSelectedValue);
  }

  createLayerSelector() {
    const selector = document.createElement("div");
    selector.className = "layer-selector";

    const label = document.createElement("label");
    label.textContent = "Wave Layer: ";

    const select = document.createElement("select");
    select.addEventListener("change", (e) => {
      this.currentWaveIndex = parseInt(e.target.value); // Update current wave index
      this.updateControls(this.currentWaveIndex);
    });

    // Add options for each wave layer
    this.waves.options.waves.forEach((_, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = `Layer ${index + 1}`;
      select.appendChild(option);
    });

    selector.appendChild(label);
    selector.appendChild(select);
    return selector;
  }

  createControl(label, type, value, min, max, step, onChange) {
    const control = document.createElement("div");
    control.className = "control";

    const labelEl = document.createElement("label");
    labelEl.textContent = label;
    control.appendChild(labelEl);

    const controlRow = document.createElement("div");
    controlRow.className = "control-row";

    if (type === "color") {
      // Create color and alpha controls
      const colorContainer = document.createElement("div");
      colorContainer.className = "color-controls";

      // Color picker
      const colorInput = document.createElement("input");
      colorInput.type = "color";
      colorInput.value = this.rgbaToHex(value);

      const updateColor = (e) => {
        const alpha = this.getAlphaFromColor(
          this.waves.options.waves[this.currentWaveIndex].color
        );
        const newColor = this.hexToRgba(e.target.value, alpha);
        onChange(newColor);
      };

      colorInput.addEventListener("input", updateColor);
      colorInput.addEventListener("change", updateColor);

      // Alpha slider
      const alphaInput = document.createElement("input");
      alphaInput.type = "range";
      alphaInput.min = 0;
      alphaInput.max = 1;
      alphaInput.step = 0.01;
      alphaInput.value = this.getAlphaFromColor(value);

      const alphaDisplay = document.createElement("span");
      alphaDisplay.className = "value-display";
      alphaDisplay.textContent = Number(alphaInput.value).toFixed(2);

      alphaInput.addEventListener("input", (e) => {
        const alphaValue = Number(e.target.value).toFixed(2);
        alphaDisplay.textContent = alphaValue;
        // Get the current color from the waves instance
        const currentColor =
          this.waves.options.waves[this.currentWaveIndex].color;
        const newColor = this.setAlphaInColor(
          currentColor,
          parseFloat(alphaValue)
        );
        onChange(newColor);
      });

      colorContainer.appendChild(colorInput);
      colorContainer.appendChild(alphaInput);
      colorContainer.appendChild(alphaDisplay);
      controlRow.appendChild(colorContainer);
    } else {
      const input = document.createElement("input");
      input.type = "range";
      input.min = min;
      input.max = max;
      input.step = step;
      input.value = value;

      const valueDisplay = document.createElement("span");
      valueDisplay.className = "value-display";

      // Format the display value based on the step size
      const formatValue = (val) => {
        const numVal = Number(val);
        if (step < 0.01) return numVal.toFixed(3);
        if (step < 1) return numVal.toFixed(2);
        return numVal.toString();
      };

      valueDisplay.textContent = formatValue(value);

      input.addEventListener("input", (e) => {
        const formattedValue = formatValue(e.target.value);
        valueDisplay.textContent = formattedValue;
        onChange(e.target.value);
      });

      controlRow.appendChild(input);
      controlRow.appendChild(valueDisplay);
    }

    control.appendChild(controlRow);
    return control;
  }

  createExportButton() {
    const button = document.createElement("button");
    button.className = "export-button";
    button.textContent = "Export Wave Config";
    button.addEventListener("click", () => {
      const config = JSON.stringify(this.waves.options.waves, null, 2);
      navigator.clipboard.writeText(config).then(() => {
        button.textContent = "Copied!";
        setTimeout(() => {
          button.textContent = "Export Wave Config";
        }, 2000);
      });
    });
    return button;
  }

  // Helper methods for color manipulation
  rgbaToHex(color) {
    // Handle HSLA format
    if (color.startsWith("hsla") || color.startsWith("hsl")) {
      const match = color.match(
        /hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)/
      );
      if (!match) return "#000000";

      const h = parseInt(match[1]) / 360;
      const s = parseInt(match[2]) / 100;
      const l = parseInt(match[3]) / 100;

      let r, g, b;
      if (s === 0) {
        r = g = b = l;
      } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = this.hueToRgb(p, q, h + 1 / 3);
        g = this.hueToRgb(p, q, h);
        b = this.hueToRgb(p, q, h - 1 / 3);
      }

      const toHex = (x) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      };

      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    // Handle RGBA format
    const match = color.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
    );
    if (!match) return "#000000";

    const r = parseInt(match[1]).toString(16).padStart(2, "0");
    const g = parseInt(match[2]).toString(16).padStart(2, "0");
    const b = parseInt(match[3]).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }

  hueToRgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  getAlphaFromColor(color) {
    if (!color) return 0.2; // Default alpha value

    // Handle HSLA/HSL
    if (color.startsWith("hsla") || color.startsWith("hsl")) {
      const match = color.match(/hsla?\(.*?(?:,\s*([\d.]+)\)|\))/);
      return match && match[1] ? parseFloat(match[1]) : 1;
    }

    // Handle RGBA/RGB
    const match = color.match(/rgba?\(.*?(?:,\s*([\d.]+)\)|\))/);
    return match && match[1] ? parseFloat(match[1]) : 1;
  }

  setAlphaInColor(color, alpha) {
    if (!color) return `rgba(128, 128, 128, ${alpha})`; // Default color with new alpha

    // Handle HSLA/HSL
    if (color.startsWith("hsla") || color.startsWith("hsl")) {
      const match = color.match(/hsla?\((.*?)(?:,\s*[\d.]+\)|\))/);
      return match
        ? `hsla(${match[1]}, ${alpha})`
        : `rgba(128, 128, 128, ${alpha})`;
    }

    // Handle RGBA/RGB
    const match = color.match(/rgba?\((.*?)(?:,\s*[\d.]+\)|\))/);
    return match
      ? `rgba(${match[1]}, ${alpha})`
      : `rgba(128, 128, 128, ${alpha})`;
  }

  updateControls(waveIndex) {
    this.currentWaveIndex = waveIndex; // Update current wave index
    const controlsContainer = this.container.querySelector(
      ".controls-container"
    );
    controlsContainer.innerHTML = "";

    const wave = this.waves.options.waves[waveIndex];
    const controls = [
      {
        label: "Amplitude",
        type: "range",
        value: wave.amplitude,
        min: 1,
        max: 50,
        step: 1,
        onChange: (value) =>
          this.waves.setWaveParameters(waveIndex, {
            amplitude: parseFloat(value),
          }),
      },
      {
        label: "Frequency",
        type: "range",
        value: wave.frequency,
        min: 0.001,
        max: 0.1,
        step: 0.001,
        onChange: (value) =>
          this.waves.setWaveParameters(waveIndex, {
            frequency: parseFloat(value),
          }),
      },
      {
        label: "Speed",
        type: "range",
        value: wave.speed,
        min: 0.001,
        max: 0.1,
        step: 0.001,
        onChange: (value) =>
          this.waves.setWaveParameters(waveIndex, { speed: parseFloat(value) }),
      },
      {
        label: "Base Height",
        type: "range",
        value: wave.baseHeight,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value) =>
          this.waves.setWaveParameters(waveIndex, {
            baseHeight: parseFloat(value),
          }),
      },
      {
        label: "Vertical Amplitude",
        type: "range",
        value: wave.verticalAmplitude,
        min: 0,
        max: 50,
        step: 1,
        onChange: (value) =>
          this.waves.setWaveParameters(waveIndex, {
            verticalAmplitude: parseFloat(value),
          }),
      },
      {
        label: "Color",
        type: "color",
        value: wave.color,
        onChange: (value) =>
          this.waves.setWaveParameters(waveIndex, { color: value }),
      },
    ];

    controls.forEach((control) => {
      const controlEl = this.createControl(
        control.label,
        control.type,
        control.value,
        control.min,
        control.max,
        control.step,
        control.onChange
      );
      controlsContainer.appendChild(controlEl);
    });
  }
}
