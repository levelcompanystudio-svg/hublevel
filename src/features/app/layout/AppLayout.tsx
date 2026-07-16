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
      <div className="hidden md:fixed md:inset-y-0 md:flex">
        <AppSidebar role={profile?.roles?.name} userName={profile?.name} />
      </div>

      <MobileSidebar
        open={mobileMenuOpen}
        role={profile?.roles?.name}
        userName={profile?.name}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="min-h-screen md:pl-72">
        <AppTopbar
          role={profile?.roles?.name}
          userName={profile?.name}
          loading={signingOut}
          onLogout={() => void handleLogout()}
          onOpenMenu={() => setMobileMenuOpen(true)}
        />
        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 xl:px-10 xl:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
