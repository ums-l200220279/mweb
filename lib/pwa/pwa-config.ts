export interface PwaConfig {
  name: string
  shortName: string
  description: string
  themeColor: string
  backgroundColor: string
  display: "standalone" | "fullscreen" | "minimal-ui" | "browser"
  orientation: "portrait" | "landscape" | "any"
  scope: string
  startUrl: string
  icons: {
    src: string
    sizes: string
    type: string
    purpose?: string
  }[]
  screenshots?: {
    src: string
    sizes: string
    type: string
    platform?: string
    label?: string
  }[]
  relatedApplications?: {
    platform: string
    url: string
    id?: string
  }[]
  preferRelatedApplications?: boolean
  shortcuts?: {
    name: string
    shortName?: string
    description?: string
    url: string
    icons?: {
      src: string
      sizes: string
      type: string
      purpose?: string
    }[]
  }[]
  categories?: string[]
  iarc_rating_id?: string
  share_target?: {
    action: string
    method: string
    enctype?: string
    params: {
      title?: string
      text?: string
      url?: string
      files?: {
        name: string
        accept: string[]
      }[]
    }
  }
}

/**
 * Default PWA configuration for Memoright
 */
export const defaultPwaConfig: PwaConfig = {
  name: "Memoright",
  shortName: "Memoright",
  description: "Memoright - Memory Training Game",
  themeColor: "#4f46e5",
  backgroundColor: "#ffffff",
  display: "standalone",
  orientation: "any",
  scope: "/",
  startUrl: "/",
  icons: [
    {
      src: "/icons/icon-72x72.png",
      sizes: "72x72",
      type: "image/png",
    },
    {
      src: "/icons/icon-96x96.png",
      sizes: "96x96",
      type: "image/png",
    },
    {
      src: "/icons/icon-128x128.png",
      sizes: "128x128",
      type: "image/png",
    },
    {
      src: "/icons/icon-144x144.png",
      sizes: "144x144",
      type: "image/png",
    },
    {
      src: "/icons/icon-152x152.png",
      sizes: "152x152",
      type: "image/png",
    },
    {
      src: "/icons/icon-192x192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: "/icons/icon-384x384.png",
      sizes: "384x384",
      type: "image/png",
    },
    {
      src: "/icons/icon-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable",
    },
  ],
  screenshots: [
    {
      src: "/screenshots/screenshot1.png",
      sizes: "1280x720",
      type: "image/png",
      platform: "wide",
      label: "Home Screen",
    },
    {
      src: "/screenshots/screenshot2.png",
      sizes: "1280x720",
      type: "image/png",
      platform: "wide",
      label: "Game Screen",
    },
  ],
  shortcuts: [
    {
      name: "Start New Game",
      shortName: "New Game",
      description: "Start a new memory game",
      url: "/games/new",
      icons: [
        {
          src: "/icons/new-game.png",
          sizes: "192x192",
          type: "image/png",
        },
      ],
    },
    {
      name: "View Leaderboard",
      shortName: "Leaderboard",
      description: "View the leaderboard",
      url: "/leaderboard",
      icons: [
        {
          src: "/icons/leaderboard.png",
          sizes: "192x192",
          type: "image/png",
        },
      ],
    },
  ],
  categories: ["games", "education", "productivity"],
  share_target: {
    action: "/share-target",
    method: "POST",
    enctype: "multipart/form-data",
    params: {
      title: "title",
      text: "text",
      url: "url",
      files: [
        {
          name: "images",
          accept: ["image/*"],
        },
      ],
    },
  },
}

/**
 * Generate a web manifest JSON string
 */
export function generateWebManifest(config: PwaConfig = defaultPwaConfig): string {
  return JSON.stringify(config, null, 2)
}

/**
 * Generate service worker code
 */
export function generateServiceWorker(cacheName = "memoright-v1", assetsToCache: string[] = []): string {
  return `
// Service Worker for Memoright PWA
const CACHE_NAME = '${cacheName}';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/styles/main.css',
  '/scripts/main.js',
  '/icons/icon-512x512.png',
  ${assetsToCache.map((asset) => `'${asset}'`).join(",\n  ")}
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => {
          return name !== CACHE_NAME;
        }).map((name) => {
          return caches.delete(name);
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip browser-extension requests
  if (event.request.url.includes('/extension/')) {
    return;
  }

  // Skip API requests
  if (event.request.url.includes('/api/')) {
    return event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/offline-api.json');
        })
    );
  }

  // For HTML requests - network first, fallback to cache, then offline page
  if (event.request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the latest version
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }

  // For other requests - cache first, fallback to network
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then((response) => {
            // Cache the response
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clonedResponse);
            });
            return response;
          })
          .catch((error) => {
            // For image requests, return a placeholder
            if (event.request.url.match(/\\.(jpg|jpeg|png|gif|svg)$/)) {
              return caches.match('/images/placeholder.png');
            }
            throw error;
          });
      })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-game-results') {
    event.waitUntil(syncGameResults());
  }
});

// Function to sync game results when back online
async function syncGameResults() {
  try {
    const db = await openDB();
    const offlineResults = await db.getAll('offlineGameResults');
    
    for (const result of offlineResults) {
      try {
        const response = await fetch('/api/games/results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(result)
        });
        
        if (response.ok) {
          await db.delete('offlineGameResults', result.id);
        }
      } catch (error) {
        console.error('Failed to sync game result:', error);
      }
    }
  } catch (error) {
    console.error('Error in syncGameResults:', error);
  }
}

// Open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MemorightOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains('offlineGameResults')) {
        db.createObjectStore('offlineGameResults', { keyPath: 'id' });
      }
    };
  });
}

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action) {
    // Handle action button clicks
    console.log('Notification action clicked:', event.action);
  } else {
    // Handle notification click
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          const url = event.notification.data.url;
          
          // If a window is already open, focus it
          for (const client of clientList) {
            if (client.url === url && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Otherwise open a new window
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
});
`
}

