# ⚡ Cloudinary Quick Start (5 Minutes)

## 🎯 What You Need to Do RIGHT NOW

### 1️⃣ Get Cloudinary Credentials (2 minutes)

**Open this link:** https://cloudinary.com/users/register/free

1. Sign up (email or GitHub)
2. Verify email
3. You'll see your Dashboard with:
   ```
   Cloud Name: democloud123
   API Key: 123456789012345
   API Secret: AbCdEfGhIjKlMnOpQrStUvWx
   ```
4. **Copy these three values!**

### 2️⃣ Update Local `.env` (30 seconds)

**Open:** `backend/.env`

**Add these lines:**
```env
CLOUDINARY_CLOUD_NAME="YOUR_CLOUD_NAME_HERE"
CLOUDINARY_API_KEY="YOUR_API_KEY_HERE"
CLOUDINARY_API_SECRET="YOUR_API_SECRET_HERE"
```

**Replace with YOUR credentials from step 1!**

### 3️⃣ Test Locally (1 minute)

```bash
cd backend
npm run dev
```

**Test:** Upload a stadium image from owner-web or admin-web.

**Success:** Check https://cloudinary.com/console/media_library - your image should appear in `koas/stadiums/`!

### 4️⃣ Configure Railway (1 minute)

1. **Go to:** https://railway.app
2. **Your Project** → Backend Service → **Variables** tab
3. **Add these 3 variables:**
   - `CLOUDINARY_CLOUD_NAME` = Your cloud name
   - `CLOUDINARY_API_KEY` = Your API key  
   - `CLOUDINARY_API_SECRET` = Your API secret

4. **Click "Deploy"** (Railway auto-deploys)

### 5️⃣ Deploy Code (1 minute)

```bash
git add .
git commit -m "feat: Add Cloudinary for persistent image storage"
git push origin main
```

## ✅ You're Done!

**Test on Railway:**
1. Upload a stadium image
2. Check Cloudinary dashboard
3. Deploy new code
4. **Image still works!** ✅ (No more 404!)

---

## 🆘 Quick Troubleshooting

**"Upload failed"**
- Check credentials are copied exactly (no spaces)
- Restart backend: `npm run dev`

**"Images not in Cloudinary"**
- Check Media Library → Search "koas"
- Check folders: `koas/stadiums/` and `koas/receipts/`

**Need help?**
- Full guide: `CLOUDINARY_SETUP.md`
- Cloudinary docs: https://cloudinary.com/documentation

---
**Time to Complete:** 5 minutes  
**Cost:** $0 (Free tier)  
**Result:** Images persist forever! 🎉
