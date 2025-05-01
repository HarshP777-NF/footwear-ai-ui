
// Configuration settings for the application

// API endpoints
export const API_CONFIG = {
  // Replace this URL with your actual n8n webhook URL when deploying to render.com
  // For local development, you can use environment variables
  n8nWebhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://your-n8n-instance.render.com/webhook/chat',
  
  // Timeout for API calls in milliseconds
  timeout: 15000,
};

// Application settings
export const APP_CONFIG = {
  appName: 'N8N Chatbot',
  version: '1.0.0',
};
