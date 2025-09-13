import { BaseInteriorScene } from './BaseInteriorScene';
import { GameConfig } from '../config/GameConfig';
import { CafeElementsBuilder } from '../builders/CafeElementsBuilder';

/**
 * Cafe Interior Scene - Inside the cafe building
 */
export class CafeInterior extends BaseInteriorScene {
  protected sceneBackgroundColor = 0xfff8dc; // Cornsilk background
  protected floorColor = GameConfig.COLORS.WHEAT;
  protected sceneTitle = 'CAFE INTERIOR';
  protected sceneIcon = '☕';
  protected exitBuildingName = 'cafe';

  constructor() {
    super('CafeInterior');
  }

  /**
   * Creates cafe-specific elements using the CafeElementsBuilder
   */
  protected createSceneElements(): void {
    if (!this.obstacles) {
      throw new Error(
        'Obstacles group not initialized. Cannot create cafe elements before scene initialization is complete.'
      );
    }

    const cafeBuilder = new CafeElementsBuilder(this, this.obstacles);
    cafeBuilder.createCafeElements();
  }
}
