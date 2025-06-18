import React, { useState } from 'react';

interface DataDisplayProps {
  data: {
    data: any[];
    format: string;
    formatted?: string;
  };
}

const DataDisplay: React.FC<DataDisplayProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'table' | 'json' | 'formatted'>('table');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const downloadData = () => {
    const content = data.formatted || JSON.stringify(data.data, null, 2);
    const extension = data.format === 'csv' ? 'csv' : 'json';
    const mimeType = data.format === 'csv' ? 'text/csv' : 'application/json';
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qa-data-forge-export.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderTableView = () => (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>コンテンツ</th>
            <th>メタデータ</th>
            <th>埋め込み次元</th>
            <th>処理日時</th>
            <th>詳細</th>
          </tr>
        </thead>
        <tbody>
          {data.data.map((item, index) => (
            <tr key={item.id || index}>
              <td>{item.id || `item-${index}`}</td>
              <td className="content-cell" title={item.content}>
                {item.content?.substring(0, 50)}
                {item.content?.length > 50 && '...'}
              </td>
              <td>
                {item.metadata && Object.keys(item.metadata).length > 0 
                  ? `${Object.keys(item.metadata).length}個のフィールド`
                  : '---'
                }
              </td>
              <td>{item.embeddings?.length || '---'}</td>
              <td>
                {item.processed_at 
                  ? new Date(item.processed_at).toLocaleString('ja-JP')
                  : '---'
                }
              </td>
              <td>
                <button 
                  className="detail-button"
                  onClick={() => setSelectedItem(item)}
                >
                  詳細
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderJsonView = () => (
    <pre className="json-view">
      {JSON.stringify(data.data, null, 2)}
    </pre>
  );

  const renderFormattedView = () => (
    <pre className="formatted-view">
      {data.formatted || JSON.stringify(data.data, null, 2)}
    </pre>
  );

  return (
    <div className="data-display">
      <div className="display-header">
        <h3>処理結果 ({data.data.length}件)</h3>
        <div className="display-controls">
          <div className="view-mode-buttons">
            <button 
              className={viewMode === 'table' ? 'active' : ''}
              onClick={() => setViewMode('table')}
            >
              テーブル
            </button>
            <button 
              className={viewMode === 'json' ? 'active' : ''}
              onClick={() => setViewMode('json')}
            >
              JSON
            </button>
            <button 
              className={viewMode === 'formatted' ? 'active' : ''}
              onClick={() => setViewMode('formatted')}
            >
              フォーマット済み
            </button>
          </div>
          <button className="download-button" onClick={downloadData}>
            ダウンロード ({data.format.toUpperCase()})
          </button>
        </div>
      </div>

      <div className="display-content">
        {viewMode === 'table' && renderTableView()}
        {viewMode === 'json' && renderJsonView()}
        {viewMode === 'formatted' && renderFormattedView()}
      </div>

      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>詳細情報</h4>
              <button 
                className="modal-close"
                onClick={() => setSelectedItem(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h5>ID:</h5>
                <p>{selectedItem.id || '未設定'}</p>
              </div>
              <div className="detail-section">
                <h5>コンテンツ:</h5>
                <p>{selectedItem.content}</p>
              </div>
              <div className="detail-section">
                <h5>メタデータ:</h5>
                <pre>{JSON.stringify(selectedItem.metadata || {}, null, 2)}</pre>
              </div>
              <div className="detail-section">
                <h5>埋め込みベクトル:</h5>
                <p>
                  次元: {selectedItem.embeddings?.length || 0}
                  {selectedItem.embeddings && (
                    <details>
                      <summary>ベクトル値を表示</summary>
                      <pre className="embeddings-display">
                        {JSON.stringify(selectedItem.embeddings, null, 2)}
                      </pre>
                    </details>
                  )}
                </p>
              </div>
              {selectedItem.processed_at && (
                <div className="detail-section">
                  <h5>処理日時:</h5>
                  <p>{new Date(selectedItem.processed_at).toLocaleString('ja-JP')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataDisplay;