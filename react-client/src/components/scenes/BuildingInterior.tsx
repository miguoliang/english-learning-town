import React from 'react';
import styled from 'styled-components';
import type { BuildingScene } from '../../hooks/useBuildingScenes';

const InteriorContainer = styled.div<{ backgroundColor?: string }>`
  width: 100vw;
  height: 100vh;
  background: ${props => props.backgroundColor || '#f8f9fa'};
  background-image: ${props => props.backgroundColor ? `
    linear-gradient(45deg, ${props.backgroundColor} 25%, transparent 25%),
    linear-gradient(-45deg, ${props.backgroundColor} 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, ${props.backgroundColor} 75%),
    linear-gradient(-45deg, transparent 75%, ${props.backgroundColor} 75%)
  ` : 'none'};
  background-size: 40px 40px;
  background-position: 0 0, 0 20px, 20px -20px, -20px 0px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ContentArea = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border: 3px solid #2d3436;
  border-radius: 20px;
  padding: 40px;
  max-width: 600px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
`;

const BuildingTitle = styled.h1`
  color: #2d3436;
  font-size: 2.5rem;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const BuildingDescription = styled.p`
  color: #636e72;
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 30px;
`;

const ExitButton = styled.button`
  background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 184, 148, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 184, 148, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const InteriorIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 20px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
`;

interface BuildingInteriorProps {
  scene: BuildingScene;
  onExit: () => void;
}

export const BuildingInterior: React.FC<BuildingInteriorProps> = ({ scene, onExit }) => {
  // Get building icon based on building ID
  const getBuildingIcon = (buildingId: string): string => {
    switch (buildingId) {
      case 'school': return '📚';
      case 'shop': return '🛍️';
      case 'library': return '📖';
      case 'cafe': return '☕';
      default: return '🏢';
    }
  };

  return (
    <InteriorContainer backgroundColor={scene.backgroundColor}>
      <ContentArea>
        <InteriorIcon>
          {getBuildingIcon(scene.buildingId)}
        </InteriorIcon>
        
        <BuildingTitle>{scene.name}</BuildingTitle>
        
        <BuildingDescription>
          {scene.description}
        </BuildingDescription>

        <BuildingDescription>
          <em>Welcome! This is a prototype building interior. More interactive features coming soon!</em>
        </BuildingDescription>
        
        <ExitButton onClick={onExit}>
          🚪 Exit Building
        </ExitButton>
      </ContentArea>
    </InteriorContainer>
  );
};