import { 
  TableRow, 
  ConsistencyChecker, 
  ConsistencyResult, 
  ConsistencyConflict 
} from '../interfaces/types';

export class StandardConsistencyChecker implements ConsistencyChecker {
  async checkConsistency(newData: TableRow[], existingData: TableRow[]): Promise<ConsistencyResult> {
    const conflicts: ConsistencyConflict[] = [];
    const recommendations: string[] = [];

    const duplicateIdConflicts = this.checkDuplicateIds(newData, existingData);
    conflicts.push(...duplicateIdConflicts);

    const schemaConflicts = this.checkSchemaConsistency(newData, existingData);
    conflicts.push(...schemaConflicts);

    const typeConflicts = this.checkTypeConsistency(newData, existingData);
    conflicts.push(...typeConflicts);

    const embeddingDimensionConflicts = this.checkEmbeddingDimensions(newData, existingData);
    conflicts.push(...embeddingDimensionConflicts);

    if (conflicts.length > 0) {
      recommendations.push(...this.generateRecommendations(conflicts));
    }

    return {
      isConsistent: conflicts.length === 0,
      conflicts,
      recommendations
    };
  }

  private checkDuplicateIds(newData: TableRow[], existingData: TableRow[]): ConsistencyConflict[] {
    const conflicts: ConsistencyConflict[] = [];
    const existingIds = new Set(existingData.map(row => row.id));

    for (const newRow of newData) {
      if (existingIds.has(newRow.id)) {
        const existingRow = existingData.find(row => row.id === newRow.id);
        if (existingRow && existingRow.content !== newRow.content) {
          conflicts.push({
            field: 'id',
            existing_value: existingRow.content,
            new_value: newRow.content,
            conflict_type: 'duplicate_id'
          });
        }
      }
    }

    return conflicts;
  }

  private checkSchemaConsistency(newData: TableRow[], existingData: TableRow[]): ConsistencyConflict[] {
    const conflicts: ConsistencyConflict[] = [];
    
    if (existingData.length === 0) return conflicts;

    const existingMetadataKeys = new Set<string>();
    existingData.forEach(row => {
      Object.keys(row.metadata).forEach(key => existingMetadataKeys.add(key));
    });

    for (const newRow of newData) {
      const newMetadataKeys = new Set(Object.keys(newRow.metadata));
      
      const missingKeys = [...existingMetadataKeys].filter(key => !newMetadataKeys.has(key));
      const extraKeys = [...newMetadataKeys].filter(key => !existingMetadataKeys.has(key));

      if (missingKeys.length > 0 || extraKeys.length > 0) {
        conflicts.push({
          field: 'metadata_schema',
          existing_value: [...existingMetadataKeys],
          new_value: [...newMetadataKeys],
          conflict_type: 'schema_mismatch'
        });
      }
    }

    return conflicts;
  }

  private checkTypeConsistency(newData: TableRow[], existingData: TableRow[]): ConsistencyConflict[] {
    const conflicts: ConsistencyConflict[] = [];
    
    if (existingData.length === 0) return conflicts;

    const existingMetadataTypes = this.getMetadataTypes(existingData[0]);

    for (const newRow of newData) {
      for (const [key, value] of Object.entries(newRow.metadata)) {
        const newType = typeof value;
        const existingType = existingMetadataTypes[key];
        
        if (existingType && existingType !== newType) {
          conflicts.push({
            field: `metadata.${key}`,
            existing_value: existingType,
            new_value: newType,
            conflict_type: 'type_conflict'
          });
        }
      }
    }

    return conflicts;
  }

  private checkEmbeddingDimensions(newData: TableRow[], existingData: TableRow[]): ConsistencyConflict[] {
    const conflicts: ConsistencyConflict[] = [];
    
    if (existingData.length === 0) return conflicts;

    const expectedDimension = existingData[0].embeddings.length;

    for (const newRow of newData) {
      if (newRow.embeddings.length !== expectedDimension) {
        conflicts.push({
          field: 'embeddings_dimension',
          existing_value: expectedDimension,
          new_value: newRow.embeddings.length,
          conflict_type: 'schema_mismatch'
        });
      }
    }

    return conflicts;
  }

  private getMetadataTypes(row: TableRow): Record<string, string> {
    const types: Record<string, string> = {};
    for (const [key, value] of Object.entries(row.metadata)) {
      types[key] = typeof value;
    }
    return types;
  }

  private generateRecommendations(conflicts: ConsistencyConflict[]): string[] {
    const recommendations: string[] = [];
    
    const duplicateIds = conflicts.filter(c => c.conflict_type === 'duplicate_id');
    if (duplicateIds.length > 0) {
      recommendations.push('Consider updating existing records instead of creating duplicates');
      recommendations.push('Review ID generation strategy to avoid conflicts');
    }

    const schemaConflicts = conflicts.filter(c => c.conflict_type === 'schema_mismatch');
    if (schemaConflicts.length > 0) {
      recommendations.push('Standardize metadata schema across all records');
      recommendations.push('Consider migration strategy for schema changes');
    }

    const typeConflicts = conflicts.filter(c => c.conflict_type === 'type_conflict');
    if (typeConflicts.length > 0) {
      recommendations.push('Ensure consistent data types for metadata fields');
      recommendations.push('Implement type validation before data ingestion');
    }

    return recommendations;
  }
}