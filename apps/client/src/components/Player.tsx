import React from 'react';
import { Rect, Circle } from 'react-konva';

interface PlayerProps {
  player: {
    x: number;
    y: number;
  };
}

const Player: React.FC<PlayerProps> = ({ player }) => {
  return (
    <>
      {/* Player character - simple colored rectangle for now */}
      <Rect
        x={player.x}
        y={player.y}
        width={32}
        height={32}
        fill="#4169E1"
        stroke="#000080"
        strokeWidth={2}
      />
      
      {/* Player indicator dot */}
      <Circle
        x={player.x + 16}
        y={player.y - 10}
        radius={3}
        fill="#FFD700"
        stroke="#FFA500"
        strokeWidth={1}
      />
    </>
  );
};

export default Player;