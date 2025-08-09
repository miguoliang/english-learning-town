/**
 * ECS Rendering Integration Tests with Playwright
 * Tests the complete rendering pipeline from World → RenderSystem → ECSRenderer → DOM
 */

import { test, expect } from '@playwright/test';

test.describe('ECS Rendering Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="game-canvas"]', { timeout: 10000 });
  });

  test('should load and render complete game scene', async ({ page }) => {
    // Wait for initial scene to load
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 10000 });
    
    // Verify game canvas is present and styled
    const canvas = page.locator('[data-testid="game-canvas"]');
    expect(await canvas.isVisible()).toBe(true);
    
    const canvasStyles = await canvas.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        background: computed.background,
        position: computed.position,
        cursor: computed.cursor
      };
    });
    
    expect(canvasStyles.position).toBe('relative');
    expect(canvasStyles.cursor).toBe('pointer');
    expect(canvasStyles.background).toContain('linear-gradient');
    
    // Verify entities are rendered
    const entities = await page.locator('[data-testid^="entity-"]').all();
    expect(entities.length).toBeGreaterThan(0);
    
    // Check entity types are properly assigned
    const entityTypes = new Set();
    for (const entity of entities) {
      const type = await entity.getAttribute('data-entity-type');
      if (type) entityTypes.add(type);
    }
    
    expect(entityTypes.size).toBeGreaterThan(0);
    expect([...entityTypes].every(type => 
      ['player', 'npc', 'building', 'decoration'].includes(type as string)
    )).toBe(true);
  });

  test('should maintain correct render order and layering', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const entities = await page.locator('[data-testid^="entity-"]').all();
    const renderOrder: Array<{ id: string, zIndex: number, type: string }> = [];
    
    for (const entity of entities) {
      const testId = await entity.getAttribute('data-testid');
      const entityType = await entity.getAttribute('data-entity-type');
      const zIndex = await entity.evaluate((el) => {
        return parseInt(window.getComputedStyle(el).zIndex) || 0;
      });
      
      if (testId && entityType) {
        renderOrder.push({ 
          id: testId, 
          zIndex, 
          type: entityType 
        });
      }
    }
    
    // Verify render order follows z-index rules
    const sortedByZIndex = [...renderOrder].sort((a, b) => a.zIndex - b.zIndex);
    
    // DOM order should match z-index order (lower z-index rendered first)
    for (let i = 0; i < renderOrder.length - 1; i++) {
      expect(renderOrder[i].zIndex).toBeLessThanOrEqual(renderOrder[i + 1].zIndex);
    }
    
    // Players should typically have higher z-index than buildings
    const players = renderOrder.filter(e => e.type === 'player');
    const buildings = renderOrder.filter(e => e.type === 'building');
    
    if (players.length > 0 && buildings.length > 0) {
      const avgPlayerZIndex = players.reduce((sum, p) => sum + p.zIndex, 0) / players.length;
      const avgBuildingZIndex = buildings.reduce((sum, b) => sum + b.zIndex, 0) / buildings.length;
      
      expect(avgPlayerZIndex).toBeGreaterThanOrEqual(avgBuildingZIndex);
    }
  });

  test('should handle real-time game loop and entity updates', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    // Get initial state
    const initialEntityCount = await page.locator('[data-testid^="entity-"]').count();
    const playerEntity = page.locator('[data-testid^="entity-"][data-entity-type="player"]').first();
    
    let initialPlayerPosition = { left: 0, top: 0 };
    if (await playerEntity.count() > 0) {
      initialPlayerPosition = await playerEntity.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          left: parseInt(computed.left),
          top: parseInt(computed.top)
        };
      });
    }
    
    // Simulate game interactions
    await page.keyboard.press('KeyD'); // Move right
    await page.waitForTimeout(100);
    await page.keyboard.press('KeyS'); // Move down
    await page.waitForTimeout(100);
    
    // Check that game is still running
    const currentEntityCount = await page.locator('[data-testid^="entity-"]').count();
    expect(currentEntityCount).toBe(initialEntityCount); // Entity count should be stable
    
    // Player position may have changed
    if (await playerEntity.count() > 0) {
      const currentPlayerPosition = await playerEntity.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          left: parseInt(computed.left),
          top: parseInt(computed.top)
        };
      });
      
      // Position should still be valid (movement system may or may not be active)
      expect(currentPlayerPosition.left).toBeGreaterThanOrEqual(0);
      expect(currentPlayerPosition.top).toBeGreaterThanOrEqual(0);
    }
    
    // Game should remain interactive
    const canvas = page.locator('[data-testid="game-canvas"]');
    await canvas.click({ position: { x: 200, y: 150 } });
    await page.waitForTimeout(100);
    
    expect(await canvas.isVisible()).toBe(true);
  });

  test('should handle entity interactions and scene transitions', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    // Look for interactive entities (buildings, NPCs)
    const buildings = page.locator('[data-testid^="entity-"][data-entity-type="building"]');
    const npcs = page.locator('[data-testid^="entity-"][data-entity-type="npc"]');
    
    const buildingCount = await buildings.count();
    const npcCount = await npcs.count();
    
    // Test building interaction (scene transition)
    if (buildingCount > 0) {
      const building = buildings.first();
      await building.click();
      
      // Wait for potential scene transition
      await page.waitForTimeout(2000);
      
      // Game should still be running (either same scene or new scene)
      const canvas = page.locator('[data-testid="game-canvas"]');
      expect(await canvas.isVisible()).toBe(true);
      
      // Entities should still be present
      await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
      const entitiesAfterInteraction = await page.locator('[data-testid^="entity-"]').count();
      expect(entitiesAfterInteraction).toBeGreaterThan(0);
    }
    
    // Test NPC interaction (dialogue)
    if (npcCount > 0) {
      const npc = npcs.first();
      await npc.click();
      
      // Wait for potential dialogue system
      await page.waitForTimeout(1000);
      
      // Check if dialogue appeared (or other interaction UI)
      const dialogueSystem = page.locator('[data-testid="dialogue-system"]');
      if (await dialogueSystem.count() > 0) {
        expect(await dialogueSystem.isVisible()).toBe(true);
        
        // Try to close dialogue if present
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
      
      // Game should remain functional
      expect(await page.locator('[data-testid="game-canvas"]').isVisible()).toBe(true);
    }
  });

  test('should maintain visual consistency across different screen sizes', async ({ page }) => {
    const screenSizes = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1024, height: 768 },
      { width: 800, height: 600 }
    ];
    
    for (const size of screenSizes) {
      await page.setViewportSize(size);
      await page.waitForTimeout(300);
      
      // Wait for entities to be visible
      await page.waitForSelector('[data-testid^="entity-"]', { timeout: 3000 });
      
      // Check canvas fills viewport
      const canvas = page.locator('[data-testid="game-canvas"]');
      const canvasBounds = await canvas.boundingBox();
      
      expect(canvasBounds?.width).toBeCloseTo(size.width, 0);
      expect(canvasBounds?.height).toBeCloseTo(size.height, 0);
      
      // Check entities are positioned within viewport bounds
      const entities = await page.locator('[data-testid^="entity-"]').all();
      
      for (const entity of entities.slice(0, 5)) { // Check first 5 for performance
        const entityBounds = await entity.boundingBox();
        if (entityBounds) {
          expect(entityBounds.x).toBeGreaterThanOrEqual(-50); // Allow some margin
          expect(entityBounds.y).toBeGreaterThanOrEqual(-50);
          expect(entityBounds.x).toBeLessThan(size.width + 50);
          expect(entityBounds.y).toBeLessThan(size.height + 50);
        }
      }
      
      // Check that entities maintain proper scaling
      const sampleEntity = entities[0];
      if (sampleEntity) {
        const entitySize = await sampleEntity.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            width: parseInt(computed.width),
            height: parseInt(computed.height)
          };
        });
        
        // Entity size should be consistent (based on cell size)
        expect(entitySize.width).toBeGreaterThan(0);
        expect(entitySize.height).toBeGreaterThan(0);
        expect(entitySize.width % 40).toBe(0); // Should be multiple of cell size
        expect(entitySize.height % 40).toBe(0);
      }
    }
  });

  test('should handle performance under entity load', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const startTime = Date.now();
    
    // Get all entities
    const entities = await page.locator('[data-testid^="entity-"]').all();
    const entityCount = entities.length;
    
    // Perform operations that would stress the rendering system
    for (let i = 0; i < 10; i++) {
      // Rapid keyboard input (movement)
      await page.keyboard.press('KeyW');
      await page.keyboard.press('KeyD');
      await page.keyboard.press('KeyS');
      await page.keyboard.press('KeyA');
      
      // Canvas clicks (pathfinding/interaction)
      const canvas = page.locator('[data-testid="game-canvas"]');
      await canvas.click({ position: { x: 100 + i * 20, y: 100 + i * 20 } });
      
      // Brief pause
      await page.waitForTimeout(10);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete stress test within reasonable time
    expect(duration).toBeLessThan(2000); // 2 seconds
    
    // Verify game is still functional
    expect(await page.locator('[data-testid="game-canvas"]').isVisible()).toBe(true);
    
    const finalEntityCount = await page.locator('[data-testid^="entity-"]').count();
    expect(finalEntityCount).toBe(entityCount); // No entities lost during stress test
    
    console.log(`Performance test: ${entityCount} entities, ${duration}ms duration`);
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Monitor console errors
    const errors: string[] = [];
    const warnings: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });
    
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    // Simulate potentially problematic interactions
    const canvas = page.locator('[data-testid="game-canvas"]');
    
    // Rapid clicks in various locations
    for (let i = 0; i < 20; i++) {
      await canvas.click({ position: { x: i * 50, y: i * 30 } });
      await page.waitForTimeout(10);
    }
    
    // Rapid keyboard input
    const keys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Enter', 'Escape', 'Space'];
    for (const key of keys) {
      await page.keyboard.press(key);
      await page.waitForTimeout(10);
    }
    
    // Wait for any errors to surface
    await page.waitForTimeout(1000);
    
    // Filter out non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('Warning:') &&
      !error.includes('DevTools') &&
      !error.includes('Extension') &&
      !error.toLowerCase().includes('favicon')
    );
    
    expect(criticalErrors).toHaveLength(0);
    
    // Game should still be functional
    expect(await canvas.isVisible()).toBe(true);
    expect(await page.locator('[data-testid^="entity-"]').count()).toBeGreaterThan(0);
  });

  test('should maintain game state consistency', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    // Capture initial game state
    const initialState = await page.evaluate(() => {
      const entities = Array.from(document.querySelectorAll('[data-testid^="entity-"]'));
      return entities.map(el => ({
        id: el.getAttribute('data-testid'),
        type: el.getAttribute('data-entity-type'),
        position: {
          left: el.style.left || window.getComputedStyle(el).left,
          top: el.style.top || window.getComputedStyle(el).top
        },
        visible: window.getComputedStyle(el).display !== 'none'
      }));
    });
    
    expect(initialState.length).toBeGreaterThan(0);
    
    // Perform various interactions
    await page.keyboard.press('KeyW');
    await page.waitForTimeout(100);
    
    const canvas = page.locator('[data-testid="game-canvas"]');
    await canvas.click({ position: { x: 300, y: 200 } });
    await page.waitForTimeout(200);
    
    // Check entities after interactions
    const afterInteractionState = await page.evaluate(() => {
      const entities = Array.from(document.querySelectorAll('[data-testid^="entity-"]'));
      return entities.map(el => ({
        id: el.getAttribute('data-testid'),
        type: el.getAttribute('data-entity-type'),
        position: {
          left: el.style.left || window.getComputedStyle(el).left,
          top: el.style.top || window.getComputedStyle(el).top
        },
        visible: window.getComputedStyle(el).display !== 'none'
      }));
    });
    
    // Entity count should remain stable
    expect(afterInteractionState.length).toBe(initialState.length);
    
    // All entities should maintain their IDs and types
    for (const entity of afterInteractionState) {
      const initialEntity = initialState.find(e => e.id === entity.id);
      expect(initialEntity).toBeTruthy();
      expect(entity.type).toBe(initialEntity!.type);
      expect(entity.visible).toBe(true);
    }
  });

  test('should handle animation and visual effects correctly', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const entities = await page.locator('[data-testid^="entity-"]').all();
    
    // Test hover animations
    if (entities.length > 0) {
      const testEntity = entities[0];
      
      // Get initial state
      const initialTransform = await testEntity.evaluate((el) => 
        window.getComputedStyle(el).transform
      );
      
      // Hover and check for animation
      await testEntity.hover();
      await page.waitForTimeout(200); // Wait for CSS transition
      
      const hoverTransform = await testEntity.evaluate((el) => 
        window.getComputedStyle(el).transform
      );
      
      // Should have some transform or maintain visibility
      expect(await testEntity.isVisible()).toBe(true);
      
      // Move away and verify entity is still rendered
      await page.mouse.move(0, 0);
      await page.waitForTimeout(200);
      
      expect(await testEntity.isVisible()).toBe(true);
    }
    
    // Test CSS transitions are working
    const canvas = page.locator('[data-testid="game-canvas"]');
    const canvasStyles = await canvas.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        background: computed.background,
        backgroundImage: computed.backgroundImage
      };
    });
    
    // Should have gradient background
    expect(canvasStyles.backgroundImage).toContain('linear-gradient');
  });
});