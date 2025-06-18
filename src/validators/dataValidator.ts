import { 
  InputData, 
  DataValidator, 
  ValidationResult, 
  ValidationError, 
  ValidationWarning,
  InputDataSchema
} from '../interfaces/types';

export class StandardDataValidator implements DataValidator {
  async validate(data: InputData[]): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      
      try {
        InputDataSchema.parse(item);
      } catch (zodError: any) {
        const issues = zodError.issues || [];
        for (const issue of issues) {
          errors.push({
            index: i,
            field: issue.path.join('.'),
            message: issue.message
          });
        }
      }

      if (item.content && item.content.trim().length === 0) {
        warnings.push({
          index: i,
          field: 'content',
          message: 'Content is empty or contains only whitespace'
        });
      }

      if (item.embeddings && item.embeddings.length === 0) {
        warnings.push({
          index: i,
          field: 'embeddings',
          message: 'Embeddings array is empty'
        });
      }

      if (item.embeddings && item.embeddings.some(val => !Number.isFinite(val))) {
        errors.push({
          index: i,
          field: 'embeddings',
          message: 'Embeddings contain non-finite values'
        });
      }
    }

    const duplicateIds = this.findDuplicateIds(data);
    for (const duplicateId of duplicateIds) {
      errors.push({
        index: -1,
        field: 'id',
        message: `Duplicate ID found: ${duplicateId}`
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private findDuplicateIds(data: InputData[]): string[] {
    const idCounts = new Map<string, number>();
    const duplicates: string[] = [];

    for (const item of data) {
      if (item.id) {
        const count = idCounts.get(item.id) || 0;
        idCounts.set(item.id, count + 1);
        
        if (count === 1) {
          duplicates.push(item.id);
        }
      }
    }

    return duplicates;
  }
}