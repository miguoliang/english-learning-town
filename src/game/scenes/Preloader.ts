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

    // Load UI assets
    this.load.image('logo', 'scenes/ui/logo.png');
    this.load.image('star', 'scenes/ui/star.png');
    this.load.image('background', 'scenes/ui/bg.png');

    // Load tileset images for embedded TMJ map
    this.load.image('winter', 'shared/tilesets/tileset/winter/winter.png');
    this.load.image('steps', 'shared/tilesets/tileset/extras/steps.png');

    // Load color palette for reference
    this.load.image('color_palette', 'shared/tilesets/color-palette.png');

    // Load main town map
    this.load.tilemapTiledJSON('town_map', 'scenes/town/town.tmj');

    // Load interior maps
    this.load.tilemapTiledJSON('cafe_map', 'scenes/interiors/cafe/cafe.tmj');
    this.load.tilemapTiledJSON('library_map', 'scenes/interiors/library/library.tmj');
    this.load.tilemapTiledJSON('school_map', 'scenes/interiors/school/school.tmj');
    this.load.tilemapTiledJSON('shop_map', 'scenes/interiors/shop/shop.tmj');

    // Load interior assets for each scene
    // Cafe assets
    this.load.image('cafe_wall', 'scenes/interiors/cafe/wall/wall-1.png');
    this.load.image('cafe_floor', 'scenes/interiors/cafe/floor/floor-1.png');
    this.load.image('cafe_furniture', 'scenes/interiors/cafe/props/table.png');

    // Library assets
    this.load.image('library_wall', 'scenes/interiors/library/wall/wall-2.png');
    this.load.image('library_floor', 'scenes/interiors/library/floor/floor-2.png');
    this.load.image('library_furniture', 'scenes/interiors/library/props/shelf.png');

    // School assets
    this.load.image('school_wall', 'scenes/interiors/school/wall/wall-3.png');
    this.load.image('school_floor', 'scenes/interiors/school/floor/floor-3.png');
    this.load.image('school_furniture', 'scenes/interiors/school/props/chalkboard.png');

    // Shop assets
    this.load.image('shop_wall', 'scenes/interiors/shop/wall/wall-4.png');
    this.load.image('shop_floor', 'scenes/interiors/shop/floor/floor-4.png');
    this.load.image('shop_furniture', 'scenes/interiors/shop/props/general-store-props.png');

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
