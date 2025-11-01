import { Scene } from 'phaser';

/**
 * Manages character animation creation
 */
export class AnimationManager {
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Creates all character animations from loaded atlases
   */
  createCharacterAnimations(): void {
    // Create idle animations for different directions using atlas frames
    // Right-facing idle animation (frames 0-3)
    this.scene.anims.create({
      key: 'character_idle_right',
      frames: this.scene.anims.generateFrameNames('character_idle', {
        start: 0,
        end: 3,
      }),
      frameRate: 5, // 200ms per frame
      repeat: -1, // Loop infinitely
    });

    // Down-facing idle animation (frames 4-7) - using "bottom" from TSJ
    this.scene.anims.create({
      key: 'character_idle_down',
      frames: this.scene.anims.generateFrameNames('character_idle', {
        start: 4,
        end: 7,
      }),
      frameRate: 5, // 200ms per frame as specified in TSJ
      repeat: -1,
    });

    // Up-facing idle animation (frames 8-11) - using "top" from TSJ
    this.scene.anims.create({
      key: 'character_idle_up',
      frames: this.scene.anims.generateFrameNames('character_idle', {
        start: 8,
        end: 11,
      }),
      frameRate: 5, // 200ms per frame as specified in TSJ
      repeat: -1,
    });

    // Create walk animations for different directions using walk atlas frames
    // Right-facing walk animation (frames 0-7)
    this.scene.anims.create({
      key: 'character_walk_right',
      frames: this.scene.anims.generateFrameNames('character_walk', {
        start: 0,
        end: 7,
      }),
      frameRate: 6.67, // 150ms per frame as specified in TSJ (1000/150 ≈ 6.67)
      repeat: -1,
    });

    // Down-facing walk animation (frames 8-15) - using "bottom" from TSJ
    this.scene.anims.create({
      key: 'character_walk_down',
      frames: this.scene.anims.generateFrameNames('character_walk', {
        start: 8,
        end: 15,
      }),
      frameRate: 6.67, // 150ms per frame as specified in TSJ (1000/150 ≈ 6.67)
      repeat: -1,
    });

    // Up-facing walk animation (frames 16-23) - using "top" from TSJ
    this.scene.anims.create({
      key: 'character_walk_up',
      frames: this.scene.anims.generateFrameNames('character_walk', {
        start: 16,
        end: 23,
      }),
      frameRate: 6.67, // 150ms per frame as specified in TSJ (1000/150 ≈ 6.67)
      repeat: -1,
    });

    // Create run animations for different directions using run atlas frames
    // Right-facing run animation (frames 0-7)
    this.scene.anims.create({
      key: 'character_run_right',
      frames: this.scene.anims.generateFrameNames('character_run', {
        start: 0,
        end: 7,
      }),
      frameRate: 10, // 100ms per frame as specified in TSJ (1000/100 = 10)
      repeat: -1,
    });

    // Down-facing run animation (frames 8-15) - using "bottom" from TSJ
    this.scene.anims.create({
      key: 'character_run_down',
      frames: this.scene.anims.generateFrameNames('character_run', {
        start: 8,
        end: 15,
      }),
      frameRate: 10, // 100ms per frame as specified in TSJ (1000/100 = 10)
      repeat: -1,
    });

    // Up-facing run animation (frames 16-23) - using "top" from TSJ
    this.scene.anims.create({
      key: 'character_run_up',
      frames: this.scene.anims.generateFrameNames('character_run', {
        start: 16,
        end: 23,
      }),
      frameRate: 10, // 100ms per frame as specified in TSJ (1000/100 = 10)
      repeat: -1,
    });
  }
}

