import { BaseInteriorScene } from './BaseInteriorScene';
import { GameConfig } from '../config/GameConfig';
import { SchoolElementsBuilder } from '../builders/SchoolElementsBuilder';

/**
 * School Interior Scene - Inside the school building
 */
export class SchoolInterior extends BaseInteriorScene {
  protected sceneBackgroundColor = GameConfig.COLORS.BEIGE;
  protected floorColor = 0xdeb887; // Burlywood floor
  protected sceneTitle = 'SCHOOL INTERIOR';
  protected sceneIcon = '🏫';
  protected exitBuildingName = 'school';

  constructor() {
    super('SchoolInterior');
  }

  /**
   * Creates classroom-specific elements using the SchoolElementsBuilder
   */
  protected createSceneElements(): void {
    if (!this.obstacles) {
      throw new Error(
        'Obstacles group not initialized. Cannot create school elements before scene initialization is complete.'
      );
    }

    const schoolBuilder = new SchoolElementsBuilder(this, this.obstacles);
    schoolBuilder.createSchoolElements();
  }
}
