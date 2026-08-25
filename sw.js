// Minimal service worker for PWA installability criteria
// No caching or offline support because the app relies entirely on live Supabase data.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // No-op: just let the browser handle the fetch naturally.
});
