import { Scene } from 'phaser';
import { BaseKeyboardHandler } from './BaseKeyboardHandler';

/**
 * Base player controller that handles keyboard input for player movement
 */
export class BasePlayerController {
  protected scene: Scene;
  protected keyboardHandler: BaseKeyboardHandler;

  constructor(scene: Scene) {
    this.scene = scene;
    this.keyboardHandler = new BaseKeyboardHandler(scene);
  }

  /**
   * Destroys the controller and cleans up resources
   */
  destroy(): void {
    this.keyboardHandler.destroy();
  }
}
