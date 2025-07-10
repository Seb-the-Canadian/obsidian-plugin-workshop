import { PluginAnalyzer, AnalysisConfig } from './plugin-analyzer';
import * as fs from 'fs/promises';
import * as path from 'path';

async function analyzePlugin(
  token: string,
  owner: string,
  repo: string,
  outputDir: string = 'analysis-results'
) {
  try {
    console.log(`Analyzing plugin: ${owner}/${repo}`);

    const config: AnalysisConfig = {
      owner,
      repo,
      branch: 'main'
    };

    const analyzer = new PluginAnalyzer(token, config);
    const report = await analyzer.generateReport();

    // Create output directory if it doesn't exist
    await fs.mkdir(path.join(process.cwd(), outputDir), { recursive: true });

    // Save report
    const reportPath = path.join(
      process.cwd(),
      outputDir,
      `${owner}-${repo}-analysis.md`
    );
    await fs.writeFile(reportPath, report);

    console.log(`Analysis complete. Report saved to: ${reportPath}`);
  } catch (error) {
    console.error('Analysis failed:', error);
    process.exit(1);
  }
}

// Get arguments
const [token, owner, repo] = process.argv.slice(2);

if (!token || !owner || !repo) {
  console.error('Usage: ts-node analyze-plugin.ts <github-token> <owner> <repo>');
  process.exit(1);
}

analyzePlugin(token, owner, repo); 