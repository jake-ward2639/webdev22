const cacheName = 'stp_cache';
const filesToCache = [
    './',
    './index.html',
    './css/bundle.css',
    './js/bundle.js',
    './assets/example_pangolin.jpg'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(cacheName).then((cache) => {
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});