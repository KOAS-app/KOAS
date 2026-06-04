# ⚡ Quick Fix Summary - Receipt Upload Issue

## 🐛 The Problem
Mobile app receipt uploads **failing in production** (Railway) but working locally.

## 🔍 Root Cause
React Native FormData was sending wrong Content-Type header:
```typescript
❌ headers: { 'Content-Type': 'multipart/form-data' }  // Missing boundary parameter
```

## ✅ The Fix
Let axios auto-set the Content-Type with proper boundary:
```typescript
✅ // No manual Content-Type header
await api.post('/upload/receipt', formData);  // Axios adds boundary automatically
```

## 📦 Files Changed
1. `mobile-app/src/screens/BookingsScreen.tsx` - Removed manual header
2. `mobile-app/src/screens/SubscriptionCheckoutScreen.tsx` - Removed manual header
3. `mobile-app/src/api/axios.ts` - Added interceptor to ensure clean headers
4. `backend/src/controllers/upload.controller.js` - Added debug logging
5. `backend/src/routes/upload.routes.js` - Added error handling

## 🚀 Deploy to Railway

### Step 1: Commit & Push
```bash
git add .
git commit -m "Fix: Mobile app receipt upload - remove manual Content-Type header"
git push origin main
```

### Step 2: Railway Auto-Deploys
Wait ~2 minutes, check Railway dashboard for green checkmark ✅

### Step 3: Update Mobile App
The mobile app changes need to be reflected in your Expo build:
- If using Expo Go: App will reload automatically
- If using EAS build: Need to rebuild and republish

### Step 4: Test
1. Open mobile app
2. Make a booking
3. Upload receipt
4. Check Railway logs: `railway logs --tail`

## 📊 What to Expect

### ✅ Success Indicators
- Mobile app shows "Receipt Submitted" alert
- Railway logs show: `"Receipt uploaded successfully"`
- Owner web shows the receipt image
- No errors in Railway logs

### ❌ If Still Failing
Check Railway logs for:
- `"No file in receipt upload"` - FormData still malformed
- `"Multer error"` - File parsing issue
- Check mobile app is using updated code

## ⚠️ Railway Storage Reminder

**Files are EPHEMERAL on Railway:**
- Uploads work ✅
- Images display ✅
- Deploy new code → Images deleted ❌
- **This is normal on Railway**

For production, migrate to Cloudinary/S3 (see `RAILWAY_DEPLOYMENT.md`)

## 🎯 Testing Checklist

- [ ] Pushed code to GitHub
- [ ] Railway deployed successfully
- [ ] Mobile app receipt upload works
- [ ] Images display in owner/admin web
- [ ] Checked Railway logs (no errors)
- [ ] Stadium image upload still works (owner web)

## 📞 Quick Debug Commands

```bash
# View Railway logs
railway logs --tail

# Test backend health
curl https://koas-production.up.railway.app/api/

# Check specific upload errors
railway logs | grep "upload"
```

## ✨ That's It!

Your fix is ready to deploy. The issue was a simple Content-Type header problem that breaks multipart uploads in production environments.

---
**Time to Fix**: 5-10 minutes
**Risk Level**: Low (only affects file uploads)
**Rollback**: Just revert the commits if needed
