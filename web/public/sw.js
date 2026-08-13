// 富邦保險 PWA Service Worker
const CACHE_VERSION = 'fubon-v2';
const CACHE_NAME = `fubon-cache-${CACHE_VERSION}`;

// 預先快取靜態資源（app shell）
const PRECACHE_URLS = [
  '/',
  '/life.html',
  '/property.html',
  '/auto.html',
  '/claim.html',
  '/healthcheck.html',
  '/simulator.html',
  '/css/common.css',
  '/css/questionnaire.css',
  '/css/admin.css',
  '/js/questionnaire.js',
  '/js/admin.js',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
];

// 安裝：預快取
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// 啟用：清舊版 cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k.startsWith('fubon-cache-') && k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch 策略：
// - API：永遠走網路（不快取，避免提交資料被攔截）
// - 其他：network-first → 失敗 → cache
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // ⚠️ 關鍵：API 請求、非 GET（POST/PATCH/DELETE）、跨網域一律「不攔截」
  //   讓瀏覽器用原生方式處理，避免 SW 重放 POST body 造成 "Load failed"
  if (
    req.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.origin !== self.location.origin
  ) {
    return; // 不呼叫 respondWith → 瀏覽器原生處理
  }

  // 只對同源 GET 靜態資源做 network-first + cache fallback
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return res;
      })
      .catch(() => caches.match(req).then((c) => c || caches.match('/')))
  );
});
