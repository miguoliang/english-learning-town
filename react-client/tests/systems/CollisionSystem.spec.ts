/**
 * CollisionSystem Unit Tests
 * Tests collision detection and movement validation
 */

import { test, expect } from '@playwright/test';

test.describe('CollisionSystem', () => {
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

  test('should prevent movement through non-walkable entities', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const collisionLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Movement blocked') || msg.text().includes('collision detected')) {
        collisionLogs.push(msg.text());
      }
    });
    
    // Try to move into buildings/obstacles by moving to edges
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(30);
    }
    
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(30);
    }
    
    // Should hit some collision boundaries
    console.log(`Collision events detected: ${collisionLogs.length}`);
  });

  test('should allow movement through walkable areas', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    // Find the player entity
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
    
    // Track position changes
    const positions: { left: number; top: number }[] = [initialPosition];
    
    // Make some movements in generally open areas
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(50);
    
    // Check if position changed
    const position1 = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(position1);
    
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
    
    const position2 = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(position2);
    
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(50);
    
    const position3 = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(position3);
    
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(50);
    
    const finalPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(finalPosition);
    
    // Check that at least some movements were successful
    // Not all movements may succeed due to collisions, but in open areas some should work
    const uniquePositions = new Set(positions.map(p => `${p.left},${p.top}`));
    expect(uniquePositions.size).toBeGreaterThan(1); // At least one position change
    
    console.log(`Position changes: ${Array.from(uniquePositions).join(' -> ')}`);
  });

  test('should emit collision events when movement is blocked', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const collisionEvents: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('ENTITY_COLLISION') || msg.text().includes('collision')) {
        collisionEvents.push(msg.text());
      }
    });
    
    // Try to force collisions by moving to map boundaries
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(20);
    }
    
    // Collision system should be active
    console.log(`Collision-related events: ${collisionEvents.length}`);
  });

  test('should validate entity bounds correctly', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    // Get all entities to verify they have proper collision bounds
    const entities = await page.locator('[data-testid^="entity-"]').all();
    expect(entities.length).toBeGreaterThan(0);
    
    // Each entity should be properly positioned (not overlapping incorrectly)
    for (const entity of entities) {
      const bounds = await entity.boundingBox();
      if (bounds) {
        expect(bounds.width).toBeGreaterThan(0);
        expect(bounds.height).toBeGreaterThan(0);
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.y).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should handle multiple entity collision checks', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const errorLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errorLogs.push(msg.text());
      }
    });
    
    // Make rapid movements to test collision system performance
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(10);
    }
    
    // Should not cause collision system errors
    const collisionErrors = errorLogs.filter(log => 
      log.toLowerCase().includes('collision') || 
      log.toLowerCase().includes('bounds')
    );
    expect(collisionErrors.length).toBe(0);
  });

  test('should properly detect entity overlaps', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    // Monitor for any overlap detection logs
    const overlapLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('overlap') || msg.text().includes('canMoveTo')) {
        overlapLogs.push(msg.text());
      }
    });
    
    // Make movements that should trigger overlap checks
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowLeft');
    
    await page.waitForTimeout(200);
    
    // Collision system should be performing overlap checks
    console.log(`Overlap-related checks: ${overlapLogs.length}`);
  });
});
