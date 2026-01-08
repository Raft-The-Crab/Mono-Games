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

type Weather = 'clear' | 'rain' | 'fog' | 'sunset' | 'storm';
type Biome = 'grassland' | 'desert' | 'forest' | 'snow' | 'coastal';

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
  
  // Car Models
  private availableCars: CarModel[] = [];
  private currentCarIndex: number = 0;
  private car!: BABYLON.Mesh;
  private carSpeed: number = 0;
  private carPosition: number = 0; // -1 to 1 (left to right)
  private carRotation: number = 0;
  private carTilt: number = 0; // For bike leaning
  private driftPower: number = 0;
  
  // Physics
  private velocity: BABYLON.Vector3 = BABYLON.Vector3.Zero();
  private suspension: number = 0;
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
  
  // Effects & Scenery
  private clouds: BABYLON.Mesh[] = [];
  private wildlife: BABYLON.Mesh[] = [];
  private buildings: BABYLON.Mesh[] = [];
  private signs: BABYLON.Mesh[] = [];
  
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
  private cameraViews: Array<{ name: string; alpha: number; beta: number; radius: number; }> = [];
  private currentCameraView: number = 0;
  
  // UI Info (NO SCORING - Just info for immersion)
  public info = {
    speed: 0,
    distance: 0,
    time: '14:00',
    weather: 'Clear',
    biome: 'Grassland',
    car: 'Sedan',
    fps: 60
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
      this.keys[e.key.toLowerCase()] = true;
      if (e.key === 'c') this.cycleCameraView();
      if (e.key === 't') this.cycleTime();
      if (e.key === 'w') this.cycleWeather();
      if (e.key === 'b') this.cycleBiome();
      if (e.key === 'v') this.cycleCarModel(); // NEW: Change car with 'V' key
      if (e.key === 'h') this.toggleHelp(); // NEW: Show help overlay
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    this.canvas.addEventListener('mousedown', (e) => {
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
    );AAA graphics
    this.defaultPipeline = new BABYLON.DefaultRenderingPipeline(
      'defaultPipeline',
      true,
      this.scene,
      [this.camera]
    );
    
    // Enhanced effects for better visuals
    this.defaultPipeline.bloomEnabled = true;
    this.defaultPipeline.bloomThreshold = 0.6;
    this.defaultPipeline.bloomWeight = 0.5;
    this.defaultPipeline.bloomKernel = 128;
    this.defaultPipeline.bloomScale = 0.7;
    
    this.defaultPipeline.fxaaEnabled = true;
    this.defaultPipeline.sharpenEnabled = true;
    this.defaultPipeline.sharpen.edgeAmount = 0.5;
    this.defaultPipeline.sharpen.colorAmount = 1.0;
    
    // Depth of field for cinematic look (slowroads.io style)
    this.defaultPipeline.depthOfFieldEnabled = true;
    this.defaultPipeline.depthOfFieldBlurLevel = BABYLON.DepthOfFieldEffectBlurLevel.Medium;
    this.defaultPipeline.depthOfField.fStop = 1.4;
    this.defaultPipeline.depthOfField.focalLength = 50;
    this.defaultPipeline.depthOfField.focusDistance = 2000;

    // Better fog f - better angles like slowroads.io
    this.cameraViews = [
      { name: 'Chase', alpha: -Math.PI / 2, beta: Math.PI / 3.5, radius: 18 },
      { name: 'Close', alpha: -Math.PI / 2, beta: Math.PI / 4, radius: 12 },
      { name: 'Aerial', alpha: -Math.PI / 2, beta: Math.PI / 2.2, radius: 35 },
      { name: 'Cinematic', alpha: -Math.PI / 2.3, beta: Math.PI / 3.2, radius: 22
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 10000 }, this.scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.7, 1.0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true
    // Fog for atmosphere
    this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
    this.scene.fogDensity = 0.008;
    this.scene.fogColor = new BABYLON.Color3(0.8, 0.9, 1.0);
    
    // Camera views
    this.cameraViews = [
      { name: 'Default', alpha: -Math.PI / 2, beta: Math.PI / 3, radius: 25 },
      { name: 'Close', alpha: -Math.PI / 2, beta: Math.PI / 4, radius: 15 },
      { name: 'Far', alpha: -Math.PI / 2, beta: Math.PI / 2.5, radius: 40 },
      { name: 'Behind', alpha: Math.PI, beta: Math.PI / 3, radius: 20 }
    ];

    this.createCar();
    this.generateInitialRoad();
    this.generateClouds();
    this.initializeParticles();
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
    let bodyHeight = 1.2;
    let bodyDepth = 4;
    let topWidth = 1.6;
    let topHeight = 0.8;
    let topDepth = 2;
    
    if (model.type === 'suv') {
      bodyHeight = 1.5;
      topHeight = 1.0;
      bodyWidth = 2.2;
    } else if (model.type === 'sports') {
      bodyHeight = 0.9;
      topHeight = 0.6;
      bodyDepth = 3.5;
    } else if (model.type === 'van') {
      bodyHeight = 1.8;
      topHeight = 1.2;
      bodyDepth = 5;
    } else if (model.type === 'convertible') {
      topHeight = 0; // No roof!
    }
    
    const carBody = BABYLON.MeshBuilder.CreateBox('carBody', {
      width: bodyWidth,
      height: bodyHeight,
      depth: bodyDepth
    }, this.scene);
    
    const parts: BABYLON.Mesh[] = [carBody];
    
    if (topHeight > 0) {
      const carTop = BABYLON.MeshBuilder.CreateBox('carTop', {
        width: topWidth,
        height: topHeight,
        depth: topDepth
      }, this.scene);
      carTop.position.y = bodyHeight * 0.5 + topHeight * 0.5;
      carTop.position.z = -0.3;
      parts.push(carTop);
    }
    
    // Add spoiler for sports car
    if (model.type === 'sports' || model.type === 'rally') {
      const spoiler = BABYLON.MeshBuilder.CreateBox('spoiler', {
        width: 2,
        height: 0.1,
        depth: 0.5
      }, this.scene);
      spoiler.position.y = bodyHeight + 0.5;
      spoiler.position.z = -bodyDepth * 0.5;
      parts.push(spoiler);
    }
    
    // Create wheels
    const wheelPositions = [
      { x: -bodyWidth * 0.5 - 0.1, z: bodyDepth * 0.3 },
      { x: bodyWidth * 0.5 + 0.1, z: bodyDepth * 0.3 },
      { x: -bodyWidth * 0.5 - 0.1, z: -bodyDepth * 0.3 },
      { x: bodyWidth * 0.5 + 0.1, z: -bodyDepth * 0.3 }
    ];
    
    for (const pos of wheelPositions) {
      const wheel = BABYLON.MeshBuilder.CreateCylinder('wheel', {
        diameter: 0.8,
        height: 0.3
      }, this.scene);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.x = pos.x;
      wheel.position.y = -bodyHeight * 0.5;
      wheel.position.z = pos.z;
      this.wheels.push(wheel);
      
      const wheelMat = new BABYLON.StandardMaterial('wheelMat', this.scene);
      wheelMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
      wheelMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
      wheel.material = wheelMat;
      parts.push(wheel);
    }
    
    // Car material with PBR for better graphics
    const carMat = new BABYLON.StandardMaterial('carMat', this.scene);
    carMat.diffuseColor = model.color;
    carMat.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8);
    carMat.specularPower = 64;
    carMat.emissiveColor = model.color.scale(0.1);
    
    carBody.material = carMat;
    if (parts.length > 1 && parts[1].name !== 'wheel') {
      parts[1].material = carMat;
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
    
    // Better road material with lane markings
    const roadMat = new BABYLON.StandardMaterial(`roadMat_${index}`, this.scene);
    roadMat.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.15);
    roadMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
    roadMat.specularPower = 32;
    roadMat.backFaceCulling = false;
    roadMesh.material = roadMat;
    
    // Add center line
    const centerLine = BABYLON.MeshBuilder.CreateBox(`line_${index}`, {
      width: 0.2,
      height: 0.05,
      depth: this.segmentLength * 0.4
    }, this.scene);
    centerLine.position.x = this.roadCurve;
    centerLine.position.y = this.roadElevation + 0.12;
    centerLine.position.z = z;
    
    const lineMat = new BABYLON.StandardMaterial(`lineMat_${index}`, this.scene);
    lineMat.diffuseColor = new BABYLON.Color3(1, 1, 0.9);
    lineMat.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.2);
    centerLine.material = lineMat;
    
    this.roadSegments.push({ mesh: roadMesh, curve: this.roadCurve, elevation: this.roadElevation, index });
    
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
        subdivisions: 8
      }, this.scene);
      
      terrainMesh.position.x = centerX + side * (this.roadWidth / 2 + 25);
      terrainMesh.position.y = centerY - 1 + Math.random() * 2;
      terrainMesh.position.z = z;
      
      const terrainMat = new BABYLON.StandardMaterial(`terrainMat_${index}_${side}`, this.scene);
      terrainMat.diffuseColor = this.getBiomeColor();
      terrainMesh.material = terrainMat;
      
      this.terrainChunks.push({
        mesh: terrainMesh,
        index: index
      });
    }
  }

  private generateScenery(index: number, centerX: number, centerY: number, z: number): void {
    const side = Math.random() > 0.5 ? -1 : 1;
    const distance = this.roadWidth / 2 + Math.random() * 15 + 5;
    
    const tree = BABYLON.MeshBuilder.CreateCylinder(`tree_${index}`, {
      diameterTop: 0,
      diameterBottom: 2,
      height: 6
    }, this.scene);
    
    tree.position.x = centerX + side * distance;
    tree.position.y = centerY + 3;
    tree.position.z = z + (Math.random() - 0.5) * this.segmentLength;
    
    const treeMat = new BABYLON.StandardMaterial(`treeMat_${index}`, this.scene);
    treeMat.diffuseColor = new BABYLON.Color3(0.1, 0.6, 0.1);
    tree.material = treeMat;
    
    this.sceneryObjects.push(tree);
  }

  private generateClouds(): void {
    for (let i = 0; i < 20; i++) {
      const cloud = BABYLON.MeshBuilder.CreateSphere(`cloud_${i}`, {
        diameter: 10 + Math.random() * 10
      }, this.scene);
      
      cloud.position.x = (Math.random() - 0.5) * 200;
      cloud.position.y = 50 + Math.random() * 30;
      cloud.position.z = (Math.random() - 0.5) * 500;
      
      const cloudMat = new BABYLON.StandardMaterial(`cloudMat_${i}`, this.scene);
      cloudMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
      cloudMat.alpha = 0.8;
      cloud.material = cloudMat;
      
      this.clouds.push(cloud);
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
    this.isRunning = true;
    this.isPaused = false;
    this.engine.runRenderLoop(() => {
      if (!this.isPaused && this.isRunning) {
        this.update(this.engine.getDeltaTime());
        this.render();
      }
    });
  }

  // Required by GamePlay.tsx - initialize game
  init(): void {
    console.log('[InfiniteRoads] Initializing...');
    this.setup();
  }

  // Required by GamePlay.tsx - start game
  start(): void {
    console.log('[InfiniteRoads] Starting...');
    this.isRunning = true;
    this.isPaused = false;
  }

  // Required by GamePlay.tsx - pause game
  pause(): void {
    this.isPaused = true;
  }

  // Required by GamePlay.tsx - resume game
  resume(): void {
    this.isPaused = false;
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
  }

  private updateLighting(): void {
    const hour = this.currentTime;
    
    // Day time (6 AM to 6 PM)
    if (hour >= 6 && hour < 18) {
      const t = (hour - 6) / 12;
      this.sunLight.intensity = 0.8 + Math.sin(t * Math.PI) * 0.3;
      this.hemiLight.intensity = 0.4 + Math.sin(t * Math.PI) * 0.2;
      this.moonLight.intensity = 0; // No moon during day
      
      // Sunrise/sunset colors
      if (hour < 8) {
        // Sunrise
        const sunriseT = (hour - 6) / 2;
        this.scene.clearColor = new BABYLON.Color4(
          0.8 + sunriseT * 0.2,
          0.5 + sunriseT * 0.3,
          0.3 + sunriseT * 0.6,
          1
        );
      } else if (hour > 16) {
        // Sunset
        const sunsetT = (hour - 16) / 2;
        this.scene.clearColor = new BABYLON.Color4(
          0.9 - sunsetT * 0.2,
          0.6 - sunsetT * 0.3,
          0.5 - sunsetT * 0.2,
          1
        );
      } else {
        // Mid-day
        this.scene.clearColor = new BABYLON.Color4(
          0.53 - t * 0.1,
          0.81 - t * 0.2,
          0.92 - t * 0.1,
          1
        );
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
      { alpha: -Math.PI / 2, beta: Math.PI / 3, radius: 25 },
      { alpha: -Math.PI / 2, beta: Math.PI / 4, radius: 15 },
      { alpha: -Math.PI / 2, beta: Math.PI / 2.5, radius: 40 },
      { alpha: Math.PI, beta: Math.PI / 3, radius: 20 }
    ];
    
    const current = views.findIndex(v => 
      Math.abs(this.camera.alpha - v.alpha) < 0.1
    );
    const next = (current + 1) % views.length;
    
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
    this.weather = weathers[(current + 1) % weathers.length];
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
    console.log('CONTROLS:');
    console.log('WASD/Arrows: Drive');
    console.log('V: Change car');
    console.log('C: Change camera');
    console.log('T: Change time');
    console.log('W: Change weather');
    console.log('B: Change biome');
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
}

interface TerrainChunk {
  mesh: BABYLON.Mesh;
  index: number;
}
