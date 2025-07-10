import { AIPartnershipLogger } from '../ai-partnership-logging';
import { logger } from '../logging';
import * as fs from 'fs/promises';
import * as path from 'path';

jest.mock('../logging');
jest.mock('fs/promises');
jest.mock('path');

describe('AIPartnershipLogger', () => {
  let aiLogger: AIPartnershipLogger;
  
  beforeEach(() => {
    jest.clearAllMocks();
    aiLogger = new AIPartnershipLogger();
  });

  describe('startSession', () => {
    it('should create a new session with correct initial values', async () => {
      const title = 'Test Session';
      const role = 'Code Analysis';

      await aiLogger.startSession(title, role);

      expect(logger.logDevelopment).toHaveBeenCalledWith(
        'AI Partnership',
        'Started session: Test Session',
        expect.objectContaining({
          sessionId: expect.stringMatching(/^AI-\d{4}-\d{2}-\d{2}-\d{3}$/),
          role: 'Code Analysis'
        })
      );
    });
  });

  describe('addFrictionPoint', () => {
    it('should add friction point and log it', async () => {
      await aiLogger.startSession('Test', 'Analysis');

      const frictionPoint = {
        name: 'Test Friction',
        type: 'Technical',
        impact: {
          level: 'Medium',
          score: 7
        },
        duration: '30min',
        resolution: 'Fixed by X',
        status: 'Resolved'
      };

      await aiLogger.addFrictionPoint(frictionPoint);

      expect(logger.logTechnical).toHaveBeenCalledWith(
        'Friction Point',
        expect.objectContaining({
          category: 'AI Partnership',
          source: 'Test Friction'
        }),
        expect.objectContaining({
          success: false,
          details: 'Technical: Medium (7/10)'
        })
      );
    });

    it('should throw error if no active session', async () => {
      const frictionPoint = {
        name: 'Test',
        type: 'Technical',
        impact: { level: 'Low', score: 3 },
        duration: '10min',
        resolution: 'Fixed',
        status: 'Done'
      };

      await expect(aiLogger.addFrictionPoint(frictionPoint))
        .rejects
        .toThrow('No active session');
    });
  });

  describe('addKeyInsight', () => {
    it('should add insight and log it', async () => {
      await aiLogger.startSession('Test', 'Analysis');

      const insight = {
        title: 'Test Insight',
        category: 'Process',
        pattern: 'Recurring issue X',
        location: '/path/to/file',
        timestamp: '2025-07-10 14:30',
        validationStatus: 'Verified'
      };

      await aiLogger.addKeyInsight(insight);

      expect(logger.logLearning).toHaveBeenCalledWith(
        'Test Insight',
        expect.objectContaining({
          observation: 'Recurring issue X',
          impact: 'Direct application to AI partnership'
        })
      );
    });
  });

  describe('endSession', () => {
    it('should complete session and generate report', async () => {
      await aiLogger.startSession('Test Session', 'Analysis');
      
      await aiLogger.updateLearningMetrics({
        sessionDuration: '1h',
        interactionCount: 5,
        toolUsageRatio: { used: 3, available: 5 },
        patternRecognitionTime: '15min',
        resolutionEfficiency: { percentage: 85, justification: 'Good progress' }
      });

      await aiLogger.endSession();

      expect(fs.mkdir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
      expect(logger.logDevelopment).toHaveBeenCalledWith(
        'AI Partnership',
        expect.stringMatching(/^Completed session: Test Session$/),
        expect.objectContaining({
          duration: '1h',
          insights: 0,
          frictionPoints: 0
        })
      );
    });

    it('should throw error if no active session', async () => {
      await expect(aiLogger.endSession())
        .rejects
        .toThrow('No active session');
    });
  });
}); 