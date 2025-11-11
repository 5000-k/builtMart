# Vercel Deployment Guide

## Important Changes for Serverless Deployment

Your Express server has been configured to work as a Vercel serverless function.

### Files Modified/Created:
1. **`api/index.js`** - New serverless entry point
2. **`vercel.json`** - Vercel configuration file
3. **`src/config/db.js`** - Updated for connection reuse in serverless
4. **`.vercelignore`** - Files to exclude from deployment

### Required Environment Variables

You **MUST** set these environment variables in your Vercel project settings:

#### Required Variables:
- `NODE_ENV` = `production`
- `MONGODB_URI` = Your MongoDB connection string
- `JWT_ACCESS_SECRET` = Your JWT access token secret
- `JWT_REFRESH_SECRET` = Your JWT refresh token secret

#### Optional Variables (depending on features used):
- `CLIENT_URL` = Your frontend URL (e.g., https://your-frontend.vercel.app)
- `CLOUDINARY_CLOUD_NAME` = Cloudinary cloud name
- `CLOUDINARY_API_KEY` = Cloudinary API key
- `CLOUDINARY_API_SECRET` = Cloudinary API secret
- `PADDLE_VENDOR_ID` = Paddle vendor ID
- `PADDLE_API_KEY` = Paddle API key
- `PADDLE_PUBLIC_KEY` = Paddle public key
- `PADDLE_ENVIRONMENT` = `production` or `sandbox`
- `EMAIL_USER` = Email service username
- `EMAIL_PASS` = Email service password

### How to Deploy:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from the server directory**:
   ```bash
   cd server
   vercel
   ```

4. **Set environment variables in Vercel Dashboard**:
   - Go to your project settings on vercel.com
   - Navigate to "Environment Variables"
   - Add all required variables listed above

5. **Redeploy after setting environment variables**:
   ```bash
   vercel --prod
   ```

### Important Notes:

- **Database Connection**: The database connection is now reused across function invocations for better performance
- **Connection Pool**: Limited to 10 connections (suitable for serverless)
- **Timeout**: Database connection timeout set to 5 seconds
- **Local Development**: Your local `npm run dev` will continue to work as before
- **Frontend CORS**: Make sure to add your Vercel backend URL to your frontend's API configuration

### Testing Your Deployment:

Once deployed, test your API:
```bash
curl https://your-api.vercel.app/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Troubleshooting:

1. **500 Error - FUNCTION_INVOCATION_FAILED**:
   - Check that all required environment variables are set in Vercel
   - Check function logs in Vercel dashboard
   - Verify MongoDB connection string is correct

2. **Database Connection Issues**:
   - Ensure your MongoDB Atlas allows connections from Vercel IPs (0.0.0.0/0)
   - Check that MONGODB_URI is correctly set

3. **CORS Errors**:
   - Add your frontend URL to the environment variables
   - Ensure CLIENT_URL is set in Vercel

### View Logs:

To view real-time logs:
```bash
vercel logs
```

Or check the Vercel dashboard for detailed function logs.
