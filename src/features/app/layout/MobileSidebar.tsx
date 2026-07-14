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
        <AppSidebar role={role} userName={userName} onNavigate={onClose} />
      </div>
    </div>
  );
}
