# Apply Firebase Storage CORS Configuration

## Your Firebase Storage Bucket
**Bucket Name**: `happy-birthday-mate-7f498.firebasestorage.app`

## Quick Apply (Windows PowerShell)

1. **Install Google Cloud SDK** (if not installed):
   ```powershell
   (New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe"); & $env:Temp\GoogleCloudSDKInstaller.exe
   ```

2. **Authenticate**:
   ```powershell
   gcloud auth login
   ```

3. **Set your project**:
   ```powershell
   gcloud config set project happy-birthday-mate-7f498
   ```

4. **Apply CORS**:
   ```powershell
   gsutil cors set cors.json gs://happy-birthday-mate-7f498.firebasestorage.app
   ```

5. **Verify**:
   ```powershell
   gsutil cors get gs://happy-birthday-mate-7f498.firebasestorage.app
   ```

## Or Use the Script

Run the PowerShell script:
```powershell
.\scripts\apply-firebase-cors.ps1 -BucketName "happy-birthday-mate-7f498.firebasestorage.app" -ProjectId "happy-birthday-mate-7f498"
```

## Alternative: Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `happy-birthday-mate-7f498`
3. Go to **Storage** → **Settings** (gear icon)
4. Scroll to **CORS configuration**
5. Paste the content from `cors.json`

## Apply Storage Rules

1. Go to Firebase Console → Storage → Rules
2. Paste the content from `firebase/storage.rules`
3. Click **Publish**

