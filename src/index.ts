import { DataProcessingPipeline } from './core/pipeline';
import { StandardDataValidator } from './validators/dataValidator';
import { StandardDataTransformer } from './processors/dataTransformer';
import { StandardConsistencyChecker } from './validators/consistencyChecker';
import { MockDataAgent } from './agents/mockDataAgent';
import { OutputFormatter } from './utils/outputFormatter';
import { 
  InputData, 
  TableRow, 
  ProcessingConfig,
  ProcessingConfigSchema 
} from './interfaces/types';

export class QADataForge {
  private pipeline: DataProcessingPipeline;
  private dataAgent: MockDataAgent;

  constructor() {
    const validator = new StandardDataValidator();
    const transformer = new StandardDataTransformer();
    const consistencyChecker = new StandardConsistencyChecker();
    
    this.pipeline = new DataProcessingPipeline(
      validator,
      transformer,
      consistencyChecker
    );
    
    this.dataAgent = new MockDataAgent();
  }

  async processData(
    inputData: InputData[], 
    config?: Partial<ProcessingConfig>,
    existingData?: TableRow[]
  ): Promise<TableRow[]> {
    const validatedConfig = ProcessingConfigSchema.parse(config || {});
    
    if (existingData) {
      this.pipeline.setExistingData(existingData);
    }

    return this.pipeline.process(inputData, validatedConfig);
  }

  async generateMockData(prompt: string, count: number): Promise<InputData[]> {
    return this.dataAgent.generateData(prompt, count);
  }

  async processAndFormat(
    inputData: InputData[],
    config?: Partial<ProcessingConfig>,
    existingData?: TableRow[]
  ): Promise<string> {
    const validatedConfig = ProcessingConfigSchema.parse(config || {});
    const processedData = await this.processData(inputData, validatedConfig, existingData);
    return OutputFormatter.formatData(processedData, validatedConfig);
  }

  async createNewDataset(prompt: string, count: number, config?: Partial<ProcessingConfig>): Promise<string> {
    const mockData = await this.generateMockData(prompt, count);
    return this.processAndFormat(mockData, config);
  }

  async addToExistingDataset(
    newInputData: InputData[],
    existingData: TableRow[],
    config?: Partial<ProcessingConfig>
  ): Promise<string> {
    return this.processAndFormat(newInputData, config, existingData);
  }
}

export * from './interfaces/types';
export { StandardDataValidator } from './validators/dataValidator';
export { StandardDataTransformer } from './processors/dataTransformer';
export { StandardConsistencyChecker } from './validators/consistencyChecker';
export { MockDataAgent } from './agents/mockDataAgent';
export { DataProcessingPipeline } from './core/pipeline';
export { OutputFormatter } from './utils/outputFormatter';
export { DataPreprocessor } from './processors/dataPreprocessor';