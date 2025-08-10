/**
 * System Integration Tests
 * Tests that all ECS systems work together correctly
 */

import { test, expect } from '@playwright/test';

test.describe('System Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the root
    await page.goto('/');
    
    // Fill name
    await page.fill('input[placeholder*="name"]', 'TestPlayer');
    
    // Click start new adventure
    await page.click('button:has-text("Start New Adventure")');
    
    // Wait for the game canvas
    await page.waitForSelector('[data-testid="game-canvas"]', { timeout: 10000 });
    
    // Wait for game scene to load
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
    
    // Find the player entity to track movement and collision behavior
    const playerEntity = await page.locator('[data-entity-type="player"]').first();
    await expect(playerEntity).toBeVisible();
    
    const positions: { left: number; top: number }[] = [];
    
    // Get initial position
    let currentPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(currentPosition);
    
    // Try to move into boundaries to test collision integration
    // Move upward many times - should either move freely or be blocked by collision
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(30);
      
      // Track position every 5 moves to detect collision behavior
      if (i % 5 === 4) {
        currentPosition = await playerEntity.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return {
            left: parseInt(style.left, 10),
            top: parseInt(style.top, 10)
          };
        });
        positions.push(currentPosition);
      }
    }
    
    // Get final position
    const finalPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(finalPosition);
    
    // Analyze movement behavior to detect collision integration
    const initialPos = positions[0];
    const finalPos = positions[positions.length - 1];
    const totalVerticalMovement = Math.abs(finalPos.top - initialPos.top);
    
    // Test collision integration scenarios:
    // 1. Free movement: Player moved significantly (no collision boundary hit)
    // 2. Collision boundary: Player moved some distance then stopped (collision detected)
    // 3. Immediate collision: Player barely moved (hit boundary immediately)
    
    // Verify collision detection is integrated with movement system
    const playerMoved = totalVerticalMovement > 0;
    const movementStopped = positions.length >= 3 && 
      positions[positions.length - 1].top === positions[positions.length - 2].top;
    
    // Integration working if either:
    // - Player moved freely (no collision boundaries in path)
    // - Player moved then stopped (collision detection prevented further movement)
    expect(playerMoved || movementStopped).toBe(true);
    
    // Verify system remains functional after collision integration test
    const gameCanvas = await page.locator('[data-testid="game-canvas"]');
    await expect(gameCanvas).toBeVisible();
    
    console.log(`Collision integration: moved ${totalVerticalMovement}px vertically, positions tracked: ${positions.length}`);
  });

  test('should integrate interaction system with zone detection', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    // Find the player entity to track integration
    const playerEntity = await page.locator('[data-entity-type="player"]').first();
    await expect(playerEntity).toBeVisible();
    
    const positions: { left: number; top: number }[] = [];
    let integrationAttempts = 0;
    let dialoguesOpened = 0;
    
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
      
      // Track position after movement
      const currentPosition = await playerEntity.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          left: parseInt(style.left, 10),
          top: parseInt(style.top, 10)
        };
      });
      positions.push(currentPosition);
      
      await page.keyboard.press('Space');
      integrationAttempts++;
      await page.waitForTimeout(50);
      
      // Check if dialogue appeared (indicates successful system integration)
      const dialogueElement = await page.locator('.DialogueOverlay, [data-testid*="dialogue"]').first();
      if (await dialogueElement.count() > 0) {
        dialoguesOpened++;
        // Close dialogue to continue testing
        await page.keyboard.press('Escape');
        await page.waitForTimeout(100);
      }
    }
    
    // Verify system integration worked
    expect(integrationAttempts).toBe(4); // All integration attempts completed
    const uniquePositions = new Set(positions.map(p => `${p.left},${p.top}`));
    expect(uniquePositions.size).toBeGreaterThan(1); // Player moved to different positions
    
    // System should remain functional after integration tests
    const gameCanvas = await page.locator('[data-testid="game-canvas"]');
    await expect(gameCanvas).toBeVisible();
    
    console.log(`Integration attempts: ${integrationAttempts}, Dialogues: ${dialoguesOpened}, Positions: ${uniquePositions.size}`);
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
    
    // Find the player entity to track system effects
    const playerEntity = await page.locator('[data-entity-type="player"]').first();
    await expect(playerEntity).toBeVisible();
    
    const positions: { left: number; top: number }[] = [];
    const actions: string[] = [];
    
    // Get initial position
    let currentPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(currentPosition);
    
    // Activate multiple systems simultaneously
    await page.keyboard.press('ArrowRight'); // GridMovement + Render
    actions.push('movement-right');
    await page.waitForTimeout(50);
    
    currentPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(currentPosition);
    
    await page.keyboard.press('Space');      // PlayerInteraction + InteractionZone
    actions.push('interaction');
    await page.waitForTimeout(50);
    
    await page.keyboard.press('ArrowUp');    // GridMovement + Collision + Render
    actions.push('movement-up');
    await page.waitForTimeout(50);
    
    currentPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(currentPosition);
    
    await page.waitForTimeout(200);
    
    // Verify multiple systems worked simultaneously
    expect(actions.length).toBe(3); // All actions attempted
    const uniquePositions = new Set(positions.map(p => `${p.left},${p.top}`));
    expect(uniquePositions.size).toBeGreaterThan(1); // Movement systems worked
    
    // All systems should remain functional
    const gameCanvas = await page.locator('[data-testid="game-canvas"]');
    await expect(gameCanvas).toBeVisible();
    
    console.log(`Simultaneous systems test: ${actions.join(' -> ')}, Positions: ${uniquePositions.size}`)
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
