#!/usr/bin/env node

/**
 * Alternative deployment script for Netlify (if Vercel continues to have iframe issues)
 * This script sets up deployment to Netlify which has better iframe support
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Netlify deployment for iframe compatibility...');

// Create netlify.toml for iframe-friendly headers
const netlifyConfig = `
[build]
  command = "npm run build"
  publish = ".next"

[[headers]]
  for = "/*"
  [headers.values]
    # Allow iframe embedding from Farcaster domains
    Content-Security-Policy = "frame-ancestors 'self' https://farcaster.xyz https://*.farcaster.xyz https://warpcast.com https://*.warpcast.com; default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https: wss:; font-src 'self' data:; object-src 'none'"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "origin-when-cross-origin"
    # IMPORTANT: Do NOT set X-Frame-Options to allow iframe embedding

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
`;

fs.writeFileSync('netlify.toml', netlifyConfig);
console.log('✅ Created netlify.toml with iframe-friendly headers');

// Create package.json script for Netlify deployment
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
packageJson.scripts = {
  ...packageJson.scripts,
  'deploy:netlify': 'netlify deploy --prod --dir=.next',
  'deploy:netlify:preview': 'netlify deploy --dir=.next'
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ Added Netlify deployment scripts to package.json');

console.log(`
🎯 Next steps for Netlify deployment:

1. Install Netlify CLI globally:
   npm install -g netlify-cli

2. Login to Netlify:
   netlify login

3. Initialize your site:
   netlify init

4. Deploy:
   npm run deploy:netlify

📋 Netlify advantages for iframe embedding:
- No automatic X-Frame-Options: DENY header
- Full control over CSP headers
- Better iframe compatibility out of the box
- Easier header configuration

🔗 Your app will be iframe-embeddable once deployed to Netlify!
`);
