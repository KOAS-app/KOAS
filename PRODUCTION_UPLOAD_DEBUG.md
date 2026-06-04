# 🔴 Production Upload Issue - Complete Debug Guide

## 📋 The Problem
- ✅ Local works: Mobile app → Local backend (192.168.x.x:5000)
- ❌ Production fails: Mobile app → Railway backend (koas-production.up.railway.app)

## 🔍 Root Cause Analysis

### Local vs Production Difference
When mobile app hits **local backend**:
- FormData works perfectly
- Content-Type header doesn't matter (development mode is forgiving)

When mobile app hits **production Railway**:
- FormData parsing is stricter
- Wrong Content-Type header breaks multer
- Missing boundary parameter = no file received

## ✅ Solution Checklist

### 1️⃣ Deploy Backend Changes to Railway

**Check if you've pushed these files:**
```bash
git log --oneline --name-only -3
```

**Should see:**
- `backend/src/controllers/upload.controller.js`
- `backend/src/routes/upload.routes.js`

**If not pushed yet:**
```bash
cd c:\Users\hamza\Documents\GitHub\KOAS

# Add backend changes
git add backend/src/controllers/upload.controller.js
git add backend/src/routes/upload.routes.js

# Commit
git commit -m "Fix: Multer error handling and logging for Railway"

# Push to Railway
git push origin main
```

### 2️⃣ Check Railway Deployment Status

**Option A: Railway Dashboard**
1. Go to https://railway.app
2. Find your KOAS backend project
3. Check deployment status (should be green ✅)
4. Note the deployment time

**Option B: Railway CLI**
```bash
railway status
```

### 3️⃣ Verify Railway Environment Variables

**Required on Railway:**
```env
DATABASE_URL=postgresql://...  (Railway sets this automatically)
JWT_SECRET=supersecretkey       (must match your local)
NODE_ENV=production             (important for error handling)
```

**Optional but recommended:**
```env
CORS_ORIGINS=*  (allows all origins, including mobile)
```

**How to check:**
1. Railway Dashboard → Your Project → Variables tab
2. Verify `JWT_SECRET` matches your local
3. Check if `NODE_ENV=production` is set

### 4️⃣ Test with Mobile App

**Your app.config.js is correct:**
```javascript
apiUrl: "https://koas-production.up.railway.app"
```

**Test flow:**
1. Open mobile app (Expo Go or build)
2. Navigate to Bookings
3. Click "Upload Receipt"
4. Select image
5. Watch what happens

### 5️⃣ Check Railway Logs in Real-Time

**Open terminal and run:**
```bash
railway logs --tail
```

**When you upload, you should see:**

✅ **Success:**
```
Receipt uploaded successfully: /uploads/receipts/receipt-1778754655959-201265401.jpg
```

❌ **Failure Pattern 1 - No file received:**
```
No file in receipt upload. Body: {} Headers: multipart/form-data
```
**Cause:** Mobile app still using old code OR axios not removing Content-Type

❌ **Failure Pattern 2 - Multer error:**
```
Multer error (receipt): Unexpected field
```
**Cause:** Field name mismatch or duplicate uploads

❌ **Failure Pattern 3 - Permission error:**
```
Not allowed by CORS
```
**Cause:** CORS misconfiguration (unlikely with mobile)

## 🔧 Debugging Steps

### Step A: Verify Mobile App is Using Fixed Code

**Add temporary logging to your mobile app:**

In `mobile-app/src/screens/BookingsScreen.tsx`, check the upload function:
```typescript
const submitReceipt = async () => {
  console.log('=== UPLOAD DEBUG ===');
  console.log('API Base URL:', API_BASE_URL);
  console.log('Preview receipt:', previewReceipt);
  
  const formData = new FormData();
  const ext = previewReceipt.mimeType?.split('/')[1] || 'jpg';
  
  formData.append('receipt', {
    uri: previewReceipt.uri,
    type: previewReceipt.mimeType || 'image/jpeg',
    name: `receipt-${Date.now()}.${ext}`,
  } as any);
  
  console.log('FormData created, uploading to:', `${API_BASE_URL}/api/upload/receipt`);
  
  try {
    const uploadRes = await api.post('/upload/receipt', formData);
    console.log('Upload success:', uploadRes.data);
  } catch (err) {
    console.error('Upload error:', err);
    console.error('Error response:', err.response?.data);
    console.error('Error status:', err.response?.status);
  }
};
```

