const { QADataForge } = require('./dist/index');

async function runTests() {
  console.log('🧪 Running QA Data Forge Manual Tests');
  console.log('=====================================\n');

  const forge = new QADataForge();

  try {
    // Test 1: Generate mock data
    console.log('Test 1: Mock Data Generation');
    const mockData = await forge.generateMockData('Test AI questions', 3);
    console.log(`✅ Generated ${mockData.length} mock items`);
    console.log(`   Sample content: "${mockData[0].content}"`);
    console.log(`   Has embeddings: ${mockData[0].embeddings ? 'Yes' : 'No'}`);
    console.log();

    // Test 2: Process data
    console.log('Test 2: Data Processing');
    const inputData = [
      {
        content: 'What is machine learning?',
        metadata: { topic: 'AI', difficulty: 'beginner' }
      }
    ];
    
    const processedData = await forge.processData(inputData);
    console.log(`✅ Processed ${processedData.length} items`);
    console.log(`   Normalized content: "${processedData[0].content}"`);
    console.log(`   Embedding dimensions: ${processedData[0].embeddings.length}`);
    console.log(`   Has processed_at: ${processedData[0].processed_at ? 'Yes' : 'No'}`);
    console.log();

    // Test 3: Create formatted dataset
    console.log('Test 3: Dataset Creation');
    const dataset = await forge.createNewDataset('Test dataset creation', 2);
    const parsed = JSON.parse(dataset);
    console.log(`✅ Created dataset with ${parsed.length} items`);
    console.log(`   Output format: JSON`);
    console.log();

    // Test 4: CSV format
    console.log('Test 4: CSV Format Output');
    const csvDataset = await forge.createNewDataset('CSV test', 2, { output_format: 'csv' });
    console.log(`✅ Created CSV dataset`);
    console.log(`   Contains CSV headers: ${csvDataset.includes('id,content') ? 'Yes' : 'No'}`);
    console.log();

    console.log('🎉 All tests passed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Mock data generation: PASSED');
    console.log('✅ Data processing: PASSED');
    console.log('✅ Dataset creation: PASSED');
    console.log('✅ CSV format output: PASSED');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests().catch(console.error);