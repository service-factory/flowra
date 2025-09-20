// Service Worker for Push Notifications
const CACHE_NAME = 'flowra-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Push event - Handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  let notificationData = {
    title: 'Flowra',
    body: '새로운 알림이 있습니다',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'flowra-notification',
    data: {},
    actions: [
      {
        action: 'open',
        title: '열기',
        icon: '/icons/open.png'
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/icons/close.png'
      }
    ]
  };

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data,
        data: data.data || {}
      };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }

  // Show notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Default action or 'open' action
  let urlToOpen = '/';
  
  if (event.notification.data) {
    const data = event.notification.data;
    
    if (data.task_id) {
      urlToOpen = `/tasks?taskId=${data.task_id}`;
    } else if (data.team_id) {
      urlToOpen = `/team?teamId=${data.team_id}`;
    } else if (data.url) {
      urlToOpen = data.url;
    }
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'notification-sync') {
    event.waitUntil(
      // Sync notification data when back online
      fetch('/api/notifications/sync')
        .then(response => response.json())
        .then(data => {
          console.log('Notifications synced:', data);
        })
        .catch(error => {
          console.error('Sync failed:', error);
        })
    );
  }
});

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
