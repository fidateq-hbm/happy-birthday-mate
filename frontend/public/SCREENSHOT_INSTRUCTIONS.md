# How to Screenshot the OG Image Template

## Method 1: Browser DevTools (Recommended)

1. **Open the HTML file** in Chrome/Edge:
   - Right-click `og-image-template.html`
   - Select "Open with" → Chrome or Edge

2. **Open Developer Tools**:
   - Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Or right-click → "Inspect"

3. **Set Device Toolbar**:
   - Press `Ctrl+Shift+M` (Windows) / `Cmd+Shift+M` (Mac)
   - Or click the device icon in the toolbar

4. **Set Custom Size**:
   - Click the dimensions dropdown (e.g., "Responsive")
   - Select "Edit..."
   - Enter: Width: `1200`, Height: `630`
   - Press Enter

5. **Take Screenshot**:
   - Press `Ctrl+Shift+P` (Windows) / `Cmd+Shift+P` (Mac)
   - Type "screenshot"
   - Select "Capture screenshot" or "Capture node screenshot"
   - Save as `og-image.jpg`

## Method 2: Browser Extension

### Chrome/Edge Extension: "Full Page Screen Capture"
1. Install extension: "Full Page Screen Capture" or "Awesome Screenshot"
2. Open the HTML file in browser
3. Click the extension icon
4. Set custom size: 1200x630
5. Capture and save as `og-image.jpg`

## Method 3: Windows Snipping Tool

1. **Open the HTML file** in your browser
2. **Press Windows Key + Shift + S** (Windows 10/11)
3. **Select "Rectangular Snip"**
4. **Drag to select the entire page** (1200x630 area)
5. **Save** the image as `og-image.jpg`

## Method 4: Online Screenshot Tool

1. Go to https://htmlcsstoimage.com or similar
2. Upload or paste the HTML code
3. Set dimensions: 1200 x 630
4. Generate and download as JPG

## Method 5: Use Canva (Easiest Alternative)

If screenshot doesn't work well:
1. Go to https://www.canva.com
2. Create custom size: 1200 x 630px
3. Copy the design from the HTML template
4. Download as JPG

## Quick Checklist

- [ ] HTML file opens in browser
- [ ] Page shows: 🎂 emoji, "Happy Birthday Mate", "Celebrate Together", "Where no one celebrates alone"
- [ ] Background is purple/pink gradient
- [ ] Screenshot is exactly 1200x630 pixels
- [ ] Saved as `og-image.jpg`
- [ ] Placed in `frontend/public/` folder

## Troubleshooting

**If content is cut off:**
- Make sure browser zoom is at 100% (Ctrl+0)
- Use DevTools device toolbar method
- Check that viewport is set to 1200x630

**If text is too small/large:**
- The template is optimized for 1200x630
- Use DevTools to ensure exact size
- Don't zoom in/out

**If colors look different:**
- This is normal - screenshots may vary slightly
- The gradient will still work for social media

## Testing After Creation

Once you have `og-image.jpg`:
1. Place it in `frontend/public/og-image.jpg`
2. Test on Facebook: https://developers.facebook.com/tools/debug/
3. Test on Twitter: https://cards-dev.twitter.com/validator

