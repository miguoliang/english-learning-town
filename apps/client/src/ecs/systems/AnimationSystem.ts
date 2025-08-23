/**
 * AnimationSystem - Handles entity animation frame updates
 */

import type {
  System,
  Entity,
  ComponentManager,
  Emitter,
  ECSEvents,
  AnimationComponent,
  RenderableComponent,
} from "@elt/core";

export class AnimationSystem implements System {
  readonly name = "AnimationSystem";
  readonly requiredComponents = ["renderable", "animation"] as const;

  update(
    _entities: Entity[],
    components: ComponentManager,
    _deltaTime: number,
    events: Emitter<ECSEvents>,
  ): void {
    const animatedEntities = components.getEntitiesWithComponents(
      this.requiredComponents,
    );

    for (const entityId of animatedEntities) {
      const animation = components.getComponent<AnimationComponent>(
        entityId,
        "animation",
      );
      const renderable = components.getComponent<RenderableComponent>(
        entityId,
        "renderable",
      );

      if (!animation || !renderable || !animation.isPlaying) continue;

      const currentAnimData = animation.animations[animation.currentAnimation];
      if (!currentAnimData) continue;

      // Update animation frame
      const now = Date.now();
      const frameTime =
        currentAnimData.duration / currentAnimData.frames.length;

      if (now - animation.lastFrameTime >= frameTime) {
        animation.currentFrame =
          (animation.currentFrame + 1) % currentAnimData.frames.length;
        animation.lastFrameTime = now;

        // Update renderable icon
        if (renderable.renderType === "emoji") {
          renderable.icon = currentAnimData.frames[animation.currentFrame];
        }

        // Check if animation completed
        if (
          !currentAnimData.loop &&
          animation.currentFrame === currentAnimData.frames.length - 1
        ) {
          animation.isPlaying = false;
          events.emit("animation:completed", {
            entityId,
            animationName: animation.currentAnimation,
          });
        }
      }
    }
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }
}
