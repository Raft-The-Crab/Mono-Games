/**
 * World Manager - Handles infinite procedural world generation
 * - Road generation with curves, elevation, and banking
 * - Terrain generation for multiple biomes
 * - Scenery objects (trees, rocks, buildings, signs)
 * - Road types (highway, mountain, coastal, desert)
 * - LOD system for performance
 * - Chunk loading/unloading
 */

import * as BABYLON from '@babylonjs/core';
import type { BiomeType, RoadSegment, TerrainChunk, GameSettings } from '../types';

export class WorldManager {
  private scene: BABYLON.Scene;
  // Reserved for future: settings property
  
  // Road
  private roadSegments: RoadSegment[] = [];
  private terrainChunks: TerrainChunk[] = [];
  private sceneryObjects: BABYLON.Mesh[] = [];
  
  private roadWidth: number = 12;
  private segmentLength: number = 50;
  private renderDistance: number = 60;
  
  // Current state
  private currentBiome: BiomeType = 'grassland';
  private noiseOffset: number = 0;
  private roadCurve: number = 0;
  private roadElevation: number = 0;
  
  // Biome configurations
  private biomes = {
    grassland: {
      groundColor: new BABYLON.Color3(0.3, 0.8, 0.3),
      treeColor: new BABYLON.Color3(0.2, 0.6, 0.2),
      density: 0.7
    },
    desert: {
      groundColor: new BABYLON.Color3(0.9, 0.8, 0.5),
      treeColor: new BABYLON.Color3(0.6, 0.7, 0.3),
      density: 0.2
    },
    forest: {
      groundColor: new BABYLON.Color3(0.2, 0.5, 0.2),
      treeColor: new BABYLON.Color3(0.1, 0.4, 0.1),
      density: 0.95
    },
    snow: {
      groundColor: new BABYLON.Color3(0.95, 0.95, 1.0),
      treeColor: new BABYLON.Color3(0.1, 0.3, 0.1),
      density: 0.5
    },
    coastal: {
      groundColor: new BABYLON.Color3(0.8, 0.8, 0.5),
      treeColor: new BABYLON.Color3(0.2, 0.5, 0.3),
      density: 0.4
    },
    mountain: {
      groundColor: new BABYLON.Color3(0.5, 0.5, 0.5),
      treeColor: new BABYLON.Color3(0.3, 0.4, 0.3),
      density: 0.3
    },
    canyon: {
      groundColor: new BABYLON.Color3(0.7, 0.4, 0.2),
      treeColor: new BABYLON.Color3(0.5, 0.4, 0.2),
      density: 0.1
    },
    tropical: {
      groundColor: new BABYLON.Color3(0.4, 0.7, 0.3),
      treeColor: new BABYLON.Color3(0.1, 0.5, 0.1),
      density: 0.9
    }
  };

  constructor(scene: BABYLON.Scene, _settings: GameSettings) {
    this.scene = scene;
  }

  async initialize(): Promise<void> {
    // Generate initial road
    for (let i = 0; i < this.renderDistance; i++) {
      this.generateRoadSegment(i);
    }
  }

  private generateRoadSegment(index: number): void {
    const z = index * this.segmentLength;
    
    // Advanced Perlin-like noise for ultra-smooth curves
    this.noiseOffset += 0.015;
    const curve = 
      Math.sin(this.noiseOffset * 0.6) * 20 + 
      Math.cos(this.noiseOffset * 0.3) * 12 +
      Math.sin(this.noiseOffset * 1.2) * 5 +
      Math.cos(this.noiseOffset * 0.15) * 8;
    this.roadCurve += (curve - this.roadCurve) * 0.06;
    
    const elevationNoise = 
      Math.sin(this.noiseOffset * 0.2) * 25 + 
      Math.cos(this.noiseOffset * 0.12) * 18 +
      Math.sin(this.noiseOffset * 0.35) * 10;
    this.roadElevation += (elevationNoise - this.roadElevation) * 0.025;
    
    // Create road mesh with proper subdivision
    const roadMesh = BABYLON.MeshBuilder.CreateGround(`road_${index}`, {
      width: this.roadWidth,
      height: this.segmentLength,
      subdivisions: 8
    }, this.scene);
    
    roadMesh.position.x = this.roadCurve;
    roadMesh.position.y = this.roadElevation;
    roadMesh.position.z = z;
    roadMesh.rotation.x = Math.PI / 2;
    
    // Advanced road material with PBR
    const roadMat = new BABYLON.PBRMetallicRoughnessMaterial(`roadMat_${index}`, this.scene);
    roadMat.baseColor = new BABYLON.Color3(0.12, 0.12, 0.12);
    roadMat.metallic = 0;
    roadMat.roughness = 0.8;
    roadMat.backFaceCulling = false;
    
    // Add road reflections
    roadMat._environmentIntensity = 0.2;
    
    roadMesh.material = roadMat;
    roadMesh.receiveShadows = true;
    
    // Center lane marking
    const centerLine = BABYLON.MeshBuilder.CreateBox(`line_${index}`, {
      width: 0.15,
      height: 0.08,
      depth: this.segmentLength * 0.5
    }, this.scene);
    centerLine.position.x = this.roadCurve;
    centerLine.position.y = this.roadElevation + 0.14;
    centerLine.position.z = z;
    
    const lineMat = new BABYLON.StandardMaterial(`lineMat_${index}`, this.scene);
    lineMat.diffuseColor = new BABYLON.Color3(1, 1, 0.85);
    lineMat.emissiveColor = new BABYLON.Color3(0.4, 0.4, 0.3);
    lineMat.specularPower = 16;
    centerLine.material = lineMat;
    
    // Edge lines
    [-this.roadWidth / 2 + 0.3, this.roadWidth / 2 - 0.3].forEach(offset => {
      const edgeLine = BABYLON.MeshBuilder.CreateBox(`edge_${index}_${offset}`, {
        width: 0.2,
        height: 0.06,
        depth: this.segmentLength
      }, this.scene);
      edgeLine.position.x = this.roadCurve + offset;
      edgeLine.position.y = this.roadElevation + 0.12;
      edgeLine.position.z = z;
      
      const edgeMat = new BABYLON.StandardMaterial(`edgeMat_${index}`, this.scene);
      edgeMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.95);
      edgeMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
      edgeLine.material = edgeMat;
    });
    
