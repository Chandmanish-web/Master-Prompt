Render Deployment Guide

1. Create a GitHub fork (if not already) and push your `structure` branch.

2. Create a MongoDB Atlas cluster
   - Create a free cluster in MongoDB Atlas.
   - Create a database user and whitelist your IPs (or allow access from anywhere for quick testing).
   - Copy the connection URI.
   - Use the `worktrack` database name and include `retryWrites=true&w=majority`.
   - If your MongoDB username contains special characters such as `@`, encode them as `%40`.
   - Example:
     `mongodb+srv://<username>:<password>@cluster0.mbmtfym.mongodb.net/worktrack?retryWrites=true&w=majority`

3. Connect repo to Render
   - Go to https://render.com and sign in.
   - Click "New +" → "Web Service" → choose "Docker".
   - Select your GitHub repo and branch (`structure`).
   - For the server service:
     - Set `Dockerfile Path` to `server/Dockerfile`.
     - Set environment variables:
       - `MONGO_URI` = your Atlas URI
       - `JWT_SECRET` = a strong secret
       - `CLIENT_URL` = `https://<your-frontend>.onrender.com`
   - For the client service:
     - Set `Dockerfile Path` to `client/Dockerfile`.
     - Set env var `VITE_API_URL` = `https://<your-api>.onrender.com/api`

4. Advanced: use `render.yaml`
   - Render will auto-detect `render.yaml` if present. The included `render.yaml` defines two Docker web services.
   - Edit `render.yaml` to supply any specific plan or additional env vars.

5. Deploy & verify
   - After creating services, click "Manual Deploy" on Render dashboard.
   - Verify `https://<your-api>.onrender.com/api/health` returns `{ "status": "ok" }`.
   - Visit your frontend URL and test login/register and core flows.

6. Clearing cache
   - On Render, trigger a manual deploy to rebuild images from the latest commit.
   - Locally, rebuild Docker images with `docker compose build --no-cache`.

7. Verify MongoDB Atlas connection
   - In the `server` folder, create or update `.env` with your `MONGO_URI`.
   - Run `npm run check-mongo` from `server` to verify Atlas connectivity.

If you want, I can:
- Fork the repo and push your branch to your fork (if you provide GitHub details), or
- Walk you through the Render dashboard steps interactively and help fill env vars.

Free plan quick values (copy/paste)

- Server service name: `worktrack-server`
- Server Dockerfile path: `server/Dockerfile`
- Server health check path: `/api/health`
- Server env vars (mark secrets):
   - `MONGO_URI` = `mongodb+srv://<username>:<password>@cluster0.mbmtfym.mongodb.net/worktrack?retryWrites=true&w=majority`
   - `JWT_SECRET` = `<your-32+char-random-secret>`
   - `CLIENT_URL` = `https://worktrack-client.onrender.com`
- Client service name: `worktrack-client`
- Client root dir: `client`
- Client build command: `npm ci && npm run build`
- Client publish dir: `dist`
- Client env var:
   - `VITE_API_URL` = `https://worktrack-server.onrender.com/api`

Quick local git workflow (create branch, commit, push):

```bash
git checkout -b render-deploy
git add render.yaml README_RENDER.md
git commit -m "Add render.yaml and Render deployment docs (free plan)"
git push -u origin render-deploy
```

Note: pushing requires GitHub permissions; if push fails, create a PR from the branch in your repo.

Render manifest in this repo: [render.yaml](render.yaml)
