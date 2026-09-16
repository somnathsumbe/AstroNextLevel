'use client';

import { useEffect, useState } from 'react';

export default function PwaBootstrap() {
  const [isOnline, setIsOnline] = useState(true);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const updateOnlineStatus = () => setIsOnline(window.navigator.onLine);
    updateOnlineStatus();

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const handleServiceWorkerMessage = (event) => {
      if (event.data?.type === 'PWA_UPDATE_AVAILABLE') {
        setUpdateAvailable(true);
      }
    };

    const registerServiceWorker = async () => {
      if (!('serviceWorker' in navigator)) return;

      try {
        const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

        if (registration.waiting) {
          setUpdateAvailable(true);
        }

        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          if (!installing) return;

          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      } catch (error) {
        console.warn('Service worker registration failed', error);
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);

    registerServiceWorker();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const handleUpdate = async () => {
    if (!('serviceWorker' in navigator)) return;

    const registrations = await navigator.serviceWorker.getRegistrations();
    registrations.forEach((registration) => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    });

    setUpdateAvailable(false);
    window.location.reload();
  };

  return (
    <>
      {!isOnline && (
        <div className="pwa-status-toast is-offline" role="status" aria-live="polite">
          <i className="bi bi-wifi-off" aria-hidden="true" />
          <div>
            <strong>Offline</strong>
            <span>Some features may be limited until the connection returns.</span>
          </div>
          <button type="button" onClick={() => window.location.reload()} aria-label="Retry connection">
            Retry
          </button>
        </div>
      )}

      {updateAvailable && (
        <div className="pwa-status-toast is-update" role="status" aria-live="polite">
          <i className="bi bi-arrow-repeat" aria-hidden="true" />
          <div>
            <strong>Update ready</strong>
            <span>Refresh to use the latest version.</span>
          </div>
          <button type="button" onClick={handleUpdate}>Update</button>
        </div>
      )}

      {installPrompt && (
        <div className="pwa-install-banner" role="dialog" aria-live="polite" aria-label="Install app">
          <div>
            <strong>Install Astro Market Analytics</strong>
            <span>Quick access from your home screen.</span>
          </div>
          <div className="pwa-install-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={handleInstall}>Install</button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setInstallPrompt(null)}>Dismiss</button>
          </div>
        </div>
      )}
    </>
  );
}
