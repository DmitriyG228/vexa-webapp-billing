# Quick Performance Testing Guide

## 🎯 Test Phase 2 Changes Now

### Step 1: Build and Start Production Locally (Single Command!)
```bash
make build-dev
```
Takes ~1 minute. Builds production version and starts server on http://localhost:3000

### Step 2: Run Performance Test
```bash
# In another terminal
make perf
```
Takes ~30 seconds. Shows accurate production scores.

---

## Expected Results

### Before Phase 2 (Deployed):
- Score: 64/100
- TBT: 360ms
- LCP: 9.5s

### After Phase 2 (Expected):
- Score: 72-75/100 (+8-11 points ✅)
- TBT: 200-220ms (-40% ✅)
- LCP: 7.5-8.0s (-20% ✅)

---

## Deploy When Ready

If local tests show improvement:
```bash
make deploy-dev-fast
```

Then verify at: https://pagespeed.web.dev/

---

## Quick Commands

```bash
make build-dev      # Build + start production locally
make perf           # Test performance
make deploy-dev-fast # Deploy when ready
```
