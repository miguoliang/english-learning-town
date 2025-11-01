import { Scene } from 'phaser';
import { initializeAllSprites } from '../utils/SpriteGenerator';
import { CharacterManager } from '../managers/CharacterManager';
import { AnimationManager } from '../managers/AnimationManager';

export class Preloader extends Scene {
  private characterManager: CharacterManager | null = null;
  private animationManager: AnimationManager;

  constructor() {
    super('Preloader');
    this.animationManager = new AnimationManager(this);
  }

  init() {
    //  We loaded this image in our Boot Scene, so we can display it here
    this.add.image(512, 384, 'boot_background');

    //  A simple progress bar. This is the outline of the bar.
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on('progress', (progress: number) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    //  Load the assets for the game
    this.load.setPath('assets');

    // Load UI assets
    this.load.image('logo', 'shared/ui/logo.png');
    this.load.image('star', 'shared/ui/star.png');
    this.load.image('background', 'shared/ui/bg.png');

    // Load tileset images for embedded TMJ map
    this.load.image('house', 'shared/tilesets/house/house.png');
    this.load.image('dirt1', 'shared/tilesets/dirt/dirt1.png');
    this.load.image('props-all', 'shared/tilesets/props-all.png');

    // Load tileset images for home interior scene
    this.load.image('floor-all', 'shared/tilesets/floor-all.png');
    this.load.image('interior-props-all', 'shared/tilesets/interior-props-all.png');

    // Load character atlases using JSON atlas
    this.load.atlas(
      'character_idle',
      'shared/characters/basic/idle.png',
      'shared/characters/basic/idle.json'
    );

    this.load.atlas(
      'character_walk',
      'shared/characters/basic/walk.png',
      'shared/characters/basic/walk.json'
    );

    this.load.atlas(
      'character_run',
      'shared/characters/basic/run.png',
      'shared/characters/basic/run.json'
    );

    // Load main town map
    this.load.tilemapTiledJSON('town_map', 'scenes/town.tmj');

    // Load home interior map
    this.load.tilemapTiledJSON('home_map', 'scenes/home.tmj');

    // Generate character and item sprites programmatically
    initializeAllSprites(this);
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    // Create animations from the loaded atlas using AnimationManager
    this.animationManager.createCharacterAnimations();

    // Initialize CharacterManager
    this.characterManager = new CharacterManager(this);

    // Make CharacterManager globally available
    (this.game as any).characterManager = this.characterManager;

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start('MainMenu');
  }
}
