import React, { useState, useRef } from 'react';
import axios from 'axios';
import { APIResponse, UploadResponse } from '../types/api';

interface FileUploadProps {
  onDataUploaded: (data: any[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataUploaded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post<APIResponse<any[]>>('http://localhost:3001/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        onDataUploaded(response.data.data);
        setSuccess(response.data.message || 'ファイルがアップロードされました');
      } else {
        setError('ファイルのアップロードに失敗しました');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'ファイルのアップロードに失敗しました');
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

  const generateSampleData = () => {
    const sampleData = [
      {
        content: "What is artificial intelligence?",
        metadata: {
          topic: "AI",
          difficulty: "beginner",
          category: "definition"
        }
      },
      {
        content: "How does machine learning work?",
        metadata: {
          topic: "machine learning",
          difficulty: "intermediate",
          category: "instruction"
        }
      },
      {
        content: "What are the benefits of deep learning?",
        metadata: {
          topic: "deep learning",
          difficulty: "advanced",
          category: "guidance"
        }
      }
    ];

    const dataStr = JSON.stringify(sampleData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-input-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="file-upload-container">
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
        
        {loading ? (
          <div className="upload-message">
            📤 アップロード中...
          </div>
        ) : (
          <div className="upload-message">
            <div className="upload-icon">📁</div>
            <p>JSONファイルをドラッグ&ドロップするか、クリックして選択</p>
            <small>入力データ形式: InputData[]</small>
          </div>
        )}
      </div>

      <div className="upload-actions">
        <button 
          className="sample-button"
          onClick={generateSampleData}
          type="button"
        >
          サンプルデータをダウンロード
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="upload-info">
        <h4>入力データ形式について</h4>
        <pre className="format-example">
{`[
  {
    "content": "質問またはテキストコンテンツ",
    "metadata": {
      "topic": "トピック",
      "difficulty": "難易度"
    },
    "id": "一意のID（任意）",
    "embeddings": [数値配列]（任意）
  }
]`}
        </pre>
        <ul>
          <li><code>content</code>: 必須。処理対象のテキストコンテンツ</li>
          <li><code>metadata</code>: 任意。追加のメタデータ</li>
          <li><code>id</code>: 任意。指定されない場合は自動生成</li>
          <li><code>embeddings</code>: 任意。指定されない場合は自動生成</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;