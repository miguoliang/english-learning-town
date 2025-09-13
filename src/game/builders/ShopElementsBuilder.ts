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
    this.createRoomElement(GameConfig.UI.centerX, 180, 200, 60, GameConfig.COLORS.brownWall);
    this.scene.add
      .text(GameConfig.UI.centerX, 180, '💳 CHECKOUT COUNTER 💳', {
        fontFamily: 'Arial',
        fontSize: 16,
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);

    // Cash register
    this.createRoomElement(GameConfig.UI.centerX, 160, 60, 40, 0x000000);
    this.scene.add
      .text(GameConfig.UI.centerX, 160, '🖥️', { fontFamily: 'Arial', fontSize: 20 })
      .setOrigin(0.5);
  }

  /**
   * Creates shopping aisles with different product categories
   */
  private createShoppingAisles(): void {
    const aisleData = [
      {
        x: 200,
        y: 300,
        items: ['🍎', '🍌', '🥕', '🥬'],
        category: 'Fruits & Vegetables',
      },
      {
        x: 400,
        y: 300,
        items: ['🍞', '🥖', '🧀', '🥛'],
        category: 'Dairy & Bread',
      },
      {
        x: 624,
        y: 300,
        items: ['📱', '💻', '⌚', '🎧'],
        category: 'Electronics',
      },
      {
        x: 824,
        y: 300,
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
    this.createRoomElement(aisleData.x, aisleData.y, 120, 100, GameConfig.COLORS.darkBrown);

    // Category label
    this.scene.add
      .text(aisleData.x, aisleData.y - 70, aisleData.category, {
        fontFamily: 'Arial',
        fontSize: 12,
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
        fontSize: 20,
        align: 'center',
      })
      .setOrigin(0.5);

    // Price tags
    this.scene.add
      .text(aisleData.x, aisleData.y + 40, '$2-$50', {
        fontFamily: 'Arial',
        fontSize: 12,
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
    this.createRoomElement(150, 450, 80, 60, GameConfig.COLORS.brownWall);
    this.scene.add
      .text(150, 450, '🛒\nBaskets', {
        fontFamily: 'Arial',
        fontSize: 14,
        align: 'center',
      })
      .setOrigin(0.5);

    // Customer service desk
    this.createRoomElement(824, 450, 120, 80, GameConfig.COLORS.brownWall);
    this.scene.add
      .text(824, 450, '🏪\nCustomer\nService', {
        fontFamily: 'Arial',
        fontSize: 14,
        align: 'center',
      })
      .setOrigin(0.5);
  }

  /**
   * Creates staff areas and promotional displays
   */
  private createStaffAndPromotions(): void {
    // Shopkeeper/Manager
    this.scene.add
      .text(GameConfig.UI.centerX, 230, '👨‍💼\nMr. Brown - Manager', {
        fontFamily: 'Arial',
        fontSize: 16,
        align: 'center',
      })
      .setOrigin(0.5);

    // Special offers sign
    this.scene.add
      .text(400, 480, '🏷️ SPECIAL OFFERS 🏷️\nBuy 2 Get 1 Free!\nDaily Discounts Available', {
        fontFamily: 'Arial',
        fontSize: 14,
        color: '#ff0000',
        backgroundColor: '#ffff00',
        padding: { x: 10, y: 5 },
        align: 'center',
      })
      .setOrigin(0.5);

    // Shopping carts
    this.scene.add
      .text(700, 500, '🛒 🛒 🛒\nShopping Carts', {
        fontFamily: 'Arial',
        fontSize: 14,
        align: 'center',
      })
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
