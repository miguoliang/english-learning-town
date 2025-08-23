import React from 'react';

export interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  isActive?: boolean;
}

export interface QuestTrackerProps {
  /** List of quests to display */
  quests: Quest[];
  /** Currently active quest ID */
  activeQuestId?: string;
  /** Click handler for quest selection */
  onQuestClick?: (questId: string) => void;
  /** Additional CSS class */
  className?: string;
}

/**
 * QuestTracker - A fixed-position quest tracking component
 * 
 * Features:
 * - Fixed positioning on screen
 * - Scrollable quest list
 * - Progress indicators
 * - Active quest highlighting
 * - Click interactions
 * - Responsive design
 * - CSS-based theming
 */
export const QuestTracker: React.FC<QuestTrackerProps> = ({ 
  quests, 
  activeQuestId,
  onQuestClick,
  className 
}) => {
  const containerClasses = [
    'elt-game-tracker-container',
    className
  ].filter(Boolean).join(' ');

  if (!quests.length) {
    return (
      <div className={containerClasses}>
        <div className="elt-game-tracker-header">
          <h3 className="elt-game-tracker-title">📝 Quests</h3>
        </div>
        <div className="elt-game-quest-empty">
          No active quests. Start exploring to find new adventures!
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className="elt-game-tracker-header">
        <h3 className="elt-game-tracker-title">📝 Quests ({quests.length})</h3>
      </div>
      
      <div className="elt-game-quest-list">
        {quests.map((quest) => {
          const isActive = quest.id === activeQuestId || quest.isActive;
          const progressPercentage = (quest.progress / quest.maxProgress) * 100;
          
          const questItemClasses = [
            'elt-game-quest-item',
            isActive && 'elt-game-quest-item--active'
          ].filter(Boolean).join(' ');

          return (
            <div
              key={quest.id}
              className={questItemClasses}
              onClick={() => onQuestClick?.(quest.id)}
            >
              <h4 className="elt-game-quest-title">{quest.title}</h4>
              <div className="elt-game-quest-progress">
                {quest.progress} / {quest.maxProgress} completed
              </div>
              <div className="elt-game-quest-progress-bar">
                <div 
                  className="elt-game-quest-progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};