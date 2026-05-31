# 🚀 Production Deployment Guide

## Quick Start

1. **Build the application:**
   ```bash
   npm run build
   # or use the deploy script
   ./deploy.sh
   ```

2. **Upload the `dist/` folder** to your web server

3. **Configure your server** based on your hosting type (see below)

## 🔧 Server Configurations

### Apache Server
- **File**: `dist/.htaccess` (already included)
- **What it does**: Sets correct MIME types, enables CORS, handles SPA routing
- **Upload**: Just upload the `dist/` folder - `.htaccess` is included

### Nginx Server
- **File**: `nginx.conf` (use this configuration)
- **What it does**: Sets correct MIME types, handles SPA routing
- **Setup**: Copy the nginx.conf content to your server configuration

### Netlify
- **File**: `dist/_redirects` (already included)
- **What it does**: Handles SPA routing for Netlify
- **Upload**: Just upload the `dist/` folder - `_redirects` is included

### Node.js Server
- **File**: `server.js`
- **Setup**: 
  ```bash
  npm install express
  node server.js
  ```

## 🐛 Common Issues & Solutions

### Issue: "Failed to fetch dynamically imported module"
**Cause**: Server not serving JavaScript files with correct MIME type
**Solution**: Use the provided server configuration files

### Issue: "White screen" or "Page not found"
**Cause**: SPA routing not configured
**Solution**: Ensure your server redirects all routes to `index.html`

### Issue: "CORS errors"
**Cause**: Missing CORS headers
**Solution**: The `.htaccess` and `nginx.conf` files include CORS headers

## 📁 File Structure After Build
```
dist/
├── index.html          # Main HTML file
├── js/                 # JavaScript files
├── css/                # CSS files
├── images/             # Image assets
├── fonts/              # Font files
├── .htaccess           # Apache configuration
└── _redirects          # Netlify configuration
```

## 🧪 Testing Locally
```bash
# Test the production build
npx serve dist -p 3001 -s

# Test with Node.js server
node server.js
```

## 🌐 Production URLs
- **Main app**: `https://pay.globpay.ai/`
- **Minting page**: `https://pay.globpay.ai/minting`
- **Transactions**: `https://pay.globpay.ai/transactions`

## ✅ Verification Checklist
- [ ] Build completed without errors
- [ ] `dist/` folder contains all files
- [ ] Server configuration applied
- [ ] Test locally with `npx serve dist -p 3001 -s`
- [ ] Upload to production server
- [ ] Test all routes work correctly
- [ ] Check browser console for errors

## 🆘 Troubleshooting

### If the app still doesn't work:
1. Check browser console for errors
2. Verify server is serving files with correct MIME types
3. Ensure SPA routing is configured
4. Check CORS headers are present
5. Test with different browsers

### Contact Support
If you're still having issues, check:
- Server logs for errors
- Browser network tab for failed requests
- Console for JavaScript errors
