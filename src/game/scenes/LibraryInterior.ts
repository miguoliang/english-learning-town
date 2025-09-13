import { BaseInteriorScene } from './BaseInteriorScene';
import { GameConfig } from '../config/GameConfig';
import { LibraryElementsBuilder } from '../builders/LibraryElementsBuilder';

/**
 * Library Interior Scene - Inside the library building
 */
export class LibraryInterior extends BaseInteriorScene {
  protected sceneBackgroundColor = GameConfig.COLORS.aliceBlue;
  protected floorColor = GameConfig.COLORS.TAN;
  protected sceneTitle = 'LIBRARY INTERIOR';
  protected sceneIcon = '📚';
  protected exitBuildingName = 'library';

  constructor() {
    super('LibraryInterior');
  }

  /**
   * Creates library-specific elements using the LibraryElementsBuilder
   */
  protected createSceneElements(): void {
    if (!this.obstacles) {
      throw new Error(
        'Obstacles group not initialized. ' +
          'Cannot create library elements before scene initialization is complete.'
      );
    }

    const libraryBuilder = new LibraryElementsBuilder(this, this.obstacles);
    libraryBuilder.createLibraryElements();
  }
}
