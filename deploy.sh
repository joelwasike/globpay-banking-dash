#!/bin/bash

echo "🚀 Building React application for production..."

# Build the application
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Production files are in the 'dist' folder"
    echo ""
    echo "📋 Deployment Instructions:"
    echo "1. Upload the entire 'dist' folder to your web server"
    echo "2. Make sure your server is configured to serve static files"
    echo "3. For Apache: The .htaccess file is already included"
    echo "4. For Nginx: Use the nginx.conf configuration"
    echo "5. For Netlify: The _redirects file is already included"
    echo ""
    echo "🔧 Server Configuration Files:"
    echo "- dist/.htaccess (for Apache)"
    echo "- dist/_redirects (for Netlify)"
    echo "- nginx.conf (for Nginx)"
    echo "- server.js (for Node.js)"
    echo ""
    echo "🌐 Test locally: npx serve dist -p 3001 -s"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
