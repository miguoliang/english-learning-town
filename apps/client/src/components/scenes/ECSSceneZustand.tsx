/**
 * ECS Scene with Zustand - Simplified scene component using Zustand store
 * Avoids React lifecycle issues with direct store usage
 */

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ECSRendererZustand } from "../../ecs/ECSRendererZustand";
import { useGameStore } from "../../stores/unifiedGameStore";
import {
  getDefaultPlayerPosition,
  getDefaultScenePath,
  getCellSize,
} from "../../config/gameConfig";
import { DialogueSystem } from "../dialogue/DialogueSystem";
import { XPProgressBar } from "@elt/game-client";
import { GameStats } from "../progress/GameStats";
import { AchievementGrid } from "../achievement/AchievementGrid";
import { logger } from "../../utils/logger";

const SceneContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: ${({ theme }) => theme.gradients.gameBackground};
  position: relative;
  overflow: hidden;
`;

const HUD = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 200;
  pointer-events: none;
`;

const PlayerInfo = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #2d3436;
  border-radius: 15px;
  padding: 15px 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  pointer-events: auto;
`;

const LocationText = styled.div`
  font-size: 1.1rem;
  font-weight: bold;
  color: #2d3436;
  margin-bottom: 5px;
`;

const PositionText = styled.div`
  font-size: 0.9rem;
  color: #636e72;
`;

const Controls = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #2d3436;
  border-radius: 15px;
  padding: 15px 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  pointer-events: auto;
  font-size: 0.9rem;
  color: #2d3436;
  text-align: center;

  div {
    margin-bottom: 5px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const StatsToggleButton = styled.button`
  background: ${({ theme }) => theme.gradients.primary};
  border: none;
  border-radius: 25px;
  padding: 10px 20px;
  font-family: "Comic Neue", sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.surface};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.fun};
  pointer-events: auto;
  transition: all 0.3s ease;
  margin-top: 10px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }
`;

const StatsPanel = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 1000;
  display: ${(props) => (props.isVisible ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const StatsContent = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 20px;
  max-width: 1200px;
  max-height: 90vh;
  width: 100%;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: ${({ theme }) => theme.gradients.primary};
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.fun};
  z-index: 10;

  &:hover {
    transform: scale(1.1);
  }
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.textSecondary};
`;

const TabButton = styled.button<{ isActive: boolean }>`
  font-family: "Comic Neue", sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 12px 25px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;

  ${(props) =>
    props.isActive
      ? `
      background: ${props.theme.gradients.primary};
      color: ${props.theme.colors.surface};
      box-shadow: ${props.theme.shadows.fun};
    `
      : `
      background: ${props.theme.colors.surface};
      color: ${props.theme.colors.text};
      
      &:hover {
        background: ${props.theme.colors.background};
      }
    `}
`;

interface ECSSceneZustandProps {
  playerName: string;
  scenePath?: string;
  showGrid?: boolean;
  cellSize?: number;
}

