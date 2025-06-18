import { test, expect } from '@playwright/test';

test.describe('Navigation and UI', () => {
  test('should load the application correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check main title
    await expect(page.locator('h1')).toContainText('QA Data Forge');
    await expect(page.locator('.App-header p')).toContainText('ベクトル検索用データ処理パイプライン');
    
    // Check navigation tabs
    await expect(page.locator('.nav-tabs button')).toHaveCount(2);
    await expect(page.locator('.nav-tabs button').nth(0)).toContainText('データ生成');
    await expect(page.locator('.nav-tabs button').nth(1)).toContainText('データ処理');
    
    // Check default active tab
    await expect(page.locator('.nav-tabs button.active')).toContainText('データ生成');
  });

  test('should switch between tabs correctly', async ({ page }) => {
    await page.goto('/');
    
    // Initially on generate tab
    await expect(page.locator('.nav-tabs button.active')).toContainText('データ生成');
    await expect(page.locator('.tab-content h2')).toContainText('新規データセット作成');
    
    // Switch to process tab
    await page.click('.nav-tabs button:has-text("データ処理")');
    await expect(page.locator('.nav-tabs button.active')).toContainText('データ処理');
    await expect(page.locator('.tab-content h2')).toContainText('データ処理・追加');
    
    // Switch back to generate tab
    await page.click('.nav-tabs button:has-text("データ生成")');
    await expect(page.locator('.nav-tabs button.active')).toContainText('データ生成');
    await expect(page.locator('.tab-content h2')).toContainText('新規データセット作成');
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if mobile styles are applied
    await expect(page.locator('.App')).toBeVisible();
    await expect(page.locator('.App-header')).toBeVisible();
    await expect(page.locator('.nav-tabs')).toBeVisible();
    
    // Check if forms are still functional
    await page.fill('textarea#prompt', 'モバイルテスト');
    await expect(page.locator('textarea#prompt')).toHaveValue('モバイルテスト');
  });

  test('should display proper form elements', async ({ page }) => {
    await page.goto('/');
    
    // Check data generation form elements
    await expect(page.locator('label[for="prompt"]')).toContainText('プロンプト');
    await expect(page.locator('textarea#prompt')).toBeVisible();
    await expect(page.locator('label[for="count"]')).toContainText('生成数');
    await expect(page.locator('input#count')).toBeVisible();
    await expect(page.locator('label[for="format"]')).toContainText('出力形式');
    await expect(page.locator('select#format')).toBeVisible();
    
    // Check default values
    await expect(page.locator('input#count')).toHaveValue('10');
    await expect(page.locator('select#format')).toHaveValue('json');
    
    // Switch to processing tab
    await page.click('.nav-tabs button:has-text("データ処理")');
    
    // Check data processing form elements
    await expect(page.locator('input[type="file"]')).toBeVisible();
    await expect(page.locator('.file-upload-area')).toBeVisible();
    await expect(page.locator('.sample-button')).toContainText('サンプルデータをダウンロード');
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab navigation through form elements
    await page.keyboard.press('Tab');
    await expect(page.locator('textarea#prompt')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input#count')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('select#format')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();
  });

  test('should show loading states', async ({ page }) => {
    await page.goto('/');
    
    // Fill form
    await page.fill('textarea#prompt', '読み込みテスト');
    await page.fill('input#count', '1');
    
    // Submit and check loading state
    await page.click('button[type="submit"]');
    await expect(page.locator('button[type="submit"]')).toContainText('生成中...');
    await expect(page.locator('button[type="submit"]:disabled')).toBeVisible();
    
    // Wait for completion
    await expect(page.locator('button[type="submit"]')).not.toContainText('生成中...');
    await expect(page.locator('button[type="submit"]:not(:disabled)')).toBeVisible();
  });
});