import * as BABYLON from '@babylonjs/core';

export interface GameSettings {
  graphicsQuality: 'ultra' | 'high' | 'medium' | 'low';
  musicVolume: number;
  sfxVolume: number;
  masterVolume: number;
  motionBlur: boolean;
  vsync: boolean;
  showUI: boolean;
  showMinimap: boolean;
  cameraShake: boolean;
  cameraSmoothing: number;
}

export interface GameState {
  selectedCar: string;
  unlockedCars: string[];
  currentBiome: BiomeType;
  visitedBiomes: BiomeType[];
  currentWeather: WeatherType;
  cameraMode: CameraMode;
  radioEnabled: boolean;
  radioStation: number;
  customization: CarCustomization;
  statistics: GameStatistics;
}

export interface GameStatistics {
  totalDistance: number; // meters
  totalTime: number; // seconds
  topSpeed: number; // km/h
  carsUnlocked: number;
  biomesVisited: number;
}

export interface CarCustomization {
  color: [number, number, number];
  rims: string;
  exhaust: string;
  spoiler: boolean;
}

export type BiomeType = 
  | 'grassland'
  | 'desert'
  | 'forest'
  | 'snow'
  | 'coastal'
  | 'mountain'
  | 'canyon'
  | 'tropical';

export type WeatherType =
  | 'clear'
  | 'rain'
  | 'fog'
  | 'storm'
  | 'sunset'
  | 'night';

export type CameraMode =
  | 'chase'
  | 'close'
  | 'cinematic'
  | 'aerial'
  | 'drone'
  | 'firstperson';

export interface CarData {
  id: string;
  name: string;
  type: 'sedan' | 'suv' | 'sports' | 'truck' | 'bike' | 'van' | 'bus' | 'supercar' | 'hypercar' | 'rally';
  maxSpeed: number; // km/h
  acceleration: number; // 0-10
  handling: number; // 0-1
  weight: number; // kg
  power: number; // hp
  torque: number; // Nm
  topSpeedMph: number;
  zeroToSixty: number; // seconds
  description: string;
  price: number; // in-game currency
  unlockRequirement?: {
    type: 'distance' | 'speed' | 'time';
    value: number;
  };
}

export interface RoadSegment {
  mesh: BABYLON.Mesh;
  position: BABYLON.Vector3;
  curve: number;
  elevation: number;
  width: number;
  index: number;
}

export interface TerrainChunk {
  mesh: BABYLON.Mesh;
  biome: BiomeType;
  index: number;
}

export interface TrafficCar {
  mesh: BABYLON.Mesh;
  speed: number;
  lane: number;
  type: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface RadioStation {
  name: string;
  genre: string;
  tracks: string[];
}
