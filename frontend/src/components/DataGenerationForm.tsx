import React, { useState, useRef } from 'react';
import axios from 'axios';
import { APIResponse, GeneratedDataItem } from '../types/api';

interface DataGenerationFormProps {
  onDataGenerated: (data: any) => void;
}

const DataGenerationForm: React.FC<DataGenerationFormProps> = ({ onDataGenerated }) => {
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedData, setUploadedData] = useState<any[] | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setError(null);
    
    try {
      const fileContent = await file.text();
      const data = JSON.parse(fileContent);
      
      if (!Array.isArray(data)) {
        setError('ファイルは配列形式のJSONである必要があります');
        return;
      }
      
      setUploadedData(data);
    } catch (err) {
      setError('JSONファイルの解析に失敗しました');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadedData) {
      setError('まずファイルをアップロードしてください');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<APIResponse<GeneratedDataItem[]>>('http://localhost:3001/api/process-data', {
        inputData: uploadedData,
        config: { output_format: format }
      });

      const data = response.data as APIResponse<GeneratedDataItem[]>;
      if (data.success) {
        onDataGenerated(data);
      } else {
        setError('データ処理に失敗しました');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'データ処理に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        handleFileUpload(file);
      } else {
        setError('JSONファイルのみアップロード可能です');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="form-container">
      <div className="upload-section">
        <div 
          className={`file-upload-area ${dragOver ? 'drag-over' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          
          <div className="upload-message">
            <div className="upload-icon">📁</div>
            <p>新規データセット用のJSONファイルをアップロード</p>
            <small>rawデータをベクトルサーチ用に整形します</small>
          </div>
        </div>
        
        {uploadedData && (
          <div className="upload-success">
            ✅ {uploadedData.length}件のデータを読み込みました
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="data-form">
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

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading || !uploadedData}>
          {loading ? '処理中...' : 'データセット作成'}
        </button>
      </form>
    </div>
  );
};

export default DataGenerationForm;