import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

const execFileAsync = promisify(execFile);

export async function POST(request: NextRequest) {
  // Generate unique identifier for this request to prevent race conditions
  const requestId = randomUUID();
  const promptsFile = path.join(process.cwd(), `temp_prompts_${requestId}.txt`);
  const outputDir = path.join(process.cwd(), `output_${requestId}`);
  let audioPath: string | null = null;

  try {
    const { prompt, duration = 30 } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Validate duration parameter to prevent command injection
    // Ensure duration is a positive integer between 5 and 300 seconds
    const durationNum = typeof duration === 'number' ? duration : parseInt(String(duration), 10);
    if (
      isNaN(durationNum) ||
      !Number.isInteger(durationNum) ||
      durationNum < 5 ||
      durationNum > 300
    ) {
      return NextResponse.json(
        { error: 'Duration must be an integer between 5 and 300 seconds' },
        { status: 400 }
      );
    }

    // Sanitize prompt (TypeScript equivalent of Python code)
    const safePrompt = prompt.replace(/[^a-zA-Z0-9 .-]/g, '').trim().substring(0, 100);

    if (!safePrompt) {
      return NextResponse.json(
        { error: 'Invalid prompt after sanitization' },
        { status: 400 }
      );
    }

    // Create temporary prompts file with unique name
    fs.writeFileSync(promptsFile, safePrompt);

    // Create unique output directory for this request
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Execute Python script with timeout
    const pythonScript = path.join(process.cwd(), 'generate_music.py');
    
    // Check if Python script exists
    if (!fs.existsSync(pythonScript)) {
      return NextResponse.json(
        { error: 'Music generation script not found' },
        { status: 500 }
      );
    }

    // Use execFile instead of exec to prevent shell injection
    // Arguments are passed as an array, preventing shell interpretation
    const { stdout, stderr } = await execFileAsync(
      'python',
      [
        pythonScript,
        '--prompts', promptsFile,
        '--output', outputDir,
        '--duration', String(durationNum)
      ],
      {
        timeout: 300000, // 5 minutes
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      }
    );

    // Find generated file in the unique output directory
    const files = fs.readdirSync(outputDir);
    const generatedFile = files.find(f => f.endsWith('.wav'));

    if (!generatedFile) {
      return NextResponse.json(
        { 
          error: 'Music generation failed - no output file created', 
          details: stderr || 'Check Python script execution',
          stdout: stdout || ''
        },
        { status: 500 }
      );
    }

    // Read audio file
    audioPath = path.join(outputDir, generatedFile);
    const audioBuffer = fs.readFileSync(audioPath);

    // Return audio file
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': `attachment; filename="${generatedFile}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: unknown) {
    console.error('Music generation error:', error);
    
    // Determine error message
    const errorMessage = (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ETIMEDOUT') || 
                         (error instanceof Error && (error as NodeJS.ErrnoException).signal === 'SIGTERM')
      ? 'Music generation timed out after 5 minutes'
      : error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { 
        error: 'Music generation failed', 
        details: errorMessage
      },
      { status: 500 }
    );
  } finally {
    // Clean up temporary files and directories
    try {
      // Clean up prompts file
      if (fs.existsSync(promptsFile)) {
        fs.unlinkSync(promptsFile);
      }

      // Clean up output directory and its contents
      if (fs.existsSync(outputDir)) {
        // Remove all files in the directory
        const files = fs.readdirSync(outputDir);
        for (const file of files) {
          fs.unlinkSync(path.join(outputDir, file));
        }
        // Remove the directory itself
        fs.rmdirSync(outputDir);
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
      // Don't throw - cleanup errors shouldn't affect the response
    }
  }
}

