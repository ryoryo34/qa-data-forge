import { 
  InputData, 
  TableRow, 
  ProcessingConfig, 
  DataProcessor,
  DataValidator,
  DataTransformer,
  ConsistencyChecker,
  ValidationResult,
  ConsistencyResult
} from '../interfaces/types';

export class DataProcessingPipeline implements DataProcessor {
  constructor(
    private validator: DataValidator,
    private transformer: DataTransformer,
    private consistencyChecker?: ConsistencyChecker,
    private existingData?: TableRow[]
  ) {}

  async process(data: InputData[], config?: ProcessingConfig): Promise<TableRow[]> {
    const validationResult = await this.validateData(data);
    if (!validationResult.isValid) {
      throw new Error(`Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
    }

    const transformedData = await this.transformer.transform(data);

    if (this.consistencyChecker && this.existingData) {
      const consistencyResult = await this.checkConsistency(transformedData);
      if (!consistencyResult.isConsistent) {
        console.warn('Consistency warnings:', consistencyResult.conflicts);
      }
    }

    return transformedData;
  }

  private async validateData(data: InputData[]): Promise<ValidationResult> {
    return this.validator.validate(data);
  }

  private async checkConsistency(newData: TableRow[]): Promise<ConsistencyResult> {
    if (!this.consistencyChecker || !this.existingData) {
      return { isConsistent: true, conflicts: [], recommendations: [] };
    }
    return this.consistencyChecker.checkConsistency(newData, this.existingData);
  }

  setExistingData(existingData: TableRow[]): void {
    this.existingData = existingData;
  }
}