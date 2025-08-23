import { useCallback } from "react";
import { useQuestStore } from "../stores/questStore";
import type { QuestData } from "../types";
import { QuestType } from "../types";

export const useQuestDisplay = () => {
  const { activeQuests, currentActiveQuest, setActiveQuest } = useQuestStore();

  const handleQuestClick = useCallback(
    (quest: QuestData) => {
      setActiveQuest(quest.id);
    },
    [setActiveQuest],
  );

  const calculateProgress = useCallback((quest: QuestData): number => {
    const completedObjectives = quest.objectives.filter(
      (obj) => obj.isCompleted,
    ).length;
    return (completedObjectives / quest.objectives.length) * 100;
  }, []);

  const getCurrentObjectiveText = useCallback((quest: QuestData): string => {
    const currentObj = quest.objectives[quest.currentObjectiveIndex];
    return currentObj ? currentObj.description : "Quest completed!";
  }, []);

  const getQuestIcon = useCallback((questType: QuestType): string => {
    switch (questType) {
      case QuestType.CONVERSATION:
        return "💬";
      case QuestType.DELIVERY:
        return "📦";
      default:
        return "⭐";
    }
  }, []);

  // Show max 5 quests
  const displayQuests = activeQuests.slice(0, 5);

  return {
    activeQuests,
    currentActiveQuest,
    displayQuests,
    handleQuestClick,
    calculateProgress,
    getCurrentObjectiveText,
    getQuestIcon,
  };
};
