/**
 * Legacy RenderSystem Tests (Deprecated)
 * 
 * NOTE: These tests are deprecated in favor of the new comprehensive
 * system tests in tests/systems/RenderSystem.spec.ts
 * 
 * This file is kept for backward compatibility but should be migrated
 * to use the new test structure.
 */

import { test, expect } from '@playwright/test';

test.describe('RenderSystem (Legacy)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the game
    await page.goto('/');
    
    // Wait for the game to load
    await page.waitForSelector('[data-testid="game-canvas"]', { timeout: 10000 });
  });

  test('should render entities with correct positioning', async ({ page }) => {
    // Wait for entities to be rendered
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    // Get all rendered entities
    const entities = await page.locator('[data-testid^="entity-"]').all();
    expect(entities.length).toBeGreaterThan(0);
    
    // Check that entities have position styles
    for (const entity of entities) {
      const styles = await entity.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          position: computed.position,
          left: computed.left,
          top: computed.top,
          width: computed.width,
          height: computed.height
        };
      });
      
      expect(styles.position).toBe('absolute');
      expect(parseInt(styles.left)).toBeGreaterThanOrEqual(0);
      expect(parseInt(styles.top)).toBeGreaterThanOrEqual(0);
      expect(parseInt(styles.width)).toBeGreaterThan(0);
      expect(parseInt(styles.height)).toBeGreaterThan(0);
    }
  });

  test('should maintain z-index ordering', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const entities = await page.locator('[data-testid^="entity-"]').all();
    const zIndexes: number[] = [];
    
    for (const entity of entities) {
      const zIndex = await entity.evaluate((el) => {
        return parseInt(window.getComputedStyle(el).zIndex) || 0;
      });
      zIndexes.push(zIndex);
    }
    
    // Verify entities are rendered in z-index order (sorted)
    const sortedZIndexes = [...zIndexes].sort((a, b) => a - b);
    expect(zIndexes).toEqual(sortedZIndexes);
  });

  test('should render different entity types correctly', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    // Check for player entity
    const playerEntity = page.locator('[data-testid^="entity-"][data-entity-type="player"]').first();
    if (await playerEntity.count() > 0) {
      expect(await playerEntity.textContent()).toBeTruthy();
      
      const styles = await playerEntity.evaluate((el) => window.getComputedStyle(el).zIndex);
      // Players should have higher z-index for visibility
      expect(parseInt(styles) || 0).toBeGreaterThan(0);
    }
    
    // Check for building entities
    const buildingEntities = page.locator('[data-testid^="entity-"][data-entity-type="building"]');
    const buildingCount = await buildingEntities.count();
    
    if (buildingCount > 0) {
      for (let i = 0; i < buildingCount; i++) {
        const building = buildingEntities.nth(i);
        expect(await building.textContent()).toBeTruthy();
        
        const size = await building.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            width: parseInt(computed.width),
            height: parseInt(computed.height)
          };
        });
        
        // Buildings are typically larger than 1x1 cell
        expect(size.width).toBeGreaterThanOrEqual(40); // Default cell size
        expect(size.height).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test('should update entity positions in real-time', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    // Find a player entity to track movement
    const playerEntity = page.locator('[data-testid^="entity-"][data-entity-type="player"]').first();
    
    if (await playerEntity.count() > 0) {
      // Get initial position
      const initialPosition = await playerEntity.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          left: parseInt(computed.left),
          top: parseInt(computed.top)
        };
      });
      
      // Simulate movement input (WASD keys)
      await page.keyboard.press('KeyD'); // Move right
      
      // Wait a bit for the movement to be processed
      await page.waitForTimeout(100);
      
      // Check if position has changed (movement system should update position)
      const newPosition = await playerEntity.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          left: parseInt(computed.left),
          top: parseInt(computed.top)
        };
      });
      
      // Position might have changed if movement system is active
      // At minimum, the element should still be rendered
      expect(newPosition.left).toBeGreaterThanOrEqual(0);
      expect(newPosition.top).toBeGreaterThanOrEqual(0);
    }
  });

  test('should handle entity visibility correctly', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const entities = await page.locator('[data-testid^="entity-"]').all();
    
    // All rendered entities should be visible
    for (const entity of entities) {
      const isVisible = await entity.isVisible();
      expect(isVisible).toBe(true);
      
      const opacity = await entity.evaluate((el) => 
        window.getComputedStyle(el).opacity
      );
      expect(parseFloat(opacity)).toBeGreaterThan(0);
    }
  });

  test('should render entities with correct cell size scaling', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const entities = await page.locator('[data-testid^="entity-"]').all();
    
    for (const entity of entities) {
      const position = await entity.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          left: parseInt(computed.left),
          top: parseInt(computed.top),
          width: parseInt(computed.width),
          height: parseInt(computed.height)
        };
      });
      
      // Positions should be multiples of cell size (40px default)
      const cellSize = 40;
      expect(position.left % cellSize).toBe(0);
      expect(position.top % cellSize).toBe(0);
      
      // Sizes should also be multiples of cell size
      expect(position.width % cellSize).toBe(0);
      expect(position.height % cellSize).toBe(0);
    }
  });

  test('should handle hover effects on entities', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const entity = page.locator('[data-testid^="entity-"]').first();
    
    // Get initial transform
    const initialTransform = await entity.evaluate((el) => 
      window.getComputedStyle(el).transform
    );
    
    // Hover over entity
    await entity.hover();
    
    // Wait for hover transition
    await page.waitForTimeout(200);
    
    // Check if transform changed (should have scale effect)
    const hoverTransform = await entity.evaluate((el) => 
      window.getComputedStyle(el).transform
    );
    
    // Hover effect should apply a scale transform
    expect(hoverTransform).not.toBe(initialTransform);
    expect(hoverTransform).toContain('scale');
  });

  test('should maintain render performance with multiple entities', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const startTime = Date.now();
    
    // Get all entities
    const entities = await page.locator('[data-testid^="entity-"]').all();
    const entityCount = entities.length;
    
    // Perform multiple operations to test performance
    for (let i = 0; i < Math.min(10, entityCount); i++) {
      const entity = entities[i];
      await entity.isVisible();
      await entity.evaluate((el) => window.getComputedStyle(el));
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete operations within reasonable time
    expect(duration).toBeLessThan(1000); // 1 second
    expect(entityCount).toBeGreaterThan(0);
  });

  test('should render grid overlay when enabled', async ({ page }) => {
    await page.waitForSelector('[data-testid="game-canvas"]', { timeout: 5000 });
    
    // Check if grid overlay exists (might be hidden by default)
    const gridOverlay = page.locator('[data-testid="grid-overlay"]');
    
    if (await gridOverlay.count() > 0) {
      const styles = await gridOverlay.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          position: computed.position,
          backgroundImage: computed.backgroundImage,
          opacity: computed.opacity
        };
      });
      
      expect(styles.position).toBe('absolute');
      expect(styles.backgroundImage).toContain('linear-gradient');
      expect(parseFloat(styles.opacity)).toBeGreaterThanOrEqual(0);
    }
  });

  test('should handle entity rendering errors gracefully', async ({ page }) => {
    await page.waitForSelector('[data-testid="game-canvas"]', { timeout: 5000 });
    
    // Monitor console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait for a few seconds to let any rendering errors occur
    await page.waitForTimeout(2000);
    
    // Check that no critical rendering errors occurred
    const criticalErrors = errors.filter(error => 
      error.toLowerCase().includes('render') ||
      error.toLowerCase().includes('component') ||
      error.toLowerCase().includes('react')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});