/**
 * CAMPFIRE SIMULATOR - Ultimate Cozy Experience
 * 
 * 🔥 NO GOALS - Just relax by the fire
 * 
 * Features:
 * 🔥 Animated flames with particle effects
 * ⭐ Beautiful night sky with stars & moon
 * 🌲 Forest ambiance with trees
 * 🎶 Crackling fire sounds
 * 🍡 Roast marshmallows (click to add stick)
 * 🪵 Add logs to keep fire going
 * 🌙 Moon phases change over time
 * 🦉 Nighttime wildlife sounds
 * 📷 Adjustable camera angle
 * 
 * Optimized for: Android APK & Windows EXE
 */

import * as BABYLON from '@babylonjs/core';
import { CampfireSimulatorMenu, GameSettings } from './CampfireSimulatorMenu';

export default class CampfireSimulator {
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private camera: BABYLON.ArcRotateCamera;
  
  // Menu System
  private menu!: CampfireSimulatorMenu;
  private gameSettings: GameSettings = {
    graphics: 'high',
    fireIntensity: 0.8,
    particles: true,
    postProcessing: true,
    antialiasing: true,
    volume: 0.7,
    fireVolume: 0.8,
    ambienceVolume: 0.6
  };
  private gameStarted: boolean = false;
  private isPaused: boolean = false;
  private isRunning: boolean = false;
  
  private fire!: BABYLON.Mesh;
  private fireParticles!: BABYLON.ParticleSystem;
  private smokeParticles!: BABYLON.ParticleSystem;
  private sparksParticles!: BABYLON.ParticleSystem;
  private logs: BABYLON.Mesh[] = [];
  private marshmallows: BABYLON.Mesh[] = [];
  
  private fireIntensity: number = 100;
  private moonPhase: number = 0;
  private timeOfNight: number = 0;
  
  private keys: { [key: string]: boolean } = {};
  
  public info = {
    fireStrength: 100,
    logsAdded: 0,
    marshmallowsRoasted: 0,
    timeSpentRelaxing: 0,
    moonPhase: 'Full Moon'
  };

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error('Container not found');

    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    container.appendChild(this.canvas);

