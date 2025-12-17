const CACHE_NAME = 'imarisha-v1';
const API_CACHE_NAME = 'imarisha-api-v1';
const OFFLINE_PAGE = '/offline.html';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/minimalist_fintech_logo_with_geometric_shapes_in_blue_and_teal..png',
  '/favicon.ico'
];

const API_CACHE_ROUTES = [
  '/api/auth',
  '/api/members',
  '/api/loans',
  '/api/savings',
  '/api/transactions',
  '/api/products'
];

const NETWORK_FIRST_ROUTES = [
  '/api/payments',
  '/api/notifications',
  '/api/risk'
];

self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_ASSETS).catch(() => {
          console.warn('[ServiceWorker] Some static assets failed to cache');
        });
      }),
      caches.open(API_CACHE_NAME)
    ]).then(() => {
      console.log('[ServiceWorker] Installation complete');
      self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
      console.log('[ServiceWorker] Activation complete');
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  if (request.method !== 'GET') {
    if (url.pathname.startsWith('/api')) {
      event.respondWith(handleOfflineSync(request));
    }
    return;
  }

  if (url.pathname.startsWith('/api')) {
    if (isNetworkFirstRoute(url.pathname)) {
      event.respondWith(networkFirstStrategy(request));
    } else if (isApiCacheRoute(url.pathname)) {
      event.respondWith(cacheFirstStrategy(request));
    }
  } else {
    event.respondWith(cacheFirstStrategy(request));
  }
});

function isApiCacheRoute(pathname) {
  return API_CACHE_ROUTES.some(route => pathname.startsWith(route));
}

function isNetworkFirstRoute(pathname) {
  return NETWORK_FIRST_ROUTES.some(route => pathname.startsWith(route));
}

async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[ServiceWorker] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    if (request.headers.get('accept')?.includes('application/json')) {
      return new Response(
        JSON.stringify({ offline: true, cached: false }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response('Offline - No cached response available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    
    if (response.ok && !request.url.includes('/api')) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[ServiceWorker] Fetch failed:', request.url, error);
    
    if (request.headers.get('accept')?.includes('text/html')) {
      const offlineCache = await caches.open(CACHE_NAME);
      return offlineCache.match(OFFLINE_PAGE) || 
             new Response('Offline - Application unavailable', { status: 503 });
    }

    if (request.headers.get('accept')?.includes('application/json')) {
      return new Response(
        JSON.stringify({ offline: true }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response('Offline', { status: 503 });
  }
}

async function handleOfflineSync(request) {
  try {
    return await fetch(request.clone());
  } catch (error) {
    await storeRequestForSync(request);
    
    return new Response(
      JSON.stringify({
        success: true,
        offline: true,
        message: 'Request queued for sync when online'
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function storeRequestForSync(request) {
  const db = await openDB();
  const tx = db.transaction('sync-queue', 'readwrite');
  const store = tx.objectStore('sync-queue');
  
  const requestData = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: request.method !== 'GET' ? await request.text() : null,
    timestamp: Date.now()
  };
  
  await store.add(requestData);
  await tx.done;
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('imarisha-sync', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('sync-queue')) {
        db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-requests') {
    event.waitUntil(syncQueuedRequests());
  }
});

async function syncQueuedRequests() {
  try {
    const db = await openDB();
    const tx = db.transaction('sync-queue', 'readonly');
    const store = tx.objectStore('sync-queue');
    const requests = await store.getAll();

    const failedRequests = [];

    for (const req of requests) {
      try {
        const response = await fetch(req.url, {
          method: req.method,
          headers: req.headers,
          body: req.body
        });

        if (response.ok) {
          const deleteTx = db.transaction('sync-queue', 'readwrite');
          await deleteTx.objectStore('sync-queue').delete(req.id);
        } else {
          failedRequests.push(req);
        }
      } catch (error) {
        console.error('Sync failed for request:', req.url, error);
        failedRequests.push(req);
      }
    }

    if (failedRequests.length > 0) {
      console.log('[ServiceWorker] Sync complete with', failedRequests.length, 'failed requests');
    } else {
      console.log('[ServiceWorker] All queued requests synced successfully');
    }
  } catch (error) {
    console.error('[ServiceWorker] Sync error:', error);
    throw error;
  }
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data?.type === 'CLEAR_CACHE') {
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    });
  }
});
