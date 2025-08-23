import React, { useState, useCallback } from "react";
import styled from "styled-components";
import { Button, Input } from "@elt/ui";
import { useGameStore } from "../../stores/unifiedGameStore";

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
  max-width: 600px;
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

const SettingsSection = styled.div`
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
  margin: 0 0 ${({ theme }) => theme.spacing[4]} 0;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[4]};

  &:last-child {
    margin-bottom: 0;
  }
`;

const SettingLabel = styled.label`
  color: ${({ theme }) => theme.colors.surface};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing[4]};
`;

const SliderContainer = styled.div`
  flex: 1;
  max-width: 200px;
`;

const Slider = styled.input`
  width: 100%;
  height: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  opacity: 0.7;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }

  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    border: none;
  }
`;

const VolumeValue = styled.span`
  color: ${({ theme }) => theme.colors.surface};
  font-family: ${({ theme }) => theme.fonts.mono || "monospace"};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  min-width: 40px;
  text-align: right;
  margin-left: ${({ theme }) => theme.spacing[2]};
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing[8]};
`;

const PlayerNameSection = styled.div`
  max-width: 300px;
`;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const player = useGameStore((state) => state.player);
  const updatePlayer = useGameStore((state) => state.updatePlayer);

  // Local state for settings
  const [masterVolume, setMasterVolume] = useState(75);
  const [musicVolume, setMusicVolume] = useState(60);
  const [sfxVolume, setSfxVolume] = useState(80);
  const [playerName, setPlayerName] = useState(player.name);

  const handleSaveSettings = useCallback(() => {
    // Update player name if changed
    if (playerName !== player.name) {
      updatePlayer({ name: playerName });
    }

    // TODO: Save volume settings to game preferences
    // This would be connected to audio manager in a full implementation

    onClose();
  }, [playerName, player.name, updatePlayer, onClose]);

  const handleResetDefaults = useCallback(() => {
    setMasterVolume(75);
    setMusicVolume(60);
    setSfxVolume(80);
    setPlayerName(player.name); // Reset to current saved name
  }, [player.name]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>⚙️ Settings</ModalTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕ Close
          </Button>
        </ModalHeader>

        <SettingsSection>
          <SectionTitle>🎵 Audio Settings</SectionTitle>

          <SettingItem>
            <SettingLabel htmlFor="master-volume">Master Volume</SettingLabel>
            <SliderContainer>
              <Slider
                id="master-volume"
                type="range"
                min="0"
                max="100"
                value={masterVolume}
                onChange={(e) => setMasterVolume(Number(e.target.value))}
              />
            </SliderContainer>
            <VolumeValue>{masterVolume}%</VolumeValue>
          </SettingItem>

          <SettingItem>
            <SettingLabel htmlFor="music-volume">Music Volume</SettingLabel>
            <SliderContainer>
              <Slider
                id="music-volume"
                type="range"
                min="0"
                max="100"
                value={musicVolume}
                onChange={(e) => setMusicVolume(Number(e.target.value))}
              />
            </SliderContainer>
            <VolumeValue>{musicVolume}%</VolumeValue>
          </SettingItem>

          <SettingItem>
            <SettingLabel htmlFor="sfx-volume">Sound Effects</SettingLabel>
            <SliderContainer>
              <Slider
                id="sfx-volume"
                type="range"
                min="0"
                max="100"
                value={sfxVolume}
                onChange={(e) => setSfxVolume(Number(e.target.value))}
              />
            </SliderContainer>
            <VolumeValue>{sfxVolume}%</VolumeValue>
          </SettingItem>
        </SettingsSection>

        <SettingsSection>
          <SectionTitle>👤 Player Settings</SectionTitle>

          <SettingItem>
            <SettingLabel htmlFor="player-name">Player Name</SettingLabel>
            <PlayerNameSection>
              <Input
                id="player-name"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
              />
            </PlayerNameSection>
          </SettingItem>
        </SettingsSection>

        <ButtonContainer>
          <Button variant="outline" onClick={handleResetDefaults}>
            🔄 Reset Defaults
          </Button>
          <Button variant="secondary" onClick={onClose}>
            ❌ Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveSettings}>
            ✅ Save Settings
          </Button>
        </ButtonContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};
