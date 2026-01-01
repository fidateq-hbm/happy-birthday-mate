# Setting Up PWA Icons

You need to create app icons for the PWA. Here's how:

## Quick Setup (Using a Tool)

1. **Create a base icon** (512x512px PNG with your cake logo)
2. **Use PWA Asset Generator**: https://www.pwabuilder.com/imageGenerator

Or manually create these sizes and place in `frontend/public/icons/`:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Temporary Solution (For Testing)

I'll create a placeholder using a solid color and text. Create this file:

```javascript
// scripts/generate-icons.js
const fs = require('fs');
const path = require('path');

// This is a placeholder - replace with actual image generation
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const iconsDir = path.join(__dirname, '../frontend/public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Icons directory created. Add your actual PNG icons here.');
console.log('Sizes needed:', sizes.map(s => `${s}x${s}`).join(', '));
```

## For Now

Use this online tool to generate all icons:
1. Go to: https://realfavicongenerator.net/
2. Upload a 512x512 image (create one with "🎂" emoji or "HBM" text)
3. Download the generated package
4. Extract to `frontend/public/icons/`

The PWA will work without icons, but won't show an icon when installed.

