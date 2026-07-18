import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';
import { MobileSidebar } from './MobileSidebar';

export function AppLayout() {
  const { profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="hidden md:fixed md:inset-y-0 md:z-40 md:flex">
        <AppSidebar
          role={profile?.roles?.name}
          userName={profile?.name}
          onLogout={() => void handleLogout()}
          loggingOut={signingOut}
        />
      </div>

      <MobileSidebar
        open={mobileMenuOpen}
        role={profile?.roles?.name}
        userName={profile?.name}
        onClose={() => setMobileMenuOpen(false)}
        onLogout={() => void handleLogout()}
        loggingOut={signingOut}
      />

      <div className="min-h-screen md:pl-64">
        <AppTopbar role={profile?.roles?.name} userName={profile?.name} onOpenMenu={() => setMobileMenuOpen(true)} />
        <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
