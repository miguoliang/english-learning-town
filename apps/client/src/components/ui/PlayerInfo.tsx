import React from "react";
import styled from "styled-components";
import { useGameStore } from "../../stores/unifiedGameStore";

const PlayerInfoContainer = styled.div`
  display: flex;
  gap: 24px;
  color: white;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
`;

interface PlayerInfoProps {
  playerPosition?: { x: number; y: number };
}

export const PlayerInfo: React.FC<PlayerInfoProps> = ({ playerPosition }) => {
  const { player } = useGameStore();

  // Convert screen coordinates to grid coordinates
  const gridPosition = playerPosition
    ? {
        x: Math.round((playerPosition.x - 20) / 40),
        y: Math.round((playerPosition.y - 20) / 40),
      }
    : null;

  return (
    <PlayerInfoContainer>
      <InfoItem>
        <span>👤</span>
        <span>{player.name}</span>
      </InfoItem>
      <InfoItem>
        <span>📊</span>
        <span>Level {player.level}</span>
      </InfoItem>
      <InfoItem>
        <span>⭐</span>
        <span>{player.experience} XP</span>
      </InfoItem>
      <InfoItem>
        <span>💰</span>
        <span>${player.money}</span>
      </InfoItem>
      {gridPosition && (
        <InfoItem>
          <span>📍</span>
          <span>
            ({gridPosition.x}, {gridPosition.y})
          </span>
        </InfoItem>
      )}
    </PlayerInfoContainer>
  );
};
