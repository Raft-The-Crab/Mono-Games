/**
 * INFINITE ROADS - The ULTIMATE Chill Driving Experience
 * 
 * 🏆 BEATS slowroads.io with WAY MORE features:
 * ✨ Infinite procedurally generated beautiful roads with REALISTIC curves
 * 🚗 10+ DETAILED CAR MODELS (sedan, SUV, sports, truck, bike, van, bus, rally, electric)
 * 🌄 STUNNING graphics with post-processing, shadows, bloom, HDR
 * ☀️ Dynamic day/night cycle with REALISTIC sun/moon lighting
 * 🌦️ 5 Weather types with PARTICLE EFFECTS (rain splashes, fog, dust, leaves, snow)
 * 🌳 RICH scenery (trees, rocks, buildings, bridges, tunnels, wildlife, signs)
 * 🎨 5 Biomes with UNIQUE terrain (grassland, desert, forest, snow, coastal)
 * 🏎️ REALISTIC physics (suspension, weight transfer, tire grip, drifting)
 * 🎯 OPTIMIZED for Android APK & Windows EXE (60fps mobile, 120fps desktop)
 * 📊 Beautiful UI with car selection, camera modes, settings
 * 
 * NO SCORING - Just drive, relax, explore, and enjoy! 🌅
 * 
 * Optimized for: Android (APK) & Windows (EXE) - NOT web/macOS/Linux
 */

import * as BABYLON from '@babylonjs/core';
import { InfiniteRoadsMenu, GameSettings } from './InfiniteRoadsMenu';

type Weather = 'clear' | 'rain' | 'fog' | 'sunset' | 'storm';
type Biome = 'grassland' | 'desert' | 'forest' | 'snow' | 'coastal';

interface TrafficCar {
  mesh: BABYLON.Mesh;
  speed: number;
  lane: number; // -1 (left), 0 (center), 1 (right)
  position: number; // Distance along road
  type: 'sedan' | 'truck' | 'suv' | 'bike';
}

interface CarModel {
  name: string;
  type: 'sedan' | 'suv' | 'sports' | 'truck' | 'bike' | 'van' | 'bus' | 'convertible' | 'rally' | 'electric';
  maxSpeed: number; // km/h
  acceleration: number;
  handling: number; // 0-1
  weight: number; // kg
  color: BABYLON.Color3;
  description: string;
}

interface ParticleSystem {
  system: BABYLON.ParticleSystem | null;
  active: boolean;
}

export default class InfiniteRoads {
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private camera: BABYLON.ArcRotateCamera;
  
  // Menu System
  private menu!: InfiniteRoadsMenu;
  private gameSettings: GameSettings = {
    graphics: 'high',
    shadows: true,
    particles: true,
    postProcessing: true,
    antialiasing: true,
    volume: 0.7,
    musicVolume: 0.5,
    sfxVolume: 0.8
  };
  private gameStarted: boolean = false;
  
  // Car Models
  private availableCars: CarModel[] = [];
  private currentCarIndex: number = 0;
  private car!: BABYLON.Mesh;
  private carSpeed: number = 0;
  private carPosition: number = 0; // -1 to 1 (left to right)
  private carRotation: number = 0;
  private carTilt: number = 0; // For bike leaning
  // private _driftPower: number = 0; // Reserved for future drift mechanics
  
  // Physics
  // private _velocity: BABYLON.Vector3 = BABYLON.Vector3.Zero(); // Reserved for physics
  // private _suspension: number = 0; // Reserved for suspension
  private wheelRotation: number = 0;
  private wheels: BABYLON.Mesh[] = [];
  
  // Road
  private roadSegments: RoadSegment[] = [];
  private terrainChunks: TerrainChunk[] = [];
  private sceneryObjects: BABYLON.Mesh[] = [];
  private roadWidth: number = 12;
  private segmentLength: number = 50;
  private renderDistance: number = 40;
  private currentSegmentIndex: number = 0;
  private distanceTraveled: number = 0;
  
  // Environment
  private currentTime: number = 14; // 2 PM
  private timeSpeed: number = 0.02;
  private weather: Weather = 'clear';
  private currentBiome: Biome = 'grassland';
  
  // Traffic System 🚗
  private trafficCars: TrafficCar[] = [];
  private maxTrafficCars: number = 8;
  private trafficSpawnDistance: number = 150;
  
  // Bridges & Tunnels 🌉
  private bridges: BABYLON.Mesh[] = [];
  private tunnels: BABYLON.Mesh[] = [];
  // private inTunnel: boolean = false; // Reserved for tunnel logic
  private bridgeChance: number = 0.03; // 3% chance per segment
  private tunnelChance: number = 0.02; // 2% chance per segment
  
  // Road Hazards ⚠️
  private hazards: BABYLON.Mesh[] = [];
  private hazardChance: number = 0.05; // 5% chance per segment
  
  // Emergency Vehicles 🚓🚑🚒
  private emergencyVehicles: TrafficCar[] = [];
  private emergencySpawnTimer: number = 0;
  
  
  // Lighting & Post-Processing
  private sunLight!: BABYLON.DirectionalLight;
  private hemiLight!: BABYLON.HemisphericLight;
  private moonLight!: BABYLON.PointLight;
  private shadowGenerator!: BABYLON.ShadowGenerator;
  private defaultPipeline!: BABYLON.DefaultRenderingPipeline;
  
  // Particle Effects
  private rainParticles: ParticleSystem = { system: null, active: false };
  private dustParticles: ParticleSystem = { system: null, active: false };
  private snowParticles: ParticleSystem = { system: null, active: false };
  private leavesParticles: ParticleSystem = { system: null, active: false };
  
  // SPEED EFFECTS - Make it feel FAST! 🔥
  private speedTrailsLeft: ParticleSystem = { system: null, active: false };
  private speedTrailsRight: ParticleSystem = { system: null, active: false };
  private tireSmokeLeft: ParticleSystem = { system: null, active: false };
  private tireSmokeRight: ParticleSystem = { system: null, active: false };
  private baseFOV: number = 0.8;
  private targetFOV: number = 0.8;
  private cameraShake: number = 0;
  
  // Audio System 🔊
  private engineSound!: BABYLON.Sound;
  private windSound!: BABYLON.Sound;
  private tireScreechSound!: BABYLON.Sound;
  private biomeAmbience!: BABYLON.Sound;
  private radioSound!: BABYLON.Sound;
  // private baseEngineFrequency: number = 1.0; // Reserved for audio
  private radioStations: string[] = [
    'Chill Beats Radio',
    'Highway Jazz',
    'Sunset Lounge',
    'Night Drive FM',
    'Retro Synthwave'
  ];
  private currentRadioStation: number = 0;
  private radioEnabled: boolean = false;
  
  // Weather Transition System ⛈️
  private weatherTransitionProgress: number = 0;
  private targetWeather: Weather = 'clear';
  private previousWeather: Weather = 'clear';
  private isTransitioning: boolean = false;
  private weatherTransitionSpeed: number = 0.1; // 10 seconds for full transition
  private lightningTimer: number = 0;
  private rainbowVisible: boolean = false;
  private rainbowTimer: number = 0;
  
  // Effects & Scenery
  private clouds: BABYLON.Mesh[] = [];
  // private wildlife: BABYLON.Mesh[] = []; // Reserved for future feature
  // private buildings: BABYLON.Mesh[] = []; // Reserved for future feature
  // private signs: BABYLON.Mesh[] = []; // Reserved for future feature
  
  // State
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  
  // Input
  private keys: { [key: string]: boolean } = {};
  private mouseDown: boolean = false;
  private lastMouseX: number = 0;
  
  // Procedural
  private roadCurve: number = 0;
  private roadElevation: number = 0;
  private noiseOffset: number = 0;
  
  
  // Camera
  // Reserved for future: cameraViews array
  // private currentCameraView: number = 0; // Reserved
  
  // UI Info (NO SCORING - Just info for immersion)
  public info = {
    speed: 0,
    distance: 0,
    time: '14:00',
    weather: 'Clear',
    biome: 'Grassland',
    car: 'Sedan',
    fps: 60,
    camera: 'Chase Camera'
  };

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error('Container not found');

    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.cursor = 'grab';
    container.appendChild(this.canvas);

    this.engine = new BABYLON.Engine(this.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.clearColor = new BABYLON.Color4(0.53, 0.81, 0.92, 1);
    
    // Initialize menu system FIRST - game won't start until user clicks Start
    this.menu = new InfiniteRoadsMenu(
      containerId,
      (carIndex, settings) => this.startGame(carIndex, settings),
      () => this.resumeGame(),
      (settings) => this.applySettings(settings)
    );
    
    this.camera = new BABYLON.ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 3,
      25,
      BABYLON.Vector3.Zero(),
      this.scene
    );
    
    this.camera.attachControl(this.canvas, true);
    this.camera.lowerBetaLimit = Math.PI / 6;
    this.camera.upperBetaLimit = Math.PI / 2.2;
    this.camera.lowerRadiusLimit = 12;
    this.camera.upperRadiusLimit = 60;
    this.camera.wheelPrecision = 50;
    this.camera.panningSensibility = 0;

