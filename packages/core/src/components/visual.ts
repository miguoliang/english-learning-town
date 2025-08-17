/**
 * Visual Components
 * Rendering, animation, and visual presentation components
 */

import type { Component } from '../core';

export interface RenderableComponent extends Component {
  readonly type: 'renderable';
  renderType: 'emoji' | 'sprite' | 'shape' | 'custom';
  icon?: string;
  sprite?: string;
  backgroundColor?: string;
  zIndex?: number;
  visible?: boolean;
}

export interface AnimationComponent extends Component {
  readonly type: 'animation';
  currentAnimation: string;
  animations: Record<string, {
    frames: string[];
    duration: number;
    loop?: boolean;
  }>;
  isPlaying: boolean;
  currentFrame: number;
  lastFrameTime: number;
}

export interface MovementAnimationComponent extends Component {
  readonly type: 'movement-animation';
  isMoving: boolean;
  direction: 'north' | 'south' | 'east' | 'west' | null;
  walkCycle?: {
    frames: string[];
    speed: number;
  };
}

// Factory functions
export const createRenderableComponent = (
  renderType: RenderableComponent['renderType'],
  options: Partial<Omit<RenderableComponent, 'type' | 'renderType'>> = {}
): RenderableComponent => {
  const component: RenderableComponent = {
    type: 'renderable',
    renderType,
    visible: options.visible !== false, // Default to true unless explicitly false
    zIndex: options.zIndex || 1
  };
  
  if (options.icon !== undefined) component.icon = options.icon;
  if (options.sprite !== undefined) component.sprite = options.sprite;
  if (options.backgroundColor !== undefined) component.backgroundColor = options.backgroundColor;
  
  return component;
};

export const createAnimationComponent = (
  currentAnimation: string,
  animations: AnimationComponent['animations']
): AnimationComponent => ({
  type: 'animation',
  currentAnimation,
  animations,
  isPlaying: true,
  currentFrame: 0,
  lastFrameTime: 0
});

export const createMovementAnimationComponent = (): MovementAnimationComponent => ({
  type: 'movement-animation',
  direction: 'south',
  isMoving: false
});