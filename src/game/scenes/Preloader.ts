import { Scene } from 'phaser';
import { initializeAllSprites } from '../utils/SpriteGenerator';
import { CharacterManager } from '../managers/CharacterManager';

export class Preloader extends Scene {
  private characterManager: CharacterManager | null = null;

  constructor() {
    super('Preloader');
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

    // Generate character and item sprites programmatically
    initializeAllSprites(this);
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    // Create animations from the loaded atlas
    this.createCharacterAnimations();

    // Initialize CharacterManager
    this.characterManager = new CharacterManager(this);

    // Make CharacterManager globally available
    (this.game as any).characterManager = this.characterManager;

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start('MainMenu');
  }

  /**
   * Creates character animations from the loaded atlas
   */
  private createCharacterAnimations(): void {
    // Create idle animations for different directions using atlas frames
    // Right-facing idle animation (frames 0-3)
    this.anims.create({
      key: 'character_idle_right',
      frames: this.anims.generateFrameNames('character_idle', {
        start: 0,
        end: 3,
      }),
      frameRate: 5, // 200ms per frame
      repeat: -1, // Loop infinitely
    });

    // Down-facing idle animation (frames 4-7) - using "bottom" from TSJ
    this.anims.create({
      key: 'character_idle_down',
      frames: this.anims.generateFrameNames('character_idle', {
        start: 4,
        end: 7,
      }),
      frameRate: 5, // 200ms per frame as specified in TSJ
      repeat: -1,
    });

    // Up-facing idle animation (frames 8-11) - using "top" from TSJ
    this.anims.create({
      key: 'character_idle_up',
      frames: this.anims.generateFrameNames('character_idle', {
        start: 8,
        end: 11,
      }),
      frameRate: 5, // 200ms per frame as specified in TSJ
      repeat: -1,
    });

    // Create walk animations for different directions using walk atlas frames
    // Right-facing walk animation (frames 0-7)
    this.anims.create({
      key: 'character_walk_right',
      frames: this.anims.generateFrameNames('character_walk', {
        start: 0,
        end: 7,
      }),
      frameRate: 6.67, // 150ms per frame as specified in TSJ (1000/150 ≈ 6.67)
      repeat: -1,
    });

    // Down-facing walk animation (frames 8-15) - using "bottom" from TSJ
    this.anims.create({
      key: 'character_walk_down',
      frames: this.anims.generateFrameNames('character_walk', {
        start: 8,
        end: 15,
      }),
      frameRate: 6.67, // 150ms per frame as specified in TSJ (1000/150 ≈ 6.67)
      repeat: -1,
    });

    // Up-facing walk animation (frames 16-23) - using "top" from TSJ
    this.anims.create({
      key: 'character_walk_up',
      frames: this.anims.generateFrameNames('character_walk', {
        start: 16,
        end: 23,
      }),
      frameRate: 6.67, // 150ms per frame as specified in TSJ (1000/150 ≈ 6.67)
      repeat: -1,
    });

    // Create run animations for different directions using run atlas frames
    // Right-facing run animation (frames 0-7)
    this.anims.create({
      key: 'character_run_right',
      frames: this.anims.generateFrameNames('character_run', {
        start: 0,
        end: 7,
      }),
      frameRate: 10, // 100ms per frame as specified in TSJ (1000/100 = 10)
      repeat: -1,
    });

    // Down-facing run animation (frames 8-15) - using "bottom" from TSJ
    this.anims.create({
      key: 'character_run_down',
      frames: this.anims.generateFrameNames('character_run', {
        start: 8,
        end: 15,
      }),
      frameRate: 10, // 100ms per frame as specified in TSJ (1000/100 = 10)
      repeat: -1,
    });

    // Up-facing run animation (frames 16-23) - using "top" from TSJ
    this.anims.create({
      key: 'character_run_up',
      frames: this.anims.generateFrameNames('character_run', {
        start: 16,
        end: 23,
      }),
      frameRate: 10, // 100ms per frame as specified in TSJ (1000/100 = 10)
      repeat: -1,
    });
  }
}
