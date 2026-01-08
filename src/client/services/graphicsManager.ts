// Graphics Settings & Performance Manager

interface GraphicsSettings {
    quality: 'low' | 'medium' | 'high' | 'ultra';
    fpsLimit: number; // 0 = unlimited
    particles: boolean;
    shadows: boolean;
    antiAliasing: boolean;
    motionBlur: boolean;
    screenShake: boolean;
}

class GraphicsManager {
    private settings: GraphicsSettings;
    private fpsHistory: number[] = [];
    private lastFrameTime: number = 0;

    constructor() {
        this.settings = this.loadSettings();
    }

    // Load settings from localStorage
    private loadSettings(): GraphicsSettings {
        const stored = localStorage.getItem('graphicsSettings');
        if (stored) {
            return JSON.parse(stored);
        }

        // Auto-detect based on device
        return this.detectOptimalSettings();
    }

    // Auto-detect optimal settings
    private detectOptimalSettings(): GraphicsSettings {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isLowEnd = navigator.hardwareConcurrency <= 2;

        if (isMobile || isLowEnd) {
            return this.getPreset('low');
        } else if (navigator.hardwareConcurrency >= 8) {
            return this.getPreset('ultra');
        } else {
            return this.getPreset('medium');
        }
    }

    // Get preset settings
    getPreset(quality: 'low' | 'medium' | 'high' | 'ultra'): GraphicsSettings {
        const presets = {
            low: {
                quality: 'low' as const,
                fpsLimit: 30,
                particles: false,
                shadows: false,
                antiAliasing: false,
                motionBlur: false,
                screenShake: false
            },
            medium: {
                quality: 'medium' as const,
                fpsLimit: 60,
                particles: true,
                shadows: false,
                antiAliasing: false,
                motionBlur: false,
                screenShake: true
            },
            high: {
                quality: 'high' as const,
                fpsLimit: 120,
                particles: true,
                shadows: true,
                antiAliasing: true,
                motionBlur: false,
                screenShake: true
            },
            ultra: {
                quality: 'ultra' as const,
                fpsLimit: 0, // Unlimited!
                particles: true,
                shadows: true,
                antiAliasing: true,
                motionBlur: true,
                screenShake: true
            }
        };

        return presets[quality];
    }

    // Apply quality preset
    setQuality(quality: 'low' | 'medium' | 'high' | 'ultra') {
        this.settings = this.getPreset(quality);
        this.saveSettings();
    }

    // Set individual settings
    setSetting<K extends keyof GraphicsSettings>(key: K, value: GraphicsSettings[K]) {
        this.settings[key] = value;
        this.saveSettings();
    }

    // Get current settings
    getSettings(): GraphicsSettings {
        return { ...this.settings };
    }

    // Save to localStorage
    private saveSettings() {
        localStorage.setItem('graphicsSettings', JSON.stringify(this.settings));
    }

    // Check if frame should be rendered (FPS limiting)
    shouldRender(currentTime: number): boolean {
        if (this.settings.fpsLimit === 0) return true; // Unlimited FPS

        const targetFrameTime = 1000 / this.settings.fpsLimit;
        const delta = currentTime - this.lastFrameTime;

        if (delta >= targetFrameTime) {
            this.lastFrameTime = currentTime;
            return true;
        }

        return false;
    }

    // Track FPS for stats
    trackFrame(deltaTime: number) {
        const fps = 1000 / deltaTime;
        this.fpsHistory.push(fps);

        if (this.fpsHistory.length > 60) {
            this.fpsHistory.shift();
        }
    }

    // Get average FPS
    getAverageFPS(): number {
        if (this.fpsHistory.length === 0) return 0;
        const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.fpsHistory.length);
    }

    // Get current FPS
    getCurrentFPS(): number {
        if (this.fpsHistory.length === 0) return 0;
        return Math.round(this.fpsHistory[this.fpsHistory.length - 1]);
    }

    // Check if effect should be rendered
    shouldRenderParticles(): boolean {
        return this.settings.particles;
    }

    shouldRenderShadows(): boolean {
        return this.settings.shadows;
    }

    shouldUseAntiAliasing(): boolean {
        return this.settings.antiAliasing;
    }

    shouldUseMotionBlur(): boolean {
        return this.settings.motionBlur;
    }

    shouldUseScreenShake(): boolean {
        return this.settings.screenShake;
    }
}

export default new GraphicsManager();
