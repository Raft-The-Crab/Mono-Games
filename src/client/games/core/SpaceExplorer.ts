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
type PlanetType = 'rocky' | 'gas' | 'ice' | 'lava' | 'earth' | 'desert' | 'ringed-gas' | 'volcanic' | 'crystalline';

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
  private _gameSettings: GameSettings = {
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
  
  // Ship Upgrades & Customization
  private shipColor: BABYLON.Color3 = new BABYLON.Color3(0.2, 0.5, 1.0); // Default blue
  private speedUpgradeLevel: number = 0; // 0-5 levels
  private shieldActive: boolean = false;
  private shieldMesh!: BABYLON.Mesh;
  private shieldStrength: number = 100;
  private boostAvailable: boolean = true;
  private boostCooldown: number = 0;
  private boostDuration: number = 0;
  
  private spaceObjects: SpaceObject[] = [];
  private nebulae: BABYLON.Mesh[] = [];
  private stars: BABYLON.PointLight[] = [];
  
  // Black Holes & Wormholes
  private blackHoles: BABYLON.Mesh[] = [];
  private wormholes: BABYLON.Mesh[] = [];
  private accretionDisks: BABYLON.ParticleSystem[] = [];
  
  // Asteroid Mining System
  private miningBeamActive: boolean = false;
  private miningBeam!: BABYLON.Mesh;
  private cargoHold: number = 0;
  private maxCargo: number = 100;
  private miningRange: number = 20;
  
  // Alien Encounters
  private alienShips: BABYLON.Mesh[] = [];
  private spaceWhales: BABYLON.Mesh[] = [];
  private _alienEncounterTimer: number = 0;
  
  // Space Anomalies
  private anomalies: BABYLON.Mesh[] = [];
  private anomalyParticles: BABYLON.ParticleSystem[] = [];
  
  private keys: { [key: string]: boolean } = {};
  private freeCamMode: boolean = false;
  
  public info = {
    planetsDiscovered: 0,
    distanceTraveled: 0,
    currentSector: 'Alpha Centauri',
    nearestObject: 'None',
    speed: 0,
    cargoHold: 0,
    credits: 0
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
    mat.diffuseColor = this.shipColor; // Use customizable color
    mat.specularColor = new BABYLON.Color3(1, 1, 1);
    mat.specularPower = 128;
    mat.emissiveColor = this.shipColor.scale(0.2);
    
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
    
    // Create shield mesh (invisible until activated)
    this.createShieldMesh();
  }
  
  private createShieldMesh(): void {
    this.shieldMesh = BABYLON.MeshBuilder.CreateSphere('shield', {
      diameter: 8,
      segments: 16
    }, this.scene);
    this.shieldMesh.parent = this.ship;
    this.shieldMesh.position = BABYLON.Vector3.Zero();
    
    const shieldMat = new BABYLON.StandardMaterial('shieldMat', this.scene);
    shieldMat.diffuseColor = new BABYLON.Color3(0.2, 0.6, 1.0);
    shieldMat.specularColor = new BABYLON.Color3(0.5, 0.8, 1.0);
    shieldMat.emissiveColor = new BABYLON.Color3(0.1, 0.3, 0.6);
    shieldMat.alpha = 0; // Start invisible
    shieldMat.wireframe = true;
    this.shieldMesh.material = shieldMat;
    
    // Create mining beam (cylinder, initially invisible)
    this.createMiningBeam();
  }
  
  private createMiningBeam(): void {
    this.miningBeam = BABYLON.MeshBuilder.CreateCylinder('miningBeam', {
      diameter: 0.5,
      height: 20,
      tessellation: 8
    }, this.scene);
    this.miningBeam.parent = this.ship;
    this.miningBeam.position.z = 10;
    this.miningBeam.rotation.x = Math.PI / 2;
    
    const beamMat = new BABYLON.StandardMaterial('beamMat', this.scene);
    beamMat.emissiveColor = new BABYLON.Color3(0.0, 1.0, 0.5);
    beamMat.diffuseColor = new BABYLON.Color3(0.0, 0.8, 0.4);
    beamMat.alpha = 0; // Start invisible
    this.miningBeam.material = beamMat;
  }

  private generateUniverse(): void {
    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * 500;
      const y = (Math.random() - 0.5) * 500;
      const z = (Math.random() - 0.5) * 500;
      
      const rand = Math.random();
      if (rand > 0.8) this.createPlanet(new BABYLON.Vector3(x, y, z));
      else if (rand > 0.6) this.createNebula(new BABYLON.Vector3(x, y, z));
      else if (rand > 0.4) this.createAsteroidField(new BABYLON.Vector3(x, y, z));
      else if (rand > 0.25) this.createComet(new BABYLON.Vector3(x, y, z));
      else this.createSpaceStation(new BABYLON.Vector3(x, y, z));
    }
    
    // Add black holes (rare)
    for (let i = 0; i < 2; i++) {
      const x = (Math.random() - 0.5) * 600;
      const y = (Math.random() - 0.5) * 600;
      const z = (Math.random() - 0.5) * 600;
      this.createBlackHole(new BABYLON.Vector3(x, y, z));
    }
    
    // Add wormholes (very rare)
    for (let i = 0; i < 3; i++) {
      const x = (Math.random() - 0.5) * 700;
      const y = (Math.random() - 0.5) * 700;
      const z = (Math.random() - 0.5) * 700;
      this.createWormhole(new BABYLON.Vector3(x, y, z));
    }
    
    // Add alien ships (rare encounters)
    for (let i = 0; i < 2; i++) {
      const x = (Math.random() - 0.5) * 800;
      const y = (Math.random() - 0.5) * 800;
      const z = (Math.random() - 0.5) * 800;
      this.createAlienShip(new BABYLON.Vector3(x, y, z));
    }
    
    // Add space whale (very rare)
    if (Math.random() > 0.5) {
      const x = (Math.random() - 0.5) * 900;
      const y = (Math.random() - 0.5) * 900;
      const z = (Math.random() - 0.5) * 900;
      this.createSpaceWhale(new BABYLON.Vector3(x, y, z));
    }
    
    this._alienEncounterTimer = 60 + Math.random() * 60; // Random encounter every 1-2 minutes
    
    // Add space anomalies (quantum rifts, radiation zones)
    for (let i = 0; i < 3; i++) {
      const x = (Math.random() - 0.5) * 1000;
      const y = (Math.random() - 0.5) * 1000;
      const z = (Math.random() - 0.5) * 1000;
      const anomalyType = Math.random() > 0.5 ? 'quantum' : 'radiation';
      this.createAnomaly(new BABYLON.Vector3(x, y, z), anomalyType);
    }
    
    this.createStarfield();
  }

  private createPlanet(pos: BABYLON.Vector3): void {
    const types: PlanetType[] = ['rocky', 'gas', 'ice', 'lava', 'earth', 'desert', 'ringed-gas', 'volcanic', 'crystalline'];
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
      case 'ringed-gas':
        // Saturn-like gas giant with prominent rings
        mat.diffuseColor = new BABYLON.Color3(0.95, 0.85, 0.65);
        mat.specularColor = new BABYLON.Color3(0.7, 0.6, 0.5);
        mat.specularPower = 48;
        // Create large ring system
        const ring = BABYLON.MeshBuilder.CreateTorus('ring', {
          diameter: size * 2.5,
          thickness: size * 0.2,
          tessellation: 96
        }, this.scene);
        ring.position = pos;
        ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
        const ringMat = new BABYLON.StandardMaterial('ringMat', this.scene);
        ringMat.diffuseColor = new BABYLON.Color3(0.8, 0.75, 0.65);
        ringMat.specularColor = new BABYLON.Color3(0.6, 0.5, 0.4);
        ringMat.alpha = 0.75;
        ringMat.backFaceCulling = false;
        ring.material = ringMat;
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
      case 'volcanic':
        // Active volcanic world with bright lava cracks
        mat.diffuseColor = new BABYLON.Color3(0.2, 0.15, 0.1);
        mat.emissiveColor = new BABYLON.Color3(1.0, 0.5, 0.0);
        mat.specularPower = 4;
        // Add pulsing glow
        const volcanicGlow = BABYLON.MeshBuilder.CreateSphere('glow', {
          diameter: size * 1.05,
          segments: 24
        }, this.scene);
        volcanicGlow.position = pos;
        const glowMat = new BABYLON.StandardMaterial('glowMat', this.scene);
        glowMat.emissiveColor = new BABYLON.Color3(1.0, 0.4, 0.0);
        glowMat.alpha = 0.4;
        volcanicGlow.material = glowMat;
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
      case 'crystalline':
        // Mysterious crystal planet with rainbow reflections
        mat.diffuseColor = new BABYLON.Color3(0.6, 0.4, 0.8);
        mat.specularColor = new BABYLON.Color3(1.0, 0.9, 1.0);
        mat.specularPower = 512;
        mat.emissiveColor = new BABYLON.Color3(0.3, 0.2, 0.4);
        // Add crystalline structure particles
        const crystalParticles = new BABYLON.ParticleSystem('crystals', 200, this.scene);
        crystalParticles.particleTexture = new BABYLON.Texture('', this.scene);
        crystalParticles.emitter = planet;
        crystalParticles.minEmitBox = new BABYLON.Vector3(-size/2, -size/2, -size/2);
        crystalParticles.maxEmitBox = new BABYLON.Vector3(size/2, size/2, size/2);
        crystalParticles.minSize = 0.2;
        crystalParticles.maxSize = 0.5;
        crystalParticles.minLifeTime = 2.0;
        crystalParticles.maxLifeTime = 4.0;
        crystalParticles.emitRate = 20;
        crystalParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        crystalParticles.color1 = new BABYLON.Color4(0.6, 0.4, 0.8, 0.8);
        crystalParticles.color2 = new BABYLON.Color4(0.9, 0.7, 1.0, 0.6);
        crystalParticles.direction1 = new BABYLON.Vector3(-0.5, -0.5, -0.5);
        crystalParticles.direction2 = new BABYLON.Vector3(0.5, 0.5, 0.5);
        crystalParticles.gravity = new BABYLON.Vector3(0, 0, 0);
        crystalParticles.start();
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
    
    // Add rings for regular gas giants (ringed-gas already has them)
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
  
  private createComet(pos: BABYLON.Vector3): void {
    // Create comet nucleus (icy rock)
    const nucleus = BABYLON.MeshBuilder.CreateSphere('comet', {
      diameter: 2 + Math.random() * 2,
      segments: 16
    }, this.scene);
    nucleus.position = pos;
    
    // Icy material with glow
    const mat = new BABYLON.StandardMaterial('cometMat', this.scene);
    mat.diffuseColor = new BABYLON.Color3(0.7, 0.8, 0.9);
    mat.specularColor = new BABYLON.Color3(1.0, 1.0, 1.0);
    mat.specularPower = 128;
    mat.emissiveColor = new BABYLON.Color3(0.2, 0.3, 0.4);
    nucleus.material = mat;
    
    // Create comet tail (long particle trail)
    const tailParticles = new BABYLON.ParticleSystem('cometTail', 1000, this.scene);
    tailParticles.particleTexture = new BABYLON.Texture('', this.scene);
    tailParticles.emitter = nucleus;
    tailParticles.minEmitBox = new BABYLON.Vector3(-1, -1, -1);
    tailParticles.maxEmitBox = new BABYLON.Vector3(1, 1, 1);
    
    // Tail direction (away from nearest star - simulated randomly)
    const tailDirection = new BABYLON.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize().scale(-20);
    
    tailParticles.direction1 = tailDirection.scale(0.8);
    tailParticles.direction2 = tailDirection.scale(1.2);
    tailParticles.minSize = 0.5;
    tailParticles.maxSize = 2.0;
    tailParticles.minLifeTime = 2.0;
    tailParticles.maxLifeTime = 4.0;
    tailParticles.emitRate = 200;
    tailParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    tailParticles.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 0.6);
    tailParticles.color2 = new BABYLON.Color4(0.4, 0.6, 0.9, 0.3);
    tailParticles.colorDead = new BABYLON.Color4(0.2, 0.3, 0.5, 0);
    tailParticles.minEmitPower = 1;
    tailParticles.maxEmitPower = 3;
    tailParticles.gravity = new BABYLON.Vector3(0, 0, 0);
    tailParticles.start();
    
    // Add subtle movement to comet
    nucleus.metadata = { 
      velocity: new BABYLON.Vector3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5
      )
    };
    
    this.spaceObjects.push({
      mesh: nucleus,
      type: 'asteroid', // Use asteroid type for now
      position: pos,
      discovered: false
    });
  }
  
  private createSpaceStation(pos: BABYLON.Vector3): void {
    // Create modular space station with rotating ring
    const stationCore = BABYLON.MeshBuilder.CreateCylinder('stationCore', {
      height: 12,
      diameter: 4,
      tessellation: 8
    }, this.scene);
    stationCore.position = pos;
    stationCore.rotation.x = Math.PI / 2;
    
    const coreMat = new BABYLON.StandardMaterial('stationCoreMat', this.scene);
    coreMat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.75);
    coreMat.specularColor = new BABYLON.Color3(0.6, 0.6, 0.7);
    coreMat.specularPower = 64;
    stationCore.material = coreMat;
    
    // Rotating habitat ring
    const habitatRing = BABYLON.MeshBuilder.CreateTorus('habitatRing', {
      diameter: 16,
      thickness: 2,
      tessellation: 32
    }, this.scene);
    habitatRing.position = pos;
    habitatRing.rotation.x = Math.PI / 2;
    
    const ringMat = new BABYLON.StandardMaterial('ringMat', this.scene);
    ringMat.diffuseColor = new BABYLON.Color3(0.6, 0.65, 0.7);
    ringMat.specularColor = new BABYLON.Color3(0.5, 0.6, 0.7);
    ringMat.specularPower = 48;
    habitatRing.material = ringMat;
    
    // Solar panels
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const panel = BABYLON.MeshBuilder.CreateBox('solarPanel', {
        width: 6,
        height: 3,
        depth: 0.2
      }, this.scene);
      panel.position = pos.add(new BABYLON.Vector3(
        Math.cos(angle) * 8,
        Math.sin(angle) * 8,
        0
      ));
      panel.rotation.z = angle;
      
      const panelMat = new BABYLON.StandardMaterial('panelMat', this.scene);
      panelMat.diffuseColor = new BABYLON.Color3(0.1, 0.15, 0.3);
      panelMat.specularColor = new BABYLON.Color3(0.3, 0.4, 0.6);
      panelMat.specularPower = 128;
      panelMat.emissiveColor = new BABYLON.Color3(0.05, 0.08, 0.15);
      panel.material = panelMat;
    }
    
    // Station lights (blinking effect)
    const stationLight = new BABYLON.PointLight('stationLight', pos, this.scene);
    stationLight.intensity = 2;
    stationLight.range = 30;
    stationLight.diffuse = new BABYLON.Color3(0.8, 0.9, 1.0);
    
    // Communication dish
    const dish = BABYLON.MeshBuilder.CreateSphere('dish', {
      diameter: 3,
      segments: 16,
      slice: 0.5
    }, this.scene);
    dish.position = pos.add(new BABYLON.Vector3(0, 0, 7));
    dish.rotation.x = -Math.PI / 6;
    
    const dishMat = new BABYLON.StandardMaterial('dishMat', this.scene);
    dishMat.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.85);
    dishMat.specularColor = new BABYLON.Color3(0.9, 0.9, 1.0);
    dishMat.specularPower = 256;
    dish.material = dishMat;
    
    // Add rotation animation to ring
    habitatRing.metadata = { rotSpeed: 0.01 };
    
    this.spaceObjects.push({
      mesh: stationCore,
      type: 'asteroid', // Use asteroid type for discovery
      position: pos,
      discovered: false
    });
  }

  private createBlackHole(pos: BABYLON.Vector3): void {
    // Event horizon (ultra-black sphere)
    const eventHorizon = BABYLON.MeshBuilder.CreateSphere('blackHole', {
      diameter: 15,
      segments: 32
    }, this.scene);
    eventHorizon.position = pos;
    
    const horizonMat = new BABYLON.StandardMaterial('horizonMat', this.scene);
    horizonMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
    horizonMat.specularColor = new BABYLON.Color3(0, 0, 0);
    horizonMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
    eventHorizon.material = horizonMat;
    
    // Gravitational lensing ring (glowing edge)
    const lensingRing = BABYLON.MeshBuilder.CreateTorus('lensing', {
      diameter: 20,
      thickness: 0.5,
      tessellation: 64
    }, this.scene);
    lensingRing.position = pos;
    
    const ringMat = new BABYLON.StandardMaterial('lensingMat', this.scene);
    ringMat.emissiveColor = new BABYLON.Color3(0.3, 0.5, 1.0);
    ringMat.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.9);
    ringMat.alpha = 0.7;
    lensingRing.material = ringMat;
    
    // Accretion disk particle system
    const accretionDisk = new BABYLON.ParticleSystem('accretion', 1000, this.scene);
    accretionDisk.particleTexture = new BABYLON.Texture('', this.scene);
    accretionDisk.emitter = pos;
    accretionDisk.minEmitBox = new BABYLON.Vector3(-15, -1, -15);
    accretionDisk.maxEmitBox = new BABYLON.Vector3(15, 1, 15);
    
    accretionDisk.color1 = new BABYLON.Color4(1.0, 0.5, 0.0, 0.8);
    accretionDisk.color2 = new BABYLON.Color4(1.0, 0.8, 0.3, 0.6);
    accretionDisk.colorDead = new BABYLON.Color4(0.5, 0.1, 0.0, 0.2);
    
    accretionDisk.minSize = 0.5;
    accretionDisk.maxSize = 1.5;
    accretionDisk.minLifeTime = 2;
    accretionDisk.maxLifeTime = 4;
    
    accretionDisk.emitRate = 100;
    accretionDisk.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    
    // Orbital velocity
    accretionDisk.addVelocityGradient(0, 2, 5);
    accretionDisk.addVelocityGradient(1, -2, -5);
    
    accretionDisk.start();
    
    this.blackHoles.push(eventHorizon);
    this.accretionDisks.push(accretionDisk);
    
    // Add warning light
    const warningLight = new BABYLON.PointLight('blackHoleLight', pos, this.scene);
    warningLight.intensity = 5;
    warningLight.range = 100;
    warningLight.diffuse = new BABYLON.Color3(1.0, 0.5, 0.0);
  }

  private createWormhole(pos: BABYLON.Vector3): void {
    // Portal ring structure
    const portalOuter = BABYLON.MeshBuilder.CreateTorus('wormhole', {
      diameter: 25,
      thickness: 2,
      tessellation: 64
    }, this.scene);
    portalOuter.position = pos;
    portalOuter.rotation.y = Math.random() * Math.PI;
    
    const outerMat = new BABYLON.StandardMaterial('portalMat', this.scene);
    outerMat.emissiveColor = new BABYLON.Color3(0.0, 0.8, 1.0);
    outerMat.diffuseColor = new BABYLON.Color3(0.0, 0.5, 0.8);
    outerMat.specularPower = 128;
    portalOuter.material = outerMat;
    
    // Inner portal disc
    const portalDisc = BABYLON.MeshBuilder.CreateDisc('portalDisc', {
      radius: 12,
      tessellation: 64
    }, this.scene);
    portalDisc.position = pos;
    portalDisc.rotation = portalOuter.rotation.clone();
    
    const discMat = new BABYLON.StandardMaterial('discMat', this.scene);
    discMat.emissiveColor = new BABYLON.Color3(0.3, 0.7, 1.0);
    discMat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.9);
    discMat.alpha = 0.5;
    discMat.backFaceCulling = false;
    portalDisc.material = discMat;
    
    // Swirling particles
    const swirlParticles = new BABYLON.ParticleSystem('swirl', 500, this.scene);
    swirlParticles.particleTexture = new BABYLON.Texture('', this.scene);
    swirlParticles.emitter = pos;
    swirlParticles.minEmitBox = new BABYLON.Vector3(-10, -10, -2);
    swirlParticles.maxEmitBox = new BABYLON.Vector3(10, 10, 2);
    
    swirlParticles.color1 = new BABYLON.Color4(0.0, 0.8, 1.0, 1.0);
    swirlParticles.color2 = new BABYLON.Color4(0.5, 0.5, 1.0, 0.8);
    swirlParticles.colorDead = new BABYLON.Color4(0.0, 0.3, 0.6, 0.2);
    
    swirlParticles.minSize = 0.3;
    swirlParticles.maxSize = 1.0;
    swirlParticles.minLifeTime = 1;
    swirlParticles.maxLifeTime = 3;
    
    swirlParticles.emitRate = 50;
    swirlParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    
    // Spiral motion
    swirlParticles.direction1 = new BABYLON.Vector3(-2, -2, 0);
    swirlParticles.direction2 = new BABYLON.Vector3(2, 2, 0);
    
    swirlParticles.start();
    
    // Store wormhole with destination metadata
    portalOuter.metadata = {
      isWormhole: true,
      destination: null, // Will be paired with another wormhole
      radius: 12
    };
    
    this.wormholes.push(portalOuter);
    
    // Portal light
    const portalLight = new BABYLON.PointLight('wormholeLight', pos, this.scene);
    portalLight.intensity = 8;
    portalLight.range = 80;
    portalLight.diffuse = new BABYLON.Color3(0.0, 0.8, 1.0);
  }
  
  private createAlienShip(pos: BABYLON.Vector3): void {
    // Sleek alien spacecraft
    const hull = BABYLON.MeshBuilder.CreateSphere('alienHull', {
      diameter: 6,
      segments: 16
    }, this.scene);
    hull.position = pos;
    hull.scaling.y = 0.4; // Flatten for disc shape
    
    const dome = BABYLON.MeshBuilder.CreateSphere('alienDome', {
      diameter: 3,
      segments: 12
    }, this.scene);
    dome.position = pos.add(new BABYLON.Vector3(0, 1.5, 0));
    dome.scaling.y = 0.6;
    
    const alienShip = BABYLON.Mesh.MergeMeshes([hull, dome], true)!;
    
    const alienMat = new BABYLON.StandardMaterial('alienMat', this.scene);
    alienMat.diffuseColor = new BABYLON.Color3(0.6, 0.2, 0.8);
    alienMat.emissiveColor = new BABYLON.Color3(0.3, 0.1, 0.4);
    alienMat.specularColor = new BABYLON.Color3(1.0, 0.5, 1.0);
    alienMat.specularPower = 256;
    alienShip.material = alienMat;
    
    // Add navigation lights
    const lights = [];
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const light = new BABYLON.PointLight(`alienLight_${i}`, 
        pos.add(new BABYLON.Vector3(Math.cos(angle) * 3, 0, Math.sin(angle) * 3)), 
        this.scene
      );
      light.intensity = 3;
      light.range = 15;
      light.diffuse = new BABYLON.Color3(0.8, 0.2, 1.0);
      lights.push(light);
    }
    
    // Add movement metadata
    alienShip.metadata = {
      velocity: new BABYLON.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5),
      rotSpeed: (Math.random() - 0.5) * 0.02,
      lights: lights
    };
    
    this.alienShips.push(alienShip);
    console.log('👽 Alien ship detected!');
  }
  
  private createSpaceWhale(pos: BABYLON.Vector3): void {
    // Massive space creature
    const body = BABYLON.MeshBuilder.CreateSphere('whaleBody', {
      diameter: 30,
      segments: 16
    }, this.scene);
    body.position = pos;
    body.scaling.set(2, 1, 3); // Elongated shape
    
    // Tail fin
    const tail = BABYLON.MeshBuilder.CreateBox('whaleTail', {
      width: 15,
      height: 0.5,
      depth: 8
    }, this.scene);
    tail.position = pos.add(new BABYLON.Vector3(0, 0, -25));
    
    // Side fins
    const finL = BABYLON.MeshBuilder.CreateBox('finL', {
      width: 12,
      height: 0.5,
      depth: 6
    }, this.scene);
    finL.position = pos.add(new BABYLON.Vector3(-18, 0, 0));
    finL.rotation.z = -Math.PI / 6;
    
    const finR = BABYLON.MeshBuilder.CreateBox('finR', {
      width: 12,
      height: 0.5,
      depth: 6
    }, this.scene);
    finR.position = pos.add(new BABYLON.Vector3(18, 0, 0));
    finR.rotation.z = Math.PI / 6;
    
    const whale = BABYLON.Mesh.MergeMeshes([body, tail, finL, finR], true)!;
    
    const whaleMat = new BABYLON.StandardMaterial('whaleMat', this.scene);
    whaleMat.diffuseColor = new BABYLON.Color3(0.3, 0.4, 0.6);
    whaleMat.emissiveColor = new BABYLON.Color3(0.1, 0.2, 0.3);
    whaleMat.specularColor = new BABYLON.Color3(0.5, 0.6, 0.8);
    whale.material = whaleMat;
    
    // Add gentle movement
    whale.metadata = {
      velocity: new BABYLON.Vector3((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2),
      rotSpeed: 0.001,
      swimPhase: Math.random() * Math.PI * 2
    };
    
    this.spaceWhales.push(whale);
    console.log('🐋 Space whale sighted!');
  }
  
  private createAnomaly(pos: BABYLON.Vector3, type: 'quantum' | 'radiation'): void {
    if (type === 'quantum') {
      // Quantum rift - distorted space effect
      const rift = BABYLON.MeshBuilder.CreateTorus('quantumRift', {
        diameter: 20,
        thickness: 2,
        tessellation: 32
      }, this.scene);
      rift.position = pos;
      
      const riftMat = new BABYLON.StandardMaterial('riftMat', this.scene);
      riftMat.emissiveColor = new BABYLON.Color3(0.5, 0.0, 1.0);
      riftMat.diffuseColor = new BABYLON.Color3(0.3, 0.0, 0.8);
      riftMat.alpha = 0.7;
      rift.material = riftMat;
      
      // Add particle effect
      const particles = new BABYLON.ParticleSystem('riftParticles', 500, this.scene);
      particles.particleTexture = new BABYLON.Texture('', this.scene);
      particles.emitter = pos;
      particles.minEmitBox = new BABYLON.Vector3(-10, -10, -10);
      particles.maxEmitBox = new BABYLON.Vector3(10, 10, 10);
      particles.color1 = new BABYLON.Color4(0.5, 0.0, 1.0, 1.0);
      particles.color2 = new BABYLON.Color4(0.8, 0.0, 1.0, 0.5);
      particles.colorDead = new BABYLON.Color4(0, 0, 0, 0);
      particles.minSize = 0.5;
      particles.maxSize = 1.5;
      particles.minLifeTime = 2;
      particles.maxLifeTime = 4;
      particles.emitRate = 50;
      particles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
      particles.start();
      
      rift.metadata = { type: 'quantum', rotation: 0 };
      this.anomalies.push(rift);
      this.anomalyParticles.push(particles);
      console.log('⚛️ Quantum anomaly detected!');
    } else {
      // Radiation zone - glowing hazardous area
      const zone = BABYLON.MeshBuilder.CreateSphere('radiationZone', {
        diameter: 25,
        segments: 16
      }, this.scene);
      zone.position = pos;
      
      const zoneMat = new BABYLON.StandardMaterial('zoneMat', this.scene);
      zoneMat.emissiveColor = new BABYLON.Color3(0.0, 1.0, 0.3);
      zoneMat.diffuseColor = new BABYLON.Color3(0.0, 0.8, 0.2);
      zoneMat.alpha = 0.3;
      zone.material = zoneMat;
      
      zone.metadata = { type: 'radiation', pulsePhase: 0 };
      this.anomalies.push(zone);
      console.log('☢️ Radiation zone warning!');
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
    
    // Update boost cooldown
    if (this.boostCooldown > 0) {
      this.boostCooldown -= dt;
      if (this.boostCooldown <= 0) {
        this.boostAvailable = true;
        console.log('🚀 Boost ready!');
      }
    }
    
    // Update boost duration
    if (this.boostDuration > 0) {
      this.boostDuration -= dt;
      if (this.boostDuration <= 0) {
        this.maxSpeed = 50 + (this.speedUpgradeLevel * 10); // Return to normal max
      }
    }
    
    // Shield regeneration
    if (this.shieldStrength < 100) {
      this.shieldStrength = Math.min(100, this.shieldStrength + 5 * dt);
    }
    
    if (!this.freeCamMode) {
      // Apply speed upgrade
      const upgradedMaxSpeed = 50 + (this.speedUpgradeLevel * 10);
      
      if (this.keys['w'] || this.keys['arrowup']) {
        this.shipSpeed = Math.min(this.shipSpeed + 20 * dt, this.maxSpeed);
      } else {
        this.shipSpeed = Math.max(this.shipSpeed - 10 * dt, 0);
      }
      
      if (this.keys['a'] || this.keys['arrowleft']) this.ship.rotation.y += 1 * dt;
      if (this.keys['d'] || this.keys['arrowright']) this.ship.rotation.y -= 1 * dt;
      if (this.keys['q']) this.ship.rotation.z += 1 * dt;
      if (this.keys['e']) this.ship.rotation.z -= 1 * dt;
      
      // Shield toggle (S key)
      if (this.keys['s']) {
        this.toggleShield();
        delete this.keys['s']; // Prevent repeated activation
      }
      
      // Boost activation (Shift key)
      if (this.keys['shift'] && this.boostAvailable) {
        this.activateBoost();
        delete this.keys['shift'];
      }
      
      // Mining beam (M key)
      if (this.keys['m']) {
        this.toggleMiningBeam();
        delete this.keys['m'];
      }
      
      const forward = this.ship.forward;
      this.ship.position.addInPlace(forward.scale(this.shipSpeed * dt));
      this.camera.position = this.ship.position.add(new BABYLON.Vector3(0, 2, -8));
      this.camera.setTarget(this.ship.position.add(forward.scale(10)));
      
      this.info.distanceTraveled += this.shipSpeed * dt;
    }
    
    // Update shield visual
    if (this.shieldMesh && this.shieldMesh.material) {
      const mat = this.shieldMesh.material as BABYLON.StandardMaterial;
      if (this.shieldActive) {
        mat.alpha = Math.min(mat.alpha + dt * 2, 0.6);
      } else {
        mat.alpha = Math.max(mat.alpha - dt * 2, 0);
      }
    }
    
    // Rotate asteroids and animate objects
    for (const obj of this.spaceObjects) {
      if (obj.type === 'asteroid' && obj.mesh.metadata?.rotSpeed) {
        obj.mesh.rotation.y += obj.mesh.metadata.rotSpeed;
        obj.mesh.rotation.x += obj.mesh.metadata.rotSpeed * 0.7;
        
        // Mining beam asteroid interaction
        if (this.miningBeamActive) {
          const dist = BABYLON.Vector3.Distance(this.ship.position, obj.position);
          if (dist < this.miningRange && this.cargoHold < this.maxCargo) {
            // Extract resources
            const mineAmount = 10 * dt;
            this.cargoHold = Math.min(this.cargoHold + mineAmount, this.maxCargo);
            this.info.cargoHold = Math.floor(this.cargoHold);
            
            // Shrink asteroid slightly
            if (obj.mesh.scaling.x > 0.3) {
              obj.mesh.scaling.scaleInPlace(1 - dt * 0.1);
            }
          }
        }
      }
      
      // Move comets with their velocity
      if (obj.mesh.name === 'comet' && obj.mesh.metadata?.velocity) {
        obj.mesh.position.addInPlace(obj.mesh.metadata.velocity.scale(dt));
        obj.position = obj.mesh.position.clone();
      }
      
      const dist = BABYLON.Vector3.Distance(this.camera.position, obj.position);
      if (dist < 50 && !obj.discovered && obj.type === 'planet') {
        obj.discovered = true;
        this.info.planetsDiscovered++;
      }
    }
    
    // Update mining beam visual
    if (this.miningBeam && this.miningBeam.material) {
      const beamMat = this.miningBeam.material as BABYLON.StandardMaterial;
      if (this.miningBeamActive) {
        beamMat.alpha = Math.min(beamMat.alpha + dt * 3, 0.7);
      } else {
        beamMat.alpha = Math.max(beamMat.alpha - dt * 3, 0);
      }
    }
    
    // Rotate space station habitat rings
    const habitatRings = this.scene.meshes.filter(m => m.name === 'habitatRing');
    for (const ring of habitatRings) {
      if (ring.metadata?.rotSpeed) {
        ring.rotation.x += ring.metadata.rotSpeed;
      }
    }
    
    // Black hole gravity effects
    for (const blackHole of this.blackHoles) {
      const dist = BABYLON.Vector3.Distance(this.ship.position, blackHole.position);
      const gravityRadius = 80;
      
      if (dist < gravityRadius) {
        // Pull ship toward black hole
        const direction = blackHole.position.subtract(this.ship.position).normalize();
        const gravityStrength = (1 - (dist / gravityRadius)) * 0.5;
        this.ship.position.addInPlace(direction.scale(gravityStrength * dt * 20));
        
        // Time dilation effect (slow down at event horizon)
        if (dist < 15) {
          this.shipSpeed *= 0.95;
        }
        
        // Warning if too close
        if (dist < 30 && !this.isPaused) {
          console.log('⚠️ WARNING: Approaching event horizon!');
        }
      }
    }
    
    // Wormhole teleportation
    for (const wormhole of this.wormholes) {
      const dist = BABYLON.Vector3.Distance(this.ship.position, wormhole.position);
      const activationRadius = wormhole.metadata?.radius || 12;
      
      if (dist < activationRadius && wormhole.metadata?.destination) {
        // Teleport to paired wormhole
        const destination = wormhole.metadata.destination as BABYLON.Vector3;
        this.ship.position = destination.clone();
        console.log('🌀 Traveled through wormhole!');
      }
    }
    
    // Pair wormholes if not already paired
    if (this.wormholes.length >= 2) {
      for (let i = 0; i < this.wormholes.length; i += 2) {
        if (i + 1 < this.wormholes.length) {
          if (!this.wormholes[i].metadata.destination) {
            this.wormholes[i].metadata.destination = this.wormholes[i + 1].position.clone();
          }
          if (!this.wormholes[i + 1].metadata.destination) {
            this.wormholes[i + 1].metadata.destination = this.wormholes[i].position.clone();
          }
        }
      }
    }
    
    // Animate alien ships
    for (const alienShip of this.alienShips) {
      if (alienShip.metadata?.velocity) {
        alienShip.position.addInPlace(alienShip.metadata.velocity.scale(dt));
        alienShip.rotation.y += alienShip.metadata.rotSpeed;
        
        // Check for peaceful encounter
        const dist = BABYLON.Vector3.Distance(this.ship.position, alienShip.position);
        if (dist < 30 && !alienShip.metadata.encountered) {
          alienShip.metadata.encountered = true;
          console.log('👽 First contact! The aliens send a peaceful signal.');
        }
      }
    }
    
    // Animate space whales
    for (const whale of this.spaceWhales) {
      if (whale.metadata?.velocity) {
        whale.metadata.swimPhase += dt;
        whale.position.addInPlace(whale.metadata.velocity.scale(dt));
        // Gentle swimming motion
        whale.rotation.x = Math.sin(whale.metadata.swimPhase * 0.5) * 0.1;
        whale.rotation.z = Math.cos(whale.metadata.swimPhase * 0.3) * 0.05;
        
        const dist = BABYLON.Vector3.Distance(this.ship.position, whale.position);
        if (dist < 50 && !whale.metadata.encountered) {
          whale.metadata.encountered = true;
          console.log('🐋 Majestic space whale glides past your ship!');
        }
      }
    }
    
    this.info.speed = Math.round(this.shipSpeed);
  }
  
  // Ship Upgrade Methods
  private toggleShield(): void {
    if (this.shieldStrength < 10) {
      console.log('⚠️ Insufficient shield power!');
      return;
    }
    
    this.shieldActive = !this.shieldActive;
    if (this.shieldActive) {
      console.log('🛡️ Shield ACTIVE');
    } else {
      console.log('🛡️ Shield deactivated');
    }
  }
  
  private activateBoost(): void {
    if (!this.boostAvailable) return;
    
    this.boostAvailable = false;
    this.boostDuration = 3; // 3 seconds of boost
    this.boostCooldown = 10; // 10 second cooldown
    this.maxSpeed = (50 + (this.speedUpgradeLevel * 10)) * 2; // Double max speed
    console.log('🚀 BOOST ACTIVATED! Max speed doubled!');
  }
  
  public upgradeSpeed(): void {
    if (this.speedUpgradeLevel >= 5) {
      console.log('⚠️ Maximum speed upgrade reached!');
      return;
    }
    this.speedUpgradeLevel++;
    this.maxSpeed = 50 + (this.speedUpgradeLevel * 10);
    console.log(`⚡ Speed upgraded to level ${this.speedUpgradeLevel}! Max speed: ${this.maxSpeed}`);
  }
  
  public changeShipColor(color: BABYLON.Color3): void {
    this.shipColor = color;
    // Update ship material
    const shipMat = this.ship.material as BABYLON.StandardMaterial;
    if (shipMat) {
      shipMat.diffuseColor = color;
      shipMat.emissiveColor = color.scale(0.2);
    }
    console.log(`🎨 Ship color changed to RGB(${color.r.toFixed(2)}, ${color.g.toFixed(2)}, ${color.b.toFixed(2)})`);
  }
  
  private toggleMiningBeam(): void {
    this.miningBeamActive = !this.miningBeamActive;
    if (this.miningBeamActive) {
      console.log('⛏️ Mining beam ACTIVE');
    } else {
      console.log('⛏️ Mining beam deactivated');
    }
  }
  
  public sellCargo(): void {
    if (this.cargoHold <= 0) {
      console.log('⚠️ No cargo to sell!');
      return;
    }
    
    const credits = Math.floor(this.cargoHold * 10); // 10 credits per unit
    this.info.credits += credits;
    console.log(`💰 Sold ${this.cargoHold.toFixed(0)} units for ${credits} credits!`);
    this.cargoHold = 0;
    this.info.cargoHold = 0;
  }

  // Menu System Methods
  private startGame(settings: GameSettings): void {
    this._gameSettings = settings;
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
    this._gameSettings = settings;
    
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
