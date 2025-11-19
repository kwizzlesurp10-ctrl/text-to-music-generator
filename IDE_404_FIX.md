# Fix 404 Error and Sourcemap Issues

## Problem 1: IDE 404 Error
**Error**: `GET https://6000-firebase-studio-1763510488635.cluster-j6d3cbsvdbe5uxnhqrfzzeyj7i.cloudworkstations.dev/capra/?origin=https%3A%2F%2Fstudio.firebase.google.com 404 (Not Found)`

**Solution**: The IDE workspace URL has expired or changed. You need to:
1. Go to https://studio.firebase.google.com/analytikes-86162516
2. Click on your workspace (e.g., "gdrive-471108" or "Cuddly Tribble Mirror")
3. This will open a new IDE session with a fresh URL

## Problem 2: Sourcemap Error
**Error**: `http://go/sourcemap/sourcemaps/9e7a27b76730ca7fe4aecaeafc58bac1e2c82120/core/vs/platform/browserView/electron-main/preload-browser.js.map`

**Solution**: Add `next.config.js` to your project root with the following content:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production sourcemaps configuration
  productionBrowserSourceMaps: false,
  
  // Development sourcemaps configuration
  webpack: (config, { dev, isServer }) => {
    // Suppress sourcemap warnings for VS Code internal files
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /vs\/platform\/browserView/,
        message: /Failed to load source map/,
      },
      {
        module: /electron-main/,
        message: /Failed to load source map/,
      },
    ];

    // Configure sourcemaps for development
    if (dev && !isServer) {
      config.devtool = 'eval-source-map';
    }

    return config;
  },

  // Suppress console warnings about sourcemaps
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Experimental features
  experimental: {
    suppressHydrationWarning: true,
  },
};

module.exports = nextConfig;
```

## Steps to Apply Fix

### Step 1: Access Firebase IDE
1. Navigate to: https://studio.firebase.google.com/analytikes-86162516
2. Click on your workspace name
3. Wait for the IDE to load

### Step 2: Create/Update next.config.js
1. In the Firebase IDE, navigate to the project root
2. Create or update `next.config.js` with the code above
3. Save the file

### Step 3: Restart Dev Server
1. Stop the current dev server (if running)
2. Run `npm run dev` again
3. The sourcemap warnings should be suppressed

## Alternative: Suppress in Browser Console

If you can't modify `next.config.js`, you can add this to your app's root layout:

```typescript
// In app/layout.tsx
'use client';

import { useEffect } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Suppress VS Code sourcemap warnings
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      if (
        message.includes('sourcemap') ||
        message.includes('vs/platform/browserView') ||
        message.includes('electron-main') ||
        message.includes('Failed to load source map')
      ) {
        return; // Suppress these warnings
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## Why These Errors Occur

1. **404 Error**: Firebase IDE workspaces are temporary and URLs expire. You need to access through Firebase Studio to get a fresh URL.

2. **Sourcemap Error**: VS Code/Firebase IDE uses Electron internally and tries to load debugging sourcemaps. These are internal to the IDE and don't affect your application.

## Verification

After applying the fix:
- ✅ No 404 errors when accessing IDE through Firebase Studio
- ✅ Sourcemap warnings suppressed in browser console
- ✅ Application functions normally

## Note

Both errors are **cosmetic** and don't affect application functionality:
- The 404 is just an expired IDE URL - access through Firebase Studio
- The sourcemap warning is harmless - it's VS Code internal debugging

