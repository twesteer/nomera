// Офлайн-режим: сначала сеть (чтобы приходили обновления), без сети — из кеша.
// Трогаем только файлы самой игры и шрифты. Запросы к Firebase (вход, облако, рейтинг) идут мимо.
var CACHE = 'nomera-v5';
var FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
var FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); })); self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) { return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }));
  self.clients.claim();
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') { return; }
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin && FONT_HOSTS.indexOf(url.hostname) < 0) { return; }
  e.respondWith(fetch(e.request).then(function (res) {
    if (res && res.ok && (res.type === 'basic' || res.type === 'cors')) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); }
    return res;
  }).catch(function () { return caches.match(e.request).then(function (r) { return r || caches.match('./index.html'); }); }));
});