export const ECSSceneZustand: React.FC<ECSSceneZustandProps> = ({
  playerName,
  scenePath = getDefaultScenePath(),
  showGrid = true,
  cellSize = getCellSize(),
}) => {
  // Get state and actions from Unified Zustand store
  const isECSInitialized = useGameStore((state) => state.isECSInitialized);
  // Removed unused currentScene - consolidated in unified store
  const playerPosition = useGameStore((state) => state.playerPosition);
  const world = useGameStore((state) => state.world);
  const loadScene = useGameStore((state) => state.loadScene);
  const addPlayer = useGameStore((state) => state.addPlayer);
  const startGameLoop = useGameStore((state) => state.startGameLoop);
  const stopGameLoop = useGameStore((state) => state.stopGameLoop);

  // Get player data for XP progress bar
  const player = useGameStore((state) => state.player);
  const initializePlayerProgress = useGameStore(
    (state) => state.initializePlayerProgress,
  );

  // Initialize player progress if it doesn't exist
  useEffect(() => {
    if (!player.progress) {
      logger.player("Initializing player progress...");
      initializePlayerProgress();
    }
  }, [player.progress, initializePlayerProgress]);

  // Local state for dialogue management
  const [activeDialogue, setActiveDialogue] = useState<{
    npcId: string;
    targetId: string;
  } | null>(null);

  // Local state for stats panel
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [statsTab, setStatsTab] = useState<"stats" | "achievements">("stats");

  // Load scene and start game when component mounts
  useEffect(() => {
    const initializeGame = async () => {
      try {
        if (!isECSInitialized) {
          logger.warn("ECS not initialized yet, waiting...");
          return;
        }

        logger.info("ECSSceneZustand: Initializing game...");

        // Load the scene
        await loadScene(scenePath);

        // Add player to the configured default position
        const playerPos = getDefaultPlayerPosition();
        addPlayer("player", playerPos, playerName);

        // Start the game loop
        startGameLoop();

        logger.info("ECSSceneZustand: Game initialized successfully");
      } catch (error) {
        logger.error("ECSSceneZustand: Failed to initialize game:", error);
      }
    };

    initializeGame();

    // Cleanup on unmount
    return () => {
      logger.info(
        "🧹 ECSSceneZustand: Component unmounting, stopping game loop",
      );
      stopGameLoop();
    };
  }, [
    isECSInitialized,
    scenePath,
    playerName,
    loadScene,
    addPlayer,
    startGameLoop,
    stopGameLoop,
  ]);

  // Set up dialogue event listener
  useEffect(() => {
    if (!world) return;

    const eventBus = world.getEventBus();

    const handleDialogueStart = (data: {
      initiatorId: string;
      targetId: string;
      dialogueId: string;
    }) => {
      // Use the dialogueId as the npcId for the dialogue system
      setActiveDialogue({
        npcId: data.dialogueId,
        targetId: data.targetId,
      });
    };

    eventBus.on("dialogue:start", handleDialogueStart);

    return () => {
      eventBus.off("dialogue:start", handleDialogueStart);
    };
  }, [world]);

  return (
    <SceneContainer>
      {/* Game Renderer */}
      <ECSRendererZustand cellSize={cellSize} showGrid={showGrid} />

      {/* HUD */}
      <HUD>
        <PlayerInfo>
          <LocationText>English Learning Town</LocationText>
          <PositionText>
            Position: ({playerPosition?.x || 0}, {playerPosition?.y || 0})
          </PositionText>
        </PlayerInfo>

        {/* XP Progress Bar */}
        {player.progress && (
          <XPProgressBar
            currentLevel={player.level}
            totalXP={player.progress.totalXP}
            xpToNextLevel={player.progress.xpToNextLevel}
            isCompact={true}
          />
        )}

        <Controls>
          <div>🎮 WASD/Arrow keys to move</div>
          <div>🖱️ Click to move</div>
          <div>💬 Press SPACEBAR near NPCs to talk</div>
          <div>🚪 Click entrances to enter</div>
          <StatsToggleButton onClick={() => setShowStatsPanel(true)}>
            📊 View Stats & Achievements
          </StatsToggleButton>
        </Controls>
      </HUD>

      {/* Dialogue System */}
      {activeDialogue && (
        <DialogueSystem
          npcId={activeDialogue.npcId}
          onClose={() => setActiveDialogue(null)}
        />
      )}

      {/* Stats Panel */}
      <StatsPanel isVisible={showStatsPanel}>
        <StatsContent>
          <CloseButton onClick={() => setShowStatsPanel(false)}>✕</CloseButton>

          <TabContainer>
            <TabButton
              isActive={statsTab === "stats"}
              onClick={() => setStatsTab("stats")}
            >
              📊 Your Progress
            </TabButton>
            <TabButton
              isActive={statsTab === "achievements"}
              onClick={() => setStatsTab("achievements")}
            >
              🏆 Achievements
            </TabButton>
          </TabContainer>

          {statsTab === "stats" && player.progress && (
            <GameStats
              progress={player.progress}
              level={player.level}
              achievementCount={{
                unlocked: player.unlockedAchievements.length,
                total: player.achievements.length,
              }}
            />
          )}

          {statsTab === "achievements" && (
            <AchievementGrid
              achievements={player.achievements}
              unlockedAchievements={player.unlockedAchievements}
            />
          )}
        </StatsContent>
      </StatsPanel>
    </SceneContainer>
  );
};
