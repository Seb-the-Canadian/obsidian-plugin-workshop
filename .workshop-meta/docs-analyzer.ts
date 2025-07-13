#!/usr/bin/env ts-node

/**
 * Documentation Analyzer - Analyze documentation completeness and quality
 * 
 * This script analyzes documentation files and code comments to provide
 * insights into documentation coverage and quality.
 */

import * as fs from 'fs';
import * as path from 'path';

interface DocAnalysisResult {
  file: string;
  type: 'markdown' | 'jsdoc' | 'inline' | 'typescript';
  coverage: number;
  issues: Array<{
    type: 'missing' | 'incomplete' | 'outdated' | 'formatting';
    description: string;
    line?: number;
    severity: 'low' | 'medium' | 'high';
  }>;
  suggestions: string[];
}

class DocsAnalyzer {
  private results: DocAnalysisResult[] = [];

  /**
   * Analyze documentation in a plugin directory
   */
  public async analyzeDocumentation(pluginPath: string): Promise<void> {
    console.log(`📚 Analyzing documentation: ${pluginPath}`);
    
    if (!fs.existsSync(pluginPath)) {
      console.error(`❌ Plugin directory not found: ${pluginPath}`);
      return;
    }

    // Find all documentation files
    const docFiles = this.findDocumentationFiles(pluginPath);
    const sourceFiles = this.findSourceFiles(pluginPath);

    console.log(`📁 Found ${docFiles.length} documentation files`);
    console.log(`📄 Found ${sourceFiles.length} source files`);

    // Analyze documentation files
    for (const file of docFiles) {
      console.log(`📋 Analyzing doc file: ${file}`);
      const result = this.analyzeDocFile(file, pluginPath);
      this.results.push(result);
    }

    // Analyze source file documentation
    for (const file of sourceFiles) {
      console.log(`📄 Analyzing source docs: ${file}`);
      const result = this.analyzeSourceDocumentation(file, pluginPath);
      this.results.push(result);
    }

    // Output results
    this.outputResults(pluginPath);
  }

