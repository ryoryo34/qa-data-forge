import { QADataForge } from '../src/index';
import { InputData } from '../src/interfaces/types';

describe('QADataForge', () => {
  let forge: QADataForge;

  beforeEach(() => {
    forge = new QADataForge();
  });

  describe('generateMockData', () => {
    it('should generate mock data with specified count', async () => {
      const prompt = 'Generate data about machine learning';
      const count = 5;
      
      const result = await forge.generateMockData(prompt, count);
      
      expect(result).toHaveLength(count);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('content');
      expect(result[0]).toHaveProperty('metadata');
      expect(result[0]).toHaveProperty('embeddings');
    });
  });

  describe('processData', () => {
    it('should process input data and return table rows', async () => {
      const inputData: InputData[] = [
        {
          id: 'test-1',
          content: 'What is machine learning?',
          metadata: { topic: 'AI' }
        }
      ];

      const result = await forge.processData(inputData);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id', 'test-1');
      expect(result[0]).toHaveProperty('content', 'what is machine learning?');
      expect(result[0]).toHaveProperty('embeddings');
      expect(result[0]).toHaveProperty('processed_at');
      expect(result[0].embeddings).toHaveLength(384);
    });

    it('should handle data without embeddings', async () => {
      const inputData: InputData[] = [
        {
          content: 'Test content without embeddings'
        }
      ];

      const result = await forge.processData(inputData);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('embeddings');
      expect(result[0].embeddings).toHaveLength(384);
    });
  });

  describe('createNewDataset', () => {
    it('should create formatted dataset from prompt', async () => {
      const prompt = 'AI questions';
      const count = 3;

      const result = await forge.createNewDataset(prompt, count);
      
      expect(typeof result).toBe('string');
      const parsed = JSON.parse(result);
      expect(parsed).toHaveLength(count);
    });
  });
});