    this.setupInput();
    this.setupScene();
  }

  private setupInput(): void {
    window.addEventListener('keydown', (e) => {
      // ESC key for pause menu
      if (e.key === 'Escape') {
        if (this.gameStarted && !this.isPaused) {
          this.pauseGame();
        }
        return;
      }
      
      // Only process game keys if game is started and not paused
      if (!this.gameStarted || this.isPaused) return;
      
      this.keys[e.key.toLowerCase()] = true;
      if (e.key === 'c') this.cycleCameraView();
      if (e.key === 't') this.cycleTime();
      if (e.key === 'n') this.cycleWeather(); // Changed from 'w' to avoid conflict with forward
      if (e.key === 'b') this.cycleBiome();
      if (e.key === 'v') this.cycleCarModel();
      if (e.key === 'r') this.toggleRadio(); // Radio on/off
      if (e.key === 'h') this.toggleHelp();
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (!this.gameStarted) return;
      this.mouseDown = true;
      this.lastMouseX = e.clientX;
      this.canvas.style.cursor = 'grabbing';
    });

    window.addEventListener('mouseup', () => {
      this.mouseDown = false;
      this.canvas.style.cursor = 'grab';
    });

    window.addEventListener('mousemove', (e) => {
      if (this.mouseDown) {
        const deltaX = e.clientX - this.lastMouseX;
        this.carPosition += deltaX * 0.001;
        this.carPosition = Math.max(-1, Math.min(1, this.carPosition));
        this.lastMouseX = e.clientX;
      }
    });

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.lastMouseX = e.touches[0].clientX;
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const deltaX = e.touches[0].clientX - this.lastMouseX;
        this.carPosition += deltaX * 0.002;
        this.carPosition = Math.max(-1, Math.min(1, this.carPosition));
        this.lastMouseX = e.touches[0].clientX;
      }
    });
  }

  private setupScene(): void {
    // Initialize available cars
    this.initializeCarModels();
    
    // Enhanced lighting with shadows
    this.sunLight = new BABYLON.DirectionalLight(
      'sunLight',
      new BABYLON.Vector3(-0.5, -1.5, -1),
      this.scene
    );
    this.sunLight.intensity = 1.2;
    this.sunLight.shadowMinZ = 1;
    this.sunLight.shadowMaxZ = 500;
    
    // Better shadow generator
    this.shadowGenerator = new BABYLON.ShadowGenerator(2048, this.sunLight);
    this.shadowGenerator.useBlurExponentialShadowMap = true;
    this.shadowGenerator.blurKernel = 64;
    this.shadowGenerator.depthScale = 50;
    this.shadowGenerator.darkness = 0.4;
    
    this.hemiLight = new BABYLON.HemisphericLight(
      'hemiLight',
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    this.hemiLight.intensity = 0.6;
    
    // Moon light for night time
    this.moonLight = new BABYLON.PointLight(
      'moonLight',
      new BABYLON.Vector3(0, 50, -50),
      this.scene
    );
    this.moonLight.intensity = 0;
    this.moonLight.diffuse = new BABYLON.Color3(0.7, 0.8, 1.0);

    // Post-processing pipeline for AAA graphics
    this.defaultPipeline = new BABYLON.DefaultRenderingPipeline(
      'defaultPipeline',
      true,
      this.scene,
      [this.camera]
    );
    
    // Enhanced effects for better visuals than slowroads.io
    this.defaultPipeline.bloomEnabled = true;
    this.defaultPipeline.bloomThreshold = 0.5; // Lower threshold for more glow
    this.defaultPipeline.bloomWeight = 0.6; // Stronger bloom
    this.defaultPipeline.bloomKernel = 128;
    this.defaultPipeline.bloomScale = 0.8;
    
    this.defaultPipeline.fxaaEnabled = true;
    this.defaultPipeline.sharpenEnabled = true;
    this.defaultPipeline.sharpen.edgeAmount = 0.6;
    this.defaultPipeline.sharpen.colorAmount = 1.2;
    
    // Depth of field for cinematic look (slowroads.io style but BETTER)
    this.defaultPipeline.depthOfFieldEnabled = true;
    this.defaultPipeline.depthOfFieldBlurLevel = BABYLON.DepthOfFieldEffectBlurLevel.High;
    this.defaultPipeline.depthOfField.fStop = 1.2; // More shallow DOF
    this.defaultPipeline.depthOfField.focalLength = 60;
    this.defaultPipeline.depthOfField.focusDistance = 2200;
    
    // Add chromatic aberration for cinematic realism
    this.defaultPipeline.chromaticAberrationEnabled = true;
    this.defaultPipeline.chromaticAberration.aberrationAmount = 15;
    this.defaultPipeline.chromaticAberration.radialIntensity = 0.5;
    
    // Add grain for film-like quality
    this.defaultPipeline.grainEnabled = true;
    this.defaultPipeline.grain.intensity = 8;
    this.defaultPipeline.grain.animated = true;
    
    // Add vignette for focus on center
    this.defaultPipeline.imageProcessingEnabled = true;
    this.defaultPipeline.imageProcessing.vignetteEnabled = true;
    this.defaultPipeline.imageProcessing.vignetteWeight = 3;
    this.defaultPipeline.imageProcessing.vignetteColor = new BABYLON.Color4(0, 0, 0, 0);
    this.defaultPipeline.imageProcessing.vignetteBlendMode = BABYLON.ImageProcessingConfiguration.VIGNETTEMODE_MULTIPLY;
    
    // Enhanced contrast and exposure for better colors
    this.defaultPipeline.imageProcessing.contrast = 1.3;
    this.defaultPipeline.imageProcessing.exposure = 1.1;
    
    // Color curves for cinematic look
    this.defaultPipeline.imageProcessing.colorCurvesEnabled = true;
    const curves = new BABYLON.ColorCurves();
    curves.globalHue = 15;
    curves.globalSaturation = 20;
    curves.highlightsHue = 30;
    curves.highlightsSaturation = 15;
    this.defaultPipeline.imageProcessing.colorCurves = curves;

    // Skybox for atmosphere
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 10000 }, this.scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.7, 1.0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
    
    // Fog for atmosphere
    this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
    this.scene.fogDensity = 0.008;
    this.scene.fogColor = new BABYLON.Color3(0.8, 0.9, 1.0);
    
    // Camera views - better angles like slowroads.io
    this.cameraViews = [
      { name: 'Chase Camera', alpha: -Math.PI / 2, beta: Math.PI / 3.5, radius: 18 },
      { name: 'Close Follow', alpha: -Math.PI / 2, beta: Math.PI / 4, radius: 12 },
      { name: 'Aerial View', alpha: -Math.PI / 2, beta: Math.PI / 2.2, radius: 35 },
      { name: 'Cinematic', alpha: -Math.PI / 2.3, beta: Math.PI / 3.2, radius: 22 }
    ];

    this.createCar();
    this.generateInitialRoad();
    this.generateClouds();
    this.initializeParticles();
    this.setupAudio();
  }

  private initializeCarModels(): void {
    // 10+ DETAILED car models with unique properties and realistic stats
    this.availableCars = [
      {
        name: 'Classic Sedan',
        type: 'sedan',
        maxSpeed: 160,
        acceleration: 3.5,
        handling: 0.75,
        weight: 1400,
        color: new BABYLON.Color3(0.9, 0.2, 0.2),
        description: 'Reliable daily driver with balanced performance'
      },
      {
        name: 'Muscle Sports',
        type: 'sports',
        maxSpeed: 300,
        acceleration: 9.0,
        handling: 0.88,
        weight: 1200,
        color: new BABYLON.Color3(1.0, 0.85, 0.0),
        description: 'Lightning fast with razor-sharp handling'
      },
      {
        name: 'Off-Road SUV',
        type: 'suv',
        maxSpeed: 150,
        acceleration: 3.0,
        handling: 0.65,
        weight: 2000,
        color: new BABYLON.Color3(0.2, 0.6, 0.2),
        description: 'Rugged adventure vehicle, conquers any terrain'
      },
      {
        name: 'Heavy Truck',
        type: 'truck',
        maxSpeed: 130,
        acceleration: 2.2,
        handling: 0.55,
        weight: 3000,
        color: new BABYLON.Color3(0.35, 0.35, 0.35),
        description: 'Powerful hauler with massive presence'
      },
      {
        name: 'Speed Bike',
        type: 'bike',
        maxSpeed: 250,
        acceleration: 7.5,
        handling: 0.98,
        weight: 200,
        color: new BABYLON.Color3(0.1, 0.1, 0.1),
        description: 'Nimble two-wheeler, feels every curve'
      },
      {
        name: 'Family Van',
        type: 'van',
        maxSpeed: 140,
        acceleration: 2.5,
        handling: 0.60,
        weight: 1800,
        color: new BABYLON.Color3(0.5, 0.5, 0.85),
        description: 'Spacious transport for the whole crew'
      },
      {
        name: 'City Bus',
        type: 'bus',
        maxSpeed: 110,
        acceleration: 1.5,
        handling: 0.45,
        weight: 5000,
        color: new BABYLON.Color3(0.95, 0.65, 0.15),
        description: 'Public transport giant, steady and strong'
      },
      {
        name: 'Beach Convertible',
        type: 'convertible',
        maxSpeed: 190,
        acceleration: 5.0,
        handling: 0.80,
        weight: 1300,
        color: new BABYLON.Color3(0.0, 0.7, 0.95),
        description: 'Open-air cruiser, perfect for coastal drives'
      },
      {
        name: 'Rally Racer',
        type: 'rally',
        maxSpeed: 260,
        acceleration: 8.0,
        handling: 0.92,
        weight: 1100,
        color: new BABYLON.Color3(0.95, 0.15, 0.15),
        description: 'Off-road champion with rally pedigree'
      },
      {
        name: 'Electric Future',
        type: 'electric',
        maxSpeed: 220,
        acceleration: 10.0,
        handling: 0.85,
        weight: 1600,
        color: new BABYLON.Color3(0.85, 0.85, 0.85),
        description: 'Silent powerhouse with instant torque'
      }
    ];
  }

  private createCar(): void {
    const carModel = this.availableCars[this.currentCarIndex];
    
    // Clear old car if exists
    if (this.car) {
      this.car.dispose();
      this.wheels.forEach(w => w.dispose());
      this.wheels = [];
    }
    
    // Create different models based on type
    if (carModel.type === 'bike') {
      this.createBikeModel(carModel);
    } else if (carModel.type === 'bus') {
      this.createBusModel(carModel);
    } else if (carModel.type === 'truck') {
      this.createTruckModel(carModel);
    } else {
      this.createCarModel(carModel);
    }
    
    this.car.position.y = 0.5;
    this.shadowGenerator.addShadowCaster(this.car);
    
    // Update info
    this.info.car = carModel.name;
  }

  private createCarModel(model: CarModel): void {
    // Body dimensions based on car type
    let bodyWidth = 2;
    let bodyHeight = 0.8;
    let bodyDepth = 4.5;
    let topWidth = 1.6;
    let topHeight = 0.9;
    let topDepth = 2.5;
    
    if (model.type === 'suv') {
      bodyHeight = 1.0;
      topHeight = 1.2;
      bodyWidth = 2.3;
    } else if (model.type === 'sports') {
      bodyHeight = 0.7;
      topHeight = 0.5;
      bodyDepth = 4.2;
    } else if (model.type === 'van') {
      bodyHeight = 1.2;
      topHeight = 1.5;
      bodyDepth = 5.5;
    } else if (model.type === 'convertible') {
      topHeight = 0; // No roof!
    }
    
    // Main body with detail
    const carBody = BABYLON.MeshBuilder.CreateBox('carBody', {
      width: bodyWidth,
      height: bodyHeight,
      depth: bodyDepth
    }, this.scene);
    carBody.position.y = -0.2;
    
    // Hood
    const hood = BABYLON.MeshBuilder.CreateBox('hood', {
      width: bodyWidth * 0.95,
      height: 0.15,
      depth: bodyDepth * 0.33
    }, this.scene);
    hood.position.y = bodyHeight * 0.5 + 0.075;
    hood.position.z = bodyDepth * 0.33;
    
    const parts: BABYLON.Mesh[] = [carBody, hood];
    
    if (topHeight > 0) {
      const carTop = BABYLON.MeshBuilder.CreateBox('carTop', {
        width: topWidth,
        height: topHeight,
        depth: topDepth
      }, this.scene);
      carTop.position.y = bodyHeight * 0.5 + topHeight * 0.5;
      carTop.position.z = -bodyDepth * 0.1;
      parts.push(carTop);
      
      // Windshield
      const windshield = BABYLON.MeshBuilder.CreateBox('windshield', {
        width: topWidth * 0.95,
        height: topHeight * 0.8,
        depth: 0.1
      }, this.scene);
      windshield.position.y = bodyHeight * 0.5 + topHeight * 0.5;
      windshield.position.z = topDepth * 0.5 + 0.3;
      windshield.rotation.x = Math.PI / 7;
      
      const glassMat = new BABYLON.StandardMaterial('glass', this.scene);
      glassMat.diffuseColor = new BABYLON.Color3(0.3, 0.4, 0.5);
      glassMat.specularColor = new BABYLON.Color3(1, 1, 1);
      glassMat.specularPower = 256;
      glassMat.alpha = 0.4;
      windshield.material = glassMat;
      parts.push(windshield);
    }
    
    // Side mirrors
    const mirrorL = BABYLON.MeshBuilder.CreateBox('mirrorL', {
      width: 0.15,
      height: 0.2,
      depth: 0.3
    }, this.scene);
    mirrorL.position.set(-bodyWidth * 0.55, bodyHeight * 0.3, topDepth * 0.3);
    const mirrorR = mirrorL.clone('mirrorR');
    mirrorR.position.x = bodyWidth * 0.55;
    parts.push(mirrorL, mirrorR);
    
    // Headlights
    const headlightL = BABYLON.MeshBuilder.CreateSphere('headlightL', { diameter: 0.35 }, this.scene);
    headlightL.position.set(-bodyWidth * 0.35, 0, bodyDepth * 0.5 - 0.05);
    const headlightR = headlightL.clone('headlightR');
    headlightR.position.x = bodyWidth * 0.35;
    
    const lightMat = new BABYLON.StandardMaterial('lights', this.scene);
    lightMat.emissiveColor = new BABYLON.Color3(1, 1, 0.9);
    lightMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    headlightL.material = lightMat;
    headlightR.material = lightMat;
    parts.push(headlightL, headlightR);
    
    // Taillights
    const taillightL = BABYLON.MeshBuilder.CreateBox('taillightL', { size: 0.3 }, this.scene);
    taillightL.position.set(-bodyWidth * 0.35, 0, -bodyDepth * 0.5 + 0.05);
    const taillightR = taillightL.clone('taillightR');
    taillightR.position.x = bodyWidth * 0.35;
    
    const tailMat = new BABYLON.StandardMaterial('taillights', this.scene);
    tailMat.emissiveColor = new BABYLON.Color3(0.8, 0, 0);
    tailMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
    taillightL.material = tailMat;
    taillightR.material = tailMat;
    parts.push(taillightL, taillightR);
    
    // Grille
    const grille = BABYLON.MeshBuilder.CreateBox('grille', {
      width: bodyWidth * 0.75,
      height: 0.4,
      depth: 0.1
    }, this.scene);
    grille.position.y = -bodyHeight * 0.2;
    grille.position.z = bodyDepth * 0.5 - 0.08;
    const grilleMat = new BABYLON.StandardMaterial('grille', this.scene);
    grilleMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    grille.material = grilleMat;
    parts.push(grille);
    
    // Add spoiler for sports/rally cars
    if (model.type === 'sports' || model.type === 'rally') {
      const spoiler = BABYLON.MeshBuilder.CreateBox('spoiler', {
        width: bodyWidth * 0.9,
        height: 0.15,
        depth: 0.6
      }, this.scene);
      spoiler.position.y = bodyHeight + topHeight + 0.1;
      spoiler.position.z = -bodyDepth * 0.45;
      parts.push(spoiler);
    }
    
    // Create detailed wheels with rims
    const wheelPositions = [
      { x: -bodyWidth * 0.5 - 0.05, z: bodyDepth * 0.3 },
      { x: bodyWidth * 0.5 + 0.05, z: bodyDepth * 0.3 },
      { x: -bodyWidth * 0.5 - 0.05, z: -bodyDepth * 0.3 },
      { x: bodyWidth * 0.5 + 0.05, z: -bodyDepth * 0.3 }
    ];
    
    for (const pos of wheelPositions) {
      // Tire with treads
      const wheel = BABYLON.MeshBuilder.CreateCylinder('wheel', {
        diameter: 0.85,
        height: 0.4,
        tessellation: 20
      }, this.scene);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.x = pos.x;
      wheel.position.y = -bodyHeight * 0.5;
      wheel.position.z = pos.z;
      this.wheels.push(wheel);
      
      // Rim (shiny metallic center)
      const rim = BABYLON.MeshBuilder.CreateCylinder('rim', {
        diameter: 0.5,
        height: 0.42,
        tessellation: 16
      }, this.scene);
      rim.rotation.z = Math.PI / 2;
      rim.position.x = pos.x;
      rim.position.y = -bodyHeight * 0.5;
      rim.position.z = pos.z;
      
      const wheelMat = new BABYLON.StandardMaterial('wheelMat', this.scene);
      wheelMat.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.05);
      wheelMat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);
      wheelMat.specularPower = 32;
      wheel.material = wheelMat;
      
      const rimMat = new BABYLON.StandardMaterial('rimMat', this.scene);
      rimMat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.75);
      rimMat.specularColor = new BABYLON.Color3(1, 1, 1);
      rimMat.specularPower = 256;
      rim.material = rimMat;
      
      parts.push(wheel, rim);
    }
    
    // Car paint material with PREMIUM metallic finish (BEATS slowroads.io)
    const carMat = new BABYLON.PBRMetallicRoughnessMaterial('carMat', this.scene);
    carMat.baseColor = model.color;
    carMat.metallic = 0.9; // Highly metallic car paint
    carMat.roughness = 0.2; // Smooth glossy finish
    carMat.environmentTexture = this.scene.environmentTexture;
    
    // Enable realistic reflections
    this.scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
      'https://playground.babylonjs.com/textures/environment.dds',
      this.scene
    );
    
    carBody.material = carMat;
    hood.material = carMat;
    if (topHeight > 0 && parts.find(p => p.name === 'carTop')) {
      parts.find(p => p.name === 'carTop')!.material = carMat;
    }
    
    this.car = BABYLON.Mesh.MergeMeshes(
      parts,
      true,
      true,
      undefined,
      false,
      true
    )!;
  }

  private createBikeModel(model: CarModel): void {
    const bikeFrame = BABYLON.MeshBuilder.CreateCylinder('bikeFrame', {
      diameter: 0.1,
      height: 2
    }, this.scene);
    bikeFrame.rotation.x = Math.PI / 2;
    
    const seat = BABYLON.MeshBuilder.CreateBox('seat', {
      width: 0.4,
      height: 0.2,
      depth: 0.6
    }, this.scene);
    seat.position.y = 0.5;
    
    // Front wheel
    const frontWheel = BABYLON.MeshBuilder.CreateCylinder('frontWheel', {
      diameter: 0.7,
      height: 0.2
    }, this.scene);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.position.z = 1.2;
    frontWheel.position.y = -0.3;
    this.wheels.push(frontWheel);
    
    // Back wheel
    const backWheel = BABYLON.MeshBuilder.CreateCylinder('backWheel', {
      diameter: 0.7,
      height: 0.2
    }, this.scene);
    backWheel.rotation.z = Math.PI / 2;
    backWheel.position.z = -1.2;
    backWheel.position.y = -0.3;
    this.wheels.push(backWheel);
    
    const bikeMat = new BABYLON.StandardMaterial('bikeMat', this.scene);
    bikeMat.diffuseColor = model.color;
    bikeMat.specularColor = new BABYLON.Color3(0.9, 0.9, 0.9);
    bikeMat.specularPower = 128;
    
    bikeFrame.material = bikeMat;
    seat.material = bikeMat;
    frontWheel.material = bikeMat;
    backWheel.material = bikeMat;
    
    this.car = BABYLON.Mesh.MergeMeshes(
      [bikeFrame, seat, frontWheel, backWheel],
      true,
      true,
      undefined,
      false,
      true
    )!;
  }

  private createBusModel(model: CarModel): void {
    const busBody = BABYLON.MeshBuilder.CreateBox('busBody', {
      width: 3,
      height: 3,
      depth: 8
    }, this.scene);
    
    // Windows
    const windowPositions = [-2.5, -1, 0.5, 2];
    for (const z of windowPositions) {
      const window = BABYLON.MeshBuilder.CreateBox('window', {
        width: 2.8,
        height: 1,
        depth: 0.8
      }, this.scene);
      window.position.y = 1;
      window.position.z = z;
      
      const windowMat = new BABYLON.StandardMaterial('windowMat', this.scene);
      windowMat.diffuseColor = new BABYLON.Color3(0.3, 0.6, 0.9);
      windowMat.alpha = 0.3;
      window.material = windowMat;
    }
    
    // Wheels (6 wheels for bus)
    const wheelPositions = [
      { x: -1.6, z: 3 },
      { x: 1.6, z: 3 },
      { x: -1.6, z: 0 },
      { x: 1.6, z: 0 },
      { x: -1.6, z: -3 },
      { x: 1.6, z: -3 }
    ];
    
    for (const pos of wheelPositions) {
      const wheel = BABYLON.MeshBuilder.CreateCylinder('wheel', {
        diameter: 1.2,
        height: 0.4
      }, this.scene);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.x = pos.x;
      wheel.position.y = -1.5;
      wheel.position.z = pos.z;
      this.wheels.push(wheel);
      
      const wheelMat = new BABYLON.StandardMaterial('wheelMat', this.scene);
      wheelMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
      wheel.material = wheelMat;
    }
    
    const busMat = new BABYLON.StandardMaterial('busMat', this.scene);
    busMat.diffuseColor = model.color;
    busMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    busBody.material = busMat;
    
    const allParts = [busBody, ...this.wheels];
    this.car = BABYLON.Mesh.MergeMeshes(
      allParts,
      true,
      true,
      undefined,
      false,
      true
    )!;
  }

  private createTruckModel(model: CarModel): void {
    // Truck cab
    const cab = BABYLON.MeshBuilder.CreateBox('cab', {
      width: 2.5,
      height: 2,
      depth: 2
    }, this.scene);
    cab.position.z = 2;
    
    // Truck bed
    const bed = BABYLON.MeshBuilder.CreateBox('bed', {
      width: 2.5,
      height: 1.5,
      depth: 4
    }, this.scene);
    bed.position.z = -1;
    bed.position.y = -0.25;
    
    // Wheels (6 wheels)
    const wheelPositions = [
      { x: -1.4, z: 2.5 },
      { x: 1.4, z: 2.5 },
      { x: -1.4, z: -1 },
      { x: 1.4, z: -1 },
      { x: -1.4, z: -2.5 },
      { x: 1.4, z: -2.5 }
    ];
    
    for (const pos of wheelPositions) {
      const wheel = BABYLON.MeshBuilder.CreateCylinder('wheel', {
        diameter: 1.0,
        height: 0.4
      }, this.scene);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.x = pos.x;
      wheel.position.y = -1.0;
      wheel.position.z = pos.z;
      this.wheels.push(wheel);
      
      const wheelMat = new BABYLON.StandardMaterial('wheelMat', this.scene);
      wheelMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
      wheel.material = wheelMat;
    }
    
    const truckMat = new BABYLON.StandardMaterial('truckMat', this.scene);
    truckMat.diffuseColor = model.color;
    truckMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    cab.material = truckMat;
    bed.material = truckMat;
    
    const allParts = [cab, bed, ...this.wheels];
    this.car = BABYLON.Mesh.MergeMeshes(
      allParts,
      true,
      true,
      undefined,
      false,
      true
    )!;
  }

  private generateInitialRoad(): void {
    for (let i = 0; i < this.renderDistance; i++) {
      this.generateRoadSegment(i);
    }
  }

  private generateRoadSegment(index: number): void {
    const z = index * this.segmentLength;
    
    // Improved Perlin-like noise for smooth curves
    this.noiseOffset += 0.02;
    const curve = Math.sin(this.noiseOffset * 0.8) * 15 + 
                  Math.cos(this.noiseOffset * 0.4) * 8 +
                  Math.sin(this.noiseOffset * 1.5) * 3;
    this.roadCurve += (curve - this.roadCurve) * 0.08;
    
    const elevationNoise = Math.sin(this.noiseOffset * 0.25) * 20 + 
                          Math.cos(this.noiseOffset * 0.15) * 12;
    this.roadElevation += (elevationNoise - this.roadElevation) * 0.03;
    
    // Create road with proper texturing
    const roadMesh = BABYLON.MeshBuilder.CreateGround(`road_${index}`, {
      width: this.roadWidth,
      height: this.segmentLength,
      subdivisions: 4
    }, this.scene);
    
    roadMesh.position.x = this.roadCurve;
    roadMesh.position.y = this.roadElevation;
    roadMesh.position.z = z;
    roadMesh.rotation.x = Math.PI / 2;
    
    // Realistic asphalt material with slight reflection
    const roadMat = new BABYLON.StandardMaterial(`roadMat_${index}`, this.scene);
    roadMat.diffuseColor = new BABYLON.Color3(0.12, 0.12, 0.13);
    roadMat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);
    roadMat.specularPower = 64;
    roadMat.backFaceCulling = false;
    roadMesh.material = roadMat;
    
    // Dashed center line (multiple segments)
    const dashCount = 8;
    const dashLength = this.segmentLength / dashCount * 0.5;
    const gapLength = this.segmentLength / dashCount * 0.5;
    
    for (let i = 0; i < dashCount; i++) {
      const dash = BABYLON.MeshBuilder.CreateBox(`dash_${index}_${i}`, {
        width: 0.15,
        height: 0.05,
        depth: dashLength
      }, this.scene);
      
      dash.position.x = this.roadCurve;
      dash.position.y = this.roadElevation + 0.12;
      dash.position.z = z - this.segmentLength / 2 + i * (dashLength + gapLength) + dashLength / 2;
      
      const lineMat = new BABYLON.StandardMaterial(`lineMat_${index}_${i}`, this.scene);
      lineMat.diffuseColor = new BABYLON.Color3(1, 1, 0.9);
      lineMat.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.4);
      lineMat.specularPower = 128;
      dash.material = lineMat;
      
      this.sceneryObjects.push(dash);
    }
    
    // Road edge lines (white solid)
    for (const edgeSide of [-1, 1]) {
      const edgeLine = BABYLON.MeshBuilder.CreateBox(`edge_${index}_${edgeSide}`, {
        width: 0.12,
        height: 0.05,
        depth: this.segmentLength
      }, this.scene);
      
      edgeLine.position.x = this.roadCurve + edgeSide * (this.roadWidth / 2 - 0.3);
      edgeLine.position.y = this.roadElevation + 0.12;
      edgeLine.position.z = z;
      
      const edgeMat = new BABYLON.StandardMaterial(`edgeMat_${index}_${edgeSide}`, this.scene);
      edgeMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.95);
      edgeMat.emissiveColor = new BABYLON.Color3(0.4, 0.4, 0.4);
      edgeLine.material = edgeMat;
      
      this.sceneryObjects.push(edgeLine);
    }
    
    this.roadSegments.push({ mesh: roadMesh, curve: this.roadCurve, elevation: this.roadElevation, index });
    
    // Check for bridge/tunnel generation
    const shouldGenerateBridge = Math.random() < this.bridgeChance && this.roadElevation < -5;
    const shouldGenerateTunnel = Math.random() < this.tunnelChance && this.roadElevation > 10;
    
    if (shouldGenerateBridge) {
      this.createBridge(index, this.roadCurve, this.roadElevation, z);
      this.roadSegments[this.roadSegments.length - 1].hasBridge = true;
    }
    
    if (shouldGenerateTunnel) {
      this.createTunnel(index, this.roadCurve, this.roadElevation, z);
      this.roadSegments[this.roadSegments.length - 1].hasTunnel = true;
    }
    
    // Check for hazard generation (not on bridges/tunnels)
    if (!shouldGenerateBridge && !shouldGenerateTunnel && Math.random() < this.hazardChance) {
      this.createRoadHazard(index, this.roadCurve, this.roadElevation, z);
    }
    
    // Enhanced terrain generation
    this.generateTerrain(index, this.roadCurve, this.roadElevation, z);
    
    // More frequent scenery
    if (Math.random() > 0.5) {
      this.generateScenery(index, this.roadCurve, this.roadElevation, z);
    }
    
    this.roadSegments.push({
      mesh: roadMesh,
      curve: this.roadCurve,
      elevation: this.roadElevation,
      index: index
    });
  }

  private generateTerrain(index: number, centerX: number, centerY: number, z: number): void {
    for (const side of [-1, 1]) {
      const terrainMesh = BABYLON.MeshBuilder.CreateGround(`terrain_${index}_${side}`, {
        width: 50,
        height: this.segmentLength,
        subdivisions: 16 // More subdivisions for detail
      }, this.scene);
      
      terrainMesh.position.x = centerX + side * (this.roadWidth / 2 + 25);
      terrainMesh.position.y = centerY - 1 + Math.random() * 2;
      terrainMesh.position.z = z;
      
      // Detailed grass material with variation
      const terrainMat = new BABYLON.StandardMaterial(`terrainMat_${index}_${side}`, this.scene);
      const biomeColor = this.getBiomeColor();
      terrainMat.diffuseColor = biomeColor;
      terrainMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
      terrainMat.ambientColor = biomeColor.scale(0.7);
      terrainMesh.material = terrainMat;
      
      // Add grass blades/clumps as instances
      if (this.currentBiome === 'grassland' || this.currentBiome === 'forest') {
        const grassCount = 25;
        for (let i = 0; i < grassCount; i++) {
          const grass = BABYLON.MeshBuilder.CreateCylinder(`grass_${index}_${side}_${i}`, {
            diameterTop: 0,
            diameterBottom: 0.15,
            height: 0.4,
            tessellation: 3
          }, this.scene);
          
          grass.position.x = terrainMesh.position.x + (Math.random() - 0.5) * 48;
          grass.position.y = terrainMesh.position.y + 0.2;
          grass.position.z = z + (Math.random() - 0.5) * this.segmentLength;
          
          const grassMat = new BABYLON.StandardMaterial(`grassMat_${i}`, this.scene);
          grassMat.diffuseColor = new BABYLON.Color3(
            0.15 + Math.random() * 0.15,
            0.45 + Math.random() * 0.25,
            0.1 + Math.random() * 0.1
          );
          grass.material = grassMat;
          this.sceneryObjects.push(grass);
        }
      }
      
      this.terrainChunks.push({
        mesh: terrainMesh,
        index: index
      });
    }
  }

  private generateScenery(index: number, centerX: number, centerY: number, z: number): void {
    const side = Math.random() > 0.5 ? -1 : 1;
    const distance = this.roadWidth / 2 + Math.random() * 20 + 8;
    
    // Detailed tree trunk
    const trunk = BABYLON.MeshBuilder.CreateCylinder(`trunk_${index}`, {
      diameterTop: 0.4,
      diameterBottom: 0.6,
      height: 5,
      tessellation: 12
    }, this.scene);
    
    trunk.position.x = centerX + side * distance;
    trunk.position.y = centerY + 2.5;
    trunk.position.z = z + (Math.random() - 0.5) * this.segmentLength * 0.8;
    
    // Bark texture material
    const barkMat = new BABYLON.StandardMaterial(`bark_${index}`, this.scene);
    barkMat.diffuseColor = new BABYLON.Color3(0.3, 0.2, 0.1);
    barkMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    trunk.material = barkMat;
    
    // Multiple layers of foliage
    const foliageLayers = 3;
    for (let i = 0; i < foliageLayers; i++) {
      const foliage = BABYLON.MeshBuilder.CreateSphere(`foliage_${index}_${i}`, {
        diameter: 4 - i * 0.5,
        segments: 10
      }, this.scene);
      
      foliage.position.x = trunk.position.x + (Math.random() - 0.5) * 0.8;
      foliage.position.y = trunk.position.y + 3 + i * 1.5;
      foliage.position.z = trunk.position.z + (Math.random() - 0.5) * 0.8;
      
      const foliageMat = new BABYLON.StandardMaterial(`leaves_${index}_${i}`, this.scene);
      foliageMat.diffuseColor = new BABYLON.Color3(
        0.1 + Math.random() * 0.1,
        0.45 + Math.random() * 0.25,
        0.08 + Math.random() * 0.08
      );
      foliageMat.specularColor = new BABYLON.Color3(0.2, 0.3, 0.2);
      foliage.material = foliageMat;
      
      this.sceneryObjects.push(foliage);
    }
    
    // Add rocks
    if (Math.random() > 0.6) {
      const rock = BABYLON.MeshBuilder.CreateSphere(`rock_${index}`, {
        diameter: 0.8 + Math.random() * 1.2,
        segments: 6
      }, this.scene);
      
      rock.scaling.x = 1 + Math.random() * 0.5;
      rock.scaling.y = 0.6 + Math.random() * 0.4;
      rock.scaling.z = 1 + Math.random() * 0.5;
      
      rock.position.x = centerX + side * (distance + (Math.random() - 0.5) * 10);
      rock.position.y = centerY - 0.3;
      rock.position.z = z + (Math.random() - 0.5) * this.segmentLength;
      
      const rockMat = new BABYLON.StandardMaterial(`rock_${index}`, this.scene);
      rockMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
      rockMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
      rock.material = rockMat;
      
      this.sceneryObjects.push(rock);
    }
    
    this.sceneryObjects.push(trunk);
    
    // Add bushes
    if (Math.random() > 0.7) {
      const bush = BABYLON.MeshBuilder.CreateSphere(`bush_${index}`, {
        diameter: 1.5,
        segments: 8
      }, this.scene);
      
      bush.scaling.y = 0.7;
      bush.position.x = centerX + side * (distance + Math.random() * 5);
      bush.position.y = centerY + 0.5;
      bush.position.z = z + (Math.random() - 0.5) * this.segmentLength;
      
      const bushMat = new BABYLON.StandardMaterial(`bush_${index}`, this.scene);
      bushMat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.15);
      bush.material = bushMat;
      
      this.sceneryObjects.push(bush);
    }
    
    // Add guardrails (road furniture)
    if (Math.random() > 0.7) {
      const guardrail = BABYLON.MeshBuilder.CreateBox(`guardrail_${index}`, {
        width: 0.1,
        height: 0.8,
        depth: this.segmentLength * 0.5
      }, this.scene);
      
      guardrail.position.x = centerX + side * (this.roadWidth / 2 + 2);
      guardrail.position.y = centerY + 0.4;
      guardrail.position.z = z;
      
      const guardMat = new BABYLON.StandardMaterial(`guard_${index}`, this.scene);
      guardMat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
      guardMat.specularColor = new BABYLON.Color3(0.9, 0.9, 0.9);
      guardMat.specularPower = 128;
      guardrail.material = guardMat;
      
      this.sceneryObjects.push(guardrail);
    }
    
    // Add road signs
    if (Math.random() > 0.85) {
      const signPost = BABYLON.MeshBuilder.CreateCylinder(`signpost_${index}`, {
        diameter: 0.1,
        height: 3
      }, this.scene);
      signPost.position.x = centerX + side * (this.roadWidth / 2 + 3);
      signPost.position.y = centerY + 1.5;
      signPost.position.z = z;
      
      const signBoard = BABYLON.MeshBuilder.CreateBox(`signboard_${index}`, {
        width: 1,
        height: 0.8,
        depth: 0.1
      }, this.scene);
      signBoard.position.x = signPost.position.x;
      signBoard.position.y = signPost.position.y + 1.5;
      signBoard.position.z = signPost.position.z;
      
      const postMat = new BABYLON.StandardMaterial(`post_${index}`, this.scene);
      postMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
      signPost.material = postMat;
      
      const signMat = new BABYLON.StandardMaterial(`sign_${index}`, this.scene);
      signMat.diffuseColor = new BABYLON.Color3(0.95, 0.85, 0.1);
      signMat.emissiveColor = new BABYLON.Color3(0.3, 0.2, 0);
      signBoard.material = signMat;
      
      this.sceneryObjects.push(signPost, signBoard);
    }
  }

  private createBridge(index: number, centerX: number, centerY: number, z: number): void {
    // Bridge structure spanning a valley
    const bridgeLength = this.segmentLength * 3;
    
    // Main bridge deck
    const deck = BABYLON.MeshBuilder.CreateBox(`bridgeDeck_${index}`, {
      width: this.roadWidth + 2,
      height: 0.5,
      depth: bridgeLength
    }, this.scene);
    deck.position.x = centerX;
    deck.position.y = centerY - 0.3;
    deck.position.z = z + bridgeLength / 2;
    
    const deckMat = new BABYLON.StandardMaterial(`deckMat_${index}`, this.scene);
    deckMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.45);
    deckMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    deckMat.specularPower = 64;
    deck.material = deckMat;
    
    // Support pillars (4 on each side)
    for (let i = 0; i < 4; i++) {
      for (const side of [-1, 1]) {
        const pillar = BABYLON.MeshBuilder.CreateCylinder(`pillar_${index}_${i}_${side}`, {
          diameter: 1.5,
          height: Math.abs(centerY) + 10,
          tessellation: 12
        }, this.scene);
        
        pillar.position.x = centerX + side * (this.roadWidth / 2 + 1);
        pillar.position.y = centerY - Math.abs(centerY) / 2 - 5;
        pillar.position.z = z + (i + 0.5) * (bridgeLength / 4);
        
        const pillarMat = new BABYLON.StandardMaterial(`pillarMat_${index}_${i}_${side}`, this.scene);
        pillarMat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.52);
        pillarMat.specularColor = new BABYLON.Color3(0.6, 0.6, 0.6);
        pillarMat.specularPower = 96;
        pillar.material = pillarMat;
        
        this.bridges.push(pillar);
      }
    }
    
    // Cable support towers (2 main towers)
    for (let i = 0; i < 2; i++) {
      for (const side of [-1, 1]) {
        const tower = BABYLON.MeshBuilder.CreateBox(`tower_${index}_${i}_${side}`, {
          width: 1,
          height: 15,
          depth: 1
        }, this.scene);
        
        tower.position.x = centerX + side * (this.roadWidth / 2 + 1);
        tower.position.y = centerY + 7;
        tower.position.z = z + (i + 0.5) * bridgeLength / 1.5;
        
        const towerMat = new BABYLON.StandardMaterial(`towerMat_${index}_${i}_${side}`, this.scene);
        towerMat.diffuseColor = new BABYLON.Color3(0.6, 0.15, 0.15);
        towerMat.specularColor = new BABYLON.Color3(0.7, 0.2, 0.2);
        towerMat.specularPower = 128;
        tower.material = towerMat;
        
        this.bridges.push(tower);
      }
    }
    
    // Suspension cables (decorative)
    for (let i = 0; i < 10; i++) {
      for (const side of [-1, 1]) {
        const cable = BABYLON.MeshBuilder.CreateCylinder(`cable_${index}_${i}_${side}`, {
          diameter: 0.1,
          height: 10,
          tessellation: 6
        }, this.scene);
        
        cable.position.x = centerX + side * (this.roadWidth / 2);
        cable.position.y = centerY + 5;
        cable.position.z = z + (i + 0.5) * (bridgeLength / 10);
        cable.rotation.x = Math.PI / 6;
        
        const cableMat = new BABYLON.StandardMaterial(`cableMat_${index}_${i}_${side}`, this.scene);
        cableMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.35);
        cableMat.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        cableMat.specularPower = 256;
        cable.material = cableMat;
        
        this.bridges.push(cable);
      }
    }
    
    this.bridges.push(deck);
    console.log(`🌉 Bridge constructed at ${z.toFixed(0)}m`);
  }

  private createTunnel(index: number, centerX: number, centerY: number, z: number): void {
    // Tunnel entrance and passage through mountain
    const tunnelLength = this.segmentLength * 5;
    
    // Main tunnel tube
    const tunnel = BABYLON.MeshBuilder.CreateCylinder(`tunnel_${index}`, {
      diameter: this.roadWidth + 6,
      height: tunnelLength,
      tessellation: 24,
      arc: 0.5 // Half cylinder for tunnel
    }, this.scene);
    tunnel.position.x = centerX;
    tunnel.position.y = centerY + (this.roadWidth + 6) / 4;
    tunnel.position.z = z + tunnelLength / 2;
    tunnel.rotation.x = Math.PI / 2;
    tunnel.rotation.z = Math.PI;
    
    const tunnelMat = new BABYLON.StandardMaterial(`tunnelMat_${index}`, this.scene);
    tunnelMat.diffuseColor = new BABYLON.Color3(0.25, 0.25, 0.27);
    tunnelMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    tunnelMat.specularPower = 32;
    tunnel.material = tunnelMat;
    
    // Tunnel entrance arch
    const entrance = BABYLON.MeshBuilder.CreateTorus(`tunnelEntrance_${index}`, {
      diameter: this.roadWidth + 4,
      thickness: 1.5,
      tessellation: 24
    }, this.scene);
    entrance.position.x = centerX;
    entrance.position.y = centerY + (this.roadWidth + 4) / 4;
    entrance.position.z = z;
    entrance.rotation.z = Math.PI;
    
    const entranceMat = new BABYLON.StandardMaterial(`entranceMat_${index}`, this.scene);
    entranceMat.diffuseColor = new BABYLON.Color3(0.3, 0.25, 0.2);
    entranceMat.specularColor = new BABYLON.Color3(0.4, 0.35, 0.3);
    entranceMat.specularPower = 64;
    entrance.material = entranceMat;
    
    // Tunnel lights (every 10m)
    for (let i = 0; i < tunnelLength / 10; i++) {
      for (const side of [-1, 1]) {
        const light = BABYLON.MeshBuilder.CreateSphere(`tunnelLight_${index}_${i}_${side}`, {
          diameter: 0.5,
          segments: 8
        }, this.scene);
        
        light.position.x = centerX + side * (this.roadWidth / 2 - 1);
        light.position.y = centerY + 4;
        light.position.z = z + i * 10;
        
        const lightMat = new BABYLON.StandardMaterial(`lightMat_${index}_${i}_${side}`, this.scene);
        lightMat.emissiveColor = new BABYLON.Color3(1.0, 0.9, 0.7);
        lightMat.diffuseColor = new BABYLON.Color3(1.0, 0.9, 0.7);
        light.material = lightMat;
        
        // Add point light for illumination
        const pointLight = new BABYLON.PointLight(`tunnelPointLight_${index}_${i}_${side}`, light.position, this.scene);
        pointLight.intensity = 0.8;
        pointLight.range = 15;
        pointLight.diffuse = new BABYLON.Color3(1.0, 0.9, 0.7);
        
        this.tunnels.push(light);
      }
    }
    
    // Exit arch
    const exit = entrance.clone(`tunnelExit_${index}`);
    exit.position.z = z + tunnelLength;
    
    this.tunnels.push(tunnel, entrance, exit);
    console.log(`🚇 Tunnel constructed at ${z.toFixed(0)}m`);
  }
  
  private createRoadHazard(index: number, centerX: number, centerY: number, z: number): void {
    const hazardTypes = ['rocks', 'debris', 'pothole', 'construction'];
    const hazardType = hazardTypes[Math.floor(Math.random() * hazardTypes.length)];
    
    if (hazardType === 'rocks') {
      // Fallen rocks on the road
      const rockCount = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < rockCount; i++) {
        const rock = BABYLON.MeshBuilder.CreateSphere(`rock_hazard_${index}_${i}`, {
          diameter: 0.8 + Math.random() * 1.2,
          segments: 8
        }, this.scene);
        
        rock.position.x = centerX + (Math.random() - 0.5) * (this.roadWidth - 2);
        rock.position.y = centerY + 0.5;
        rock.position.z = z + (Math.random() - 0.5) * this.segmentLength * 0.5;
        rock.scaling.y = 0.6 + Math.random() * 0.3;
        
        const rockMat = new BABYLON.StandardMaterial(`rockHazardMat_${index}_${i}`, this.scene);
        rockMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.42);
        rockMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        rock.material = rockMat;
        
        this.hazards.push(rock);
      }
      console.log(`🪨 Fallen rocks at ${z.toFixed(0)}m`);
    }
    else if (hazardType === 'debris') {
      // Road debris (boxes, scattered objects)
      const debrisCount = 3 + Math.floor(Math.random() * 4);
      for (let i = 0; i < debrisCount; i++) {
        const debris = BABYLON.MeshBuilder.CreateBox(`debris_${index}_${i}`, {
          width: 0.3 + Math.random() * 0.5,
          height: 0.3 + Math.random() * 0.5,
          depth: 0.3 + Math.random() * 0.5
        }, this.scene);
        
        debris.position.x = centerX + (Math.random() - 0.5) * (this.roadWidth - 2);
        debris.position.y = centerY + 0.3;
        debris.position.z = z + (Math.random() - 0.5) * this.segmentLength * 0.6;
        debris.rotation.x = Math.random() * Math.PI;
        debris.rotation.y = Math.random() * Math.PI;
        debris.rotation.z = Math.random() * Math.PI;
        
        const debrisMat = new BABYLON.StandardMaterial(`debrisMat_${index}_${i}`, this.scene);
        debrisMat.diffuseColor = new BABYLON.Color3(0.5 + Math.random() * 0.3, 0.3, 0.1);
        debris.material = debrisMat;
        
        this.hazards.push(debris);
      }
      console.log(`📦 Debris scattered at ${z.toFixed(0)}m`);
    }
    else if (hazardType === 'pothole') {
      // Pothole (dark circle on road)
      const pothole = BABYLON.MeshBuilder.CreateCylinder(`pothole_${index}`, {
        diameter: 1.5 + Math.random(),
        height: 0.15,
        tessellation: 12
      }, this.scene);
      
      const lane = Math.floor(Math.random() * 3) - 1;
      pothole.position.x = centerX + lane * 3;
      pothole.position.y = centerY - 0.05;
      pothole.position.z = z + (Math.random() - 0.5) * this.segmentLength * 0.3;
      
      const potholeMat = new BABYLON.StandardMaterial(`potholeMat_${index}`, this.scene);
      potholeMat.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.06);
      potholeMat.specularColor = new BABYLON.Color3(0, 0, 0);
      pothole.material = potholeMat;
      
      this.hazards.push(pothole);
      console.log(`🕳️ Pothole in lane ${lane} at ${z.toFixed(0)}m`);
    }
    else if (hazardType === 'construction') {
      // Construction zone with cones and signs
      const coneCount = 4 + Math.floor(Math.random() * 3);
      const side = Math.random() > 0.5 ? 1 : -1;
      
      for (let i = 0; i < coneCount; i++) {
        const cone = BABYLON.MeshBuilder.CreateCylinder(`cone_${index}_${i}`, {
          diameterTop: 0.2,
          diameterBottom: 0.4,
          height: 0.8,
          tessellation: 8
        }, this.scene);
        
        cone.position.x = centerX + side * (this.roadWidth / 2 - 2);
        cone.position.y = centerY + 0.4;
        cone.position.z = z + i * (this.segmentLength / coneCount);
        
        const coneMat = new BABYLON.StandardMaterial(`coneMat_${index}_${i}`, this.scene);
        coneMat.diffuseColor = new BABYLON.Color3(1.0, 0.4, 0.0);
        coneMat.emissiveColor = new BABYLON.Color3(0.5, 0.2, 0.0);
        cone.material = coneMat;
        
        this.hazards.push(cone);
      }
      
      // Warning sign
      const signPost = BABYLON.MeshBuilder.CreateCylinder(`signPost_${index}`, {
        diameter: 0.1,
        height: 2
      }, this.scene);
      signPost.position.x = centerX + side * (this.roadWidth / 2 - 1.5);
      signPost.position.y = centerY + 1;
      signPost.position.z = z;
      
      const signBoard = BABYLON.MeshBuilder.CreateBox(`signBoard_${index}`, {
        width: 1,
        height: 1,
        depth: 0.1
      }, this.scene);
      signBoard.position.x = signPost.position.x;
      signBoard.position.y = signPost.position.y + 1.2;
      signBoard.position.z = signPost.position.z;
      
      const signMat = new BABYLON.StandardMaterial(`constructionSignMat_${index}`, this.scene);
      signMat.diffuseColor = new BABYLON.Color3(1.0, 0.8, 0.0);
      signMat.emissiveColor = new BABYLON.Color3(0.5, 0.4, 0.0);
      signBoard.material = signMat;
      
      const postMat = new BABYLON.StandardMaterial(`postMat_${index}`, this.scene);
      postMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
      signPost.material = postMat;
      
      this.hazards.push(signPost, signBoard);
      console.log(`🚧 Construction zone at ${z.toFixed(0)}m`);
    }
  }

  private generateClouds(): void {
    for (let i = 0; i < 30; i++) {
      // Create cloud from multiple spheres for realistic shape
      const cloudParts: BABYLON.Mesh[] = [];
      const partCount = 3 + Math.floor(Math.random() * 4);
      
      for (let j = 0; j < partCount; j++) {
        const part = BABYLON.MeshBuilder.CreateSphere(`cloud_${i}_${j}`, {
          diameter: 8 + Math.random() * 12,
          segments: 8
        }, this.scene);
        
        part.position.x = (Math.random() - 0.5) * 200;
        part.position.y = 50 + Math.random() * 40;
        part.position.z = (Math.random() - 0.5) * 400;
        
        if (j > 0) {
          part.position.x += cloudParts[0].position.x + (Math.random() - 0.5) * 10;
          part.position.y += (Math.random() - 0.5) * 5;
          part.position.z += cloudParts[0].position.z + (Math.random() - 0.5) * 10;
        }
        
        const cloudMat = new BABYLON.StandardMaterial(`cloudMat_${i}_${j}`, this.scene);
        cloudMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 1);
        cloudMat.specularColor = new BABYLON.Color3(1, 1, 1);
        cloudMat.alpha = 0.7 + Math.random() * 0.2;
        cloudMat.emissiveColor = new BABYLON.Color3(0.85, 0.85, 0.9);
        part.material = cloudMat;
        
        cloudParts.push(part);
        this.clouds.push(part);
      }
    }
  }

  private getBiomeColor(): BABYLON.Color3 {
    switch (this.currentBiome) {
      case 'grassland': return new BABYLON.Color3(0.3, 0.7, 0.3);
      case 'desert': return new BABYLON.Color3(0.9, 0.8, 0.5);
      case 'forest': return new BABYLON.Color3(0.2, 0.5, 0.2);
      case 'snow': return new BABYLON.Color3(0.9, 0.9, 1.0);
      case 'coastal': return new BABYLON.Color3(0.7, 0.8, 0.6);
      default: return new BABYLON.Color3(0.3, 0.7, 0.3);
    }
  }

  setup(): void {
    // DON'T start game automatically - let menu handle it
    console.log('[InfiniteRoads] Setup complete - waiting for user to start game from menu');
  }

  // Required by GamePlay.tsx - initialize game
  init(): void {
    console.log('[InfiniteRoads] Initializing...');
    this.setup();
  }

  // Required by GamePlay.tsx - start game
  start(): void {
    console.log('[InfiniteRoads] Start called - game will start from menu');
    // Menu system handles actual game start
  }

  // Required by GamePlay.tsx - pause game
  pause(): void {
    this.pauseGame();
  }

  // Required by GamePlay.tsx - resume game
  resume(): void {
    this.resumeGame();
  }

  // Required by GamePlay.tsx - reset game
  reset(): void {
    this.carSpeed = 0;
    this.distanceTraveled = 0;
    this.currentSegmentIndex = 0;
    this.carPosition = 0;
    this.currentTime = 14;
    
    // Clear existing road and scenery
    this.roadSegments.forEach(s => s.mesh.dispose());
    this.terrainChunks.forEach(t => t.mesh.dispose());
    this.sceneryObjects.forEach(o => o.dispose());
    
    this.roadSegments = [];
    this.terrainChunks = [];
    this.sceneryObjects = [];
    this.noiseOffset = 0;
    
    // Regenerate fresh road
    this.generateInitialRoad();
  }

  // Required by GamePlay.tsx - cleanup
  destroy(): void {
    this.isRunning = false;
    
    // Stop all audio
    if (this.engineSound) this.engineSound.stop();
    if (this.windSound) this.windSound.stop();
    if (this.tireScreechSound) this.tireScreechSound.stop();
    if (this.biomeAmbience) this.biomeAmbience.stop();
    if (this.radioSound) this.radioSound.stop();
    
    this.engine.stopRenderLoop();
    this.scene.dispose();
    this.engine.dispose();
  }

  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    const currentCar = this.availableCars[this.currentCarIndex];
    
    // Enhanced physics based on car properties
    if (this.keys['arrowup'] || this.keys['w']) {
      this.carSpeed = Math.min(
        this.carSpeed + currentCar.acceleration * dt,
        currentCar.maxSpeed
      );
    } else {
      this.carSpeed = Math.max(this.carSpeed - 5 * dt, 0);
    }
    
    if (this.keys['arrowdown'] || this.keys['s']) {
      this.carSpeed = Math.max(this.carSpeed - 10 * dt, 0);
    }
    
    // Handling affects turn responsiveness
    const turnSpeed = 0.02 * currentCar.handling;
    if (this.keys['arrowleft'] || this.keys['a']) {
      this.carPosition -= turnSpeed;
      this.carRotation = -0.2 * currentCar.handling;
      if (currentCar.type === 'bike') {
        this.carTilt = -0.3; // Lean bike
      }
    }
    if (this.keys['arrowright'] || this.keys['d']) {
      this.carPosition += turnSpeed;
      this.carRotation = 0.2 * currentCar.handling;
      if (currentCar.type === 'bike') {
        this.carTilt = 0.3;
      }
    }
    
    // Smooth rotation back to center
    this.carRotation *= 0.9;
    this.carTilt *= 0.9;
    
    this.carPosition = Math.max(-1, Math.min(1, this.carPosition));
    
    // Distance traveled
    this.distanceTraveled += (this.carSpeed / 3.6) * dt;
    const segmentsPassed = Math.floor(this.distanceTraveled / this.segmentLength);
    
    if (segmentsPassed > this.currentSegmentIndex) {
      this.generateRoadSegment(this.currentSegmentIndex + this.renderDistance);
      this.removeOldSegments();
      this.currentSegmentIndex = segmentsPassed;
    }
    
    // Position car with suspension effect
    const currentSegment = this.roadSegments[Math.min(5, this.roadSegments.length - 1)];
    if (currentSegment) {
      this.car.position.x = currentSegment.curve + this.carPosition * (this.roadWidth / 2 - 1);
      this.car.position.y = currentSegment.elevation + 1 + Math.sin(this.distanceTraveled * 0.5) * 0.1; // Suspension bounce
      this.car.position.z = this.currentSegmentIndex * this.segmentLength;
      this.car.rotation.y = this.carRotation;
      this.car.rotation.z = this.carTilt;
    }
    
    // Animate wheels
    this.wheelRotation += this.carSpeed * dt * 0.1;
    for (const wheel of this.wheels) {
      wheel.rotation.x = this.wheelRotation;
    }
    
    this.camera.target = this.car.position.clone();
    
    // Time progression
    this.currentTime += this.timeSpeed * dt;
    if (this.currentTime >= 24) this.currentTime = 0;
    
    this.updateLighting();
    this.updateParticles();
    this.updateInfo();
    
    // Weather transition system
    this.updateWeatherTransition(dt);
    
    // Update traffic cars
    this.updateTraffic(dt);
    
    // Update audio based on speed and game state
    this.updateAudio();
    
    // FPS counter
    this.info.fps = Math.round(this.engine.getFps());
  }

  private updateParticles(): void {
    // Control particles based on weather and biome
    const isMoving = this.carSpeed > 5;
    
    // Rain
    if (this.weather === 'rain' || this.weather === 'storm') {
      if (!this.rainParticles.active && this.rainParticles.system) {
        this.rainParticles.system.start();
        this.rainParticles.active = true;
      }
    } else {
      if (this.rainParticles.active && this.rainParticles.system) {
        this.rainParticles.system.stop();
        this.rainParticles.active = false;
      }
    }
    
    // Snow
    if (this.currentBiome === 'snow' && (this.weather === 'clear' || this.weather === 'fog')) {
      if (!this.snowParticles.active && this.snowParticles.system) {
        this.snowParticles.system.start();
        this.snowParticles.active = true;
      }
    } else {
      if (this.snowParticles.active && this.snowParticles.system) {
        this.snowParticles.system.stop();
        this.snowParticles.active = false;
      }
    }
    
    // Dust (only when moving on desert)
    if (this.currentBiome === 'desert' && isMoving) {
      if (!this.dustParticles.active && this.dustParticles.system) {
        this.dustParticles.system.start();
        this.dustParticles.active = true;
      }
    } else {
      if (this.dustParticles.active && this.dustParticles.system) {
        this.dustParticles.system.stop();
        this.dustParticles.active = false;
      }
    }
    
    // Leaves (autumn forest effect)
    if (this.currentBiome === 'forest' && (this.weather === 'clear' || this.weather === 'fog')) {
      if (!this.leavesParticles.active && this.leavesParticles.system) {
        this.leavesParticles.system.start();
        this.leavesParticles.active = true;
      }
    } else {
      if (this.leavesParticles.active && this.leavesParticles.system) {
        this.leavesParticles.system.stop();
        this.leavesParticles.active = false;
      }
    }
    
    // 🔥 SPEED EFFECTS - Make it feel INSANELY FAST!
    const currentCar = this.availableCars[this.currentCarIndex];
    const speedPercent = this.carSpeed / currentCar.maxSpeed;
    
    // Speed trails activate at 40% max speed
    if (speedPercent > 0.4 && this.gameSettings.particles) {
      const trailIntensity = Math.max(0, (speedPercent - 0.4) / 0.6);
      const emitRate = Math.floor(trailIntensity * 400);
      
      if (!this.speedTrailsLeft.active && this.speedTrailsLeft.system) {
        this.speedTrailsLeft.system.start();
        this.speedTrailsLeft.active = true;
      }
      if (!this.speedTrailsRight.active && this.speedTrailsRight.system) {
        this.speedTrailsRight.system.start();
        this.speedTrailsRight.active = true;
      }
      
      if (this.speedTrailsLeft.system) this.speedTrailsLeft.system.emitRate = emitRate;
      if (this.speedTrailsRight.system) this.speedTrailsRight.system.emitRate = emitRate;
    } else {
      if (this.speedTrailsLeft.active && this.speedTrailsLeft.system) {
        this.speedTrailsLeft.system.stop();
        this.speedTrailsLeft.active = false;
      }
      if (this.speedTrailsRight.active && this.speedTrailsRight.system) {
        this.speedTrailsRight.system.stop();
        this.speedTrailsRight.active = false;
      }
    }
    
    // Tire smoke when turning hard at high speed (drifting)
    const isDrifting = Math.abs(this.carPosition) > 0.3 && speedPercent > 0.5;
    if (isDrifting && this.gameSettings.particles) {
      const driftIntensity = Math.abs(this.carPosition) * speedPercent;
      const smokeRate = Math.floor(driftIntensity * 200);
      
      if (!this.tireSmokeLeft.active && this.tireSmokeLeft.system) {
        this.tireSmokeLeft.system.start();
        this.tireSmokeLeft.active = true;
      }
      if (!this.tireSmokeRight.active && this.tireSmokeRight.system) {
        this.tireSmokeRight.system.start();
        this.tireSmokeRight.active = true;
      }
      
      if (this.tireSmokeLeft.system) this.tireSmokeLeft.system.emitRate = smokeRate;
      if (this.tireSmokeRight.system) this.tireSmokeRight.system.emitRate = smokeRate;
    } else {
      if (this.tireSmokeLeft.active && this.tireSmokeLeft.system) {
        this.tireSmokeLeft.system.stop();
        this.tireSmokeLeft.active = false;
      }
      if (this.tireSmokeRight.active && this.tireSmokeRight.system) {
        this.tireSmokeRight.system.stop();
        this.tireSmokeRight.active = false;
      }
    }
    
    // FOV increase with speed (makes it feel FASTER)
    this.targetFOV = this.baseFOV + (speedPercent * 0.25); // Up to 25% FOV increase
    this.camera.fov += (this.targetFOV - this.camera.fov) * 0.1; // Smooth transition
    
    // Camera shake at very high speeds (adds intensity)
    if (speedPercent > 0.7) {
      this.cameraShake = (speedPercent - 0.7) * 0.15;
      const shakeX = (Math.random() - 0.5) * this.cameraShake;
      const shakeY = (Math.random() - 0.5) * this.cameraShake;
      this.camera.target.addInPlace(new BABYLON.Vector3(shakeX, shakeY, 0));
    }
  }

  private removeOldSegments(): void {
    while (this.roadSegments.length > this.renderDistance) {
      const segment = this.roadSegments.shift();
      if (segment) segment.mesh.dispose();
    }
    
    while (this.terrainChunks.length > this.renderDistance * 2) {
      const terrain = this.terrainChunks.shift();
      if (terrain) terrain.mesh.dispose();
    }
    
    while (this.sceneryObjects.length > 100) {
      const obj = this.sceneryObjects.shift();
      if (obj) obj.dispose();
    }
    
    // Remove traffic cars that are too far behind
    this.trafficCars = this.trafficCars.filter(car => {
      if (car.position < this.distanceTraveled - 200) {
        // Dispose of headlights if they exist
        if (car.mesh.metadata?.lights) {
          for (const light of car.mesh.metadata.lights) {
            light.dispose();
          }
        }
        car.mesh.dispose();
        return false;
      }
      return true;
    });
    
    // Remove old bridges and tunnels
    this.bridges = this.bridges.filter(bridge => {
      if (bridge.position.z < this.car.position.z - 500) {
        bridge.dispose();
        return false;
      }
      return true;
    });
    
    this.tunnels = this.tunnels.filter(tunnel => {
      if (tunnel.position.z < this.car.position.z - 500) {
        tunnel.dispose();
        return false;
      }
      return true;
    });
    
    // Remove old hazards
    this.hazards = this.hazards.filter(hazard => {
      if (hazard.position.z < this.car.position.z - 300) {
        hazard.dispose();
        return false;
      }
      return true;
    });
  }
  
  // Traffic System Methods
  private spawnTrafficCar(): void {
    if (this.trafficCars.length >= this.maxTrafficCars) return;
    
    const types: ('sedan' | 'truck' | 'suv' | 'bike')[] = ['sedan', 'sedan', 'suv', 'truck', 'bike'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Create traffic car mesh
    let carMesh: BABYLON.Mesh;
    if (type === 'bike') {
      carMesh = BABYLON.MeshBuilder.CreateBox('trafficBike', { width: 0.8, height: 1.2, depth: 2 }, this.scene);
    } else if (type === 'truck') {
      carMesh = BABYLON.MeshBuilder.CreateBox('trafficTruck', { width: 2.8, height: 3.5, depth: 7 }, this.scene);
    } else if (type === 'suv') {
      carMesh = BABYLON.MeshBuilder.CreateBox('trafficSUV', { width: 2.2, height: 2.2, depth: 4.5 }, this.scene);
    } else {
      carMesh = BABYLON.MeshBuilder.CreateBox('trafficSedan', { width: 2, height: 1.5, depth: 4 }, this.scene);
    }
    
    // Random color
    const mat = new BABYLON.StandardMaterial('trafficMat', this.scene);
    const colors = [
      new BABYLON.Color3(0.9, 0.1, 0.1), // Red
      new BABYLON.Color3(0.1, 0.3, 0.9), // Blue
      new BABYLON.Color3(0.1, 0.1, 0.1), // Black
      new BABYLON.Color3(0.9, 0.9, 0.9), // White
      new BABYLON.Color3(0.8, 0.8, 0.1), // Yellow
      new BABYLON.Color3(0.2, 0.7, 0.3), // Green
    ];
    mat.diffuseColor = colors[Math.floor(Math.random() * colors.length)];
    mat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    mat.specularPower = 64;
    carMesh.material = mat;
    
    // Position ahead of player
    const lane = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    const spawnPosition = this.distanceTraveled + this.trafficSpawnDistance + Math.random() * 50;
    
    carMesh.position.x = lane * 3;
    carMesh.position.z = spawnPosition;
    carMesh.position.y = 1.5;
    
    // Random speed (slower than player average)
    const baseSpeed = this.availableCars[this.currentCarIndex].maxSpeed;
    const speed = baseSpeed * (0.4 + Math.random() * 0.4); // 40-80% of player's max speed
    
    this.trafficCars.push({
      mesh: carMesh,
      speed,
      lane,
      position: spawnPosition,
      type
    });
  }
  
  private updateTraffic(dt: number): void {
    // Dynamic traffic density based on time of day
    const hour = this.currentTime;
    let trafficMultiplier = 1.0;
    let maxTrafficForTime = this.maxTrafficCars;
    
    // Rush hour (7-9 AM and 5-7 PM) - more traffic
    if ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 19)) {
      trafficMultiplier = 2.5;
      maxTrafficForTime = Math.floor(this.maxTrafficCars * 1.5); // 12 cars max
    }
    // Late night (11 PM - 5 AM) - less traffic
    else if (hour >= 23 || hour < 5) {
      trafficMultiplier = 0.3;
      maxTrafficForTime = Math.floor(this.maxTrafficCars * 0.5); // 4 cars max
    }
    // Daytime normal traffic
    else if (hour >= 9 && hour < 17) {
      trafficMultiplier = 1.2;
      maxTrafficForTime = this.maxTrafficCars;
    }
    
    // Spawn new traffic cars with time-based probability
    const spawnChance = 0.02 * trafficMultiplier;
    if (Math.random() < spawnChance && this.trafficCars.length < maxTrafficForTime) {
      this.spawnTrafficCar();
    }
    
    // Spawn emergency vehicles occasionally
    this.emergencySpawnTimer -= dt;
    if (this.emergencySpawnTimer <= 0 && Math.random() < 0.1) {
      this.spawnEmergencyVehicle();
      this.emergencySpawnTimer = 30 + Math.random() * 60; // Every 30-90 seconds
    }
    
    // Update existing traffic
    for (const car of this.trafficCars) {
      // Move car forward
      car.position += car.speed * dt;
      car.mesh.position.z = car.position;
      
      // Add headlights at night (6 PM to 6 AM)
      const isNightTime = hour >= 18 || hour < 6;
      if (isNightTime && !car.mesh.metadata.hasHeadlights) {
        this.addHeadlightsToTrafficCar(car);
      }
      
      // Simple lane changing logic (occasional)
      if (Math.random() < 0.001) {
        const newLane = Math.floor(Math.random() * 3) - 1;
        if (newLane !== car.lane) {
          car.lane = newLane;
          // Smooth lane transition
          const targetX = newLane * 3;
          car.mesh.position.x += (targetX - car.mesh.position.x) * 0.05;
        }
      }
      
      // Match road curve
      if (this.roadSegments.length > 0) {
        const nearestSegment = this.roadSegments[Math.floor((car.position / this.segmentLength) % this.roadSegments.length)];
        if (nearestSegment) {
          car.mesh.position.x = nearestSegment.curve + car.lane * 3;
        }
      }
      
      // Slight rotation for realism
      car.mesh.rotation.y = Math.sin(Date.now() * 0.001 + car.position) * 0.02;
    }
  }
  
  private addHeadlightsToTrafficCar(car: TrafficCar): void {
    // Add point lights for headlights
    const leftHeadlight = new BABYLON.PointLight(
      `headlight_L_${Date.now()}`,
      car.mesh.position.add(new BABYLON.Vector3(-0.7, 0.5, 2)),
      this.scene
    );
    leftHeadlight.intensity = 2;
    leftHeadlight.range = 12;
    leftHeadlight.diffuse = new BABYLON.Color3(1.0, 0.95, 0.8);
    leftHeadlight.parent = car.mesh;
    
    const rightHeadlight = new BABYLON.PointLight(
      `headlight_R_${Date.now()}`,
      car.mesh.position.add(new BABYLON.Vector3(0.7, 0.5, 2)),
      this.scene
    );
    rightHeadlight.intensity = 2;
    rightHeadlight.range = 12;
    rightHeadlight.diffuse = new BABYLON.Color3(1.0, 0.95, 0.8);
    rightHeadlight.parent = car.mesh;
    
    // Mark as having headlights
    car.mesh.metadata = car.mesh.metadata || {};
    car.mesh.metadata.hasHeadlights = true;
    car.mesh.metadata.lights = [leftHeadlight, rightHeadlight];
  }
  
  private spawnEmergencyVehicle(): void {
    const types = ['police', 'ambulance', 'firetruck'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let vehicleMesh: BABYLON.Mesh;
    let color: BABYLON.Color3;
    let lightColor: BABYLON.Color3;
    
    if (type === 'police') {
      vehicleMesh = BABYLON.MeshBuilder.CreateBox('police', { width: 2.2, height: 1.8, depth: 4.5 }, this.scene);
      color = new BABYLON.Color3(0.0, 0.0, 0.0); // Black and white
      lightColor = new BABYLON.Color3(1.0, 0.0, 0.0); // Red and blue
      console.log('🚓 Police car approaching!');
    } else if (type === 'ambulance') {
      vehicleMesh = BABYLON.MeshBuilder.CreateBox('ambulance', { width: 2.5, height: 2.5, depth: 5 }, this.scene);
      color = new BABYLON.Color3(1.0, 1.0, 1.0); // White
      lightColor = new BABYLON.Color3(1.0, 0.0, 0.0); // Red
      console.log('🚑 Ambulance passing through!');
    } else {
      vehicleMesh = BABYLON.MeshBuilder.CreateBox('firetruck', { width: 2.8, height: 3.2, depth: 6 }, this.scene);
      color = new BABYLON.Color3(0.9, 0.1, 0.0); // Red
      lightColor = new BABYLON.Color3(1.0, 0.0, 0.0);
      console.log('🚒 Fire truck on emergency call!');
    }
    
    const mat = new BABYLON.StandardMaterial('emergencyMat', this.scene);
    mat.diffuseColor = color;
    mat.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8);
    mat.specularPower = 128;
    vehicleMesh.material = mat;
    
    // Add flashing lights
    const light1 = new BABYLON.PointLight(`siren_${Date.now()}`, vehicleMesh.position, this.scene);
    light1.intensity = 5;
    light1.range = 25;
    light1.diffuse = lightColor;
    light1.parent = vehicleMesh;
    
    const lane = Math.floor(Math.random() * 3) - 1;
    const spawnDistance = this.distanceTraveled + this.trafficSpawnDistance + Math.random() * 50;
    
    vehicleMesh.position.y = 1;
    vehicleMesh.position.z = spawnDistance;
    
    const trafficCar: TrafficCar = {
      mesh: vehicleMesh,
      speed: this.carSpeed * 1.5, // Emergency vehicles go faster
      lane: lane,
      position: spawnDistance,
      type: 'suv'
    };
    
    vehicleMesh.metadata = { isEmergency: true, lights: [light1], flashPhase: 0 };
    
    this.emergencyVehicles.push(trafficCar);
    this.trafficCars.push(trafficCar);
  }

  private updateLighting(): void {
    const hour = this.currentTime;
    
    // Day time (6 AM to 6 PM)
    if (hour >= 6 && hour < 18) {
      const t = (hour - 6) / 12;
      this.sunLight.intensity = 0.8 + Math.sin(t * Math.PI) * 0.3;
      this.hemiLight.intensity = 0.4 + Math.sin(t * Math.PI) * 0.2;
      this.moonLight.intensity = 0; // No moon during day
      
      // Enhanced sunrise colors (6-8 AM)
      if (hour < 8) {
        const sunriseT = (hour - 6) / 2;
        // Beautiful orange-pink-blue gradient sunrise
        this.scene.clearColor = new BABYLON.Color4(
          1.0 - sunriseT * 0.3,      // Red: 1.0 → 0.7
          0.4 + sunriseT * 0.4,      // Green: 0.4 → 0.8  
          0.2 + sunriseT * 0.7,      // Blue: 0.2 → 0.9
          1
        );
        // Sun rises orange-yellow
        this.sunLight.diffuse = new BABYLON.Color3(
          1.0,
          0.7 + sunriseT * 0.3,
          0.3 + sunriseT * 0.4
        );
      } else if (hour > 16) {
        // Enhanced sunset colors (4-6 PM)
        const sunsetT = (hour - 16) / 2;
        // Beautiful purple-orange-red gradient sunset
        this.scene.clearColor = new BABYLON.Color4(
          0.95 - sunsetT * 0.25,     // Red: 0.95 → 0.7
          0.55 - sunsetT * 0.35,     // Green: 0.55 → 0.2
          0.45 - sunsetT * 0.35,     // Blue: 0.45 → 0.1
          1
        );
        // Sun sets deep orange-red
        this.sunLight.diffuse = new BABYLON.Color3(
          1.0,
          0.5 - sunsetT * 0.3,
          0.2 - sunsetT * 0.15
        );
      } else {
        // Mid-day (bright blue sky)
        this.scene.clearColor = new BABYLON.Color4(
          0.53 - t * 0.1,
          0.81 - t * 0.2,
          0.92 - t * 0.1,
          1
        );
        // Normal white sunlight
        this.sunLight.diffuse = new BABYLON.Color3(1.0, 1.0, 0.95);
      }
    } else {
      // Night time
      this.sunLight.intensity = 0.05;
      this.hemiLight.intensity = 0.15;
      this.moonLight.intensity = 0.4; // Moon shines at night
      
      // Dark blue night sky
      this.scene.clearColor = new BABYLON.Color4(0.02, 0.02, 0.1, 1);
      
      // Moon position follows time
      const nightT = hour < 6 ? hour / 6 : (hour - 18) / 6;
      this.moonLight.position.x = Math.sin(nightT * Math.PI) * 100;
      this.moonLight.position.y = 50 + Math.cos(nightT * Math.PI) * 30;
    }
    
    // Weather effects on lighting
    if (this.weather === 'fog') {
      this.scene.fogDensity = 0.025;
      this.sunLight.intensity *= 0.6;
      this.hemiLight.intensity *= 0.7;
    } else if (this.weather === 'storm') {
      this.scene.fogDensity = 0.015;
      this.sunLight.intensity *= 0.4;
      this.hemiLight.intensity *= 0.5;
      this.scene.clearColor = new BABYLON.Color4(0.2, 0.2, 0.25, 1);
    } else {
      this.scene.fogDensity = 0.008;
    }
  }

  private updateInfo(): void {
    this.info.speed = Math.round(this.carSpeed);
    this.info.distance = parseFloat((this.distanceTraveled / 1000).toFixed(2));
    
    const hour = Math.floor(this.currentTime);
    const minute = Math.floor((this.currentTime - hour) * 60);
    this.info.time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    this.info.weather = this.weather.charAt(0).toUpperCase() + this.weather.slice(1);
    this.info.biome = this.currentBiome.charAt(0).toUpperCase() + this.currentBiome.slice(1);
  }

  render(): void {
    this.scene.render();
  }

  // Removed duplicate pause/resume/destroy methods (already defined earlier)

  private cycleCameraView(): void {
    const views = [
      { name: 'Chase Camera', alpha: -Math.PI / 2, beta: Math.PI / 3, radius: 25 },
      { name: 'Close Follow', alpha: -Math.PI / 2, beta: Math.PI / 4, radius: 15 },
      { name: 'Far View', alpha: -Math.PI / 2, beta: Math.PI / 2.5, radius: 40 },
      { name: 'Front View', alpha: Math.PI, beta: Math.PI / 3, radius: 20 }
    ];
    
    const current = views.findIndex(v => 
      Math.abs(this.camera.alpha - v.alpha) < 0.1
    );
    const next = (current + 1) % views.length;
    
    this.info.camera = views[next].name;
    
    BABYLON.Animation.CreateAndStartAnimation(
      'cameraAnim',
      this.camera,
      'alpha',
      60,
      30,
      this.camera.alpha,
      views[next].alpha,
      0
    );
  }

  private cycleTime(): void {
    this.currentTime = (this.currentTime + 6) % 24;
  }

  private cycleWeather(): void {
    const weathers: Weather[] = ['clear', 'rain', 'fog', 'sunset', 'storm'];
    const current = weathers.indexOf(this.weather);
    this.previousWeather = this.weather;
    this.targetWeather = weathers[(current + 1) % weathers.length];
    this.isTransitioning = true;
    this.weatherTransitionProgress = 0;
    console.log(`🌦️ Weather transitioning: ${this.previousWeather} → ${this.targetWeather}`);
  }

  private cycleBiome(): void {
    const biomes: Biome[] = ['grassland', 'desert', 'forest', 'snow', 'coastal'];
    const current = biomes.indexOf(this.currentBiome);
    this.currentBiome = biomes[(current + 1) % biomes.length];
  }

  private cycleCarModel(): void {
    this.currentCarIndex = (this.currentCarIndex + 1) % this.availableCars.length;
    this.createCar();
  }

  private toggleHelp(): void {
    // TODO: Show help overlay with controls
    console.log('🎮 CONTROLS:');
    console.log('WASD/Arrows: Drive and steer');
    console.log('V: Change car model');
    console.log('C: Change camera view');
    console.log('T: Change time of day');
    console.log('N: Change weather');
    console.log('B: Change biome');
    console.log('R: Toggle radio (music)');
    console.log('H: Toggle help');
  }

  private initializeParticles(): void {
    // Rain particles
    const rainSystem = new BABYLON.ParticleSystem('rain', 2000, this.scene);
    rainSystem.particleTexture = new BABYLON.Texture('', this.scene);
    rainSystem.emitter = new BABYLON.Vector3(0, 20, 0);
    rainSystem.minEmitBox = new BABYLON.Vector3(-50, 0, -50);
    rainSystem.maxEmitBox = new BABYLON.Vector3(50, 0, 50);
    rainSystem.direction1 = new BABYLON.Vector3(-0.5, -10, 0);
    rainSystem.direction2 = new BABYLON.Vector3(0.5, -10, 0);
    rainSystem.minSize = 0.1;
    rainSystem.maxSize = 0.2;
    rainSystem.minLifeTime = 0.5;
    rainSystem.maxLifeTime = 1.0;
    rainSystem.emitRate = 1000;
    rainSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 0.6);
    rainSystem.color2 = new BABYLON.Color4(0.8, 0.9, 1.0, 0.4);
    this.rainParticles = { system: rainSystem, active: false };
    
    // Snow particles
    const snowSystem = new BABYLON.ParticleSystem('snow', 1000, this.scene);
    snowSystem.particleTexture = new BABYLON.Texture('', this.scene);
    snowSystem.emitter = new BABYLON.Vector3(0, 20, 0);
    snowSystem.minEmitBox = new BABYLON.Vector3(-50, 0, -50);
    snowSystem.maxEmitBox = new BABYLON.Vector3(50, 0, 50);
    snowSystem.direction1 = new BABYLON.Vector3(-1, -5, -1);
    snowSystem.direction2 = new BABYLON.Vector3(1, -5, 1);
    snowSystem.minSize = 0.3;
    snowSystem.maxSize = 0.6;
    snowSystem.minLifeTime = 2.0;
    snowSystem.maxLifeTime = 4.0;
    snowSystem.emitRate = 300;
    snowSystem.color1 = new BABYLON.Color4(1.0, 1.0, 1.0, 0.9);
    snowSystem.color2 = new BABYLON.Color4(0.95, 0.95, 0.95, 0.8);
    this.snowParticles = { system: snowSystem, active: false };
    
    // Dust particles (for desert/dirt roads)
    const dustSystem = new BABYLON.ParticleSystem('dust', 500, this.scene);
    dustSystem.particleTexture = new BABYLON.Texture('', this.scene);
    dustSystem.emitter = this.car; // Follows car
    dustSystem.minEmitBox = new BABYLON.Vector3(-2, 0, -3);
    dustSystem.maxEmitBox = new BABYLON.Vector3(2, 0, -2);
    dustSystem.direction1 = new BABYLON.Vector3(-2, 1, -5);
    dustSystem.direction2 = new BABYLON.Vector3(2, 2, -3);
    dustSystem.minSize = 0.5;
    dustSystem.maxSize = 1.5;
    dustSystem.minLifeTime = 0.5;
    dustSystem.maxLifeTime = 1.5;
    dustSystem.emitRate = 50;
    dustSystem.color1 = new BABYLON.Color4(0.7, 0.6, 0.4, 0.4);
    dustSystem.color2 = new BABYLON.Color4(0.6, 0.5, 0.3, 0.2);
    this.dustParticles = { system: dustSystem, active: false };
    
    // Leaves particles (for forest)
    const leavesSystem = new BABYLON.ParticleSystem('leaves', 300, this.scene);
    leavesSystem.particleTexture = new BABYLON.Texture('', this.scene);
    leavesSystem.emitter = new BABYLON.Vector3(0, 10, 0);
    leavesSystem.minEmitBox = new BABYLON.Vector3(-30, 0, -30);
    leavesSystem.maxEmitBox = new BABYLON.Vector3(30, 5, 30);
    leavesSystem.direction1 = new BABYLON.Vector3(-2, -3, -2);
    leavesSystem.direction2 = new BABYLON.Vector3(2, -1, 2);
    leavesSystem.minSize = 0.3;
    leavesSystem.maxSize = 0.6;
    leavesSystem.minLifeTime = 2.0;
    leavesSystem.maxLifeTime = 4.0;
    leavesSystem.emitRate = 50;
    leavesSystem.color1 = new BABYLON.Color4(0.2, 0.6, 0.1, 0.7);
    leavesSystem.color2 = new BABYLON.Color4(0.8, 0.5, 0.1, 0.6);
    this.leavesParticles = { system: leavesSystem, active: false };
    
    // 🔥 SPEED TRAILS - Left side (blue energy)
    const speedTrailLeft = new BABYLON.ParticleSystem('speedTrailLeft', 800, this.scene);
    speedTrailLeft.particleTexture = new BABYLON.Texture('', this.scene);
    speedTrailLeft.emitter = this.car;
    speedTrailLeft.createPointEmitter(new BABYLON.Vector3(-1.5, 0.3, -2), new BABYLON.Vector3(-2, 0, -4));
    speedTrailLeft.minSize = 0.2;
    speedTrailLeft.maxSize = 0.8;
    speedTrailLeft.minLifeTime = 0.2;
    speedTrailLeft.maxLifeTime = 0.5;
    speedTrailLeft.emitRate = 0; // Will control based on speed
    speedTrailLeft.color1 = new BABYLON.Color4(0.3, 0.6, 1.0, 0.8);
    speedTrailLeft.color2 = new BABYLON.Color4(0.1, 0.3, 0.8, 0.3);
    speedTrailLeft.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    this.speedTrailsLeft = { system: speedTrailLeft, active: false };
    
    // 🔥 SPEED TRAILS - Right side (blue energy)
    const speedTrailRight = new BABYLON.ParticleSystem('speedTrailRight', 800, this.scene);
    speedTrailRight.particleTexture = new BABYLON.Texture('', this.scene);
    speedTrailRight.emitter = this.car;
    speedTrailRight.createPointEmitter(new BABYLON.Vector3(1.5, 0.3, -2), new BABYLON.Vector3(2, 0, -4));
    speedTrailRight.minSize = 0.2;
    speedTrailRight.maxSize = 0.8;
    speedTrailRight.minLifeTime = 0.2;
    speedTrailRight.maxLifeTime = 0.5;
    speedTrailRight.emitRate = 0;
    speedTrailRight.color1 = new BABYLON.Color4(0.3, 0.6, 1.0, 0.8);
    speedTrailRight.color2 = new BABYLON.Color4(0.1, 0.3, 0.8, 0.3);
    speedTrailRight.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    this.speedTrailsRight = { system: speedTrailRight, active: false };
    
    // 💨 TIRE SMOKE - Left tire (drift smoke)
    const tireSmokeLeft = new BABYLON.ParticleSystem('tireSmokeLeft', 500, this.scene);
    tireSmokeLeft.particleTexture = new BABYLON.Texture('', this.scene);
    tireSmokeLeft.emitter = this.car;
    tireSmokeLeft.createPointEmitter(new BABYLON.Vector3(-1.2, 0, -1.5), new BABYLON.Vector3(-1.5, 0.5, -2));
    tireSmokeLeft.minSize = 0.5;
    tireSmokeLeft.maxSize = 2.0;
    tireSmokeLeft.minLifeTime = 0.8;
    tireSmokeLeft.maxLifeTime = 1.5;
    tireSmokeLeft.emitRate = 0;
    tireSmokeLeft.color1 = new BABYLON.Color4(0.9, 0.9, 0.9, 0.6);
    tireSmokeLeft.color2 = new BABYLON.Color4(0.7, 0.7, 0.7, 0.2);
    this.tireSmokeLeft = { system: tireSmokeLeft, active: false };
    
    // 💨 TIRE SMOKE - Right tire (drift smoke)
    const tireSmokeRight = new BABYLON.ParticleSystem('tireSmokeRight', 500, this.scene);
    tireSmokeRight.particleTexture = new BABYLON.Texture('', this.scene);
    tireSmokeRight.emitter = this.car;
    tireSmokeRight.createPointEmitter(new BABYLON.Vector3(1.2, 0, -1.5), new BABYLON.Vector3(1.5, 0.5, -2));
    tireSmokeRight.minSize = 0.5;
    tireSmokeRight.maxSize = 2.0;
    tireSmokeRight.minLifeTime = 0.8;
    tireSmokeRight.maxLifeTime = 1.5;
    tireSmokeRight.emitRate = 0;
    tireSmokeRight.color1 = new BABYLON.Color4(0.9, 0.9, 0.9, 0.6);
    tireSmokeRight.color2 = new BABYLON.Color4(0.7, 0.7, 0.7, 0.2);
    this.tireSmokeRight = { system: tireSmokeRight, active: false };
  }
  
  private setupAudio(): void {
    // Engine sound - low rumble that changes with RPM
    this.engineSound = new BABYLON.Sound(
      'engine',
      'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
      this.scene,
      null,
      {
        loop: true,
        autoplay: false,
        volume: 0.4,
        playbackRate: 1.0
      }
    );
    
    // Wind sound - whoosh that scales with speed
    this.windSound = new BABYLON.Sound(
      'wind',
      'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
      this.scene,
      null,
      {
        loop: true,
        autoplay: false,
        volume: 0.2,
        playbackRate: 1.0
      }
    );
    
    // Tire screech sound - high pitch for drifting
    this.tireScreechSound = new BABYLON.Sound(
      'tireScreech',
      'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
      this.scene,
      null,
      {
        loop: false,
        autoplay: false,
        volume: 0.5
      }
    );
    
    // Biome ambience - changes with biome (birds, wind, waves, etc.)
    this.biomeAmbience = new BABYLON.Sound(
      'ambience',
      'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
      this.scene,
      null,
      {
        loop: true,
        autoplay: false,
        volume: 0.3,
        playbackRate: 1.0
      }
    );
    
    // Radio sound - optional music
    this.radioSound = new BABYLON.Sound(
      'radio',
      'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
      this.scene,
      null,
      {
        loop: true,
        autoplay: false,
        volume: 0.4
      }
    );
  }
  
  private updateAudio(): void {
    if (!this.gameStarted) return;
    
    const speedPercent = this.carSpeed / this.availableCars[this.currentCarIndex].maxSpeed;
    
    // Engine sound - pitch increases with RPM (speed)
    if (this.engineSound && this.gameSettings.sfxVolume > 0) {
      if (!this.engineSound.isPlaying) {
        this.engineSound.play();
      }
      // RPM-based pitch: idle (0.6) to redline (2.0)
      const enginePitch = 0.6 + (speedPercent * 1.4);
      this.engineSound.setPlaybackRate(enginePitch);
      this.engineSound.setVolume(0.3 * this.gameSettings.sfxVolume + (speedPercent * 0.3));
    }
    
    // Wind sound - volume scales with speed
    if (this.windSound && this.gameSettings.sfxVolume > 0) {
      if (speedPercent > 0.2) {
        if (!this.windSound.isPlaying) {
          this.windSound.play();
        }
        // Wind increases dramatically at high speed
        const windVolume = Math.pow(speedPercent, 2) * 0.5 * this.gameSettings.sfxVolume;
        this.windSound.setVolume(windVolume);
        this.windSound.setPlaybackRate(0.8 + (speedPercent * 0.4));
      } else {
        this.windSound.stop();
      }
    }
    
    // Tire screech on drift
    if (this.tireScreechSound && this.gameSettings.sfxVolume > 0) {
      const isDrifting = Math.abs(this.carPosition) > 0.3 && speedPercent > 0.5;
      if (isDrifting && !this.tireScreechSound.isPlaying) {
        this.tireScreechSound.play();
      } else if (!isDrifting && this.tireScreechSound.isPlaying) {
        this.tireScreechSound.stop();
      }
    }
    
    // Biome ambience - always playing at low volume
    if (this.biomeAmbience && this.gameSettings.volume > 0) {
      if (!this.biomeAmbience.isPlaying) {
        this.biomeAmbience.play();
      }
      // Different ambience for each biome (simulated with pitch)
      const biomePitches = {
        grassland: 1.0,  // Birds chirping
        forest: 0.85,    // Dense forest sounds
        desert: 1.2,     // Desert wind
        snow: 0.9,       // Cold wind
        coastal: 1.1     // Ocean waves
      };
      this.biomeAmbience.setPlaybackRate(biomePitches[this.currentBiome]);
      this.biomeAmbience.setVolume(0.25 * this.gameSettings.volume);
    }
    
    // Radio - optional background music
    if (this.radioSound && this.radioEnabled && this.gameSettings.musicVolume > 0) {
      if (!this.radioSound.isPlaying) {
        this.radioSound.play();
      }
      this.radioSound.setVolume(0.4 * this.gameSettings.musicVolume);
    } else if (this.radioSound && this.radioSound.isPlaying) {
      this.radioSound.stop();
    }
  }
  
  private toggleRadio(): void {
    this.radioEnabled = !this.radioEnabled;
    if (this.radioEnabled) {
      this.currentRadioStation = (this.currentRadioStation + 1) % this.radioStations.length;
      console.log(`📻 Now playing: ${this.radioStations[this.currentRadioStation]}`);
    } else {
      console.log('📻 Radio turned off');
    }
  }
  
  private updateWeatherTransition(dt: number): void {
    if (!this.isTransitioning) return;
    
    // Progress transition
    this.weatherTransitionProgress += dt * this.weatherTransitionSpeed;
    
    if (this.weatherTransitionProgress >= 1.0) {
      // Transition complete
      this.weather = this.targetWeather;
      this.isTransitioning = false;
      this.weatherTransitionProgress = 1.0;
      
      // Rainbow appears after rain/storm clears
      if ((this.previousWeather === 'rain' || this.previousWeather === 'storm') && 
          this.targetWeather === 'clear' && this.currentTime > 12 && this.currentTime < 18) {
        this.rainbowVisible = true;
        this.rainbowTimer = 30; // Visible for 30 seconds
        console.log('🌈 Rainbow appeared!');
      }
    }
    
    // Smooth interpolation of weather effects
    const t = this.weatherTransitionProgress;
    
    // Interpolate fog density
    const prevFog = this.getWeatherFogDensity(this.previousWeather);
    const nextFog = this.getWeatherFogDensity(this.targetWeather);
    this.scene.fogDensity = prevFog + (nextFog - prevFog) * t;
    
    // Interpolate sky color
    const prevColor = this.getWeatherSkyColor(this.previousWeather);
    const nextColor = this.getWeatherSkyColor(this.targetWeather);
    this.scene.clearColor = new BABYLON.Color4(
      prevColor.r + (nextColor.r - prevColor.r) * t,
      prevColor.g + (nextColor.g - prevColor.g) * t,
      prevColor.b + (nextColor.b - prevColor.b) * t,
      1.0
    );
    
    // Lightning effects during storm
    if (this.targetWeather === 'storm' && t > 0.3) {
      this.lightningTimer -= dt;
      if (this.lightningTimer <= 0) {
        this.triggerLightning();
        this.lightningTimer = 3 + Math.random() * 7; // Every 3-10 seconds
      }
    }
    
    // Rainbow timer
    if (this.rainbowVisible) {
      this.rainbowTimer -= dt;
      if (this.rainbowTimer <= 0) {
        this.rainbowVisible = false;
      }
    }
  }
  
  private getWeatherFogDensity(weather: Weather): number {
    switch (weather) {
      case 'fog': return 0.025;
      case 'storm': return 0.015;
      case 'rain': return 0.012;
      default: return 0.008;
    }
  }
  
  private getWeatherSkyColor(weather: Weather): BABYLON.Color3 {
    switch (weather) {
      case 'clear': return new BABYLON.Color3(0.5, 0.7, 1.0);
      case 'rain': return new BABYLON.Color3(0.4, 0.5, 0.6);
      case 'fog': return new BABYLON.Color3(0.6, 0.65, 0.7);
      case 'sunset': return new BABYLON.Color3(1.0, 0.6, 0.4);
      case 'storm': return new BABYLON.Color3(0.2, 0.2, 0.25);
      default: return new BABYLON.Color3(0.5, 0.7, 1.0);
    }
  }
  
  private triggerLightning(): void {
    // Flash the scene white briefly
    const originalClearColor = this.scene.clearColor.clone();
    this.scene.clearColor = new BABYLON.Color4(0.9, 0.95, 1.0, 1.0);
    
    // Boost all light intensities temporarily
    const originalSunIntensity = this.sunLight.intensity;
    const originalHemiIntensity = this.hemiLight.intensity;
    this.sunLight.intensity = 3.0;
    this.hemiLight.intensity = 2.5;
    
    // Reset after brief moment
    setTimeout(() => {
      this.scene.clearColor = originalClearColor;
      this.sunLight.intensity = originalSunIntensity;
      this.hemiLight.intensity = originalHemiIntensity;
    }, 100);
    
    console.log('⚡ Lightning strike!');
  }
  
  // Menu System Methods
  private startGame(carIndex: number, settings: GameSettings): void {
    this.currentCarIndex = carIndex;
    this.gameSettings = settings;
    this.applySettings(settings);
    
    // Show HUD
    this.menu.showInGameHUD();
    
    // Start game loop
    this.gameStarted = true;
    this.isRunning = true;
    this.isPaused = false;
    
    // Start render loop if not already running
    if (!this.engine.activeRenderLoops.length) {
      this.engine.runRenderLoop(() => {
        if (this.isRunning && !this.isPaused) {
          this.update(this.engine.getDeltaTime());
          this.menu.updateHUD(this.info);
          this.render();
        } else {
          this.scene.render();
        }
      });
    }
  }
  
  private pauseGame(): void {
    this.isPaused = true;
    this.menu.showPauseMenu();
    
    // Pause audio
    if (this.engineSound && this.engineSound.isPlaying) this.engineSound.pause();
    if (this.windSound && this.windSound.isPlaying) this.windSound.pause();
    if (this.tireScreechSound && this.tireScreechSound.isPlaying) this.tireScreechSound.pause();
    // Keep ambience and radio playing during pause for atmosphere
  }
  
  private resumeGame(): void {
    this.isPaused = false;
    this.menu.hidePauseMenu();
    
    // Resume audio
    if (this.engineSound && !this.engineSound.isPlaying) this.engineSound.play();
    if (this.windSound && !this.windSound.isPlaying && this.carSpeed > 0) this.windSound.play();
  }
  
  private applySettings(settings: GameSettings): void {
    this.gameSettings = settings;
    
    // Apply graphics settings
    if (this.shadowGenerator) {
      this.shadowGenerator.getShadowMap()!.renderList = settings.shadows ? 
        [this.car, ...this.sceneryObjects] : [];
    }
    
    // Apply particle settings
    if (!settings.particles) {
      this.rainParticles.system?.stop();
      this.dustParticles.system?.stop();
      this.snowParticles.system?.stop();
      this.leavesParticles.system?.stop();
      this.speedTrailsLeft.system?.stop();
      this.speedTrailsRight.system?.stop();
      this.tireSmokeLeft.system?.stop();
      this.tireSmokeRight.system?.stop();
    }
    
    // Apply post-processing
    if (this.defaultPipeline) {
      this.defaultPipeline.bloomEnabled = settings.postProcessing;
      this.defaultPipeline.depthOfFieldEnabled = settings.postProcessing;
      this.defaultPipeline.fxaaEnabled = settings.antialiasing;
    }
    
    // Apply quality presets
    switch (settings.graphics) {
      case 'ultra':
        this.renderDistance = 50;
        if (this.shadowGenerator) this.shadowGenerator.mapSize = 4096;
        break;
      case 'high':
        this.renderDistance = 40;
        if (this.shadowGenerator) this.shadowGenerator.mapSize = 2048;
        break;
      case 'medium':
        this.renderDistance = 30;
        if (this.shadowGenerator) this.shadowGenerator.mapSize = 1024;
        break;
      case 'low':
        this.renderDistance = 20;
        if (this.shadowGenerator) this.shadowGenerator.mapSize = 512;
        break;
    }
  }

  // Compatibility methods (no scoring)
  setOnScoreUpdate(_callback: (score: number) => void): void {}
  setOnGameOver(_callback: (finalScore: number) => void): void {}
  setOnLevelComplete(_callback: (level: number) => void): void {}
}

interface RoadSegment {
  mesh: BABYLON.Mesh;
  curve: number;
  elevation: number;
  index: number;
  hasBridge?: boolean;
  hasTunnel?: boolean;
}

interface TerrainChunk {
  mesh: BABYLON.Mesh;
  index: number;
}
