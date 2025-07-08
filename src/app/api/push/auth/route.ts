import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (!vapidPublicKey || !vapidPrivateKey) {
  console.error('VAPID keys not configured');
}

webpush.setVapidDetails(
  'mailto: <akash.in489@gmail.com>', // Replace with your email
  vapidPublicKey!,
  vapidPrivateKey!
);

// In-memory storage for subscriptions (in production, use a database)
let subscriptions: PushSubscription[] = [];
let pendingAuthRequests: Map<string, { resolve: Function; reject: Function; timestamp: number }> = new Map();

export async function POST(request: NextRequest) {
  try {
    const { action, requestId } = await request.json();

    if (action === 'request') {
      // Generate a unique request ID
      const authRequestId = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store the pending request
      const authPromise = new Promise((resolve, reject) => {
        pendingAuthRequests.set(authRequestId, {
          resolve,
          reject,
          timestamp: Date.now()
        });
      });

      // Send push notification to all subscribers
      const pushPromises = subscriptions.map(async (subscription) => {
        try {
          const payload = JSON.stringify({
            title: 'Document Assistant Authentication',
            body: 'Please approve access to chat with your documents',
            icon: '/blog.png',
            badge: '/blog.png',
            data: {
              requestId: authRequestId,
              type: 'auth_request'
            }
          });

          await webpush.sendNotification(subscription, payload);
        } catch (error) {
          console.error('Error sending push notification:', error);
        }
      });

      await Promise.all(pushPromises);

      // Wait for response with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Authentication timeout'));
        }, 30000); // 30 seconds timeout
      });

      try {
        const result = await Promise.race([authPromise, timeoutPromise]);
        pendingAuthRequests.delete(authRequestId);
        return NextResponse.json({ success: true, authenticated: result === 'approved' });
      } catch (error) {
        pendingAuthRequests.delete(authRequestId);
        return NextResponse.json(
          { error: 'Authentication timeout or denied' },
          { status: 408 }
        );
      }
    } else if (action === 'response') {
      const { requestId, approved } = await request.json();
      const pendingRequest = pendingAuthRequests.get(requestId);
      
      if (pendingRequest) {
        pendingAuthRequests.delete(requestId);
        if (approved) {
          pendingRequest.resolve('approved');
        } else {
          pendingRequest.reject('denied');
        }
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json(
          { error: 'Invalid or expired request ID' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process authentication request' },
      { status: 500 }
    );
  }
}

// Clean up expired requests periodically
setInterval(() => {
  const now = Date.now();
  for (const [requestId, request] of pendingAuthRequests.entries()) {
    if (now - request.timestamp > 30000) { // 30 seconds
      pendingAuthRequests.delete(requestId);
      request.reject('timeout');
    }
  }
}, 5000); // Check every 5 seconds 