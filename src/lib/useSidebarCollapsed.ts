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
    setCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: next }));
      return next;
    });
  }

  return { collapsed, toggleCollapsed };
}
