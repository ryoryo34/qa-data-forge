import { 
  InputData, 
  TableRow, 
  DataTransformer,
  ProcessingConfig
} from '../interfaces/types';
import { DataPreprocessor } from './dataPreprocessor';

export class StandardDataTransformer implements DataTransformer {
  async transform(data: InputData[], config?: ProcessingConfig): Promise<TableRow[]> {
    const preprocessedData = DataPreprocessor.preprocessInputData(data, {
      normalizeText: true,
      normalizeEmbeddings: config?.normalize_embeddings || false,
      generateMissingIds: true
    });

    const transformedRows: TableRow[] = [];
    const currentTime = new Date();

    for (const item of preprocessedData) {
      if (!item.id) {
        throw new Error('ID is required for transformation');
      }

      const embeddings = item.embeddings || this.generateDefaultEmbeddings(item.content);
      
      const tableRow: TableRow = {
        id: item.id,
        content: item.content,
        metadata: item.metadata || {},
        embeddings,
        processed_at: currentTime
      };

      transformedRows.push(tableRow);
    }

    return transformedRows;
  }

  private generateDefaultEmbeddings(content: string): number[] {
    const words = content.toLowerCase().split(/\s+/);
    const embeddings = new Array(384).fill(0);
    
    for (let i = 0; i < words.length && i < embeddings.length; i++) {
      const word = words[i];
      const hash = this.stringHash(word);
      embeddings[i % embeddings.length] = (hash % 1000) / 1000 - 0.5;
    }
    
    return DataPreprocessor.normalizeEmbeddings(embeddings);
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
}