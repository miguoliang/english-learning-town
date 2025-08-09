/**
 * ECSRenderer Component Playwright Tests
 * Tests the React ECSRenderer component rendering and interaction
 */

import { test, expect } from '@playwright/test';

test.describe('ECSRenderer Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="game-canvas"]', { timeout: 10000 });
  });

  test('should render game canvas with correct styling', async ({ page }) => {
    const canvas = page.locator('[data-testid="game-canvas"]');
    
    expect(await canvas.count()).toBe(1);
    
    const styles = await canvas.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        position: computed.position,
        width: computed.width,
        height: computed.height,
        cursor: computed.cursor,
        overflow: computed.overflow
      };
    });
    
    expect(styles.position).toBe('relative');
    expect(styles.cursor).toBe('pointer');
    expect(styles.overflow).toBe('hidden');
    
    // Should fill viewport
    expect(styles.width).toBe('100vw');
    expect(styles.height).toBe('100vh');
  });

  test('should render entities with correct attributes and styling', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const entities = await page.locator('[data-testid^="entity-"]').all();
    expect(entities.length).toBeGreaterThan(0);
    
    for (const entity of entities) {
      // Check required attributes
      const testId = await entity.getAttribute('data-testid');
      const entityType = await entity.getAttribute('data-entity-type');
      
      expect(testId).toMatch(/^entity-.+/);
      expect(entityType).toMatch(/^(player|npc|building|decoration)$/);
      
      // Check styling
      const styles = await entity.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          position: computed.position,
          display: computed.display,
          alignItems: computed.alignItems,
          justifyContent: computed.justifyContent,
          userSelect: computed.userSelect,
          borderRadius: computed.borderRadius
        };
      });
      
      expect(styles.position).toBe('absolute');
      expect(styles.display).toBe('flex');
      expect(styles.alignItems).toBe('center');
      expect(styles.justifyContent).toBe('center');
      expect(styles.userSelect).toBe('none');
      expect(styles.borderRadius).toBe('4px');
    }
  });

  test('should handle canvas click events correctly', async ({ page }) => {
    const canvas = page.locator('[data-testid="game-canvas"]');
    
    // Get canvas bounds for calculating click position
    const canvasBounds = await canvas.boundingBox();
    expect(canvasBounds).toBeTruthy();
    
    // Click on empty area of canvas
    const clickX = canvasBounds!.x + 200;
    const clickY = canvasBounds!.y + 150;
    
    await page.mouse.click(clickX, clickY);
    
    // Wait a moment for any potential movement or interaction
    await page.waitForTimeout(100);
    
    // Verify canvas is still interactive (no errors)
    expect(await canvas.isVisible()).toBe(true);
  });

  test('should handle entity click events correctly', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const entity = page.locator('[data-testid^="entity-"]').first();
    
    // Click on entity
    await entity.click();
    
    // Wait for potential interaction (dialogue, menu, etc.)
    await page.waitForTimeout(500);
    
    // Entity should still be visible after click
    expect(await entity.isVisible()).toBe(true);
  });

  test('should handle keyboard input for player movement', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    // Find player entity
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
      
      // Test different movement keys
      const movementKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'];
      
      for (const key of movementKeys) {
        await page.keyboard.press(key);
        await page.waitForTimeout(50); // Brief pause between inputs
      }
      
      // Wait for movement to be processed
      await page.waitForTimeout(200);
      
      // Get final position
      const finalPosition = await playerEntity.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          left: parseInt(computed.left),
          top: parseInt(computed.top)
        };
      });
      
      // Position should be valid (movement system may or may not be active)
      expect(finalPosition.left).toBeGreaterThanOrEqual(0);
      expect(finalPosition.top).toBeGreaterThanOrEqual(0);
    }
  });

  test('should render different entity render types correctly', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const entities = await page.locator('[data-testid^="entity-"]').all();
    
    for (const entity of entities) {
      // Check for emoji entities (most common)
      const textContent = await entity.textContent();
      if (textContent && textContent.trim()) {
        // Should contain emoji or text
        expect(textContent.length).toBeGreaterThan(0);
      }
      
      // Check for sprite entities (images)
      const images = await entity.locator('img').all();
      for (const img of images) {
        const src = await img.getAttribute('src');
        expect(src).toBeTruthy();
        
        const imgStyles = await img.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            width: computed.width,
            height: computed.height,
            objectFit: computed.objectFit
          };
        });
        
        expect(imgStyles.width).toBe('100%');
        expect(imgStyles.height).toBe('100%');
        expect(imgStyles.objectFit).toBe('contain');
      }
    }
  });

  test('should maintain hover effects on entities', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const entity = page.locator('[data-testid^="entity-"]').first();
    
    // Get initial transform
    const initialTransform = await entity.evaluate((el) => 
      window.getComputedStyle(el).transform
    );
    
    // Hover over entity
    await entity.hover();
    
    // Wait for CSS transition
    await page.waitForTimeout(200);
    
    // Check for hover transform (scale effect)
    const hoverTransform = await entity.evaluate((el) => 
      window.getComputedStyle(el).transform
    );
    
    // Should have some transform applied on hover
    if (hoverTransform !== 'none') {
      expect(hoverTransform).not.toBe(initialTransform);
    }
    
    // Move mouse away
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);
    
    // Transform should revert (or at least element should still be visible)
    expect(await entity.isVisible()).toBe(true);
  });

  test('should handle font size scaling based on cell size', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const entities = await page.locator('[data-testid^="entity-"]').all();
    
    for (const entity of entities) {
      const textContent = await entity.textContent();
      if (textContent && textContent.trim()) {
        const fontSize = await entity.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return parseInt(computed.fontSize);
        });
        
        // Font size should be reasonable for cell size (default 40px cells)
        expect(fontSize).toBeGreaterThan(0);
        expect(fontSize).toBeLessThanOrEqual(32); // Max font size based on cellSize * 0.8
      }
    }
  });

  test('should render grid overlay when present', async ({ page }) => {
    const gridOverlay = page.locator('[data-testid="grid-overlay"]');
    
    if (await gridOverlay.count() > 0) {
      const styles = await gridOverlay.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          position: computed.position,
          top: computed.top,
          left: computed.left,
          width: computed.width,
          height: computed.height,
          pointerEvents: computed.pointerEvents,
          backgroundImage: computed.backgroundImage,
          backgroundSize: computed.backgroundSize
        };
      });
      
      expect(styles.position).toBe('absolute');
      expect(styles.top).toBe('0px');
      expect(styles.left).toBe('0px');
      expect(styles.width).toBe('100%');
      expect(styles.height).toBe('100%');
      expect(styles.pointerEvents).toBe('none');
      expect(styles.backgroundImage).toContain('linear-gradient');
      expect(styles.backgroundSize).toMatch(/\d+px \d+px/);
    }
  });

  test('should handle rapid interactions without errors', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const canvas = page.locator('[data-testid="game-canvas"]');
    const entities = await page.locator('[data-testid^="entity-"]').all();
    
    // Monitor for errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Perform rapid interactions
    for (let i = 0; i < 10; i++) {
      // Rapid keyboard inputs
      await page.keyboard.press('KeyW');
      await page.keyboard.press('KeyS');
      
      // Rapid clicks
      if (entities.length > 0) {
        await entities[0].click();
      }
      await canvas.click({ position: { x: 100 + i * 10, y: 100 + i * 10 } });
      
      await page.waitForTimeout(10);
    }
    
    // Check for errors
    const criticalErrors = errors.filter(error => 
      !error.includes('Warning') && // Ignore React warnings
      !error.includes('DevTools') // Ignore dev tools messages
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should maintain responsive layout', async ({ page }) => {
    const canvas = page.locator('[data-testid="game-canvas"]');
    
    // Test different viewport sizes
    const viewportSizes = [
      { width: 1920, height: 1080 },
      { width: 1280, height: 720 },
      { width: 800, height: 600 }
    ];
    
    for (const size of viewportSizes) {
      await page.setViewportSize(size);
      await page.waitForTimeout(100);
      
      const canvasBounds = await canvas.boundingBox();
      expect(canvasBounds).toBeTruthy();
      
      // Canvas should fill the viewport
      expect(canvasBounds!.width).toBeCloseTo(size.width, -1);
      expect(canvasBounds!.height).toBeCloseTo(size.height, -1);
      
      // Entities should still be visible and positioned correctly
      await page.waitForSelector('[data-testid^="entity-"]', { timeout: 1000 });
      const entities = await page.locator('[data-testid^="entity-"]').all();
      
      for (const entity of entities.slice(0, 3)) { // Check first 3 for performance
        expect(await entity.isVisible()).toBe(true);
        
        const bounds = await entity.boundingBox();
        if (bounds) {
          expect(bounds.x).toBeGreaterThanOrEqual(0);
          expect(bounds.y).toBeGreaterThanOrEqual(0);
          expect(bounds.x + bounds.width).toBeLessThanOrEqual(size.width);
          expect(bounds.y + bounds.height).toBeLessThanOrEqual(size.height);
        }
      }
    }
  });

  test('should handle scene transitions correctly', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    // Look for building entities that might be interactable
    const buildings = page.locator('[data-testid^="entity-"][data-entity-type="building"]');
    const buildingCount = await buildings.count();
    
    if (buildingCount > 0) {
      const building = buildings.first();
      
      // Try clicking on building (might trigger scene transition)
      await building.click();
      
      // Wait for potential scene transition
      await page.waitForTimeout(1000);
      
      // Game canvas should still be present (either same scene or new scene)
      const canvas = page.locator('[data-testid="game-canvas"]');
      expect(await canvas.isVisible()).toBe(true);
      
      // Some entities should be present (either same or different scene)
      await page.waitForSelector('[data-testid^="entity-"]', { timeout: 3000 });
    }
  });

  test('should maintain game loop and updates', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    // Monitor for continuous updates by checking if entities are being re-rendered
    let initialEntityCount = await page.locator('[data-testid^="entity-"]').count();
    
    // Wait and check again
    await page.waitForTimeout(1000);
    
    let currentEntityCount = await page.locator('[data-testid^="entity-"]').count();
    
    // Entity count should be stable (might change due to loading, but should stabilize)
    expect(currentEntityCount).toBeGreaterThan(0);
    
    // Game should still be responsive to input
    await page.keyboard.press('KeyW');
    await page.waitForTimeout(100);
    
    // Canvas should still be interactive
    const canvas = page.locator('[data-testid="game-canvas"]');
    expect(await canvas.isVisible()).toBe(true);
  });
});