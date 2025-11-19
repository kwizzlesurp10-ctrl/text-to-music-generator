# API Error Diagnosis and Solutions

## Error at: `/api/generate-music`

### Potential Issues and Solutions

#### Issue 1: Route Not Found (404)
**Symptoms**: Empty page or 404 error

**Causes**:
- Next.js app not running
- Route file not in correct location
- Build/compilation errors

**Solutions**:
1. **Start Next.js dev server**:
   ```bash
   npm run dev
   ```

2. **Verify route file location**:
   - Should be at: `app/api/generate-music/route.ts`
   - Not: `pages/api/generate-music.ts` (old Next.js structure)

3. **Check for build errors**:
   ```bash
   npm run build
   ```

#### Issue 2: Method Not Allowed (405)
**Symptoms**: "Method not allowed" error

**Cause**: Accessing POST endpoint with GET

**Solution**: 
- ✅ **FIXED**: Added GET handler for health checks
- Use POST for actual music generation

#### Issue 3: Python Not Found
**Symptoms**: "Python not found" or "ENOENT" error

**Causes**:
- Python not installed
- Python not in PATH
- Wrong Python command (`python` vs `python3`)

**Solutions**:
- ✅ **FIXED**: Added automatic Python detection
- Install Python 3.8+: `python3 --version`
- Ensure Python is in system PATH

#### Issue 4: Python Dependencies Missing
**Symptoms**: Import errors (audiocraft, torch not found)

**Solution**:
```bash
pip install -r requirements.txt
# Or
pip install audiocraft torch torchaudio
```

#### Issue 5: Script Execution Fails
**Symptoms**: Python script runs but fails

**Causes**:
- Missing dependencies
- Insufficient resources (RAM/GPU)
- File permissions

**Solutions**:
1. Check Python script syntax: `python3 generate_music.py --help`
2. Verify dependencies: `pip list | grep audiocraft`
3. Check file permissions: `ls -la generate_music.py`

#### Issue 6: Timeout (504)
**Symptoms**: Request times out after 5 minutes

**Cause**: Music generation takes longer than timeout

**Solutions**:
- ✅ Current timeout: 5 minutes (300000ms)
- Consider increasing for large models
- Use GPU for faster generation
- Implement background jobs for long tasks

## Quick Diagnostic Steps

### Step 1: Check if Server is Running
```bash
curl http://localhost:3000/api/generate-music
# Should return JSON with endpoint info
```

### Step 2: Test Python Script Directly
```bash
python3 generate_music.py --help
# Should show help message
```

### Step 3: Check Python Dependencies
```bash
python3 -c "import audiocraft; print('OK')"
# Should print "OK" if installed
```

### Step 4: Test API with POST
```bash
curl -X POST http://localhost:3000/api/generate-music \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test","duration":30}'
```

## Fixes Applied

✅ **GET handler added** - Health check endpoint
✅ **Python detection** - Auto-detects python3/python
✅ **Better error messages** - More helpful debugging info
✅ **Error handling** - Proper try/catch with cleanup

## Next Steps

1. **Update Firebase IDE** with latest route.ts file
2. **Restart dev server**: `npm run dev`
3. **Test GET endpoint**: Should return endpoint info
4. **Test POST endpoint**: With valid prompt

## Files to Update in Firebase IDE

1. `app/api/generate-music/route.ts` - Latest version with fixes
2. Restart Next.js dev server after updating

