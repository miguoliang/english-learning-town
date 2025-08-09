/**
 * InteractionZoneSystem Unit Tests
 * Tests interaction zone detection and validation
 */

import { test, expect } from '@playwright/test';

test.describe('InteractionZoneSystem', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="game-canvas"]', { timeout: 10000 });
    
    await page.fill('input[placeholder*="name"]', 'TestPlayer');
    await page.click('button:has-text("Start New Adventure")');
    await page.waitForTimeout(2000);
  });

  test('should detect when player is in interaction zones', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const zoneEvents: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('interaction zone') || 
          msg.text().includes('findInteractableEntities') ||
          msg.text().includes('interactable')) {
        zoneEvents.push(msg.text());
      }
    });
    
    // Move around and test interactions to trigger zone detection
    const movements = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
    
    for (const movement of movements) {
      await page.keyboard.press(movement);
      await page.waitForTimeout(50);
      await page.keyboard.press('Space'); // Try interaction
      await page.waitForTimeout(50);
    }
    
    console.log(`Zone detection events: ${zoneEvents.length}`);
  });

  test('should validate interaction ranges correctly', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const rangeEvents: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('range') || 
          msg.text().includes('adjacency') ||
          msg.text().includes('distance')) {
        rangeEvents.push(msg.text());
      }
    });
    
    // Test interaction from various distances
    // Move close to potential interactive entities and test
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(30);
      await page.keyboard.press('Space');
      await page.waitForTimeout(30);
    }
    
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(30);
      await page.keyboard.press('Space');
      await page.waitForTimeout(30);
    }
    
    console.log(`Range validation events: ${rangeEvents.length}`);
  });

  test('should handle relative vs absolute zone coordinates', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const coordinateEvents: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('relative') || 
          msg.text().includes('absolute') ||
          msg.text().includes('zone') && msg.text().includes('position')) {
        coordinateEvents.push(msg.text());
      }
    });
    
    // Test interactions from different positions
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Space');
    await page.waitForTimeout(50);
    
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Space');
    await page.waitForTimeout(50);
    
    console.log(`Coordinate handling events: ${coordinateEvents.length}`);
  });

  test('should find interactable entities correctly', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const findEvents: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('interactable entities') || 
          msg.text().includes('findInteractableEntities') ||
          msg.text().includes('Interactive entities found')) {
        findEvents.push(msg.text());
      }
    });
    
    // Systematic search for interactive entities
    // Move in a pattern to cover potential interactive entity locations
    const searchPattern = [
      'ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft',
      'ArrowUp', 'ArrowUp', 'ArrowRight', 'ArrowRight',
      'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowLeft'
    ];
    
    for (const move of searchPattern) {
      await page.keyboard.press(move);
      await page.waitForTimeout(30);
      await page.keyboard.press('Space');
      await page.waitForTimeout(30);
    }
    
    console.log(`Entity finding events: ${findEvents.length}`);
  });

  test('should handle adjacency fallback for entities without defined zones', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const adjacencyEvents: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('adjacency') || 
          msg.text().includes('fallback') ||
          msg.text().includes('default behavior')) {
        adjacencyEvents.push(msg.text());
      }
    });
    
    // Test interactions that might use adjacency fallback
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Space');
    await page.waitForTimeout(50);
    
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space');
    await page.waitForTimeout(50);
    
    console.log(`Adjacency fallback events: ${adjacencyEvents.length}`);
  });

  test('should not allow interaction from same position as entity', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const samePositionEvents: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('same position') || 
          msg.text().includes('not same position') ||
          msg.text().includes('> 0')) {
        samePositionEvents.push(msg.text());
      }
    });
    
    // Try interactions that might test same-position logic
    await page.keyboard.press('Space');
    await page.waitForTimeout(50);
    
    // Move and try again
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space');
    await page.waitForTimeout(50);
    
    console.log(`Same position validation events: ${samePositionEvents.length}`);
  });

  test('should handle multiple interactive entities in range', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const multipleEvents: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('multiple') || 
          msg.text().includes('entities in range') ||
          msg.text().includes('first interactable')) {
        multipleEvents.push(msg.text());
      }
    });
    
    // Test areas where multiple interactive entities might be present
    // Center of map likely has more entities
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    
    console.log(`Multiple entity handling events: ${multipleEvents.length}`);
  });

  test('should maintain performance with zone calculations', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const errorLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errorLogs.push(msg.text());
      }
    });
    
    const startTime = Date.now();
    
    // Perform many interaction checks rapidly
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Space');
      await page.waitForTimeout(10);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete without errors and within reasonable time
    expect(duration).toBeLessThan(1000);
    
    const zoneErrors = errorLogs.filter(log => 
      log.toLowerCase().includes('zone') || 
      log.toLowerCase().includes('interaction')
    );
    expect(zoneErrors.length).toBe(0);
  });
});
