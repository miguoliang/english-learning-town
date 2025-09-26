import { Scene } from 'phaser';
import { initializeAllSprites } from '../utils/SpriteGenerator';

export class Preloader extends Scene {
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
    this.load.image('spring', 'shared/tilesets/spring/spring.png');
    this.load.image('dirt', 'shared/tilesets/dirt/dirt.png');
    this.load.image('grass_props', 'shared/tilesets/props/grass.png');
    this.load.image('tree_props', 'shared/tilesets/props/tree.png');
    this.load.image('flower_props', 'shared/tilesets/props/flower.png');
    this.load.image('pavement_props', 'shared/tilesets/props/pavement.png');
    this.load.image('house', 'shared/tilesets/house/house.png');
    this.load.image('water_tiles', 'shared/tilesets/water/water-fall-deep-1.png');
    this.load.image('bridge_props', 'shared/tilesets/props/bridge/bridge-wood.png');

    // Load color palette for reference
    this.load.image('color_palette', 'shared/tilesets/color-palette.png');

    // Load main town map
    this.load.tilemapTiledJSON('town_map', 'scenes/town.tmj');

    // Load interior maps
    this.load.tilemapTiledJSON('cafe_map', 'scenes/cafe.tmj');
    this.load.tilemapTiledJSON('library_map', 'scenes/library.tmj');
    this.load.tilemapTiledJSON('school_map', 'scenes/school.tmj');
    this.load.tilemapTiledJSON('shop_map', 'scenes/shop.tmj');

    // Load interior assets for each scene
    // Cafe assets
    this.load.image('cafe_wall', 'shared/interiors-wall/wall-1.png');
    this.load.image('cafe_floor', 'shared/interiors-floor/floor-1.png');
    this.load.image('cafe_furniture', 'shared/interiors-props/table.png');

    // Library assets
    this.load.image('library_wall', 'shared/interiors-wall/wall-2.png');
    this.load.image('library_floor', 'shared/interiors-floor/floor-2.png');
    this.load.image('library_furniture', 'shared/interiors-props/shelf.png');

    // School assets
    this.load.image('school_wall', 'shared/interiors-wall/wall-3.png');
    this.load.image('school_floor', 'shared/interiors-floor/floor-3.png');
    this.load.image('school_furniture', 'shared/interiors-props/chalkboard.png');

    // Shop assets
    this.load.image('shop_wall', 'shared/interiors-wall/wall-4.png');
    this.load.image('shop_floor', 'shared/interiors-floor/floor-4.png');
    this.load.image('shop_furniture', 'shared/interiors-props/general-store-props.png');

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
