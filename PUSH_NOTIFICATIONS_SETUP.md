# Push Notification Authentication Setup

This guide explains how to set up push notification authentication to replace the password system.

## Overview

The application now uses push notifications for mobile authentication instead of a password. Users will receive a push notification on their mobile device when they try to chat with documents, and they can approve or deny the authentication request.

## Setup Steps

### 1. Generate VAPID Keys

First, install the web-push package and generate VAPID keys:

```bash
npm install web-push
node scripts/generate-vapid-keys.js
```

This will output your public and private VAPID keys.

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Push Notification Configuration
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here

# OpenAI API Configuration (existing)
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Update Email in Auth API

In `src/app/api/push/auth/route.ts`, replace the email address:

```typescript
webpush.setVapidDetails(
  "mailto:your-actual-email@example.com", // Replace with your email
  vapidPublicKey!,
  vapidPrivateKey!
);
```

## How It Works

### 1. User Flow

1. User uploads a document or provides a URL
2. User navigates to the document page
3. User clicks "Subscribe to Push Notifications" (first time only)
4. User grants notification permission
5. User clicks "Request Mobile Authentication"
6. User receives a push notification on their mobile device
7. User approves/denies the authentication request
8. If approved, user can now chat with the document

### 2. Technical Flow

1. Service worker registers and subscribes to push notifications
2. Subscription is stored on the server
3. When authentication is requested, server sends push notification to all subscribers
4. Service worker receives notification and shows it to user
5. User action (approve/deny) is sent back to the main app
6. Authentication state is updated in Redux

## Browser Support

Push notifications work in:

- Chrome (desktop and mobile)
- Firefox (desktop and mobile)
- Edge (desktop and mobile)
- Safari (iOS 16.4+)

## Security Considerations

- VAPID keys should be kept secure
- In production, use a database to store subscriptions
- Consider rate limiting for authentication requests
- Implement proper error handling for failed notifications

## Troubleshooting

### Common Issues

1. **"Push notifications are not supported"**

   - Ensure you're using HTTPS (required for service workers)
   - Check browser compatibility

2. **"Notification permission denied"**

   - User must manually enable notifications in browser settings
   - Guide users to browser settings to enable notifications

3. **"Failed to register subscription"**

   - Check VAPID keys are correctly configured
   - Ensure environment variables are set

4. **"Authentication timeout"**
   - User didn't respond to notification within 30 seconds
   - Check if notifications are being received

### Testing

1. Use Chrome DevTools to test service worker
2. Check browser console for errors
3. Test on actual mobile device for best results
4. Use browser's notification settings to manage permissions

## Production Deployment

1. Generate production VAPID keys
2. Use a proper database for subscription storage
3. Implement proper error handling and logging
4. Set up monitoring for failed notifications
5. Consider implementing retry logic for failed notifications
