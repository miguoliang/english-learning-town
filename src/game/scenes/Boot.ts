import { Scene } from 'phaser';
import { initializeGlobalScaleRatio } from '../config/GameConfig';

export class Boot extends Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
    //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

    this.load.image('boot_background', 'assets/shared/ui/bg.png');
  }

  create() {
    // Initialize global scale ratio at game start
    // Using screen width as reference for consistent scaling across all maps
    initializeGlobalScaleRatio();
    
    this.scene.start('Preloader');
  }
}
