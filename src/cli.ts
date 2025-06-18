#!/usr/bin/env node

import { QADataForge } from './index';
import { InputData, TableRow } from './interfaces/types';
import * as fs from 'fs';
import * as path from 'path';

interface CLIOptions {
  input?: string;
  output?: string;
  format?: 'json' | 'csv';
  count?: number;
  prompt?: string;
  existing?: string;
  mode?: 'create' | 'add';
}

class CLI {
  private forge: QADataForge;

  constructor() {
    this.forge = new QADataForge();
  }

  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const options = this.parseArgs(args);

    try {
      if (options.mode === 'create') {
        await this.handleCreateMode(options);
      } else if (options.mode === 'add') {
        await this.handleAddMode(options);
      } else {
        this.showHelp();
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  }

  private parseArgs(args: string[]): CLIOptions {
    const options: CLIOptions = {};
    
    for (let i = 0; i < args.length; i++) {
      switch (args[i]) {
        case '--input':
        case '-i':
          options.input = args[++i];
          break;
        case '--output':
        case '-o':
          options.output = args[++i];
          break;
        case '--format':
        case '-f':
          options.format = args[++i] as 'json' | 'csv';
          break;
        case '--count':
        case '-c':
          options.count = parseInt(args[++i]);
          break;
        case '--prompt':
        case '-p':
          options.prompt = args[++i];
          break;
        case '--existing':
        case '-e':
          options.existing = args[++i];
          break;
        case '--mode':
        case '-m':
          options.mode = args[++i] as 'create' | 'add';
          break;
        case '--help':
        case '-h':
          this.showHelp();
          process.exit(0);
          break;
      }
    }
    
    return options;
  }

  private async handleCreateMode(options: CLIOptions): Promise<void> {
    if (!options.prompt || !options.count) {
      throw new Error('Create mode requires --prompt and --count options');
    }

    console.log(`Creating new dataset with ${options.count} items...`);
    
    const result = await this.forge.createNewDataset(
      options.prompt,
      options.count,
      { output_format: options.format || 'json' }
    );

    await this.writeOutput(result, options.output);
    console.log('Dataset created successfully!');
  }

  private async handleAddMode(options: CLIOptions): Promise<void> {
    if (!options.input || !options.existing) {
      throw new Error('Add mode requires --input and --existing options');
    }

    console.log('Adding data to existing dataset...');

    const newInputData = await this.readInputData(options.input);
    const existingData = await this.readExistingData(options.existing);

    const result = await this.forge.addToExistingDataset(
      newInputData,
      existingData,
      { output_format: options.format || 'json' }
    );

    await this.writeOutput(result, options.output);
    console.log('Data added successfully!');
  }

  private async readInputData(filePath: string): Promise<InputData[]> {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  private async readExistingData(filePath: string): Promise<TableRow[]> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    
    return parsed.map((item: any) => ({
      ...item,
      processed_at: new Date(item.processed_at)
    }));
  }

  private async writeOutput(data: string, outputPath?: string): Promise<void> {
    if (outputPath) {
      fs.writeFileSync(outputPath, data);
      console.log(`Output written to: ${outputPath}`);
    } else {
      console.log(data);
    }
  }

  private showHelp(): void {
    console.log(`
QA Data Forge CLI

Usage:
  qa-data-forge --mode create --prompt "your prompt" --count 10 [options]
  qa-data-forge --mode add --input input.json --existing existing.json [options]

Options:
  --mode, -m        Operation mode: 'create' or 'add'
  --prompt, -p      Prompt for data generation (create mode)
  --count, -c       Number of items to generate (create mode)
  --input, -i       Input data file (add mode)
  --existing, -e    Existing dataset file (add mode)
  --output, -o      Output file path (optional, prints to stdout if not specified)
  --format, -f      Output format: 'json' or 'csv' (default: json)
  --help, -h        Show this help message

Examples:
  # Create new dataset
  qa-data-forge -m create -p "Generate QA data about machine learning" -c 50 -o dataset.json

  # Add to existing dataset
  qa-data-forge -m add -i new_data.json -e existing_dataset.json -o updated_dataset.json
    `);
  }
}

if (require.main === module) {
  const cli = new CLI();
  cli.run();
}