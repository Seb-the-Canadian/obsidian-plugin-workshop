import { PluginAnalyzer } from '../plugin-analyzer';
import { RateLimiter } from './rate-limiter';
import { RateLimitError } from '../errors/rate-limit-error';
import { Octokit } from '@octokit/rest';

interface PipelineConfig {
  owner: string;
  repo: string;
  branch?: string;
  path?: string;
  baseCommit?: string;
  compareCommit?: string;
  incrementalMode?: boolean;
}

interface AnalysisDiff {
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
  };
  patterns: {
    added: string[];
    removed: string[];
    modified: string[];
  };
  bestPractices: {
    added: string[];
    removed: string[];
    modified: string[];
  };
}

interface AnalysisCacheEntry {
  timestamp: number;
  commit: string;
  result: any;
}

export class AnalysisPipeline {
  private octokit: Octokit;
  private config: PipelineConfig;
  private rateLimiter: RateLimiter;
  private cache: Map<string, AnalysisCacheEntry>;
  private static readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private token: string;

  constructor(token: string, config: PipelineConfig) {
    this.token = token;
    this.octokit = new Octokit({ auth: token });
    this.config = config;
    this.rateLimiter = new RateLimiter();
    this.cache = new Map();
  }

  public async analyze(): Promise<any> {
    if (this.config.incrementalMode) {
      return this.runIncrementalAnalysis();
    } else if (this.config.baseCommit && this.config.compareCommit) {
      return this.runDifferentialAnalysis();
    } else {
      return this.runFullAnalysis();
    }
  }

  private async runFullAnalysis(): Promise<any> {
    const analyzer = new PluginAnalyzer(this.token, {
      owner: this.config.owner,
      repo: this.config.repo,
      branch: this.config.branch,
      path: this.config.path
    });

    const result = await analyzer.analyze();
    await this.cacheResult(result);
    return result;
  }

  private async runIncrementalAnalysis(): Promise<any> {
    const latestCommit = await this.getLatestCommit();
    const cachedResult = this.getCachedResult(latestCommit);

    if (cachedResult) {
      return cachedResult;
    }

    const changedFiles = await this.getChangedFiles(latestCommit);
    if (changedFiles.length === 0) {
      const result = await this.runFullAnalysis();
      await this.cacheResult(result);
      return result;
    }

    const analyzer = new PluginAnalyzer(this.token, {
      owner: this.config.owner,
      repo: this.config.repo,
      branch: this.config.branch,
      path: this.config.path
    });

    const result = await analyzer.analyze();
    await this.cacheResult(result);
    return result;
  }

  private async runDifferentialAnalysis(): Promise<AnalysisDiff> {
    if (!this.config.baseCommit || !this.config.compareCommit) {
      throw new Error('Base and compare commits are required for differential analysis');
    }

    const [baseResult, compareResult] = await Promise.all([
      this.analyzeCommit(this.config.baseCommit),
      this.analyzeCommit(this.config.compareCommit)
    ]);

    return this.calculateDiff(baseResult, compareResult);
  }

  private async analyzeCommit(commit: string): Promise<any> {
    const cachedResult = this.getCachedResult(commit);
    if (cachedResult) {
      return cachedResult;
    }

    const analyzer = new PluginAnalyzer(this.token, {
      owner: this.config.owner,
      repo: this.config.repo,
      branch: commit,
      path: this.config.path
    });

    const result = await analyzer.analyze();
    await this.cacheResult(result, commit);
    return result;
  }

  private calculateDiff(baseResult: any, compareResult: any): AnalysisDiff {
    return {
      metrics: {
        codeQuality: compareResult.metrics.codeQuality - baseResult.metrics.codeQuality,
        testCoverage: compareResult.metrics.testCoverage - baseResult.metrics.testCoverage,
        documentation: compareResult.metrics.documentation - baseResult.metrics.documentation,
        performance: compareResult.metrics.performance - baseResult.metrics.performance,
        cyclomaticComplexity: compareResult.metrics.cyclomaticComplexity - baseResult.metrics.cyclomaticComplexity,
        dependencyComplexity: compareResult.metrics.dependencyComplexity - baseResult.metrics.dependencyComplexity,
        duplicateCodePercentage: compareResult.metrics.duplicateCodePercentage - baseResult.metrics.duplicateCodePercentage
      },
      documentation: {
        completeness: compareResult.documentation.completeness - baseResult.documentation.completeness,
        codeExampleCoverage: compareResult.documentation.codeExampleCoverage - baseResult.documentation.codeExampleCoverage,
        linkCoverage: compareResult.documentation.linkCoverage - baseResult.documentation.linkCoverage
      },
      patterns: this.calculateEntityDiff(
        baseResult.patterns.map((p: any) => p.name),
        compareResult.patterns.map((p: any) => p.name)
      ),
      bestPractices: this.calculateEntityDiff(
        baseResult.bestPractices.map((p: any) => p.name),
        compareResult.bestPractices.map((p: any) => p.name)
      )
    };
  }

