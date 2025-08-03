import React from 'react';
import styled from 'styled-components';
import { Range } from '../types/ranges';
import type { RangeData } from '../types/ranges';
import type { RenderingStrategy } from '../types/renderingStrategies';
import { EmojiStrategy } from '../types/renderingStrategies';

const BuildingSprite = styled.div<{ 
  x: number; 
  y: number; 
  color: string; 
  width: number; 
  height: number; 
}>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  background: ${props => props.color};
  border: 2px solid #2d3436;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
`;

interface BuildingRangeData extends RangeData {
  name: string;
  color: string;
  icon: string;
  renderingStrategy: RenderingStrategy;
}

export class BuildingRange extends Range {
  public readonly name: string;
  public readonly color: string;
  public readonly icon: string;
  private onClickHandler?: (building: BuildingRange) => void;

  constructor(data: BuildingRangeData) {
    super(data);
    this.name = data.name;
    this.color = data.color;
    this.icon = data.icon;
  }

  /**
   * Buildings can always be interacted with
   */
  canInteract(): boolean {
    return true;
  }

  /**
   * Set click handler for building interactions
   */
  setClickHandler(handler: (building: BuildingRange) => void): void {
    this.onClickHandler = handler;
  }

  /**
   * Buildings always block movement
   */
  canCollide(): boolean {
    return true;
  }

  /**
   * Get type name for buildings
   */
  getTypeName(): string {
    return 'building';
  }

  /**
   * Handle building interaction
   */
  onInteraction(): void {
    if (this.onClickHandler) {
      this.onClickHandler(this);
    }
  }

  /**
   * Render building with proper styling and behavior
   */
  render(): React.ReactNode {
    const cellSize = 40; // Should be injected, but using constant for now
    const screenPos = this.getScreenPosition(cellSize);
    const screenSize = this.getScreenSize(cellSize);

    return (
      <BuildingSprite
        key={this.id}
        x={screenPos.x}
        y={screenPos.y}
        width={screenSize.width}
        height={screenSize.height}
        color={this.color}
        onClick={() => this.onInteraction()}
      >
        {this.icon}
      </BuildingSprite>
    );
  }

  /**
   * Factory method to create BuildingRange from legacy building data
   */
  static fromLegacyBuilding(building: {
    id: string;
    x: number;
    y: number;
    name: string;
    color: string;
    icon: string;
    gridSize?: { width: number; height: number };
  }): BuildingRange {
    const cellSize = 40;
    
    return new BuildingRange({
      id: building.id,
      position: {
        x: Math.floor(building.x / cellSize),
        y: Math.floor(building.y / cellSize)
      },
      size: building.gridSize || { width: 4, height: 3 },
      name: building.name,
      color: building.color,
      icon: building.icon,
      renderingStrategy: new EmojiStrategy(building.icon, building.color)
    });
  }

  /**
   * Convert to legacy building data format for backward compatibility
   */
  toLegacyBuilding() {
    const cellSize = 40;
    const screenPos = this.getScreenPosition(cellSize);
    
    return {
      id: this.id,
      x: screenPos.x,
      y: screenPos.y,
      name: this.name,
      color: this.color,
      icon: this.icon,
      gridSize: this.size
    };
  }
}