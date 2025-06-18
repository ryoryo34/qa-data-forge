import React, { useState } from 'react';
import './App.css';
import DataGenerationForm from './components/DataGenerationForm';
import DataProcessingForm from './components/DataProcessingForm';
import DataDisplay from './components/DataDisplay';
import FileUpload from './components/FileUpload';

interface AppData {
  data: any[];
  format: string;
  formatted?: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<'generate' | 'process'>('generate');
  const [appData, setAppData] = useState<AppData | null>(null);
  const [uploadedData, setUploadedData] = useState<any[] | null>(null);

  return (
    <div className="App">
      <header className="App-header">
        <h1>QA Data Forge</h1>
        <p>ベクトル検索用データ処理パイプライン</p>
      </header>

      <nav className="nav-tabs">
        <button 
          className={activeTab === 'generate' ? 'active' : ''}
          onClick={() => setActiveTab('generate')}
        >
          データ生成
        </button>
        <button 
          className={activeTab === 'process' ? 'active' : ''}
          onClick={() => setActiveTab('process')}
        >
          データ処理
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'generate' && (
          <div className="tab-content">
            <h2>新規データセット作成</h2>
            <DataGenerationForm onDataGenerated={setAppData} />
          </div>
        )}

        {activeTab === 'process' && (
          <div className="tab-content">
            <h2>データ処理・追加</h2>
            <FileUpload onDataUploaded={setUploadedData} />
            <DataProcessingForm 
              uploadedData={uploadedData}
              onDataProcessed={setAppData} 
            />
          </div>
        )}

        {appData && (
          <div className="results-section">
            <DataDisplay data={appData} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
