import React from 'react';
import styled from 'styled-components';
import { useGameStore } from '../../stores/gameStore';

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

export const PlayerInfo: React.FC = () => {
  const { player } = useGameStore();

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
    </PlayerInfoContainer>
  );
};