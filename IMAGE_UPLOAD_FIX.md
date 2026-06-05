# 🔧 Image Upload Production Fix

## Problem Summary
Mobile app receipt uploads were failing due to **incorrect Content-Type header handling in React Native FormData uploads**.

## ✅ Changes Made

### 1. **Mobile App - BookingsScreen.tsx**
- ❌ **REMOVED**: Manual `Content-Type: multipart/form-data` header
- ✅ **ADDED**: Proper file extension extraction
- ✅ **ADDED**: Console error logging for debugging
- **Why**: React Native's FormData needs axios to auto-set the boundary parameter

### 2. **Mobile App - SubscriptionCheckoutScreen.tsx**
- ❌ **REMOVED**: Manual Content-Type header
- ✅ **ADDED**: Better error logging
- ✅ **ADDED**: Proper file extension handling

### 3. **Mobile App - axios.ts**
- ✅ **ADDED**: Request interceptor to delete manual Content-Type for FormData
- ✅ **INCREASED**: Timeout from 10s to 30s for file uploads
- **Why**: Ensures headers are clean for multipart uploads

### 4. **Backend - upload.controller.js**
- ✅ **ADDED**: Detailed error logging when no file received
- ✅ **ADDED**: Request body and header logging for debugging
- **Why**: Better production debugging

### 5. **Backend - upload.routes.js**
- ✅ **ADDED**: Explicit multer error handling
- ✅ **ADDED**: Error logging before sending response
- **Why**: Catch and log multer parsing errors

## 🎯 How to Test

### Local Testing
```bash
# Start backend
cd backend
npm run dev

# Test upload endpoints
```

### Production Testing
1. Deploy backend to your production server
2. Test receipt upload from mobile app
3. Check server logs for any errors

### 🚨 For Production

1. **File Permissions**
   ```bash
   chmod 755 public/uploads
   chmod 755 public/uploads/stadiums
   chmod 755 public/uploads/receipts
   ```

2. **Environment Variables**
   ```
   DATABASE_URL=<your-postgres-url>
   JWT_SECRET=<your-secret>
   CORS_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
   NODE_ENV=production
   PORT=5000
   ```

3. **Static File Serving**
   Ensure your server serves static files from `/public/uploads`

4. **Upload Size Limits**
   - Should allow at least 10MB for receipts
   - Configure server to handle larger uploads if needed

5. **Test These Scenarios**
   - [ ] Upload stadium image from owner web
   - [ ] Upload receipt from mobile app
   - [ ] View uploaded images (check URLs)
   - [ ] Delete old stadium image
   - [ ] Upload receipt after rejection

## 🔍 Debugging Production Issues

### Check Backend Logs
```bash
# View server logs
tail -f logs/server.log
```

### Common Error Messages

**"No file uploaded"**
- Check Content-Type header (should be auto-set by axios)
- Verify FormData construction
- Check file field name matches route (`receipt` or `image`)

**"Only image files are allowed"**
- File type not in: jpeg, jpg, png, gif, webp
- Check file extension and MIME type

**"File too large"**
- Stadium images: 5MB limit
- Receipts: 10MB limit
- Check cPanel upload limits

**401 Unauthorized**
- Token expired or invalid
- Check Authorization header

## 🎨 Technical Details

### Why Manual Content-Type Breaks Uploads

**React Native FormData** requires a boundary parameter:
```
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
```

**What was happening:**
```typescript
// ❌ WRONG - Missing boundary
headers: { 'Content-Type': 'multipart/form-data' }
```

**Fixed:**
```typescript
// ✅ CORRECT - Let axios handle it
// No manual Content-Type header
// Axios automatically adds: multipart/form-data; boundary=...
```

### Axios Interceptor Safety

```typescript
if (config.data instanceof FormData) {
  delete config.headers['Content-Type'];  // Ensure clean
}
```

This ensures that even if code accidentally sets the header, it gets removed.

## 🚀 Next Steps (Optional Improvements)

### Short-term
- [ ] Test production deployment
- [ ] Monitor server logs for any remaining issues
- [ ] Add rate limiting (express-rate-limit)

### Long-term (When scaling)
- [ ] Migrate to cloud storage (S3, DigitalOcean Spaces, etc.)
- [ ] Add image optimization (sharp)
- [ ] Implement CDN
- [ ] Add orphan file cleanup
- [ ] Generate thumbnails

## 📞 Support

If upload issues persist:
1. Check backend logs for "No file in receipt upload"
2. Verify mobile app is using the fixed axios.ts
3. Check upload directory permissions
4. Verify CORS settings include your mobile app domain

---
**Fixed**: June 4, 2026
**Tested**: Local ✅
