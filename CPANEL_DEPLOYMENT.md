# 🚀 cPanel Deployment Guide for KOAS

## Overview
This guide covers deploying the KOAS backend to cPanel with file upload support.

## 📋 Prerequisites
- cPanel account with Node.js support
- PostgreSQL database (cPanel or external like Railway)
- Domain/subdomain configured
- FTP/SSH access

## 🔧 Step 1: Prepare Your cPanel

### 1.1 Enable Node.js Application
1. Log into cPanel
2. Navigate to **Software** → **Setup Node.js App**
3. Click **Create Application**
4. Configure:
   - **Node.js version**: 18.x or higher
   - **Application mode**: Production
   - **Application root**: `backend` (or your preferred path)
   - **Application URL**: Your domain/subdomain
   - **Application startup file**: `src/server.js`

### 1.2 Create Upload Directories
Via SSH or File Manager:
```bash
cd ~/backend  # or your app root
mkdir -p public/uploads/stadiums
mkdir -p public/uploads/receipts
touch public/uploads/.gitkeep
touch public/uploads/stadiums/.gitkeep
touch public/uploads/receipts/.gitkeep
```

### 1.3 Set Permissions
```bash
chmod 755 public/uploads
chmod 755 public/uploads/stadiums
chmod 755 public/uploads/receipts
```

## 📦 Step 2: Upload Backend Files

### Option A: Via FTP
1. Use FileZilla or similar
2. Upload entire `backend` folder
3. Ensure `.env` is uploaded (or create manually)
4. Upload `node_modules` or install via cPanel terminal

### Option B: Via Git (Recommended)
```bash
cd ~/backend
git clone https://github.com/yourusername/KOAS.git
cd KOAS/backend
```

## 🔐 Step 3: Configure Environment Variables

### 3.1 Create .env file
In cPanel File Manager or via SSH:
```bash
cd ~/backend
nano .env
```

### 3.2 Add Production Variables
```env
# Database (Use Railway or cPanel PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Auth
JWT_SECRET="your-strong-random-secret-here-change-this"

# CORS - Your frontend domains
CORS_ORIGINS="https://yourdomain.com,https://admin.yourdomain.com,https://owner.yourdomain.com"

# Server
PORT=5000
NODE_ENV=production
```

### 3.3 Alternative: Environment Variables in cPanel
1. Go to **Setup Node.js App**
2. Click your application
3. Scroll to **Environment Variables**
4. Add each variable:
   - Name: `DATABASE_URL`, Value: `postgresql://...`
   - Name: `JWT_SECRET`, Value: `your-secret`
   - etc.

## 📚 Step 4: Install Dependencies

### Via cPanel Terminal
1. Open **Terminal** in cPanel
2. Navigate to backend:
   ```bash
   cd ~/backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

## 🗄️ Step 5: Database Setup

### If Using Railway Postgres
- Keep existing `DATABASE_URL` from Railway
- Already migrated? Skip to Step 6

### If Using cPanel Postgres
1. Create database in cPanel
2. Update `DATABASE_URL` in `.env`
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

## 🌐 Step 6: Configure Static File Serving

### 6.1 Update Node.js App Settings
In cPanel → **Setup Node.js App**:
- **Passenger log file**: `logs/passenger.log`
- **Environment variables**: Add all from .env
- Click **Save**

### 6.2 Create .htaccess (if needed)
In your app's document root:
```apache
# Allow larger uploads
php_value upload_max_filesize 10M
php_value post_max_size 12M
php_value max_execution_time 300

# Enable .htaccess for subdirectories
Options +FollowSymLinks
RewriteEngine On

# Allow image access
<FilesMatch "\.(jpg|jpeg|png|gif|webp)$">
  Header set Access-Control-Allow-Origin "*"
  Header set Cache-Control "public, max-age=31536000"
</FilesMatch>
```

## ▶️ Step 7: Start Application

### Via cPanel Interface
1. Go to **Setup Node.js App**
2. Find your application
3. Click **Start App** or **Restart App**

### Verify It's Running
Check the status indicator should be green ✅

## 🧪 Step 8: Test Your Deployment

### 8.1 Test API Health
```bash
curl https://yourdomain.com/api/
# Should return: {"message":"KOAS API Running"}
```

### 8.2 Test Image Upload
1. Log into owner web
2. Create/edit stadium with image
3. Verify image appears

### 8.3 Test Receipt Upload
1. Use mobile app
2. Submit booking receipt
3. Check owner web to verify receipt displays

### 8.4 Check Logs
```bash
# Via SSH
tail -f ~/logs/passenger.log

