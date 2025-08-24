import React from 'react';
import { Rect, Text } from 'react-konva';

interface NPCCharacterProps {
  character: any; // TODO: Define proper character type from types package
}

const NPCCharacter: React.FC<NPCCharacterProps> = ({ character }) => {
  if (!character || !character.position) return null;

  return (
    <>
      {/* NPC character - different color than player */}
      <Rect
        x={character.position.x}
        y={character.position.y}
        width={32}
        height={32}
        fill="#DC143C"
        stroke="#8B0000"
        strokeWidth={2}
      />
      
      {/* NPC name label */}
      <Text
        x={character.position.x - 20}
        y={character.position.y - 20}
        text={character.name || 'NPC'}
        fontSize={12}
        fill="black"
        align="center"
        width={72}
      />
    </>
  );
};

export default NPCCharacter;