import { TableRow, ProcessingConfig } from '../interfaces/types';

export class OutputFormatter {
  static async formatToJson(data: TableRow[]): Promise<string> {
    return JSON.stringify(data, null, 2);
  }

  static async formatToCsv(data: TableRow[]): Promise<string> {
    if (data.length === 0) return '';

    const headers = ['id', 'content', 'embeddings', 'processed_at', 'metadata'];
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const csvRow = [
        this.escapeCsvField(row.id),
        this.escapeCsvField(row.content),
        this.escapeCsvField(JSON.stringify(row.embeddings)),
        this.escapeCsvField(row.processed_at.toISOString()),
        this.escapeCsvField(JSON.stringify(row.metadata))
      ];
      csvRows.push(csvRow.join(','));
    }

    return csvRows.join('\n');
  }

  static async formatData(data: TableRow[], config: ProcessingConfig): Promise<string> {
    switch (config.output_format) {
      case 'json':
        return this.formatToJson(data);
      case 'csv':
        return this.formatToCsv(data);
      case 'parquet':
        throw new Error('Parquet format not implemented yet');
      default:
        return this.formatToJson(data);
    }
  }

  private static escapeCsvField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }
}