# Installing Railway CLI on Windows

The direct PowerShell installation script may not work. Here are reliable alternatives:

## ✅ Method 1: Using npm (Recommended)

**Prerequisites:** Node.js must be installed (download from https://nodejs.org/)

```powershell
# Open PowerShell (can be run from anywhere)
npm install -g @railway/cli

# Verify installation
railway --version
```

If you get an error, try:
```powershell
npm cache clean --force
npm install -g @railway/cli
```

## ✅ Method 2: Manual Download

1. **Download Railway CLI:**
   - Go to: https://github.com/railwayapp/cli/releases
   - Download the latest `railway_windows_amd64.zip` file

2. **Extract the file:**
   - Extract `railway.exe` from the zip file

3. **Add to PATH:**
   - Create a folder: `C:\railway` (or any folder you prefer)
   - Copy `railway.exe` to this folder
   - Add the folder to your system PATH:
     - Press `Win + X` → Select "System"
     - Click "Advanced system settings"
     - Click "Environment Variables"
     - Under "System variables", find "Path" and click "Edit"
     - Click "New" and add: `C:\railway` (or your chosen folder)
     - Click "OK" on all dialogs

4. **Verify installation:**
   ```powershell
   # Close and reopen PowerShell, then:
   railway --version
   ```

## ✅ Method 3: Using Chocolatey (If installed)

```powershell
# Open PowerShell as Administrator
choco install railway
```

## ✅ Method 4: Using Scoop (If installed)

```powershell
# Open PowerShell
scoop install railway
```

## 🔍 Troubleshooting

**Problem:** `railway: command not found`
- **Solution:** Make sure the folder containing `railway.exe` is in your PATH
- Restart PowerShell after adding to PATH

**Problem:** npm installation fails
- **Solution:** Make sure Node.js is installed: `node --version`
- Try: `npm cache clean --force` then retry installation

**Problem:** Permission denied
- **Solution:** Run PowerShell as Administrator

## ✅ After Installation

Once installed, verify it works:
```powershell
railway --version
```

You should see something like: `railway version 3.x.x`

Then proceed with:
```powershell
railway login
```

