import { useEffect, useState } from 'react';

const STORAGE_KEY = 'hublevel:sidebar-collapsed';
const CHANGE_EVENT = 'hublevel:sidebar-collapsed-change';

function readInitial(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(STORAGE_KEY) === '1';
}

export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState<boolean>(readInitial);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) setCollapsed(event.newValue === '1');
    }

    function handleLocalChange(event: Event) {
      setCollapsed((event as CustomEvent<boolean>).detail);
    }

    window.addEventListener('storage', handleStorage);
    window.addEventListener(CHANGE_EVENT, handleLocalChange);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(CHANGE_EVENT, handleLocalChange);
    };
  }, []);

  function toggleCollapsed() {
    // Nao fazer o setItem/dispatchEvent dentro do updater de setCollapsed: dispatchEvent e
    // sincrono e dispara handleLocalChange em outras instancias do hook (ex.: SidebarAwareMain)
    // enquanto o React ainda esta processando esta atualizacao - "Cannot update a component
    // while rendering a different component", e o toggle podia virar no-op na pratica.
    const next = !collapsed;
    window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    setCollapsed(next);
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: next }));
  }

  return { collapsed, toggleCollapsed };
}
