import * as yaml from 'js-yaml';

interface DocAnalysisResult {
  format: string;
  sections: DocSection[];
  metadata: DocMetadata;
  links: DocLink[];
  codeBlocks: CodeBlock[];
  completeness: number;
}

interface DocSection {
  title: string;
  content: string;
  level: number;
  lineStart: number;
  lineEnd: number;
}

interface DocMetadata {
  title?: string;
  description?: string;
  author?: string;
  version?: string;
  tags?: string[];
  [key: string]: any;
}

interface DocLink {
  text: string;
  url: string;
  isInternal: boolean;
  lineNumber: number;
}

interface CodeBlock {
  language: string;
  content: string;
  lineStart: number;
  lineEnd: number;
}

export class DocAnalyzer {
  private content: string;
  private format: string;
  private lines: string[];
  private _sections: DocSection[] = [];
  private _metadata: DocMetadata = {};
  private _links: DocLink[] = [];
  private _codeBlocks: CodeBlock[] = [];

  constructor(content: string, format: string = 'markdown') {
    this.content = content;
    this.format = format;
    this.lines = content.split('\n');
  }

  public analyze(): DocAnalysisResult {
    this._sections = this.extractSections();
    this._metadata = this.extractMetadata();
    this._links = this.extractLinks();
    this._codeBlocks = this.extractCodeBlocks();

    return {
      format: this.format,
      sections: this._sections,
      metadata: this._metadata,
      links: this._links,
      codeBlocks: this._codeBlocks,
      completeness: this.calculateCompleteness()
    };
  }

  private extractSections(): DocSection[] {
    const sections: DocSection[] = [];
    let currentSection: DocSection | null = null;

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

      if (headingMatch) {
        if (currentSection) {
          currentSection.lineEnd = i - 1;
          sections.push(currentSection);
        }

        currentSection = {
          title: headingMatch[2],
          content: '',
          level: headingMatch[1].length,
          lineStart: i,
          lineEnd: i
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    }

    if (currentSection) {
      currentSection.lineEnd = this.lines.length - 1;
      sections.push(currentSection);
    }

    return sections;
  }

  private extractMetadata(): DocMetadata {
    const metadata: DocMetadata = {};
    let inFrontmatter = false;
    let frontmatterContent = '';

    // Check for YAML frontmatter
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      if (i === 0 && line === '---') {
        inFrontmatter = true;
        continue;
      }
      if (inFrontmatter) {
        if (line === '---') {
          break;
        }
        frontmatterContent += line + '\n';
      }
    }

    if (frontmatterContent) {
      try {
        Object.assign(metadata, yaml.load(frontmatterContent));
      } catch (error) {
        console.error('Error parsing frontmatter:', error);
      }
    }

    // Extract metadata from other formats
    if (this.format === 'github-wiki') {
      const titleMatch = this.content.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        metadata.title = titleMatch[1];
      }
    }

    return metadata;
  }

  private extractLinks(): DocLink[] {
    const links: DocLink[] = [];
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      
      // Markdown links
      let match;
      while ((match = markdownLinkRegex.exec(line)) !== null) {
        links.push({
          text: match[1],
          url: match[2],
          isInternal: !match[2].startsWith('http'),
          lineNumber: i + 1
        });
      }

      // Wiki-style links
      while ((match = wikiLinkRegex.exec(line)) !== null) {
        links.push({
          text: match[1],
          url: match[1],
          isInternal: true,
          lineNumber: i + 1
        });
      }
    }

    return links;
  }

  private extractCodeBlocks(): CodeBlock[] {
    const codeBlocks: CodeBlock[] = [];
    let inCodeBlock = false;
    let currentBlock: Partial<CodeBlock> = {};
    let language = '';

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const codeBlockStart = line.match(/^```(\w*)$/);

      if (codeBlockStart) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          language = codeBlockStart[1] || 'text';
          currentBlock = {
            language,
            content: '',
            lineStart: i + 1
          };
        } else {
          inCodeBlock = false;
          if (currentBlock.content && currentBlock.lineStart !== undefined) {
            codeBlocks.push({
              language: currentBlock.language || 'text',
              content: currentBlock.content,
              lineStart: currentBlock.lineStart,
              lineEnd: i - 1
            });
          }
          currentBlock = {};
        }
      } else if (inCodeBlock) {
        currentBlock.content = (currentBlock.content || '') + line + '\n';
      }
    }

    return codeBlocks;
  }

  private calculateCompleteness(): number {
    const weights = {
      hasTitle: 0.2,
      hasDescription: 0.2,
      hasCodeExamples: 0.2,
      hasLinks: 0.1,
      hasSections: 0.3
    };

    let score = 0;

    // Check title
    if (this._metadata.title) {
      score += weights.hasTitle;
    }

    // Check description
    if (this._metadata.description) {
      score += weights.hasDescription;
    }

    // Check code examples
    if (this._codeBlocks.length > 0) {
      score += weights.hasCodeExamples;
    }

    // Check links
    if (this._links.length > 0) {
      score += weights.hasLinks;
    }

    // Check sections
    if (this._sections.length > 1) {
      score += weights.hasSections;
    }

    return Math.round(score * 100);
  }
} 