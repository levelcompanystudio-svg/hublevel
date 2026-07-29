import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface TopbarContextValue {
  breadcrumbLabel: string | null;
  setBreadcrumbLabel: (label: string | null) => void;
  action: ReactNode;
  setAction: (action: ReactNode) => void;
}

const TopbarContext = createContext<TopbarContextValue | null>(null);

export function TopbarProvider({ children }: { children: ReactNode }) {
  const [breadcrumbLabel, setBreadcrumbLabel] = useState<string | null>(null);
  const [action, setAction] = useState<ReactNode>(null);

  const value = useMemo(
    () => ({ breadcrumbLabel, setBreadcrumbLabel, action, setAction }),
    [breadcrumbLabel, action],
  );

  return <TopbarContext.Provider value={value}>{children}</TopbarContext.Provider>;
}

function useTopbarContext() {
  const context = useContext(TopbarContext);
  if (!context) throw new Error('useTopbarContext deve ser usado dentro de TopbarProvider');
  return context;
}

export function useTopbar() {
  return useTopbarContext();
}

// Define o segundo nivel do breadcrumb (ex.: nome do cliente em /app/clientes/:id). Limpa
// automaticamente ao desmontar a pagina, para nao vazar para a proxima rota.
export function useBreadcrumbLabel(label: string | null) {
  const { setBreadcrumbLabel } = useTopbarContext();
  useEffect(() => {
    setBreadcrumbLabel(label);
    return () => setBreadcrumbLabel(null);
  }, [label, setBreadcrumbLabel]);
}

// Move a acao primaria de uma pagina para o slot do topbar, em vez de duplicar dentro do
// PageHeader. Limpa automaticamente ao desmontar a pagina.
//
// `deps` funciona como o array de dependencias de useEffect: `action` e um ReactNode, uma
// referencia nova a cada render do chamador, entao NAO pode entrar no array de dependencias
// (causaria loop infinito: novo elemento -> setAction -> re-render -> novo elemento -> ...).
// O chamador deve listar os valores primitivos dos quais o conteudo de `action` depende
// (ex.: `[canCreate]`).
export function useTopbarAction(action: ReactNode, deps: unknown[] = []) {
  const { setAction } = useTopbarContext();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setAction(action);
    return () => setAction(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
