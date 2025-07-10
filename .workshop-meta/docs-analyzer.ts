import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { Element } from 'jsdom';

interface DocsAnalysisResult {
  overview: string;
  installation: string[];
  usage: string[];
  api: {
    name: string;
    description: string;
    examples: string[];
  }[];
  configuration: {
    option: string;
    description: string;
    default?: string;
  }[];
  examples: {
    title: string;
    code: string;
    description: string;
  }[];
}

export class DocsAnalyzer {
  constructor(private baseUrl: string) {}

  async analyze(): Promise<DocsAnalysisResult> {
    try {
      // Fetch main documentation page
      const mainDoc = await this.fetchPage(this.baseUrl);
      
      // Parse documentation sections
      const overview = this.extractOverview(mainDoc);
      const installation = this.extractInstallation(mainDoc);
      const usage = this.extractUsage(mainDoc);
      const api = await this.extractAPI(mainDoc);
      const configuration = this.extractConfiguration(mainDoc);
      const examples = this.extractExamples(mainDoc);

      return {
        overview,
        installation,
        usage,
        api,
        configuration,
        examples
      };
    } catch (error) {
      console.error('Documentation analysis failed:', error);
      throw error;
    }
  }

  private async fetchPage(url: string): Promise<JSDOM> {
    const response = await fetch(url);
    const html = await response.text();
    return new JSDOM(html);
  }

  private extractOverview(dom: JSDOM): string {
    // Extract overview section
    const overview = dom.window.document.querySelector('.overview, #overview');
    return overview?.textContent?.trim() || '';
  }

  private extractInstallation(dom: JSDOM): string[] {
    // Extract installation instructions
    const installation = dom.window.document.querySelector('.installation, #installation');
    return installation?.textContent?.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0) || [];
  }

  private extractUsage(dom: JSDOM): string[] {
    // Extract usage instructions
    const usage = dom.window.document.querySelector('.usage, #usage');
    return usage?.textContent?.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0) || [];
  }

  private async extractAPI(dom: JSDOM): Promise<DocsAnalysisResult['api']> {
    const api: DocsAnalysisResult['api'] = [];
    
    // Find API documentation links
    const links = dom.window.document.querySelectorAll('a');
    const apiLinks = Array.from(links).filter((a: Element) => {
      const href = a.getAttribute('href');
      return href ? (href.includes('api') || href.includes('reference')) : false;
    });

    // Fetch and parse each API page
    for (const link of apiLinks) {
      try {
        const href = link.getAttribute('href');
        if (!href) continue;

        const apiDoc = await this.fetchPage(new URL(href, this.baseUrl).toString());
        const methods = apiDoc.window.document.querySelectorAll('.method, .function, .api-item');
        
        methods.forEach((method: Element) => {
          api.push({
            name: method.querySelector('.name, h3')?.textContent?.trim() || '',
            description: method.querySelector('.description, p')?.textContent?.trim() || '',
            examples: Array.from(method.querySelectorAll('.example, pre'))
              .map(example => example.textContent?.trim() || '')
          });
        });
      } catch (error) {
        console.error(`Failed to fetch API documentation from ${link.getAttribute('href')}:`, error);
      }
    }

    return api;
  }

  private extractConfiguration(dom: JSDOM): DocsAnalysisResult['configuration'] {
    const config: DocsAnalysisResult['configuration'] = [];
    
    // Find configuration section
    const configSection = dom.window.document.querySelector('.configuration, #configuration');
    if (!configSection) return config;

    // Extract configuration options
    const options = configSection.querySelectorAll('tr, .config-option');
    options.forEach((option: Element) => {
      config.push({
        option: option.querySelector('.name, th')?.textContent?.trim() || '',
        description: option.querySelector('.description, td')?.textContent?.trim() || '',
        default: option.querySelector('.default')?.textContent?.trim()
      });
    });

    return config;
  }

  private extractExamples(dom: JSDOM): DocsAnalysisResult['examples'] {
    const examples: DocsAnalysisResult['examples'] = [];
    
    // Find examples section
    const exampleSection = dom.window.document.querySelector('.examples, #examples');
    if (!exampleSection) return examples;

    // Extract examples
    const exampleBlocks = exampleSection.querySelectorAll('.example, .code-block');
    exampleBlocks.forEach((block: Element) => {
      examples.push({
        title: block.querySelector('h3, .title')?.textContent?.trim() || '',
        code: block.querySelector('pre, code')?.textContent?.trim() || '',
        description: block.querySelector('p, .description')?.textContent?.trim() || ''
      });
    });

    return examples;
  }

  async generateReport(): Promise<string> {
    const analysis = await this.analyze();
    
    return `# Documentation Analysis Report

## Overview
${analysis.overview}

## Installation
${analysis.installation.map(step => `- ${step}`).join('\n')}

## Usage
${analysis.usage.map(step => `- ${step}`).join('\n')}

## API Reference
${analysis.api.map(item => `
### ${item.name}
${item.description}

Examples:
${item.examples.map(example => `\`\`\`typescript\n${example}\n\`\`\``).join('\n')}
`).join('\n')}

## Configuration Options
${analysis.configuration.map(option => `
### ${option.option}
${option.description}
${option.default ? `Default: ${option.default}` : ''}`).join('\n')}

## Examples
${analysis.examples.map(example => `
### ${example.title}
${example.description}

\`\`\`typescript
${example.code}
\`\`\`
`).join('\n')}`;
  }
}

// Example usage:
// const analyzer = new DocsAnalyzer('https://github.com/user/plugin/wiki');
// const report = await analyzer.generateReport(); 