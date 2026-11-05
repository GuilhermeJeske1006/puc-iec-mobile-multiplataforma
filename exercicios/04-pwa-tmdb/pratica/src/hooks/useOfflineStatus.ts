// src/hooks/useOfflineStatus.ts
// TODO 5: rastreia o status de conexão do browser (eventos online/offline).
//
// Teste manual: DevTools → Network → Throttling → "Offline"
// O banner "📡 Offline — exibindo dados do cache" aparece na aba Favoritos.

import { useState, useEffect } from 'react';

export function useOfflineStatus(): { isOnline: boolean } {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
}
