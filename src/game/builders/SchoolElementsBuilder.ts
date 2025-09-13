import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

/**
 * Builder class responsible for creating school-specific interior elements
 */
export class SchoolElementsBuilder {
  private scene: Scene;
  private obstacles: Phaser.Physics.Arcade.StaticGroup;

  constructor(scene: Scene, obstacles: Phaser.Physics.Arcade.StaticGroup) {
    this.scene = scene;
    this.obstacles = obstacles;
  }

  /**
   * Creates all school classroom elements
   */
  createSchoolElements(): void {
    this.createBlackboard();
    this.createStudentDesks();
    this.createTeacherDesk();
  }

  /**
   * Creates the classroom blackboard
   */
  private createBlackboard(): void {
    this.createRoomElement(GameConfig.UI.centerX, 200, 300, 100, 0x2f4f2f);

    this.scene.add
      .text(
        GameConfig.UI.centerX,
        200,
        'Welcome to English Class!\n🅰️ Grammar Lessons 🅱️ Reading',
        {
          fontFamily: 'Arial',
          fontSize: 18,
          color: '#ffffff',
          align: 'center',
        }
      )
      .setOrigin(0.5);
  }

  /**
   * Creates rows of student desks and chairs
   */
  private createStudentDesks(): void {
    const deskConfig = {
      rows: 3,
      columns: 4,
      startX: 200,
      startY: 320,
      spacingX: 150,
      spacingY: 80,
      deskSize: { width: 60, height: 40 },
      chairSize: { width: 40, height: 20 },
      chairOffset: 30,
    };

    for (let row = 0; row < deskConfig.rows; row++) {
      for (let col = 0; col < deskConfig.columns; col++) {
        const x = deskConfig.startX + col * deskConfig.spacingX;
        const y = deskConfig.startY + row * deskConfig.spacingY;

        // Create desk
        this.createRoomElement(
          x,
          y,
          deskConfig.deskSize.width,
          deskConfig.deskSize.height,
          GameConfig.COLORS.brownWall
        );

        // Create chair
        this.createRoomElement(
          x,
          y + deskConfig.chairOffset,
          deskConfig.chairSize.width,
          deskConfig.chairSize.height,
          GameConfig.COLORS.darkBrown
        );
      }
    }
  }

  /**
   * Creates the teacher's desk with teacher icon
   */
  private createTeacherDesk(): void {
    this.createRoomElement(GameConfig.UI.centerX, 280, 100, 60, GameConfig.COLORS.brownWall);

    this.scene.add
      .text(GameConfig.UI.centerX, 280, '👩‍🏫', {
        fontFamily: 'Arial',
        fontSize: 24,
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
