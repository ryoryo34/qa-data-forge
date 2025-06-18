import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  test('should return health status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('OK');
    expect(data.timestamp).toBeDefined();
  });

  test('should generate data via API', async ({ request }) => {
    const response = await request.post('/api/generate-data', {
      data: {
        prompt: 'テスト用のQAデータ',
        count: 3,
        config: {
          output_format: 'json'
        }
      }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(3);
    expect(data.format).toBe('json');
    
    // Check data structure
    const firstItem = data.data[0];
    expect(firstItem.id).toBeDefined();
    expect(firstItem.content).toBeDefined();
    expect(firstItem.metadata).toBeDefined();
    expect(firstItem.embeddings).toBeDefined();
    expect(firstItem.processed_at).toBeDefined();
  });

  test('should process data via API', async ({ request }) => {
    const inputData = [
      {
        content: "What is artificial intelligence?",
        metadata: {
          topic: "AI",
          difficulty: "beginner"
        }
      }
    ];
    
    const response = await request.post('/api/process-data', {
      data: {
        inputData,
        config: {
          output_format: 'json',
          normalize_embeddings: true
        }
      }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.format).toBe('json');
    
    // Check processed data
    const processedItem = data.data[0];
    expect(processedItem.content).toBe('what is artificial intelligence?'); // normalized
    expect(processedItem.embeddings).toHaveLength(384);
    expect(processedItem.processed_at).toBeDefined();
  });

  test('should handle API errors gracefully', async ({ request }) => {
    // Test missing prompt
    const response1 = await request.post('/api/generate-data', {
      data: {
        count: 5
        // missing prompt
      }
    });
    
    expect(response1.status()).toBe(400);
    const error1 = await response1.json();
    expect(error1.error).toContain('Prompt and count are required');
    
    // Test invalid input data
    const response2 = await request.post('/api/process-data', {
      data: {
        inputData: "not an array"
      }
    });
    
    expect(response2.status()).toBe(400);
    const error2 = await response2.json();
    expect(error2.error).toContain('must be an array');
  });

  test('should handle file upload via API', async ({ request }) => {
    const testData = [
      {
        content: "Test content",
        metadata: { topic: "test" }
      }
    ];
    
    const response = await request.post('/api/upload', {
      multipart: {
        file: {
          name: 'test.json',
          mimeType: 'application/json',
          buffer: Buffer.from(JSON.stringify(testData))
        }
      }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.message).toContain('Successfully uploaded 1 items');
  });
});