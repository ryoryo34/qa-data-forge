export interface APIResponse<T = any> {
  success: boolean;
  data: T;
  format?: string;
  formatted?: string;
  message?: string;
  error?: string;
}

export interface GeneratedDataItem {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embeddings: number[];
  processed_at: string;
}

export interface ProcessedDataResponse {
  data: GeneratedDataItem[];
  formatted: string;
  format: string;
}

export interface UploadResponse {
  data: any[];
  message: string;
}