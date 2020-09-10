const oweatherApp = "o'weather-app-v1";
const assets = [
  "/",
  "/index.html",
  "/assets/css/styles.css",
  "/assets/js/script.js",
  "/assets/weatherbg.jpg",
];

self.addEventListener("install", (installEvent) => {
  installEvent.waitUntil(
    caches.open(oweatherAppv2).then((cache) => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener("fetch", (fetchEvent) => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then((res) => {
      return res || fetch(fetchEvent.request);
    })
  );
});