**Reload app and check Metro bundler logs.**

### Step B: Test Upload Directly from Postman/Insomnia

**Test if Railway backend can receive files at all:**

```http
POST https://koas-production.up.railway.app/api/upload/receipt
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

Body (form-data):
- receipt: [select a file]
```

**If this works** → Problem is in mobile app
**If this fails** → Problem is in Railway backend

### Step C: Check Railway File System

**Important:** Railway uses **ephemeral storage**. Uploaded files are stored in:
```
/app/public/uploads/receipts/
```

**This directory:**
- ✅ Gets created automatically (by our code)
- ⚠️ Gets DELETED on every deployment
- ⚠️ Gets DELETED on container restart

**To verify uploads are working (temporarily):**
1. Upload a file
2. Immediately check if it can be accessed:
   ```
   https://koas-production.up.railway.app/uploads/receipts/[filename].jpg
   ```
3. If 404 → File wasn't saved
4. If 200 + image shows → Upload worked!

## 🎯 Most Likely Issues

### Issue 1: Mobile App Not Using Fixed Code ⚠️

**Symptom:** Local works, production fails with same error

**Check:**
1. Did you reload the mobile app after I made the fixes?
2. Is Metro bundler running fresh code?

**Fix:**
```bash
# In mobile-app directory
# Stop Metro bundler (Ctrl+C)
# Clear cache and restart
npx expo start --clear
```

Then reload app on your device.

### Issue 2: Railway Not Deployed Yet ⚠️

**Symptom:** Railway logs still show old code

**Check:**
```bash
railway logs | grep "upload"
```

**If you don't see the new logs** → Backend not deployed yet

**Fix:**
```bash
git push origin main
# Wait 2-3 minutes for Railway to deploy
```

### Issue 3: JWT Token Mismatch ⚠️

**Symptom:** 401 Unauthorized errors

**Check:**
- Local backend JWT_SECRET: `supersecretkey` (from your .env)
- Railway backend JWT_SECRET: ??? (check Railway variables)

**They must match!**

**Fix:**
1. Railway Dashboard → Your Project → Variables
2. Set `JWT_SECRET=supersecretkey`
3. Redeploy

### Issue 4: Network Timeout ⚠️

**Symptom:** Request hangs, then times out

**Mobile app timeout is 30 seconds** (from axios config)

**Check Railway logs:**
```bash
railway logs --tail
```

**If you see the request arriving** → Backend is processing (not a network issue)
**If you see nothing** → Request not reaching Railway (network/CORS issue)

## 📊 Expected vs Actual

### ✅ Expected Flow (Working)
```
1. Mobile app: Select image
2. Mobile app: Create FormData (no Content-Type header)
3. Mobile app: POST to Railway
4. Railway: Receive multipart request
5. Railway: Multer parses file
6. Railway: Save to /app/public/uploads/receipts/
7. Railway: Return { imageUrl: "/uploads/receipts/..." }
8. Mobile app: Save URL to database
9. Mobile app: Show success alert
```

### ❌ Actual Flow (Broken)
```
1. Mobile app: Select image
2. Mobile app: Create FormData
3. Mobile app: POST to Railway
4. Railway: Receive request
5. Railway: Multer fails to parse (no boundary)
6. Railway: req.file is undefined
7. Railway: Return 400 "No file uploaded"
8. Mobile app: Show error alert
```

## 🚀 Quick Fix Steps

**Right now, do this:**

1. **Push backend changes:**
   ```bash
   git push origin main
   ```

2. **Wait for Railway deployment** (2-3 min)

3. **Clear mobile app cache:**
   ```bash
   # In Metro bundler terminal
   # Press 'r' to reload
   # Or restart with: npx expo start --clear
   ```

4. **Test upload with Railway logs open:**
   ```bash
   railway logs --tail
   ```

5. **Upload receipt and watch logs**

6. **If you see "Receipt uploaded successfully"** → ✅ FIXED!

## 🆘 If Still Broken

**Capture these details:**

1. **Railway logs during upload attempt:**
   ```bash
   railway logs --tail > railway-logs.txt
   ```

2. **Mobile app Metro logs:**
   Screenshot the console when upload fails

3. **Railway environment variables:**
   ```bash
   railway variables
   ```

4. **Test direct backend access:**
   ```bash
   curl https://koas-production.up.railway.app/api/
   ```

Share these and I'll help debug further.

---
**Status:** Waiting for Railway deployment
**Next:** Test upload and check logs
