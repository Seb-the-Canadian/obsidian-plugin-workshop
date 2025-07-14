#!/usr/bin/env ts-node
"use strict";
/**
 * Plugin Analyzer - Main entry point for analyzing Obsidian plugins
 *
 * This script coordinates all analysis tools to provide comprehensive
 * insights into plugin code patterns, performance, and potential issues.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const RateLimitedAnalyzer_1 = require("../src/analyzers/RateLimitedAnalyzer");
const PatternDetector_1 = require("../src/analyzers/patterns/PatternDetector");
const StateAnalyzer_1 = require("../src/analyzers/StateAnalyzer");
const EventPatternAnalyzer_1 = require("../src/analyzers/EventPatternAnalyzer");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Default configuration
const defaultConfig = {
    rateLimit: {
        requestsPerSecond: 10,
        maxQueueSize: 100,
        priorityLevels: 3,
    },
    patterns: {
        enabled: true,
        categories: ['event', 'state', 'lifecycle', 'api', 'ui'],
        threshold: 0.7,
    },
    stateAnalysis: {
        enabled: true,
        trackGlobalState: true,
        trackLocalState: true,
        performanceMetrics: true,
    },
};
class PluginAnalyzer {
    constructor(config = defaultConfig) {
        this.rateLimitedAnalyzer = new RateLimitedAnalyzer_1.RateLimitedAnalyzer(config.rateLimit);
        this.patternDetector = new PatternDetector_1.PatternDetector();
        this.stateAnalyzer = new StateAnalyzer_1.StateAnalyzer(config.stateAnalysis);
        this.eventPatternAnalyzer = new EventPatternAnalyzer_1.EventPatternAnalyzer();
    }
    /**
     * Analyze a plugin directory
     */
    async analyzePlugin(pluginPath) {
        console.log(`🔍 Analyzing plugin: ${pluginPath}`);
        if (!fs.existsSync(pluginPath)) {
            console.error(`❌ Plugin directory not found: ${pluginPath}`);
            return;
        }
        const files = this.getSourceFiles(pluginPath);
        console.log(`📁 Found ${files.length} source files`);
        const analysisResults = {
            patterns: [],
            stateAnalysis: [],
            eventPatterns: [],
            performance: {},
        };
        // Process each file
        for (const file of files) {
            console.log(`📄 Processing: ${file}`);
            const content = fs.readFileSync(file, 'utf8');
            const relativePath = path.relative(pluginPath, file);
            // Run analyses
            const patterns = this.patternDetector.analyzeCode(content, relativePath);
            const stateResults = this.stateAnalyzer.analyzeCode(content, relativePath);
            const eventResults = this.eventPatternAnalyzer.analyzeCode(content, relativePath);
            analysisResults.patterns.push(...patterns);
            analysisResults.stateAnalysis.push(...stateResults);
            analysisResults.eventPatterns.push(...eventResults);
        }
        // Generate performance metrics
        analysisResults.performance = {
            state: this.stateAnalyzer.getPerformanceMetrics(),
            events: this.eventPatternAnalyzer.getPerformanceSummary(),
        };
        // Output results
        this.outputResults(analysisResults, pluginPath);
    }
    /**
     * Get all source files from plugin directory
     */
    getSourceFiles(pluginPath) {
        const files = [];
        const extensions = ['.ts', '.js', '.tsx', '.jsx'];
        const traverse = (dir) => {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    // Skip node_modules and other common directories
                    if (!['node_modules', 'dist', 'build', '.git'].includes(item)) {
                        traverse(fullPath);
                    }
                }
                else if (extensions.some(ext => item.endsWith(ext))) {
                    files.push(fullPath);
                }
            }
        };
        traverse(pluginPath);
        return files;
    }
    /**
     * Output analysis results
     */
    outputResults(results, pluginPath) {
        console.log('\n📊 Analysis Results\n');
        console.log('='.repeat(50));
        // Pattern Detection Results
        console.log(`\n🔍 Pattern Detection (${results.patterns.length} patterns found)`);
        console.log('-'.repeat(30));
        const patternSummary = this.summarizePatterns(results.patterns);
        Object.entries(patternSummary).forEach(([category, count]) => {
            console.log(`  ${category}: ${count} patterns`);
        });
        // State Analysis Results
        console.log(`\n📊 State Analysis (${results.stateAnalysis.length} variables tracked)`);
        console.log('-'.repeat(30));
        const stateMetrics = results.performance.state;
        console.log(`  Total state variables: ${stateMetrics.totalStateVariables}`);
        console.log(`  High frequency accesses: ${stateMetrics.highFrequencyAccesses}`);
        console.log(`  Read-only variables: ${stateMetrics.readOnlyVariables}`);
        console.log(`  Write-heavy variables: ${stateMetrics.writeHeavyVariables}`);
        console.log(`  Average access frequency: ${stateMetrics.averageAccessFrequency}`);
        // Event Pattern Results
        console.log(`\n⚡ Event Pattern Analysis (${results.eventPatterns.length} handlers found)`);
        console.log('-'.repeat(30));
        const eventMetrics = results.performance.events;
        console.log(`  Total handlers: ${eventMetrics.totalHandlers}`);
        console.log(`  Average complexity: ${eventMetrics.averageComplexity}ms`);
        console.log(`  High risk handlers: ${eventMetrics.highRiskHandlers}`);
        console.log(`  Memory leak risk: ${eventMetrics.memoryLeakRisk}`);
        // Recommendations
        console.log('\n💡 Recommendations');
        console.log('-'.repeat(30));
        this.generateRecommendations(results);
        // Save detailed report
        const reportPath = path.join(pluginPath, 'analysis-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
        console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    }
    /**
     * Summarize patterns by category
     */
    summarizePatterns(patterns) {
        const summary = {};
        patterns.forEach(pattern => {
            summary[pattern.category] = (summary[pattern.category] || 0) + 1;
        });
        return summary;
    }
    /**
     * Generate recommendations based on analysis
     */
    generateRecommendations(results) {
        const recommendations = [];
        // Pattern-based recommendations
        if (results.patterns.length > 50) {
            recommendations.push('Consider refactoring to reduce pattern complexity');
        }
        // State-based recommendations
        if (results.performance.state.highFrequencyAccesses > 5) {
            recommendations.push('Optimize high-frequency state access patterns');
        }
        // Event-based recommendations
        if (results.performance.events.memoryLeakRisk > 0) {
            recommendations.push('Address potential memory leaks in event handlers');
        }
        if (results.performance.events.highRiskHandlers > 3) {
            recommendations.push('Optimize complex event handlers for better performance');
        }
        // General recommendations
        if (recommendations.length === 0) {
            recommendations.push('Plugin analysis shows good code quality patterns');
        }
        recommendations.forEach((rec, index) => {
            console.log(`  ${index + 1}. ${rec}`);
        });
    }
}
// Main execution
async function main() {
    const args = process.argv.slice(2);
    const pluginPath = args[0] || process.cwd();
    console.log('🚀 Obsidian Plugin Workshop - Plugin Analyzer');
    console.log('='.repeat(50));
    try {
        const analyzer = new PluginAnalyzer();
        await analyzer.analyzePlugin(pluginPath);
    }
    catch (error) {
        console.error('❌ Analysis failed:', error);
        process.exit(1);
    }
}
// Execute if run directly
if (require.main === module) {
    main();
}
//# sourceMappingURL=plugin-analyzer.js.map