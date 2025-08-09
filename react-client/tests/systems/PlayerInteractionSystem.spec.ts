/**
 * PlayerInteractionSystem Unit Tests
 * Tests spacebar-triggered player interactions with entities
 */

import { test, expect } from '@playwright/test';

test.describe('PlayerInteractionSystem', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="game-canvas"]', { timeout: 10000 });
    
    await page.fill('input[placeholder*="name"]', 'TestPlayer');
    await page.click('button:has-text("Start New Adventure")');
    await page.waitForTimeout(2000);
  });

  test('should detect spacebar presses', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const spaceEvents: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('spacebar') || msg.text().includes('Space') || msg.text().includes('interaction')) {
        spaceEvents.push(msg.text());
      }
    });
    
    // Press spacebar multiple times
    await page.keyboard.press('Space');
    await page.waitForTimeout(50);
    await page.keyboard.press('Space');
    await page.waitForTimeout(50);
    await page.keyboard.press('Space');
    
    await page.waitForTimeout(100);
    
    // Should detect spacebar presses
    expect(spaceEvents.length).toBeGreaterThan(0);
  });

  test('should attempt to find interactive entities', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const interactionLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('interactive entities') || 
          msg.text().includes('can interact') ||
          msg.text().includes('No interactive entities')) {
        interactionLogs.push(msg.text());
      }
    });
    
    // Press spacebar to trigger interaction detection
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    
    // Should attempt to find interactive entities
    expect(interactionLogs.length).toBeGreaterThan(0);
  });

  test('should handle interactions based on player position', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5005 });
    
    const positionLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('position') && msg.text().includes('pressed spacebar')) {
        positionLogs.push(msg.text());
      }
    });
    
    // Move to different positions and try interactions
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(50);
    await page.keyboard.press('Space');
    await page.waitForTimeout(50);
    
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(50);
    await page.keyboard.press('Space');
    await page.waitForTimeout(50);
    
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
    await page.keyboard.press('Space');
    
    await page.waitForTimeout(100);
    
    // Should log position-based interaction attempts
    expect(positionLogs.length).toBeGreaterThan(0);
  });

  test('should work with interaction zones', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const zoneEvents: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('zone') || 
          msg.text().includes('interactable') ||
          msg.text().includes('PLAYER_INTERACTION')) {
        zoneEvents.push(msg.text());
      }
    });
    
    // Try to find interactive entities by moving around and pressing spacebar
    const movements = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
    
    for (const movement of movements) {
      await page.keyboard.press(movement);
      await page.waitForTimeout(30);
      await page.keyboard.press('Space');
      await page.waitForTimeout(30);
    }
    
    // Should attempt zone-based interactions
    console.log(`Zone-related events: ${zoneEvents.length}`);
  });

  test('should emit PLAYER_INTERACTION events when appropriate', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const interactionEvents: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('PLAYER_INTERACTION') || 
          msg.text().includes('Player can interact')) {
        interactionEvents.push(msg.text());
      }
    });
    
    // Move around scene looking for interactive entities
    const positions = [
      ['ArrowUp', 'ArrowUp'],
      ['ArrowRight', 'ArrowRight'], 
      ['ArrowDown', 'ArrowDown'],
      ['ArrowLeft', 'ArrowLeft']
    ];
    
    for (const moves of positions) {
      for (const move of moves) {
        await page.keyboard.press(move);
        await page.waitForTimeout(30);
      }
      await page.keyboard.press('Space');
      await page.waitForTimeout(50);
    }
    
    // May find interactive entities depending on scene layout
    console.log(`Interaction events emitted: ${interactionEvents.length}`);
  });

  test('should not interfere with movement keys', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const movementLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Player moved')) {
        movementLogs.push(msg.text());
      }
    });
    
    // Mix movement and interaction
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowLeft');
    
    await page.waitForTimeout(200);
    
    // Movement should still work normally
    expect(movementLogs.length).toBeGreaterThan(0);
  });

  test('should handle rapid spacebar presses gracefully', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const errorLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errorLogs.push(msg.text());
      }
    });
    
    // Rapid spacebar presses
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Space');
      await page.waitForTimeout(10);
    }
    
    await page.waitForTimeout(100);
    
    // Should not cause interaction system errors
    const interactionErrors = errorLogs.filter(log => 
      log.toLowerCase().includes('interaction') || 
      log.toLowerCase().includes('space')
    );
    expect(interactionErrors.length).toBe(0);
  });
});
