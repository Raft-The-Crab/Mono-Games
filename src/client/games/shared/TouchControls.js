// Mobile Touch Controls System
// Virtual D-pad, buttons, and gesture support for phones/tablets

export class TouchControls {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.container = canvas.parentElement;
        this.enabled = 'ontouchstart' in window;
        this.controls = new Map();
        this.activeTouch = new Map();

        // Options
        this.opacity = options.opacity || 0.6;
        this.size = options.size || 120;
        this.position = options.position || 'auto';
        this.haptics = options.haptics !== false;

        // Callbacks
        this.onInput = options.onInput || (() => { });

        // Create control UI
        this.createControlUI();
        this.setupEventListeners();
    }

    createControlUI() {
        // Main controls container
        this.controlsDiv = document.createElement('div');
        this.controlsDiv.id = 'touch-controls';
        this.controlsDiv.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 100;
      opacity: ${this.opacity};
    `;

        // Virtual D-Pad (Left side)
        this.createDPad();

        // Action Buttons (Right side)
        this.createActionButtons();

        // Pause Button (Top center)
        this.createPauseButton();

        this.container.appendChild(this.controlsDiv);

        // Hide on desktop
        if (!this.enabled) {
            this.controlsDiv.style.display = 'none';
        }
    }

    createDPad() {
        const dpad = document.createElement('div');
        dpad.className = 'virtual-dpad';
        dpad.style.cssText = `
      position: absolute;
      bottom: 30px;
      left: 30px;
      width: ${this.size}px;
      height: ${this.size}px;
      pointer-events: auto;
    `;

        // SVG D-Pad
        dpad.innerHTML = `
      <svg width="${this.size}" height="${this.size}" viewBox="0 0 120 120">
        <!-- Base Circle -->
        <circle cx="60" cy="60" r="58" fill="rgba(0,0,0,0.3)" stroke="#fff" stroke-width="2"/>
        
        <!-- Up Arrow -->
        <g id="dpad-up" data-direction="up">
          <path d="M 60 20 L 75 40 L 45 40 Z" fill="rgba(255,255,255,0.7)"/>
          <circle cx="60" cy="30" r="15" fill="transparent"/>
        </g>
        
        <!-- Down Arrow -->
        <g id="dpad-down" data-direction="down">
          <path d="M 60 100 L 75 80 L 45 80 Z" fill="rgba(255,255,255,0.7)"/>
          <circle cx="60" cy="90" r="15" fill="transparent"/>
        </g>
        
        <!-- Left Arrow -->
        <g id="dpad-left" data-direction="left">
          <path d="M 20 60 L 40 45 L 40 75 Z" fill="rgba(255,255,255,0.7)"/>
          <circle cx="30" cy="60" r="15" fill="transparent"/>
        </g>
        
        <!-- Right Arrow -->
        <g id="dpad-right" data-direction="right">
          <path d="M 100 60 L 80 45 L 80 75 Z" fill="rgba(255,255,255,0.7)"/>
          <circle cx="90" cy="60" r="15" fill="transparent"/>
        </g>
        
        <!-- Center Dot -->
        <circle cx="60" cy="60" r="12" fill="rgba(255,255,255,0.5)"/>
      </svg>
    `;

        this.controlsDiv.appendChild(dpad);
        this.controls.set('dpad', dpad);

        // Add touch handlers for each direction
        ['up', 'down', 'left', 'right'].forEach(dir => {
            const arrow = dpad.querySelector(`#dpad-${dir}`);
            this.addTouchHandler(arrow, () => this.handleDPad(dir));
        });
    }

    createActionButtons() {
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'action-buttons';
        buttonsContainer.style.cssText = `
      position: absolute;
      bottom: 30px;
      right: 30px;
      pointer-events: auto;
    `;

        // A Button
        const buttonA = this.createButton('A', '#4ECDC4', 'right: 0; bottom: 40px;');
        buttonsContainer.appendChild(buttonA);
        this.controls.set('buttonA', buttonA);

        // B Button
        const buttonB = this.createButton('B', '#FFD93D', 'right: 80px; bottom: 0;');
        buttonsContainer.appendChild(buttonB);
        this.controls.set('buttonB', buttonB);

        this.controlsDiv.appendChild(buttonsContainer);
    }

    createButton(label, color, position) {
        const button = document.createElement('div');
        button.className = `action-button button-${label.toLowerCase()}`;
        button.style.cssText = `
      position: absolute;
      ${position}
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${color};
      border: 3px solid #2C3E50;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Comic Sans MS', cursive;
      font-size: 24px;
      font-weight: 900;
      color: #2C3E50;
      box-shadow: 0 4px 0 #2C3E50;
      user-select: none;
      touch-action: none;
    `;
        button.textContent = label;

        this.addTouchHandler(button, () => this.handleButton(label));

        return button;
    }

    createPauseButton() {
        const pause = document.createElement('div');
        pause.className = 'pause-button';
        pause.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      pointer-events: auto;
    `;

        pause.innerHTML = `
      <svg width="50" height="50" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="23" fill="rgba(0,0,0,0.5)" stroke="#fff" stroke-width="2"/>
        <rect x="17" y="15" width="5" height="20" fill="#fff" rx="2"/>
        <rect x="28" y="15" width="5" height="20" fill="#fff" rx="2"/>
      </svg>
    `;

        this.addTouchHandler(pause, () => this.handleButton('pause'));
        this.controlsDiv.appendChild(pause);
        this.controls.set('pause', pause);
    }

    addTouchHandler(element, callback) {
        let touching = false;

        const start = (e) => {
            e.preventDefault();
            touching = true;
            element.style.transform = 'scale(0.9)';
            element.style.filter = 'brightness(1.2)';

            if (this.haptics && navigator.vibrate) {
                navigator.vibrate(10);
            }

            callback(true);
        };

        const end = (e) => {
            e.preventDefault();
            touching = false;
            element.style.transform = 'scale(1)';
            element.style.filter = 'brightness(1)';
            callback(false);
        };

        element.addEventListener('touchstart', start, { passive: false });
        element.addEventListener('touchend', end, { passive: false });
        element.addEventListener('touchcancel', end, { passive: false });

        // Mouse support for testing
        element.addEventListener('mousedown', start);
        element.addEventListener('mouseup', end);
        element.addEventListener('mouseleave', end);
    }

    handleDPad(direction) {
        const mapping = {
            up: { key: 'ArrowUp', x: 0, y: -1 },
            down: { key: 'ArrowDown', x: 0, y: 1 },
            left: { key: 'ArrowLeft', x: -1, y: 0 },
            right: { key: 'ArrowRight', x: 1, y: 0 }
        };

        const input = mapping[direction];
        this.onInput({ type: 'dpad', direction, ...input });
    }

    handleButton(button) {
        const mapping = {
            'A': { key: ' ', action: 'primary' },
            'B': { key: 'Escape', action: 'secondary' },
            'pause': { key: 'Escape', action: 'pause' }
        };

        const input = mapping[button];
        this.onInput({ type: 'button', button, ...input });
    }

    // Show/hide controls
    show() {
        this.controlsDiv.style.display = 'block';
    }

    hide() {
        this.controlsDiv.style.display = 'none';
    }

    // Customize appearance
    setOpacity(opacity) {
        this.opacity = opacity;
        this.controlsDiv.style.opacity = opacity;
    }

    setSize(size) {
        this.size = size;
        // Recreate controls with new size
        this.controlsDiv.innerHTML = '';
        this.createControlUI();
    }

    // Cleanup
    destroy() {
        this.controlsDiv.remove();
        this.controls.clear();
    }

    setupEventListeners() {
        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            // Adjust layout if needed
            setTimeout(() => this.adjustLayout(), 100);
        });
    }

    adjustLayout() {
        const isPortrait = window.innerHeight > window.innerWidth;

        if (isPortrait) {
            // Portrait mode - move controls closer to edges
            const dpad = this.controls.get('dpad');
            if (dpad) {
                dpad.style.bottom = '20px';
                dpad.style.left = '20px';
            }
        } else {
            // Landscape mode - standard positioning
            const dpad = this.controls.get('dpad');
            if (dpad) {
                dpad.style.bottom = '30px';
                dpad.style.left = '30px';
            }
        }
    }
}

export default TouchControls;
