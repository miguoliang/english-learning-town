/**
 * RenderSystem - Manages rendering of entities with visual components
 */

import type { System, Entity, ComponentManager } from '../core';
import type { Emitter, ECSEvents } from '../events';
import type {
  PositionComponent,
  SizeComponent,
  RenderableComponent
} from '../components';
import { ECSEventTypes } from '../events';
import { gameConfig } from '../../config/gameConfig';
import { logger } from '../../utils/logger';

export class RenderSystem implements System {
  readonly name = 'RenderSystem';
  readonly requiredComponents = ['position', 'size', 'renderable'] as const;

  private renderableEntities: Array<{
    id: string;
    position: PositionComponent;
    size: SizeComponent;
    renderable: RenderableComponent;
  }> = [];
  
  private isInitialized = false;
  private components: ComponentManager | null = null;
  private eventBus: Emitter<ECSEvents> | null = null;

  update(_entities: Entity[], components: ComponentManager, _deltaTime: number, events: Emitter<ECSEvents>): void {
    // Initialize event-driven system only once
    if (!this.isInitialized) {
      this.components = components;
      this.eventBus = events;
      this.setupEventListeners(events);
      this.isInitialized = true;
      
      // Initial render
      this.triggerRender('initial-load');
    }
    
    // RenderSystem is now purely event-driven - no regular updates needed
  }

  private setupEventListeners(events: Emitter<ECSEvents>): void {
    // Use type-safe mitt emitter directly

    // Listen for events that should trigger re-rendering
    events.on(ECSEventTypes.ENTITY_MOVED, (_data) => {
      if (gameConfig.debug.showSystemLogs) {
        logger.ecs('RenderSystem: Entity moved, triggering render');
      }
      this.triggerRender('entity-moved');
    });

    events.on(ECSEventTypes.ENTITY_ADDED, (_data) => {
      if (gameConfig.debug.showSystemLogs) {
        logger.ecs('RenderSystem: Entity added, triggering render');
      }
      this.triggerRender('entity-added');
    });

    events.on(ECSEventTypes.ENTITY_REMOVED, (_data) => {
      if (gameConfig.debug.showSystemLogs) {
        logger.ecs('RenderSystem: Entity removed, triggering render');
      }
      this.triggerRender('entity-removed');
    });

    events.on(ECSEventTypes.COMPONENT_ADDED, (data) => {
      // Only re-render if it's a visual component
      if (['position', 'size', 'renderable'].includes(data.componentType)) {
        if (gameConfig.debug.showSystemLogs) {
          logger.ecs('RenderSystem: Visual component added, triggering render');
        }
        this.triggerRender('component-added');
      }
    });

    events.on(ECSEventTypes.COMPONENT_REMOVED, (data) => {
      // Only re-render if it's a visual component
      if (['position', 'size', 'renderable'].includes(data.componentType)) {
        if (gameConfig.debug.showSystemLogs) {
          logger.ecs('RenderSystem: Visual component removed, triggering render');
        }
        this.triggerRender('component-removed');
      }
    });

    events.on(ECSEventTypes.SCENE_LOADED, (_data) => {
      if (gameConfig.debug.showSystemLogs) {
        logger.ecs('RenderSystem: Scene loaded, triggering render');
      }
      this.triggerRender('scene-loaded');
    });
  }

  private triggerRender(reason: string): void {
    if (!this.components || !this.eventBus) return;

    // Collect renderable entities
    this.renderableEntities = [];
    const renderableEntityIds = this.components.getEntitiesWithComponents(this.requiredComponents);
    
    for (const entityId of renderableEntityIds) {
      const position = this.components.getComponent<PositionComponent>(entityId, 'position');
      const size = this.components.getComponent<SizeComponent>(entityId, 'size');
      const renderable = this.components.getComponent<RenderableComponent>(entityId, 'renderable');
      
      if (position && size && renderable && renderable.visible !== false) {
        this.renderableEntities.push({
          id: entityId,
          position,
          size,
          renderable
        });
      }
    }
    
    // Sort by z-index
    this.renderableEntities.sort((a, b) => (a.renderable.zIndex || 0) - (b.renderable.zIndex || 0));
    
    if (gameConfig.debug.showSystemLogs) {
      logger.ecs(`RenderSystem: Rendering ${this.renderableEntities.length} entities (reason: ${reason})`);
    }
    
    this.eventBus.emit(ECSEventTypes.RENDER_FRAME_READY, { 
      entities: this.renderableEntities,
      reason 
    });
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  getRenderableEntities() {
    return [...this.renderableEntities];
  }
}
