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

const EntranceMarker = styled.div<{
  x: number;
  y: number;
  direction: string;
  isInteractable?: boolean;
}>`
  position: absolute;
  left: ${props => props.x - 10}px;
  top: ${props => props.y - 10}px;
  width: 20px;
  height: 20px;
  background: ${props => props.isInteractable ? '#00b894' : '#2d3436'};
  border: 2px solid ${props => props.isInteractable ? '#00cec9' : '#636e72'};
  border-radius: ${props => {
    switch (props.direction) {
      case 'north': return '50% 50% 0 0';
      case 'south': return '0 0 50% 50%';
      case 'east': return '0 50% 50% 0';
      case 'west': return '50% 0 0 50%';
      default: return '50%';
    }
  }};
  cursor: ${props => props.isInteractable ? 'pointer' : 'default'};
  z-index: 15;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  transition: all 0.2s ease;
  
  &::after {
    content: '🚪';
    opacity: ${props => props.isInteractable ? 1 : 0.6};
  }
  
  ${props => props.isInteractable && `
    animation: glow 2s infinite;
    
    @keyframes glow {
      0%, 100% {
        box-shadow: 0 0 5px rgba(0, 184, 148, 0.5);
      }
      50% {
        box-shadow: 0 0 15px rgba(0, 206, 201, 0.8);
      }
    }
    
    &:hover {
      transform: scale(1.2);
      box-shadow: 0 0 20px rgba(0, 206, 201, 1);
    }
  `}
`;

export interface BuildingEntrance {
  id: string;
  position: { x: number; y: number }; // Grid coordinates relative to building
  direction: 'north' | 'south' | 'east' | 'west';
  sceneId: string; // Scene to enter when interacting
}

interface BuildingRangeData extends RangeData {
  name: string;
  color: string;
  icon: string;
  renderingStrategy: RenderingStrategy;
  entrances?: BuildingEntrance[];
}

export class BuildingRange extends Range {
  public readonly name: string;
  public readonly color: string;
  public readonly icon: string;
  public readonly entrances: BuildingEntrance[];
  private onClickHandler?: (building: BuildingRange) => void;
  private onEntranceInteractHandler?: (building: BuildingRange, entrance: BuildingEntrance) => void;

  constructor(data: BuildingRangeData) {
    super(data);
    this.name = data.name;
    this.color = data.color;
    this.icon = data.icon;
    this.entrances = data.entrances || [];
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
   * Set entrance interaction handler
   */
  setEntranceInteractHandler(handler: (building: BuildingRange, entrance: BuildingEntrance) => void): void {
    this.onEntranceInteractHandler = handler;
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
   * Get entrance screen position
   */
  private getEntranceScreenPosition(entrance: BuildingEntrance): { x: number; y: number } {
    const cellSize = 40;
    const screenPos = this.getScreenPosition(cellSize);
    return {
      x: screenPos.x + (entrance.position.x * cellSize) + cellSize / 2,
      y: screenPos.y + (entrance.position.y * cellSize) + cellSize / 2
    };
  }

  /**
   * Render building with proper styling and behavior
   */
  render(): React.ReactNode {
    const cellSize = 40; // Should be injected, but using constant for now
    const screenPos = this.getScreenPosition(cellSize);
    const screenSize = this.getScreenSize(cellSize);

    return (
      <>
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
        
        {/* Render entrances */}
        {this.entrances.map(entrance => {
          const entranceScreenPos = this.getEntranceScreenPosition(entrance);
          return (
            <EntranceMarker
              key={entrance.id}
              x={entranceScreenPos.x}
              y={entranceScreenPos.y}
              direction={entrance.direction}
              isInteractable={!!this.onEntranceInteractHandler}
              onClick={(e) => {
                e.stopPropagation(); // Prevent building click
                this.onEntranceInteractHandler?.(this, entrance);
              }}
            />
          );
        })}
      </>
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
    entrances?: BuildingEntrance[];
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
      renderingStrategy: new EmojiStrategy(building.icon, building.color),
      entrances: building.entrances
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