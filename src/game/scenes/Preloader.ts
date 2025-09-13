import { Scene } from 'phaser';
import { initializeAllSprites } from '../utils/SpriteGenerator';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  init() {
    //  We loaded this image in our Boot Scene, so we can display it here
    this.add.image(512, 384, 'background');

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

    this.load.image('logo', 'logo.png');
    this.load.image('star', 'star.png');

    // Load environment props as spritesheets
    this.load.spritesheet('trees', 'Props/Tree.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('bushes', 'Props/Bush.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('flowers', 'Props/Flower.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('grass_props', 'Props/Grass.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('stones', 'Props/Stone and Rock.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.image('bridge_wood', 'Props/Bridge - wood.png');
    this.load.spritesheet('other_props', 'Props/Other.png', { frameWidth: 32, frameHeight: 32 });

    // Load animated props as spritesheets
    this.load.spritesheet('rocks_animated', 'Props/animated/rock 1.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('small_stones_1', 'Props/animated/small stone 1.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet('small_stones_2', 'Props/animated/small stone 2.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet('stones_animated', 'Props/animated/stone 1.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet('water_lilies_1', 'Props/animated/water lily 1.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('water_lilies_2', 'Props/animated/water lily 2.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('water_plants_1', 'Props/animated/water plant 1.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('water_plants_2', 'Props/animated/water plant 2.png', {
      frameWidth: 32,
      frameHeight: 32,
    });

    // Load tilesets
    this.load.image('dirt', 'Tileset/dirt.png');
    this.load.image('dirt_wall', 'Tileset/dirt wall.png');
    this.load.image('sand', 'Tileset/sand.png');

    // Load color palette for reference
    this.load.image('color_palette', 'color palette.png');

    // Generate character and item sprites programmatically
    initializeAllSprites(this);
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start('MainMenu');
  }
}
