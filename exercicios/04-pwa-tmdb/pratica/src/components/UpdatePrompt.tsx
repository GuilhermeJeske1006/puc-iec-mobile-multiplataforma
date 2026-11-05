// src/components/UpdatePrompt.tsx
// TODO 3 (parte 2): avisos do Service Worker com registerType: 'prompt'.
//   - offlineReady → "App pronto para uso offline" (dispensável)
//   - needRefresh  → "Nova versão disponível" + Atualizar / Depois
//   - nenhum aviso ativo → null

import { useRegisterSW } from 'virtual:pwa-register/react';

const UPDATE_CHECK_MS = 60 * 60 * 1000;

const toastStyle: React.CSSProperties = {
  position: 'fixed',
  top: 12,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  width: 'calc(100% - 32px)',
  maxWidth: 480,
  boxSizing: 'border-box',
  padding: '12px 16px',
  background: '#0d253f',
  color: '#e5e5e5',
  border: '1px solid #01b4e4',
  borderRadius: 12,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
  fontSize: 14,
};

const primaryBtn: React.CSSProperties = {
  background: '#01b4e4',
  color: '#0d253f',
  border: 'none',
  borderRadius: 6,
  padding: '6px 14px',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 13,
  whiteSpace: 'nowrap',
};

const secondaryBtn: React.CSSProperties = {
  ...primaryBtn,
  background: 'transparent',
  color: '#90a4ae',
  border: '1px solid #2a3f55',
};

export function UpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    // PWA instalado pode ficar aberto por horas: checa nova versão a cada 1 h
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      setInterval(() => {
        if (navigator.onLine) registration.update();
      }, UPDATE_CHECK_MS);
    },
  });

  if (needRefresh) {
    return (
      <div role="alert" style={toastStyle}>
        <span style={{ flex: 1 }}>🔄 Nova versão disponível</span>
        <button style={primaryBtn} onClick={() => updateServiceWorker(true)}>
          Atualizar
        </button>
        <button style={secondaryBtn} onClick={() => setNeedRefresh(false)}>
          Depois
        </button>
      </div>
    );
  }

  if (offlineReady) {
    return (
      <div role="status" style={toastStyle}>
        <span style={{ flex: 1 }}>✅ App pronto para uso offline</span>
        <button style={secondaryBtn} onClick={() => setOfflineReady(false)}>
          OK
        </button>
      </div>
    );
  }

  return null;
}
