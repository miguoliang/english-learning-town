/**
 * Interaction Components
 * User input, interactive elements, and input handling components
 */

import type { Component } from '../core';

export interface InteractiveComponent extends Component {
  readonly type: 'interactive';
  interactionType: 'dialogue' | 'building-entrance' | 'scene-transition' | 'learning' | 'quest';
  
  // Dialogue interactions
  dialogueId?: string;
  
  // Building entrance interactions
  entrances?: Array<{
    id: string;
    position: { x: number; y: number };
    direction: 'north' | 'south' | 'east' | 'west';
    targetScene: string;
  }>;
  
  // Scene transition interactions
  targetScene?: string;
  targetPosition?: { x: number; y: number };
  
  // Learning activity interactions
  activityId?: string;
  
  // Quest interactions
  questId?: string;
  
  // Interaction conditions
  requiresAdjacency?: boolean;
  interactionRange?: number;
  
  // Interaction zones - cells where player can stand to interact
  interactionZones?: Array<{
    x: number;
    y: number;
    // Relative to the entity's position
    isRelative?: boolean;
  }>;
}

export interface InputComponent extends Component {
  readonly type: 'input';
  controllable: boolean;
  inputType: 'player' | 'ai' | 'scripted';
}

// Factory functions
export const createInteractiveComponent = (
  interactionType: InteractiveComponent['interactionType'],
  options: Partial<Omit<InteractiveComponent, 'type' | 'interactionType'>> = {}
): InteractiveComponent => ({
  type: 'interactive',
  interactionType,
  requiresAdjacency: true,
  interactionRange: 1,
  ...options
});

export const createInputComponent = (inputType: 'player' | 'ai' | 'scripted' = 'player', controllable = true): InputComponent => ({
  type: 'input',
  inputType,
  controllable
});