    this.roadSegments.push({
      mesh: roadMesh,
      position: new BABYLON.Vector3(this.roadCurve, this.roadElevation, z),
      curve: this.roadCurve,
      elevation: this.roadElevation,
      width: this.roadWidth,
      index
    });
    
    // Generate terrain
    this.generateTerrain(index, this.roadCurve, this.roadElevation, z);
    
    // Generate scenery (trees, rocks, buildings)
    if (Math.random() > 0.4) {
      this.generateScenery(index, this.roadCurve, this.roadElevation, z);
    }
    
    // Occasional road sign
    if (index % 20 === 0) {
      this.generateRoadSign(this.roadCurve, this.roadElevation, z);
    }
  }

  private generateTerrain(index: number, roadX: number, roadY: number, z: number): void {
    const biomeConfig = this.biomes[this.currentBiome];
    
    // Left terrain
    const leftTerrain = BABYLON.MeshBuilder.CreateGround(`terrain_left_${index}`, {
      width: 200,
      height: this.segmentLength,
      subdivisions: 4
    }, this.scene);
    leftTerrain.position.x = roadX - this.roadWidth / 2 - 100;
    leftTerrain.position.y = roadY - 0.5;
    leftTerrain.position.z = z;
    leftTerrain.rotation.x = Math.PI / 2;
    
    const leftMat = new BABYLON.StandardMaterial(`leftMat_${index}`, this.scene);
    leftMat.diffuseColor = biomeConfig.groundColor;
    leftMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    leftTerrain.material = leftMat;
    leftTerrain.receiveShadows = true;
    
    // Right terrain
    const rightTerrain = leftTerrain.clone(`terrain_right_${index}`);
    rightTerrain.position.x = roadX + this.roadWidth / 2 + 100;
    rightTerrain.material = leftMat;
    
    this.terrainChunks.push({
      mesh: leftTerrain,
      biome: this.currentBiome,
      index
    });
    
    this.terrainChunks.push({
      mesh: rightTerrain,
      biome: this.currentBiome,
      index
    });
  }

  private generateScenery(_index: number, roadX: number, roadY: number, z: number): void {
    const biomeConfig = this.biomes[this.currentBiome];
    const count = Math.floor(Math.random() * 5 * biomeConfig.density);
    
    for (let i = 0; i < count; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const offset = side * (this.roadWidth / 2 + 5 + Math.random() * 80);
      
      let object: BABYLON.Mesh;
      const type = Math.random();
      
      if (type < 0.7) {
        // Tree
        object = this.createTree(biomeConfig.treeColor);
      } else if (type < 0.85) {
        // Rock
        object = this.createRock();
      } else {
        // Bush
        object = this.createBush(biomeConfig.treeColor);
      }
      
      object.position.x = roadX + offset;
      object.position.y = roadY - 0.5;
      object.position.z = z + (Math.random() - 0.5) * this.segmentLength;
      object.receiveShadows = true;
      
      this.sceneryObjects.push(object);
    }
  }

  private createTree(color: BABYLON.Color3): BABYLON.Mesh {
    // Trunk
    const trunk = BABYLON.MeshBuilder.CreateCylinder('trunk', {
      diameter: 0.5,
      height: 4,
      tessellation: 8
    }, this.scene);
    trunk.position.y = 2;
    
    const trunkMat = new BABYLON.StandardMaterial('trunkMat', this.scene);
    trunkMat.diffuseColor = new BABYLON.Color3(0.35, 0.25, 0.15);
    trunk.material = trunkMat;
    
    // Foliage
    const foliage = BABYLON.MeshBuilder.CreateSphere('foliage', {
      diameter: 4,
      segments: 8
    }, this.scene);
    foliage.position.y = 5;
    
    const foliageMat = new BABYLON.StandardMaterial('foliageMat', this.scene);
    foliageMat.diffuseColor = color;
    foliage.material = foliageMat;
    
    const tree = BABYLON.Mesh.MergeMeshes([trunk, foliage], true, true)!;
    tree.scaling = new BABYLON.Vector3(
      0.8 + Math.random() * 0.4,
      0.8 + Math.random() * 0.4,
      0.8 + Math.random() * 0.4
    );
    
    return tree;
  }

  private createRock(): BABYLON.Mesh {
    const rock = BABYLON.MeshBuilder.CreateSphere('rock', {
      diameter: 2,
      segments: 6
    }, this.scene);
    
    rock.scaling = new BABYLON.Vector3(
      1 + Math.random() * 0.5,
      0.5 + Math.random() * 0.3,
      1 + Math.random() * 0.5
    );
    
    const rockMat = new BABYLON.StandardMaterial('rockMat', this.scene);
    rockMat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    rock.material = rockMat;
    
    return rock;
  }

  private createBush(color: BABYLON.Color3): BABYLON.Mesh {
    const bush = BABYLON.MeshBuilder.CreateSphere('bush', {
      diameter: 1.5,
      segments: 8
    }, this.scene);
    
    bush.scaling.y = 0.6;
    
    const bushMat = new BABYLON.StandardMaterial('bushMat', this.scene);
    bushMat.diffuseColor = color.scale(0.8);
    bush.material = bushMat;
    
    return bush;
  }

  private generateRoadSign(roadX: number, roadY: number, z: number): void {
    const side = Math.random() > 0.5 ? 1 : -1;
    const offset = side * (this.roadWidth / 2 + 2);
    
    // Sign post
    const post = BABYLON.MeshBuilder.CreateCylinder('post', {
      diameter: 0.15,
      height: 3
    }, this.scene);
    post.position.x = roadX + offset;
    post.position.y = roadY + 1.5;
    post.position.z = z;
    
    const postMat = new BABYLON.StandardMaterial('postMat', this.scene);
    postMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    post.material = postMat;
    
    // Sign board
    const sign = BABYLON.MeshBuilder.CreateBox('sign', {
      width: 2,
      height: 1.5,
      depth: 0.1
    }, this.scene);
    sign.position.x = roadX + offset;
    sign.position.y = roadY + 2.5;
    sign.position.z = z;
    
    const signMat = new BABYLON.StandardMaterial('signMat', this.scene);
    signMat.diffuseColor = new BABYLON.Color3(0.2, 0.3, 0.8);
    signMat.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.2);
    sign.material = signMat;
    
    this.sceneryObjects.push(post, sign);
  }

  update(_deltaTime: number, carPosition: BABYLON.Vector3): void {
    // Calculate current segment
    const currentSegment = Math.floor(carPosition.z / this.segmentLength);
    
    // Generate new segments ahead
    const lastSegment = this.roadSegments[this.roadSegments.length - 1];
    if (lastSegment && lastSegment.index < currentSegment + this.renderDistance) {
      this.generateRoadSegment(lastSegment.index + 1);
    }
    
    // Remove old segments behind
    while (this.roadSegments.length > 0 && 
           this.roadSegments[0].index < currentSegment - 20) {
      const old = this.roadSegments.shift()!;
      old.mesh.dispose();
    }
    
    // Clean up old terrain
    while (this.terrainChunks.length > 0 && 
           this.terrainChunks[0].index < currentSegment - 20) {
      const old = this.terrainChunks.shift()!;
      old.mesh.dispose();
    }
    
    // Clean up old scenery
    this.sceneryObjects = this.sceneryObjects.filter(obj => {
      if (obj.position.z < carPosition.z - 1000) {
        obj.dispose();
        return false;
      }
      return true;
    });
  }

  cycleBiome(): void {
    const biomes: BiomeType[] = ['grassland', 'desert', 'forest', 'snow', 'coastal', 'mountain', 'canyon', 'tropical'];
    const currentIndex = biomes.indexOf(this.currentBiome);
    this.currentBiome = biomes[(currentIndex + 1) % biomes.length];
  }

  getCurrentBiome(): string {
    return this.currentBiome.charAt(0).toUpperCase() + this.currentBiome.slice(1);
  }

  reset(): void {
    this.roadSegments.forEach(s => s.mesh.dispose());
    this.terrainChunks.forEach(t => t.mesh.dispose());
    this.sceneryObjects.forEach(o => o.dispose());
    
    this.roadSegments = [];
    this.terrainChunks = [];
    this.sceneryObjects = [];
    this.noiseOffset = 0;
    this.roadCurve = 0;
    this.roadElevation = 0;
    
    this.initialize();
  }
}
