import React from 'react';
import styled from 'styled-components';
import { Range } from '../types/ranges';
import type { GridPosition, RangeData } from '../types/ranges';
import type { RenderingStrategy } from '../types/renderingStrategies';
import { EmojiStrategy } from '../types/renderingStrategies';

const SpriteContainer = styled.div<{ 
  x: number; 
  y: number; 
  width: number; 
  height: number;
  isPlayer: boolean;
  isNearby?: boolean;
}>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  z-index: ${props => props.isPlayer ? 100 : 10};
  cursor: ${props => props.isPlayer ? 'default' : 'pointer'};
  
  ${props => props.isPlayer && `
    border: 2px solid #fff;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  `}
  
  ${props => props.isNearby && !props.isPlayer && `
    animation: bounce 1s infinite;
    transform-origin: bottom;
  `}
  
  &:hover {
    ${props => !props.isPlayer && `
      transform: scale(1.1);
    `}
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
`;

export const SpriteRole = {
  PLAYER: 'PLAYER',
  NPC: 'NPC'
} as const;
export type SpriteRole = typeof SpriteRole[keyof typeof SpriteRole];

interface SpriteRangeData extends RangeData {
  name: string;
  icon: string;
  role: SpriteRole;
  blocksMovement?: boolean;
  renderingStrategy: RenderingStrategy;
}

export class SpriteRange extends Range {
  public readonly name: string;
  public readonly icon: string;
  public readonly role: SpriteRole;
  public readonly blocksMovement: boolean;
  private onInteractionHandler?: (sprite: SpriteRange) => void;
  private isNearby: boolean = false;

  constructor(data: SpriteRangeData) {
    super(data);
    this.name = data.name;
    this.icon = data.icon;
    this.role = data.role;
    this.blocksMovement = data.blocksMovement ?? (data.role === SpriteRole.NPC);
  }

  /**
   * NPCs can be interacted with, player cannot
   */
  canInteract(): boolean {
    return this.role === SpriteRole.NPC;
  }

  /**
   * Set interaction handler for sprite interactions
   */
  setInteractionHandler(handler: (sprite: SpriteRange) => void): void {
    this.onInteractionHandler = handler;
  }

  /**
   * Set nearby state for visual feedback
   */
  setNearby(nearby: boolean): void {
    this.isNearby = nearby;
  }

  /**
   * Whether this sprite blocks movement (NPCs typically do, Player doesn't)
   */
  canCollide(): boolean {
    return this.blocksMovement;
  }

  /**
   * Get type name for sprites
   */
  getTypeName(): string {
    return 'sprite';
  }

  /**
   * Handle sprite interaction
   */
  onInteraction(): void {
    if (this.onInteractionHandler && this.role === SpriteRole.NPC) {
      this.onInteractionHandler(this);
    }
  }

  /**
   * Update sprite position (for movable sprites like Player)
   */
  updatePosition(newPosition: GridPosition): SpriteRange {
    return new SpriteRange({
      id: this.id,
      position: newPosition,
      size: this.size,
      name: this.name,
      icon: this.icon,
      role: this.role,
      blocksMovement: this.blocksMovement,
      renderingStrategy: this.renderingStrategy
    });
  }

  /**
   * Render sprite with role-specific styling
   */
  render(): React.ReactNode {
    const cellSize = 40; // Should be injected, but using constant for now
    const screenPos = this.getScreenPosition(cellSize);
    const screenSize = this.getScreenSize(cellSize);

    return (
      <SpriteContainer
        key={this.id}
        x={screenPos.x}
        y={screenPos.y}
        width={screenSize.width}
        height={screenSize.height}
        isPlayer={this.role === SpriteRole.PLAYER}
        isNearby={this.isNearby}
        onClick={() => this.onInteraction()}
      >
        {this.icon}
      </SpriteContainer>
    );
  }

  /**
   * Factory method to create Player SpriteRange
   */
  static createPlayer(position: GridPosition): SpriteRange {
    return new SpriteRange({
      id: 'player',
      position,
      size: { width: 1, height: 1 },
      name: 'Player',
      icon: '🧑',
      role: SpriteRole.PLAYER,
      blocksMovement: false,
      renderingStrategy: new EmojiStrategy('🧑')
    });
  }

  /**
   * Factory method to create NPC SpriteRange
   */
  static createNPC(data: {
    id: string;
    position: GridPosition;
    name: string;
    icon: string;
    blocksMovement?: boolean;
  }): SpriteRange {
    return new SpriteRange({
      ...data,
      size: { width: 1, height: 1 },
      role: SpriteRole.NPC,
      blocksMovement: data.blocksMovement ?? true,
      renderingStrategy: new EmojiStrategy(data.icon)
    });
  }

  /**
   * Factory method to create SpriteRange from legacy NPC data
   */
  static fromLegacyNPC(npc: {
    id: string;
    x: number;
    y: number;
    name: string;
    icon: string;
  }): SpriteRange {
    const cellSize = 40;
    
    return SpriteRange.createNPC({
      id: npc.id,
      position: {
        x: Math.floor(npc.x / cellSize),
        y: Math.floor(npc.y / cellSize)
      },
      name: npc.name,
      icon: npc.icon
    });
  }

  /**
   * Convert to legacy NPC data format for backward compatibility
   */
  toLegacyNPC() {
    const cellSize = 40;
    const screenPos = this.getScreenPosition(cellSize);
    
    return {
      id: this.id,
      x: screenPos.x,
      y: screenPos.y,
      name: this.name,
      icon: this.icon
    };
  }
}