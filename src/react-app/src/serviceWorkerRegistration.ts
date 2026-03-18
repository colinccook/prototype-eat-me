// Service Worker Registration

export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    // Wait for the page to load before registering
    window.addEventListener('load', () => {
      const swUrl = `${import.meta.env.BASE_URL}service-worker.js`;

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('[PWA] Service Worker registered successfully:', registration.scope);

          // When a new service worker is found, tell it to activate immediately
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New content available, activating update...');
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });
    });

    // When a new service worker takes control, reload to get fresh content
    // This ensures users always see the latest version without manual cache clearing
    // Only reload when updating an existing SW (skip first-time install)
    let reloadOnChange = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloadOnChange) {
        console.log('[PWA] New service worker activated, reloading for latest content...');
        window.location.reload();
      }
      reloadOnChange = true;
    });
  } else {
    console.log('[PWA] Service Workers are not supported in this browser');
  }
}

export function unregisterServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}

// Utility to clear the data cache
export async function clearDataCache(): Promise<boolean> {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.success);
      };
      // controller is already checked above, use non-null assertion
      navigator.serviceWorker.controller!.postMessage(
        { type: 'CLEAR_DATA_CACHE' },
        [messageChannel.port2]
      );
    });
  }
  return false;
}