# Or in cPanel File Manager
# Navigate to logs/passenger.log
```

## 🐛 Troubleshooting

### App Won't Start
**Check Node.js version**
```bash
node --version  # Should be 18+ 
```

**Check environment variables**
```bash
cd ~/backend
cat .env
```

**Check startup file**
- Must be `src/server.js`
- Verify path in cPanel settings

### Images Not Uploading
**Check permissions**
```bash
ls -la public/uploads
# Should show: drwxr-xr-x
```

**Check disk space**
```bash
df -h
```

**Check logs for errors**
```bash
grep "upload" ~/logs/passenger.log
```

### 401 Unauthorized Errors
**JWT_SECRET mismatch**
- Verify same secret in .env and cPanel
- Restart app after changing

### CORS Errors
**Update CORS_ORIGINS**
```env
CORS_ORIGINS="https://yourdomain.com,https://admin.yourdomain.com,https://app.yourdomain.com"
```
- Include ALL frontend URLs
- No trailing slashes
- Comma-separated, no spaces
- Restart app after changing

### Database Connection Fails
**Check DATABASE_URL format**
```
postgresql://username:password@host:port/database?schema=public
```

**Test connection**
```bash
npx prisma db pull
```

### Images Return 404
**Check static file path**
- Images must be in `public/uploads/`
- Accessible via `/uploads/stadiums/filename.jpg`

**Check .htaccess**
- Ensure no rewrite rules blocking `/uploads`

### High Memory Usage
**Optimize Node.js**
```bash
# In cPanel Node.js App settings
# Set memory limit: --max-old-space-size=512
```

## 📊 Monitoring

### Check Application Status
1. cPanel → **Setup Node.js App**
2. View status indicator
3. Check **Actions** → **Log** for errors

### Monitor Disk Space
Images will grow over time:
```bash
du -sh public/uploads
```

### Monitor Logs
```bash
# Real-time monitoring
tail -f ~/logs/passenger.log

# Search for errors
grep -i error ~/logs/passenger.log
```

## 🔄 Updating Your App

### Via Git
```bash
cd ~/backend
git pull origin main
npm install
npx prisma generate
npx prisma migrate deploy  # if new migrations
```

### Restart App
1. cPanel → **Setup Node.js App**
2. Click **Restart**

### Via FTP
1. Upload changed files
2. Restart app via cPanel

## 🔐 Security Checklist

- [ ] Change JWT_SECRET from default
- [ ] Set NODE_ENV=production
- [ ] Configure CORS_ORIGINS (no wildcards)
- [ ] Restrict database access by IP
- [ ] Use HTTPS (SSL certificate)
- [ ] Set proper file permissions (755/644)
- [ ] Don't commit .env to git
- [ ] Enable cPanel IP blocking for /admin routes
- [ ] Set up regular database backups

## 📈 Performance Tips

### Enable Compression
In `.htaccess`:
```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/json application/javascript
</IfModule>
```

### Cache Static Assets
```apache
<FilesMatch "\.(jpg|jpeg|png|gif|webp|svg|ico)$">
  Header set Cache-Control "max-age=31536000, public"
</FilesMatch>
```

### Monitor Performance
```bash
# Check response times
curl -w "@-" -o /dev/null -s https://yourdomain.com/api/ << 'EOF'
time_total: %{time_total}s
EOF
```

## 🆘 Support Resources

- **cPanel Docs**: https://docs.cpanel.net/
- **Node.js App**: https://docs.cpanel.net/cpanel/software/setup-nodejs-app/
- **Prisma Deploy**: https://www.prisma.io/docs/guides/deployment

## ✅ Post-Deployment Checklist

- [ ] App starts without errors
- [ ] Database connection working
- [ ] Environment variables set
- [ ] Upload directories created with permissions
- [ ] Image uploads working (stadium + receipt)
- [ ] Images display in frontends
- [ ] CORS configured for all frontends
- [ ] SSL certificate installed
- [ ] Logs accessible and monitored
- [ ] Backup strategy in place

---
**Last Updated**: June 4, 2026
**Platform**: cPanel with Node.js + PostgreSQL
