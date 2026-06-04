# 🔴 Network Error During Subscription Upload - Debug Guide

## The Error
```
ERROR Subscription upload error: Network Error
```

## 🔍 What This Means

**"Network Error"** in React Native means the request **never reached the server** or **server didn't respond**. It's NOT a backend error - it's a connection problem.

## 🎯 Common Causes (Check In Order)

### 1️⃣ Backend Not Running
**Check:** Is your local backend running?

```bash
# Terminal should show:
Server running on port 5000
```

**If not running:**
```bash
cd backend
npm run dev
```

### 2️⃣ Wrong API URL
**Check Metro bundler logs for:**
```
🔧 Using local backend: http://192.168.1.100:5000
```

**If it says production URL:**
```
📱 Using production API: https://koas-production.up.railway.app
```

You're hitting Railway (which doesn't have Cloudinary configured yet).

**Fix:** The mobile app should auto-detect local backend in Expo Go. Make sure you're using Expo Go, not a standalone build.

### 3️⃣ Firewall/Network Issue
**Check:** Can you access backend from mobile?

**Test from computer:**
```bash
curl http://localhost:5000/api/
# Should return: {"message":"KOAS API Running"}
```

**Test from mobile (same WiFi):**
Open mobile browser → `http://YOUR_COMPUTER_IP:5000/api/`

### 4️⃣ Cloudinary Configuration
**Check:** Are Cloudinary credentials set?

```bash
# In backend/.env
CLOUDINARY_CLOUD_NAME=drgodjqw1  # ✅ Set
CLOUDINARY_API_KEY=693221134951255  # ✅ Set
CLOUDINARY_API_SECRET=CUhf6E5iK3...  # ✅ Set
```

### 5️⃣ File Size Too Large
**Check:** Image file size

React Native may fail silently if image is > 10MB.

## 🔧 Step-by-Step Debug

### Step 1: Check Backend Status
```bash
cd backend
npm run dev
```

**Look for:**
```
Server running on port 5000
```

### Step 2: Check Mobile App Logs
In Metro bundler, look for:
```
=== SUBSCRIPTION UPLOAD START ===
Receipt image: { uri: "...", mimeType: "..." }
API Base URL: http://192.168.1.100:5000
Uploading receipt to Cloudinary...
```

**If you see:**
```
=== SUBSCRIPTION UPLOAD ERROR ===
Error type: ERR_NETWORK
```

→ Request never reached backend

### Step 3: Test Backend Directly
**From your computer:**
```bash
curl -X POST http://localhost:5000/api/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Should work**

**From mobile browser:**
Open: `http://192.168.1.100:5000/api/`

**Should show:** `{"message":"KOAS API Running"}`

### Step 4: Check Network
**Ensure mobile and computer on same WiFi**

```bash
# On Windows, get your IP:
ipconfig

# Look for "IPv4 Address": 192.168.1.100
```

Mobile app should use this IP for local development.

### Step 5: Test Simple Upload
Try uploading a **small image** (< 1MB) first.

Large images may timeout.

## 🎯 Quick Fixes

### Fix 1: Backend Not Running
```bash
cd backend
npm run dev
```

### Fix 2: Wrong API URL (Using Production)
**Check your mobile app console:**
- Should say: `🔧 Using local backend`
- If says: `📱 Using production API`

**Restart Expo:**
```bash
# In mobile-app terminal
# Press 'r' to reload
# Or restart: npx expo start --clear
```

### Fix 3: Use Production Instead (Temporary)
If local network has issues, use Railway:

**But first, configure Cloudinary on Railway:**
1. Railway Dashboard → Variables
2. Add:
   - `CLOUDINARY_CLOUD_NAME=drgodjqw1`
   - `CLOUDINARY_API_KEY=693221134951255`
   - `CLOUDINARY_API_SECRET=CUhf6E5iK3quzdVYj4gBD1nSYi8`
3. Deploy

Then test with production API.

### Fix 4: Increase Timeout
Already done - uploads now have 60s timeout.

### Fix 5: Check Cloudinary Credentials
```bash
# Test Cloudinary directly
cd backend
node -e "
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'drgodjqw1',
  api_key: '693221134951255',
  api_secret: 'CUhf6E5iK3quzdVYj4gBD1nSYi8'
});
console.log('Cloudinary configured:', cloudinary.config().cloud_name);
"
```

Should print: `Cloudinary configured: drgodjqw1`

## 📊 Error Types

| Error Code | Meaning | Fix |
|------------|---------|-----|
| `ERR_NETWORK` | Can't reach server | Check backend running + network |
| `ECONNABORTED` | Timeout | Increase timeout or check internet |
| `413` | File too large | Reduce image size |
| `500` | Server error | Check backend logs |
| `401` | Auth error | Token expired, re-login |

## ✅ Expected Flow (Working)

```
1. User selects receipt image
   → Console: "Receipt image: { uri: ... }"

2. Create FormData
   → Console: "Uploading receipt to Cloudinary..."

3. Upload to backend /api/upload/receipt
   → Backend: "Receipt uploaded to Cloudinary: https://..."
   → Console: "Upload response: { imageUrl: ... }"

4. Submit subscription
   → Console: "Submitting subscription request..."
   → Console: "Subscription submitted successfully!"

5. Success alert shows
```

## 🔴 Your Current Flow (Broken)

```
1. User selects receipt image ✅
   
2. Create FormData ✅
   
3. Try to upload ❌
   → Error: Network Error
   → Never reaches backend
```

## 🆘 Still Not Working?

**Capture these details:**

1. **Metro bundler console logs** (everything between START and ERROR)

2. **Backend terminal** - Is it showing any requests?

3. **What URL is mobile using?**
   ```
   Check Metro logs for: "API Base URL: ..."
   ```

4. **Can you access backend from mobile browser?**
   ```
   Open: http://YOUR_IP:5000/api/
   ```

5. **Are you using Expo Go or standalone build?**
   - Expo Go → Should use local backend
   - Standalone/APK → Uses production Railway

Share these and I'll help debug further! 🚀

---
**Most Common Fix:** Backend not running - `npm run dev` in backend folder
