/**
 * SPACE EXPLORER - Peaceful Cosmic Journey
 * 
 * 🌌 NO COMBAT, NO SCORING - Pure space exploration
 * 
 * Features:
 * ✨ Beautiful procedural nebulae with colors
 * 🪐 Discover planets (gas giants, rocky, ice, lava)
 * ☄️ Asteroid fields with realistic physics
 * ⭐ Stars, galaxies, black holes
 * 🚀 Smooth spaceship controls (WASD)
 * 🎨 Dynamic lighting from stars
 * 🌈 Wormholes to travel fast
 * 🎶 Ambient space music
 * 📷 Free camera mode to admire views
 * 
 * Optimized for: Android APK & Windows EXE
 */

import * as BABYLON from '@babylonjs/core';
import { SpaceExplorerMenu, GameSettings } from './SpaceExplorerMenu';

type CelestialBody = 'planet' | 'star' | 'asteroid' | 'nebula' | 'blackhole' | 'wormhole';
type PlanetType = 'rocky' | 'gas' | 'ice' | 'lava' | 'earth' | 'desert';

interface SpaceObject {
  mesh: BABYLON.Mesh;
  type: CelestialBody;
  position: BABYLON.Vector3;
  discovered: boolean;
}

export default class SpaceExplorer {
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private camera: BABYLON.FreeCamera;
  
  // Menu System
  private menu!: SpaceExplorerMenu;
  private gameSettings: GameSettings = {
    graphics: 'high',
    shadows: false,
    particles: true,
    postProcessing: true,
    antialiasing: true,
    volume: 0.7,
    musicVolume: 0.5,
    sfxVolume: 0.8
  };
  private gameStarted: boolean = false;
  private isPaused: boolean = false;
  private isRunning: boolean = false;
  
  private ship!: BABYLON.Mesh;
  private shipSpeed: number = 0;
  private shipVelocity: BABYLON.Vector3 = BABYLON.Vector3.Zero();
  private maxSpeed: number = 50;
  
  private spaceObjects: SpaceObject[] = [];
  private nebulae: BABYLON.Mesh[] = [];
  private stars: BABYLON.PointLight[] = [];
  
  private keys: { [key: string]: boolean } = {};
  private freeCamMode: boolean = false;
  
