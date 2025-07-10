import { Octokit } from '@octokit/rest';
import { RateLimiter } from './services/rate-limiter';
import { RateLimitError } from './errors/rate-limit-error';
import { PatternDetector } from './services/pattern-detector';
import { CodeMetrics } from './services/code-metrics';
import { DocAnalyzer } from './services/doc-analyzer';

export interface AnalysisConfig {
  owner: string;
  repo: string;
  branch?: string;
  path?: string;
}

interface CodePattern {
  name: string;
  description: string;
  context: string;
  benefits: string[];
  implementation: string;
  examples: string[];
  frequency: number;
}

interface BestPractice {
  name: string;
  description: string;
  examples: string[];
  benefits: string[];
  frequency: number;
}

export interface AnalysisResult {
  patterns: CodePattern[];
  bestPractices: BestPractice[];
  metrics: {
    codeQuality: number;
    testCoverage: number;
    documentation: number;
    performance: number;
    cyclomaticComplexity: number;
    dependencyComplexity: number;
    duplicateCodePercentage: number;
  };
  documentation: {
    completeness: number;
    codeExampleCoverage: number;
    linkCoverage: number;
    formats: {
      format: string;
      files: string[];
      score: number;
    }[];
  };
}

class PluginAnalyzer {
  private octokit: Octokit;
  private config: AnalysisConfig;
  private patterns: Map<string, CodePattern>;
  private bestPractices: Map<string, BestPractice>;
  private rateLimiter: RateLimiter;
  private patternDetector: PatternDetector;
  private fileMetrics: Map<string, any>;
  private docAnalysis: Map<string, any>;

  constructor(token: string, config: AnalysisConfig) {
    this.octokit = new Octokit({ auth: token });
    this.config = config;
    this.patterns = new Map();
    this.bestPractices = new Map();
    this.rateLimiter = new RateLimiter();
    this.patternDetector = new PatternDetector();
    this.fileMetrics = new Map();
    this.docAnalysis = new Map();
  }

  private async analyzeCode(): Promise<void> {
    try {
      const { data: files } = await this.rateLimiter.executeWithRetry(
        () => this.octokit.repos.getContent({
          owner: this.config.owner,
          repo: this.config.repo,
          path: this.config.path || '',
          ref: this.config.branch
        }),
        'Get repository contents'
      );

      if (Array.isArray(files)) {
        for (const file of files) {
          if (file.type === 'file' && file.name.endsWith('.ts')) {
            await this.analyzeFile(file.path);
          }
        }
      }
    } catch (error) {
      if (error instanceof RateLimitError) {
        console.error('Rate limit exceeded during code analysis:', error);
      } else {
        console.error('Code analysis failed:', error);
      }
    }
  }

  private async analyzeFile(path: string): Promise<void> {
    try {
      const { data } = await this.rateLimiter.executeWithRetry(
        () => this.octokit.repos.getContent({
          owner: this.config.owner,
          repo: this.config.repo,
          path,
          ref: this.config.branch
        }),
        `Get file content: ${path}`
      );

      if ('content' in data) {
        const content = atob(data.content.replace(/\n/g, ''));
        
        // Pattern detection
        this.extractPatterns(content);

        // Code metrics analysis
        const metrics = new CodeMetrics(content, path);
        const metricsResult = metrics.analyze();
        this.fileMetrics.set(path, metricsResult);
      }
    } catch (error) {
      if (error instanceof RateLimitError) {
        console.error(`Rate limit exceeded while analyzing ${path}:`, error);
      } else {
        console.error(`File analysis failed for ${path}:`, error);
      }
    }
  }

  private extractPatterns(content: string): void {
    const detectedPatterns = this.patternDetector.detectPatterns(content);
    
    for (const pattern of detectedPatterns) {
      this.addPattern({
        name: pattern.name,
        description: pattern.description,
        context: pattern.context,
        benefits: pattern.benefits,
        implementation: pattern.implementation,
        examples: pattern.examples,
        frequency: pattern.frequency
      });
    }
  }

  private extractIssuePatterns(issue: any): void {
    // Issue pattern extraction logic here
  }

  private async analyzeIssues(): Promise<void> {
    try {
      const { data: issues } = await this.rateLimiter.executeWithRetry(
        () => this.octokit.issues.listForRepo({
          owner: this.config.owner,
          repo: this.config.repo,
          state: 'all'
        }),
        'List repository issues'
      );

      for (const issue of issues) {
        this.extractIssuePatterns(issue);
      }
    } catch (error) {
      if (error instanceof RateLimitError) {
        console.error('Rate limit exceeded during issue analysis:', error);
      } else {
        console.error('Issue analysis failed:', error);
      }
    }
  }

  private async analyzePRs(): Promise<void> {
    try {
      const { data: prs } = await this.rateLimiter.executeWithRetry(
        () => this.octokit.pulls.list({
          owner: this.config.owner,
          repo: this.config.repo,
          state: 'all'
        }),
        'List pull requests'
      );

      for (const pr of prs) {
        await this.extractPRPatterns(pr);
      }
    } catch (error) {
      if (error instanceof RateLimitError) {
        console.error('Rate limit exceeded during PR analysis:', error);
      } else {
        console.error('PR analysis failed:', error);
      }
    }
  }

