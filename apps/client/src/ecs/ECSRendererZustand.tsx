/**
 * ECS Renderer with Zustand - React component that renders ECS world entities
 * Uses Zustand store to avoid React lifecycle issues
 */

import React, { useCallback } from "react";
import styled from "styled-components";
import { useGameStore } from "../stores/unifiedGameStore";
import { getCellSize } from "../config/gameConfig";
import { logger } from "../utils/logger";

const GameCanvas = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: ${({ theme }) => theme.gradients.gameBackground};
  cursor: pointer;
`;

const EntityElement = styled.div.withConfig({
  shouldForwardProp: (prop) =>
    ![
      "cellSize",
      "x",
      "y",
      "width",
      "height",
      "backgroundColor",
      "zIndex",
    ].includes(prop),
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
  left: ${(props) => props.x * props.cellSize}px;
  top: ${(props) => props.y * props.cellSize}px;
  width: ${(props) => props.width * props.cellSize}px;
  height: ${(props) => props.height * props.cellSize}px;
  background-color: ${(props) => props.backgroundColor || "transparent"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${(props) => Math.min(props.cellSize * 0.8, 32)}px;
  z-index: ${(props) => props.zIndex};
  border-radius: 4px;
  transition: transform 0.1s ease;
  user-select: none;

  &:hover {
    transform: scale(1.05);
  }
`;

const GridOverlay = styled.div.withConfig({
  shouldForwardProp: (prop) => !["cellSize", "showGrid"].includes(prop),
})<{ cellSize: number; showGrid: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: ${(props) => (props.showGrid ? 0.1 : 0)};
  background-image:
    linear-gradient(to right, #000 1px, transparent 1px),
    linear-gradient(to bottom, #000 1px, transparent 1px);
  background-size: ${(props) => props.cellSize}px ${(props) => props.cellSize}px;
  pointer-events: none;
  transition: opacity 0.3s ease;
`;

interface ECSRendererZustandProps {
  cellSize?: number;
  showGrid?: boolean;
  className?: string;
}

export const ECSRendererZustand: React.FC<ECSRendererZustandProps> = ({
  cellSize = getCellSize(),
  showGrid = false,
  className,
}) => {
  // Get state from Unified Zustand store
  const renderableEntities = useGameStore((state) => state.renderableEntities);
  const world = useGameStore((state) => state.world);

  // Handle mouse clicks for movement and interaction
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!world) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / cellSize);
      const y = Math.floor((event.clientY - rect.top) / cellSize);

      // Emit click event for input system to handle
      world.getEventBus().emit("input:canvas-click", { x, y });
    },
    [world, cellSize],
  );

  // Handle entity clicks
  const handleEntityClick = useCallback(
    (entityId: string, event: React.MouseEvent) => {
      if (!world) return;

      event.stopPropagation();
      world.getEventBus().emit("input:entity-click", { entityId });
    },
    [world],
  );

  // Only log occasionally to avoid spam
  if (Math.random() < 0.01) {
    // Log roughly 1% of renders
    logger.ecs(
      "ECSRendererZustand rendering",
      renderableEntities.length,
      "entities",
    );
  }

  return (
    <GameCanvas
      className={className}
      onClick={handleCanvasClick}
      data-testid="game-canvas"
    >
      {/* Grid overlay */}
      <GridOverlay
        cellSize={cellSize}
        showGrid={showGrid}
        data-testid="grid-overlay"
      />

      {/* Debug info */}
      {renderableEntities.length === 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "red",
            fontSize: "20px",
            background: "rgba(255,255,255,0.9)",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          ⚠️ No renderable entities found!
        </div>
      )}

      {/* Render entities */}
      {renderableEntities.map(({ id, position, size, renderable }) => {
        return (
          <EntityElement
            key={id}
            data-testid={`entity-${id}`}
            data-entity-type={
              id.includes("player")
                ? "player"
                : id.includes("teacher") ||
                    id.includes("shopkeeper") ||
                    id.includes("librarian")
                  ? "npc"
                  : id.includes("school") ||
                      id.includes("shop") ||
                      id.includes("library") ||
                      id.includes("cafe") ||
                      id.includes("warehouse")
                    ? "building"
                    : "decoration"
            }
            x={position.x}
            y={position.y}
            width={size.width}
            height={size.height}
            backgroundColor={renderable.backgroundColor}
            zIndex={renderable.zIndex || 1}
            cellSize={cellSize}
            onClick={(e) => handleEntityClick(id, e)}
          >
            {renderable.renderType === "emoji" && renderable.icon}
            {renderable.renderType === "sprite" && (
              <img
                src={renderable.sprite}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            )}
          </EntityElement>
        );
      })}
    </GameCanvas>
  );
};
