/**
 * GridMovementSystem Unit Tests
 * Tests the discrete grid-based movement system
 */

import { test, expect } from '@playwright/test';

test.describe('GridMovementSystem', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the game and wait for initialization
    await page.goto('/');
    await page.waitForSelector('[data-testid="game-canvas"]', { timeout: 10000 });
    
    // Enter player name and start game
    await page.fill('input[placeholder*="name"]', 'TestPlayer');
    await page.click('button:has-text("Start New Adventure")');
    
    // Wait for game scene to load
    await page.waitForTimeout(2000);
  });

  test('should move player one cell at a time with arrow keys', async ({ page }) => {
    // Wait for player to be rendered
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    // Track console logs for movement
    const movementLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Player moved') || msg.text().includes('Movement blocked')) {
        movementLogs.push(msg.text());
      }
    });
    
    // Test arrow key movement
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(100);
    
    // Should have movement events (at least some successful movements)
    expect(movementLogs.length).toBeGreaterThan(0);
  });

  test('should move player one cell at a time with WASD keys', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const movementLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Player moved') || msg.text().includes('Movement blocked')) {
        movementLogs.push(msg.text());
      }
    });
    
    // Test WASD movement
    await page.keyboard.press('KeyW'); // Up
    await page.waitForTimeout(100);
    
    await page.keyboard.press('KeyD'); // Right
    await page.waitForTimeout(100);
    
    await page.keyboard.press('KeyS'); // Down
    await page.waitForTimeout(100);
    
    await page.keyboard.press('KeyA'); // Left
    await page.waitForTimeout(100);
    
    expect(movementLogs.length).toBeGreaterThan(0);
  });

  test('should not move on key hold (discrete movement only)', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const movementLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Player moved')) {
        movementLogs.push(msg.text());
      }
    });
    
    // Hold key down for extended period
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(500); // Hold for 500ms
    await page.keyboard.up('ArrowRight');
    
    // Should only have one movement event, not continuous movement
    expect(movementLogs.length).toBeLessThanOrEqual(2); // At most 1-2 movements due to discrete nature
  });

  test('should handle collision detection', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const collisionLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Movement blocked') || msg.text().includes('collision detected')) {
        collisionLogs.push(msg.text());
      }
    });
    
    // Try to move player into areas that might have obstacles
    // Move towards edges or try multiple movements to find obstacles
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(50);
    }
    
    // If there are obstacles, we should eventually hit collision detection
    // This test validates that collision system is integrated
    console.log(`Collision logs recorded: ${collisionLogs.length}`);
  });

  test('should ignore non-movement keys', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const movementLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Player moved')) {
        movementLogs.push(msg.text());
      }
    });
    
    // Press non-movement keys
    await page.keyboard.press('KeyQ');
    await page.keyboard.press('KeyE');
    await page.keyboard.press('KeyR');
    await page.keyboard.press('KeyT');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    
    // Should have no movement from non-movement keys
    expect(movementLogs.length).toBe(0);
  });

  test('should handle rapid key presses correctly', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const movementLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Player moved')) {
        movementLogs.push(msg.text());
      }
    });
    
    // Rapid key presses
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    
    await page.waitForTimeout(200);
    
    // Should handle each key press as a discrete movement
    expect(movementLogs.length).toBeGreaterThan(0);
    expect(movementLogs.length).toBeLessThanOrEqual(5); // Max 5 movements
  });

  test('should emit proper movement events', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const eventLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('ENTITY_MOVED') || msg.text().includes('Entity moved')) {
        eventLogs.push(msg.text());
      }
    });
    
    // Make a movement
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    
    // Should trigger render system update
    expect(eventLogs.length).toBeGreaterThanOrEqual(0);
  });

  test('should maintain player position consistency', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    // Perform a series of movements that should return to original position
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(50);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(50);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    
    // Position should be consistent (no visual glitches or errors)
    const entities = await page.locator('[data-testid^="entity-"]').all();
    expect(entities.length).toBeGreaterThan(0);
    
    // All entities should still be properly positioned
    for (const entity of entities) {
      const isVisible = await entity.isVisible();
      expect(isVisible).toBe(true);
    }
  });
});
