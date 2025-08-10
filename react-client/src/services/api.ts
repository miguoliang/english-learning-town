// API Client for Go Backend

import type { PlayerData } from '../types';

export class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }

  // Player endpoints
  async createPlayer(playerData: Partial<PlayerData>): Promise<PlayerData> {
    return this.request('/api/players', {
      method: 'POST',
      body: JSON.stringify(playerData),
    });
  }

  async getPlayer(playerId: string): Promise<PlayerData> {
    return this.request(`/api/players/${playerId}`);
  }

  async updatePlayer(playerId: string, playerData: Partial<PlayerData>): Promise<PlayerData> {
    return this.request(`/api/players/${playerId}`, {
      method: 'PUT',
      body: JSON.stringify(playerData),
    });
  }

  async deletePlayer(playerId: string): Promise<void> {
    return this.request(`/api/players/${playerId}`, {
      method: 'DELETE',
    });
  }

  // Quest progress
  async saveQuestProgress(playerId: string, questData: { questId: string; progress: number; completed: boolean; objectives?: Record<string, boolean> }): Promise<void> {
    return this.request(`/api/players/${playerId}/quests`, {
      method: 'POST',
      body: JSON.stringify(questData),
    });
  }

  async getQuestProgress(playerId: string): Promise<{ questId: string; progress: number; completed: boolean; objectives?: Record<string, boolean> }[]> {
    return this.request(`/api/players/${playerId}/quests`);
  }

  // Interactions (for dialogue tracking)
  async recordInteraction(interactionData: {
    playerId: string;
    npcId: string;
    dialogueId: string;
    timestamp: string;
  }): Promise<void> {
    return this.request('/api/interactions', {
      method: 'POST',
      body: JSON.stringify(interactionData),
    });
  }

  // Questions/Vocabulary
  async getQuestions(): Promise<{ id: string; text: string; options?: string[]; correctAnswer?: string; difficulty?: string }[]> {
    return this.request('/api/questions');
  }

  async recordAnswer(answerData: {
    playerId: string;
    questionId: string;
    answer: string;
    isCorrect: boolean;
    timestamp: string;
  }): Promise<void> {
    return this.request('/api/questions/answer', {
      method: 'POST',
      body: JSON.stringify(answerData),
    });
  }
}

// Singleton instance
export const apiClient = new APIClient();