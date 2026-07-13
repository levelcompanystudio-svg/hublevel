import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';
import { MobileSidebar } from './MobileSidebar';

export function AppLayout() {
  const { profile, signOut, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          loading={loading}
          onLogout={() => void signOut()}
          onOpenMenu={() => setMobileMenuOpen(true)}
        />
        <main className="mx-auto w-full max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 xl:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
