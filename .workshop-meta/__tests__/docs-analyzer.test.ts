import { DocsAnalyzer } from '../docs-analyzer';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

// Mock fetch
jest.mock('node-fetch', () => {
  return jest.fn().mockImplementation(() => 
    Promise.resolve({
      text: () => Promise.resolve(`
        <!DOCTYPE html>
        <html>
          <body>
            <div id="overview">
              Test plugin overview
            </div>
            
            <div id="installation">
              npm install test-plugin
              Enable plugin in settings
            </div>
            
            <div id="usage">
              Use command palette
              Configure settings
            </div>
            
            <div class="api-item">
              <h3>testFunction</h3>
              <p>Test function description</p>
              <pre>
                function test() {
                  console.log('test');
                }
              </pre>
            </div>
            
            <div id="configuration">
              <tr>
                <th>testOption</th>
                <td>Test option description</td>
                <div class="default">default value</div>
              </tr>
            </div>
            
            <div id="examples">
              <div class="example">
                <h3>Test Example</h3>
                <p>Example description</p>
                <pre>
                  const test = new Test();
                  test.run();
                </pre>
              </div>
            </div>
            
            <a href="/api">API Documentation</a>
          </body>
        </html>
      `)
    })
  );
});

describe('DocsAnalyzer', () => {
  let analyzer: DocsAnalyzer;

  beforeEach(() => {
    analyzer = new DocsAnalyzer('https://test.com/docs');
  });

  describe('analyze', () => {
    it('should analyze documentation and return results', async () => {
      const result = await analyzer.analyze();

      expect(result).toHaveProperty('overview');
      expect(result).toHaveProperty('installation');
      expect(result).toHaveProperty('usage');
      expect(result).toHaveProperty('api');
      expect(result).toHaveProperty('configuration');
      expect(result).toHaveProperty('examples');
    });

    it('should extract overview correctly', async () => {
      const result = await analyzer.analyze();
      expect(result.overview).toContain('Test plugin overview');
    });

    it('should extract installation instructions correctly', async () => {
      const result = await analyzer.analyze();
      expect(result.installation).toContain('npm install test-plugin');
      expect(result.installation).toContain('Enable plugin in settings');
    });

    it('should extract usage instructions correctly', async () => {
      const result = await analyzer.analyze();
      expect(result.usage).toContain('Use command palette');
      expect(result.usage).toContain('Configure settings');
    });

    it('should extract API documentation correctly', async () => {
      const result = await analyzer.analyze();
      expect(result.api[0].name).toBe('testFunction');
      expect(result.api[0].description).toBe('Test function description');
      expect(result.api[0].examples[0]).toContain('function test()');
    });

    it('should extract configuration options correctly', async () => {
      const result = await analyzer.analyze();
      expect(result.configuration[0].option).toBe('testOption');
      expect(result.configuration[0].description).toBe('Test option description');
      expect(result.configuration[0].default).toBe('default value');
    });

    it('should extract examples correctly', async () => {
      const result = await analyzer.analyze();
      expect(result.examples[0].title).toBe('Test Example');
      expect(result.examples[0].description).toBe('Example description');
      expect(result.examples[0].code).toContain('const test = new Test()');
    });
  });

  describe('generateReport', () => {
    it('should generate a markdown report', async () => {
      const report = await analyzer.generateReport();

      expect(report).toContain('# Documentation Analysis Report');
      expect(report).toContain('## Overview');
      expect(report).toContain('## Installation');
      expect(report).toContain('## Usage');
      expect(report).toContain('## API Reference');
      expect(report).toContain('## Configuration Options');
      expect(report).toContain('## Examples');
    });

    it('should include all sections in the report', async () => {
      const report = await analyzer.generateReport();

      expect(report).toContain('Test plugin overview');
      expect(report).toContain('npm install test-plugin');
      expect(report).toContain('Use command palette');
      expect(report).toContain('testFunction');
      expect(report).toContain('testOption');
      expect(report).toContain('Test Example');
    });
  });
}); 