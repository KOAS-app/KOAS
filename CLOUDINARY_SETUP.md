# ☁️ Cloudinary Setup Guide

## 🎯 What Changed

All image uploads now go to Cloudinary instead of local file system:
- ✅ **Stadium images** → Cloudinary `koas/stadiums/` folder
- ✅ **Receipt images** → Cloudinary `koas/receipts/` folder
- ✅ **Images persist forever** (never deleted)
- ✅ **Auto-optimized** (WebP, quality optimization)
- ✅ **CDN delivery** (fast worldwide)

## 📋 Setup Steps

### Step 1: Create Cloudinary Account (Free)

1. Go to: https://cloudinary.com/users/register/free
2. Sign up with email or GitHub
3. Verify your email
4. You're on the **free tier** (25GB storage, 25GB bandwidth/month)

### Step 2: Get Your Credentials

1. After login, you'll see your **Dashboard**
2. Copy these three values from the dashboard:

```
Cloud Name: democloud123
API Key: 123456789012345
API Secret: AbCdEfGhIjKlMnOpQrStUvWx
```

### Step 3: Configure Local Environment

**Edit:** `backend/.env`

```env
# Add these lines:
CLOUDINARY_CLOUD_NAME="democloud123"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="AbCdEfGhIjKlMnOpQrStUvWx"
```

**Replace with YOUR actual credentials from Cloudinary dashboard!**

### Step 4: Configure Railway

1. Go to Railway Dashboard
2. Your Project → Backend Service → **Variables** tab
3. Add these three variables:

| Variable Name | Value |
|--------------|-------|
| `CLOUDINARY_CLOUD_NAME` | Your cloud name |
| `CLOUDINARY_API_KEY` | Your API key |
| `CLOUDINARY_API_SECRET` | Your API secret |

4. Railway will automatically redeploy

### Step 5: Test Local

```bash
cd backend
npm install  # Cloudinary package already installed
npm run dev  # Start backend
```

**Test upload:**
1. Open owner-web or admin-web
2. Upload a stadium image
3. Check Cloudinary dashboard → Media Library
4. You should see your image in `koas/stadiums/` folder!

### Step 6: Deploy to Railway

```bash
git add .
git commit -m "feat: Migrate image uploads to Cloudinary for persistent storage"
git push origin main
```

Railway will deploy automatically (~2-3 minutes).

## 🧪 Testing

### Test Stadium Image Upload
1. Owner web → Create/Edit Stadium
2. Upload image
3. Check Cloudinary dashboard → Media Library → `koas/stadiums/`
4. Image URL should start with: `https://res.cloudinary.com/YOUR_CLOUD_NAME/...`

### Test Receipt Upload
1. Mobile app → Bookings → Upload Receipt
2. Check Cloudinary dashboard → Media Library → `koas/receipts/`
3. Receipt should appear

### Test Image Persistence
1. Upload an image
2. Deploy new code to Railway
3. Image still works! ✅ (No more 404 errors)

## 📊 What's Different

### Before (Local Storage)
```javascript
// Upload
File saved to: /app/public/uploads/stadiums/stadium-123.jpg
URL: https://koas-production.up.railway.app/uploads/stadiums/stadium-123.jpg

// After deploy
File deleted ❌
URL returns: 404 Not Found
```

### After (Cloudinary)
```javascript
// Upload
File saved to: Cloudinary cloud
URL: https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1234/koas/stadiums/abc123.jpg

// After deploy
File still exists ✅
URL still works ✅
```

## 🎨 Cloudinary Features You Get For Free

### Auto-Optimization
Images are automatically:
- Compressed (smaller file sizes)
- Converted to WebP (when browser supports)
- Quality optimized
- Delivered via CDN

### Transformations
You can modify images on-the-fly via URL:
```
# Original
https://res.cloudinary.com/.../image.jpg

# Resize to 300px width
https://res.cloudinary.com/.../w_300/image.jpg

# Convert to grayscale
https://res.cloudinary.com/.../e_grayscale/image.jpg

# Crop and resize
https://res.cloudinary.com/.../c_fill,w_200,h_200/image.jpg
```

### Media Library
- View all uploaded images
- Organize by folders
- Search by tags
- Bulk operations

## 📈 Free Tier Limits

| Resource | Limit | Your Usage (Initially) |
|----------|-------|------------------------|
| **Storage** | 25GB | ~0.1GB (few hundred images) |
| **Bandwidth** | 25GB/month | ~1-2GB (low traffic) |
| **Transformations** | 25,000/month | ~1,000 (testing) |

**You're safe for testing and early production!**

## 🔐 Security

### What's Stored in Database
**Before:**
```javascript
imageUrl: "/uploads/stadiums/stadium-123.jpg"  // Relative path
```

**After:**
```javascript
imageUrl: "https://res.cloudinary.com/.../koas/stadiums/abc123.jpg"  // Full URL
```

### API Keys
- ✅ `API_KEY` - Public (safe in frontend)
- 🔒 `API_SECRET` - Private (never expose)
- 🔒 Keep API_SECRET in environment variables only

## 🐛 Troubleshooting

### "No such resource"
**Cause:** Cloudinary credentials not set

**Fix:**
1. Check `.env` file has all three values
2. Restart backend: `npm run dev`

### "Upload failed"
**Cause:** API secret wrong or network issue

**Check:**
1. Copy credentials exactly from Cloudinary dashboard
2. No extra spaces in `.env`
3. Check Railway logs for error details

### Images not appearing in Cloudinary dashboard
**Cause:** Wrong folder or upload failed silently

**Check:**
1. Media Library → Search for "koas"
2. Check folders: `koas/stadiums/` and `koas/receipts/`
3. Backend logs should show: "uploaded to Cloudinary"

### Old images still 404
**Expected:** Old images (uploaded before Cloudinary) are gone

**Fix:**
- Re-upload stadium images
- They'll now persist forever

## 💰 Cost Estimation

### Free Tier (Current)
- **$0/month**
- Good for: Testing, early MVP, < 1000 users

### When You Need to Upgrade
**Storage:** ~50,000 images = ~5GB  
**Bandwidth:** 10,000 image views/day = ~10GB/month

**You'll hit free tier limits when:**
- 50,000+ total images uploaded
- OR 25GB bandwidth/month (≈ 100k image views)

**Upgrade options:**
- **Plus ($99/month)**: 135GB storage, 135GB bandwidth
- **Advanced ($249/month)**: 535GB storage, 535GB bandwidth

## ✅ Checklist

- [ ] Created Cloudinary account
- [ ] Copied cloud name, API key, API secret
- [ ] Added credentials to local `.env`
- [ ] Added credentials to Railway variables
- [ ] Tested stadium image upload locally
- [ ] Committed and pushed to Railway
- [ ] Tested stadium image upload on Railway
- [ ] Tested receipt upload on mobile
- [ ] Verified images persist after deployment

## 🎉 You're Done!

Your images now:
- ✅ Never disappear
- ✅ Load faster (CDN)
- ✅ Auto-optimized
- ✅ Work on Railway, cPanel, anywhere
- ✅ Scale to millions of users

---
**Updated:** June 4, 2026  
**Status:** Production Ready
