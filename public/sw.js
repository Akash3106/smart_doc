// Service Worker for Push Notifications
self.addEventListener('push', function (event) {
    const options = {
        body: event.data ? event.data.text() : 'Authentication request',
        icon: '/blog.png',
        badge: '/blog.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'approve',
                title: 'Approve',
                icon: '/blog.png'
            },
            {
                action: 'deny',
                title: 'Deny',
                icon: '/blog.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Document Assistant', options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    if (event.action === 'approve') {
        // Send approval to the main app
        self.clients.matchAll().then(function (clients) {
            clients.forEach(function (client) {
                client.postMessage({
                    type: 'AUTH_APPROVED',
                    timestamp: Date.now()
                });
            });
        });
    } else if (event.action === 'deny') {
        // Send denial to the main app
        self.clients.matchAll().then(function (clients) {
            clients.forEach(function (client) {
                client.postMessage({
                    type: 'AUTH_DENIED',
                    timestamp: Date.now()
                });
            });
        });
    } else {
        // Default click behavior - open the app
        event.waitUntil(
            self.clients.openWindow('/document')
        );
    }
});

self.addEventListener('pushsubscriptionchange', function (event) {
    event.waitUntil(
        self.registration.pushManager.subscribe(event.oldSubscription.options)
            .then(function (subscription) {
                // Send the new subscription to your server
                return fetch('/api/push/subscription', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        subscription: subscription
                    })
                });
            })
    );
}); 