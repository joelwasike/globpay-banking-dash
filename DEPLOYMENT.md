# Production Deployment Guide

## Issue Fixed
The production build was failing with:
- **"Failed to load module script: Expected a JavaScript module but the server responded with MIME type text/html"**

This happens when the server returns `index.html` (or any HTML) for requests to `.js` / `.css` files. The server must:
1. Serve `.js` files with `Content-Type: application/javascript`
2. Serve `.css` files with `Content-Type: text/css`
3. **Never** serve `index.html` for URLs that request static assets (e.g. `/js/index-xxx.js`, `/css/xxx.css`)
4. Only serve `index.html` for document/navigation requests (SPA fallback)

## Solutions Provided

### 1. Apache Server (.htaccess)
If using Apache, the `.htaccess` file in the `dist/` folder will:
- Set correct MIME types for JS/CSS files
- Enable CORS headers
- Handle SPA routing
- Set proper caching headers

### 2. Netlify (_redirects)
If deploying to Netlify, the `_redirects` file will handle SPA routing.

### 3. Node.js Server (server.js)
For Node.js hosting, use the provided `server.js` script:
```bash
npm install express
node server.js
```

### 4. Nginx Configuration
For Nginx servers, use the provided `nginx.conf` configuration.

## Deployment Steps

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Upload the `dist/` folder** to your server

3. **Configure your server** based on your hosting type:
   - **Apache**: The `.htaccess` file is already included
   - **Nginx**: Use the provided `nginx.conf` configuration
   - **Node.js**: Run `node server.js` in the dist directory
   - **Netlify**: The `_redirects` file is already included

4. **Verify the deployment:**
   - Check that JavaScript files are served with `Content-Type: application/javascript`
   - Ensure CORS headers are present
   - Test that all routes work correctly

## Key Configuration Changes Made

1. **Vite Configuration**: Modified `vite.config.mjs` to use relative paths (`base: './'`)
2. **Server Headers**: Added proper MIME types and CORS headers
3. **SPA Routing**: Configured to serve `index.html` for all routes
4. **Static Assets**: Proper handling of JS/CSS files with correct headers

## If you still see "Expected a JavaScript module but got text/html"

1. **Check document root**  
   The server’s document root (e.g. Nginx `root`, Apache `DocumentRoot`) must point at the folder that contains **both** `index.html` and the `js/` (and `css/`, `images/`, `fonts/`) folders from the build. If you deploy the contents of `dist/` into `/var/www/html`, then `root` / `DocumentRoot` must be `/var/www/html`, not a parent folder.

2. **No SPA fallback for assets**  
   Do **not** send `index.html` for URLs like `/js/...` or `/css/...`. Only send `index.html` when the request is for a path that is not a real file (e.g. `/dashboard`, `/login`). Use the `nginx.conf` and `public/.htaccess` in this repo as reference.

3. **Subdirectory deployment**  
   If the app is served from a subpath (e.g. `https://example.com/app/`), keep `base: './'` in Vite (already set). Upload the build so that `index.html` and the `js/`, `css/`, etc. folders all live under that subpath. The server must serve files from that subpath (e.g. `https://example.com/app/js/index-xxx.js` must return the real JS file with correct MIME type).

## Testing Locally

To test the production build locally:
```bash
# Option 1: Using serve (run from project root; -s = SPA fallback)
npx serve dist -p 3001 -s

# Option 2: Using Node.js server (run from project root; serves dist/ with correct MIME types)
node server.js
```

The application should now work correctly on your production domain without the module loading errors.
