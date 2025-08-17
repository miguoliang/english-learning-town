/**
 * InputStateSystem - Manages keyboard input states and emits input events
 */

import type { 
  System, 
  Entity, 
  ComponentManager,
  Emitter,
  ECSEvents
} from '@elt/core';
import { ECSEventTypes } from '@elt/core';

export class InputStateSystem implements System {
  readonly name = 'InputStateSystem';
  readonly requiredComponents = [] as const; // No specific components required

  private inputState = new Map<string, boolean>();
  private lastKeyState = new Map<string, boolean>();
  private isInitialized = false;

  update(_entities: Entity[], _components: ComponentManager, _deltaTime: number, events: Emitter<ECSEvents>): void {
    // Initialize event listeners once
    if (!this.isInitialized) {
      this.setupEventListeners(events);
      this.isInitialized = true;
    }
    
    // Update last key state for next frame
    this.lastKeyState.clear();
    this.inputState.forEach((pressed, key) => {
      this.lastKeyState.set(key, pressed);
    });
  }

  canProcess(_entity: Entity, _components: ComponentManager): boolean {
    return true; // This system doesn't process specific entities
  }

  // Event listener setup
  private setupEventListeners(events: Emitter<ECSEvents>): void {
    events.on(ECSEventTypes.INPUT_KEY_PRESSED, (data) => {
      this.setKeyPressed(data.key, true, events);
    });

    events.on(ECSEventTypes.INPUT_KEY_RELEASED, (data) => {
      this.setKeyPressed(data.key, false, events);
    });
  }

  // Public methods for input handling
  setKeyPressed(key: string, pressed: boolean, events?: Emitter<ECSEvents>): void {
    const wasPressed = this.inputState.get(key) === true;
    this.inputState.set(key, pressed);
    
    // Emit state change events for other systems to listen to
    if (events && pressed && !wasPressed) {
      events.emit(ECSEventTypes.INPUT_KEY_DOWN, { key });
    } else if (events && !pressed && wasPressed) {
      events.emit(ECSEventTypes.INPUT_KEY_UP, { key });
    }
  }

  // Utility methods for other systems
  isKeyPressed(key: string): boolean {
    return this.inputState.get(key) === true;
  }

  isNewKeyPress(key: string): boolean {
    return this.inputState.get(key) === true && this.lastKeyState.get(key) !== true;
  }

  getInputState(): ReadonlyMap<string, boolean> {
    return this.inputState;
  }
}
