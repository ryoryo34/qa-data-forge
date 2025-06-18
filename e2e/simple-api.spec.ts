import { test, expect } from '@playwright/test';

test.describe('QA Data Forge API Tests', () => {
  test('API health check should work', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('OK');
    expect(data.timestamp).toBeDefined();
    
    console.log('✅ Health check passed');
  });

  test('Data generation API should work', async ({ request }) => {
    const response = await request.post('http://localhost:3001/api/generate-data', {
      data: {
        prompt: 'テスト用のQAデータを生成',
        count: 2,
        config: {
          output_format: 'json'
        }
      }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.format).toBe('json');
    
    // Check data structure
    const firstItem = data.data[0];
    expect(firstItem.id).toBeDefined();
    expect(firstItem.content).toBeDefined();
    expect(firstItem.metadata).toBeDefined();
    expect(firstItem.embeddings).toBeDefined();
    expect(firstItem.processed_at).toBeDefined();
    
    console.log('✅ Data generation API test passed');
    console.log(`Generated ${data.data.length} items`);
  });

  test('Data processing API should work', async ({ request }) => {
    const inputData = [
      {
        content: "What is machine learning?",
        metadata: {
          topic: "AI",
          difficulty: "beginner"
        }
      }
    ];
    
    const response = await request.post('http://localhost:3001/api/process-data', {
      data: {
        inputData,
        config: {
          output_format: 'json',
          normalize_embeddings: false
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
    expect(processedItem.content).toBe('what is machine learning?'); // normalized
    expect(processedItem.embeddings).toHaveLength(384);
    expect(processedItem.processed_at).toBeDefined();
    expect(processedItem.metadata.topic).toBe('AI');
    
    console.log('✅ Data processing API test passed');
    console.log(`Processed item content: "${processedItem.content}"`);
  });

  test('File upload API should work', async ({ request }) => {
    const testData = [
      {
        content: "Test question about AI",
        metadata: { 
          topic: "artificial intelligence",
          category: "test" 
        }
      }
    ];
    
    const response = await request.post('http://localhost:3001/api/upload', {
      multipart: {
        file: {
          name: 'test-upload.json',
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
    expect(data.data[0].content).toBe('Test question about AI');
    
    console.log('✅ File upload API test passed');
    console.log(`Upload result: ${data.message}`);
  });

  test('Error handling should work', async ({ request }) => {
    // Test missing prompt
    const response1 = await request.post('http://localhost:3001/api/generate-data', {
      data: {
        count: 5
        // missing prompt
      }
    });
    
    expect(response1.status()).toBe(400);
    const error1 = await response1.json();
    expect(error1.error).toContain('Prompt and count are required');
    
    // Test invalid input data
    const response2 = await request.post('http://localhost:3001/api/process-data', {
      data: {
        inputData: "not an array"
      }
    });
    
    expect(response2.status()).toBe(400);
    const error2 = await response2.json();
    expect(error2.error).toContain('must be an array');
    
    console.log('✅ Error handling tests passed');
  });
});