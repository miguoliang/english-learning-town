/**
 * Game-Specific Components
 * Player, NPC, building, and game entity components
 */

import type { Component } from "../core";

export interface PlayerComponent extends Component {
  readonly type: "player";
  name: string;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
}

export interface NPCComponent extends Component {
  readonly type: "npc";
  name: string;
  role: string;
  personality?: string;
  currentDialogue?: string;
}

export interface BuildingComponent extends Component {
  readonly type: "building";
  name: string;
  buildingType:
    | "educational"
    | "commercial"
    | "residential"
    | "social"
    | "storage";
  description?: string;
}

export interface FurnitureComponent extends Component {
  readonly type: "furniture";
  name: string;
  furnitureType:
    | "desk"
    | "chair"
    | "blackboard"
    | "bookshelf"
    | "storage"
    | "teaching-aid";
  usable?: boolean;
}

export interface DecorationComponent extends Component {
  readonly type: "decoration";
  decorationType: "plant" | "sign" | "statue" | "fountain";
  category: string; // 'tree', 'flower', 'bush', 'grass', etc.
  seasonal?: boolean;
}

export interface QuestGiverComponent extends Component {
  readonly type: "questGiver";
  availableQuests: string[];
  completedQuests: string[];
  currentQuest?: string;
}

export interface QuestObjectiveComponent extends Component {
  readonly type: "questObjective";
  questId: string;
  objectiveId: string;
  isCompleted: boolean;
  description: string;
}

export interface LearningComponent extends Component {
  readonly type: "learning";
  contentId: string;
  difficulty: number;
  subject: string;
  prerequisites?: string[];
}

export interface ProgressComponent extends Component {
  readonly type: "progress";
  xp: number;
  level: number;
  skills: Record<string, number>;
  achievements: string[];
}

// Factory functions
export const createPlayerComponent = (
  name: string,
  level: number = 1,
  experience: number = 0,
  health: number = 100,
  maxHealth: number = 100,
): PlayerComponent => ({
  type: "player",
  name,
  level,
  experience,
  health,
  maxHealth,
});

export const createNPCComponent = (
  name: string,
  role: string,
  personality?: string,
  currentDialogue?: string,
): NPCComponent => {
  const component: NPCComponent = { type: "npc", name, role };
  if (personality !== undefined) component.personality = personality;
  if (currentDialogue !== undefined)
    component.currentDialogue = currentDialogue;
  return component;
};

export const createBuildingComponent = (
  name: string,
  buildingType:
    | "educational"
    | "commercial"
    | "residential"
    | "social"
    | "storage",
  description?: string,
): BuildingComponent => {
  const component: BuildingComponent = { type: "building", name, buildingType };
  if (description !== undefined) component.description = description;
  return component;
};

export const createFurnitureComponent = (
  name: string,
  furnitureType: FurnitureComponent["furnitureType"],
  usable = false,
): FurnitureComponent => ({
  type: "furniture",
  name,
  furnitureType,
  usable,
});

export const createDecorationComponent = (
  decorationType: DecorationComponent["decorationType"],
  category: string,
  seasonal = false,
): DecorationComponent => ({
  type: "decoration",
  decorationType,
  category,
  seasonal,
});