  /**
   * Find all documentation files
   */
  private findDocumentationFiles(pluginPath: string): string[] {
    const files: string[] = [];
    const docExtensions = ['.md', '.txt', '.rst'];

    const traverse = (dir: string) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!['node_modules', 'dist', 'build', '.git'].includes(item)) {
            traverse(fullPath);
          }
        } else if (docExtensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    };

    traverse(pluginPath);
    return files;
  }

  /**
   * Find source files for documentation analysis
   */
  private findSourceFiles(pluginPath: string): string[] {
    const files: string[] = [];
    const extensions = ['.ts', '.js', '.tsx', '.jsx'];

    const traverse = (dir: string) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!['node_modules', 'dist', 'build', '.git'].includes(item)) {
            traverse(fullPath);
          }
        } else if (extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    };

    traverse(pluginPath);
    return files;
  }

  /**
   * Analyze a documentation file
   */
  private analyzeDocFile(filePath: string, pluginPath: string): DocAnalysisResult {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(pluginPath, filePath);
    const extension = path.extname(filePath);

    const result: DocAnalysisResult = {
      file: relativePath,
      type: extension === '.md' ? 'markdown' : 'markdown',
      coverage: 0,
      issues: [],
      suggestions: [],
    };

    if (extension === '.md') {
      this.analyzeMarkdownFile(content, result);
    } else {
      this.analyzeTextFile(content, result);
    }

    return result;
  }

  /**
   * Analyze source file documentation
   */
  private analyzeSourceDocumentation(filePath: string, pluginPath: string): DocAnalysisResult {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(pluginPath, filePath);
    const extension = path.extname(filePath);

    const result: DocAnalysisResult = {
      file: relativePath,
      type: extension === '.ts' ? 'typescript' : 'jsdoc',
      coverage: 0,
      issues: [],
      suggestions: [],
    };

    this.analyzeSourceFileDocumentation(content, result);
    return result;
  }

  /**
   * Analyze markdown file
   */
  private analyzeMarkdownFile(content: string, result: DocAnalysisResult): void {
    const lines = content.split('\n');
    let coverage = 0;

    // Check for essential sections
    const essentialSections = [
      'installation',
      'usage',
      'features',
      'configuration',
      'api',
      'examples',
    ];

    const foundSections = essentialSections.filter(section => {
      const regex = new RegExp(`^#+\\s*${section}`, 'im');
      return regex.test(content);
    });

    coverage = (foundSections.length / essentialSections.length) * 100;

    // Check for common issues
    if (!content.includes('# ')) {
      result.issues.push({
        type: 'missing',
        description: 'No main heading found',
        severity: 'high',
      });
    }

    if (content.split('\n').length < 20) {
      result.issues.push({
        type: 'incomplete',
        description: 'Documentation appears to be very brief',
        severity: 'medium',
      });
    }

    if (!content.includes('```')) {
      result.issues.push({
        type: 'missing',
        description: 'No code examples found',
        severity: 'medium',
      });
    }

    // Check for broken links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let linkMatch;
    
    while ((linkMatch = linkRegex.exec(content)) !== null) {
      const url = linkMatch[2];
      if (url.startsWith('http') || url.startsWith('https')) {
        // External link - would need actual HTTP check
        continue;
      } else if (url.startsWith('#')) {
        // Internal anchor - check if header exists
        const header = url.substring(1).toLowerCase().replace(/-/g, ' ');
        if (!content.toLowerCase().includes(header)) {
          result.issues.push({
            type: 'missing',
            description: `Broken internal link: ${url}`,
            severity: 'medium',
          });
        }
      }
    }

    result.coverage = coverage;

    // Generate suggestions
    const missingSections = essentialSections.filter(section => !foundSections.includes(section));
    if (missingSections.length > 0) {
      result.suggestions.push(`Add sections for: ${missingSections.join(', ')}`);
    }

    if (coverage < 50) {
      result.suggestions.push('Consider expanding documentation with more detailed explanations');
    }

    if (!content.includes('```')) {
      result.suggestions.push('Add code examples to illustrate usage');
    }
  }

  /**
   * Analyze text file
   */
  private analyzeTextFile(content: string, result: DocAnalysisResult): void {
    const lines = content.split('\n');
    const wordCount = content.split(/\s+/).length;

    result.coverage = Math.min(100, (wordCount / 100) * 100); // Basic coverage based on word count

    if (wordCount < 50) {
      result.issues.push({
        type: 'incomplete',
        description: 'Documentation appears to be very brief',
        severity: 'medium',
      });
    }

    if (lines.length < 10) {
      result.issues.push({
        type: 'incomplete',
        description: 'Very short documentation file',
        severity: 'low',
      });
    }

    result.suggestions.push('Consider converting to Markdown for better formatting');
  }

  /**
   * Analyze source file documentation
   */
  private analyzeSourceFileDocumentation(content: string, result: DocAnalysisResult): void {
    const lines = content.split('\n');
    let documentedFunctions = 0;
    let totalFunctions = 0;
    let documentedClasses = 0;
    let totalClasses = 0;

    // Find functions and classes
    const functionRegex = /^\s*(export\s+)?(async\s+)?function\s+\w+|^\s*(public|private|protected)\s+.*?\(/gm;
    const classRegex = /^\s*(export\s+)?(abstract\s+)?class\s+\w+/gm;
    const jsdocRegex = /\/\*\*[\s\S]*?\*\//g;

    // Count functions
    let functionMatch;
    while ((functionMatch = functionRegex.exec(content)) !== null) {
      totalFunctions++;
      
      // Check if there's JSDoc before this function
      const linesBefore = content.substring(0, functionMatch.index).split('\n');
      const currentLine = linesBefore.length;
      
      // Look for JSDoc in the 5 lines before the function
      let hasDoc = false;
      for (let i = Math.max(0, currentLine - 5); i < currentLine; i++) {
        if (lines[i] && lines[i].includes('/**')) {
          hasDoc = true;
          break;
        }
      }
      
      if (hasDoc) {
        documentedFunctions++;
      } else {
        result.issues.push({
          type: 'missing',
          description: `Function at line ${currentLine} lacks documentation`,
          line: currentLine,
          severity: 'medium',
        });
      }
    }

    // Count classes
    let classMatch;
    while ((classMatch = classRegex.exec(content)) !== null) {
      totalClasses++;
      
      // Check if there's JSDoc before this class
      const linesBefore = content.substring(0, classMatch.index).split('\n');
      const currentLine = linesBefore.length;
      
      // Look for JSDoc in the 5 lines before the class
      let hasDoc = false;
      for (let i = Math.max(0, currentLine - 5); i < currentLine; i++) {
        if (lines[i] && lines[i].includes('/**')) {
          hasDoc = true;
          break;
        }
      }
      
      if (hasDoc) {
        documentedClasses++;
      } else {
        result.issues.push({
          type: 'missing',
          description: `Class at line ${currentLine} lacks documentation`,
          line: currentLine,
          severity: 'high',
        });
      }
    }

    // Calculate coverage
    const totalItems = totalFunctions + totalClasses;
    const documentedItems = documentedFunctions + documentedClasses;
    result.coverage = totalItems > 0 ? (documentedItems / totalItems) * 100 : 0;

    // Generate suggestions
    if (result.coverage < 50) {
      result.suggestions.push('Add JSDoc comments to public functions and classes');
    }

    if (totalClasses > 0 && documentedClasses === 0) {
      result.suggestions.push('All classes should have documentation');
    }

    if (!content.includes('/**')) {
      result.suggestions.push('Consider adding JSDoc comments for better code documentation');
    }
  }

  /**
   * Output analysis results
   */
  private outputResults(pluginPath: string): void {
    console.log('\n📚 Documentation Analysis Results\n');
    console.log('=' .repeat(50));

    const totalFiles = this.results.length;
    const averageCoverage = this.results.reduce((sum, r) => sum + r.coverage, 0) / totalFiles;
    const totalIssues = this.results.reduce((sum, r) => sum + r.issues.length, 0);
    const highSeverityIssues = this.results.reduce((sum, r) => 
      sum + r.issues.filter(i => i.severity === 'high').length, 0
    );

    console.log(`📊 Summary:`);
    console.log(`  Total files analyzed: ${totalFiles}`);
    console.log(`  Average coverage: ${averageCoverage.toFixed(1)}%`);
    console.log(`  Total issues: ${totalIssues}`);
    console.log(`  High severity issues: ${highSeverityIssues}`);

    console.log('\n📋 File-by-File Analysis:');
    console.log('-'.repeat(30));

    this.results.forEach(result => {
      console.log(`\n📄 ${result.file} (${result.type})`);
      console.log(`  Coverage: ${result.coverage.toFixed(1)}%`);
      console.log(`  Issues: ${result.issues.length}`);
      
      if (result.issues.length > 0) {
        console.log('  Issues found:');
        result.issues.forEach(issue => {
          const line = issue.line ? ` (line ${issue.line})` : '';
          console.log(`    • ${issue.description}${line} [${issue.severity}]`);
        });
      }

      if (result.suggestions.length > 0) {
        console.log('  Suggestions:');
        result.suggestions.forEach(suggestion => {
          console.log(`    → ${suggestion}`);
        });
      }
    });

    // Overall recommendations
    console.log('\n💡 Overall Recommendations:');
    console.log('-'.repeat(30));

    if (averageCoverage < 60) {
      console.log('  1. Improve documentation coverage - aim for 80%+');
    }

    if (highSeverityIssues > 0) {
      console.log('  2. Address high severity documentation issues first');
    }

    if (totalIssues > 10) {
      console.log('  3. Consider implementing documentation standards');
    }

    if (averageCoverage > 80) {
      console.log('  1. Excellent documentation coverage!');
    }

    // Save detailed report
    const reportPath = path.join(pluginPath, 'docs-analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const pluginPath = args[0] || process.cwd();

  console.log('📚 Obsidian Plugin Workshop - Documentation Analyzer');
  console.log('=' .repeat(50));

  try {
    const analyzer = new DocsAnalyzer();
    await analyzer.analyzeDocumentation(pluginPath);
  } catch (error) {
    console.error('❌ Documentation analysis failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}