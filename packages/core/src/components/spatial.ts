/**
 * Spatial Components
 * Position, size, velocity, and collision components for spatial relationships
 */

import type { Component } from '../core';

export interface PositionComponent extends Component {
  readonly type: 'position';
  x: number;
  y: number;
}

export interface SizeComponent extends Component {
  readonly type: 'size';
  width: number;
  height: number;
}

export interface VelocityComponent extends Component {
  readonly type: 'velocity';
  x: number;
  y: number;
  maxSpeed?: number;
}

export interface CollisionComponent extends Component {
  readonly type: 'collision';
  isWalkable: boolean;
  blocksMovement?: boolean;
}

// Factory functions
export const createPositionComponent = (x: number, y: number): PositionComponent => ({
  type: 'position',
  x,
  y
});

export const createSizeComponent = (width: number, height: number): SizeComponent => ({
  type: 'size',
  width,
  height
});

export const createVelocityComponent = (x: number = 0, y: number = 0, maxSpeed: number = 5): VelocityComponent => ({
  type: 'velocity',
  x,
  y,
  maxSpeed
});

export const createCollisionComponent = (isWalkable: boolean, blocksMovement: boolean = !isWalkable): CollisionComponent => ({
  type: 'collision',
  isWalkable,
  blocksMovement
});