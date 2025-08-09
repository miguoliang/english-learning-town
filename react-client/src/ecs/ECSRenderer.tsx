/**
 * ECS Renderer - React component that renders ECS world entities
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import type { World } from './core';
import type { PositionComponent, SizeComponent, RenderableComponent } from './components';

const GameCanvas = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: ${({ theme }) => theme.gradients.gameBackground};
  cursor: pointer;
`;

const EntityElement = styled.div.withConfig({
  shouldForwardProp: (prop) => !['cellSize'].includes(prop),
})<{
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor?: string;
  zIndex: number;
  cellSize: number;
}>`
  position: absolute;
  left: ${props => props.x * props.cellSize}px;
  top: ${props => props.y * props.cellSize}px;
  width: ${props => props.width * props.cellSize}px;
  height: ${props => props.height * props.cellSize}px;
  background-color: ${props => props.backgroundColor || 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => Math.min(props.cellSize * 0.8, 32)}px;
  z-index: ${props => props.zIndex};
  border-radius: 4px;
  transition: transform 0.1s ease;
  user-select: none;

  &:hover {
    transform: scale(1.05);
  }
`;

const GridOverlay = styled.div.withConfig({
  shouldForwardProp: (prop) => !['cellSize', 'showGrid'].includes(prop),
})<{ cellSize: number; showGrid: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: ${props => props.showGrid ? 0.1 : 0};
  background-image: 
    linear-gradient(to right, #000 1px, transparent 1px),
    linear-gradient(to bottom, #000 1px, transparent 1px);
  background-size: ${props => props.cellSize}px ${props => props.cellSize}px;
  pointer-events: none;
  transition: opacity 0.3s ease;
`;

interface ECSRendererProps {
  world: World;
  cellSize?: number;
  showGrid?: boolean;
  className?: string;
}

export const ECSRenderer: React.FC<ECSRendererProps> = ({ 
  world, 
  cellSize = 40, 
  showGrid = false,
  className 
}) => {
  const [renderableEntities, setRenderableEntities] = useState<Array<{
    id: string;
    position: PositionComponent;
    size: SizeComponent;
    renderable: RenderableComponent;
  }>>([]);

  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Handle mouse clicks for movement and interaction
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);

    // Emit click event for input system to handle
    world.getEventBus().emit('input:canvas-click', { x, y });
  }, [world, cellSize]);

  // Handle entity clicks
  const handleEntityClick = useCallback((entityId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    world.getEventBus().emit('input:entity-click', { entityId });
  }, [world]);

  // Game loop
  const gameLoop = useCallback((currentTime: number = 0) => {
    lastUpdateRef.current = currentTime;

    // Update ECS world
    world.update();

    // Schedule next frame
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [world]);

  // Set up render system listener
  useEffect(() => {
    const unsubscribe = world.getEventBus().subscribe('render:frame-ready', (event) => {
      console.log('🎨 Render frame ready, entities:', event.data.entities.length);
      setRenderableEntities(event.data.entities);
    });

    return unsubscribe;
  }, [world]);

  // Start game loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);

  // Keyboard input handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      world.getEventBus().emit('input:key-down', { key: event.code });
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      world.getEventBus().emit('input:key-up', { key: event.code });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [world]);

  return (
    <GameCanvas className={className} onClick={handleCanvasClick}>
      {/* Grid overlay */}
      <GridOverlay cellSize={cellSize} showGrid={showGrid} />
      
      {/* Render entities */}
      {renderableEntities.map(({ id, position, size, renderable }) => (
        <EntityElement
          key={id}
          x={position.x}
          y={position.y}
          width={size.width}
          height={size.height}
          backgroundColor={renderable.backgroundColor}
          zIndex={renderable.zIndex || 1}
          cellSize={cellSize}
          onClick={(e) => handleEntityClick(id, e)}
        >
          {renderable.renderType === 'emoji' && renderable.icon}
          {renderable.renderType === 'sprite' && (
            <img 
              src={renderable.sprite} 
              alt="" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
          )}
        </EntityElement>
      ))}
    </GameCanvas>
  );
};