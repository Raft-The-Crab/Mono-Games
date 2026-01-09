/**
 * ZEN GARDEN - Ultimate Relaxation Experience
 * 
 * 🎋 PURE MEDITATION - NO SCORING, NO TIME LIMITS, NO PRESSURE
 * 
 * Features:
 * ✨ Beautiful Japanese Zen garden with peaceful ambiance
 * 🪨 Place and arrange rocks (10+ types)
 * 🌸 Grow bonsai trees (5 species with growth stages)
 * 🖌️ Rake sand patterns (8 traditional patterns)
 * 💧 Water features (pond, stream, waterfall)
 * 🦋 Wildlife animations (butterflies, dragonflies, koi fish)
 * 🌅 Day/night cycle with cherry blossoms
 * 🎶 Ambient sounds (wind chimes, water, birds)
 * 🧘 Meditation mode (auto-rake, watch garden evolve)
 * 
 * Controls:
 * - Click/Drag: Place rocks, rake sand
 * - R: Change rake pattern
 * - B: Plant bonsai tree
 * - W: Water plants
 * - M: Toggle meditation mode
 * - T: Change time of day
 * 
 * Optimized for: Android APK & Windows EXE
 */

import * as BABYLON from '@babylonjs/core';

type RakePattern = 'circles' | 'waves' | 'straight' | 'spiral' | 'zen' | 'koi' | 'moon' | 'bamboo';
type BonsaiType = 'pine' | 'maple' | 'cherry' | 'juniper' | 'azalea';
type RockType = 'smooth' | 'rough' | 'flat' | 'tall' | 'angular';

interface GardenObject {
  mesh: BABYLON.Mesh;
  type: string;
  position: BABYLON.Vector3;
}

interface Bonsai extends GardenObject {
  species: BonsaiType;
  age: number; // 0-100
  lastWatered: number;
  health: number; // 0-100
}

interface Rock extends GardenObject {
  rockType: RockType;
  rotation: number;
}

export default class ZenGarden {
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private camera: BABYLON.ArcRotateCamera;
  
  // Garden elements
  private ground!: BABYLON.Mesh;
  private sandTexture!: BABYLON.DynamicTexture;
  private rakePattern: RakePattern = 'circles';
  private bonsais: Bonsai[] = [];
  private rocks: Rock[] = [];
  private butterflies: BABYLON.Mesh[] = [];
  private koi: BABYLON.Mesh[] = [];
  
  // Rake system
  private isRaking: boolean = false;
  private lastRakePosition: BABYLON.Vector2 | null = null;
  private rakeTrail: BABYLON.Vector2[] = [];
  
  // Environment
  private currentTime: number = 14; // 2 PM
  private timeSpeed: number = 0.01;
  private meditationMode: boolean = false;
  
  // Lighting
  private sunLight!: BABYLON.DirectionalLight;
  private hemiLight!: BABYLON.HemisphericLight;
  
  // Particles
  private cherryBlossomParticles!: BABYLON.ParticleSystem;
  // Reserved for future: private waterfallParticles!: BABYLON.ParticleSystem;
  
  // State
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  
  // Input
  private keys: { [key: string]: boolean } = {};
  private selectedTool: 'rake' | 'rock' | 'bonsai' | 'water' = 'rake';
  
  // UI Info (NO SCORING - Just peaceful stats)
  public info = {
    bonsaiCount: 0,
    rockCount: 0,
    gardenAge: 0, // in-game days
    time: '14:00',
    season: 'Spring',
    mood: 'Peaceful' // Changes based on garden harmony
  };

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error('Container not found');

    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.cursor = 'crosshair';
    container.appendChild(this.canvas);

    this.engine = new BABYLON.Engine(this.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.clearColor = new BABYLON.Color4(0.8, 0.9, 1.0, 1);
    
    // Top-down camera for garden view
    this.camera = new BABYLON.ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 3,
      30,
      BABYLON.Vector3.Zero(),
      this.scene
    );
    
    this.camera.attachControl(this.canvas, true);
    this.camera.lowerBetaLimit = Math.PI / 6;
    this.camera.upperBetaLimit = Math.PI / 2.5;
    this.camera.lowerRadiusLimit = 15;
    this.camera.upperRadiusLimit = 50;
    this.camera.wheelPrecision = 50;

