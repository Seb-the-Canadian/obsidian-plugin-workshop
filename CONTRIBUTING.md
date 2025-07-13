# Contributing to Obsidian Plugin Workshop

Thank you for your interest in contributing to the Obsidian Plugin Workshop! This guide will help you get started.

## 🚀 Getting Started

1. **Fork the repository** and clone it locally
2. **Install dependencies**: `npm install`
3. **Run tests**: `npm test`
4. **Build the project**: `npm run build`

## 📝 Development Workflow

### 1. Code Style
- Follow TypeScript best practices
- Use ESLint configuration provided
- Write meaningful commit messages
- Add tests for new features

### 2. Project Structure
- `src/analyzers/` - Analysis tools and pattern detection
- `src/types/` - TypeScript type definitions
- `plugins/` - Plugin development workspace
- `scripts/` - Build and deployment scripts
- `templates/` - Plugin templates
- `tests/` - Test files

### 3. Testing
- Write unit tests for new features
- Ensure all tests pass before submitting
- Maintain test coverage above 80%

### 4. Documentation
- Update README.md for new features
- Add inline code documentation
- Update CHANGELOG.md following [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## 🐛 Reporting Issues

When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node.js version)

## 🔧 Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following the coding standards
3. **Add/update tests** for your changes
4. **Update documentation** as needed
5. **Update CHANGELOG.md** with your changes
6. **Submit a pull request** with a clear description

### Pull Request Guidelines
- Keep changes focused and atomic
- Write clear, descriptive commit messages
- Include tests for new functionality
- Update documentation for user-facing changes

## 🎯 Development Priorities

### Phase 1: Foundation
- [ ] TypeScript configuration
- [ ] Basic project structure
- [ ] Testing infrastructure
- [ ] Essential documentation

### Phase 2: Core Analysis Tools
- [ ] RateLimitedAnalyzer implementation
- [ ] Pattern detection system
- [ ] State management analyzer
- [ ] Event pattern detection

### Phase 3: Plugin Infrastructure
- [ ] Plugin templates
- [ ] Development scripts
- [ ] Testing utilities
- [ ] Build pipeline

### Phase 4: Documentation & Integration
- [ ] API documentation
- [ ] Comprehensive examples
- [ ] Deployment tools
- [ ] Final testing and optimization

## 📊 Code Quality

- **ESLint**: Run `npm run lint` to check code style
- **Tests**: Run `npm test` to execute test suite
- **Build**: Run `npm run build` to compile TypeScript
- **Coverage**: Maintain high test coverage

## 🤝 Community

- Be respectful and inclusive
- Help others learn and grow
- Share knowledge and best practices
- Provide constructive feedback

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.