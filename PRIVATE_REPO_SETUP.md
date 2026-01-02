# Setting Up Render for Private GitHub Repository

## Option 1: Render GitHub App (Recommended - Easiest)

### Step 1: Install Render GitHub App
1. Go to: https://dashboard.render.com/account/apps
2. Click on "Configure" next to the GitHub App
3. In the "Repository access" section:
   - Select **"All repositories"** OR
   - Select **"Only select repositories"** and choose `happy-birthday-mate`
4. Click **"Save"** or **"Install"**

### Step 2: Verify Connection
1. Go to your Render Dashboard
2. Check your service settings
3. The repository should still be connected

### Step 3: Make Repository Private
1. Go to your GitHub repository: https://github.com/fidateq-hbm/happy-birthday-mate
2. Click **Settings** (top right)
3. Scroll down to **"Danger Zone"**
4. Click **"Change visibility"**
5. Select **"Make private"**
6. Type the repository name to confirm
7. Click **"I understand, change repository visibility"**

### Step 4: Test Auto-Deploy
1. Make a small change (e.g., update README)
2. Commit and push: `git push origin main`
3. Check Render dashboard - it should auto-deploy

---

## Option 2: Personal Access Token (If GitHub App doesn't work)

### Step 1: Create GitHub Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Name it: `Render Deployment Token`
4. Set expiration: **90 days** (or longer)
5. Select scopes:
   - ✅ **repo** (Full control of private repositories)
   - ✅ **read:org** (if using organization)
6. Click **"Generate token"**
7. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)

### Step 2: Update Render Service Connection
1. Go to Render Dashboard: https://dashboard.render.com
2. Select your backend service
3. Go to **Settings** → **Build & Deploy**
4. Find **"Repository"** section
5. Click **"Disconnect"** (if connected)
6. Click **"Connect GitHub"**
7. Select **"Connect with Personal Access Token"**
8. Paste your token
9. Select your repository: `fidateq-hbm/happy-birthday-mate`
10. Click **"Connect"**

### Step 3: Make Repository Private
1. Go to GitHub repository
2. Settings → Danger Zone → Change visibility → Make private

### Step 4: Test Auto-Deploy
1. Make a small change and push
2. Verify Render auto-deploys

---

## Troubleshooting

### If Render can't access the repo:
1. **Check GitHub App permissions:**
   - Go to: https://github.com/settings/installations
   - Find "Render" app
   - Ensure it has access to your repository

2. **Reconnect the repository:**
   - In Render Dashboard → Service Settings
   - Disconnect and reconnect the repository

3. **Check token expiration:**
   - If using PAT, ensure it hasn't expired
   - Create a new token if needed

4. **Verify repository name:**
   - Ensure the repository name matches exactly
   - Check for typos in organization/user name

### If auto-deploy stops working:
1. Check Render service logs
2. Verify webhook is active in GitHub:
   - Repository → Settings → Webhooks
   - Should see Render webhook with green checkmark
3. Manually trigger deploy in Render dashboard

---

## Important Notes

- ✅ **GitHub App is preferred** - easier to manage, no token expiration
- ✅ **PAT works but expires** - you'll need to renew it periodically
- ✅ **Both methods support auto-deploy** from private repos
- ⚠️ **Don't delete the connection** after making repo private
- ⚠️ **Keep your PAT secure** - never commit it to the repo

---

## Quick Checklist

- [ ] Install/Configure Render GitHub App OR Create PAT
- [ ] Verify Render can see your repository
- [ ] Make repository private on GitHub
- [ ] Test auto-deploy with a small change
- [ ] Verify deployment succeeds
- [ ] Confirm webhook is active (optional check)

