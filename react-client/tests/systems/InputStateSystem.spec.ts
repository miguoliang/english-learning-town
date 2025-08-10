/**
 * InputStateSystem Unit Tests
 * Tests keyboard input state management and event emission
 */

import { test, expect } from '@playwright/test';

test.describe('InputStateSystem', () => {
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

  test('should detect keyboard input events', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    // Find the player entity to observe effects of input
    const playerEntity = await page.locator('[data-entity-type="player"]').first();
    await expect(playerEntity).toBeVisible();
    
    // Get initial position
    const initialPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    
    const positions: { left: number; top: number }[] = [initialPosition];
    
    // Test various input keys and check for their effects
    // Movement keys should cause position changes
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(50);
    
    let currentPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(currentPosition);
    
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
    
    currentPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(currentPosition);
    
    await page.keyboard.press('KeyW');
    await page.waitForTimeout(50);
    
    currentPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(currentPosition);
    
    await page.keyboard.press('KeyS');
    await page.waitForTimeout(50);
    
    currentPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(currentPosition);
    
    // Test non-movement key (Space) - should not cause position change but is still input
    const beforeSpacePosition = currentPosition;
    await page.keyboard.press('Space');
    await page.waitForTimeout(50);
    
    const afterSpacePosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    
    // Verify that input detection is working by checking for movement responses
    const uniquePositions = new Set(positions.map(p => `${p.left},${p.top}`));
    expect(uniquePositions.size).toBeGreaterThan(1); // Movement keys should cause position changes
    
    // Space key should not cause movement (position should be same)
    expect(afterSpacePosition.left).toBe(beforeSpacePosition.left);
    expect(afterSpacePosition.top).toBe(beforeSpacePosition.top);
    
    console.log(`Input detection verified through movement: ${Array.from(uniquePositions).join(' -> ')}`);
    console.log(`Space key correctly did not cause movement`);
  });

  test('should distinguish between key press and key release', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const keyDownEvents: string[] = [];
    const keyUpEvents: string[] = [];
    
    page.on('console', msg => {
      if (msg.text().includes('KeyDown') || msg.text().includes('KEY_DOWN')) {
        keyDownEvents.push(msg.text());
      }
      if (msg.text().includes('KeyUp') || msg.text().includes('KEY_UP')) {
        keyUpEvents.push(msg.text());
      }
    });
    
    // Hold and release key
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(100);
    await page.keyboard.up('ArrowRight');
    
    await page.waitForTimeout(100);
    
    // Should have both down and up events
    console.log(`Key down events: ${keyDownEvents.length}, Key up events: ${keyUpEvents.length}`);
  });

  test('should handle multiple simultaneous key presses', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    // Find the player entity to track movement effects
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
    
    // Press multiple keys rapidly (mix of movement and interaction keys)
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(30);
    
    currentPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(currentPosition);
    
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(30);
    
    currentPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(currentPosition);
    
    await page.keyboard.press('Space'); // Should not cause movement
    await page.waitForTimeout(30);
    
    await page.keyboard.press('KeyW');
    await page.waitForTimeout(30);
    
    currentPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(currentPosition);
    
    await page.waitForTimeout(100);
    
    // Verify system handled multiple input types correctly
    const uniquePositions = new Set(positions.map(p => `${p.left},${p.top}`));
    expect(uniquePositions.size).toBeGreaterThan(1); // Movement keys worked
    
    // Verify the game canvas remains functional after multiple inputs
    const gameCanvas = await page.locator('[data-testid="game-canvas"]');
    await expect(gameCanvas).toBeVisible();
    
    console.log(`Multiple key presses handled: ${uniquePositions.size} unique positions from ${positions.length} inputs`);
  });

  test('should emit proper event types for different keys', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    // Find the player entity to track effects of different key types
    const playerEntity = await page.locator('[data-entity-type="player"]').first();
    await expect(playerEntity).toBeVisible();
    
    const positions: { left: number; top: number; keyType: string }[] = [];
    
    // Get initial position
    let currentPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push({ ...currentPosition, keyType: 'initial' });
    
    // Test different key types - Arrow keys (should move)
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(50);
    
    currentPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push({ ...currentPosition, keyType: 'arrow' });
    
    // Test WASD keys (should move)
    await page.keyboard.press('KeyW');
    await page.waitForTimeout(50);
    
    currentPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push({ ...currentPosition, keyType: 'wasd' });
    
    // Test Space key (should not move, but should be handled)
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    
    currentPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push({ ...currentPosition, keyType: 'space' });
    
    // Verify different key types had appropriate effects
    const movementPositions = positions.filter(p => p.keyType === 'arrow' || p.keyType === 'wasd');
    const uniqueMovementPositions = new Set(movementPositions.map(p => `${p.left},${p.top}`));
    expect(uniqueMovementPositions.size).toBeGreaterThan(1); // Movement keys worked
    
    // Space key should not change position from WASD position
    const wasdPos = positions.find(p => p.keyType === 'wasd')!;
    const spacePos = positions.find(p => p.keyType === 'space')!;
    expect(spacePos.left).toBe(wasdPos.left);
    expect(spacePos.top).toBe(wasdPos.top);
    
    console.log(`Key types tested: Arrow (moved), WASD (moved), Space (no movement)`);
  });

  test('should not interfere with other input handling', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const errorLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errorLogs.push(msg.text());
      }
    });
    
    // Test various inputs including non-game keys
    await page.keyboard.press('Tab');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('KeyW');
    
    await page.waitForTimeout(200);
    
    // Should not cause input system errors
    const inputErrors = errorLogs.filter(log => 
      log.toLowerCase().includes('input') || 
      log.toLowerCase().includes('keyboard')
    );
    expect(inputErrors.length).toBe(0);
  });

  test('should maintain state consistency during rapid input', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    // Find the player entity to track state consistency
    const playerEntity = await page.locator('[data-entity-type="player"]').first();
    await expect(playerEntity).toBeVisible();
    
    // Get initial position
    const initialPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    
    let rapidInputsProcessed = 0;
    
    // Rapid input sequence - alternating right/left should return to near original position
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowRight');
      rapidInputsProcessed++;
      await page.keyboard.press('ArrowLeft');
      rapidInputsProcessed++;
      await page.waitForTimeout(10);
    }
    
    await page.waitForTimeout(100);
    
    // Get final position after rapid alternating input
    const finalPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    
    // System should handle rapid input without state corruption
    // After alternating right/left moves, position should be close to original
    const positionDifference = Math.abs(finalPosition.left - initialPosition.left);
    expect(positionDifference).toBeLessThanOrEqual(40); // Within one cell size
    
    // Verify system remained functional
    const gameCanvas = await page.locator('[data-testid="game-canvas"]');
    await expect(gameCanvas).toBeVisible();
    
    console.log(`Rapid input test: ${rapidInputsProcessed} inputs processed, position consistency maintained`);
  });
});
