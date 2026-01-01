# Fixing Windows Path Issues with Next.js

## Quick Fix Steps

1. **Stop the dev server** (Ctrl+C)

2. **Clear Next.js cache:**
```powershell
cd frontend
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
```

3. **Clear node_modules cache:**
```powershell
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
```

4. **Restart the dev server:**
```powershell
npm run dev
```

## Alternative: Update Next.js

If the issue persists, try updating Next.js:

```powershell
cd frontend
npm install next@latest
```

## If Still Not Working

Try running with Node.js options:

```powershell
$env:NODE_OPTIONS="--no-experimental-fetch"
npm run dev
```

Or create a `package.json` script:

```json
"dev": "cross-env NODE_OPTIONS=--no-experimental-fetch next dev"
```

Then install cross-env:
```powershell
npm install --save-dev cross-env
```

