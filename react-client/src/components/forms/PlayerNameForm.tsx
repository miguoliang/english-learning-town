import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MenuButton } from '../ui/MenuButton';
import { useGameStore } from '../../stores/unifiedGameStore';
import { logger } from '../../utils/logger';

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 250px;
`;

const PlayerNameInput = styled.input`
  padding: 1.5rem 2rem;
  font-size: 1.3rem;
  font-family: 'Comic Neue', 'Fredoka One', sans-serif;
  font-weight: 600;
  border: 4px solid ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  background: ${({ theme }) => theme.gradients.accent};
  color: ${({ theme }) => theme.colors.surface};
  backdrop-filter: blur(10px);
  text-align: center;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 
    ${({ theme }) => theme.shadows.fun},
    0 4px 16px rgba(69, 183, 209, 0.3);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  min-height: 60px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.gradients.magical};
    box-shadow: 
      ${({ theme }) => theme.shadows.glow},
      0 6px 20px rgba(255, 107, 107, 0.4);
    transform: translateY(-2px) scale(1.02);
  }
  
  &:hover:not(:focus) {
    transform: translateY(-1px);
    box-shadow: 
      ${({ theme }) => theme.shadows.fun},
      0 6px 18px rgba(69, 183, 209, 0.4);
  }
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  margin: 0 auto;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface PlayerNameFormProps {
  onStartGame: () => void;
  onLoadGame: () => void;
  onSettings: () => void;
  onHelp: () => void;
}

export const PlayerNameForm: React.FC<PlayerNameFormProps> = ({
  onStartGame,
  onLoadGame,
  onSettings,
  onHelp
}) => {
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { updatePlayer, setCurrentScene } = useGameStore();

  useEffect(() => {
    // Load saved player name if exists
    const savedPlayer = useGameStore.getState().player;
    if (savedPlayer.name && savedPlayer.name !== 'Player') {
      setPlayerName(savedPlayer.name);
    }
  }, []);

  const handleStartGame = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name to start playing!');
      return;
    }

    setIsLoading(true);

    try {
      // Update player data
      updatePlayer({ 
        name: playerName.trim(),
        id: playerName.trim().toLowerCase().replace(/\s+/g, '_') + '_' + Date.now()
      });

      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1500));

      setCurrentScene('town');
      onStartGame();
    } catch (error) {
      logger.error('Failed to start game:', error);
      alert('Failed to start game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadGame = () => {
    setCurrentScene('town');
    onLoadGame();
  };

  if (isLoading) {
    return (
      <FormContainer>
        <LoadingSpinner />
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <PlayerNameInput
        type="text"
        placeholder="What's your name, adventurer? ✨"
        value={playerName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlayerName(e.target.value)}
        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleStartGame()}
        maxLength={20}
      />

      <MenuButton
        variant="primary"
        onClick={handleStartGame}
        disabled={!playerName.trim()}
      >
        🚀 Start New Adventure
      </MenuButton>

      <MenuButton
        variant="secondary"
        onClick={handleLoadGame}
      >
        📖 Continue Learning
      </MenuButton>

      <MenuButton
        variant="secondary"
        onClick={onSettings}
      >
        ⚙️ Settings
      </MenuButton>

      <MenuButton
        variant="secondary"
        onClick={onHelp}
      >
        ❓ How to Play
      </MenuButton>
    </FormContainer>
  );
};