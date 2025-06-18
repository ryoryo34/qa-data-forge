import { z } from 'zod';

export const InputDataSchema = z.object({
  id: z.string().optional(),
  content: z.string(),
  metadata: z.record(z.any()).optional(),
  embeddings: z.array(z.number()).optional(),
});

export const TableRowSchema = z.object({
  id: z.string(),
  content: z.string(),
  metadata: z.record(z.any()),
  embeddings: z.array(z.number()),
  processed_at: z.date(),
});

export const ProcessingConfigSchema = z.object({
  output_format: z.enum(['json', 'csv', 'parquet']).default('json'),
  batch_size: z.number().min(1).default(100),
  enable_validation: z.boolean().default(true),
  normalize_embeddings: z.boolean().default(false),
});

export const DatasetMetadataSchema = z.object({
  name: z.string(),
  version: z.string(),
  schema_version: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
  total_records: z.number(),
});

export type InputData = z.infer<typeof InputDataSchema>;
export type TableRow = z.infer<typeof TableRowSchema>;
export type ProcessingConfig = z.infer<typeof ProcessingConfigSchema>;
export type DatasetMetadata = z.infer<typeof DatasetMetadataSchema>;

export interface DataProcessor {
  process(data: InputData[], config?: ProcessingConfig): Promise<TableRow[]>;
}

export interface DataValidator {
  validate(data: InputData[]): Promise<ValidationResult>;
}

export interface DataTransformer {
  transform(data: InputData[]): Promise<TableRow[]>;
}

export interface ConsistencyChecker {
  checkConsistency(newData: TableRow[], existingData: TableRow[]): Promise<ConsistencyResult>;
}

export interface DataAgent {
  generateData(prompt: string, count: number): Promise<InputData[]>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  index: number;
  field: string;
  message: string;
}

export interface ValidationWarning {
  index: number;
  field: string;
  message: string;
}

export interface ConsistencyResult {
  isConsistent: boolean;
  conflicts: ConsistencyConflict[];
  recommendations: string[];
}

export interface ConsistencyConflict {
  field: string;
  existing_value: any;
  new_value: any;
  conflict_type: 'schema_mismatch' | 'duplicate_id' | 'type_conflict';
}