import React, { useState, useCallback } from "react";
import styled from "styled-components";
import { Button } from "@elt/ui";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContainer = styled.div`
  background: ${({ theme }) => theme.gradients.primary};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 3px solid ${({ theme }) => theme.colors.primary};
  box-shadow: ${({ theme }) => theme.shadows.large};
  padding: ${({ theme }) => theme.spacing[8]};
  max-width: 700px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateY(-50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.colors.surface};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin: 0;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
`;

const Tab = styled.button<{ isActive: boolean }>`
  background: ${({ isActive, theme }) =>
    isActive ? theme.colors.primary : "transparent"};
  color: ${({ theme }) => theme.colors.surface};
  border: none;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.md}
    ${({ theme }) => theme.borderRadius.md} 0 0;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ isActive, theme }) =>
      isActive ? theme.colors.primary : "rgba(255, 255, 255, 0.1)"};
  }
`;

const HelpSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.surface};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  margin: 0 0 ${({ theme }) => theme.spacing[3]} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const HelpItem = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing[3]};

  &:last-child {
    margin-bottom: 0;
  }
`;

const KeyboardKey = styled.kbd`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  font-family: ${({ theme }) => theme.fonts.mono || "monospace"};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.surface};
  margin-right: ${({ theme }) => theme.spacing[3]};
  min-width: 60px;
  text-align: center;
`;

const HelpText = styled.p`
  color: ${({ theme }) => theme.colors.surface};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.base};
  line-height: 1.5;
  margin: 0;
  flex: 1;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing[8]};
`;

type HelpTab = "controls" | "gameplay" | "features";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<HelpTab>("controls");

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const renderControls = () => (
    <>
      <HelpSection>
        <SectionTitle>🎮 Movement Controls</SectionTitle>
        <HelpItem>
          <KeyboardKey>WASD</KeyboardKey>
          <HelpText>
            Move your character around the world using W (up), A (left), S
            (down), D (right)
          </HelpText>
        </HelpItem>
        <HelpItem>
          <KeyboardKey>Arrow Keys</KeyboardKey>
          <HelpText>
            Alternative movement controls - use arrow keys to move your
            character
          </HelpText>
        </HelpItem>
        <HelpItem>
          <KeyboardKey>Mouse Click</KeyboardKey>
          <HelpText>
            Click anywhere on the map to move your character to that location
          </HelpText>
        </HelpItem>
      </HelpSection>

      <HelpSection>
        <SectionTitle>💬 Interaction Controls</SectionTitle>
        <HelpItem>
          <KeyboardKey>Space</KeyboardKey>
          <HelpText>
            Interact with NPCs, buildings, and objects when you're close enough
          </HelpText>
        </HelpItem>
        <HelpItem>
          <KeyboardKey>Enter</KeyboardKey>
          <HelpText>
            Continue dialogue conversations or select dialogue options
          </HelpText>
        </HelpItem>
        <HelpItem>
          <KeyboardKey>Esc</KeyboardKey>
          <HelpText>Close dialogue windows and return to exploration</HelpText>
        </HelpItem>
        <HelpItem>
          <KeyboardKey>Mouse Click</KeyboardKey>
          <HelpText>
            Click on NPCs or buildings to interact with them directly
          </HelpText>
        </HelpItem>
      </HelpSection>
    </>
  );

  const renderGameplay = () => (
    <>
      <HelpSection>
        <SectionTitle>🏛️ Exploring the Town</SectionTitle>
        <HelpText>
          Welcome to English Learning Town! Walk around and explore different
          buildings like the School, Library, Café, and Shop. Each location
          offers unique learning opportunities and NPCs to talk with.
        </HelpText>
      </HelpSection>

      <HelpSection>
        <SectionTitle>🗣️ Talking to NPCs</SectionTitle>
        <HelpText>
          Approach any NPC (Non-Player Character) and press Space or click on
          them to start a conversation. NPCs will teach you new vocabulary, give
          you quests, and help you practice English in different contexts.
        </HelpText>
      </HelpSection>

      <HelpSection>
        <SectionTitle>📚 Learning Vocabulary</SectionTitle>
        <HelpText>
          During conversations, new vocabulary words will be highlighted in
          blue. Click on highlighted words to see their definitions and add them
          to your vocabulary collection. The more words you learn, the more XP
          you'll earn!
        </HelpText>
      </HelpSection>

      <HelpSection>
        <SectionTitle>🎯 Completing Quests</SectionTitle>
        <HelpText>
          Accept quests from NPCs to earn experience points and money. Quests
          might involve delivering items, having conversations, or learning
          specific vocabulary. Check your quest progress in the top-left corner.
        </HelpText>
      </HelpSection>
    </>
  );

  const renderFeatures = () => (
    <>
      <HelpSection>
        <SectionTitle>⭐ Experience & Levels</SectionTitle>
        <HelpText>
          Earn XP by learning vocabulary, completing quests, and having
          conversations. Level up to unlock new areas and content!
        </HelpText>
      </HelpSection>

      <HelpSection>
        <SectionTitle>🏆 Achievements</SectionTitle>
        <HelpText>
          Complete various challenges to unlock achievements. Each achievement
          gives you bonus XP and recognition for your learning progress.
        </HelpText>
      </HelpSection>

      <HelpSection>
        <SectionTitle>💰 Currency System</SectionTitle>
        <HelpText>
          Earn coins by completing quests and conversations. Use your money to
          buy items from the shop or unlock special features.
        </HelpText>
      </HelpSection>

      <HelpSection>
        <SectionTitle>🔔 Progress Tracking</SectionTitle>
        <HelpText>
          Your progress is automatically saved. Track your vocabulary size,
          completed quests, current level, and achievements in your player
          profile.
        </HelpText>
      </HelpSection>

      <HelpSection>
        <SectionTitle>🎵 Audio & Settings</SectionTitle>
        <HelpText>
          Adjust game settings including audio volumes and player preferences
          through the Settings menu accessible from the main menu.
        </HelpText>
      </HelpSection>
    </>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "controls":
        return renderControls();
      case "gameplay":
        return renderGameplay();
      case "features":
        return renderFeatures();
      default:
        return renderControls();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>❓ Help & Tutorial</ModalTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕ Close
          </Button>
        </ModalHeader>

        <TabContainer>
          <Tab
            isActive={activeTab === "controls"}
            onClick={() => setActiveTab("controls")}
          >
            🎮 Controls
          </Tab>
          <Tab
            isActive={activeTab === "gameplay"}
            onClick={() => setActiveTab("gameplay")}
          >
            🎯 Gameplay
          </Tab>
          <Tab
            isActive={activeTab === "features"}
            onClick={() => setActiveTab("features")}
          >
            ✨ Features
          </Tab>
        </TabContainer>

        {renderTabContent()}

        <ButtonContainer>
          <Button variant="primary" onClick={onClose}>
            🚀 Start Playing!
          </Button>
        </ButtonContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};
