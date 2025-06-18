import { test, expect } from '@playwright/test';

test.describe('Data Generation Flow', () => {
  test('should generate mock data successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads correctly
    await expect(page.locator('h1')).toContainText('QA Data Forge');
    
    // Ensure we're on the generate tab (default)
    await expect(page.locator('.nav-tabs button.active')).toContainText('データ生成');
    
    // Fill the form
    await page.fill('textarea#prompt', '機械学習に関するQAデータを生成してください');
    await page.fill('input#count', '5');
    await page.selectOption('select#format', 'json');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for loading to complete
    await expect(page.locator('button[type="submit"]')).not.toContainText('生成中...');
    
    // Check if results are displayed
    await expect(page.locator('.results-section')).toBeVisible();
    await expect(page.locator('.display-header h3')).toContainText('処理結果 (5件)');
    
    // Check if data table is displayed
    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.data-table tbody tr')).toHaveCount(5);
    
    // Check table headers
    await expect(page.locator('.data-table th').nth(0)).toContainText('ID');
    await expect(page.locator('.data-table th').nth(1)).toContainText('コンテンツ');
    await expect(page.locator('.data-table th').nth(2)).toContainText('メタデータ');
    
    // Test view mode switching
    await page.click('.view-mode-buttons button:has-text("JSON")');
    await expect(page.locator('.json-view')).toBeVisible();
    
    await page.click('.view-mode-buttons button:has-text("テーブル")');
    await expect(page.locator('.data-table')).toBeVisible();
    
    // Test detail modal
    await page.click('.detail-button').first();
    await expect(page.locator('.modal-overlay')).toBeVisible();
    await expect(page.locator('.modal-header h4')).toContainText('詳細情報');
    
    // Close modal
    await page.click('.modal-close');
    await expect(page.locator('.modal-overlay')).not.toBeVisible();
  });

  test('should validate form inputs', async ({ page }) => {
    await page.goto('/');
    
    // Try to submit without prompt
    await page.click('button[type="submit"]');
    
    // Form should not submit (button should be disabled or show validation)
    await expect(page.locator('button[type="submit"]:disabled')).toBeVisible();
    
    // Fill only prompt
    await page.fill('textarea#prompt', 'テストプロンプト');
    await expect(page.locator('button[type="submit"]:not(:disabled)')).toBeVisible();
    
    // Clear prompt
    await page.fill('textarea#prompt', '');
    await expect(page.locator('button[type="submit"]:disabled')).toBeVisible();
  });

  test('should handle different output formats', async ({ page }) => {
    await page.goto('/');
    
    // Generate data with CSV format
    await page.fill('textarea#prompt', 'テストデータ');
    await page.fill('input#count', '3');
    await page.selectOption('select#format', 'csv');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('button[type="submit"]')).not.toContainText('生成中...');
    
    // Check if results are displayed
    await expect(page.locator('.results-section')).toBeVisible();
    
    // Check download button shows CSV
    await expect(page.locator('.download-button')).toContainText('CSV');
  });
});