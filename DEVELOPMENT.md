# HAP-MCP Development Guide

## 🌿 Branch Strategy

This project follows a simple two-branch strategy:

### Main Branch (`main`)
- **Purpose**: Stable releases only
- **Status**: Clean and minimal
- **Content**: Basic project information and links to development
- **Protection**: No direct development commits

### Development Branch (`develop`)
- **Purpose**: Active development and testing
- **Status**: Latest features and improvements
- **Content**: Complete codebase with all features
- **Usage**: All development work happens here

## 🚀 Development Workflow

### 1. Setup Development Environment
```bash
# Clone the repository
git clone <repository-url>
cd hap-mcp

# Switch to develop branch
git checkout develop

# Install dependencies
npm install

# Build the project
npm run build
```

### 2. Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Check for publish readiness
npm run publish-check
```

### 3. Making Changes
1. Always work on the `develop` branch
2. Create feature branches from `develop` if needed
3. Test your changes thoroughly
4. Update documentation as needed
5. Commit with descriptive messages

### 4. Commit Message Convention
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
refactor: Refactor code
test: Add tests
chore: Update build process
```

## 📦 Release Process

### Development Release (from develop)
```bash
# Ensure you're on develop branch
git checkout develop

# Update version
npm version patch|minor|major

# Build and test
npm run build
npm run publish-check

# Publish to npm
npm publish --access public
```

### Stable Release (to main)
1. Ensure develop branch is stable and tested
2. Merge develop to main
3. Tag the release
4. Update main branch documentation

## 🔧 Project Structure

```
hap-mcp/
├── src/                    # Source code
│   ├── core/              # Core functionality
│   │   ├── services/      # API services
│   │   ├── tools.ts       # MCP tools
│   │   ├── resources.ts   # MCP resources
│   │   └── prompts.ts     # MCP prompts
│   ├── server/            # Server configuration
│   └── index.ts           # Main entry point
├── build/                 # Build output
├── scripts/               # Build scripts
├── docs/                  # Documentation
└── package.json           # Package configuration
```

## 🧪 Testing

### Manual Testing
```bash
# Test the built server
node build/index.js

# Test with Cursor MCP integration
# Add to .cursor/mcp.json:
{
  "mcpServers": {
    "hap-mcp": {
      "command": "npx",
      "args": ["@mingdaocloud/hap-mcp"]
    }
  }
}
```

### Automated Testing
- Unit tests for core functionality
- Integration tests for API services
- End-to-end tests for MCP tools

## 📝 Documentation

### Required Documentation Updates
- Update CHANGELOG.md for each release
- Update README.md for new features
- Update API documentation for new tools
- Update usage examples

### Documentation Files
- `README.md`: Main project documentation
- `MINGDAO_API_TOOLS.md`: API tools reference
- `USAGE.md`: Usage guide
- `CHANGELOG.md`: Version history
- `TOOLS_SUMMARY.md`: Complete tools overview

## 🔍 Code Quality

### Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Comprehensive error handling

### Best Practices
- Use descriptive variable names
- Add JSDoc comments for public APIs
- Handle errors gracefully
- Write maintainable code
- Follow existing patterns

## 🚨 Important Notes

1. **Never commit directly to main branch**
2. **Always test before publishing**
3. **Update documentation with code changes**
4. **Follow semantic versioning**
5. **Keep develop branch stable**

## 🆘 Troubleshooting

### Common Issues
- Build failures: Check TypeScript errors
- Import errors: Verify file paths and exports
- Runtime errors: Check API configurations
- Publishing issues: Verify npm authentication

### Getting Help
- Check existing documentation
- Review commit history for similar changes
- Test in isolation
- Ask for code review
