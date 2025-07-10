import { logger } from '../logging';
import * as fs from 'fs/promises';
import * as path from 'path';

jest.mock('fs/promises');
jest.mock('path');

describe('LoggingSystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
    (fs.appendFile as jest.Mock).mockResolvedValue(undefined);
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
  });

  describe('logDevelopment', () => {
    it('should create a development log', async () => {
      const category = 'Test';
      const description = 'Test description';
      const metrics = {
        impact: 'High',
        coverage: 90,
        nextSteps: 'Continue testing'
      };

      await logger.logDevelopment(category, description, metrics);

      expect(fs.appendFile).toHaveBeenCalled();
      const logContent = (fs.appendFile as jest.Mock).mock.calls[0][1];
      expect(logContent).toContain('[DEV-');
      expect(logContent).toContain('Test: Test description');
      expect(logContent).toContain('Impact: High');
    });
  });

  describe('logTechnical', () => {
    it('should create a technical decision log', async () => {
      const decision = 'Use TypeScript';
      const context = {
        category: 'Language Choice',
        timestamp: '20250710',
        source: 'Architecture Review'
      };
      const outcome = {
        success: true,
        details: 'Implemented successfully'
      };

      await logger.logTechnical(decision, context, outcome);

      expect(fs.appendFile).toHaveBeenCalled();
      const logContent = (fs.appendFile as jest.Mock).mock.calls[0][1];
      expect(logContent).toContain('[TECH-');
      expect(logContent).toContain('Use TypeScript');
      expect(logContent).toContain('Implemented');
    });
  });

  describe('logLearning', () => {
    it('should create a learning insight log', async () => {
      const insight = 'Pattern Detection';
      const analysis = {
        observation: 'Common code structures found',
        impact: 'High reusability potential',
        recommendations: ['Extract shared components', 'Create documentation']
      };

      await logger.logLearning(insight, analysis);

      expect(fs.appendFile).toHaveBeenCalled();
      const logContent = (fs.appendFile as jest.Mock).mock.calls[0][1];
      expect(logContent).toContain('[LEARN-');
      expect(logContent).toContain('Pattern Detection');
      expect(logContent).toContain('Extract shared components');
    });
  });

  describe('logQuality', () => {
    it('should create a quality metrics log', async () => {
      const metric = 'Test Coverage';
      const current = 85;
      const target = 90;

      await logger.logQuality(metric, current, target);

      expect(fs.appendFile).toHaveBeenCalled();
      const logContent = (fs.appendFile as jest.Mock).mock.calls[0][1];
      expect(logContent).toContain('[QUAL-');
      expect(logContent).toContain('Test Coverage');
      expect(logContent).toContain('below target');
    });
  });

  describe('generateWeeklyReport', () => {
    it('should generate a weekly report', async () => {
      // Add some test logs
      await logger.logDevelopment('Test', 'Development progress', { impact: 'Medium' });
      await logger.logTechnical('Decision', { category: 'Test', timestamp: '', source: '' }, { success: true, details: '' });
      await logger.logLearning('Insight', { observation: 'Test', impact: 'High', recommendations: ['Test'] });
      await logger.logQuality('Metric', 80, 100);

      const report = await logger.generateWeeklyReport();

      expect(fs.writeFile).toHaveBeenCalled();
      expect(report).toContain('Weekly Meta-Log Report');
      expect(report).toContain('Development Progress');
      expect(report).toContain('Technical Decisions');
      expect(report).toContain('Learning Insights');
      expect(report).toContain('Quality Metrics');
    });
  });
}); 