import { logger } from './logging';
import * as fs from 'fs/promises';
import * as path from 'path';

// Enhanced interfaces to capture project context and collaboration patterns
interface ProjectContext {
  name: string;
  phase: string;
  type: 'Strategic Development' | 'Technical Implementation' | 'Process Optimization' | 'Meta Analysis';
  collaborationPattern: string;
  businessContext?: string;
  technicalContext?: string;
}

interface CollaborationMetrics {
  functionalEffectiveness: {
    analysisQuality: number;
    processEfficiency: number;
    strategicValue: number;
  };
  democraticCharacteristics: {
    inclusiveDesign: boolean;
    transparencyLevel: number;
    justiceConsiderations: string[];
  };
  skillsDeveloped: string[];
  emergingPatterns: string[];
}

interface AISession {
  id: string;
  title: string;
  startTime: string;
  endTime?: string;
  primaryRole: string;
  patternType: string;
  effectivenessRating: number;
  improvementAreas: string[];
  projectContext: ProjectContext;
  collaborationMetrics: CollaborationMetrics;
}

interface BestPractice {
  title: string;
  purpose: string;
  impact: string;
  registrationPath: string;
  implementationDate: string;
}

interface FrictionPoint {
  name: string;
  type: string;
  impact: {
    level: string;
    score: number;
  };
  duration: string;
  resolution: string;
  status: string;
}

interface KeyInsight {
  title: string;
  category: string;
  pattern: string;
  location: string;
  timestamp: string;
  validationStatus: string;
}

interface LearningMetrics {
  sessionDuration: string;
  interactionCount: number;
  toolUsageRatio: {
    used: number;
    available: number;
  };
  patternRecognitionTime: string;
  resolutionEfficiency: {
    percentage: number;
    justification: string;
  };
  metaCognitiveInsights: string[];
  professionalDevelopment: {
    skillsEnhanced: string[];
    frameworksApplied: string[];
    strategicOutcomes: string[];
  };
}

interface AIPartnershipLog {
  session: AISession;
  bestPractices: BestPractice[];
  frictionPoints: FrictionPoint[];
  keyInsights: KeyInsight[];
  classification: {
    type: string;
    storagePath: string;
    extractionPoints: string[];
    reviewDate: string;
    projectTags: string[];
    collaborationPhase: string;
    businessImpact: string;
  };
  learningMetrics: LearningMetrics;
  followUpActions: Array<{
    action: string;
    priority: string;
    projectAlignment: string;
    strategicValue: string;
  }>;
  relatedLogs: {
    previous?: string;
    next?: string;
    projectLogs: string[];
    strategicContext: string[];
  };
  status: 'Draft' | 'Complete' | 'Verified';
  verification: 'Required' | 'Completed';
  lastUpdated: string;
}

