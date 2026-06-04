# 🖼️ Image Picker Fix - Media Types Issue

## 🐛 Problem
After selecting an image, it's not being received in the app. The preview modal doesn't show.

## 🔍 Root Cause
Incorrect `mediaTypes` parameter syntax in ImagePicker.

### ❌ Wrong (Old Syntax)
```typescript
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ['images'],  // ❌ Wrong - array syntax deprecated
  allowsEditing: false,
  quality: 0.8,
});
```

### ✅ Correct (Current SDK Syntax)
```typescript
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,  // ✅ Correct
  allowsEditing: false,
  quality: 0.8,
});
```

## 📝 Changes Made

### 1. BookingsScreen.tsx
- ✅ Fixed `mediaTypes` parameter
- ✅ Added console.log for debugging
- ✅ Better null checking for `result.assets`

### 2. SubscriptionCheckoutScreen.tsx
- ✅ Fixed `mediaTypes` parameter
- ✅ Added console.log for debugging
- ✅ Better null checking for `result.assets`

## 🧪 How to Test

### 1. Reload the App
If using Expo Go, shake your device and press "Reload"

Or press `r` in the Metro bundler terminal

### 2. Try Uploading Receipt
1. Go to Bookings tab
2. Select a booking with "Upload Receipt" button
3. Click "Upload Receipt"
4. Select an image from gallery

### 3. Check Console Logs
You should see in Metro bundler:
```
ImagePicker result: { canceled: false, assets: [...] }
Selected image: { uri: "file://...", mimeType: "image/jpeg", fileName: "..." }
```

### 4. Verify Preview Shows
After selecting image, you should see:
- ✅ Preview modal appears
- ✅ Selected image displays
- ✅ "Submit Receipt" button is enabled

## 🔍 Debugging

### If Image Still Not Showing

**Check Metro Bundler Console:**

```bash
# You should see these logs:
ImagePicker result: { ... }
Selected image: { uri: "...", mimeType: "...", fileName: "..." }
```

**If you see:**
```
Image selection cancelled or no asset returned
```

**Possible causes:**
1. User cancelled selection
2. Permission denied
3. ImagePicker returned unexpected format

**Check the result object:**
```typescript
console.log('Full result:', JSON.stringify(result, null, 2));
```

### Common Issues

#### 1. Permission Denied
**Symptom:** Alert shows "Permission Required"

**Solution:** 
- iOS: Settings → KOAS → Photos → Allow Access
- Android: Settings → Apps → KOAS → Permissions → Storage

#### 2. Image Picker Crashes
**Symptom:** App crashes when opening picker

**Solution:**
```bash
# Reinstall expo-image-picker
cd mobile-app
npm install expo-image-picker@latest
```

#### 3. Preview Modal Not Showing
**Symptom:** Image selected but modal doesn't appear

**Check state:**
```typescript
// In BookingsScreen.tsx, add this log after setPreviewReceipt
console.log('Preview receipt state set:', previewReceipt);
```

#### 4. Expo SDK Version Mismatch
**Check your SDK version:**
```bash
cd mobile-app
npx expo --version
```

**Should be SDK 49+** for the syntax we're using.

If older, update:
```bash
npx expo install expo-image-picker
```

## 📱 Platform-Specific Notes

### iOS
- Works with both simulator and physical device
- Requires `NSPhotoLibraryUsageDescription` in Info.plist (Expo handles this)

### Android
- Works with both emulator and physical device
- Requires `READ_EXTERNAL_STORAGE` permission (Expo handles this)
- Emulator: You may need to add images to the emulator first

## ✅ Expected Behavior After Fix

### Step 1: Click "Upload Receipt"
- Permission prompt (first time only)
- Photo gallery opens

### Step 2: Select Image
- Console logs the selected image details
- Preview modal appears immediately
- Image displays in the preview

### Step 3: Submit
- "Submit Receipt" button sends to backend
- Success alert shows
- Bookings list refreshes

## 🚀 Deploy Changes

```bash
# If using Expo Go - just reload
# Press 'r' in Metro bundler

# If using EAS build - need to rebuild
eas build --platform android --profile preview
```

## 📊 Verification Checklist

After making changes:
- [ ] App reloaded
- [ ] Image picker opens successfully
- [ ] Console logs show image details
- [ ] Preview modal appears
- [ ] Image displays in preview
- [ ] Submit button works
- [ ] Upload succeeds (check backend logs)

---
**Fixed:** Image picker mediaTypes syntax
**Added:** Debug logging
**Status:** Ready to test
