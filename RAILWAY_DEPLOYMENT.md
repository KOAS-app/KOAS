# 🚂 Railway Deployment Guide for KOAS

## ⚠️ Critical: File Storage on Railway

**Railway uses EPHEMERAL file storage** - all uploaded files will be **deleted** on:
- Every new deployment
- App restarts
- Container rebuilds

### Impact on Your App
- ✅ **For Testing**: Works fine, acceptable data loss
- ❌ **For Production**: NOT recommended, users lose their images

### Solutions
1. **Short-term Testing**: Accept that images disappear (current setup)
2. **Production Ready**: Migrate to cloud storage (see below)

## 🚀 Current Railway Setup (Testing Mode)

### What You Have Now
- Backend deployed on Railway: `https://koas-production.up.railway.app`
- PostgreSQL database on Railway (persistent ✅)
- File uploads to local disk (ephemeral ❌)
- Mobile app configured to use Railway backend

### Deploy the Fix

#### 1. Commit and Push Changes
```bash
cd c:\Users\hamza\Documents\GitHub\KOAS

# Stage all changes
git add mobile-app/src/screens/BookingsScreen.tsx
git add mobile-app/src/screens/SubscriptionCheckoutScreen.tsx
git add mobile-app/src/api/axios.ts
git add backend/src/controllers/upload.controller.js
git add backend/src/routes/upload.routes.js

# Commit
git commit -m "Fix: Remove manual Content-Type header for React Native FormData uploads"

# Push to main (or your branch)
git push origin main
```

#### 2. Railway Auto-Deploy
Railway will automatically deploy when you push to the connected branch.

#### 3. Monitor Deployment
```bash
# Install Railway CLI (if not already)
npm i -g @railway/cli

# Login
railway login

# View logs
railway logs
```

#### 4. Test Receipt Upload
1. Open your mobile app (Expo Go or build)
2. Make a booking
3. Try uploading a receipt
4. Check Railway logs for success/errors

## 🐛 Debugging on Railway

### View Live Logs
```bash
railway logs --tail
```

### Check for Upload Errors
Look for these messages in logs:
- ✅ `"Receipt uploaded successfully"` - Working!
- ❌ `"No file in receipt upload"` - FormData issue
- ❌ `"Multer error"` - File parsing issue

### Test Upload Endpoint
```bash
# Get your Railway URL
curl https://koas-production.up.railway.app/api/

# Should return: {"message":"KOAS API Running"}
```

## 📦 Railway Environment Variables

### Current Setup
Your `.env` on Railway should have:
```env
DATABASE_URL=postgresql://... (Railway provides this)
JWT_SECRET=supersecretkey
NODE_ENV=production
PORT=5000 (Railway sets this automatically)
```

### Add CORS for Production Frontends
```env
CORS_ORIGINS=https://your-admin.vercel.app,https://your-owner.vercel.app
```

**How to Set:**
1. Go to Railway dashboard
2. Select your backend service
3. Go to **Variables** tab
4. Add `CORS_ORIGINS` with your Vercel URLs

## 🔄 Testing Cycle on Railway

### Expected Behavior
1. ✅ Upload image → Works
2. ✅ View image → Works
3. 🔄 Deploy new code
4. ❌ Old images → Gone (expected on Railway)
5. ✅ Upload new image → Works again

### Don't Be Alarmed If:
- Images disappear after deployment (normal on Railway)
- Upload folder is empty after restart (normal on Railway)
- Need to re-upload test images (normal on Railway)

## 🎯 When to Migrate to Cloud Storage

### Still Testing?
**Keep Railway as-is** if you're:
- Just testing features
- Okay with losing test data
- Not showing to real users yet
- Saving money on hosting

### Ready for Real Users?
**Migrate to cloud storage** when:
- People are actually using the app
- You need images to persist
- You're launching publicly
- You have a budget for storage

## ☁️ Cloud Storage Migration (When Ready)

### Option 1: Cloudinary (Easiest)
**Pros:**
- Free tier: 25GB storage, 25GB bandwidth
- Built-in image optimization
- Built-in CDN
- Easy setup (10 minutes)

