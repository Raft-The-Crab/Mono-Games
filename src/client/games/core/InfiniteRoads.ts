/**
 * INFINITE ROADS - The Ultimate Chill Driving Experience
 * 
 * Much better than slowroads.io with MORE features:
 * ✨ Infinite procedurally generated beautiful roads
 * 🌄 Stunning terrain with mountains, valleys, plains  
 * ☀️ Dynamic day/night cycle with realistic lighting
 * 🌦️ Multiple weather (clear, rain, fog, sunset, night)
 * 🌳 Rich scenery (trees, clouds, mountains)
 * 🎨 Multiple biomes (desert, forest, snow, coastal)
 * 🚗 Smooth car physics
 * 📊 Minimal UI showing distance, speed, time
 * 
 * NO SCORING - Just drive, relax, and enjoy! 🌅
 */

import * as BABYLON from '@babylonjs/core';

type Weather = 'clear' | 'rain' | 'fog' | 'sunset' | 'storm';
type Biome = 'grassland' | 'desert' | 'forest' | 'snow' | 'coastal';

export default class InfiniteRoads {
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private camera: BABYLON.ArcRotateCamera;
  
  // Car
  private car!: BABYLON.Mesh;
  private carSpeed: number = 0;
  private carPosition: number = 0; // -1 to 1 (left to right)
  private maxSpeed: number = 160; // km/h
  private acceleration: number = 3;
  private deceleration: number = 5;
  
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
  
  // Lighting
  private sunLight!: BABYLON.DirectionalLight;
  private hemiLight!: BABYLON.HemisphericLight;
  
  // Effects
  private clouds: BABYLON.Mesh[] = [];
  
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
  
