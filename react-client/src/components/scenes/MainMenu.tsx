// Main Menu Scene

import React from 'react';
import styled from 'styled-components';
// BackgroundAnimation removed for cleaner architecture
import { GameTitle } from '../ui/GameTitle';
import { PlayerNameForm } from '../forms/PlayerNameForm';

const MenuContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: ${({ theme }) => theme.gradients.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const VersionInfo = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
`;

interface MainMenuProps {
  onStartGame: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const handleLoadGame = () => {
    onStartGame();
  };

  const handleSettings = () => {
    // TODO: Implement settings screen
    alert('Settings coming soon!');
  };

  const handleHelp = () => {
    // TODO: Implement help/tutorial screen
    alert('Tutorial coming soon!');
  };

  return (
    <MenuContainer>
      {/* BackgroundAnimation removed for cleaner architecture */}

      <GameTitle
        title="English Learning Town"
        subtitle="Embark on an adventure to master English through immersive gameplay!"
      >
        <PlayerNameForm
          onStartGame={onStartGame}
          onLoadGame={handleLoadGame}
          onSettings={handleSettings}
          onHelp={handleHelp}
        />
      </GameTitle>

      <VersionInfo>
        English Learning Town v1.0.0 - React Edition
      </VersionInfo>
    </MenuContainer>
  );
};

export default MainMenu;