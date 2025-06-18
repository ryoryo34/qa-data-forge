import React, { useState } from 'react';
import axios from 'axios';
import { APIResponse, ProcessedDataResponse } from '../types/api';

interface DataProcessingFormProps {
  uploadedData: any[] | null;
  onDataProcessed: (data: any) => void;
}

const DataProcessingForm: React.FC<DataProcessingFormProps> = ({ 
  uploadedData, 
  onDataProcessed 
}) => {
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [normalizeEmbeddings, setNormalizeEmbeddings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingDataFile, setExistingDataFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadedData || uploadedData.length === 0) {
      setError('処理するデータがありません。まずファイルをアップロードしてください。');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let existingData = null;
      
      if (existingDataFile) {
        const existingFileContent = await existingDataFile.text();
        existingData = JSON.parse(existingFileContent);
      }

      const response = await axios.post<APIResponse<ProcessedDataResponse>>('http://localhost:3001/api/process-data', {
        inputData: uploadedData,
        config: { 
          output_format: format,
          normalize_embeddings: normalizeEmbeddings
        },
        existingData
      });

      const data = response.data as APIResponse<ProcessedDataResponse>;
      if (data.success) {
        onDataProcessed(data);
      } else {
        setError('データ処理に失敗しました');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'データ処理に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleExistingDataFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setExistingDataFile(file || null);
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="data-form">
        <div className="upload-status">
          {uploadedData ? (
            <div className="success-message">
              ✓ {uploadedData.length}件のデータがアップロードされました
            </div>
          ) : (
            <div className="info-message">
              処理するデータをアップロードしてください
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="existing-data">既存データファイル（任意）:</label>
          <input
            type="file"
            id="existing-data"
            accept=".json"
            onChange={handleExistingDataFileChange}
          />
          <small>既存データとの整合性チェックを行う場合にアップロードしてください</small>
        </div>

        <div className="form-group">
          <label htmlFor="format">出力形式:</label>
          <select
            id="format"
            value={format}
            onChange={(e) => setFormat(e.target.value as 'json' | 'csv')}
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={normalizeEmbeddings}
              onChange={(e) => setNormalizeEmbeddings(e.target.checked)}
            />
            埋め込みベクトルを正規化
          </label>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading || !uploadedData}>
          {loading ? '処理中...' : 'データ処理'}
        </button>
      </form>
    </div>
  );
};

export default DataProcessingForm;