/**
 * Audio Manager - Handles all game music and sound effects
 * Supports background music, sound effects, volume control, and audio preloading
 */

// Import settings store
let settingsStore = null;

class AudioManager {
  constructor() {
    this.sounds = new Map();
    this.music = null;
    this.musicVolume = 0.5;
    this.sfxVolume = 0.7;
    this.masterVolume = 0.7;
    this.muted = false;
    this.initialized = false;

    // Subscribe to settings after module loads
    this.subscribeToSettings();
  }

  subscribeToSettings() {
    // Dynamic import to avoid circular dependencies
    import('../store/settingsStore.js').then((module) => {
      settingsStore = module.default;
      const settings = settingsStore.getState().settings.audio;
      
      this.masterVolume = settings.masterVolume / 100;
      this.musicVolume = settings.musicVolume / 100;
      this.sfxVolume = settings.sfxVolume / 100;
      this.muted = settings.muted;

      // Subscribe to future changes
      settingsStore.subscribe((state) => {
        const audio = state.settings.audio;
        this.masterVolume = audio.masterVolume / 100;
        this.musicVolume = audio.musicVolume / 100;
        this.sfxVolume = audio.sfxVolume / 100;
        this.muted = audio.muted;
        
        if (this.music) {
          this.music.volume = this.musicVolume * this.masterVolume;
          this.music.muted = this.muted;
        }
      });
    });
  }

  /**
   * Initialize audio context (call after user interaction)
   */
  init() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.initialized = true;
      console.log('🎵 Audio Manager initialized');
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }

  /**
   * Load a sound effect
   */
  async loadSound(name, url) {
    if (this.sounds.has(name)) return;

    try {
      const audio = new Audio(url);
      audio.volume = this.sfxVolume;
      audio.preload = 'auto';
      this.sounds.set(name, audio);
      console.log(`Loaded sound: ${name}`);
    } catch (error) {
      console.warn(`Failed to load sound ${name}:`, error);
    }
  }

  /**
   * Play a sound effect
   */
  playSound(name, options = {}) {
    if (this.muted || !this.initialized) return;

    const sound = this.sounds.get(name);
    if (!sound) {
      console.warn(`Sound not found: ${name}`);
      return;
    }

    const {
      volume = 1,
      loop = false,
      playbackRate = 1
    } = options;

    try {
      const clone = sound.cloneNode();
      clone.volume = this.sfxVolume * volume * this.masterVolume;
      clone.loop = loop;
      clone.playbackRate = playbackRate;
      clone.muted = this.muted;
      clone.play().catch(e => console.warn('Play failed:', e));
      
      return clone; // Return for manual control if needed
    } catch (error) {
      console.warn(`Failed to play sound ${name}:`, error);
    }
  }

  /**
   * Load and play background music
   */
  async playMusic(url, options = {}) {
    if (!url) return; // Skip if no URL provided
    
    this.stopMusic();

    const {
      volume = 1,
      loop = true,
      fadeIn = true
    } = options;

    try {
      this.music = new Audio(url);
      this.music.loop = loop;
      this.music.volume = fadeIn ? 0 : this.musicVolume * volume * this.masterVolume;
      this.music.muted = this.muted;
      
      await this.music.play();

      if (fadeIn) {
        this.fadeVolume(this.music, this.musicVolume * volume, 2000);
      }

      console.log('🎵 Music playing');
    } catch (error) {
      console.warn('Failed to play music:', error);
    }
  }

  /**
   * Stop background music
   */
  stopMusic(fadeOut = true) {
    if (!this.music) return;

    if (fadeOut) {
      this.fadeVolume(this.music, 0, 1000, () => {
        this.music.pause();
        this.music = null;
      });
    } else {
      this.music.pause();
      this.music = null;
    }
  }

  /**
   * Fade volume over time
   */
  fadeVolume(audio, targetVolume, duration, callback) {
    if (!audio) return;

    const startVolume = audio.volume;
    const startTime = Date.now();

    const fade = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      audio.volume = startVolume + (targetVolume - startVolume) * progress;

      if (progress < 1) {
        requestAnimationFrame(fade);
      } else if (callback) {
        callback();
      }
    };

    fade();
  }

  /**
   * Set music volume (0-1)
   */
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.music) {
      this.music.volume = this.musicVolume;
    }
  }

  /**
   * Set sound effects volume (0-1)
   */
  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Toggle mute
   */
  toggleMute() {
    this.muted = !this.muted;
    
    if (this.music) {
      this.music.muted = this.muted;
    }

    this.sounds.forEach(sound => {
      sound.muted = this.muted;
    });

    return this.muted;
  }

  /**
   * Stop all audio
   */
  stopAll() {
    this.stopMusic(false);
    this.sounds.forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });
  }

  /**
   * Generate a simple tone (for games without audio files)
   */
  playTone(frequency, duration, type = 'sine') {
    if (!this.initialized || this.muted) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Failed to play tone:', error);
    }
  }

  /**
   * Play a sequence of tones (melody)
   */
  playMelody(notes, tempo = 200) {
    if (!this.initialized || this.muted) return;

    let time = this.audioContext.currentTime;

    notes.forEach(({ frequency, duration = 0.2, type = 'sine' }) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(this.sfxVolume * 0.2, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + duration);

      oscillator.start(time);
      oscillator.stop(time + duration);

      time += tempo / 1000;
    });
  }
}