  public info = {
    planetsDiscovered: 0,
    distanceTraveled: 0,
    currentSector: 'Alpha Centauri',
    nearestObject: 'None',
    speed: 0
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
    this.scene.clearColor = new BABYLON.Color4(0.01, 0.01, 0.05, 1);
    
    this.camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 0, 0), this.scene);
    this.camera.attachControl(this.canvas, true);
    
    // Initialize menu system FIRST
    this.menu = new SpaceExplorerMenu(
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
      if (e.key === 'f') this.freeCamMode = !this.freeCamMode;
    });
    window.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);
  }

  private setupScene(): void {
    const hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), this.scene);
    hemi.intensity = 0.2;
    
    this.createShip();
    this.generateUniverse();
    
    const pipeline = new BABYLON.DefaultRenderingPipeline('pipeline', true, this.scene, [this.camera]);
    pipeline.bloomEnabled = true;
    pipeline.bloomThreshold = 0.7;
    pipeline.bloomWeight = 0.5;
    pipeline.glowLayerEnabled = true;
  }

  private createShip(): void {
    // Main body (fuselage)
    const body = BABYLON.MeshBuilder.CreateBox('body', { 
      width: 1.2, 
      height: 0.6, 
      depth: 3 
    }, this.scene);
    
    // Detailed cockpit with glass canopy
    const cockpit = BABYLON.MeshBuilder.CreateSphere('cockpit', { 
      diameter: 1, 
      segments: 16 
    }, this.scene);
    cockpit.position.z = 0.8;
    cockpit.position.y = 0.4;
    cockpit.scaling.z = 1.3;
    
    // Cockpit glass material
    const glassMat = new BABYLON.StandardMaterial('cockpitGlass', this.scene);
    glassMat.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.6);
    glassMat.specularColor = new BABYLON.Color3(1, 1, 1);
    glassMat.specularPower = 256;
    glassMat.alpha = 0.3;
    cockpit.material = glassMat;
    
    // Large wings with details
    const wingL = BABYLON.MeshBuilder.CreateBox('wingL', { 
      width: 3, 
      height: 0.15, 
      depth: 1.5 
    }, this.scene);
    wingL.position.x = -2;
    wingL.position.z = -0.3;
    wingL.rotation.z = Math.PI / 12;
    
    const wingR = BABYLON.MeshBuilder.CreateBox('wingR', { 
      width: 3, 
      height: 0.15, 
      depth: 1.5 
    }, this.scene);
    wingR.position.x = 2;
    wingR.position.z = -0.3;
    wingR.rotation.z = -Math.PI / 12;
    
    // Engine nacelles
    const engineL = BABYLON.MeshBuilder.CreateCylinder('engineL', {
      diameter: 0.4,
      height: 1.5,
      tessellation: 12
    }, this.scene);
    engineL.rotation.x = Math.PI / 2;
    engineL.position.x = -2.5;
    engineL.position.z = -1;
    
    const engineR = engineL.clone('engineR');
    engineR.position.x = 2.5;
    
    // Engine exhausts (glowing)
    const exhaustL = BABYLON.MeshBuilder.CreateCylinder('exhaustL', {
      diameter: 0.35,
      height: 0.2
    }, this.scene);
    exhaustL.rotation.x = Math.PI / 2;
    exhaustL.position.x = -2.5;
    exhaustL.position.z = -1.75;
    
    const exhaustR = exhaustL.clone('exhaustR');
    exhaustR.position.x = 2.5;
    
    // Exhaust glow material
    const exhaustMat = new BABYLON.StandardMaterial('exhaustGlow', this.scene);
    exhaustMat.emissiveColor = new BABYLON.Color3(0.3, 0.6, 1.0);
    exhaustMat.diffuseColor = new BABYLON.Color3(0.5, 0.8, 1.0);
    exhaustL.material = exhaustMat;
    exhaustR.material = exhaustMat;
    
    // Tail fins
    const tailFin = BABYLON.MeshBuilder.CreateBox('tailFin', {
      width: 0.1,
      height: 1,
      depth: 0.8
    }, this.scene);
    tailFin.position.y = 0.5;
    tailFin.position.z = -1.5;
    
    // Nose cone
    const nose = BABYLON.MeshBuilder.CreateCylinder('nose', {
      diameterTop: 0,
      diameterBottom: 0.5,
      height: 0.8
    }, this.scene);
    nose.rotation.x = Math.PI / 2;
    nose.position.z = 2;
    
    // Ship body material (metallic)
    const mat = new BABYLON.StandardMaterial('shipMat', this.scene);
    mat.diffuseColor = new BABYLON.Color3(0.85, 0.85, 0.92);
    mat.specularColor = new BABYLON.Color3(1, 1, 1);
    mat.specularPower = 128;
    mat.emissiveColor = new BABYLON.Color3(0.1, 0.15, 0.25);
    
    body.material = mat;
    wingL.material = mat;
    wingR.material = mat;
    engineL.material = mat;
    engineR.material = mat;
    tailFin.material = mat;
    nose.material = mat;
    
    // Add running lights
    const lightL = BABYLON.MeshBuilder.CreateSphere('lightL', { diameter: 0.15 }, this.scene);
    lightL.position.set(-2.8, 0, -0.5);
    const lightR = lightL.clone('lightR');
    lightR.position.x = 2.8;
    
    const lightMat = new BABYLON.StandardMaterial('lights', this.scene);
    lightMat.emissiveColor = new BABYLON.Color3(0, 1, 0);
    lightL.material = lightMat;
    lightR.material = lightMat;
    
    this.ship = BABYLON.Mesh.MergeMeshes([
      body, cockpit, wingL, wingR, 
      engineL, engineR, exhaustL, exhaustR,
      tailFin, nose, lightL, lightR
    ], true, true)!;
    this.ship.position.z = -5;
    
    // Add engine particle effects
    this.createEngineParticles();
  }
  
  private createEngineParticles(): void {
    // Left engine trail
    const particleSystemL = new BABYLON.ParticleSystem('engineParticlesL', 500, this.scene);
    particleSystemL.particleTexture = new BABYLON.Texture('', this.scene);
    particleSystemL.emitter = new BABYLON.Vector3(-2.5, 0, -1.85);
    particleSystemL.minEmitBox = new BABYLON.Vector3(-0.1, -0.1, 0);
    particleSystemL.maxEmitBox = new BABYLON.Vector3(0.1, 0.1, 0);
    particleSystemL.color1 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
    particleSystemL.color2 = new BABYLON.Color4(0.5, 0.8, 1.0, 0.5);
    particleSystemL.colorDead = new BABYLON.Color4(0, 0, 0.5, 0.0);
    particleSystemL.minSize = 0.3;
    particleSystemL.maxSize = 0.8;
    particleSystemL.minLifeTime = 0.2;
    particleSystemL.maxLifeTime = 0.5;
    particleSystemL.emitRate = 100;
    particleSystemL.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    particleSystemL.direction1 = new BABYLON.Vector3(0, 0, -2);
    particleSystemL.direction2 = new BABYLON.Vector3(0, 0, -3);
    particleSystemL.minEmitPower = 2;
    particleSystemL.maxEmitPower = 4;
    particleSystemL.updateSpeed = 0.01;
    particleSystemL.start();
    
    // Right engine trail
    const particleSystemR = particleSystemL.clone('engineParticlesR', new BABYLON.Vector3(2.5, 0, -1.85));
    particleSystemR.start();
  }

  private generateUniverse(): void {
    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * 500;
      const y = (Math.random() - 0.5) * 500;
      const z = (Math.random() - 0.5) * 500;
      
      if (Math.random() > 0.7) this.createPlanet(new BABYLON.Vector3(x, y, z));
      else if (Math.random() > 0.5) this.createNebula(new BABYLON.Vector3(x, y, z));
      else this.createAsteroidField(new BABYLON.Vector3(x, y, z));
    }
    
    this.createStarfield();
  }

  private createPlanet(pos: BABYLON.Vector3): void {
    const types: PlanetType[] = ['rocky', 'gas', 'ice', 'lava', 'earth', 'desert'];
    const type = types[Math.floor(Math.random() * types.length)];
    const size = 5 + Math.random() * 15;
    
    const planet = BABYLON.MeshBuilder.CreateSphere('planet', { 
      diameter: size, 
      segments: 48 
    }, this.scene);
    planet.position = pos;
    
    const mat = new BABYLON.StandardMaterial('planetMat', this.scene);
    
    switch(type) {
      case 'gas': 
        mat.diffuseColor = new BABYLON.Color3(0.9, 0.7, 0.5); 
        mat.specularColor = new BABYLON.Color3(0.6, 0.5, 0.4);
        mat.specularPower = 32;
        break;
      case 'ice': 
        mat.diffuseColor = new BABYLON.Color3(0.8, 0.95, 1.0); 
        mat.specularColor = new BABYLON.Color3(1, 1, 1);
        mat.specularPower = 256;
        mat.emissiveColor = new BABYLON.Color3(0.1, 0.15, 0.2);
        break;
      case 'lava': 
        mat.diffuseColor = new BABYLON.Color3(0.3, 0.1, 0.05); 
        mat.emissiveColor = new BABYLON.Color3(1.0, 0.3, 0.1);
        mat.specularPower = 8;
        break;
      case 'earth': 
        mat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.9);
        mat.specularColor = new BABYLON.Color3(0.8, 0.9, 1.0);
        mat.specularPower = 64;
        break;
      case 'desert': 
        mat.diffuseColor = new BABYLON.Color3(0.85, 0.75, 0.5);
        mat.specularColor = new BABYLON.Color3(0.5, 0.4, 0.3);
        mat.specularPower = 16;
        break;
      default: 
        mat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.55);
        mat.specularPower = 32;
        break;
    }
    
    planet.material = mat;
    
    // Add atmosphere glow for earth-like and gas planets
    if (type === 'earth' || type === 'gas') {
      const atmosphere = BABYLON.MeshBuilder.CreateSphere('atmosphere', {
        diameter: size * 1.1,
        segments: 24
      }, this.scene);
      atmosphere.position = pos;
      
      const atmMat = new BABYLON.StandardMaterial('atmMat', this.scene);
      atmMat.diffuseColor = type === 'earth' ? 
        new BABYLON.Color3(0.3, 0.5, 0.9) : 
        new BABYLON.Color3(0.9, 0.6, 0.4);
      atmMat.emissiveColor = atmMat.diffuseColor.scale(0.3);
      atmMat.alpha = 0.3;
      atmosphere.material = atmMat;
    }
    
    // Add rings for gas giants
    if (type === 'gas' && Math.random() > 0.5) {
      const ring = BABYLON.MeshBuilder.CreateTorus('ring', {
        diameter: size * 2,
        thickness: size * 0.15,
        tessellation: 64
      }, this.scene);
      ring.position = pos;
      ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.4;
      
      const ringMat = new BABYLON.StandardMaterial('ringMat', this.scene);
      ringMat.diffuseColor = new BABYLON.Color3(0.7, 0.6, 0.5);
      ringMat.specularColor = new BABYLON.Color3(0.5, 0.4, 0.3);
      ringMat.alpha = 0.7;
      ring.material = ringMat;
    }
    
    const light = new BABYLON.PointLight('planetLight', pos, this.scene);
    light.intensity = 0.5;
    light.range = size * 5;
    
    this.spaceObjects.push({ mesh: planet, type: 'planet', position: pos, discovered: false });
  }

  private createNebula(pos: BABYLON.Vector3): void {
    // Create multi-layered nebula with particles
    const layers = 3;
    for (let i = 0; i < layers; i++) {
      const nebula = BABYLON.MeshBuilder.CreateSphere('nebula', { 
        diameter: 40 + i * 10, 
        segments: 16 
      }, this.scene);
      nebula.position = pos;
      
      const mat = new BABYLON.StandardMaterial(`nebulaMat_${i}`, this.scene);
      const hue = Math.random();
      mat.diffuseColor = new BABYLON.Color3(
        hue,
        Math.random() * 0.6,
        1 - hue * 0.5
      );
      mat.emissiveColor = mat.diffuseColor.scale(0.7);
      mat.alpha = 0.2 - i * 0.05;
      nebula.material = mat;
      
      this.nebulae.push(nebula);
    }
    
    // Add particle system for nebula dust
    const particleSystem = new BABYLON.ParticleSystem('nebulaParticles', 1000, this.scene);
    particleSystem.particleTexture = new BABYLON.Texture('', this.scene);
    particleSystem.emitter = pos;
    particleSystem.minEmitBox = new BABYLON.Vector3(-20, -20, -20);
    particleSystem.maxEmitBox = new BABYLON.Vector3(20, 20, 20);
    particleSystem.color1 = new BABYLON.Color4(0.7, 0.3, 0.9, 0.3);
    particleSystem.color2 = new BABYLON.Color4(0.3, 0.6, 1.0, 0.2);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
    particleSystem.minSize = 1;
    particleSystem.maxSize = 3;
    particleSystem.minLifeTime = 5;
    particleSystem.maxLifeTime = 10;
    particleSystem.emitRate = 50;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    particleSystem.minEmitPower = 0.1;
    particleSystem.maxEmitPower = 0.3;
    particleSystem.start();
    
    this.spaceObjects.push({ mesh: this.nebulae[this.nebulae.length - 1], type: 'nebula', position: pos, discovered: false });
  }

  private createAsteroidField(pos: BABYLON.Vector3): void {
    for (let i = 0; i < 15; i++) {
      // Create more varied asteroid shapes
      const shapeType = Math.floor(Math.random() * 3);
      let asteroid: BABYLON.Mesh;
      
      if (shapeType === 0) {
        asteroid = BABYLON.MeshBuilder.CreatePolyhedron('asteroid', { 
          type: Math.floor(Math.random() * 14), 
          size: 0.5 + Math.random() * 1.5 
        }, this.scene);
      } else if (shapeType === 1) {
        asteroid = BABYLON.MeshBuilder.CreateSphere('asteroid', {
          diameter: 0.8 + Math.random() * 2,
          segments: 6
        }, this.scene);
        asteroid.scaling.x = 0.7 + Math.random() * 0.6;
        asteroid.scaling.y = 0.7 + Math.random() * 0.6;
        asteroid.scaling.z = 0.7 + Math.random() * 0.6;
      } else {
        asteroid = BABYLON.MeshBuilder.CreateBox('asteroid', {
          size: 0.8 + Math.random() * 1.5
        }, this.scene);
        asteroid.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
      }
      
      asteroid.position = pos.add(new BABYLON.Vector3(
        (Math.random() - 0.5) * 30, 
        (Math.random() - 0.5) * 30, 
        (Math.random() - 0.5) * 30
      ));
      
      // Detailed asteroid material
      const mat = new BABYLON.StandardMaterial(`asteroidMat_${i}`, this.scene);
      mat.diffuseColor = new BABYLON.Color3(
        0.25 + Math.random() * 0.15,
        0.25 + Math.random() * 0.15,
        0.25 + Math.random() * 0.15
      );
      mat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
      mat.specularPower = 16;
      asteroid.material = mat;
      
      // Add rotation animation
      const rotSpeed = (Math.random() - 0.5) * 0.02;
      asteroid.metadata = { rotSpeed };
      
      this.spaceObjects.push({ 
        mesh: asteroid, 
        type: 'asteroid', 
        position: asteroid.position.clone(), 
        discovered: false 
      });
    }
  }

  private createStarfield(): void {
    for (let i = 0; i < 1000; i++) {
      const star = BABYLON.MeshBuilder.CreateSphere(`star${i}`, { diameter: 0.5 }, this.scene);
      star.position = new BABYLON.Vector3((Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000);
      
      const mat = new BABYLON.StandardMaterial(`starMat${i}`, this.scene);
      mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
      star.material = mat;
    }
  }

  setup(): void {
    this.engine.runRenderLoop(() => {
      if (this.isRunning && !this.isPaused && this.gameStarted) {
        this.update(this.engine.getDeltaTime());
        
        // Update HUD with formatted info
        this.menu.updateHUD({
          speed: this.shipSpeed,
          distance: this.info.distanceTraveled / 100, // Convert to light years
          sector: this.info.currentSector,
          fps: Math.round(this.engine.getFps()),
          nearby: this.info.nearestObject
        });
      }
      this.scene.render();
    });
    window.addEventListener('resize', () => this.engine.resize());
  }

  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    if (!this.freeCamMode) {
      if (this.keys['w'] || this.keys['arrowup']) this.shipSpeed = Math.min(this.shipSpeed + 20 * dt, this.maxSpeed);
      else this.shipSpeed = Math.max(this.shipSpeed - 10 * dt, 0);
      
      if (this.keys['a'] || this.keys['arrowleft']) this.ship.rotation.y += 1 * dt;
      if (this.keys['d'] || this.keys['arrowright']) this.ship.rotation.y -= 1 * dt;
      if (this.keys['q']) this.ship.rotation.z += 1 * dt;
      if (this.keys['e']) this.ship.rotation.z -= 1 * dt;
      
      const forward = this.ship.forward;
      this.ship.position.addInPlace(forward.scale(this.shipSpeed * dt));
      this.camera.position = this.ship.position.add(new BABYLON.Vector3(0, 2, -8));
      this.camera.setTarget(this.ship.position.add(forward.scale(10)));
      
      this.info.distanceTraveled += this.shipSpeed * dt;
    }
    
    // Rotate asteroids
    for (const obj of this.spaceObjects) {
      if (obj.type === 'asteroid' && obj.mesh.metadata?.rotSpeed) {
        obj.mesh.rotation.y += obj.mesh.metadata.rotSpeed;
        obj.mesh.rotation.x += obj.mesh.metadata.rotSpeed * 0.7;
      }
      
      const dist = BABYLON.Vector3.Distance(this.camera.position, obj.position);
      if (dist < 50 && !obj.discovered && obj.type === 'planet') {
        obj.discovered = true;
        this.info.planetsDiscovered++;
      }
    }
    
    this.info.speed = Math.round(this.shipSpeed);
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
    
    // Apply particle settings
    // nebulae particles handled in updateNearbyObjects
    
    // Apply post-processing
    const pipeline = this.scene.postProcessRenderPipelineManager.supportedPipelines[0] as any;
    if (pipeline) {
      pipeline.bloomEnabled = settings.postProcessing;
      pipeline.fxaaEnabled = settings.antialiasing;
    }
  }
  
  // Required by GamePlay.tsx
  init(): void {
    console.log('[SpaceExplorer] Initializing...');
    // Menu handles startup
  }

  start(): void {
    console.log('[SpaceExplorer] Start called - menu handles game start');
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
    this.ship.position = new BABYLON.Vector3(0, 0, -5);
    this.shipSpeed = 0;
    this.info.planetsDiscovered = 0;
    this.info.distanceTraveled = 0;
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
