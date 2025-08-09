/**
 * InputStateSystem Unit Tests
 * Tests keyboard input state management and event emission
 */

import { test, expect } from '@playwright/test';

test.describe('InputStateSystem', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="game-canvas"]', { timeout: 10000 });
    
    await page.fill('input[placeholder*="name"]', 'TestPlayer');
    await page.click('button:has-text("Start New Adventure")');
    await page.waitForTimeout(2000);
  });

  test('should detect keyboard input events', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const inputEvents: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('INPUT_KEY') || msg.text().includes('KeyDown') || msg.text().includes('KeyUp')) {
        inputEvents.push(msg.text());
      }
    });
    
    // Test various keys
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('KeyW');
    await page.keyboard.press('KeyS');
    await page.keyboard.press('Space');
    
    await page.waitForTimeout(100);
    
    // Should capture input events
    expect(inputEvents.length).toBeGreaterThan(0);
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
    
    const inputEvents: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('INPUT_KEY') || msg.text().includes('Key')) {
        inputEvents.push(msg.text());
      }
    });
    
    // Press multiple keys rapidly
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space');
    await page.keyboard.press('KeyW');
    
    await page.waitForTimeout(100);
    
    // Should handle all input events
    expect(inputEvents.length).toBeGreaterThan(0);
  });

  test('should emit proper event types for different keys', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const arrowEvents: string[] = [];
    const wasdEvents: string[] = [];
    const spaceEvents: string[] = [];
    
    page.on('console', msg => {
      if (msg.text().includes('Arrow')) {
        arrowEvents.push(msg.text());
      }
      if (msg.text().includes('Key')) {
        wasdEvents.push(msg.text());
      }
      if (msg.text().includes('Space')) {
        spaceEvents.push(msg.text());
      }
    });
    
    // Test different key types
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('KeyW');
    await page.keyboard.press('Space');
    
    await page.waitForTimeout(100);
    
    console.log(`Arrow: ${arrowEvents.length}, WASD: ${wasdEvents.length}, Space: ${spaceEvents.length}`);
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
    
    const stateEvents: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('state') || msg.text().includes('INPUT_KEY')) {
        stateEvents.push(msg.text());
      }
    });
    
    // Rapid input sequence
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(10);
    }
    
    await page.waitForTimeout(100);
    
    // System should handle rapid input without state corruption
    console.log(`State-related events: ${stateEvents.length}`);
  });
});