  private async extractPRPatterns(pr: any): Promise<void> {
    try {
      const { data: files } = await this.rateLimiter.executeWithRetry(
        () => this.octokit.pulls.listFiles({
          owner: this.config.owner,
          repo: this.config.repo,
          pull_number: pr.number
        }),
        `List files for PR #${pr.number}`
      );

      for (const file of files) {
        if (file.filename.endsWith('.ts')) {
          this.addPattern({
            name: `PR: ${pr.title}`,
            description: pr.body || '',
            context: 'Code Change',
            benefits: ['Code Improvement'],
            implementation: file.patch || '',
            examples: [file.patch || ''],
            frequency: 1
          });
        }
      }
    } catch (error) {
      if (error instanceof RateLimitError) {
        console.error(`Rate limit exceeded while extracting patterns from PR #${pr.number}:`, error);
      } else {
        console.error(`PR pattern extraction failed for #${pr.number}:`, error);
      }
    }
  }

  private addPattern(pattern: CodePattern): void {
    const existing = this.patterns.get(pattern.name);
    if (existing) {
      existing.frequency += pattern.frequency;
      existing.examples.push(...pattern.examples);
    } else {
      this.patterns.set(pattern.name, pattern);
    }
  }

  private calculateCodeQuality(): number {
    const metrics = Array.from(this.fileMetrics.values());
    if (metrics.length === 0) return 0;

    const avgComplexity = metrics.reduce((sum, m) => sum + m.cyclomaticComplexity, 0) / metrics.length;
    const maxComplexityThreshold = 20;
    const complexityScore = Math.max(0, 1 - (avgComplexity / maxComplexityThreshold));

    const totalDuplicates = metrics.reduce((sum, m) => sum + m.duplicateCode.length, 0);
    const duplicateScore = Math.max(0, 1 - (totalDuplicates * 0.1));

    const dependencyScore = metrics.reduce((sum, m) => {
      const avgDependencyWeight = m.dependencyGraph.reduce((w, d) => w + d.weight, 0) / 
        (m.dependencyGraph.length || 1);
      return sum + Math.max(0, 1 - (avgDependencyWeight * 0.1));
    }, 0) / metrics.length;

    return Math.round(((complexityScore + duplicateScore + dependencyScore) / 3) * 100);
  }

  private calculateTestCoverage(): number {
    // Placeholder: Implement actual test coverage calculation
    return 0;
  }

  private calculateDocumentationScore(): number {
    // Placeholder: Implement actual documentation score calculation
    return 0;
  }

  private calculatePerformanceScore(): number {
    // Placeholder: Implement actual performance score calculation
    return 0;
  }

  private async analyzeDocumentation(): Promise<void> {
    const docPaths = [
      'README.md',
      'docs/',
      '.github/wiki/',
      'manifest.json'
    ];

    for (const path of docPaths) {
      try {
        const { data } = await this.rateLimiter.executeWithRetry(
          () => this.octokit.repos.getContent({
            owner: this.config.owner,
            repo: this.config.repo,
            path,
            ref: this.config.branch
          }),
          `Get documentation: ${path}`
        );

        if (Array.isArray(data)) {
          // Directory
          for (const file of data) {
            if (file.type === 'file' && (file.name.endsWith('.md') || file.name === 'manifest.json')) {
              await this.analyzeDocFile(file.path);
            }
          }
        } else if ('content' in data) {
          // Single file
          await this.analyzeDocFile(path);
        }
      } catch (error) {
        if (!(error instanceof RateLimitError)) {
          console.error(`Documentation analysis failed for ${path}:`, error);
        }
      }
    }
  }

  private async analyzeDocFile(path: string): Promise<void> {
    try {
      const { data } = await this.rateLimiter.executeWithRetry(
        () => this.octokit.repos.getContent({
          owner: this.config.owner,
          repo: this.config.repo,
          path,
          ref: this.config.branch
        }),
        `Get doc file: ${path}`
      );

      if ('content' in data) {
        const content = atob(data.content.replace(/\n/g, ''));
        const format = path.endsWith('.md') ? 'markdown' : 
                      path.includes('wiki') ? 'github-wiki' : 
                      path.endsWith('manifest.json') ? 'json' : 'other';

        const docAnalyzer = new DocAnalyzer(content, format);
        const analysis = docAnalyzer.analyze();
        this.docAnalysis.set(path, analysis);
      }
    } catch (error) {
      if (error instanceof RateLimitError) {
        console.error(`Rate limit exceeded while analyzing ${path}:`, error);
      } else {
        console.error(`Documentation analysis failed for ${path}:`, error);
      }
    }
  }

