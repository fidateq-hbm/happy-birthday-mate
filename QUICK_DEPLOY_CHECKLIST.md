# 🚀 Quick Deployment Checklist

Use this checklist to ensure everything is set up correctly.

## ✅ Railway (Backend) Checklist

### Database Setup
- [ ] PostgreSQL database created in Railway
- [ ] `DATABASE_URL` copied from PostgreSQL service variables
- [ ] Database is running and accessible

### Backend Service Setup
- [ ] Backend service created from GitHub repo
- [ ] Root directory set to `backend`
- [ ] Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Environment Variables (Backend)
- [ ] `DATABASE_URL` - From PostgreSQL service
- [ ] `SECRET_KEY` - Random 32+ character string
- [ ] `ALGORITHM=HS256`
- [ ] `ACCESS_TOKEN_EXPIRE_MINUTES=30`
- [ ] `FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json`
- [ ] `ALLOWED_ORIGINS` - Your frontend URLs (comma-separated)
- [ ] `GEMINI_API_KEY` - Your Google Gemini API key

### Firebase Setup
- [ ] `firebase-credentials.json` uploaded to Railway (via Shell)
- [ ] File is in `backend/` directory
- [ ] File permissions are correct

### Database Migrations
- [ ] Ran `alembic upgrade head` via Railway Shell
- [ ] All migrations completed successfully
- [ ] No errors in migration logs

### Initial Data
- [ ] Ran `python database/seed_gift_catalog.py`
- [ ] Ran `python database/seed_celebrities_for_today.py`
- [ ] Data seeded successfully

### Testing
- [ ] Backend URL accessible: `https://your-backend.railway.app`
- [ ] API docs accessible: `https://your-backend.railway.app/docs`
- [ ] Health endpoint works: `https://your-backend.railway.app/api/health`

---

## ✅ Vercel (Frontend) Checklist

### Project Setup
- [ ] Project created from GitHub repo
- [ ] Framework preset: Next.js
- [ ] Root directory: `frontend`
- [ ] Build command: `npm run build`

### Environment Variables (Frontend)
- [ ] `NEXT_PUBLIC_API_URL` - Your Railway backend URL
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`

### Domain Setup
- [ ] Custom domain added: `happybirthdaymate.com`
- [ ] `www.happybirthdaymate.com` added
- [ ] DNS records configured (CNAME or A records)
- [ ] Domain verified and active

### Testing
- [ ] Frontend URL accessible: `https://happybirthdaymate.com`
- [ ] Homepage loads correctly
- [ ] Sign up works
- [ ] Login works
- [ ] API calls to backend succeed
- [ ] No CORS errors in browser console

---

## ✅ Post-Deployment Checklist

### Firebase Configuration
- [ ] Authorized domains added in Firebase Console:
  - [ ] `happybirthdaymate.com`
  - [ ] `www.happybirthdaymate.com`
  - [ ] `your-app.vercel.app` (if using Vercel preview)

### Backend CORS Update
- [ ] `ALLOWED_ORIGINS` updated with frontend URLs
- [ ] Backend redeployed after CORS update

### Final Testing
- [ ] User can sign up
- [ ] User can log in
- [ ] User can complete onboarding
- [ ] Dashboard loads correctly
- [ ] Tribe page works
- [ ] Gifts page works
- [ ] Birthday Wall creation works
- [ ] Photo uploads work
- [ ] AI message generation works

### Monitoring
- [ ] Railway logs accessible
- [ ] Vercel logs accessible
- [ ] Error tracking set up (optional)

---

## 🔧 Common Issues & Solutions

### Backend won't start
- Check Railway logs for errors
- Verify all environment variables are set
- Ensure `DATABASE_URL` is correct
- Check Firebase credentials file exists

### Database connection errors
- Verify `DATABASE_URL` format is correct
- Check PostgreSQL service is running
- Ensure database migrations ran successfully

### CORS errors
- Update `ALLOWED_ORIGINS` with exact frontend URL
- Include both `https://` and `http://` if needed
- Redeploy backend after updating

### Frontend build fails
- Check Vercel build logs
- Verify all `NEXT_PUBLIC_*` variables are set
- Ensure `NEXT_PUBLIC_API_URL` is correct

### Firebase auth not working
- Verify all Firebase env variables are set
- Check authorized domains in Firebase Console
- Ensure Firebase project is active

---

## 📞 Support

If you encounter issues:
1. Check Railway deployment logs
2. Check Vercel build/deployment logs
3. Verify all environment variables
4. Test API endpoints directly
5. Check browser console for frontend errors

