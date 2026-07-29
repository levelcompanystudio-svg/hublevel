import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSidebarCollapsed } from '../../../lib/useSidebarCollapsed';
import { useAuth } from '../../auth/useAuth';
import { AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';
import { CommandPalette } from './CommandPalette';
import { MobileSidebar } from './MobileSidebar';
import { TopbarProvider } from './TopbarContext';

export function AppLayout() {
  const { profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const role = profile?.roles?.name;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  async function handleLogout() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <TopbarProvider>
      <div className="min-h-screen bg-background text-foreground">
        <div className="hidden md:fixed md:inset-y-0 md:z-40 md:flex">
          <AppSidebar
            role={role}
            userName={profile?.name}
            onLogout={() => void handleLogout()}
            loggingOut={signingOut}
            onOpenSearch={() => setSearchOpen(true)}
          />
        </div>

        <MobileSidebar
          open={mobileMenuOpen}
          role={role}
          userName={profile?.name}
          onClose={() => setMobileMenuOpen(false)}
          onLogout={() => void handleLogout()}
          loggingOut={signingOut}
          onOpenSearch={() => setSearchOpen(true)}
        />

        <SidebarAwareMain>
          <AppTopbar
            role={role}
            userName={profile?.name}
            onOpenMenu={() => setMobileMenuOpen(true)}
            onOpenSearch={() => setSearchOpen(true)}
            onLogout={() => void handleLogout()}
            loggingOut={signingOut}
          />
          <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
            <Outlet />
          </main>
        </SidebarAwareMain>

        <CommandPalette open={searchOpen} role={role} onClose={() => setSearchOpen(false)} />
      </div>
    </TopbarProvider>
  );
}

// A largura da sidebar desktop varia entre 264px (expandida) e 72px (recolhida); o conteudo
// precisa herdar o mesmo recuo para nao sobrepor nem deixar vao. useSidebarCollapsed le o mesmo
// estado persistido usado pelo AppSidebar.
function SidebarAwareMain({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebarCollapsed();
  return <div className={`min-h-screen transition-[padding] duration-200 ${collapsed ? 'md:pl-[72px]' : 'md:pl-64'}`}>{children}</div>;
}
