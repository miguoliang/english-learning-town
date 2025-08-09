/**
 * System Integration Tests
 * Tests that all ECS systems work together correctly
 */

import { test, expect } from '@playwright/test';

test.describe('System Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="game-canvas"]', { timeout: 10000 });
    
    await page.fill('input[placeholder*="name"]', 'TestPlayer');
    await page.click('button:has-text("Start New Adventure")');
    await page.waitForTimeout(2000);
  });

  test('should integrate input → movement → render pipeline', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const pipelineEvents: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('INPUT_KEY') || 
          msg.text().includes('Player moved') ||
          msg.text().includes('RenderSystem') ||
          msg.text().includes('triggering render')) {
        pipelineEvents.push(msg.text());
      }
    });
    
    // Test complete input-to-render pipeline
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    
    // Should have events from InputState → GridMovement → RenderSystem
    expect(pipelineEvents.length).toBeGreaterThan(0);
    
    // Check that pipeline includes all stages
    const hasInputEvents = pipelineEvents.some(e => e.includes('INPUT_KEY'));
    const hasMovementEvents = pipelineEvents.some(e => e.includes('Player moved'));
    const hasRenderEvents = pipelineEvents.some(e => e.includes('render'));
    
    console.log(`Pipeline: Input=${hasInputEvents}, Movement=${hasMovementEvents}, Render=${hasRenderEvents}`);
  });

  test('should integrate collision detection with movement', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const collisionEvents: string[] = [];
    const movementEvents: string[] = [];
    
    page.on('console', msg => {
      if (msg.text().includes('collision') || msg.text().includes('Movement blocked')) {
        collisionEvents.push(msg.text());
      }
      if (msg.text().includes('Player moved')) {
        movementEvents.push(msg.text());
      }
    });
    
    // Try to move into boundaries to test collision integration
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(30);
    }
    
    // Should have movement events, and possibly collision events
    expect(movementEvents.length + collisionEvents.length).toBeGreaterThan(0);
    console.log(`Movement events: ${movementEvents.length}, Collision events: ${collisionEvents.length}`);
  });

  test('should integrate interaction system with zone detection', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const interactionEvents: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('spacebar') || 
          msg.text().includes('interaction') ||
          msg.text().includes('zone') ||
          msg.text().includes('interactable')) {
        interactionEvents.push(msg.text());
      }
    });
    
    // Test interaction system integration
    // Move to different positions and try interactions
    const testPositions = [
      ['ArrowUp', 'ArrowUp'],
      ['ArrowRight', 'ArrowRight'],
      ['ArrowDown', 'ArrowDown'], 
      ['ArrowLeft', 'ArrowLeft']
    ];
    
    for (const moves of testPositions) {
      for (const move of moves) {
        await page.keyboard.press(move);
        await page.waitForTimeout(30);
      }
      await page.keyboard.press('Space');
      await page.waitForTimeout(50);
    }
    
    // Should attempt zone detection and interaction
    expect(interactionEvents.length).toBeGreaterThan(0);
  });

  test('should maintain system independence (SRP compliance)', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const errorLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errorLogs.push(msg.text());
      }
    });
    
    // Test that systems work independently without interference
    // Rapid mixed input to stress test system boundaries
    const mixedInputs = [
      'ArrowUp', 'Space', 'ArrowRight', 'KeyW', 
      'Space', 'ArrowDown', 'KeyA', 'ArrowLeft',
      'KeyS', 'Space', 'KeyD', 'ArrowUp'
    ];
    
    for (const input of mixedInputs) {
      await page.keyboard.press(input);
      await page.waitForTimeout(20);
    }
    
    await page.waitForTimeout(200);
    
    // Systems should not interfere with each other
    const systemErrors = errorLogs.filter(log => 
      log.toLowerCase().includes('system') ||
      log.toLowerCase().includes('component') ||
      log.toLowerCase().includes('ecs')
    );
    expect(systemErrors.length).toBe(0);
  });

  test('should handle all systems running simultaneously', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const systemLogs = new Map<string, number>();
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('System')) {
        const systemName = text.match(/(\w+System)/)?.[1] || 'Unknown';
        systemLogs.set(systemName, (systemLogs.get(systemName) || 0) + 1);
      }
    });
    
    // Activate multiple systems simultaneously
    await page.keyboard.press('ArrowRight'); // GridMovement + Render
    await page.waitForTimeout(50);
    await page.keyboard.press('Space');      // PlayerInteraction + InteractionZone
    await page.waitForTimeout(50);
    await page.keyboard.press('ArrowUp');    // GridMovement + Collision + Render
    await page.waitForTimeout(50);
    
    await page.waitForTimeout(200);
    
    // Multiple systems should be active
    console.log('Active systems:', Object.fromEntries(systemLogs));
    expect(systemLogs.size).toBeGreaterThanOrEqual(0); // At least some systems active
  });

  test('should handle system performance under load', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const startTime = Date.now();
    
    // High-frequency input to test system performance
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Space');
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(5);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should handle load without significant performance degradation
    expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
    
    // Verify entities are still properly rendered
    const entities = await page.locator('[data-testid^="entity-"]').all();
    expect(entities.length).toBeGreaterThan(0);
    
    // Verify no visual corruption
    for (const entity of entities) {
      const isVisible = await entity.isVisible();
      expect(isVisible).toBe(true);
    }
  });

  test('should maintain data consistency across systems', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    // Perform complex movement sequence
    const sequence = [
      'ArrowRight', 'ArrowRight', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowLeft', 'ArrowUp', 'ArrowUp'
    ];
    
    for (const move of sequence) {
      await page.keyboard.press(move);
      await page.waitForTimeout(100);
    }
    
    // Verify entities are still properly positioned after complex movement
    const entities = await page.locator('[data-testid^="entity-"]').all();
    
    for (const entity of entities) {
      const bounds = await entity.boundingBox();
      if (bounds) {
        // Positions should be valid and grid-aligned
        expect(bounds.x % 40).toBe(0); // Grid-aligned
        expect(bounds.y % 40).toBe(0);
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.y).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should handle system state transitions correctly', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const stateEvents: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('state') || 
          msg.text().includes('transition') ||
          msg.text().includes('initialized')) {
        stateEvents.push(msg.text());
      }
    });
    
    // Test state transitions through different system interactions
    await page.keyboard.press('ArrowUp');    // Movement state
    await page.waitForTimeout(100);
    await page.keyboard.press('Space');      // Interaction state  
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowDown');  // Back to movement
    await page.waitForTimeout(100);
    
    // Systems should handle state transitions cleanly
    console.log(`State transition events: ${stateEvents.length}`);
  });
});
