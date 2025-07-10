import * as ts from 'typescript';

interface MetricsResult {
  cyclomaticComplexity: number;
  dependencyGraph: DependencyNode[];
  duplicateCode: DuplicateCodeBlock[];
  overallScore: number;
}

interface DependencyNode {
  name: string;
  type: 'class' | 'function' | 'interface' | 'type' | 'variable';
  dependencies: string[];
  weight: number;
}

interface DuplicateCodeBlock {
  code: string;
  locations: CodeLocation[];
  similarity: number;
}

interface CodeLocation {
  file: string;
  startLine: number;
  endLine: number;
}

export class CodeMetrics {
  private sourceFile: ts.SourceFile;
  private program: ts.Program;
  private typeChecker: ts.TypeChecker;

  constructor(content: string, fileName: string) {
    const compilerHost = ts.createCompilerHost({});
    const originalGetSourceFile = compilerHost.getSourceFile;
    compilerHost.getSourceFile = (filename: string) => {
      if (filename === fileName) {
        return ts.createSourceFile(filename, content, ts.ScriptTarget.Latest, true);
      }
      return originalGetSourceFile.call(compilerHost, filename, ts.ScriptTarget.Latest);
    };

    this.program = ts.createProgram([fileName], {}, compilerHost);
    this.typeChecker = this.program.getTypeChecker();
    this.sourceFile = this.program.getSourceFile(fileName)!;
  }

  public analyze(): MetricsResult {
    return {
      cyclomaticComplexity: this.calculateCyclomaticComplexity(),
      dependencyGraph: this.analyzeDependencies(),
      duplicateCode: this.detectDuplicateCode(),
      overallScore: 0 // Will be calculated based on all metrics
    };
  }

  private calculateCyclomaticComplexity(): number {
    let complexity = 1; // Base complexity

    const incrementComplexity = (node: ts.Node) => {
      switch (node.kind) {
        case ts.SyntaxKind.IfStatement:
        case ts.SyntaxKind.ConditionalExpression:
          complexity++;
          break;
        case ts.SyntaxKind.ForStatement:
        case ts.SyntaxKind.ForInStatement:
        case ts.SyntaxKind.ForOfStatement:
        case ts.SyntaxKind.WhileStatement:
        case ts.SyntaxKind.DoStatement:
          complexity++;
          break;
        case ts.SyntaxKind.CaseClause:
        case ts.SyntaxKind.CatchClause:
          complexity++;
          break;
        case ts.SyntaxKind.BinaryExpression:
          const binaryExpr = node as ts.BinaryExpression;
          if (
            binaryExpr.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
            binaryExpr.operatorToken.kind === ts.SyntaxKind.BarBarToken
          ) {
            complexity++;
          }
          break;
      }

      ts.forEachChild(node, incrementComplexity);
    };

    incrementComplexity(this.sourceFile);
    return complexity;
  }

  private analyzeDependencies(): DependencyNode[] {
    const dependencies: DependencyNode[] = [];
    const visited = new Set<string>();

    const visit = (node: ts.Node) => {
      if (ts.isClassDeclaration(node) && node.name) {
        const className = node.name.text;
        if (!visited.has(className)) {
          visited.add(className);
          const deps = this.findDependencies(node);
          dependencies.push({
            name: className,
            type: 'class',
            dependencies: deps,
            weight: deps.length
          });
        }
      } else if (ts.isFunctionDeclaration(node) && node.name) {
        const funcName = node.name.text;
        if (!visited.has(funcName)) {
          visited.add(funcName);
          const deps = this.findDependencies(node);
          dependencies.push({
            name: funcName,
            type: 'function',
            dependencies: deps,
            weight: deps.length
          });
        }
      } else if (ts.isInterfaceDeclaration(node) && node.name) {
        const interfaceName = node.name.text;
        if (!visited.has(interfaceName)) {
          visited.add(interfaceName);
          const deps = this.findDependencies(node);
          dependencies.push({
            name: interfaceName,
            type: 'interface',
            dependencies: deps,
            weight: deps.length
          });
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(this.sourceFile);
    return dependencies;
  }

  private findDependencies(node: ts.Node): string[] {
    const dependencies = new Set<string>();

    const visit = (node: ts.Node) => {
      if (ts.isIdentifier(node)) {
        const symbol = this.typeChecker.getSymbolAtLocation(node);
        if (symbol) {
          dependencies.add(symbol.getName());
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(node);
    return Array.from(dependencies);
  }

  private detectDuplicateCode(): DuplicateCodeBlock[] {
    const duplicates: DuplicateCodeBlock[] = [];
    const codeBlocks = this.extractCodeBlocks();

    for (let i = 0; i < codeBlocks.length; i++) {
      for (let j = i + 1; j < codeBlocks.length; j++) {
        const similarity = this.calculateSimilarity(codeBlocks[i], codeBlocks[j]);
        if (similarity > 0.8) { // 80% similarity threshold
          duplicates.push({
            code: codeBlocks[i],
            locations: [
              {
                file: this.sourceFile.fileName,
                startLine: this.getLineNumber(codeBlocks[i]),
                endLine: this.getLineNumber(codeBlocks[i]) + codeBlocks[i].split('\n').length
              },
              {
                file: this.sourceFile.fileName,
                startLine: this.getLineNumber(codeBlocks[j]),
                endLine: this.getLineNumber(codeBlocks[j]) + codeBlocks[j].split('\n').length
              }
            ],
            similarity
          });
        }
      }
    }

    return duplicates;
  }

  private extractCodeBlocks(): string[] {
    const blocks: string[] = [];
    const minBlockSize = 5; // Minimum lines to consider

    const visit = (node: ts.Node) => {
      if (
        ts.isBlock(node) ||
        ts.isFunctionDeclaration(node) ||
        ts.isMethodDeclaration(node)
      ) {
        const code = node.getFullText(this.sourceFile);
        if (code.split('\n').length >= minBlockSize) {
          blocks.push(code);
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(this.sourceFile);
    return blocks;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const maxLen = Math.max(len1, len2);
    return 1 - matrix[len1][len2] / maxLen;
  }

  private getLineNumber(text: string): number {
    const pos = this.sourceFile.getFullText().indexOf(text);
    return this.sourceFile.getLineAndCharacterOfPosition(pos).line + 1;
  }
} 