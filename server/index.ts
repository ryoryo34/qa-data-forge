import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { QADataForge } from '../src/index';
import { InputData, TableRow, ProcessingConfig } from '../src/interfaces/types';

const app = express();
const port = process.env.PORT || 3001;
const forge = new QADataForge();

app.use(cors());
app.use(express.json());
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});


app.post('/api/process-data', async (req, res) => {
  try {
    const { inputData, config, existingData } = req.body;
    
    if (!inputData || !Array.isArray(inputData)) {
      return res.status(400).json({ error: 'Input data is required and must be an array' });
    }

    const processedData = await forge.processData(inputData, config, existingData);
    const formattedResult = await forge.processAndFormat(inputData, config, existingData);
    
    res.json({ 
      success: true, 
      data: processedData,
      formatted: formattedResult,
      format: config?.output_format || 'json'
    });
  } catch (error: any) {
    console.error('Error processing data:', error);
    res.status(500).json({ error: error.message || 'Failed to process data' });
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileContent = req.file.buffer.toString('utf-8');
    let data: InputData[];
    
    try {
      data = JSON.parse(fileContent);
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid JSON file' });
    }

    if (!Array.isArray(data)) {
      return res.status(400).json({ error: 'File must contain an array of data' });
    }

    res.json({ 
      success: true, 
      data,
      message: `Successfully uploaded ${data.length} items`
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'QA Data Forge API Server',
    endpoints: [
      'POST /api/process-data', 
      'POST /api/upload',
      'GET /api/health'
    ]
  });
});

app.listen(port, () => {
  console.log(`QA Data Forge server running on port ${port}`);
  console.log(`API endpoints available at http://localhost:${port}/api`);
});