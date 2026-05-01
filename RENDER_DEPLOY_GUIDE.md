# Deploy BuiltMart on Render - Complete Guide

## 📋 Step 1: Deploy Server (Backend)

### 1.1 Push server to GitHub
```bash
cd server
git init
git add .
git commit -m "Deploy server"
git remote add origin https://github.com/5000-k/builtMart-backend.git
git push -u origin main
```

### 1.2 Create Web Service on Render
1. Go to https://render.com
2. Click **New +** → **Web Service**
3. Connect your GitHub repo
4. Configure:

| Setting | Value |
|---------|-------|
| Name | `builtmart-server` |
| Region | Singapore |
| Branch | `main` |
| Root Directory | (leave empty) |
| Runtime | `Node` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | `Free` |

### 1.3 Add Environment Variables (Server)
Go to Render dashboard → Your service → **Environment** tab:

```
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-frontend-url.onrender.com

MONGODB_URI=mongodb+srv://buirtmart:buirtmart@buirtmarlt.lhpcps7.mongodb.net/

JWT_ACCESS_SECRET=8a9d3e46f7b58a8c12c1a8b927c3fefb8e2e5c16a9d7d93f8c68c0e3b2a66e8f
JWT_REFRESH_SECRET=ad4f88b7c62d1b39f8c5a9a82eac0c173ad1b4b8b2a4cc9e13cb20d7b9357de0
JWT_ACCESS_EXPIRE=7d
JWT_ADMIN_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=djlgb5ehf
CLOUDINARY_API_KEY=319671694448341
CLOUDINARY_API_SECRET=3AqcP7s1qVSXdlPGAQSWeA6zPR4

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=2525
EMAIL_USER=8f99ef5dbe8b43
EMAIL_PASSWORD=aa49fa54d4e02d
EMAIL_FROM="Hardware Store <noreply@hardwarestore.com>"

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=https://your-frontend-url.onrender.com
SESSION_SECRET=3cfae8f1f7f92b8d29f83d8e26b9d4e7c1a7f13a60c24f38a97efb77a8c923dd
MAX_FILE_SIZE=5242880
```

---

## 📋 Step 2: Deploy Client (Frontend)

### 2.1 Update client .env
Create `/client/.env.production`:
```env
VITE_API_URL=https://your-server-url.onrender.com/api
```

### 2.2 Update API URL in axiosClient
Edit `client/src/api/axiosClient.js`:
```javascript
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://your-server-url.onrender.com/api',
  // ...
});
```

### 2.3 Push client to GitHub
```bash
cd client
git init
git add .
git commit -m "Deploy client"
git remote add origin https://github.com/5000-k/builtMart-client.git
git push -u origin main
```

### 2.4 Deploy on Render (Static Site)
1. Go to https://render.com
2. Click **New +** → **Static Site**
3. Connect your GitHub repo
4. Configure:

| Setting | Value |
|---------|-------|
| Name | `builtmart-client` |
| Region | Singapore |
| Branch | `main` |
| Root Directory | (leave empty) |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

5. Add Environment Variables:

```
NODE_ENV=production
VITE_API_URL=https://your-server-url.onrender.com/api
```

---

## 📋 Step 3: Update CORS on Server

After server deploys, add frontend URL to `ALLOWED_ORIGINS` on Render:

```
ALLOWED_ORIGINS=https://builtmart-client.onrender.com,http://localhost:5173
```

---

## 📋 Step 4: Test

Visit your frontend URL and test:
- Registration/OTP
- Login
- Products loading
- Admin panel access

---

## ⚠️ If Issues

### CORS Error
- Check `ALLOWED_ORIGINS` includes your frontend URL

### Email Not Working
- Mailtrap has daily limits (100 free)
- Check spam folder

### MongoDB Connection Failed
- Verify `MONGODB_URI` is correct
- Check IP whitelist in MongoDB Atlas (allow all: 0.0.0.0/0)