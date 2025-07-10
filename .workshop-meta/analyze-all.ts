import { PluginAnalyzer, AnalysisConfig } from './plugin-analyzer';
import { DocsAnalyzer } from './docs-analyzer';
import * as fs from 'fs/promises';
import * as path from 'path';

interface FullAnalysisResult {
  code: {
    patterns: any[];
    bestPractices: any[];
    metrics: {
      codeQuality: number;
      testCoverage: number;
      documentation: number;
      performance: number;
    };
  };
  docs: {
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
  };
}

async function analyzePlugin(
  token: string,
  owner: string,
  repo: string,
  outputDir: string = 'analysis-results'
): Promise<void> {
  try {
    console.log(`Analyzing plugin: ${owner}/${repo}`);

    // Initialize analyzers
    const codeConfig: AnalysisConfig = {
      owner,
      repo,
      branch: 'main'
    };

    const codeAnalyzer = new PluginAnalyzer(token, codeConfig);
    const docsAnalyzer = new DocsAnalyzer(`https://github.com/${owner}/${repo}/wiki`);

    // Run analyses in parallel
    const [codeAnalysis, docsAnalysis] = await Promise.all([
      codeAnalyzer.analyze(),
      docsAnalyzer.analyze()
    ]);

    // Combine results
    const fullAnalysis: FullAnalysisResult = {
      code: codeAnalysis,
      docs: docsAnalysis
    };

    // Create output directory
    await fs.mkdir(path.join(process.cwd(), outputDir), { recursive: true });

    // Generate and save reports
    const codeReport = await codeAnalyzer.generateReport();
    const docsReport = await docsAnalyzer.generateReport();

    const combinedReport = `# Complete Plugin Analysis Report

## Code Analysis
${codeReport}

## Documentation Analysis
${docsReport}

## Combined Insights

### Implementation Patterns vs Documentation
${compareImplementationWithDocs(fullAnalysis)}

### Best Practices Analysis
${analyzeBestPractices(fullAnalysis)}

### Quality Metrics
${analyzeQualityMetrics(fullAnalysis)}

### Recommendations
${generateRecommendations(fullAnalysis)}
`;

    // Save reports
    const basePath = path.join(process.cwd(), outputDir, `${owner}-${repo}`);
    await fs.writeFile(`${basePath}-code-analysis.md`, codeReport);
    await fs.writeFile(`${basePath}-docs-analysis.md`, docsReport);
    await fs.writeFile(`${basePath}-combined-analysis.md`, combinedReport);

    console.log(`Analysis complete. Reports saved to: ${basePath}-*-analysis.md`);
  } catch (error) {
    console.error('Analysis failed:', error);
    process.exit(1);
  }
}

function compareImplementationWithDocs(analysis: FullAnalysisResult): string {
  const { code, docs } = analysis;
  
  // Compare API implementations with documentation
  const implementedPatterns = new Set(code.patterns.map(p => p.name));
  const documentedApis = new Set(docs.api.map(a => a.name));

  const undocumented = [...implementedPatterns].filter(p => !documentedApis.has(p));
  const unimplemented = [...documentedApis].filter(a => !implementedPatterns.has(a));

  return `
### API Coverage

#### Undocumented Features
${undocumented.map(p => `- ${p}`).join('\n')}

#### Unimplemented Documentation
${unimplemented.map(a => `- ${a}`).join('\n')}
`;
}

function analyzeBestPractices(analysis: FullAnalysisResult): string {
  const { code, docs } = analysis;
  
  return `
### Code Best Practices
${code.bestPractices.map(bp => `- ${bp.name}: ${bp.description}`).join('\n')}

### Documentation Best Practices
- API Documentation: ${docs.api.length > 0 ? 'Present' : 'Missing'}
- Usage Examples: ${docs.examples.length > 0 ? 'Present' : 'Missing'}
- Configuration Guide: ${docs.configuration.length > 0 ? 'Present' : 'Missing'}
- Installation Instructions: ${docs.installation.length > 0 ? 'Present' : 'Missing'}
`;
}

function analyzeQualityMetrics(analysis: FullAnalysisResult): string {
  const { code } = analysis;
  
  return `
### Code Quality Metrics
- Code Quality: ${code.metrics.codeQuality}%
- Test Coverage: ${code.metrics.testCoverage}%
- Documentation: ${code.metrics.documentation}%
- Performance: ${code.metrics.performance}%
`;
}

function generateRecommendations(analysis: FullAnalysisResult): string {
  const { code, docs } = analysis;
  const recommendations: string[] = [];

  // Code recommendations
  if (code.metrics.testCoverage < 80) {
    recommendations.push('- Increase test coverage to at least 80%');
  }

  if (code.metrics.documentation < 90) {
    recommendations.push('- Improve code documentation');
  }

  // Documentation recommendations
  if (docs.api.length === 0) {
    recommendations.push('- Add API documentation');
  }

  if (docs.examples.length < 3) {
    recommendations.push('- Add more usage examples');
  }

  if (docs.configuration.length === 0) {
    recommendations.push('- Add configuration documentation');
  }

  return `
### Recommended Improvements
${recommendations.join('\n')}
`;
}

// Get arguments
const [token, owner, repo] = process.argv.slice(2);

if (!token || !owner || !repo) {
  console.error('Usage: ts-node analyze-all.ts <github-token> <owner> <repo>');
  process.exit(1);
}

analyzePlugin(token, owner, repo); 