/**
 * INFINITE ROADS - Premium Standalone Driving Experience
 * 
 * The ULTIMATE chill driving game that DESTROYS slowroads.io
 * 
 * Features:
 * - 15+ Detailed Car Models with Real Stats
 * - 8 Biomes (Grassland, Desert, Forest, Snow, Coastal, Mountain, Canyon, Tropical)
 * - 6 Weather Types (Clear, Rain, Fog, Storm, Sunset, Night)
 * - Dynamic Day/Night Cycle with Realistic Lighting
 * - Car Customization (Colors, Rims, Exhaust, Spoilers)
 * - Multiple Camera Modes (Chase, Cinematic, Drone, First Person)
 * - Photo Mode with Filters
 * - Radio System with 5 Stations
 * - Achievements & Milestones
 * - Save/Load System
 * - Procedurally Generated Infinite World
 * - Traffic System with AI Cars
 * - Road Types (Highway, Mountain Pass, Coastal Road, Desert Highway)
 * - Weather Particle Effects (Rain, Snow, Leaves, Dust)
 * - Advanced Post-Processing (DOF, Bloom, Color Grading, Motion Blur)
 * - Performance Modes (Ultra, High, Medium, Low)
 */

import * as BABYLON from '@babylonjs/core';
import { CarManager } from './managers/CarManager';
import { WorldManager } from './managers/WorldManager';
import { WeatherManager, UIManager, AudioManager, CameraManager, TrafficManager, AchievementManager, SaveManager } from './managers/index';
import type { GameSettings, GameState } from './types';

export class InfiniteRoadsGame {
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  
  // Managers
  private carManager!: CarManager;
  private worldManager!: WorldManager;
  private weatherManager!: WeatherManager;
  private uiManager!: UIManager;
  private audioManager!: AudioManager;
  private cameraManager!: CameraManager;
  private trafficManager!: TrafficManager;
  private achievementManager!: AchievementManager;
  private saveManager!: SaveManager;
  
  // Game State
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private gameState: GameState;
  private settings: GameSettings;
  
  // Stats
  private distanceTraveled: number = 0;
  private timePlayed: number = 0;
  private topSpeed: number = 0;
  private currentSpeed: number = 0;
  
  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error('Container not found');

    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.outline = 'none';
    container.appendChild(this.canvas);