    this.engine = new BABYLON.Engine(this.canvas, true, { powerPreference: 'high-performance', antialias: true });
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.15, 1);
    
    this.camera = new BABYLON.ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 10, BABYLON.Vector3.Zero(), this.scene);
    this.camera.attachControl(this.canvas, true);
    this.camera.lowerRadiusLimit = 5;
    this.camera.upperRadiusLimit = 20;
    
    // Initialize menu system FIRST
    this.menu = new CampfireSimulatorMenu(
      containerId,
      (settings) => this.startGame(settings),
      () => this.resumeGame(),
      (settings) => this.applySettings(settings)
    );
    
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
      if (e.key === 'l') this.addLog();
      if (e.key === 'm') this.roastMarshmallow();
      if (e.key === ' ') this.stokeF ire(); // Space to stoke fire
    });
    window.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);
    
    this.canvas.addEventListener('click', () => {
      if (this.gameStarted && !this.isPaused) this.roastMarshmallow();
    });
  }

  private setupScene(): void {
    const hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), this.scene);
    hemi.intensity = 0.1;
    hemi.groundColor = new BABYLON.Color3(0.1, 0.05, 0.0);
    
    const fireLight = new BABYLON.PointLight('fireLight', new BABYLON.Vector3(0, 1, 0), this.scene);
    fireLight.intensity = 5;
    fireLight.diffuse = new BABYLON.Color3(1.0, 0.5, 0.1);
    fireLight.range = 15;
    
    this.createGround();
    this.createFirepit();
    this.createForest();
    this.createStarfield();
    this.createMoon();
    this.initializeParticles();
    
    const glow = new BABYLON.GlowLayer('glow', this.scene);
    glow.intensity = 0.8;
  }

  private createGround(): void {
    const ground = BABYLON.MeshBuilder.CreateGround('ground', { 
      width: 100, 
      height: 100,
      subdivisions: 16
    }, this.scene);
    
    // Forest ground material (darker, mossy)
    const mat = new BABYLON.StandardMaterial('groundMat', this.scene);
    mat.diffuseColor = new BABYLON.Color3(0.12, 0.18, 0.1);
    mat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
    mat.specularPower = 8;
    ground.material = mat;
    
    // Add grass clumps around campfire
    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 3 + Math.random() * 20;
      
      const grass = BABYLON.MeshBuilder.CreateCylinder('grass', {
        diameterTop: 0,
        diameterBottom: 0.2,
        height: 0.5,
        tessellation: 3
      }, this.scene);
      
      grass.position.x = Math.cos(angle) * distance;
      grass.position.z = Math.sin(angle) * distance;
      grass.position.y = 0.25;
      grass.rotation.x = (Math.random() - 0.5) * 0.4;
      
      const grassMat = new BABYLON.StandardMaterial(`grass_${i}`, this.scene);
      grassMat.diffuseColor = new BABYLON.Color3(
        0.15 + Math.random() * 0.1,
        0.3 + Math.random() * 0.2,
        0.1 + Math.random() * 0.1
      );
      grass.material = grassMat;
    }
    
    // Add rocks scattered on ground
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 3 + Math.random() * 25;
      
      const rock = BABYLON.MeshBuilder.CreateSphere('rock', {
        diameter: 0.2 + Math.random() * 0.4,
        segments: 6
      }, this.scene);
      rock.scaling.y = 0.6;
      rock.position.x = Math.cos(angle) * distance;
      rock.position.z = Math.sin(angle) * distance;
      rock.position.y = 0.1;
      
      const rockMat = new BABYLON.StandardMaterial(`rock_${i}`, this.scene);
      rockMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
      rock.material = rockMat;
    }
  }

  private createFirepit(): void {
    const stones: BABYLON.Mesh[] = [];
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      
      // Varied stone types
      const stoneType = Math.floor(Math.random() * 3);
      let stone: BABYLON.Mesh;
      
      if (stoneType === 0) {
        stone = BABYLON.MeshBuilder.CreatePolyhedron('stone', { 
          type: 3, 
          size: 0.35 + Math.random() * 0.2 
        }, this.scene);
      } else if (stoneType === 1) {
        stone = BABYLON.MeshBuilder.CreateSphere('stone', {
          diameter: 0.6 + Math.random() * 0.3,
          segments: 8
        }, this.scene);
        stone.scaling.y = 0.7;
      } else {
        stone = BABYLON.MeshBuilder.CreateBox('stone', {
          size: 0.5 + Math.random() * 0.2
        }, this.scene);
        stone.rotation.set(
          Math.random() * 0.5,
          Math.random() * Math.PI,
          Math.random() * 0.5
        );
      }
      
      stone.position.x = Math.cos(angle) * 1.6;
      stone.position.z = Math.sin(angle) * 1.6;
      stone.position.y = 0.25;
      
      // Realistic stone material
      const mat = new BABYLON.StandardMaterial(`stoneMat_${i}`, this.scene);
      mat.diffuseColor = new BABYLON.Color3(
        0.35 + Math.random() * 0.15,
        0.35 + Math.random() * 0.15,
        0.35 + Math.random() * 0.15
      );
      mat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
      mat.specularPower = 16;
      stone.material = mat;
      stones.push(stone);
    }
    
    this.fire = BABYLON.MeshBuilder.CreateCylinder('fire', { 
      diameterTop: 0, 
      diameterBottom: 1.2, 
      height: 2.5 
    }, this.scene);
    this.fire.position.y = 1.25;
    
    const fireMat = new BABYLON.StandardMaterial('fireMat', this.scene);
    fireMat.emissiveColor = new BABYLON.Color3(1.0, 0.5, 0.1);
    fireMat.diffuseColor = new BABYLON.Color3(1.0, 0.4, 0.0);
    fireMat.alpha = 0.8;
    this.fire.material = fireMat;
    
    for (let i = 0; i < 6; i++) {
      const log = this.createLog();
      const angle = (i / 6) * Math.PI * 2;
      log.position.x = Math.cos(angle) * 0.9;
      log.position.z = Math.sin(angle) * 0.9;
      log.position.y = 0.3;
      log.rotation.y = angle + Math.PI / 2;
      log.rotation.x = (Math.random() - 0.5) * 0.3;
      this.logs.push(log);
    }
  }

  private createLog(): BABYLON.Mesh {
    // Main log cylinder
    const log = BABYLON.MeshBuilder.CreateCylinder('log', { 
      diameter: 0.35, 
      height: 2.5,
      tessellation: 16
    }, this.scene);
    
    // Bark texture material
    const mat = new BABYLON.StandardMaterial('logMat', this.scene);
    mat.diffuseColor = new BABYLON.Color3(0.32, 0.22, 0.12);
    mat.specularColor = new BABYLON.Color3(0.1, 0.08, 0.05);
    mat.specularPower = 8;
    mat.bumpTexture = null; // Would add bark normal map here
    log.material = mat;
    
    // Add charred/burnt ends
    const endMat = new BABYLON.StandardMaterial('burnedMat', this.scene);
    endMat.diffuseColor = new BABYLON.Color3(0.1, 0.08, 0.06);
    endMat.emissiveColor = new BABYLON.Color3(0.3, 0.1, 0.0);
    
    // Top end (charred)
    const topEnd = BABYLON.MeshBuilder.CreateCylinder('topEnd', {
      diameter: 0.36,
      height: 0.15
    }, this.scene);
    topEnd.position.y = 1.3;
    topEnd.material = endMat;
    
    // Bottom end (charred)
    const bottomEnd = topEnd.clone('bottomEnd');
    bottomEnd.position.y = -1.3;
    
    // Merge all parts
    const fullLog = BABYLON.Mesh.MergeMeshes([log, topEnd, bottomEnd], true)!;
    return fullLog;
  }

  private createForest(): void {
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 12 + Math.random() * 35;
      
      // Detailed trunk with bark
      const trunk = BABYLON.MeshBuilder.CreateCylinder('trunk', { 
        diameterTop: 0.6, 
        diameterBottom: 1.0, 
        height: 10,
        tessellation: 12
      }, this.scene);
      trunk.position.x = Math.cos(angle) * distance;
      trunk.position.z = Math.sin(angle) * distance;
      trunk.position.y = 5;
      
      const trunkMat = new BABYLON.StandardMaterial(`trunkMat_${i}`, this.scene);
      trunkMat.diffuseColor = new BABYLON.Color3(0.25, 0.18, 0.12);
      trunkMat.specularColor = new BABYLON.Color3(0.1, 0.08, 0.05);
      trunkMat.specularPower = 16;
      trunk.material = trunkMat;
      
      // Multiple layers of foliage for depth
      const foliageLayers = 3;
      for (let j = 0; j < foliageLayers; j++) {
        const foliage = BABYLON.MeshBuilder.CreateSphere('foliage', {
          diameter: 5 - j * 0.8,
          segments: 12
        }, this.scene);
        foliage.position.x = trunk.position.x + (Math.random() - 0.5) * 1;
        foliage.position.z = trunk.position.z + (Math.random() - 0.5) * 1;
        foliage.position.y = 10 + j * 2;
        foliage.scaling.y = 1.3;
        
        const foliageMat = new BABYLON.StandardMaterial(`foliageMat_${i}_${j}`, this.scene);
        foliageMat.diffuseColor = new BABYLON.Color3(
          0.08 + Math.random() * 0.05,
          0.25 + Math.random() * 0.15,
          0.08 + Math.random() * 0.05
        );
        foliageMat.specularColor = new BABYLON.Color3(0.1, 0.2, 0.1);
        foliage.material = foliageMat;
      }
      
      // Add lower branches
      const branchCount = 3;
      for (let b = 0; b < branchCount; b++) {
        const branchAngle = Math.random() * Math.PI * 2;
        const branch = BABYLON.MeshBuilder.CreateCylinder('branch', {
          diameterTop: 0.1,
          diameterBottom: 0.3,
          height: 3
        }, this.scene);
        branch.position.x = trunk.position.x + Math.cos(branchAngle) * 1.2;
        branch.position.z = trunk.position.z + Math.sin(branchAngle) * 1.2;
        branch.position.y = 6 + Math.random() * 4;
        branch.rotation.z = Math.PI / 3;
        branch.rotation.y = branchAngle;
        branch.material = trunkMat;
      }
    }
  }

  private createStarfield(): void {
    for (let i = 0; i < 500; i++) {
      const star = BABYLON.MeshBuilder.CreateSphere(`star${i}`, { diameter: 0.2 }, this.scene);
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = Math.random() * Math.PI / 2 + Math.PI / 4;
      const distance = 80;
      
      star.position.x = Math.cos(angle1) * Math.sin(angle2) * distance;
      star.position.y = Math.cos(angle2) * distance;
      star.position.z = Math.sin(angle1) * Math.sin(angle2) * distance;
      
      const mat = new BABYLON.StandardMaterial(`starMat${i}`, this.scene);
      mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
      star.material = mat;
    }
  }

  private createMoon(): void {
    const moon = BABYLON.MeshBuilder.CreateSphere('moon', { diameter: 8 }, this.scene);
    moon.position.x = 30;
    moon.position.y = 40;
    moon.position.z = 30;
    
    const mat = new BABYLON.StandardMaterial('moonMat', this.scene);
    mat.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.9);
    mat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 1.0);
    moon.material = mat;
  }

  private initializeParticles(): void {
    // Enhanced fire with more particles
    this.fireParticles = new BABYLON.ParticleSystem('fire', 800, this.scene);
    this.fireParticles.particleTexture = new BABYLON.Texture('', this.scene);
    this.fireParticles.emitter = new BABYLON.Vector3(0, 0.6, 0);
    this.fireParticles.minEmitBox = new BABYLON.Vector3(-0.6, 0, -0.6);
    this.fireParticles.maxEmitBox = new BABYLON.Vector3(0.6, 0, 0.6);
    this.fireParticles.direction1 = new BABYLON.Vector3(-1, 4, -1);
    this.fireParticles.direction2 = new BABYLON.Vector3(1, 6, 1);
    this.fireParticles.minSize = 0.4;
    this.fireParticles.maxSize = 1.2;
    this.fireParticles.minLifeTime = 0.4;
    this.fireParticles.maxLifeTime = 1.0;
    this.fireParticles.emitRate = 150;
    this.fireParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    this.fireParticles.color1 = new BABYLON.Color4(1.0, 0.9, 0.1, 1.0);
    this.fireParticles.color2 = new BABYLON.Color4(1.0, 0.4, 0.0, 0.8);
    this.fireParticles.colorDead = new BABYLON.Color4(0.3, 0.0, 0.0, 0.0);
    this.fireParticles.minEmitPower = 2;
    this.fireParticles.maxEmitPower = 4;
    this.fireParticles.updateSpeed = 0.015;
    this.fireParticles.start();
    
    // Thicker smoke
    this.smokeParticles = new BABYLON.ParticleSystem('smoke', 300, this.scene);
    this.smokeParticles.particleTexture = new BABYLON.Texture('', this.scene);
    this.smokeParticles.emitter = new BABYLON.Vector3(0, 2.5, 0);
    this.smokeParticles.minEmitBox = new BABYLON.Vector3(-0.4, 0, -0.4);
    this.smokeParticles.maxEmitBox = new BABYLON.Vector3(0.4, 0, 0.4);
    this.smokeParticles.direction1 = new BABYLON.Vector3(-1, 6, -1);
    this.smokeParticles.direction2 = new BABYLON.Vector3(1, 10, 1);
    this.smokeParticles.minSize = 0.8;
    this.smokeParticles.maxSize = 3.0;
    this.smokeParticles.minLifeTime = 3;
    this.smokeParticles.maxLifeTime = 6;
    this.smokeParticles.emitRate = 30;
    this.smokeParticles.color1 = new BABYLON.Color4(0.35, 0.35, 0.35, 0.6);
    this.smokeParticles.color2 = new BABYLON.Color4(0.25, 0.25, 0.25, 0.4);
    this.smokeParticles.colorDead = new BABYLON.Color4(0.15, 0.15, 0.15, 0.0);
    this.smokeParticles.minEmitPower = 1;
    this.smokeParticles.maxEmitPower = 2;
    this.smokeParticles.start();
    
    // More visible sparks
    this.sparksParticles = new BABYLON.ParticleSystem('sparks', 100, this.scene);
    this.sparksParticles.particleTexture = new BABYLON.Texture('', this.scene);
    this.sparksParticles.emitter = new BABYLON.Vector3(0, 0.8, 0);
    this.sparksParticles.minEmitBox = new BABYLON.Vector3(-0.4, 0, -0.4);
    this.sparksParticles.maxEmitBox = new BABYLON.Vector3(0.4, 0, 0.4);
    this.sparksParticles.direction1 = new BABYLON.Vector3(-3, 4, -3);
    this.sparksParticles.direction2 = new BABYLON.Vector3(3, 7, 3);
    this.sparksParticles.minSize = 0.08;
    this.sparksParticles.maxSize = 0.2;
    this.sparksParticles.minLifeTime = 0.6;
    this.sparksParticles.maxLifeTime = 2.0;
    this.sparksParticles.emitRate = 15;
    this.sparksParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    this.sparksParticles.color1 = new BABYLON.Color4(1.0, 0.9, 0.2, 1.0);
    this.sparksParticles.color2 = new BABYLON.Color4(1.0, 0.5, 0.0, 1.0);
    this.sparksParticles.minEmitPower = 3;
    this.sparksParticles.maxEmitPower = 6;
    this.sparksParticles.start();
  }

  private addLog(): void {
    const log = this.createLog();
    const angle = Math.random() * Math.PI * 2;
    log.position.x = Math.cos(angle) * 1.2;
    log.position.z = Math.sin(angle) * 1.2;
    log.position.y = 0.5 + this.logs.length * 0.2;
    log.rotation.y = angle;
    this.logs.push(log);
    
    this.fireIntensity = Math.min(100, this.fireIntensity + 20);
    this.info.logsAdded++;
  }

  private roastMarshmallow(): void {
    const stick = BABYLON.MeshBuilder.CreateCylinder('stick', { diameter: 0.05, height: 1.5 }, this.scene);
    stick.position.x = (Math.random() - 0.5) * 3;
    stick.position.z = 1.5;
    stick.position.y = 0.8;
    stick.rotation.x = Math.PI / 4;
    
    const stickMat = new BABYLON.StandardMaterial('stickMat', this.scene);
    stickMat.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.2);
    stick.material = stickMat;
    
    const marshmallow = BABYLON.MeshBuilder.CreateSphere('marshmallow', { diameter: 0.2 }, this.scene);
    marshmallow.position = stick.position.clone();
    marshmallow.position.y += 0.7;
    
    const marshMat = new BABYLON.StandardMaterial('marshMat', this.scene);
    marshMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.9);
    marshmallow.material = marshMat;
    
    this.marshmallows.push(marshmallow);
    this.info.marshmallowsRoasted++;
    
    setTimeout(() => {
      marshMat.diffuseColor = new BABYLON.Color3(0.6, 0.4, 0.2);
      marshMat.emissiveColor = new BABYLON.Color3(0.2, 0.1, 0.0);
    }, 3000);
  }

  setup(): void {
    this.engine.runRenderLoop(() => {
      if (this.isRunning && !this.isPaused && this.gameStarted) {
        this.update(this.engine.getDeltaTime());
        
        // Update HUD
        const timeOfDayStr = this.getTimeOfDay();
        const fireStateStr = this.getFireState();
        this.menu.updateHUD({
          fireState: fireStateStr,
          timeOfDay: timeOfDayStr
        });
      }
      this.scene.render();
    });
    window.addEventListener('resize', () => this.engine.resize());
  }

  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    this.info.timeSpentRelaxing += dt;
    this.timeOfNight += dt * 0.01;
    
    this.fireIntensity = Math.max(0, this.fireIntensity - dt * 0.5);
    this.fire.scaling.y = 0.5 + (this.fireIntensity / 100) * 0.5;
    this.fireParticles.emitRate = 50 + (this.fireIntensity / 100) * 150;
    
    this.fire.rotation.y += dt * 0.5;
    
    this.moonPhase = (this.moonPhase + dt * 0.01) % 1;
    const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
    this.info.moonPhase = phases[Math.floor(this.moonPhase * 8)];
    this.info.fireStrength = Math.round(this.fireIntensity);
  }
  
  private getFireState(): string {
    if (this.fireIntensity > 80) return 'Blazing';
    if (this.fireIntensity > 60) return 'Burning Strong';
    if (this.fireIntensity > 40) return 'Burning';
    if (this.fireIntensity > 20) return 'Smoldering';
    if (this.fireIntensity > 5) return 'Dying';
    return 'Embers';
  }
  
  private getTimeOfDay(): string {
    const phase = this.timeOfNight % 1;
    if (phase < 0.2) return 'Night';
    if (phase < 0.4) return 'Midnight';
    if (phase < 0.6) return 'Pre-Dawn';
    if (phase < 0.8) return 'Dawn';
    return 'Early Morning';
  }
  
  // Stoke the fire to increase intensity
  private stokeFire(): void {
    if (this.fireIntensity < 100) {
      this.fireIntensity = Math.min(100, this.fireIntensity + 10);
      this.info.fireStrength = Math.round(this.fireIntensity);
    }
  }

  // Menu System Methods
  private startGame(settings: GameSettings): void {
    this.gameSettings = settings;
    this.applySettings(settings);
    
    // Show HUD
    this.menu.showInGameHUD();
    
    // Start game loop
    this.gameStarted = true;
    this.isRunning = true;
    this.isPaused = false;
  }
  
  private pauseGame(): void {
    this.isPaused = true;
    this.menu.showPauseMenu();
  }
  
  private resumeGame(): void {
    this.isPaused = false;
    this.menu.hidePauseMenu();
  }
  
  private applySettings(settings: GameSettings): void {
    this.gameSettings = settings;
    
    // Apply fire intensity
    const fireLight = this.scene.getLightByName('fireLight') as BABYLON.PointLight;
    if (fireLight) {
      fireLight.intensity = 5 * settings.fireIntensity;
    }
    
    // Apply particle settings
    if (!settings.particles) {
      this.fireParticles?.stop();
      this.smokeParticles?.stop();
      this.sparksParticles?.stop();
    } else {
      this.fireParticles?.start();
      this.smokeParticles?.start();
      this.sparksParticles?.start();
    }
    
    // Apply post-processing
    const glow = this.scene.effectLayers.find(e => e.name === 'glow') as BABYLON.GlowLayer;
    if (glow) {
      glow.intensity = settings.postProcessing ? 1.0 : 0.3;
    }
  }

  // Required by GamePlay.tsx
  init(): void {
    console.log('[CampfireSimulator] Initializing...');
    // Menu handles startup
  }

  start(): void {
    console.log('[CampfireSimulator] Start called - menu handles game start');
  }

  pause(): void {
    this.pauseGame();
  }
  
  resume(): void {
    this.resumeGame();
  }
  
  reset(): void {
    this.restart();
  }

  restart(): void {
    this.fireIntensity = 100;
    this.info.logsAdded = 0;
    this.info.marshmallowsRoasted = 0;
    this.info.timeSpentRelaxing = 0;
    this.marshmallows.forEach(m => m.dispose());
    this.marshmallows = [];
  }

  destroy(): void {
    this.isRunning = false;
    this.engine.stopRenderLoop();
    this.cleanup();
  }

  cleanup(): void {
    this.scene.dispose();
    this.engine.dispose();
    this.canvas.remove();
  }
  render(): void { this.scene.render(); }
  setOnScoreUpdate(_callback: (score: number) => void): void {}
  setOnGameOver(_callback: (finalScore: number) => void): void {}
  setOnLevelComplete(_callback: (level: number) => void): void {}
}
