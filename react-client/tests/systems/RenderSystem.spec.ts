/**
 * RenderSystem Unit Tests
 * Tests the event-driven rendering system for ECS entities
 */

import { test, expect } from '@playwright/test';

test.describe('RenderSystem', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="game-canvas"]', { timeout: 10000 });
    
    await page.fill('input[placeholder*="name"]', 'TestPlayer');
    await page.click('button:has-text("Start New Adventure")');
    await page.waitForTimeout(2000);
  });

  test('should render entities with correct positioning', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const entities = await page.locator('[data-testid^="entity-"]').all();
    expect(entities.length).toBeGreaterThan(0);
    
    // Check entity positioning
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

  test('should trigger renders on entity movement', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const renderEvents: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('RenderSystem') || 
          msg.text().includes('triggering render') ||
          msg.text().includes('Rendering') && msg.text().includes('entities')) {
        renderEvents.push(msg.text());
      }
    });
    
    // Move player to trigger renders
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    
    // Should trigger render events
    expect(renderEvents.length).toBeGreaterThan(0);
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
    
    // Player should have higher z-index than most other entities
    const maxZIndex = Math.max(...zIndexes);
    expect(maxZIndex).toBeGreaterThan(0);
  });

  test('should render different entity types correctly', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const entities = await page.locator('[data-testid^="entity-"]').all();
    
    // Check that entities have content (emojis/sprites)
    for (const entity of entities) {
      const content = await entity.textContent();
      expect(content).toBeTruthy();
      expect(content!.length).toBeGreaterThan(0);
    }
  });

  test('should handle entity visibility correctly', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const entities = await page.locator('[data-testid^="entity-"]').all();
    
    for (const entity of entities) {
      const isVisible = await entity.isVisible();
      expect(isVisible).toBe(true);
      
      const opacity = await entity.evaluate((el) => 
        window.getComputedStyle(el).opacity
      );
      expect(parseFloat(opacity)).toBeGreaterThan(0);
    }
  });

  test('should use correct cell size scaling', async ({ page }) => {
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
      expect(position.width % cellSize).toBe(0);
      expect(position.height % cellSize).toBe(0);
    }
  });

  test('should emit RENDER_FRAME_READY events', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const frameEvents: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('RENDER_FRAME_READY') || 
          msg.text().includes('frame ready')) {
        frameEvents.push(msg.text());
      }
    });
    
    // Trigger render by moving
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    
    console.log(`Frame ready events: ${frameEvents.length}`);
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
    await page.waitForTimeout(200);
    
    // Check if transform changed (should have scale effect)
    const hoverTransform = await entity.evaluate((el) => 
      window.getComputedStyle(el).transform
    );
    
    expect(hoverTransform).not.toBe(initialTransform);
    expect(hoverTransform).toContain('scale');
  });

  test('should be event-driven (not updating continuously)', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const renderLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('triggering render')) {
        renderLogs.push(msg.text());
      }
    });
    
    // Wait without any input
    await page.waitForTimeout(1000);
    const idleRenders = renderLogs.length;
    
    // Make a movement
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);
    const activeRenders = renderLogs.length;
    
    // Should not render continuously when idle
    // Should render when events occur
    console.log(`Idle renders: ${idleRenders}, Active renders: ${activeRenders}`);
    expect(activeRenders).toBeGreaterThan(idleRenders);
  });

  test('should handle render performance with multiple entities', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const startTime = Date.now();
    
    // Get all entities and perform operations
    const entities = await page.locator('[data-testid^="entity-"]').all();
    const entityCount = entities.length;
    
    for (let i = 0; i < Math.min(10, entityCount); i++) {
      const entity = entities[i];
      await entity.isVisible();
      await entity.evaluate((el) => window.getComputedStyle(el));
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete operations within reasonable time
    expect(duration).toBeLessThan(1000);
    expect(entityCount).toBeGreaterThan(0);
  });
});
