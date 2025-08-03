import React from 'react';
import styled from 'styled-components';
import { Range } from '../types/ranges';
import type { GridPosition, GridSize, RangeData } from '../types/ranges';
import type { RenderingStrategy } from '../types/renderingStrategies';
import { EmojiStrategy } from '../types/renderingStrategies';

const PlantSprite = styled.div<{ 
  x: number; 
  y: number; 
  width: number; 
  height: number;
  canWalkThrough: boolean;
}>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  z-index: 5;
  cursor: default;
  opacity: ${props => props.canWalkThrough ? 0.8 : 1};
  
  /* Add natural plant-like styling */
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  
  &:hover {
    transform: scale(1.05);
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
  }
`;


interface PlantRangeData extends RangeData {
  icon: string;
  canWalkThrough?: boolean;
  description?: string;
  renderingStrategy: RenderingStrategy;
}

export class PlantRange extends Range {
  public readonly icon: string;
  public readonly canWalkThrough: boolean;
  public readonly description: string;

  constructor(data: PlantRangeData) {
    super(data);
    this.icon = data.icon;
    this.canWalkThrough = data.canWalkThrough ?? false; // Default: not walkable
    this.description = data.description ?? 'Decorative plant';
  }

  /**
   * Plants usually cannot be interacted with (purely decorative)
   */
  canInteract(): boolean {
    return false;
  }


  /**
   * Plants may or may not block movement depending on type
   */
  canCollide(): boolean {
    return !this.canWalkThrough;
  }

  /**
   * Get type name for plants
   */
  getTypeName(): string {
    return 'plant';
  }

  /**
   * Optional plant interaction (e.g., picking flowers, examining trees)
   */
  onInteraction(): void {
    // Plants could trigger environmental interactions
    // E.g., picking flowers, getting items, learning about nature
    console.log(`Interacted with plant: ${this.description}`);
  }

  /**
   * Render plant with type-specific styling
   */
  render(): React.ReactNode {
    const cellSize = 40; // Should be injected, but using constant for now
    const screenPos = this.getScreenPosition(cellSize);
    const screenSize = this.getScreenSize(cellSize);

    return (
      <PlantSprite
        key={this.id}
        x={screenPos.x}
        y={screenPos.y}
        width={screenSize.width}
        height={screenSize.height}
        canWalkThrough={this.canWalkThrough}
        onClick={() => this.onInteraction()}
        title={this.description}
      >
        {this.icon}
      </PlantSprite>
    );
  }

  /**
   * Factory method to create different plant types
   */
  static createTree(id: string, position: GridPosition, size: GridSize = { width: 2, height: 2 }): PlantRange {
    return new PlantRange({
      id,
      position,
      size,
      icon: '🌳',
      canWalkThrough: false,
      description: 'A tall tree providing shade',
      renderingStrategy: new EmojiStrategy('🌳')
    });
  }

  static createBush(id: string, position: GridPosition, size: GridSize = { width: 1, height: 1 }): PlantRange {
    return new PlantRange({
      id,
      position,
      size,
      icon: '🌿',
      canWalkThrough: false,
      description: 'A dense bush',
      renderingStrategy: new EmojiStrategy('🌿')
    });
  }

  static createFlower(id: string, position: GridPosition, size: GridSize = { width: 1, height: 1 }): PlantRange {
    return new PlantRange({
      id,
      position,
      size,
      icon: '🌸',
      canWalkThrough: true,
      description: 'Beautiful flowers',
      renderingStrategy: new EmojiStrategy('🌸')
    });
  }

  static createGrass(id: string, position: GridPosition, size: GridSize = { width: 1, height: 1 }): PlantRange {
    return new PlantRange({
      id,
      position,
      size,
      icon: '🌱',
      canWalkThrough: true,
      description: 'Soft grass patch',
      renderingStrategy: new EmojiStrategy('🌱')
    });
  }

  /**
   * Factory method for creating random decorative plants
   */
  static createRandomDecoration(id: string, position: GridPosition): PlantRange {
    const decorations = [
      () => PlantRange.createFlower(id, position),
      () => PlantRange.createGrass(id, position),
      () => PlantRange.createBush(id, position)
    ];
    
    const randomIndex = Math.floor(Math.random() * decorations.length);
    return decorations[randomIndex]();
  }
}