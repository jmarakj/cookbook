import { useEffect } from 'react';

// Keep the screen on while the calling component is mounted. The browser
// releases the lock whenever the page is hidden, so re-request it each time
// the page becomes visible.
function useWakeLock() {
  useEffect(() => {
    if (!('wakeLock' in navigator)) {
      return;
    }
    let sentinel: WakeLockSentinel | null = null;
    let active = true;

    const request = () => {
      if (document.visibilityState !== 'visible') {
        return;
      }
      navigator.wakeLock
        .request('screen')
        .then((s) => {
          if (active) {
            sentinel = s;
          } else {
            s.release();
          }
        })
        .catch(() => {}); // e.g. battery saver – not worth surfacing
    };

    request();
    document.addEventListener('visibilitychange', request);
    return () => {
      active = false;
      document.removeEventListener('visibilitychange', request);
      sentinel?.release();
    };
  }, []);
}

export default useWakeLock;
