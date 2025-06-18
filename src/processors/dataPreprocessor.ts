import { InputData } from '../interfaces/types';

export class DataPreprocessor {
  static normalizeText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  static normalizeEmbeddings(embeddings: number[]): number[] {
    const magnitude = Math.sqrt(embeddings.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) return embeddings;
    return embeddings.map(val => val / magnitude);
  }

  static generateId(content: string, index?: number): string {
    const hash = this.simpleHash(content);
    const suffix = index !== undefined ? `-${index}` : '';
    return `${hash}${suffix}`;
  }

  static cleanMetadata(metadata: Record<string, any>): Record<string, any> {
    const cleaned: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(metadata)) {
      if (value !== null && value !== undefined && value !== '') {
        cleaned[key] = value;
      }
    }
    
    return cleaned;
  }

  static preprocessInputData(data: InputData[], config?: { 
    normalizeText?: boolean;
    normalizeEmbeddings?: boolean;
    generateMissingIds?: boolean;
  }): InputData[] {
    const { 
      normalizeText = true, 
      normalizeEmbeddings = false, 
      generateMissingIds = true 
    } = config || {};

    return data.map((item, index) => {
      const processed: InputData = { ...item };

      if (normalizeText && processed.content) {
        processed.content = this.normalizeText(processed.content);
      }

      if (normalizeEmbeddings && processed.embeddings) {
        processed.embeddings = this.normalizeEmbeddings(processed.embeddings);
      }

      if (generateMissingIds && !processed.id) {
        processed.id = this.generateId(processed.content, index);
      }

      if (processed.metadata) {
        processed.metadata = this.cleanMetadata(processed.metadata);
      }

      return processed;
    });
  }

  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}