  private calculateDocumentationMetrics(): AnalysisResult['documentation'] {
    const analyses = Array.from(this.docAnalysis.values());
    if (analyses.length === 0) {
      return {
        completeness: 0,
        codeExampleCoverage: 0,
        linkCoverage: 0,
        formats: []
      };
    }

    const formatGroups = new Map<string, { files: string[], scores: number[] }>();
    let totalCodeBlocks = 0;
    let totalLinks = 0;

    for (const [path, analysis] of this.docAnalysis.entries()) {
      const format = analysis.format;
      const group = formatGroups.get(format) || { files: [], scores: [] };
      group.files.push(path);
      group.scores.push(analysis.completeness);
      formatGroups.set(format, group);

      totalCodeBlocks += analysis.codeBlocks.length;
      totalLinks += analysis.links.length;
    }

    const formats = Array.from(formatGroups.entries()).map(([format, group]) => ({
      format,
      files: group.files,
      score: Math.round(group.scores.reduce((a, b) => a + b, 0) / group.scores.length)
    }));

    return {
      completeness: Math.round(analyses.reduce((sum, a) => sum + a.completeness, 0) / analyses.length),
      codeExampleCoverage: Math.round((totalCodeBlocks / analyses.length) * 100),
      linkCoverage: Math.round((totalLinks / analyses.length) * 100),
      formats
    };
  }

  public async analyze(): Promise<AnalysisResult> {
    await Promise.all([
      this.analyzeCode(),
      this.analyzeIssues(),
      this.analyzePRs(),
      this.analyzeDocumentation()
    ]);

    return {
      patterns: Array.from(this.patterns.values()),
      bestPractices: Array.from(this.bestPractices.values()),
      metrics: {
        codeQuality: this.calculateCodeQuality(),
        testCoverage: this.calculateTestCoverage(),
        documentation: this.calculateDocumentationScore(),
        performance: this.calculatePerformanceScore(),
        cyclomaticComplexity: this.calculateAverageMetric('cyclomaticComplexity'),
        dependencyComplexity: this.calculateDependencyComplexity(),
        duplicateCodePercentage: this.calculateDuplicateCodePercentage()
      },
      documentation: this.calculateDocumentationMetrics()
    };
  }

  private calculateAverageMetric(metricName: string): number {
    const metrics = Array.from(this.fileMetrics.values());
    if (metrics.length === 0) return 0;
    return Math.round(metrics.reduce((sum, m) => sum + m[metricName], 0) / metrics.length);
  }

  private calculateDependencyComplexity(): number {
    const metrics = Array.from(this.fileMetrics.values());
    if (metrics.length === 0) return 0;

    const totalWeight = metrics.reduce((sum, m) => 
      sum + m.dependencyGraph.reduce((w, d) => w + d.weight, 0), 0);
    const totalNodes = metrics.reduce((sum, m) => sum + m.dependencyGraph.length, 0);

    return totalNodes === 0 ? 0 : Math.round((totalWeight / totalNodes) * 100);
  }

  private calculateDuplicateCodePercentage(): number {
    const metrics = Array.from(this.fileMetrics.values());
    if (metrics.length === 0) return 0;

    const totalDuplicates = metrics.reduce((sum, m) => sum + m.duplicateCode.length, 0);
    const totalFiles = metrics.length;

    return Math.round((totalDuplicates / totalFiles) * 100);
  }

  public async generateReport(): Promise<string> {
    const analysis = await this.analyze();
    
    return `# Plugin Analysis Report

## Overview
- Repository: ${this.config.owner}/${this.config.repo}
- Analysis Date: ${new Date().toISOString()}

## Code Metrics
- Code Quality: ${analysis.metrics.codeQuality}%
- Cyclomatic Complexity: ${analysis.metrics.cyclomaticComplexity}
- Dependency Complexity: ${analysis.metrics.dependencyComplexity}%
- Duplicate Code: ${analysis.metrics.duplicateCodePercentage}%
- Test Coverage: ${analysis.metrics.testCoverage}%
- Documentation: ${analysis.metrics.documentation}%
- Performance: ${analysis.metrics.performance}%

## Documentation Analysis
- Overall Completeness: ${analysis.documentation.completeness}%
- Code Example Coverage: ${analysis.documentation.codeExampleCoverage}%
- Link Coverage: ${analysis.documentation.linkCoverage}%

### Documentation Formats
${analysis.documentation.formats.map(format => `
- ${format.format}:
  - Files: ${format.files.join(', ')}
  - Score: ${format.score}%
`).join('\n')}

## Patterns Found
${analysis.patterns.map(pattern => `
### ${pattern.name}
- Description: ${pattern.description}
- Context: ${pattern.context}
- Benefits:
${pattern.benefits.map(b => `  - ${b}`).join('\n')}
- Frequency: ${pattern.frequency}
`).join('\n')}

## Best Practices
${analysis.bestPractices.map(practice => `
### ${practice.name}
- Description: ${practice.description}
- Benefits:
${practice.benefits.map(b => `  - ${b}`).join('\n')}
- Examples:
${practice.examples.map(e => `  - ${e}`).join('\n')}
`).join('\n')}
`;
  }
}

export { PluginAnalyzer }; 