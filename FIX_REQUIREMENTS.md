# Firebase Code Structure Fix Requirements

## Issues to Fix

### 1. 401 Unauthorized Error
**Error**: `[GoogleGenerativeAI Error]: Error fetching from https://monospace-pa.googleapis.com/v1/models/gemini-2.5-pro:streamGenerateContent?alt=sse: [401 Unauthorized]`

**Root Cause**: The API route is trying to use GoogleGenerativeAI with OAuth tokens instead of API key authentication.

**Fix Required**:
- Remove GoogleGenerativeAI API calls from `/app/api/generate-music/route.ts`
- Use the Python script (`generate_music.py`) directly instead
- If Genkit is needed, configure it properly with API key authentication

### 2. 504 Gateway Timeout
**Error**: `/api/generate-music:1 Failed to load resource: the server responded with a status of 504 (Gateway Timeout)`

**Root Cause**: The API route is hanging or taking too long, likely due to incorrect Google AI Studio API integration.

**Fix Required**:
- Remove Google AI Studio API integration
- Implement proper timeout handling
- Use Python script execution with proper error handling

### 3. Undo API Insert
**Requirement**: Remove the Google AI Studio API integration that was incorrectly added.

**Fix Required**:
- Revert `/app/api/generate-music/route.ts` to use Python script execution
- Remove any GoogleGenerativeAI imports and usage
- Keep the API key in `.env` for future use, but don't use it for music generation

### 4. Complete Firebase Code Structure
**Requirement**: Set up proper Firebase configuration and integration.

**Fix Required**:
- Create proper Firebase configuration files
- Set up Firebase SDK initialization
- Configure environment variables properly
- Ensure proper project structure

## Implementation Plan

### Step 1: Fix `/app/api/generate-music/route.ts`
Replace the current implementation with a proper Python script execution that handles concurrent requests safely:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  // Generate unique identifier for this request to prevent race conditions
  const requestId = randomUUID();
  const promptsFile = path.join(process.cwd(), `temp_prompts_${requestId}.txt`);
  const outputDir = path.join(process.cwd(), `output_${requestId}`);

  try {
    const { prompt, duration = 30 } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Sanitize prompt (TypeScript equivalent of Python code)
    const safePrompt = prompt.replace(/[^a-zA-Z0-9 .-]/g, '').trim().substring(0, 100);

    // Create temporary prompts file with unique name
    fs.writeFileSync(promptsFile, safePrompt);

    // Create unique output directory for this request
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Execute Python script with timeout (execAsync handles timeout internally)
    const pythonScript = path.join(process.cwd(), 'generate_music.py');
    const command = `python "${pythonScript}" --prompts "${promptsFile}" --output "${outputDir}" --duration ${duration}`;

    const { stdout, stderr } = await execAsync(command, {
      timeout: 300000, // 5 minutes
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    // Find generated file in the unique output directory
    const files = fs.readdirSync(outputDir);
    const generatedFile = files.find(f => f.endsWith('.wav'));

    if (!generatedFile) {
      return NextResponse.json(
        { error: 'Music generation failed', details: stderr },
        { status: 500 }
      );
    }

    // Read audio file
    const audioPath = path.join(outputDir, generatedFile);
    const audioBuffer = fs.readFileSync(audioPath);

    // Clean up
    fs.unlinkSync(promptsFile);
    // Optionally clean up audio file after serving

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': `attachment; filename="${generatedFile}"`,
      },
    });
  } catch (error: any) {
    console.error('Music generation error:', error);
    return NextResponse.json(
      { 
        error: 'Music generation failed', 
        details: error.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
```

### Step 2: Create Firebase Configuration
Create `lib/firebase.ts`:

```typescript
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let db: Firestore;

if (typeof window !== 'undefined') {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
}

export { app, db };
```

### Step 3: Update Environment Variables
Ensure `.env.local` has:

```
GOOGLE_API_KEY=AIzaSyDeufCTAUPrXcaVDwD72-vF0PC6ZPX0Em4
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=analytikes-86162516
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Step 4: Install Required Packages
Ensure `package.json` has:
- `python-shell` or use Node.js `child_process` (already available)
- Firebase SDK: `firebase`

## Summary

1. Remove GoogleGenerativeAI API usage from generate-music route
2. Implement proper Python script execution with timeout handling
3. Set up Firebase configuration properly
4. Keep API key in .env for future Genkit use, but don't use it for music generation
5. Ensure proper error handling and cleanup

