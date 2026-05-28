import { BarChart3, Building2, LayoutDashboard, ShoppingBag, Users, X } from 'lucide-react';
import { ROLE_PERMISSIONS, useStore } from '../../store';
import { AppRouteId } from '../../types';
import { Button } from '../ui';

interface SidebarProps {
  currentTab: AppRouteId;
  setTab: (tab: AppRouteId) => void;
  isOpen: boolean;
  onClose: () => void;
}

const APP_ROUTES = [
  { id: 'dashboard', label: 'Tổng quan',  icon: LayoutDashboard },
  { id: 'orders',    label: 'Đơn hàng',   icon: ShoppingBag },
  { id: 'menu',      label: 'Thực đơn',   icon: BarChart3 },
  { id: 'customers', label: 'Khách hàng', icon: Users },
  { id: 'branches',  label: 'Chi nhánh',  icon: Building2 },
  { id: 'staff',     label: 'Nhân viên',  icon: Users },
] as const;

const permissionText: Record<string, string> = {
  canManageRecipes: 'Menu',
  canManageShifts: 'Ca',
  canManageOutlets: 'Chi nhánh',
  canManageOrders: 'Đơn',
  canViewAnalytics: 'Doanh thu',
  canManageCustomers: 'Khách',
};

export default function Sidebar({ currentTab, setTab, isOpen, onClose }: SidebarProps) {
  const { outlets, activeOutletId, currentRole } = useStore();
  const activeOutlet = outlets.find((outlet) => outlet.id === activeOutletId) || outlets[0];
  const roleConfig = ROLE_PERMISSIONS[currentRole];

  const handleClick = (tab: AppRouteId) => { setTab(tab); onClose(); };

  return (
    <>
      {isOpen && <button className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={onClose} aria-label="Đóng menu" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-white/10 bg-[#25160e] text-white transition-transform duration-300 md:static md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <div>
            <p className="font-display text-xl font-extrabold tracking-tight">RENO COFFEE</p>
            <p className="label-caps mt-1 text-[#dec1b3]">Management Suite</p>
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-lg text-[#dec1b3] hover:bg-white/10 md:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 px-4 py-5">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <p className="label-caps text-[#aa9084]">Chi nhánh đang trực</p>
            <p className="mt-2 text-sm font-bold">Reno Coffee</p>
            <p className="mt-1 text-xs text-[#dec1b3]/75 leading-relaxed">
              Reno Coffee - {activeOutlet?.address}
            </p>
          </div>
          <div className="rounded-xl border border-[#f4dbc9]/20 bg-[#f4dbc9]/10 p-3">
            <p className="label-caps text-[#dec1b3]">Quyền hiện tại</p>
            <p className="mt-2 text-sm font-bold">{roleConfig.label}</p>
          </div>
        </div>

        <nav className="flex-grow space-y-1 px-3">
          {APP_ROUTES.map((route) => {
            const Icon = route.icon;
            const active = currentTab === route.id;
            return (
              <button key={route.id} onClick={() => handleClick(route.id)}
                className={`flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition ${active ? 'bg-[#f4dbc9] text-[#25160e]' : 'text-[#dec1b3] hover:bg-white/10 hover:text-white'}`}>
                <Icon className="h-4.5 w-4.5" />
                {route.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
