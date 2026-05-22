import type { ReactNode } from 'react';
import { Lock, ShieldAlert } from 'lucide-react';
import { ROLE_PERMISSIONS, useStore } from '../../store';

interface PermissionGuardProps {
  permission: keyof typeof ROLE_PERMISSIONS.Manager.permissions;
  children: ReactNode;
  fallback?: ReactNode;
  displayMode?: 'overlay' | 'hide' | 'inline-alert';
}

export default function PermissionGuard({
  permission,
  children,
  fallback,
  displayMode = 'overlay',
}: PermissionGuardProps) {
  const currentRole = useStore((state) => state.currentRole);
  const roleConfig = ROLE_PERMISSIONS[currentRole];
  const hasPermission = roleConfig?.permissions[permission] ?? false;

  if (hasPermission) return <>{children}</>;
  if (fallback) return <>{fallback}</>;
  if (displayMode === 'hide') return null;

  if (displayMode === 'inline-alert') {
    return (
      <div className="reno-panel flex items-start gap-3 p-4 text-sm">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#6d5b4c]" />
        <div>
          <p className="font-semibold text-[#25160e]">Tính năng bị khóa theo phân quyền</p>
          <p className="mt-1 text-xs text-[#4f4540]">
            Vai trò {roleConfig?.label} chưa có quyền <code>{permission}</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-45">{children}</div>
      <div className="absolute inset-0 grid place-items-center rounded-xl bg-[#fcf9f8]/40">
        <span className="inline-flex items-center gap-2 rounded-lg bg-[#25160e] px-3 py-2 text-[11px] font-semibold text-white shadow-sm">
          <Lock className="h-3.5 w-3.5" />
          Cần quyền truy cập
        </span>
      </div>
    </div>
  );
}