export class AIPartnershipLogger {
  private baseDir: string;
  private currentSession: AIPartnershipLog | null = null;
  private sessionCounter: number = 0;
  private workshopHubDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), '.workshop-meta', 'logs', 'ai-partnership');
    this.workshopHubDir = path.join(process.cwd(), '..', '..', '🏗️ Workshop Management Hub', 'Meta-Analysis & Logging');
  }

  private getTimestamp(date = new Date()): string {
    return date.toLocaleString('en-US', { 
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  private getDateString(date = new Date()): string {
    return date.toISOString().split('T')[0];
  }

  async startSession(
    title: string, 
    primaryRole: string,
    projectContext: ProjectContext
  ): Promise<void> {
    this.sessionCounter++;
    const sessionId = `AI-${this.getDateString()}-${this.sessionCounter.toString().padStart(3, '0')}`;
    
    this.currentSession = {
      session: {
        id: sessionId,
        title,
        startTime: this.getTimestamp(),
        primaryRole,
        patternType: '',
        effectivenessRating: 0,
        improvementAreas: [],
        projectContext,
        collaborationMetrics: {
          functionalEffectiveness: {
            analysisQuality: 0,
            processEfficiency: 0,
            strategicValue: 0
          },
          democraticCharacteristics: {
            inclusiveDesign: true,
            transparencyLevel: 0,
            justiceConsiderations: []
          },
          skillsDeveloped: [],
          emergingPatterns: []
        }
      },
      bestPractices: [],
      frictionPoints: [],
      keyInsights: [],
      classification: {
        type: 'AI Partnership',
        storagePath: path.join(this.baseDir, `${sessionId}.md`),
        extractionPoints: [],
        reviewDate: this.getDateString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        projectTags: [projectContext.name, projectContext.phase],
        collaborationPhase: projectContext.type,
        businessImpact: projectContext.businessContext || 'N/A'
      },
      learningMetrics: {
        sessionDuration: '',
        interactionCount: 0,
        toolUsageRatio: { used: 0, available: 0 },
        patternRecognitionTime: '',
        resolutionEfficiency: { percentage: 0, justification: '' },
        metaCognitiveInsights: [],
        professionalDevelopment: {
          skillsEnhanced: [],
          frameworksApplied: [],
          strategicOutcomes: []
        }
      },
      followUpActions: [],
      relatedLogs: {
        projectLogs: [],
        strategicContext: []
      },
      status: 'Draft',
      verification: 'Required',
      lastUpdated: this.getTimestamp()
    };

    // Create initial log entry with enhanced context
    await logger.logDevelopment('AI Partnership', `Started session: ${title}`, {
      sessionId,
      startTime: this.currentSession.session.startTime,
      role: primaryRole,
      project: projectContext.name,
      phase: projectContext.phase,
      type: projectContext.type
    });

    // Create high-level meta-analysis entry
    await this.createMetaAnalysisEntry();
  }

  private async createMetaAnalysisEntry(): Promise<void> {
    if (!this.currentSession) throw new Error('No active session');

    const metaAnalysisPath = path.join(
      this.workshopHubDir,
      `${this.getDateString()}_${this.currentSession.session.projectContext.name.replace(/\s+/g, '-')}-Analysis.md`
    );

    const metaAnalysisContent = this.generateMetaAnalysisContent();
    await fs.writeFile(metaAnalysisPath, metaAnalysisContent, 'utf8');

    // Update session with reference to meta-analysis
    this.currentSession.relatedLogs.strategicContext.push(metaAnalysisPath);
  }

  private generateMetaAnalysisContent(): string {
    if (!this.currentSession) throw new Error('No active session');

    const ctx = this.currentSession.session.projectContext;
    
    return `# 🧠 ${ctx.name} Session Meta-Analysis

**Session Date**: ${this.getDateString()}
**Session Type**: ${ctx.type}
**Duration**: Ongoing
**Context**: ${ctx.businessContext || ctx.technicalContext || 'N/A'}

## 📊 **Session Summary**

### **Key Transformation**
- **From**: Initial state
- **To**: Target state
- **Strategic Insight**: ${ctx.collaborationPattern}

### **Critical Breakthroughs**
1. TBD during session

### **Reality-Check Moments**
- TBD during session

## 🎯 **Strategic Outcomes**

### **Project Alignment**
- **${ctx.name}** - ${ctx.phase}
- **Collaboration Pattern** - ${ctx.collaborationPattern}
${ctx.businessContext ? `- **Business Context** - ${ctx.businessContext}` : ''}
${ctx.technicalContext ? `- **Technical Context** - ${ctx.technicalContext}` : ''}

### **Technical Foundation**
- TBD during session

## 🏆 **Best Practices Identified**
TBD during session

## ⚡ **Workflow Friction Points**
TBD during session

## 💎 **High-Value Insights**
TBD during session

## 🔄 **Conversation Evolution**
TBD during session

## 🎯 **Implementation Readiness**
TBD during session

---

**Session Status**: In Progress
**Last Updated**: ${this.getTimestamp()}`;
  }

  async addFrictionPoint(point: FrictionPoint): Promise<void> {
    if (!this.currentSession) throw new Error('No active session');
    
    this.currentSession.frictionPoints.push(point);
    this.currentSession.lastUpdated = this.getTimestamp();

    await logger.logTechnical('Friction Point', {
      category: 'AI Partnership',
      timestamp: this.getTimestamp(),
      source: point.name
    }, {
      success: false,
      details: `${point.type}: ${point.impact.level} (${point.impact.score}/10)`
    });
  }

  async addKeyInsight(insight: KeyInsight): Promise<void> {
    if (!this.currentSession) throw new Error('No active session');
    
    this.currentSession.keyInsights.push(insight);
    this.currentSession.lastUpdated = this.getTimestamp();

    await logger.logLearning(insight.title, {
      observation: insight.pattern,
      impact: 'Direct application to AI partnership',
      recommendations: ['Document pattern', 'Share with team', 'Update guidelines']
    });
  }

  async updateLearningMetrics(metrics: Partial<LearningMetrics>): Promise<void> {
    if (!this.currentSession) throw new Error('No active session');
    
    this.currentSession.learningMetrics = {
      ...this.currentSession.learningMetrics,
      ...metrics
    };
    this.currentSession.lastUpdated = this.getTimestamp();

    await logger.logQuality('Learning Metrics', 
      metrics.resolutionEfficiency?.percentage || 0,
      100
    );
  }

  async updateMetaAnalysis(
    breakthroughs: string[],
    realityChecks: string[],
    technicalFoundation: string[],
    insights: string[]
  ): Promise<void> {
    if (!this.currentSession) throw new Error('No active session');

    const metaAnalysisPath = this.currentSession.relatedLogs.strategicContext[0];
    if (!metaAnalysisPath) throw new Error('No meta-analysis file found');

    const content = await fs.readFile(metaAnalysisPath, 'utf8');
    const updatedContent = content
      .replace('1. TBD during session', breakthroughs.map((b, i) => `${i + 1}. ${b}`).join('\n'))
      .replace('- TBD during session', realityChecks.map(r => `- ${r}`).join('\n'))
      .replace('### **Technical Foundation**\n- TBD during session', 
        `### **Technical Foundation**\n${technicalFoundation.map(t => `- ${t}`).join('\n')}`)
      .replace('## 💎 **High-Value Insights**\nTBD during session',
        `## 💎 **High-Value Insights**\n${insights.map(i => `- ${i}`).join('\n')}`);

    await fs.writeFile(metaAnalysisPath, updatedContent, 'utf8');
  }

  async endSession(): Promise<void> {
    if (!this.currentSession) throw new Error('No active session');
    
    this.currentSession.session.endTime = this.getTimestamp();
    this.currentSession.status = 'Complete';
    this.currentSession.lastUpdated = this.getTimestamp();

    // Generate session report
    const report = this.generateSessionReport();
    
    // Save to file
    await fs.mkdir(this.baseDir, { recursive: true });
    await fs.writeFile(
      this.currentSession.classification.storagePath,
      report,
      'utf8'
    );

    // Update meta-analysis status
    if (this.currentSession.relatedLogs.strategicContext[0]) {
      const metaContent = await fs.readFile(this.currentSession.relatedLogs.strategicContext[0], 'utf8');
      const updatedContent = metaContent.replace('**Session Status**: In Progress', '**Session Status**: Complete');
      await fs.writeFile(this.currentSession.relatedLogs.strategicContext[0], updatedContent, 'utf8');
    }

    // Log completion with enhanced metrics
    await logger.logDevelopment('AI Partnership', `Completed session: ${this.currentSession.session.title}`, {
      sessionId: this.currentSession.session.id,
      duration: this.currentSession.learningMetrics.sessionDuration,
      insights: this.currentSession.keyInsights.length,
      frictionPoints: this.currentSession.frictionPoints.length,
      project: this.currentSession.session.projectContext.name,
      phase: this.currentSession.session.projectContext.phase,
      effectiveness: {
        analysis: this.currentSession.session.collaborationMetrics.functionalEffectiveness.analysisQuality,
        process: this.currentSession.session.collaborationMetrics.functionalEffectiveness.processEfficiency,
        value: this.currentSession.session.collaborationMetrics.functionalEffectiveness.strategicValue
      }
    });
  }

  private generateSessionReport(): string {
    if (!this.currentSession) throw new Error('No active session');

    return `# Meta Log: ${this.currentSession.session.title}
**Date**: ${this.getDateString()}
**Time**: ${this.getTimestamp().split(' ')[1]} [UTC-8]
**Session ID**: ${this.currentSession.session.id}

## Project Context
- **Project**: ${this.currentSession.session.projectContext.name}
- **Phase**: ${this.currentSession.session.projectContext.phase}
- **Type**: ${this.currentSession.session.projectContext.type}
- **Pattern**: ${this.currentSession.session.projectContext.collaborationPattern}
${this.currentSession.session.projectContext.businessContext ? `- **Business Context**: ${this.currentSession.session.projectContext.businessContext}` : ''}
${this.currentSession.session.projectContext.technicalContext ? `- **Technical Context**: ${this.currentSession.session.projectContext.technicalContext}` : ''}

## AI Involvement Analysis
- **Primary Role**: ${this.currentSession.session.primaryRole}
- **Pattern Type**: ${this.currentSession.session.patternType}
- **Effectiveness Rating**: ${this.currentSession.session.effectivenessRating}/10
- **Areas for Improvement**: 
${this.currentSession.session.improvementAreas.map(area => `  - ${area}`).join('\n')}

## Collaboration Metrics
### Functional Effectiveness
- Analysis Quality: ${this.currentSession.session.collaborationMetrics.functionalEffectiveness.analysisQuality}/10
- Process Efficiency: ${this.currentSession.session.collaborationMetrics.functionalEffectiveness.processEfficiency}/10
- Strategic Value: ${this.currentSession.session.collaborationMetrics.functionalEffectiveness.strategicValue}/10

### Democratic Characteristics
- Inclusive Design: ${this.currentSession.session.collaborationMetrics.democraticCharacteristics.inclusiveDesign ? 'Yes' : 'No'}
- Transparency Level: ${this.currentSession.session.collaborationMetrics.democraticCharacteristics.transparencyLevel}/10
- Justice Considerations:
${this.currentSession.session.collaborationMetrics.democraticCharacteristics.justiceConsiderations.map(c => `  - ${c}`).join('\n')}

### Skills Developed
${this.currentSession.session.collaborationMetrics.skillsDeveloped.map(s => `- ${s}`).join('\n')}

### Emerging Patterns
${this.currentSession.session.collaborationMetrics.emergingPatterns.map(p => `- ${p}`).join('\n')}

## Best Practice Identification
${this.currentSession.bestPractices.map(bp => `
**Title**: ${bp.title}
- **Purpose**: ${bp.purpose}
- **Impact**: ${bp.impact}
- **Registration**: \`${bp.registrationPath}\`
- **Implementation Date**: ${bp.implementationDate}
`).join('\n')}

## Friction Points
${this.currentSession.frictionPoints.map((fp, i) => `
${i + 1}. **${fp.name}**
   - Type: ${fp.type}
   - Impact: ${fp.impact.level} [${fp.impact.score}/10]
   - Duration: ${fp.duration}
   - Resolution: ${fp.resolution}
   - Status: ${fp.status}
`).join('\n')}

## Key Insights
${this.currentSession.keyInsights.map((ki, i) => `
${i + 1}. **${ki.title}**
   - Category: ${ki.category}
   - Pattern: ${ki.pattern}
   - Location: \`${ki.location}\`
   - Timestamp: ${ki.timestamp}
   - Validation Status: ${ki.validationStatus}
`).join('\n')}

## Professional Development
### Skills Enhanced
${this.currentSession.learningMetrics.professionalDevelopment.skillsEnhanced.map(s => `- ${s}`).join('\n')}

### Frameworks Applied
${this.currentSession.learningMetrics.professionalDevelopment.frameworksApplied.map(f => `- ${f}`).join('\n')}

### Strategic Outcomes
${this.currentSession.learningMetrics.professionalDevelopment.strategicOutcomes.map(o => `- ${o}`).join('\n')}

## Meta-Cognitive Insights
${this.currentSession.learningMetrics.metaCognitiveInsights.map(i => `- ${i}`).join('\n')}

## Classification
- **Type**: ${this.currentSession.classification.type}
- **Action**: Store in \`${this.currentSession.classification.storagePath}\`
- **Extraction**: ${this.currentSession.classification.extractionPoints.join(', ')}
- **Review Date**: ${this.currentSession.classification.reviewDate}
- **Project Tags**: ${this.currentSession.classification.projectTags.join(', ')}
- **Collaboration Phase**: ${this.currentSession.classification.collaborationPhase}
- **Business Impact**: ${this.currentSession.classification.businessImpact}

## Learning Metrics
- **Session Duration**: ${this.currentSession.learningMetrics.sessionDuration}
- **Interaction Count**: ${this.currentSession.learningMetrics.interactionCount}
- **Tool Usage Ratio**: ${this.currentSession.learningMetrics.toolUsageRatio.used}/${this.currentSession.learningMetrics.toolUsageRatio.available}
- **Pattern Recognition Time**: ${this.currentSession.learningMetrics.patternRecognitionTime}
- **Resolution Efficiency**: ${this.currentSession.learningMetrics.resolutionEfficiency.percentage}% (${this.currentSession.learningMetrics.resolutionEfficiency.justification})

## Follow-up Actions
${this.currentSession.followUpActions.map((action, i) => 
  `${i + 1}. ${action.action} [Priority: ${action.priority}] [Project: ${action.projectAlignment}] [Value: ${action.strategicValue}]`
).join('\n')}

## Related Logs
${this.currentSession.relatedLogs.previous ? `- Previous: ${this.currentSession.relatedLogs.previous}` : ''}
${this.currentSession.relatedLogs.next ? `- Next: ${this.currentSession.relatedLogs.next}` : ''}
- **Project Logs**: ${this.currentSession.relatedLogs.projectLogs.join(', ')}
- **Strategic Context**: ${this.currentSession.relatedLogs.strategicContext.join(', ')}

---
**Log Status**: ${this.currentSession.status}
**Verification**: ${this.currentSession.verification}
**Last Updated**: ${this.currentSession.lastUpdated}`;
  }
}

export const aiLogger = new AIPartnershipLogger(); 