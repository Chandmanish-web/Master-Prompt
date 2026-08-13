# Quick Start: Deploy to Render

## Prerequisites
- MongoDB Atlas account with cluster created
- Git repository with code
- Render.com account

## Step-by-Step Setup

### 1. Prepare MongoDB Atlas
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create/get your MongoDB URI: `mongodb+srv://username:password@cluster.mongodb.net/worktrack?retryWrites=true`
3. Add Network Access:
   - Security → Network Access
   - Add IP: Allow Access from Anywhere (0.0.0.0/0) for Render

### 2. Generate JWT Secret
Open terminal and run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output - you'll need it for Render

### 3. Deploy on Render
1. Push code to GitHub
2. Go to [render.com](https://render.com) and sign in
3. Create New → Web Service
4. Connect GitHub repo
5. Fill details:
   - **Name:** worktrack-server
   - **Runtime:** Docker
   - **Root Directory:** server
   - **Dockerfile Path:** Dockerfile
   - **Plan:** Free (or paid for production)

6. Add Environment Variables:
   - `MONGO_URI` = Your MongoDB connection string
   - `JWT_SECRET` = Generated secret from Step 2
   - `CLIENT_URL` = https://worktrack-client.onrender.com (or your URL)
   - `NODE_ENV` = production
   - `PORT` = 5000

7. Click "Create Web Service" → Auto-deploys

### 4. Deploy Frontend
1. Create New → Static Site
2. Connect GitHub repo
3. Fill details:
   - **Name:** worktrack-client
   - **Root Directory:** client
   - **Build Command:** npm ci && npm run build
   - **Publish Directory:** dist

4. Add Environment Variable:
   - `VITE_API_URL` = https://worktrack-server.onrender.com/api

5. Click "Create Static Site" → Auto-deploys

### 5. Test Deployment
1. Wait for both deployments to finish (check Status → "Live")
2. Visit your frontend URL
3. Log in with:
   - Email: `admin@worktrack.com`
   - Password: `password123`

## Troubleshooting

### Services won't start
- Check Render logs (Dashboard → Service → Logs)
- Verify all environment variables are set
- Test MongoDB connection locally first

### CORS errors
- Verify CLIENT_URL matches your deployed frontend
- Check server logs for CORS configuration

### Database errors
- Verify MONGO_URI is correct
- Check MongoDB Atlas network access allows Render
- Run `npm run check-mongo` locally to test connection

## Cost Optimization
- Free tier: Limited resources, good for testing
- Paid tier (recommended for production): Better performance, uptime
- Use Render's auto-deploy for continuous updates

## Support
See DEPLOYMENT_FIX_GUIDE.md for detailed troubleshooting
