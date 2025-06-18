import { InputData, DataAgent } from '../interfaces/types';

export class MockDataAgent implements DataAgent {
  private readonly sampleTopics = [
    'machine learning',
    'artificial intelligence', 
    'data science',
    'software engineering',
    'web development',
    'database design',
    'cloud computing',
    'cybersecurity',
    'mobile development',
    'DevOps'
  ];

  private readonly sampleQuestions = [
    'What is {topic}?',
    'How does {topic} work?',
    'What are the benefits of {topic}?',
    'What are the best practices for {topic}?',
    'How to get started with {topic}?',
    'What are common challenges in {topic}?',
    'What tools are used for {topic}?',
    'How to learn {topic} effectively?'
  ];

  async generateData(prompt: string, count: number): Promise<InputData[]> {
    console.log(`Generating ${count} mock data items based on prompt: "${prompt}"`);
    
    const data: InputData[] = [];
    
    for (let i = 0; i < count; i++) {
      const topic = this.getRandomItem(this.sampleTopics);
      const questionTemplate = this.getRandomItem(this.sampleQuestions);
      const content = questionTemplate.replace('{topic}', topic);
      
      const mockData: InputData = {
        id: `mock-${Date.now()}-${i}`,
        content: content,
        metadata: {
          topic: topic,
          generated_at: new Date().toISOString(),
          prompt: prompt,
          mock_index: i,
          difficulty: this.getRandomItem(['beginner', 'intermediate', 'advanced']),
          category: this.categorizeContent(content)
        },
        embeddings: this.generateMockEmbeddings(content)
      };
      
      data.push(mockData);
    }
    
    return data;
  }

  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private generateMockEmbeddings(content: string): number[] {
    const embeddings: number[] = [];
    const words = content.toLowerCase().split(/\s+/);
    
    for (let i = 0; i < 384; i++) {
      const wordIndex = i % words.length;
      const word = words[wordIndex];
      const hash = this.stringHash(word + i.toString());
      embeddings.push((hash % 2000 - 1000) / 1000);
    }
    
    return this.normalizeEmbeddings(embeddings);
  }

  private stringHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private normalizeEmbeddings(embeddings: number[]): number[] {
    const magnitude = Math.sqrt(embeddings.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) return embeddings;
    return embeddings.map(val => val / magnitude);
  }

  private categorizeContent(content: string): string {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('what is') || lowerContent.includes('what are')) {
      return 'definition';
    } else if (lowerContent.includes('how to') || lowerContent.includes('how does')) {
      return 'instruction';
    } else if (lowerContent.includes('best practices') || lowerContent.includes('benefits')) {
      return 'guidance';
    } else {
      return 'general';
    }
  }
}