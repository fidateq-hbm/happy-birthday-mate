# How to Create Open Graph Image

## Quick Method: Use HTML Template

1. **Open the template**: Open `og-image-template.html` in your browser
2. **Take a screenshot**: 
   - Use browser dev tools (F12) → Device toolbar
   - Set viewport to 1200x630
   - Take screenshot or use browser extensions like "Full Page Screen Capture"
3. **Save as JPG**: Save the screenshot as `og-image.jpg` in this directory

## Method 2: Use Online Tools

### Canva (Recommended - Free)
1. Go to https://www.canva.com
2. Click "Create a design" → "Custom size"
3. Enter: 1200 x 630 pixels
4. Design your image:
   - Add "Happy Birthday Mate" as main text
   - Add tagline: "Celebrate Together"
   - Add birthday emoji/icon: 🎂
   - Use your brand colors (purple/pink gradient)
   - Add decorative elements (confetti, balloons)
5. Download as JPG
6. Rename to `og-image.jpg`
7. Place in `frontend/public/` directory

### OG Image Generator
1. Go to https://www.opengraph.xyz
2. Enter your details:
   - Title: "Happy Birthday Mate"
   - Description: "Celebrate Together - Where no one celebrates alone"
3. Customize colors and style
4. Download and save as `og-image.jpg`

## Method 3: Use Design Software

### Figma (Free)
1. Create new file
2. Create frame: 1200 x 630px
3. Add:
   - Background gradient (purple to pink)
   - Logo/text: "Happy Birthday Mate"
   - Tagline: "Celebrate Together"
   - Birthday icon/emoji
4. Export as JPG
5. Save as `og-image.jpg`

### Photoshop/GIMP
1. Create new document: 1200 x 630px
2. Add gradient background
3. Add text and graphics
4. Export as JPG
5. Save as `og-image.jpg`

## Method 4: Use Command Line (Advanced)

If you have Node.js installed:
```bash
npm install -g puppeteer-cli
puppeteer screenshot og-image-template.html --width=1200 --height=630 og-image.jpg
```

## Image Specifications

- **Size**: 1200 x 630 pixels (exact)
- **Format**: JPG or PNG
- **File size**: Under 1MB (recommended)
- **Aspect ratio**: 1.91:1
- **Location**: `frontend/public/og-image.jpg`

## What to Include

✅ Your logo or brand name: "Happy Birthday Mate"
✅ Tagline: "Celebrate Together" or "Where no one celebrates alone"
✅ Visual elements: Birthday cake, balloons, confetti
✅ Brand colors: Purple/pink gradient
✅ Website URL (optional): www.happybirthdaymate.com

## Testing

After creating the image:
1. Place it in `frontend/public/og-image.jpg`
2. Test on Facebook: https://developers.facebook.com/tools/debug/
3. Test on Twitter: https://cards-dev.twitter.com/validator
4. Test on LinkedIn: https://www.linkedin.com/post-inspector/

## Need Help?

If you want me to create a custom design, provide:
- Your logo file (if available)
- Preferred colors
- Specific tagline
- Any design preferences

I can generate HTML/CSS code that you can render to an image.