**Cost:** Free → $89/month (scales with usage)

**Setup:**
```bash
cd backend
npm install cloudinary
```

### Option 2: AWS S3 (Most Control)
**Pros:**
- Cheapest at scale ($0.023/GB/month)
- Highly reliable
- Full control

**Cost:** ~$1-5/month for small apps

**Setup:**
```bash
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage
```

### Option 3: DigitalOcean Spaces (Best Value)
**Pros:**
- S3-compatible API
- Fixed pricing: $5/month (250GB + 1TB bandwidth)
- Good value for predictable costs

**Setup:**
```bash
npm install @aws-sdk/client-s3  # Works with DO Spaces
```

## 📊 Railway Limitations Summary

| Feature | Railway | cPanel | Cloud Storage |
|---------|---------|--------|---------------|
| **File Persistence** | ❌ Ephemeral | ✅ Persistent | ✅ Persistent |
| **Cost** | Free tier → $5-20/mo | $5-15/month | $0-89/month |
| **Deploy Speed** | ⚡ Instant | 🐢 Manual | ⚡ Automatic |
| **Best For** | Testing, APIs | Full apps | Production images |

## 🔧 Current Fix Impact

### What We Fixed
- ❌ **Before**: Mobile app sends wrong Content-Type → Upload fails
- ✅ **After**: Axios auto-sets correct Content-Type → Upload works

### What Still Applies
- Files still ephemeral on Railway
- Works great for testing
- Deploy to Railway now, migrate storage later

## ✅ Action Items

### Immediate (Do Now)
1. ✅ Commit the upload fix changes
2. ✅ Push to GitHub
3. ✅ Railway auto-deploys
4. ✅ Test receipt upload on mobile
5. ✅ Verify in Railway logs

### Soon (Before Launch)
1. ⏳ Add rate limiting
2. ⏳ Configure production CORS_ORIGINS
3. ⏳ Test all upload scenarios

### Before Real Users
1. 📅 Choose cloud storage provider
2. 📅 Migrate to Cloudinary/S3/Spaces
3. 📅 Test image persistence
4. 📅 Update documentation

## 🆘 Troubleshooting

### "Images disappeared after deploy"
**Expected behavior on Railway.** Files are stored in container, which is rebuilt on each deploy.

**Solution:** Accept for testing, or migrate to cloud storage.

### "Upload works locally but not on Railway"
**Check:**
1. Railway logs for errors: `railway logs --tail`
2. Mobile app points to correct URL (in `app.config.js`)
3. JWT_SECRET matches between local and Railway
4. CORS_ORIGINS includes your mobile app domain

### "Still getting 'No file uploaded' error"
**Verify:**
1. Mobile app changes are deployed
2. Axios interceptor is removing Content-Type
3. FormData structure is correct
4. Check Railway logs for multer errors

### "Backend not responding"
```bash
# Check if backend is running
curl https://koas-production.up.railway.app/api/

# Check Railway service status
railway status

# Restart if needed
railway restart
```

## 📈 Railway Performance Tips

### Keep Deployments Fast
```json
// package.json - Only install production deps on Railway
{
  "scripts": {
    "start": "node src/server.js",
    "build": "npx prisma generate"
  }
}
```

### Monitor Memory Usage
Railway free tier: 512MB RAM
- Your app should use < 200MB normally
- Spike to ~300MB during image uploads
- Monitor in Railway dashboard

### Optimize Build Time
Create `.slugignore` (like .gitignore but for Railway):
```
*.md
*.log
.vscode
.git
tests/
docs/
```

## 🎉 Summary

### For Now (Testing on Railway)
- ✅ Fix is ready to deploy
- ✅ Uploads will work
- ⚠️ Images disappear on deploy (acceptable for testing)
- ✅ Perfect for development and testing

### For Later (Production)
- 📅 Migrate to Cloudinary/S3/Spaces
- 📅 Images persist forever
- 📅 Better performance with CDN
- 📅 Ready for real users

---
**Current Status**: Testing on Railway (Ephemeral Storage)
**Next Step**: Deploy the fix and test
**Production Ready**: After cloud storage migration
