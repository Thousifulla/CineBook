# Complete Movie Booking Application Deployment Guide

Follow these steps to deploy your application to Vercel (Frontend) and Render (Backend).

## Step 1: Push Code to GitHub
Ensure all your code is pushed securely to a GitHub repository.

```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

## Step 2: Deploy Backend to Render
1. Go to [Render's Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically read the `render.yaml` file located in `backend/` and configure the Web Service for you.
5. Provide the necessary environment variables when prompted or inside the Environment settings in the Dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `REDIS_URL`: Your Redis Cloud connection string.
   - `JWT_SECRET`: A strong random string for JWT signing.
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Your Razorpay credentials.
   - `TMDB_API_KEY`: Your TMDB API key.
   - `CLIENT_URL`: Leave blank for now, we will add the Vercel URL here in Step 4.

## Step 3: Deploy Frontend to Vercel
1. Go to [Vercel's Dashboard](https://vercel.com/dashboard).
2. Click **Add New** -> **Project**.
3. Import the same GitHub repository.
4. Set the **Framework Preset** to `Vite`.
5. Set the **Root Directory** to `frontend`.
6. Set Environment Variables:
   - `VITE_API_URL`: The deployed URL of your Render backend (e.g., `https://movie-booking-backend-xyz.onrender.com/api`). Note: don't forget the `/api` at the end!
7. Click **Deploy**. Vercel will process the `vercel.json` we created automatically to handle routing perfectly.

## Step 4: Finalize Connection
1. Once Vercel finishes deploying, copy the deployed frontend URL (e.g., `https://my-movie-app.vercel.app`).
2. Go back to your Render Dashboard -> select your Web Service -> Environment.
3. Update the `CLIENT_URL` to the Vercel URL you copied. (You can also add `http://localhost:5173` separated by a comma if you want to test the production DB locally: `https://my-movie-app.vercel.app,http://localhost:5173`).
4. Save the changes. Render will automatically restart the backend.

**Congratulations! Your application will now be live.**
