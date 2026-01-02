# Render Environment Variables Setup Guide

## Step 1: Set Up Supabase Database

### 1.1 Create Supabase Account
1. Go to https://supabase.com
2. Sign up for a free account
3. Create a new project
4. Wait for the database to be provisioned (2-3 minutes)

### 1.2 Get Database Connection String
1. In Supabase Dashboard → **Project Settings** → **Database**
2. Scroll to **Connection string** section
3. Select **URI** tab
4. Copy the connection string (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)
5. Replace `[YOUR-PASSWORD]` with your actual database password (found in **Project Settings** → **Database** → **Database password**)

**Example:**
```
postgresql://postgres:your_password_here@db.abcdefghijklmnop.supabase.co:5432/postgres
```

---

## Step 2: Set Up Firebase Credentials

### 2.1 Get Firebase Service Account JSON
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** (gear icon) → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file
6. **Open the JSON file** and copy its entire contents

---

## Step 3: Add Environment Variables to Render

1. Go to your Render dashboard → **happy-birthday-mate** service
2. Click **Environment** tab
3. Click **Edit** button (top right)
4. Add each variable below by clicking **"+ Add"**

### Required Environment Variables:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | `postgresql://postgres:password@host:port/database` | From Supabase (Step 1.2) |
| `SECRET_KEY` | `4hncY-0vQ0ViHZBYHZ3aFqlNgGGdMn2wPJX9RGuxmlQ` | Use this or generate a new one |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Token expiration time |
| `FIREBASE_CREDENTIALS` | `{paste entire JSON content here}` | From Step 2.1 (see note below) |
| `GEMINI_API_KEY` | `your-gemini-api-key-here` | Your Gemini API key (get from Google AI Studio) |
| `ALLOWED_ORIGINS` | `https://happy-birthday-mate.onrender.com,http://localhost:3000` | Add your frontend URL when deployed |

### Important Notes:

**For `FIREBASE_CREDENTIALS`:**
- Paste the **entire JSON content** as a single-line string
- Remove all line breaks and extra spaces
- Example format: `{"type":"service_account","project_id":"your-project",...}`

**For `ALLOWED_ORIGINS`:**
- Add your frontend URL (Vercel) when you deploy it
- Format: `https://your-frontend.vercel.app,https://happy-birthday-mate.onrender.com`
- Separate multiple URLs with commas (no spaces)

---

## Step 4: Update Firebase Credentials Loading (Code Change Needed)

Since Render doesn't support file uploads easily, we need to update the code to read Firebase credentials from an environment variable instead of a file.

**I'll update the code to handle this automatically.**

---

## Step 5: Run Database Migrations

After setting environment variables, Render will restart. Then:

1. Go to Render → Your service → **Shell** tab
2. Run:
```bash
cd backend
alembic upgrade head
```

---

## Step 6: Seed Initial Data (Optional)

In the same Shell:
```bash
python database/seed_gift_catalog.py
python database/seed_celebrities_for_today.py
```

---

## Step 7: Verify Setup

1. Check Render logs for any errors
2. Visit: `https://happy-birthday-mate.onrender.com/docs`
3. You should see the FastAPI Swagger documentation
4. Test an endpoint to verify database connection

---

## Troubleshooting

### Firebase Error: "No such file or directory"
- Make sure `FIREBASE_CREDENTIALS` environment variable is set correctly
- The JSON should be a single-line string

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Check Supabase project is active
- Ensure password in connection string matches Supabase password

### CORS Errors
- Add your frontend URL to `ALLOWED_ORIGINS`
- Make sure URLs are comma-separated (no spaces)

