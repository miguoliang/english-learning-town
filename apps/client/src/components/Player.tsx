import React from 'react';
import { Rect, Circle } from 'react-konva';

interface PlayerProps {
  player: {
    position: {
      x: number;
      y: number;
    };
  };
}

const Player: React.FC<PlayerProps> = ({ player }) => {
  return (
    <>
      {/* Player character - simple colored rectangle for now */}
      <Rect
        x={player.position.x}
        y={player.position.y}
        width={32}
        height={32}
        fill='#4169E1'
        stroke='#000080'
        strokeWidth={2}
      />

      {/* Player indicator dot */}
      <Circle
        x={player.position.x + 16}
        y={player.position.y - 10}
        radius={3}
        fill='#FFD700'
        stroke='#FFA500'
        strokeWidth={1}
      />
    </>
  );
};

export default Player;
