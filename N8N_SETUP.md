
# Setting Up n8n for Your Chatbot

This guide explains how to configure n8n to work with your chatbot frontend.

## Prerequisites

1. An n8n instance (self-hosted or using n8n.cloud)
2. Basic understanding of n8n workflows

## Setting Up n8n Workflow

### 1. Create a New Workflow in n8n

1. Log in to your n8n instance
2. Create a new workflow
3. Give it a descriptive name (e.g., "Chatbot Handler")

### 2. Add a Webhook Node as Trigger

1. Add a new node and select "Webhook"
2. Configure it as follows:
   - **Authentication**: None (or add authentication if needed)
   - **HTTP Method**: POST
   - **Path**: `/chat` (or any path you prefer)
   - **Response Mode**: Last Node
3. Click "Execute" to generate the webhook URL
4. Copy this URL - you'll need it for your frontend configuration

### 3. Process the Input

Add processing nodes according to your needs. For example:

1. Add a "Function" node to extract the message and preferences:
   ```javascript
   return {
     json: {
       message: $input.item.json.message,
       size: $input.item.json.preferences.size,
       gender: $input.item.json.preferences.gender,
       style: $input.item.json.preferences.style,
       color: $input.item.json.preferences.color
     }
   };
   ```

2. Add nodes to process the message (e.g., AI services, database lookups, etc.)

### 4. Format the Response

Before the workflow ends, ensure you have a node that formats the response correctly:

```javascript
return {
  json: {
    message: "Here's a recommendation based on your preferences.",
    imageUrl: "https://url-to-your-image.jpg" // URL to an image resource
  }
}
```

### 5. Test Your Workflow

1. Send a test request using Postman or a similar tool:
   ```json
   {
     "message": "Show me a blue dress",
     "preferences": {
       "size": "M",
       "gender": "female",
       "style": "casual",
       "color": "blue"
     }
   }
   ```
2. Verify the response matches the expected format

## Connecting n8n with Your Frontend

1. Deploy your n8n instance to a platform like Render.com
   - Follow Render's guide for deploying n8n
   - Ensure the webhook endpoint is publicly accessible

2. Set the webhook URL in your frontend:
   - In your Render.com dashboard, set the `VITE_N8N_WEBHOOK_URL` environment variable to your webhook URL

## CORS Configuration

If you encounter CORS issues between your frontend and n8n:

1. In n8n, go to Settings > API
2. Under "Security" tab, find "CORS" settings
3. Add your frontend domain (e.g., `https://your-chatbot-frontend.onrender.com`) to the allowed domains

## Troubleshooting

- If webhook executions fail, check the execution history in n8n
- Ensure your message format matches what the workflow expects
- Check n8n logs for any errors during execution
