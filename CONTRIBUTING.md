# Contributing to Deggo MCP

We welcome contributions to Deggo MCP! This guide will help you get started.

## Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/deggo-mcp.git
   cd deggo-mcp
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment**:
   ```bash
   cp .env.example .env
   # Add your test credentials
   ```

## Development Workflow

### Making Changes

1. **Create a feature branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our code style

3. **Test your changes**:

   ```bash
   npm run validate  # Type check + lint + test
   ```

4. **Commit with clear messages**:
   ```bash
   git commit -m "feat: add new payment provider"
   git commit -m "fix: resolve phone validation issue"
   git commit -m "docs: update API documentation"
   ```

### Code Style

- **TypeScript**: Use strict typing, avoid `any`
- **Functions**: Keep functions small and focused
- **Naming**: Use descriptive names for variables and functions
- **Comments**: Add JSDoc comments for public APIs
- **Testing**: Write tests for new features

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run integration tests (with credentials)
npm run test:integration
```

## Adding a New Payment Provider

1. **Research the provider's API** documentation
2. **Create provider directory**:
   ```
   src/providers/your-provider/
   ├── types.ts      # API types
   ├── auth.ts       # Authentication
   ├── client.ts     # Main implementation
   └── validator.ts  # Business rules
   ```
3. **Implement the `IPaymentProvider` interface**
4. **Add to provider factory** in `src/providers/factory.ts`
5. **Write comprehensive tests**
6. **Update documentation**

### Provider Implementation Checklist

- [ ] API types defined
- [ ] Authentication implemented
- [ ] Core methods: `sendMoney`, `checkBalance`, `getTransactionHistory`
- [ ] Validation logic for business rules
- [ ] Error handling with proper error codes
- [ ] Unit tests with mocks
- [ ] Integration tests (optional)
- [ ] Documentation updated

## Submitting Changes

1. **Push your branch**:

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub with:

   - Clear title describing the change
   - Description of what was added/fixed
   - Any breaking changes noted
   - Screenshots/examples if applicable

3. **Respond to review feedback** promptly

## Reporting Issues

When reporting bugs or requesting features:

- **Use the issue templates** when available
- **Provide clear reproduction steps** for bugs
- **Include error messages** and stack traces
- **Specify your environment** (Node version, OS, etc.)
- **Check existing issues** to avoid duplicates

## Code of Conduct

- **Be respectful** and professional
- **Help others** learn and contribute
- **Focus on the code**, not the person
- **Constructive feedback** is always welcome

## Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Review existing code**: Best way to understand patterns

## Recognition

Contributors will be:

- Added to the contributors list
- Mentioned in release notes for significant contributions
- Credited in documentation when appropriate

## Development Tips

### Useful Commands

```bash
npm run dev          # Start development server
npm run build:watch  # Build in watch mode
npm run test:watch   # Test in watch mode
npm run lint:fix     # Auto-fix linting issues
```

### Debugging

```bash
# Enable debug logging
DEBUG=deggo:* npm run dev

# Run specific test
npm test -- tests/providers/orange/client.test.ts
```

### Project Structure

```
src/
├── core/           # Main Deggo class and errors
├── providers/      # Payment provider implementations
├── mcp/           # MCP protocol handlers
├── types/         # TypeScript type definitions
├── utils/         # Shared utilities
└── config/        # Configuration management
```

Thank you for contributing to Deggo MCP! 🎉