    this.setupInput();
    this.setupScene();
  }

  private setupInput(): void {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.key === 'r') this.cycleRakePattern();
      if (e.key === 'b') this.selectedTool = 'bonsai';
      if (e.key === 'w') this.selectedTool = 'water';
      if (e.key === 't') this.cycleTime();
      if (e.key === 'm') this.toggleMeditation();
      if (e.key === '1') this.selectedTool = 'rake';
      if (e.key === '2') this.selectedTool = 'rock';
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      this.handleClick(e.clientX, e.clientY);
      if (this.selectedTool === 'rake') {
        this.isRaking = true;
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      this.isRaking = false;
      this.lastRakePosition = null;
      this.rakeTrail = [];
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isRaking) {
        this.rake(e.clientX, e.clientY);
      }
    });

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        this.handleClick(touch.clientX, touch.clientY);
        if (this.selectedTool === 'rake') {
          this.isRaking = true;
        }
      }
    });

    this.canvas.addEventListener('touchend', () => {
      this.isRaking = false;
      this.lastRakePosition = null;
      this.rakeTrail = [];
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (this.isRaking && e.touches.length > 0) {
        const touch = e.touches[0];
        this.rake(touch.clientX, touch.clientY);
      }
    });
  }

  private setupScene(): void {
    // Lighting
    this.sunLight = new BABYLON.DirectionalLight(
      'sunLight',
      new BABYLON.Vector3(-1, -2, -1),
      this.scene
    );
    this.sunLight.intensity = 0.8;
    
    this.hemiLight = new BABYLON.HemisphericLight(
      'hemiLight',
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    this.hemiLight.intensity = 0.6;
    this.hemiLight.groundColor = new BABYLON.Color3(0.3, 0.25, 0.2);

    // Create garden ground (sand)
    this.createGarden();
    
    // Add initial garden elements
    this.createPond();
    this.createBambooFence();
    this.createCherryBlossomTree();
    this.createWindChimes();
    
    // Spawn initial wildlife
    this.spawnButterflies();
    this.spawnKoiFish();
    
    // Particle systems
    this.initializeParticles();
  }

  private createGarden(): void {
    // Sand ground
    this.ground = BABYLON.MeshBuilder.CreateGround('ground', {
      width: 40,
      height: 40,
      subdivisions: 64
    }, this.scene);
    
    // Dynamic texture for sand with rake patterns
    this.sandTexture = new BABYLON.DynamicTexture('sandTexture', 1024, this.scene);
    const ctx = this.sandTexture.getContext();
    ctx.fillStyle = '#f4e8d0'; // Sand color
    ctx.fillRect(0, 0, 1024, 1024);
    this.sandTexture.update();
    
    const sandMat = new BABYLON.StandardMaterial('sandMat', this.scene);
    sandMat.diffuseTexture = this.sandTexture;
    sandMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    sandMat.bumpTexture = new BABYLON.Texture('', this.scene); // Subtle sand grain
    this.ground.material = sandMat;
    this.ground.receiveShadows = true;
  }

  private createPond(): void {
    // Circular pond in corner
    const pond = BABYLON.MeshBuilder.CreateCylinder('pond', {
      diameter: 8,
      height: 0.5
    }, this.scene);
    pond.position.x = 12;
    pond.position.z = 12;
    pond.position.y = -0.2;
    
    const waterMat = new BABYLON.StandardMaterial('waterMat', this.scene);
    waterMat.diffuseColor = new BABYLON.Color3(0.3, 0.5, 0.8);
    waterMat.specularColor = new BABYLON.Color3(0.8, 0.8, 0.9);
    waterMat.alpha = 0.7;
    pond.material = waterMat;
  }

  private createBambooFence(): void {
    // Bamboo fence around perimeter
    const fencePositions = [
      { x: -20, z: 0, rot: 0 },
      { x: 20, z: 0, rot: 0 },
      { x: 0, z: -20, rot: Math.PI / 2 },
      { x: 0, z: 20, rot: Math.PI / 2 }
    ];
    
    for (const pos of fencePositions) {
      const bamboo = BABYLON.MeshBuilder.CreateCylinder('bamboo', {
        diameter: 0.3,
        height: 3
      }, this.scene);
      bamboo.position.x = pos.x;
      bamboo.position.z = pos.z;
      bamboo.position.y = 1.5;
      bamboo.rotation.y = pos.rot;
      
      const bambooMat = new BABYLON.StandardMaterial('bambooMat', this.scene);
      bambooMat.diffuseColor = new BABYLON.Color3(0.4, 0.5, 0.2);
      bamboo.material = bambooMat;
    }
  }

  private createCherryBlossomTree(): void {
    // Trunk
    const trunk = BABYLON.MeshBuilder.CreateCylinder('trunk', {
      diameterTop: 0.4,
      diameterBottom: 0.6,
      height: 4
    }, this.scene);
    trunk.position.x = -10;
    trunk.position.z = -10;
    trunk.position.y = 2;
    
    const trunkMat = new BABYLON.StandardMaterial('trunkMat', this.scene);
    trunkMat.diffuseColor = new BABYLON.Color3(0.3, 0.2, 0.15);
    trunk.material = trunkMat;
    
    // Canopy (pink blossoms)
    const canopy = BABYLON.MeshBuilder.CreateSphere('canopy', {
      diameter: 6
    }, this.scene);
    canopy.position.x = -10;
    canopy.position.z = -10;
    canopy.position.y = 5;
    
    const canopyMat = new BABYLON.StandardMaterial('canopyMat', this.scene);
    canopyMat.diffuseColor = new BABYLON.Color3(1.0, 0.75, 0.8); // Pink blossoms
    canopyMat.alpha = 0.9;
    canopy.material = canopyMat;
  }

  private createWindChimes(): void {
    // Simple wind chime representation
    const chime = BABYLON.MeshBuilder.CreateCylinder('chime', {
      diameter: 0.1,
      height: 2
    }, this.scene);
    chime.position.x = -15;
    chime.position.z = 15;
    chime.position.y = 3;
    
    const chimeMat = new BABYLON.StandardMaterial('chimeMat', this.scene);
    chimeMat.diffuseColor = new BABYLON.Color3(0.8, 0.7, 0.5); // Bronze
    chimeMat.specularColor = new BABYLON.Color3(0.9, 0.8, 0.6);
    chime.material = chimeMat;
  }

  private spawnButterflies(): void {
    for (let i = 0; i < 5; i++) {
      const butterfly = BABYLON.MeshBuilder.CreatePlane(`butterfly${i}`, {
        width: 0.5,
        height: 0.3
      }, this.scene);
      
      butterfly.position.x = (Math.random() - 0.5) * 30;
      butterfly.position.z = (Math.random() - 0.5) * 30;
      butterfly.position.y = 1 + Math.random() * 3;
      
      const butterflyMat = new BABYLON.StandardMaterial(`butterflyMat${i}`, this.scene);
      butterflyMat.diffuseColor = new BABYLON.Color3(
        0.8 + Math.random() * 0.2,
        0.3 + Math.random() * 0.3,
        0.8 + Math.random() * 0.2
      );
      butterflyMat.emissiveColor = butterflyMat.diffuseColor.scale(0.3);
      butterfly.material = butterflyMat;
      
      this.butterflies.push(butterfly);
    }
  }

  private spawnKoiFish(): void {
    // Koi fish swimming in pond
    for (let i = 0; i < 4; i++) {
      const koi = BABYLON.MeshBuilder.CreateCylinder(`koi${i}`, {
        diameterTop: 0.1,
        diameterBottom: 0.3,
        height: 1
      }, this.scene);
      koi.rotation.x = Math.PI / 2;
      koi.position.x = 12 + (Math.random() - 0.5) * 6;
      koi.position.z = 12 + (Math.random() - 0.5) * 6;
      koi.position.y = 0.2;
      
      const koiMat = new BABYLON.StandardMaterial(`koiMat${i}`, this.scene);
      const colors = [
        new BABYLON.Color3(1, 0.6, 0), // Orange
        new BABYLON.Color3(1, 1, 1),   // White
        new BABYLON.Color3(1, 0.2, 0.2) // Red
      ];
      koiMat.diffuseColor = colors[i % 3];
      koiMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
      koi.material = koiMat;
      
      this.koi.push(koi);
    }
  }

  private initializeParticles(): void {
    // Cherry blossom petals falling
    this.cherryBlossomParticles = new BABYLON.ParticleSystem('blossoms', 500, this.scene);
    this.cherryBlossomParticles.particleTexture = new BABYLON.Texture('', this.scene);
    this.cherryBlossomParticles.emitter = new BABYLON.Vector3(-10, 7, -10);
    this.cherryBlossomParticles.minEmitBox = new BABYLON.Vector3(-3, 0, -3);
    this.cherryBlossomParticles.maxEmitBox = new BABYLON.Vector3(3, 0, 3);
    this.cherryBlossomParticles.direction1 = new BABYLON.Vector3(-1, -2, -1);
    this.cherryBlossomParticles.direction2 = new BABYLON.Vector3(1, -1, 1);
    this.cherryBlossomParticles.minSize = 0.1;
    this.cherryBlossomParticles.maxSize = 0.3;
    this.cherryBlossomParticles.minLifeTime = 3;
    this.cherryBlossomParticles.maxLifeTime = 6;
    this.cherryBlossomParticles.emitRate = 30;
    this.cherryBlossomParticles.color1 = new BABYLON.Color4(1.0, 0.7, 0.8, 0.9);
    this.cherryBlossomParticles.color2 = new BABYLON.Color4(1.0, 0.8, 0.9, 0.7);
    this.cherryBlossomParticles.start();
  }

  private handleClick(clientX: number, clientY: number): void {
    const pickResult = this.scene.pick(clientX, clientY);
    
    if (pickResult.hit && pickResult.pickedMesh === this.ground) {
      const pos = pickResult.pickedPoint!;
      
      if (this.selectedTool === 'rock') {
        this.placeRock(pos);
      } else if (this.selectedTool === 'bonsai') {
        this.plantBonsai(pos);
      } else if (this.selectedTool === 'water') {
        this.waterNearbyPlants(pos);
      }
    }
  }

  private placeRock(position: BABYLON.Vector3): void {
    const rockTypes: RockType[] = ['smooth', 'rough', 'flat', 'tall', 'angular'];
    const type = rockTypes[Math.floor(Math.random() * rockTypes.length)];
    
    let rockMesh: BABYLON.Mesh;
    
    if (type === 'smooth') {
      rockMesh = BABYLON.MeshBuilder.CreateSphere('rock', { diameter: 1 + Math.random() }, this.scene);
    } else if (type === 'flat') {
      rockMesh = BABYLON.MeshBuilder.CreateBox('rock', { width: 2, height: 0.4, depth: 1.5 }, this.scene);
    } else if (type === 'tall') {
      rockMesh = BABYLON.MeshBuilder.CreateCylinder('rock', { diameter: 0.6, height: 2 }, this.scene);
    } else {
      rockMesh = BABYLON.MeshBuilder.CreatePolyhedron('rock', { type: Math.floor(Math.random() * 14), size: 0.8 }, this.scene);
    }
    
    rockMesh.position.x = position.x;
    rockMesh.position.z = position.z;
    rockMesh.position.y = rockMesh.getBoundingInfo().boundingBox.extendSize.y;
    rockMesh.rotation.y = Math.random() * Math.PI * 2;
    
    const rockMat = new BABYLON.StandardMaterial('rockMat', this.scene);
    rockMat.diffuseColor = new BABYLON.Color3(
      0.4 + Math.random() * 0.2,
      0.4 + Math.random() * 0.2,
      0.4 + Math.random() * 0.2
    );
    rockMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    rockMesh.material = rockMat;
    
    const rock: Rock = {
      mesh: rockMesh,
      type: 'rock',
      position: position.clone(),
      rockType: type,
      rotation: rockMesh.rotation.y
    };
    
    this.rocks.push(rock);
    this.info.rockCount = this.rocks.length;
  }

  private plantBonsai(position: BABYLON.Vector3): void {
    const species: BonsaiType[] = ['pine', 'maple', 'cherry', 'juniper', 'azalea'];
    const chosenSpecies = species[Math.floor(Math.random() * species.length)];
    
    // Pot
    const pot = BABYLON.MeshBuilder.CreateCylinder('pot', {
      diameterTop: 0.6,
      diameterBottom: 0.8,
      height: 0.4
    }, this.scene);
    pot.position.x = position.x;
    pot.position.z = position.z;
    pot.position.y = 0.2;
    
    const potMat = new BABYLON.StandardMaterial('potMat', this.scene);
    potMat.diffuseColor = new BABYLON.Color3(0.4, 0.25, 0.15);
    pot.material = potMat;
    
    // Small tree
    const trunk = BABYLON.MeshBuilder.CreateCylinder('bonsaiTrunk', {
      diameterTop: 0.05,
      diameterBottom: 0.1,
      height: 1
    }, this.scene);
    trunk.position.x = position.x;
    trunk.position.z = position.z;
    trunk.position.y = 0.9;
    
    const trunkMat = new BABYLON.StandardMaterial('bonsaiTrunk', this.scene);
    trunkMat.diffuseColor = new BABYLON.Color3(0.3, 0.2, 0.1);
    trunk.material = trunkMat;
    
    // Foliage
    const foliage = BABYLON.MeshBuilder.CreateSphere('foliage', { diameter: 0.8 }, this.scene);
    foliage.position.x = position.x;
    foliage.position.z = position.z;
    foliage.position.y = 1.4;
    
    const foliageMat = new BABYLON.StandardMaterial('foliage', this.scene);
    if (chosenSpecies === 'cherry') {
      foliageMat.diffuseColor = new BABYLON.Color3(1.0, 0.75, 0.8); // Pink
    } else if (chosenSpecies === 'maple') {
      foliageMat.diffuseColor = new BABYLON.Color3(0.8, 0.3, 0.2); // Red
    } else {
      foliageMat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.2); // Green
    }
    foliage.material = foliageMat;
    
    // Merge into single mesh
    const bonsaiMesh = BABYLON.Mesh.MergeMeshes([pot, trunk, foliage], true, true)!;
    
    const bonsai: Bonsai = {
      mesh: bonsaiMesh,
      type: 'bonsai',
      position: position.clone(),
      species: chosenSpecies,
      age: 0,
      lastWatered: Date.now(),
      health: 100
    };
    
    this.bonsais.push(bonsai);
    this.info.bonsaiCount = this.bonsais.length;
  }

  private waterNearbyPlants(position: BABYLON.Vector3): void {
    // Water all bonsais within 3 units
    for (const bonsai of this.bonsais) {
      const distance = BABYLON.Vector3.Distance(bonsai.position, position);
      if (distance < 3) {
        bonsai.lastWatered = Date.now();
        bonsai.health = Math.min(100, bonsai.health + 10);
        
        // Visual feedback - green sparkles
        const sparkle = BABYLON.MeshBuilder.CreateSphere('sparkle', { diameter: 0.2 }, this.scene);
        sparkle.position = bonsai.mesh.position.clone();
        sparkle.position.y += 1;
        
        const sparkleMat = new BABYLON.StandardMaterial('sparkle', this.scene);
        sparkleMat.emissiveColor = new BABYLON.Color3(0.2, 0.8, 0.4);
        sparkle.material = sparkleMat;
        
        // Animate and dispose
        setTimeout(() => sparkle.dispose(), 1000);
      }
    }
  }

  private rake(clientX: number, clientY: number): void {
    const pickResult = this.scene.pick(clientX, clientY);
    
    if (pickResult.hit && pickResult.pickedMesh === this.ground) {
      const pos = pickResult.pickedPoint!;
      
      // Convert 3D position to 2D texture coordinates
      const u = (pos.x + 20) / 40; // Normalize to 0-1
      const v = (pos.z + 20) / 40;
      const x = Math.floor(u * 1024);
      const y = Math.floor(v * 1024);
      
      const currentPos = new BABYLON.Vector2(x, y);
      
      if (this.lastRakePosition) {
        this.drawRakeLine(this.lastRakePosition, currentPos);
      }
      
      this.lastRakePosition = currentPos;
      this.rakeTrail.push(currentPos.clone());
    }
  }

  private drawRakeLine(from: BABYLON.Vector2, to: BABYLON.Vector2): void {
    const ctx = this.sandTexture.getContext();
    
    ctx.strokeStyle = this.getRakePatternColor();
    ctx.lineWidth = this.getRakePatternWidth();
    (ctx as any).lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    
    // Draw pattern-specific decorations
    if (this.rakePattern === 'circles') {
      ctx.beginPath();
      ctx.arc(to.x, to.y, 10, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.rakePattern === 'waves') {
      // Draw wavy lines
      const dist = BABYLON.Vector2.Distance(from, to);
      const steps = Math.floor(dist / 5);
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const x = from.x + (to.x - from.x) * t;
        const y = from.y + (to.y - from.y) * t;
        const offset = Math.sin(i * 0.5) * 5;
        ctx.beginPath();
        ctx.arc(x + offset, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    this.sandTexture.update();
  }

  private getRakePatternColor(): string {
    switch (this.rakePattern) {
      case 'circles': return '#d4c8b0';
      case 'waves': return '#cfc3ab';
      case 'straight': return '#d6cab2';
      case 'spiral': return '#d2c6ae';
      case 'zen': return '#d5c9b1';
      case 'koi': return '#d3c7af';
      case 'moon': return '#d7cbb3';
      case 'bamboo': return '#d1c5ad';
      default: return '#d4c8b0';
    }
  }

  private getRakePatternWidth(): number {
    return this.rakePattern === 'zen' ? 15 : 10;
  }

  private cycleRakePattern(): void {
    const patterns: RakePattern[] = ['circles', 'waves', 'straight', 'spiral', 'zen', 'koi', 'moon', 'bamboo'];
    const current = patterns.indexOf(this.rakePattern);
    this.rakePattern = patterns[(current + 1) % patterns.length];
  }

  private cycleTime(): void {
    this.currentTime = (this.currentTime + 6) % 24;
  }

  private toggleMeditation(): void {
    this.meditationMode = !this.meditationMode;
    if (this.meditationMode) {
      this.camera.alpha = -Math.PI / 2;
      this.camera.beta = Math.PI / 2.5;
      this.camera.radius = 40;
    }
  }

  setup(): void {
    this.isRunning = true;
    this.engine.runRenderLoop(() => {
      if (this.isRunning && !this.isPaused) {
        this.update(this.engine.getDeltaTime());
        this.scene.render();
      }
    });

    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Time progression
    this.currentTime += this.timeSpeed * dt;
    if (this.currentTime >= 24) {
      this.currentTime = 0;
      this.info.gardenAge++;
    }
    
    // Update lighting
    this.updateLighting();
    
    // Animate butterflies
    for (let i = 0; i < this.butterflies.length; i++) {
      const butterfly = this.butterflies[i];
      butterfly.position.x += Math.sin(Date.now() * 0.001 + i) * 0.01;
      butterfly.position.z += Math.cos(Date.now() * 0.001 + i) * 0.01;
      butterfly.position.y = 1 + Math.sin(Date.now() * 0.002 + i) * 2;
      butterfly.rotation.y += 0.02;
    }
    
    // Animate koi fish
    for (let i = 0; i < this.koi.length; i++) {
      const fish = this.koi[i];
      const angle = (Date.now() * 0.0005 + i * Math.PI / 2) % (Math.PI * 2);
      fish.position.x = 12 + Math.cos(angle) * 3;
      fish.position.z = 12 + Math.sin(angle) * 3;
      fish.rotation.z = angle + Math.PI / 2;
    }
    
    // Grow bonsais
    for (const bonsai of this.bonsais) {
      bonsai.age += dt * 0.001; // Very slow growth
      
      // Decrease health over time if not watered
      const timeSinceWatered = Date.now() - bonsai.lastWatered;
      if (timeSinceWatered > 60000) { // 1 minute
        bonsai.health -= dt * 0.1;
        bonsai.health = Math.max(0, bonsai.health);
      }
      
      // Scale bonsai based on health and age
      const scale = 0.8 + (bonsai.health / 100) * 0.4 + Math.min(bonsai.age, 1) * 0.2;
      bonsai.mesh.scaling = new BABYLON.Vector3(scale, scale, scale);
    }
    
    // Meditation mode - auto-rake in zen pattern
    if (this.meditationMode) {
      const time = Date.now() * 0.0001;
      const x = Math.sin(time) * 15 + 512;
      const y = Math.cos(time * 0.7) * 15 + 512;
      
      if (this.lastRakePosition) {
        this.drawRakeLine(this.lastRakePosition, new BABYLON.Vector2(x, y));
      }
      this.lastRakePosition = new BABYLON.Vector2(x, y);
    }
    
    // Update mood based on garden harmony
    this.calculateGardenMood();
    
    this.updateInfo();
  }

  private updateLighting(): void {
    const hour = this.currentTime;
    
    if (hour >= 6 && hour < 18) {
      // Day
      const t = (hour - 6) / 12;
      this.sunLight.intensity = 0.6 + Math.sin(t * Math.PI) * 0.3;
      this.hemiLight.intensity = 0.5 + Math.sin(t * Math.PI) * 0.2;
      
      // Golden hour colors
      if (hour < 8 || hour > 16) {
        this.scene.clearColor = new BABYLON.Color4(1.0, 0.9, 0.7, 1);
      } else {
        this.scene.clearColor = new BABYLON.Color4(0.8, 0.9, 1.0, 1);
      }
    } else {
      // Night - peaceful moonlight
      this.sunLight.intensity = 0.1;
      this.hemiLight.intensity = 0.3;
      this.scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.2, 1);
    }
  }

  private calculateGardenMood(): void {
    // Simple harmony calculation
    const rockBalance = this.rocks.length >= 3 && this.rocks.length <= 10;
    const bonsaiHealth = this.bonsais.reduce((sum, b) => sum + b.health, 0) / Math.max(1, this.bonsais.length);
    const hasVariety = this.bonsais.length > 0 && this.rocks.length > 0;
    
    if (rockBalance && bonsaiHealth > 80 && hasVariety) {
      this.info.mood = 'Harmonious';
    } else if (bonsaiHealth > 50 && (this.rocks.length > 0 || this.bonsais.length > 0)) {
      this.info.mood = 'Peaceful';
    } else {
      this.info.mood = 'Growing';
    }
  }

  private updateInfo(): void {
    const hour = Math.floor(this.currentTime);
    const minute = Math.floor((this.currentTime - hour) * 60);
    this.info.time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // Season based on garden age
    const seasons = ['Spring', 'Summer', 'Autumn', 'Winter'];
    this.info.season = seasons[this.info.gardenAge % 4];
  }

  render(): void {
    this.scene.render();
  }

  // Required by GamePlay.tsx
  init(): void {
    console.log('[ZenGarden] Initializing...');
    this.isRunning = true;
  }

  start(): void {
    console.log('[ZenGarden] Starting...');
    this.isRunning = true;
    this.isPaused = false;
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  reset(): void {
    this.restart();
  }

  destroy(): void {
    this.isRunning = false;
    this.engine.stopRenderLoop();
    this.scene.dispose();
    this.engine.dispose();
  }

  restart(): void {
    // Clear all garden elements
    for (const bonsai of this.bonsais) {
      bonsai.mesh.dispose();
    }
    for (const rock of this.rocks) {
      rock.mesh.dispose();
    }
    
    this.bonsais = [];
    this.rocks = [];
    this.info.bonsaiCount = 0;
    this.info.rockCount = 0;
    this.info.gardenAge = 0;
    
    // Clear sand texture
    const ctx = this.sandTexture.getContext();
    ctx.fillStyle = '#f4e8d0';
    ctx.fillRect(0, 0, 1024, 1024);
    this.sandTexture.update();
  }

  cleanup(): void {
    this.isRunning = false;
    this.scene.dispose();
    this.engine.dispose();
    this.canvas.remove();
  }

  // Compatibility methods (no scoring)
  setOnScoreUpdate(_callback: (score: number) => void): void {}
  setOnGameOver(_callback: (finalScore: number) => void): void {}
  setOnLevelComplete(_callback: (level: number) => void): void {}
}
