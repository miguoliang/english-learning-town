import React from 'react';

const GameUI: React.FC = () => {
  // Mock data for now - will be connected to proper store later
  const player = {
    level: 1,
    experience: 0,
    inventory: []
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '300px',
      height: '150px',
      background: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '10px',
      borderRadius: '0 0 10px 0',
      fontSize: '14px'
    }}>
      <div style={{ marginBottom: '5px' }}>
        <strong>Player Level:</strong> {player.level}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Experience:</strong> {player.experience} XP
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Inventory:</strong> {player.inventory.length} items
      </div>
      
      {/* Experience Bar */}
      <div style={{
        width: '100%',
        height: '10px',
        backgroundColor: '#333',
        borderRadius: '5px',
        overflow: 'hidden',
        marginTop: '10px'
      }}>
        <div style={{
          height: '100%',
          backgroundColor: '#4CAF50',
          width: `${(player.experience % 100)}%`,
          transition: 'width 0.3s ease'
        }} />
      </div>
      <div style={{ fontSize: '12px', marginTop: '5px', textAlign: 'center' }}>
        {player.experience % 100}/100 to next level
      </div>
    </div>
  );
};

export default GameUI;