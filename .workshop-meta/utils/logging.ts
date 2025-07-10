import * as fs from 'fs/promises';
import * as path from 'path';

interface LogMetadata {
  [key: string]: string | number | boolean | object;
}

interface LogResult {
  success: boolean;
  details?: string;
}

export class Logger {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), '.workshop-meta', 'logs');
  }

  private async writeLog(category: string, message: string, metadata: LogMetadata = {}, result?: LogResult): Promise<void> {
    const timestamp = new Date().toISOString();
    const logDir = path.join(this.baseDir, category.toLowerCase());
    const logFile = path.join(logDir, `${new Date().toISOString().split('T')[0]}.md`);

    const logEntry = `[${timestamp}] ${message}
${Object.entries(metadata).map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`).join('\n')}
${result ? `Result: ${result.success ? 'Success' : 'Failure'}${result.details ? ` - ${result.details}` : ''}` : ''}
---\n`;

    await fs.mkdir(logDir, { recursive: true });
    await fs.appendFile(logFile, logEntry);
  }

  async logDevelopment(category: string, message: string, metadata: LogMetadata = {}): Promise<void> {
    await this.writeLog('dev', `[${category}] ${message}`, metadata);
  }

  async logTechnical(category: string, metadata: LogMetadata = {}, result: LogResult): Promise<void> {
    await this.writeLog('tech', `[${category}]`, metadata, result);
  }

  async logLearning(title: string, metadata: LogMetadata = {}): Promise<void> {
    await this.writeLog('learn', `[${title}]`, metadata);
  }

  async logQuality(metric: string, value: number, target: number): Promise<void> {
    await this.writeLog('qual', `[${metric}]`, {
      value,
      target,
      percentage: Math.round((value / target) * 100)
    });
  }
}

export const logger = new Logger(); 