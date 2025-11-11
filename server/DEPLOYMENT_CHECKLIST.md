# 🚀 Deployment Checklist

## ✅ Code Changes (Completed)

The following files have been created/modified to support serverless deployment:

- ✅ **`api/index.js`** - Serverless entry point created
- ✅ **`vercel.json`** - Vercel configuration created
- ✅ **`src/config/db.js`** - Updated for connection reuse
- ✅ **`src/utils/logger.js`** - Updated for serverless logging
- ✅ **`src/server.js`** - Updated environment variable validation
- ✅ **`.vercelignore`** - Created to exclude unnecessary files

## 📋 Next Steps (Action Required)

### 1. Set Environment Variables in Vercel Dashboard

Go to your Vercel project → Settings → Environment Variables and add:

**Required:**
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://your-connection-string
JWT_ACCESS_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-secret-here
```

**Optional (add if used):**
```
CLIENT_URL=https://your-frontend.vercel.app
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
PADDLE_VENDOR_ID=your-vendor-id
PADDLE_API_KEY=your-api-key
PADDLE_PUBLIC_KEY=your-public-key
PADDLE_ENVIRONMENT=production
EMAIL_USER=your-email
EMAIL_PASS=your-password
```

### 2. MongoDB Atlas Configuration

Ensure your MongoDB Atlas allows Vercel connections:
1. Go to MongoDB Atlas → Network Access
2. Add IP: `0.0.0.0/0` (allows connections from anywhere)
   - Or use Vercel's IP ranges for better security

### 3. Deploy to Vercel

From the `server` directory:

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# After setting environment variables, deploy to production
vercel --prod
```

### 4. Update Frontend API URL

Update your frontend's API URL to point to your new Vercel backend:
```javascript
const API_URL = 'https://your-backend.vercel.app/api';
```

### 5. Test the Deployment

After deployment, test these endpoints:

```bash
# Health check
curl https://your-backend.vercel.app/health

# Should return:
# {"success":true,"message":"Server is running","timestamp":"..."}
```

## 🔍 Common Issues & Solutions

### Issue: FUNCTION_INVOCATION_FAILED
**Solution:** Check that all required environment variables are set in Vercel

### Issue: Database connection timeout
**Solution:** 
- Verify MongoDB URI is correct
- Check MongoDB Atlas network access allows 0.0.0.0/0

### Issue: CORS errors from frontend
**Solution:** Ensure CLIENT_URL environment variable is set to your frontend URL

## 📊 Monitoring

View logs in real-time:
```bash
vercel logs --follow
```

Or check the Vercel dashboard for:
- Function invocations
- Error rates
- Performance metrics

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ `/health` endpoint returns 200 OK
- ✅ Frontend can connect to backend
- ✅ Database operations work
- ✅ No 500 errors in Vercel logs
- ✅ Authentication works
- ✅ File uploads work (via Cloudinary)

## 📚 Additional Resources

- [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md) - Detailed deployment guide
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
