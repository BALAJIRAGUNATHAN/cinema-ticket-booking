# Bundle Analyzer Usage Guide

## What is Bundle Analyzer?

The Next.js Bundle Analyzer helps you visualize the size of your JavaScript bundles and identify optimization opportunities.

## How to Use

### 1. Analyze Your Bundle

Run the following command to build and analyze your bundle:

```bash
ANALYZE=true npm run build
```

This will:
- Build your Next.js application
- Generate interactive HTML reports
- Open them automatically in your browser

### 2. View the Reports

Two reports will be generated:
- **Client Bundle**: Shows what users download
- **Server Bundle**: Shows server-side code

### 3. What to Look For

**Large Packages:**
- Look for unexpectedly large dependencies
- Consider alternatives or lazy loading

**Duplicate Code:**
- Check for packages included multiple times
- Use dynamic imports to split code

**Unused Code:**
- Identify libraries you're not fully using
- Consider tree-shaking or smaller alternatives

## Optimization Tips

### 1. Dynamic Imports
```typescript
// Instead of:
import HeavyComponent from './HeavyComponent';

// Use:
const HeavyComponent = dynamic(() => import('./HeavyComponent'));
```

### 2. Optimize Dependencies
```bash
# Check package sizes before installing
npm install --dry-run package-name
```

### 3. Monitor Regularly
Run the analyzer after major changes to track bundle size growth.

## Current Optimizations

Already implemented in this project:
- ✅ `optimizePackageImports` for lucide-react
- ✅ Image optimization (WebP/AVIF)
- ✅ Font optimization with `next/font`
- ✅ Code splitting (automatic with Next.js)

## Target Bundle Sizes

**Good targets:**
- First Load JS: < 200 KB
- Total Bundle: < 500 KB

**Current status:** Run `ANALYZE=true npm run build` to check!
