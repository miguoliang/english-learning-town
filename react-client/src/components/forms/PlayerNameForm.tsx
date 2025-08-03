import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { MenuButton } from '../ui/MenuButton';
import { useGameStore } from '../../stores/gameStore';

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 250px;
`;

const PlayerNameInput = styled(motion.input)`
  padding: 1rem;
  font-size: 1.1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(10px);
  text-align: center;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 20px rgba(79, 172, 254, 0.3);
  }
`;

const LoadingSpinner = styled(motion.div)`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  margin: 0 auto;
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

      setCurrentScene('TownExploration');
      onStartGame();
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('Failed to start game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadGame = () => {
    setCurrentScene('TownExploration');
    onLoadGame();
  };

  if (isLoading) {
    return (
      <FormContainer>
        <LoadingSpinner
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <PlayerNameInput
        type="text"
        placeholder="Enter your name..."
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleStartGame()}
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