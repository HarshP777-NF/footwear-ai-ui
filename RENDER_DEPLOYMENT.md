
# Deploying Your N8N Chatbot to Render.com

This guide explains how to deploy your N8N Chatbot frontend to Render.com.

## Prerequisites

1. A [Render.com](https://render.com/) account
2. Your n8n instance running (either on Render or elsewhere)
3. Access to your repository

## Deployment Steps

### 1. Create a new Static Site on Render

1. Log in to your [Render Dashboard](https://dashboard.render.com/)
2. Click **New** and select **Static Site**
3. Connect your repository (GitHub, GitLab, or Bitbucket)
4. Select the repository containing your chatbot frontend code
5. Configure the following settings:
   - **Name**: Choose a name for your site (e.g., `n8n-chatbot`)
   - **Branch**: `main` (or your default branch)
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

### 2. Set Environment Variables

Add the following environment variable to connect to your n8n instance:

1. In your static site settings, go to **Environment**
2. Add a new environment variable:
   - Key: `VITE_N8N_WEBHOOK_URL`
   - Value: `https://your-n8n-instance.render.com/webhook/chat` (replace with your actual n8n webhook URL)

### 3. Deploy Your Site

1. Click **Create Static Site**
2. Wait for the build and deployment to complete
3. Once deployed, Render will provide you with a URL to access your application (e.g., `https://n8n-chatbot.onrender.com`)

### 4. Setting up n8n

Ensure your n8n workflow:

1. Has a webhook node as the trigger
2. Accepts POST requests with JSON data
3. Returns a response in this format:
   ```json
   {
     "message": "Response message text",
     "imageUrl": "https://url-to-generated-image.jpg"
   }
   ```

### 5. Connecting a Custom Domain (Optional)

1. In your Render dashboard, select your static site
2. Go to **Settings** > **Custom Domain**
3. Add your domain and follow the instructions to configure DNS records

## Troubleshooting

- If the connection to n8n fails, check that:
  - Your n8n instance is running
  - The webhook URL is correct
  - CORS is properly configured on your n8n instance to allow requests from your frontend domain

- For other issues, check the build logs in your Render dashboard
