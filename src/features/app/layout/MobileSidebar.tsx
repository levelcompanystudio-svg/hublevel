import { X } from 'lucide-react';
import type { RoleName } from '../../auth/auth.types';
import { AppSidebar } from './AppSidebar';

interface MobileSidebarProps {
  open: boolean;
  role?: RoleName;
  userName?: string;
  onClose: () => void;
}

export function MobileSidebar({ open, role, userName, onClose }: MobileSidebarProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        aria-label="Fechar menu"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative h-full w-72 max-w-[85vw] shadow-2xl shadow-black/40">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar menu"
          className="absolute right-3 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar text-sidebar-accent-foreground transition hover:border-primary/50 hover:bg-sidebar-accent hover:text-primary"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        <AppSidebar role={role} userName={userName} onNavigate={onClose} />
      </div>
    </div>
  );
}