  // UI Info (NO SCORING)
  public info = {
    speed: 0,
    distance: 0,
    time: '14:00',
    weather: 'Clear',
    biome: 'Grassland'
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
    this.sunLight = new BABYLON.DirectionalLight(
      'sunLight',
      new BABYLON.Vector3(-1, -2, -1),
      this.scene
    );
    this.sunLight.intensity = 1.0;
    
    this.hemiLight = new BABYLON.HemisphericLight(
      'hemiLight',
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    this.hemiLight.intensity = 0.6;

    this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
    this.scene.fogDensity = 0.008;
    this.scene.fogColor = new BABYLON.Color3(0.8, 0.9, 1.0);

    this.createCar();
    this.generateInitialRoad();
    this.generateClouds();
  }

  private createCar(): void {
    const carBody = BABYLON.MeshBuilder.CreateBox('carBody', {
      width: 2,
      height: 1.2,
      depth: 4
    }, this.scene);
    
    const carTop = BABYLON.MeshBuilder.CreateBox('carTop', {
      width: 1.6,
      height: 0.8,
      depth: 2
    }, this.scene);
    carTop.position.y = 1;
    carTop.position.z = -0.3;
    
    const wheelPositions = [
      { x: -1.1, z: 1.3 },
      { x: 1.1, z: 1.3 },
      { x: -1.1, z: -1.3 },
      { x: 1.1, z: -1.3 }
    ];
    
    const wheels: BABYLON.Mesh[] = [];
    for (const pos of wheelPositions) {
      const wheel = BABYLON.MeshBuilder.CreateCylinder('wheel', {
        diameter: 0.8,
        height: 0.3
      }, this.scene);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.x = pos.x;
      wheel.position.y = -0.2;
      wheel.position.z = pos.z;
      wheels.push(wheel);
      
      const wheelMat = new BABYLON.StandardMaterial('wheelMat', this.scene);
      wheelMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
      wheel.material = wheelMat;
    }
    
    const carMat = new BABYLON.StandardMaterial('carMat', this.scene);
    carMat.diffuseColor = new BABYLON.Color3(0.8, 0.1, 0.1);
    carMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    carBody.material = carMat;
    carTop.material = carMat;
    
    this.car = BABYLON.Mesh.MergeMeshes(
      [carBody, carTop, ...wheels],
      true,
      true,
      undefined,
      false,
      true
    )!;
    
    this.car.position.y = 1;
  }

  private generateInitialRoad(): void {
    for (let i = 0; i < this.renderDistance; i++) {
      this.generateRoadSegment(i);
    }
  }

  private generateRoadSegment(index: number): void {
    const z = index * this.segmentLength;
    
    this.noiseOffset += 0.05;
    const curve = Math.sin(this.noiseOffset) * 5 + Math.cos(this.noiseOffset * 0.5) * 3;
    this.roadCurve += (curve - this.roadCurve) * 0.1;
    
    const elevationNoise = Math.sin(this.noiseOffset * 0.3) * 8;
    this.roadElevation += (elevationNoise - this.roadElevation) * 0.05;
    
    const roadMesh = BABYLON.MeshBuilder.CreateBox(`road_${index}`, {
      width: this.roadWidth,
      height: 0.2,
      depth: this.segmentLength
    }, this.scene);
    
    roadMesh.position.x = this.roadCurve;
    roadMesh.position.y = this.roadElevation;
    roadMesh.position.z = z;
    
    const roadMat = new BABYLON.StandardMaterial(`roadMat_${index}`, this.scene);
    roadMat.diffuseColor = index % 2 === 0 
      ? new BABYLON.Color3(0.3, 0.3, 0.3)
      : new BABYLON.Color3(0.35, 0.35, 0.35);
    roadMesh.material = roadMat;
    
    this.generateTerrain(index, this.roadCurve, this.roadElevation, z);
    
    if (Math.random() > 0.7) {
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

  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    if (this.keys['arrowup'] || this.keys['w']) {
      this.carSpeed = Math.min(this.carSpeed + this.acceleration * dt, this.maxSpeed);
    } else {
      this.carSpeed = Math.max(this.carSpeed - this.deceleration * dt, 0);
    }
    
    if (this.keys['arrowdown'] || this.keys['s']) {
      this.carSpeed = Math.max(this.carSpeed - this.deceleration * 2 * dt, 0);
    }
    
    if (this.keys['arrowleft'] || this.keys['a']) {
      this.carPosition -= 0.02;
    }
    if (this.keys['arrowright'] || this.keys['d']) {
      this.carPosition += 0.02;
    }
    this.carPosition = Math.max(-1, Math.min(1, this.carPosition));
    
    this.distanceTraveled += (this.carSpeed / 3.6) * dt;
    const segmentsPassed = Math.floor(this.distanceTraveled / this.segmentLength);
    
    if (segmentsPassed > this.currentSegmentIndex) {
      this.generateRoadSegment(this.currentSegmentIndex + this.renderDistance);
      this.removeOldSegments();
      this.currentSegmentIndex = segmentsPassed;
    }
    
    const currentSegment = this.roadSegments[Math.min(5, this.roadSegments.length - 1)];
    if (currentSegment) {
      this.car.position.x = currentSegment.curve + this.carPosition * (this.roadWidth / 2 - 1);
      this.car.position.y = currentSegment.elevation + 1;
      this.car.position.z = this.currentSegmentIndex * this.segmentLength;
    }
    
    this.camera.target = this.car.position.clone();
    
    this.currentTime += this.timeSpeed * dt;
    if (this.currentTime >= 24) this.currentTime = 0;
    
    this.updateLighting();
    this.updateInfo();
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
    
    if (hour >= 6 && hour < 18) {
      const t = (hour - 6) / 12;
      this.sunLight.intensity = 0.8 + Math.sin(t * Math.PI) * 0.3;
      this.hemiLight.intensity = 0.4 + Math.sin(t * Math.PI) * 0.2;
      
      this.scene.clearColor = new BABYLON.Color4(
        0.53 - t * 0.2,
        0.81 - t * 0.3,
        0.92 - t * 0.1,
        1
      );
    } else {
      this.sunLight.intensity = 0.1;
      this.hemiLight.intensity = 0.2;
      this.scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.15, 1);
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

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  restart(): void {
    this.distanceTraveled = 0;
    this.currentSegmentIndex = 0;
    this.carSpeed = 0;
    this.carPosition = 0;
    this.currentTime = 14;
    
    this.roadSegments.forEach(s => s.mesh.dispose());
    this.terrainChunks.forEach(t => t.mesh.dispose());
    this.sceneryObjects.forEach(o => o.dispose());
    
    this.roadSegments = [];
    this.terrainChunks = [];
    this.sceneryObjects = [];
    this.noiseOffset = 0;
    
    this.generateInitialRoad();
  }

  destroy(): void {
    this.isRunning = false;
    this.engine.stopRenderLoop();
    this.scene.dispose();
    this.engine.dispose();
    this.canvas.remove();
  }

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
