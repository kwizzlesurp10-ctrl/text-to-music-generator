# API Error Solutions for /api/generate-music

## Common Errors and Solutions

### Error 1: Method Not Allowed (405)
**Symptom**: Accessing `/api/generate-music` via GET returns 405

**Solution**: The endpoint only accepts POST requests. Use:
```javascript
fetch('/api/generate-music', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'your prompt', duration: 30 })
})
```

### Error 2: Python Command Not Found
**Symptom**: Error like "python: command not found" or "ENOENT"

**Solution**: Update the API route to try both `python` and `python3`:
- Check if `python3` exists
- Use platform-specific command detection

### Error 3: Python Dependencies Missing
**Symptom**: Import errors from Python script (audiocraft, torch not found)

**Solution**: Install Python dependencies:
```bash
pip install -r requirements.txt
```

### Error 4: Script Execution Timeout
**Symptom**: 504 Gateway Timeout after 5 minutes

**Solution**: 
- Music generation can take 2-5 minutes
- Consider using background jobs for long-running tasks
- Add progress updates via WebSocket or polling

### Error 5: File System Permissions
**Symptom**: Cannot create temp files or output directories

**Solution**: Ensure write permissions in project directory

## Recommended Fixes

1. **Add GET handler** for health checks
2. **Improve Python command detection**
3. **Better error messages** for debugging
4. **Add health check endpoint**