/**
 * Generate offline page HTML
 */
export function generateOfflinePage(appName = "Memoright"): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName} - Offline</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      padding: 20px;
      text-align: center;
      color: #333;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 500px;
      padding: 30px;
      background-color: white;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    h1 {
      margin-top: 0;
      color: #4f46e5;
    }
    p {
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #4f46e5;
      color: white;
      border-radius: 5px;
      text-decoration: none;
      font-weight: bold;
      transition: background-color 0.3s;
    }
    .button:hover {
      background-color: #4338ca;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📶</div>
    <h1>You're Offline</h1>
    <p>It looks like you've lost your internet connection. Some features may not be available until you're back online.</p>
    <p>Don't worry, you can still use some parts of ${appName} while offline.</p>
    <a href="/" class="button">Try Again</a>
  </div>
  <script>
    // Check if we're back online
    window.addEventListener('online', () => {
      window.location.reload();
    });
    
    // Button click handler
    document.querySelector('.button').addEventListener('click', (e) => {
      e.preventDefault();
      window.location.reload();
    });
  </script>
</body>
</html>
`
}

/**
 * Generate PWA installation script
 */
export function generatePwaInstallScript(): string {
  return `
// PWA Installation Script for Memoright

let deferredPrompt;
const installButton = document.getElementById('install-button');

// Hide the install button initially
if (installButton) {
  installButton.style.display = 'none';
}

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  
  // Show the install button
  if (installButton) {
    installButton.style.display = 'block';
    
    // Add click handler for the install button
    installButton.addEventListener('click', async () => {
      // Hide the install button
      installButton.style.display = 'none';
      
      // Show the installation prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      // Log the outcome
      console.log('User installation choice:', outcome);
      
      // Clear the deferredPrompt variable
      deferredPrompt = null;
      
      // Track the installation event
      if (outcome === 'accepted') {
        if (window.gtag) {
          window.gtag('event', 'pwa_install', {
            event_category: 'pwa',
            event_label: 'User installed the PWA'
          });
        }
      }
    });
  }
});

// Listen for the appinstalled event
window.addEventListener('appinstalled', (e) => {
  // Log the installation
  console.log('PWA was installed');
  
  // Track the installation event
  if (window.gtag) {
    window.gtag('event', 'pwa_installed', {
      event_category: 'pwa',
      event_label: 'PWA was installed'
    });
  }
  
  // Hide the install button
  if (installButton) {
    installButton.style.display = 'none';
  }
});

// Check if the app is running in standalone mode (installed)
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('App is running in standalone mode');
  
  // Track standalone mode
  if (window.gtag) {
    window.gtag('event', 'pwa_standalone', {
      event_category: 'pwa',
      event_label: 'App is running in standalone mode'
    });
  }
}

// Register the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// Function to subscribe to push notifications
async function subscribeToPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if push is supported
    if (!registration.pushManager) {
      console.log('Push notifications not supported');
      return false;
    }
    
    // Get the subscription
    let subscription = await registration.pushManager.getSubscription();
    
    // If already subscribed, return the subscription
    if (subscription) {
      return subscription;
    }
    
    // Get the server's public key
    const response = await fetch('/api/push/public-key');
    const { publicKey } = await response.json();
    
    // Subscribe the user
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });
    
    // Send the subscription to the server
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });
    
    console.log('Subscribed to push notifications');
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

// Helper function to convert base64 to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

// Function to save data for offline use
async function saveDataForOffline(key, data) {
  try {
    const db = await openDB();
    const tx = db.transaction('offlineData', 'readwrite');
    const store = tx.objectStore('offlineData');
    await store.put({ key, data, timestamp: Date.now() });
    await tx.complete;
    console.log('Data saved for offline use:', key);
    return true;
  } catch (error) {
    console.error('Failed to save data for offline use:', error);
    return false;
  }
}

// Function to get offline data
async function getOfflineData(key) {
  try {
    const db = await openDB();
    const tx = db.transaction('offlineData', 'readonly');
    const store = tx.objectStore('offlineData');
    const data = await store.get(key);
    await tx.complete;
    return data;
  } catch (error) {
    console.error('Failed to get offline data:', error);
    return null;
  }
}

// Open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MemorightOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains('offlineData')) {
        db.createObjectStore('offlineData', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('offlineGameResults')) {
        db.createObjectStore('offlineGameResults', { keyPath: 'id' });
      }
    };
  });
}

// Function to save game results when offline
async function saveGameResultOffline(gameResult) {
  try {
    // Add a unique ID and timestamp
    const result = {
      ...gameResult,
      id: 'offline-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      synced: false
    };
    
    const db = await openDB();
    const tx = db.transaction('offlineGameResults', 'readwrite');
    const store = tx.objectStore('offlineGameResults');
    await store.add(result);
    await tx.complete;
    
    console.log('Game result saved offline');
    
    // Register for background sync if supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-game-results');
    }
    
    return result;
  } catch (error) {
    console.error('Failed to save game result offline:', error);
    return null;
  }
}

// Export the functions
window.pwa = {
  subscribeToPushNotifications,
  saveDataForOffline,
  getOfflineData,
  saveGameResultOffline
};
`
}