// Create singleton instance
const audioManager = new AudioManager();

// Background music tracks (disabled - add your own music files)
export const MusicTracks = {
  menu: null,
  gameplay: null,
  victory: null,
  arcade: null
};

// Export ready-to-use sound effects generators
export const Sounds = {
  // Game event sounds
  jump: () => audioManager.playTone(400, 0.1, 'square'),
  doubleJump: () => audioManager.playTone(500, 0.08, 'triangle'),
  collect: () => audioManager.playMelody([
    { frequency: 523, duration: 0.05 },
    { frequency: 659, duration: 0.05 },
    { frequency: 784, duration: 0.1 }
  ], 50),
  coin: () => audioManager.playMelody([
    { frequency: 988, duration: 0.05 },
    { frequency: 1319, duration: 0.1 }
  ], 30),
  powerUp: () => audioManager.playMelody([
    { frequency: 392, duration: 0.1 },
    { frequency: 523, duration: 0.1 },
    { frequency: 659, duration: 0.1 },
    { frequency: 784, duration: 0.2 }
  ], 100),
  hit: () => audioManager.playTone(100, 0.2, 'sawtooth'),
  hurt: () => audioManager.playTone(200, 0.15, 'triangle'),
  explosion: () => {
    audioManager.playTone(100, 0.3, 'sawtooth');
    setTimeout(() => audioManager.playTone(50, 0.2, 'square'), 100);
  },
  shoot: () => audioManager.playTone(220, 0.08, 'square'),
  laser: () => audioManager.playMelody([
    { frequency: 1000, duration: 0.03 },
    { frequency: 500, duration: 0.05 }
  ], 20),
  win: () => audioManager.playMelody([
    { frequency: 523, duration: 0.2 },
    { frequency: 659, duration: 0.2 },
    { frequency: 784, duration: 0.2 },
    { frequency: 1047, duration: 0.4 }
  ], 150),
  lose: () => audioManager.playMelody([
    { frequency: 392, duration: 0.3 },
    { frequency: 330, duration: 0.3 },
    { frequency: 262, duration: 0.5 }
  ], 200),
  levelUp: () => audioManager.playMelody([
    { frequency: 523, duration: 0.1 },
    { frequency: 659, duration: 0.1 },
    { frequency: 784, duration: 0.1 },
    { frequency: 1047, duration: 0.15 },
    { frequency: 1319, duration: 0.2 }
  ], 80),
  click: () => audioManager.playTone(800, 0.05, 'square'),
  hover: () => audioManager.playTone(600, 0.03, 'sine'),
  select: () => audioManager.playTone(1000, 0.06, 'triangle'),
  countdown: () => audioManager.playTone(600, 0.1, 'sine'),
  go: () => audioManager.playTone(800, 0.15, 'square'),
  start: () => audioManager.playMelody([
    { frequency: 523, duration: 0.1 },
    { frequency: 659, duration: 0.1 },
    { frequency: 784, duration: 0.2 }
  ], 80),
  pause: () => audioManager.playTone(440, 0.1, 'sine'),
  resume: () => audioManager.playTone(660, 0.1, 'sine'),
  checkpoint: () => audioManager.playMelody([
    { frequency: 659, duration: 0.1 },
    { frequency: 784, duration: 0.1 },
    { frequency: 988, duration: 0.15 }
  ], 70)
};

export default audioManager;
