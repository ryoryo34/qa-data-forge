import { test, expect } from '@playwright/test';

test.describe('Data Processing Flow', () => {
  test('should upload and process data successfully', async ({ page }) => {
    await page.goto('/');
    
    // Switch to data processing tab
    await page.click('.nav-tabs button:has-text("データ処理")');
    await expect(page.locator('.nav-tabs button.active')).toContainText('データ処理');
    
    // Check initial state
    await expect(page.locator('.info-message')).toContainText('処理するデータをアップロードしてください');
    
    // Create a test file content
    const testData = [
      {
        content: "What is machine learning?",
        metadata: {
          topic: "AI",
          difficulty: "beginner"
        }
      },
      {
        content: "How does neural network work?",
        metadata: {
          topic: "deep learning",
          difficulty: "intermediate"
        }
      }
    ];
    
    // Upload file using file input
    const fileContent = JSON.stringify(testData);
    const blob = new Blob([fileContent], { type: 'application/json' });
    const file = new File([blob], 'test-data.json', { type: 'application/json' });
    
    // Use page.setInputFiles to upload
    await page.setInputFiles('input[type="file"][accept=".json"]', {
      name: 'test-data.json',
      mimeType: 'application/json',
      buffer: Buffer.from(fileContent)
    });
    
    // Wait for upload to complete
    await expect(page.locator('.success-message')).toContainText('2件のデータがアップロードされました');
    
    // Configure processing options
    await page.selectOption('select#format', 'json');
    await page.check('input[type="checkbox"]'); // Enable embedding normalization
    
    // Submit processing
    await page.click('button[type="submit"]');
    await expect(page.locator('button[type="submit"]')).not.toContainText('処理中...');
    
    // Check results
    await expect(page.locator('.results-section')).toBeVisible();
    await expect(page.locator('.display-header h3')).toContainText('処理結果 (2件)');
    
    // Verify processed data has embeddings
    await page.click('.detail-button').first();
    await expect(page.locator('.modal-overlay')).toBeVisible();
    await expect(page.locator('.detail-section:has-text("埋め込みベクトル")')).toBeVisible();
    await expect(page.locator('.detail-section:has-text("次元: 384")')).toBeVisible();
    
    await page.click('.modal-close');
  });

  test('should download sample data', async ({ page }) => {
    await page.goto('/');
    
    // Switch to data processing tab
    await page.click('.nav-tabs button:has-text("データ処理")');
    
    // Start download listener before clicking
    const downloadPromise = page.waitForEvent('download');
    
    // Click sample download button
    await page.click('.sample-button');
    
    // Wait for download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('sample-input-data.json');
  });

  test('should show file format information', async ({ page }) => {
    await page.goto('/');
    
    // Switch to data processing tab
    await page.click('.nav-tabs button:has-text("データ処理")');
    
    // Check if format information is displayed
    await expect(page.locator('.upload-info h4')).toContainText('入力データ形式について');
    await expect(page.locator('.format-example')).toBeVisible();
    
    // Check format requirements
    await expect(page.locator('.upload-info li')).toContainText('content');
    await expect(page.locator('.upload-info li')).toContainText('metadata');
    await expect(page.locator('.upload-info li')).toContainText('id');
    await expect(page.locator('.upload-info li')).toContainText('embeddings');
  });

  test('should handle file upload errors', async ({ page }) => {
    await page.goto('/');
    
    // Switch to data processing tab
    await page.click('.nav-tabs button:has-text("データ処理")');
    
    // Try to upload invalid JSON
    const invalidContent = '{ invalid json content }';
    await page.setInputFiles('input[type="file"][accept=".json"]', {
      name: 'invalid.json',
      mimeType: 'application/json',
      buffer: Buffer.from(invalidContent)
    });
    
    // Should show error message
    await expect(page.locator('.error-message')).toContainText('Invalid JSON file');
  });
});