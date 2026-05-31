const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

const distPath = path.join(__dirname, 'dist');

// CRITICAL: Serve static files first so JS/CSS are never replaced by index.html
// (avoids "Expected a JavaScript module but got text/html" MIME type error)
app.use(express.static(distPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// SPA fallback: only for routes that did not match a static file
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Production build served from dist/ directory');
});
