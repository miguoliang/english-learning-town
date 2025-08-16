import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../stores/unifiedGameStore';
import { LevelUpCelebration } from './LevelUpCelebration';

interface CelebrationState {
  showLevelUp: boolean;
  levelUpData: {
    newLevel: number;
    xpGained: number;
  } | null;
}

/**
 * CelebrationManager - Automatically handles celebration overlays
 * Listens to game store notifications and shows appropriate celebrations
 */
export const CelebrationManager: React.FC = () => {
  const { notifications, removeNotification } = useGameStore();
  const [celebrationState, setCelebrationState] = useState<CelebrationState>({
    showLevelUp: false,
    levelUpData: null
  });
  
  useEffect(() => {
    // Check for level up notifications
    const levelUpNotification = notifications.find(n => n.type === 'level_up');
    
    if (levelUpNotification && !celebrationState.showLevelUp) {
      // Extract level number from notification message
      const levelMatch = levelUpNotification.message.match(/level (\d+)/i);
      const newLevel = levelMatch ? parseInt(levelMatch[1], 10) : 1;
      
      // Find associated XP gain notification around the same time
      const xpNotification = notifications.find(n => 
        n.type === 'xp_gained' && 
        Math.abs(n.timestamp - levelUpNotification.timestamp) < 1000 // Within 1 second
      );
      
      const xpGained = xpNotification ? 
        parseInt(xpNotification.message.match(/\+(\d+) XP/)?.[1] || '0', 10) : 0;
      
      setCelebrationState({
        showLevelUp: true,
        levelUpData: {
          newLevel,
          xpGained
        }
      });
      
      // Remove the level up notification immediately so it doesn't trigger again
      removeNotification(levelUpNotification.id);
      
      // Also remove the XP notification if found
      if (xpNotification) {
        removeNotification(xpNotification.id);
      }
    }
  }, [notifications, celebrationState.showLevelUp, removeNotification]);
  
  const handleLevelUpContinue = () => {
    setCelebrationState({
      showLevelUp: false,
      levelUpData: null
    });
  };
  
  // Only render if we have celebration data
  if (!celebrationState.levelUpData) return null;
  
  return (
    <LevelUpCelebration
      isVisible={celebrationState.showLevelUp}
      newLevel={celebrationState.levelUpData.newLevel}
      xpGained={celebrationState.levelUpData.xpGained}
      onContinue={handleLevelUpContinue}
      rewards={{
        xp: celebrationState.levelUpData.xpGained,
        features: ['New Quests', 'Harder Challenges'],
        achievements: [] // Could be populated with level-specific achievements
      }}
    />
  );
};