import { BaseInteriorScene } from './BaseInteriorScene';
import { GameConfig } from '../config/GameConfig';
import { ShopElementsBuilder } from '../builders/ShopElementsBuilder';

/**
 * Shop Interior Scene - Inside the shop building
 */
export class ShopInterior extends BaseInteriorScene {
  protected sceneBackgroundColor = GameConfig.COLORS.lightGray;
  protected floorColor = GameConfig.COLORS.LAVENDER;
  protected sceneTitle = 'SHOP INTERIOR';
  protected sceneIcon = '🛒';
  protected exitBuildingName = 'shop';

  constructor() {
    super('ShopInterior');
  }

  /**
   * Creates shop-specific elements using the ShopElementsBuilder
   */
  protected createSceneElements(): void {
    if (!this.obstacles) {
      throw new Error(
        'Obstacles group not initialized. Cannot create shop elements before scene initialization is complete.'
      );
    }

    const shopBuilder = new ShopElementsBuilder(this, this.obstacles);
    shopBuilder.createShopElements();
  }
}
