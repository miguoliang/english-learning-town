import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

/**
 * Builder class responsible for creating shop-specific interior elements
 */
export class ShopElementsBuilder {
  private scene: Scene;
  private obstacles: Phaser.Physics.Arcade.StaticGroup;

  constructor(scene: Scene, obstacles: Phaser.Physics.Arcade.StaticGroup) {
    this.scene = scene;
    this.obstacles = obstacles;
  }

  /**
   * Creates all shop interior elements
   */
  createShopElements(): void {
    this.createCheckoutArea();
    this.createShoppingAisles();
    this.createServiceAreas();
    this.createStaffAndPromotions();
  }

  /**
   * Creates the checkout counter and cash register
   */
  private createCheckoutArea(): void {
    // Checkout counter
    this.createRoomElement(
      GameConfig.UI.centerX,
      GameConfig.screenHeight * 0.26,
      GameConfig.screenWidth * 0.17,
      GameConfig.screenHeight * 0.09,
      GameConfig.COLORS.brownWall
    );
    this.scene.add
      .text(GameConfig.UI.centerX, GameConfig.screenHeight * 0.26, '💳 CHECKOUT COUNTER 💳', {
        fontFamily: 'Arial',
        fontSize: Math.min(GameConfig.screenWidth / 50, 16),
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);

    // Cash register
    this.createRoomElement(
      GameConfig.UI.centerX,
      GameConfig.screenHeight * 0.23,
      GameConfig.screenWidth * 0.05,
      GameConfig.screenHeight * 0.06,
      0x000000
    );
    this.scene.add
      .image(GameConfig.UI.centerX, GameConfig.screenHeight * 0.23, 'item_computer')
      .setScale(0.7)
      .setOrigin(0.5);
  }

  /**
   * Creates shopping aisles with different product categories
   */
  private createShoppingAisles(): void {
    const aisleData = [
      {
        x: GameConfig.screenWidth * 0.17,
        y: GameConfig.screenHeight * 0.43,
        items: ['🍎', '🍌', '🥕', '🥬'],
        category: 'Fruits & Vegetables',
      },
      {
        x: GameConfig.screenWidth * 0.33,
        y: GameConfig.screenHeight * 0.43,
        items: ['🍞', '🥖', '🧀', '🥛'],
        category: 'Dairy & Bread',
      },
      {
        x: GameConfig.screenWidth * 0.52,
        y: GameConfig.screenHeight * 0.43,
        items: ['📱', '💻', '⌚', '🎧'],
        category: 'Electronics',
      },
      {
        x: GameConfig.screenWidth * 0.69,
        y: GameConfig.screenHeight * 0.43,
        items: ['👕', '👖', '👟', '🧢'],
        category: 'Clothing',
      },
    ];

    aisleData.forEach(aisle => {
      this.createShoppingAisle(aisle);
    });
  }

  /**
   * Creates a single shopping aisle with products
   */
  private createShoppingAisle(aisleData: {
    x: number;
    y: number;
    items: string[];
    category: string;
  }): void {
    // Shelf structure
    this.createRoomElement(
      aisleData.x,
      aisleData.y,
      GameConfig.screenWidth * 0.1,
      GameConfig.screenHeight * 0.145,
      GameConfig.COLORS.darkBrown
    );

    // Category label
    this.scene.add
      .text(aisleData.x, aisleData.y - GameConfig.screenHeight * 0.1, aisleData.category, {
        fontFamily: 'Arial',
        fontSize: Math.min(GameConfig.screenWidth / 70, 12),
        color: '#000000',
        backgroundColor: '#ffffff',
        padding: { x: 5, y: 2 },
        align: 'center',
      })
      .setOrigin(0.5);

    // Items on shelf
    this.scene.add
      .text(aisleData.x, aisleData.y, aisleData.items.join(' '), {
        fontFamily: 'Arial',
        fontSize: Math.min(GameConfig.screenWidth / 40, 20),
        align: 'center',
      })
      .setOrigin(0.5);

    // Price tags
    this.scene.add
      .text(aisleData.x, aisleData.y + GameConfig.screenHeight * 0.058, '$2-$50', {
        fontFamily: 'Arial',
        fontSize: Math.min(GameConfig.screenWidth / 70, 12),
        color: '#ff0000',
        align: 'center',
      })
      .setOrigin(0.5);
  }

  /**
   * Creates service areas like baskets and customer service
   */
  private createServiceAreas(): void {
    // Shopping baskets area
    this.createRoomElement(
      GameConfig.screenWidth * 0.125,
      GameConfig.screenHeight * 0.65,
      GameConfig.screenWidth * 0.067,
      GameConfig.screenHeight * 0.087,
      GameConfig.COLORS.brownWall
    );
    this.scene.add
      .text(GameConfig.screenWidth * 0.125, GameConfig.screenHeight * 0.65, '🛒\nBaskets', {
        fontFamily: 'Arial',
        fontSize: Math.min(GameConfig.screenWidth / 60, 14),
        align: 'center',
      })
      .setOrigin(0.5);

    // Customer service desk
    this.createRoomElement(
      GameConfig.screenWidth * 0.69,
      GameConfig.screenHeight * 0.65,
      GameConfig.screenWidth * 0.1,
      GameConfig.screenHeight * 0.116,
      GameConfig.COLORS.brownWall
    );
    this.scene.add
      .text(
        GameConfig.screenWidth * 0.69,
        GameConfig.screenHeight * 0.65,
        '🏪\nCustomer\nService',
        {
          fontFamily: 'Arial',
          fontSize: Math.min(GameConfig.screenWidth / 60, 14),
          align: 'center',
        }
      )
      .setOrigin(0.5);
  }

  /**
   * Creates staff areas and promotional displays
   */
  private createStaffAndPromotions(): void {
    // Shopkeeper/Manager
    this.scene.add
      .image(GameConfig.UI.centerX, GameConfig.screenHeight * 0.33, 'character_shopkeeper')
      .setScale(0.5)
      .setOrigin(0.5);

    this.scene.add
      .text(GameConfig.UI.centerX, GameConfig.screenHeight * 0.39, 'Mr. Brown - Manager', {
        fontFamily: 'Arial',
        fontSize: Math.min(GameConfig.screenWidth / 55, 14),
        align: 'center',
        color: GameConfig.COLORS.textDarkGreen,
      })
      .setOrigin(0.5);

    // Special offers sign
    this.scene.add
      .text(
        GameConfig.screenWidth * 0.33,
        GameConfig.screenHeight * 0.7,
        '🏷️ SPECIAL OFFERS 🏷️\nBuy 2 Get 1 Free!\nDaily Discounts Available',
        {
          fontFamily: 'Arial',
          fontSize: Math.min(GameConfig.screenWidth / 60, 14),
          color: '#ff0000',
          backgroundColor: '#ffff00',
          padding: { x: 10, y: 5 },
          align: 'center',
        }
      )
      .setOrigin(0.5);

    // Shopping carts
    this.scene.add
      .text(
        GameConfig.screenWidth * 0.583,
        GameConfig.screenHeight * 0.72,
        '🛒 🛒 🛒\nShopping Carts',
        {
          fontFamily: 'Arial',
          fontSize: Math.min(GameConfig.screenWidth / 60, 14),
          align: 'center',
        }
      )
      .setOrigin(0.5);
  }

  /**
   * Helper method to create room elements with collision
   */
  private createRoomElement(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number
  ): Phaser.GameObjects.Rectangle {
    const element = this.scene.add.rectangle(x, y, width, height, color);
    this.obstacles.add(element);
    return element;
  }
}