    // Initialize Babylon.js with optimal settings
    this.engine = new BABYLON.Engine(this.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
      powerPreference: 'high-performance',
      doNotHandleContextLost: true,
      audioEngine: true
    });
    
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.clearColor = new BABYLON.Color4(0.53, 0.81, 0.92, 1);
    
    // Default settings
    this.settings = this.loadSettings();
    this.gameState = this.loadGameState();
    
    this.initialize();
  }

  private async initialize(): Promise<void> {
    console.log('[InfiniteRoads] Initializing Premium Experience...');
    
    // Initialize all managers
    this.saveManager = new SaveManager();
    this.audioManager = new AudioManager(this.scene);
    this.worldManager = new WorldManager(this.scene, this.settings);
    this.weatherManager = new WeatherManager(this.scene);
    this.carManager = new CarManager(this.scene, this.gameState.selectedCar);
    this.cameraManager = new CameraManager(this.scene, this.canvas);
    this.trafficManager = new TrafficManager(this.scene);
    this.achievementManager = new AchievementManager();
    this.uiManager = new UIManager(this, this.settings);
    
    // Setup scene
    await this.setupScene();
    
    // Setup input handlers
    this.setupInput();
    
    // Start render loop
    this.engine.runRenderLoop(() => {
      if (this.isRunning && !this.isPaused) {
        const deltaTime = this.engine.getDeltaTime();
        this.update(deltaTime);
      }
      this.scene.render();
    });
    
    // Handle resize
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
    
    console.log('[InfiniteRoads] Initialization complete!');
  }

  private async setupScene(): Promise<void> {
    // Optimized lighting system
    const hemiLight = new BABYLON.HemisphericLight(
      'hemiLight',
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    hemiLight.intensity = 0.6;
    hemiLight.groundColor = new BABYLON.Color3(0.3, 0.3, 0.35);
    
    const sunLight = new BABYLON.DirectionalLight(
      'sunLight',
      new BABYLON.Vector3(-0.5, -1.5, -1),
      this.scene
    );
    sunLight.intensity = 1.2;
    sunLight.shadowMinZ = 1;
    sunLight.shadowMaxZ = 500;
    
    // Shadow generator for realism
    const shadowGenerator = new BABYLON.ShadowGenerator(2048, sunLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 64;
    shadowGenerator.depthScale = 50;
    shadowGenerator.darkness = 0.3;
    shadowGenerator.transparencyShadow = true;
    
    // Post-processing pipeline
    const pipeline = new BABYLON.DefaultRenderingPipeline(
      'defaultPipeline',
      true,
      this.scene,
      [this.cameraManager.getCamera()]
    );
    
    // Apply quality settings
    this.applyGraphicsSettings(pipeline);
    
    // Environment
    this.createEnvironment();
    
    // Initialize world
    await this.worldManager.initialize();
    
    // Initialize car
    await this.carManager.initialize();
    shadowGenerator.addShadowCaster(this.carManager.getCarMesh());
    
    // Initialize traffic
    await this.trafficManager.initialize();
    
    // Initialize weather
    this.weatherManager.setWeather(this.gameState.currentWeather);
    
    // Initialize camera
    this.cameraManager.setTarget(this.carManager.getCarMesh());
    this.cameraManager.setMode(this.gameState.cameraMode);
    
    // Initialize audio
    this.audioManager.playAmbient(this.gameState.currentBiome);
    if (this.gameState.radioEnabled) {
      this.audioManager.setRadioStation(this.gameState.radioStation);
    }
  }

  private createEnvironment(): void {
    // Skybox with gradient
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 10000 }, this.scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.7, 1.0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
    
    // Sun/Moon
    const sun = BABYLON.MeshBuilder.CreateSphere("sun", { diameter: 100 }, this.scene);
    sun.position = new BABYLON.Vector3(0, 500, -1000);
    const sunMat = new BABYLON.StandardMaterial("sunMat", this.scene);
    sunMat.emissiveColor = new BABYLON.Color3(1, 0.9, 0.7);
    sunMat.disableLighting = true;
    sun.material = sunMat;
    
    // Fog for atmosphere
    this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    this.scene.fogDensity = 0.0015;
    this.scene.fogColor = new BABYLON.Color3(0.85, 0.9, 0.95);
  }

  private applyGraphicsSettings(pipeline: BABYLON.DefaultRenderingPipeline): void {
    const quality = this.settings.graphicsQuality;
    
    switch (quality) {
      case 'ultra':
        pipeline.samples = 8;
        pipeline.fxaaEnabled = true;
        pipeline.bloomEnabled = true;
        pipeline.bloomThreshold = 0.6;
        pipeline.bloomWeight = 0.5;
        pipeline.bloomKernel = 128;
        pipeline.sharpenEnabled = true;
        pipeline.sharpen.edgeAmount = 0.5;
        pipeline.depthOfFieldEnabled = true;
        pipeline.depthOfFieldBlurLevel = BABYLON.DepthOfFieldEffectBlurLevel.High;
        pipeline.depthOfField.fStop = 1.4;
        pipeline.depthOfField.focalLength = 50;
        pipeline.depthOfField.focusDistance = 2000;
        pipeline.chromaticAberrationEnabled = true;
        pipeline.chromaticAberration.aberrationAmount = 30;
        pipeline.grainEnabled = true;
        pipeline.grain.intensity = 5;
        break;
        
      case 'high':
        pipeline.samples = 4;
        pipeline.fxaaEnabled = true;
        pipeline.bloomEnabled = true;
        pipeline.bloomThreshold = 0.7;
        pipeline.bloomWeight = 0.4;
        pipeline.bloomKernel = 64;
        pipeline.sharpenEnabled = true;
        pipeline.depthOfFieldEnabled = true;
        pipeline.depthOfFieldBlurLevel = BABYLON.DepthOfFieldEffectBlurLevel.Medium;
        break;
        
      case 'medium':
        pipeline.samples = 2;
        pipeline.fxaaEnabled = true;
        pipeline.bloomEnabled = true;
        pipeline.bloomThreshold = 0.8;
        pipeline.bloomWeight = 0.3;
        pipeline.bloomKernel = 32;
        break;
        
      case 'low':
        pipeline.samples = 1;
        pipeline.fxaaEnabled = true;
        break;
    }
  }

  private setupInput(): void {
    // Keyboard
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    
    // Mouse
    this.canvas.addEventListener('wheel', (e) => this.handleMouseWheel(e));
    
    // Touch
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
    this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    switch (e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        this.carManager.accelerate(true);
        break;
      case 's':
      case 'arrowdown':
        this.carManager.brake(true);
        break;
      case 'a':
      case 'arrowleft':
        this.carManager.steerLeft(true);
        break;
      case 'd':
      case 'arrowright':
        this.carManager.steerRight(true);
        break;
      case 'c':
        this.cameraManager.cycleMode();
        break;
      case 'h':
        this.carManager.toggleHeadlights();
        break;
      case 'n':
        this.weatherManager.cycleWeather();
        break;
      case 'b':
        this.worldManager.cycleBiome();
        break;
      case 'r':
        this.audioManager.nextRadioStation();
        break;
      case 'p':
        this.togglePhotoMode();
        break;
      case 'escape':
        this.togglePause();
        break;
      case 'm':
        this.uiManager.toggleMenu();
        break;
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    switch (e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        this.carManager.accelerate(false);
        break;
      case 's':
      case 'arrowdown':
        this.carManager.brake(false);
        break;
      case 'a':
      case 'arrowleft':
        this.carManager.steerLeft(false);
        break;
      case 'd':
      case 'arrowright':
        this.carManager.steerRight(false);
        break;
    }
  }

  private handleMouseWheel(e: WheelEvent): void {
    this.cameraManager.zoom(e.deltaY > 0 ? 1 : -1);
  }

  private handleTouchStart(e: TouchEvent): void {
    // Touch controls handled by UIManager
  }

  private handleTouchMove(e: TouchEvent): void {
    // Touch controls handled by UIManager
  }

  private handleTouchEnd(e: TouchEvent): void {
    // Touch controls handled by UIManager
  }

  private update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Update time
    this.timePlayed += dt;
    
    // Update car
    this.carManager.update(dt);
    this.currentSpeed = this.carManager.getSpeed();
    if (this.currentSpeed > this.topSpeed) {
      this.topSpeed = this.currentSpeed;
    }
    
    // Update distance
    this.distanceTraveled += (this.currentSpeed / 3.6) * dt; // km/h to m/s
    
    // Update world
    this.worldManager.update(dt, this.carManager.getPosition());
    
    // Update weather
    this.weatherManager.update(dt, this.carManager.getPosition());
    
    // Update camera
    this.cameraManager.update(dt);
    
    // Update traffic
    this.trafficManager.update(dt, this.carManager.getPosition());
    
    // Update audio
    this.audioManager.update(dt, this.currentSpeed);
    
    // Update UI
    this.uiManager.update(this.getGameInfo());
    
    // Check achievements
    this.checkAchievements();
    
    // Auto-save every 5 minutes
    if (this.timePlayed % 300 < dt) {
      this.save();
    }
  }

  private checkAchievements(): void {
    const achievements = [
      { id: 'distance_10km', check: () => this.distanceTraveled >= 10000 },
      { id: 'distance_100km', check: () => this.distanceTraveled >= 100000 },
      { id: 'speed_200', check: () => this.topSpeed >= 200 },
      { id: 'speed_300', check: () => this.topSpeed >= 300 },
      { id: 'time_1hour', check: () => this.timePlayed >= 3600 },
      { id: 'all_cars', check: () => this.gameState.unlockedCars.length >= 15 },
      { id: 'all_biomes', check: () => this.gameState.visitedBiomes.length >= 8 },
    ];
    
    achievements.forEach(achievement => {
      if (achievement.check() && !this.achievementManager.isUnlocked(achievement.id)) {
        this.achievementManager.unlock(achievement.id);
        this.uiManager.showAchievement(achievement.id);
      }
    });
  }

  private loadSettings(): GameSettings {
    const saved = this.saveManager.loadSettings();
    return saved || {
      graphicsQuality: 'high',
      musicVolume: 0.7,
      sfxVolume: 0.8,
      masterVolume: 1.0,
      motionBlur: true,
      vsync: true,
      showUI: true,
      showMinimap: true,
      cameraShake: true,
      cameraSmoothing: 0.8
    };
  }

  private loadGameState(): GameState {
    const saved = this.saveManager.loadGameState();
    return saved || {
      selectedCar: 'sedan_01',
      unlockedCars: ['sedan_01'],
      currentBiome: 'grassland',
      visitedBiomes: ['grassland'],
      currentWeather: 'clear',
      cameraMode: 'chase',
      radioEnabled: false,
      radioStation: 0,
      customization: {
        color: [0.9, 0.2, 0.2],
        rims: 'default',
        exhaust: 'stock',
        spoiler: false
      },
      statistics: {
        totalDistance: 0,
        totalTime: 0,
        topSpeed: 0,
        carsUnlocked: 1,
        biomesVisited: 1
      }
    };
  }

  private getGameInfo() {
    return {
      speed: Math.round(this.currentSpeed),
      distance: (this.distanceTraveled / 1000).toFixed(2),
      time: this.formatTime(this.timePlayed),
      car: this.carManager.getCarName(),
      biome: this.worldManager.getCurrentBiome(),
      weather: this.weatherManager.getCurrentWeather(),
      fps: Math.round(this.engine.getFps())
    };
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private togglePhotoMode(): void {
    this.isPaused = true;
    this.uiManager.openPhotoMode();
  }

  private togglePause(): void {
    this.isPaused = !this.isPaused;
    this.uiManager.togglePauseMenu();
  }

  public save(): void {
    this.gameState.statistics.totalDistance = this.distanceTraveled;
    this.gameState.statistics.totalTime = this.timePlayed;
    this.gameState.statistics.topSpeed = this.topSpeed;
    this.saveManager.saveGameState(this.gameState);
    console.log('[InfiniteRoads] Game saved!');
  }

  // Public API
  public start(): void {
    console.log('[InfiniteRoads] Starting game...');
    this.isRunning = true;
    this.isPaused = false;
    this.audioManager.play();
  }

  public pause(): void {
    this.isPaused = true;
    this.audioManager.pause();
  }

  public resume(): void {
    this.isPaused = false;
    this.audioManager.resume();
  }

  public stop(): void {
    this.isRunning = false;
    this.save();
    this.audioManager.stop();
  }

  public reset(): void {
    this.distanceTraveled = 0;
    this.timePlayed = 0;
    this.topSpeed = 0;
    this.worldManager.reset();
    this.carManager.reset();
  }

  public destroy(): void {
    this.stop();
    this.engine.stopRenderLoop();
    this.scene.dispose();
    this.engine.dispose();
    this.canvas.remove();
  }

  public changeCar(carId: string): void {
    this.carManager.changeCar(carId);
    this.gameState.selectedCar = carId;
  }

  public customizeCar(options: any): void {
    this.carManager.customize(options);
    this.gameState.customization = options;
  }

  public changeSettings(newSettings: Partial<GameSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveManager.saveSettings(this.settings);
    // Apply settings
    this.audioManager.setVolumes(this.settings);
  }
}
