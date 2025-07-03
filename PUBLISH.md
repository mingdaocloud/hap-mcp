# Publishing Guide for @mingdaocloud/hap-mcp

## Pre-publish Checklist

1. **Run tests and build**:
   ```bash
   npm run build
   npm run publish-check
   ```

2. **Verify package contents**:
   ```bash
   npm pack --dry-run
   ```

3. **Test the built package locally**:
   ```bash
   node build/index.js
   ```

## Publishing Steps

### 1. Login to npm
```bash
npm login
```

### 2. Publish the package
```bash
npm publish --access public
```

### 3. Verify publication
```bash
npm view @mingdaocloud/hap-mcp
```

### 4. Test installation
```bash
npx @mingdaocloud/hap-mcp
```

## Version Management

### Patch Release (1.0.1)
```bash
npm version patch
npm publish --access public
```

### Minor Release (1.1.0)
```bash
npm version minor
npm publish --access public
```

### Major Release (2.0.0)
```bash
npm version major
npm publish --access public
```

## Post-publish

1. Create a GitHub release
2. Update documentation
3. Announce on relevant channels

## Troubleshooting

### Permission Issues
Make sure you have publish permissions for the @mingdaocloud scope.

### Build Issues
Ensure all TypeScript files compile without errors:
```bash
npm run build
```

### Package Size
Check package size before publishing:
```bash
npm pack --dry-run
```

The package should only include:
- `build/` directory
- `README.md`
- `package.json`
- `LICENSE`
