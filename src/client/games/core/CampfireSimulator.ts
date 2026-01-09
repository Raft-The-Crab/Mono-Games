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
  
  // Wildlife & Effects
  private wildlife: BABYLON.Mesh[] = [];
  private auroraParticles!: BABYLON.ParticleSystem;
  private auroraVisible: boolean = false;
  private wildlifeTimer: number = 0;
  
  // Camping Equipment
  private campingGear: BABYLON.Mesh[] = [];
  private tentMesh!: BABYLON.Mesh;
  private chairMeshes: BABYLON.Mesh[] = [];
  private coolerMesh!: BABYLON.Mesh;
  
  // Cooking System
  private cookingItems: BABYLON.Mesh[] = [];
  private isCooking: boolean = false;
  private cookingTimer: number = 0;
  
  // Ambient Audio
  private audioTimer: number = 0;
  private lastSoundTime: number = 0;
  
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
    this.createNorthernLights();
    this.createCampingGear();
    this.initializeParticles();
    
    // Initial wildlife spawn timer
    this.wildlifeTimer = 10 + Math.random() * 20;
    
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
    
    // Enhanced fire mesh with multiple layers for realistic flames
    this.fire = BABYLON.MeshBuilder.CreateCylinder('fire', { 
      diameterTop: 0, 
      diameterBottom: 1.2, 
      height: 2.5 
    }, this.scene);
    this.fire.position.y = 1.25;
    
    // Inner fire core (bright orange-white)
    const fireMat = new BABYLON.StandardMaterial('fireMat', this.scene);
    fireMat.emissiveColor = new BABYLON.Color3(1.0, 0.7, 0.2);
    fireMat.diffuseColor = new BABYLON.Color3(1.0, 0.4, 0.0);
    fireMat.alpha = 0.85;
    this.fire.material = fireMat;
    
    // Outer fire layer (red-orange glow)
    const outerFire = BABYLON.MeshBuilder.CreateCylinder('outerFire', {
      diameterTop: 0,
      diameterBottom: 1.4,
      height: 2.7
    }, this.scene);
    outerFire.position.y = 1.25;
    const outerMat = new BABYLON.StandardMaterial('outerFireMat', this.scene);
    outerMat.emissiveColor = new BABYLON.Color3(1.0, 0.3, 0.0);
    outerMat.diffuseColor = new BABYLON.Color3(0.8, 0.2, 0.0);
    outerMat.alpha = 0.5;
    outerFire.material = outerMat;
    
    // Fire base glow (subtle ambient)
    const baseGlow = BABYLON.MeshBuilder.CreateCylinder('baseGlow', {
      diameter: 2.0,
      height: 0.2
    }, this.scene);
    baseGlow.position.y = 0.1;
    const glowMat = new BABYLON.StandardMaterial('glowMat', this.scene);
    glowMat.emissiveColor = new BABYLON.Color3(1.0, 0.4, 0.0);
    glowMat.alpha = 0.3;
    baseGlow.material = glowMat;
    
    for (let i = 0; i < 6; i++) {
      const log = this.createLog();
      const angle = (i / 6) * Math.PI * 2;
      log.position.x = Math.cos(angle) * 0.9;
      log.position.z = Math.sin(angle) * 0.9;
      log.position.y = 0.3;
      log.rotation.y = angle + Math.PI / 2;
      log.rotation.x = (Math.random() - 0.5) * 0.3;
      
      // Add glow map to log ends based on fire intensity
      const logGlow = new BABYLON.GlowLayer('logGlow', this.scene);
      logGlow.intensity = 0.8;
      
      this.logs.push(log);
    }
  }

  private createLog(): BABYLON.Mesh {
    // Main log cylinder with detailed texture
    const log = BABYLON.MeshBuilder.CreateCylinder('log', { 
      diameter: 0.35, 
      height: 2.5,
      tessellation: 20
    }, this.scene);
    
    // Bark texture material with more detail
    const mat = new BABYLON.StandardMaterial('logMat', this.scene);
    mat.diffuseColor = new BABYLON.Color3(0.32, 0.22, 0.12);
    mat.specularColor = new BABYLON.Color3(0.1, 0.08, 0.05);
    mat.specularPower = 8;
    log.material = mat;
    
    // Add charred/glowing burnt ends that change with fire intensity
    const burnedMat = new BABYLON.StandardMaterial('burnedMat', this.scene);
    burnedMat.diffuseColor = new BABYLON.Color3(0.1, 0.08, 0.06);
    burnedMat.emissiveColor = new BABYLON.Color3(0.8, 0.25, 0.05); // Glowing embers
    burnedMat.specularPower = 2;
    
    // Top end (charred and glowing)
    const topEnd = BABYLON.MeshBuilder.CreateCylinder('topEnd', {
      diameter: 0.37,
      height: 0.2
    }, this.scene);
    topEnd.position.y = 1.35;
    topEnd.material = burnedMat;
    
    // Add inner glow ring (visible hot coals)
    const innerGlow = BABYLON.MeshBuilder.CreateCylinder('innerGlow', {
      diameter: 0.3,
      height: 0.15
    }, this.scene);
    innerGlow.position.y = 1.35;
    const innerMat = new BABYLON.StandardMaterial('innerGlowMat', this.scene);
    innerMat.emissiveColor = new BABYLON.Color3(1.0, 0.4, 0.0);
    innerMat.alpha = 0.7;
    innerGlow.material = innerMat;
    
    // Bottom end (charred and glowing)
    const bottomEnd = topEnd.clone('bottomEnd');
    bottomEnd.position.y = -1.35;
    
    const bottomGlow = innerGlow.clone('bottomGlow');
    bottomGlow.position.y = -1.35;
    
    // Add burn cracks/lines effect
    for (let i = 0; i < 3; i++) {
      const crack = BABYLON.MeshBuilder.CreateCylinder('crack', {
        diameter: 0.05,
        height: 0.8
      }, this.scene);
      const angle = (i / 3) * Math.PI * 2;
      crack.position.x = Math.cos(angle) * 0.16;
      crack.position.z = Math.sin(angle) * 0.16;
      crack.position.y = 0.5 + (Math.random() - 0.5) * 0.4;
      crack.rotation.x = Math.PI / 2;
      crack.rotation.z = angle;
      const crackMat = new BABYLON.StandardMaterial('crackMat', this.scene);
      crackMat.emissiveColor = new BABYLON.Color3(0.9, 0.3, 0.0);
      crackMat.alpha = 0.6;
      crack.material = crackMat;
    }
    
    // Merge all parts into one mesh
    const allParts = [log, topEnd, innerGlow, bottomEnd, bottomGlow];
    const fullLog = BABYLON.Mesh.MergeMeshes(allParts, true)!;
    
    // Add metadata for animation
    fullLog.metadata = { burnProgress: 0, glowIntensity: 1.0 };
    
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
  
  private createNorthernLights(): void {
    // Aurora borealis particle system
    this.auroraParticles = new BABYLON.ParticleSystem('aurora', 2000, this.scene);
    this.auroraParticles.particleTexture = new BABYLON.Texture('', this.scene);
    this.auroraParticles.emitter = new BABYLON.Vector3(0, 30, -30);
    this.auroraParticles.minEmitBox = new BABYLON.Vector3(-60, 0, -10);
    this.auroraParticles.maxEmitBox = new BABYLON.Vector3(60, 0, 10);
    
    // Slow downward drift
    this.auroraParticles.direction1 = new BABYLON.Vector3(-0.5, -0.2, 0);
    this.auroraParticles.direction2 = new BABYLON.Vector3(0.5, -0.1, 0);
    
    this.auroraParticles.minSize = 2;
    this.auroraParticles.maxSize = 4;
    this.auroraParticles.minLifeTime = 8;
    this.auroraParticles.maxLifeTime = 15;
    this.auroraParticles.emitRate = 100;
    this.auroraParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    
    // Green-purple aurora colors
    this.auroraParticles.color1 = new BABYLON.Color4(0.2, 1.0, 0.4, 0.3);
    this.auroraParticles.color2 = new BABYLON.Color4(0.6, 0.3, 1.0, 0.2);
    this.auroraParticles.colorDead = new BABYLON.Color4(0, 0, 0, 0);
    
    this.auroraParticles.minEmitPower = 0.2;
    this.auroraParticles.maxEmitPower = 0.5;
    this.auroraParticles.gravity = new BABYLON.Vector3(0, -0.1, 0);
    
    // Start with aurora visible (random chance)
    if (Math.random() > 0.5) {
      this.auroraVisible = true;
      this.auroraParticles.start();
    }
  }
  
  private createCampingGear(): void {
    // Tent (dome tent behind campfire)
    const tentBase = BABYLON.MeshBuilder.CreateCylinder('tentBase', {
      diameter: 5,
      height: 3,
      tessellation: 16,
      arc: 0.5
    }, this.scene);
    tentBase.position.set(0, 1.5, -12);
    tentBase.rotation.x = Math.PI / 2;
    
    const tentMat = new BABYLON.StandardMaterial('tentMat', this.scene);
    tentMat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.3);
    tentMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    tentBase.material = tentMat;
    
    // Tent door flap
    const doorFlap = BABYLON.MeshBuilder.CreateBox('doorFlap', {
      width: 1.5,
      height: 2,
      depth: 0.1
    }, this.scene);
    doorFlap.position.set(0, 1, -9.5);
    doorFlap.material = tentMat;
    
    this.tentMesh = BABYLON.Mesh.MergeMeshes([tentBase, doorFlap], true)!;
    this.campingGear.push(this.tentMesh);
    
    // Camping chairs (4 chairs around fire)
    const chairPositions = [
      { x: 3, z: 0, rot: -Math.PI / 2 },
      { x: -3, z: 0, rot: Math.PI / 2 },
      { x: 0, z: 3, rot: 0 },
      { x: 0, z: -3, rot: Math.PI }
    ];
    
    for (const pos of chairPositions) {
      const chair = this.createChair();
      chair.position.set(pos.x, 0, pos.z);
      chair.rotation.y = pos.rot;
      this.chairMeshes.push(chair);
      this.campingGear.push(chair);
    }
    
    // Cooler (next to one of the chairs)
    const coolerBody = BABYLON.MeshBuilder.CreateBox('coolerBody', {
      width: 1.5,
      height: 0.8,
      depth: 1
    }, this.scene);
    coolerBody.position.set(4, 0.4, 1);
    
    const coolerLid = BABYLON.MeshBuilder.CreateBox('coolerLid', {
      width: 1.5,
      height: 0.1,
      depth: 1
    }, this.scene);
    coolerLid.position.set(4, 0.85, 1);
    
    const coolerMat = new BABYLON.StandardMaterial('coolerMat', this.scene);
    coolerMat.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.7);
    coolerMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    coolerMat.specularPower = 64;
    coolerBody.material = coolerMat;
    coolerLid.material = coolerMat;
    
    this.coolerMesh = BABYLON.Mesh.MergeMeshes([coolerBody, coolerLid], true)!;
    this.campingGear.push(this.coolerMesh);
    
    // Camping lantern (hanging on tent)
    const lantern = BABYLON.MeshBuilder.CreateCylinder('lantern', {
      diameter: 0.3,
      height: 0.5,
      tessellation: 8
    }, this.scene);
    lantern.position.set(-1.5, 2.5, -10);
    
    const lanternMat = new BABYLON.StandardMaterial('lanternMat', this.scene);
    lanternMat.emissiveColor = new BABYLON.Color3(1.0, 0.8, 0.3);
    lanternMat.diffuseColor = new BABYLON.Color3(0.9, 0.7, 0.2);
    lantern.material = lanternMat;
    
    // Add point light for lantern
    const lanternLight = new BABYLON.PointLight('lanternLight', lantern.position, this.scene);
    lanternLight.intensity = 2;
    lanternLight.range = 8;
    lanternLight.diffuse = new BABYLON.Color3(1.0, 0.8, 0.4);
    
    this.campingGear.push(lantern);
    
    console.log('⛺ Camping gear setup complete!');
  }
  
  private createChair(): BABYLON.Mesh {
    // Simple camping chair
    const seat = BABYLON.MeshBuilder.CreateBox('seat', {
      width: 0.8,
      height: 0.1,
      depth: 0.8
    }, this.scene);
    seat.position.y = 0.5;
    
    const backrest = BABYLON.MeshBuilder.CreateBox('backrest', {
      width: 0.8,
      height: 1,
      depth: 0.1
    }, this.scene);
    backrest.position.y = 0.9;
    backrest.position.z = -0.35;
    backrest.rotation.x = -Math.PI / 12;
    
    // Chair legs
    const legs: BABYLON.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const leg = BABYLON.MeshBuilder.CreateCylinder('leg', {
        diameter: 0.08,
        height: 0.5
      }, this.scene);
      const x = (i % 2 === 0) ? -0.35 : 0.35;
      const z = (i < 2) ? -0.35 : 0.35;
      leg.position.set(x, 0.25, z);
      legs.push(leg);
    }
    
    const chairMat = new BABYLON.StandardMaterial('chairMat', this.scene);
    chairMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.35);
    chairMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    
    const chair = BABYLON.Mesh.MergeMeshes([seat, backrest, ...legs], true)!;
    chair.material = chairMat;
    
    return chair;
  }
  
  private spawnWildlife(): void {
    const types = ['deer', 'rabbit', 'owl'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const angle = Math.random() * Math.PI * 2;
    const distance = 15 + Math.random() * 10;
    
    let animal: BABYLON.Mesh;
    
    if (type === 'deer') {
      // Simple deer shape
      const body = BABYLON.MeshBuilder.CreateBox('deerBody', { width: 1, height: 1.5, depth: 2 }, this.scene);
      const neck = BABYLON.MeshBuilder.CreateBox('deerNeck', { width: 0.5, height: 1, depth: 0.5 }, this.scene);
      neck.position.y = 1.5;
      neck.position.z = 0.8;
      const head = BABYLON.MeshBuilder.CreateBox('deerHead', { width: 0.6, height: 0.8, depth: 0.6 }, this.scene);
      head.position.y = 2.2;
      head.position.z = 1.2;
      
      animal = BABYLON.Mesh.MergeMeshes([body, neck, head], true)!;
      animal.position.y = 1.5;
      
      const mat = new BABYLON.StandardMaterial('deerMat', this.scene);
      mat.diffuseColor = new BABYLON.Color3(0.5, 0.35, 0.25);
      animal.material = mat;
    } else if (type === 'rabbit') {
      // Simple rabbit shape
      const body = BABYLON.MeshBuilder.CreateSphere('rabbitBody', { diameter: 0.8 }, this.scene);
      const head = BABYLON.MeshBuilder.CreateSphere('rabbitHead', { diameter: 0.5 }, this.scene);
      head.position.y = 0.6;
      head.position.z = 0.4;
      
      animal = BABYLON.Mesh.MergeMeshes([body, head], true)!;
      animal.position.y = 0.5;
      
      const mat = new BABYLON.StandardMaterial('rabbitMat', this.scene);
      mat.diffuseColor = new BABYLON.Color3(0.7, 0.65, 0.6);
      animal.material = mat;
    } else {
      // Owl (flying)
      animal = BABYLON.MeshBuilder.CreateSphere('owl', { diameter: 0.8 }, this.scene);
      animal.position.y = 8 + Math.random() * 4;
      
      const mat = new BABYLON.StandardMaterial('owlMat', this.scene);
      mat.diffuseColor = new BABYLON.Color3(0.4, 0.35, 0.3);
      animal.material = mat;
    }
    
    animal.position.x = Math.cos(angle) * distance;
    animal.position.z = Math.sin(angle) * distance;
    
    // Add to wildlife list for animation
    animal.metadata = { 
      type, 
      spawnTime: Date.now(),
      angle,
      distance,
      bobOffset: Math.random() * Math.PI * 2
    };
    this.wildlife.push(animal);
    
    console.log(`🦌 ${type.charAt(0).toUpperCase() + type.slice(1)} appeared near the campfire!`);
  }
  
  private updateWildlife(dt: number): void {
    // Spawn wildlife occasionally (affected by weather)
    this.wildlifeTimer -= dt;
    if (this.wildlifeTimer <= 0 && this.wildlife.length < 3) {
      // Weather affects spawn rate
      const weatherMultiplier = this.currentWeather === 'storm' ? 0 : 
                                this.currentWeather === 'rain' ? 2 : 
                                this.currentWeather === 'fog' ? 1.5 : 1;
      
      if (weatherMultiplier > 0) {
        this.spawnWildlife();
        this.wildlifeTimer = (20 + Math.random() * 40) * weatherMultiplier;
      } else {
        // Animals hide during storms
        this.wildlifeTimer = 60; // Check again in 60 seconds
        console.log('⛈️ Wildlife hiding from the storm...');
      }
    }
    
    // Update existing wildlife
    this.wildlife = this.wildlife.filter(animal => {
      if (!animal.metadata) return false;
      
      const age = (Date.now() - animal.metadata.spawnTime) / 1000;
      
      // Despawn after 30 seconds
      if (age > 30) {
        animal.dispose();
        return false;
      }
      
      // Animate based on type
      if (animal.metadata.type === 'deer' || animal.metadata.type === 'rabbit') {
        // Slow walking animation
        animal.position.x += Math.sin(age) * 0.02;
        animal.position.z += Math.cos(age) * 0.02;
        // Look at fire occasionally
        const lookAtFire = Math.sin(age * 0.5) > 0.7;
        if (lookAtFire) {
          animal.lookAt(new BABYLON.Vector3(0, 1, 0));
        }
      } else if (animal.metadata.type === 'owl') {
        // Flying in circles
        animal.metadata.angle += dt * 0.2;
        animal.position.x = Math.cos(animal.metadata.angle) * animal.metadata.distance;
        animal.position.z = Math.sin(animal.metadata.angle) * animal.metadata.distance;
        // Bob up and down
        animal.metadata.bobOffset += dt * 2;
        animal.position.y = 8 + Math.sin(animal.metadata.bobOffset) * 1;
      }
      
      return true;
    });
    
    // Toggle aurora randomly
    if (Math.random() < 0.001) {
      this.auroraVisible = !this.auroraVisible;
      if (this.auroraVisible) {
        this.auroraParticles.start();
        console.log('✨ Northern lights appeared!');
      } else {
        this.auroraParticles.stop();
      }
    }
    
    // Update cooking
    this.updateCooking(dt);
    
    // Play nature sounds
    this.playNatureSounds();
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
    
    // Fire intensity decreases over time
    this.fireIntensity = Math.max(0, this.fireIntensity - dt * 0.5);
    this.fire.scaling.y = 0.5 + (this.fireIntensity / 100) * 0.5;
    this.fireParticles.emitRate = 50 + (this.fireIntensity / 100) * 150;
    
    // Animate fire with rotation and color pulsing
    this.fire.rotation.y += dt * 0.5;
    const fireMat = this.fire.material as BABYLON.StandardMaterial;
    if (fireMat) {
      // Pulse fire color based on intensity
      const pulse = Math.sin(Date.now() * 0.003) * 0.1 + 0.9;
      const intensityFactor = this.fireIntensity / 100;
      fireMat.emissiveColor = new BABYLON.Color3(
        1.0 * pulse * intensityFactor,
        (0.7 + pulse * 0.3) * intensityFactor,
        0.2 * intensityFactor
      );
    }
    
    // Update wood burning - logs glow brighter when fire is strong
    for (const log of this.logs) {
      if (log.metadata) {
        // Burn progress increases faster when fire is hot
        log.metadata.burnProgress += dt * 0.02 * (this.fireIntensity / 100);
        log.metadata.glowIntensity = Math.max(0.3, this.fireIntensity / 100);
        
        // Update log material emission based on fire intensity
        const logMat = log.material as BABYLON.StandardMaterial;
        if (logMat && logMat.name === 'burnedMat') {
          logMat.emissiveColor = new BABYLON.Color3(
            0.8 * log.metadata.glowIntensity,
            0.25 * log.metadata.glowIntensity,
            0.05 * log.metadata.glowIntensity
          );
        }
        
        // Logs slowly shrink as they burn
        if (log.metadata.burnProgress > 0.5) {
          const shrinkFactor = 1.0 - (log.metadata.burnProgress - 0.5) * 0.3;
          log.scaling.set(shrinkFactor, shrinkFactor, shrinkFactor);
        }
      }
    }
    
    // Update outer fire layers
    const outerFire = this.scene.getMeshByName('outerFire');
    if (outerFire) {
      outerFire.scaling.y = 0.5 + (this.fireIntensity / 100) * 0.5;
      outerFire.rotation.y += dt * 0.7; // Rotate faster than inner fire
    }
    
    const baseGlow = this.scene.getMeshByName('baseGlow');
    if (baseGlow) {
      const glowMat = baseGlow.material as BABYLON.StandardMaterial;
      if (glowMat) {
        const glowPulse = Math.sin(Date.now() * 0.005) * 0.2 + 0.8;
        glowMat.alpha = 0.3 * (this.fireIntensity / 100) * glowPulse;
      }
    }
    
    this.moonPhase = (this.moonPhase + dt * 0.01) % 1;
    const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
    this.info.moonPhase = phases[Math.floor(this.moonPhase * 8)];
    this.info.fireStrength = Math.round(this.fireIntensity);
    
    // Update wildlife and northern lights
    this.updateWildlife(dt);
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
  
  // Cooking System
  private startCooking(foodType: 'marshmallow' | 'hotdog' | 'coffee'): void {
    this.isCooking = true;
    this.cookingTimer = 5; // 5 seconds to cook
    
    if (foodType === 'coffee') {
      const pot = BABYLON.MeshBuilder.CreateCylinder('coffeePot', {
        diameter: 0.5,
        height: 0.6
      }, this.scene);
      pot.position.set(1, 0.5, 0.5);
      
      const potMat = new BABYLON.StandardMaterial('potMat', this.scene);
      potMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.25);
      potMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
      pot.material = potMat;
      
      this.cookingItems.push(pot);
      console.log('☕ Brewing coffee...');
    }
  }
  
  private updateCooking(dt: number): void {
    if (this.isCooking && this.cookingTimer > 0) {
      this.cookingTimer -= dt;
      if (this.cookingTimer <= 0) {
        this.isCooking = false;
        console.log('✨ Food is ready!');
      }
    }
  }
  
  // Ambient Audio
  private playNatureSounds(): void {
    const now = Date.now() / 1000;
    if (now - this.lastSoundTime > 10) { // Every 10 seconds
      const sounds = ['🦉 An owl hoots in the distance', '🐺 A wolf howls far away', '🦗 Crickets chirp rhythmically'];
      const sound = sounds[Math.floor(Math.random() * sounds.length)];
      console.log(sound);
      this.lastSoundTime = now;
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