  private calculateEntityDiff(base: string[], compare: string[]): { added: string[], removed: string[], modified: string[] } {
    const baseSet = new Set(base);
    const compareSet = new Set(compare);

    return {
      added: compare.filter(item => !baseSet.has(item)),
      removed: base.filter(item => !compareSet.has(item)),
      modified: compare.filter(item => baseSet.has(item))
    };
  }

  private async getLatestCommit(): Promise<string> {
    try {
      const { data } = await this.rateLimiter.executeWithRetry(
        () => this.octokit.repos.getBranch({
          owner: this.config.owner,
          repo: this.config.repo,
          branch: this.config.branch || 'main'
        }),
        'Get latest commit'
      );

      return data.commit.sha;
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }
      throw new Error(`Failed to get latest commit: ${error}`);
    }
  }

  private async getChangedFiles(since: string): Promise<string[]> {
    try {
      const { data: commits } = await this.rateLimiter.executeWithRetry(
        () => this.octokit.repos.listCommits({
          owner: this.config.owner,
          repo: this.config.repo,
          since: new Date(since).toISOString()
        }),
        'List commits'
      );

      const changedFiles = new Set<string>();
      for (const commit of commits) {
        const { data: files } = await this.rateLimiter.executeWithRetry(
          () => this.octokit.repos.getCommit({
            owner: this.config.owner,
            repo: this.config.repo,
            ref: commit.sha
          }),
          `Get commit ${commit.sha}`
        );

        files.files?.forEach(file => changedFiles.add(file.filename));
      }

      return Array.from(changedFiles);
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }
      throw new Error(`Failed to get changed files: ${error}`);
    }
  }

  private getCachedResult(commit: string): any | null {
    const cached = this.cache.get(commit);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > AnalysisPipeline.CACHE_TTL) {
      this.cache.delete(commit);
      return null;
    }

    return cached.result;
  }

  private async cacheResult(result: any, commit?: string): Promise<void> {
    if (!commit) {
      commit = await this.getLatestCommit();
    }

    this.cache.set(commit, {
      timestamp: Date.now(),
      commit,
      result
    });
  }

  public async generateDiffReport(diff: AnalysisDiff): Promise<string> {
    return `# Analysis Diff Report

## Metric Changes
${Object.entries(diff.metrics).map(([key, value]) => 
  `- ${key}: ${value > 0 ? '+' : ''}${value}%`
).join('\n')}

## Documentation Changes
${Object.entries(diff.documentation).map(([key, value]) => 
  `- ${key}: ${value > 0 ? '+' : ''}${value}%`
).join('\n')}

## Pattern Changes
- Added: ${diff.patterns.added.length > 0 ? '\n  - ' + diff.patterns.added.join('\n  - ') : 'None'}
- Removed: ${diff.patterns.removed.length > 0 ? '\n  - ' + diff.patterns.removed.join('\n  - ') : 'None'}
- Modified: ${diff.patterns.modified.length > 0 ? '\n  - ' + diff.patterns.modified.join('\n  - ') : 'None'}

## Best Practice Changes
- Added: ${diff.bestPractices.added.length > 0 ? '\n  - ' + diff.bestPractices.added.join('\n  - ') : 'None'}
- Removed: ${diff.bestPractices.removed.length > 0 ? '\n  - ' + diff.bestPractices.removed.join('\n  - ') : 'None'}
- Modified: ${diff.bestPractices.modified.length > 0 ? '\n  - ' + diff.bestPractices.modified.join('\n  - ') : 'None'}
`;
  }
} 