import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, ChevronDown, LogOut, Menu, Settings, UserRound } from 'lucide-react';
import { ROLE_PERMISSIONS, useStore } from '../../store';
import { AppRouteId } from '../../types';
import { Badge, Button } from '../ui';

interface NavbarProps {
  currentTab: AppRouteId;
  onOpenSidebar: () => void;
}

const ROUTE_LABELS: Record<AppRouteId, string> = {
  storefront: 'Cửa hàng',
  checkout: 'Thanh toán',
  dashboard: 'Tổng quan',
  orders: 'Đơn hàng',
  menu: 'Thực đơn',
  customers: 'Khách hàng',
  branches: 'Chi nhánh',
};

const permissionLabels: Record<string, string> = {
  canManageRecipes: 'Menu',
  canManageInventory: 'Kho',
  canManageShifts: 'Ca',
  canManageOutlets: 'Chi nhánh',
  canManageOrders: 'Đơn hàng',
  canViewAnalytics: 'Doanh thu',
  canManageCustomers: 'Khách hàng',
};

function allowedText(role: keyof typeof ROLE_PERMISSIONS) {
  return Object.entries(ROLE_PERMISSIONS[role].permissions)
    .filter(([, value]) => value)
    .map(([key]) => permissionLabels[key])
    .join(' · ');
}

export default function Navbar({ currentTab, onOpenSidebar }: NavbarProps) {
  const { currentRole, currentUser, setRole, systemMessages, dismissMessage, logout } = useStore();
  const navigate = useNavigate();
  const [timeStr, setTimeStr] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoles, setShowRoles] = useState(false);
  const routeLabel = ROUTE_LABELS[currentTab] || 'Management Suite';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const tick = () => setTimeStr(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b border-[#d3c3bd] bg-[#fcf9f8]/92 px-4 backdrop-blur md:px-7">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenSidebar} aria-label="Mở menu">
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <p className="font-display text-xl font-bold text-[#1b1c1c]">Management Suite</p>
          <p className="mt-1 text-sm text-[#4f4540]">{routeLabel} · {timeStr}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Button variant="ghost" size="icon" onClick={() => setShowNotifications((value) => !value)} aria-label="Thông báo">
            <Bell className="h-5 w-5" />
            {systemMessages.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ba1a1a]" />}
          </Button>
          {showNotifications && (
            <div className="reno-card absolute right-0 mt-2 w-[min(360px,calc(100vw-32px))] overflow-hidden">
              <div className="border-b border-[#d3c3bd] px-4 py-3">
                <p className="font-display text-sm font-bold">Thông báo vận hành</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {systemMessages.map((message) => (
                  <div key={message.id} className="border-b border-[#f0eded] p-4 last:border-b-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge tone={message.type === 'success' ? 'success' : message.type === 'warning' ? 'warning' : 'primary'}>
                          {message.time}
                        </Badge>
                        <p className="mt-2 text-sm font-semibold text-[#1b1c1c]">{message.title}</p>
                        <p className="mt-1 text-xs leading-5 text-[#4f4540]">{message.message}</p>
                      </div>
                      <button
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg hover:bg-[#f6f3f2]"
                        onClick={() => dismissMessage(message.id)}
                        aria-label="Đã đọc"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button variant="ghost" size="icon" aria-label="Cài đặt">
          <Settings className="h-5 w-5" />
        </Button>

        <button
          onClick={handleLogout}
          className="grid h-10 w-10 place-items-center rounded-full border border-[#d3c3bd] text-[#81756f] hover:bg-[#ffdad6] hover:text-[#93000a] transition"
          aria-label="Đăng xuất"
          title="Đăng xuất"
        >
          <LogOut className="h-4 w-4" />
        </button>

        <div className="relative">
          <button
            className="flex min-h-11 items-center gap-2 rounded-full border border-[#d3c3bd] bg-white px-2 py-1.5 pl-3 text-sm font-semibold text-[#25160e] hover:bg-[#f6f3f2]"
            onClick={() => setShowRoles((value) => !value)}
          >
            <span className="hidden sm:inline">{ROLE_PERMISSIONS[currentRole].label}</span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f4dbc9]">
              <UserRound className="h-4 w-4" />
            </span>
            <ChevronDown className="hidden h-4 w-4 sm:block" />
          </button>
          {showRoles && (
            <div className="reno-card absolute right-0 mt-2 w-[min(430px,calc(100vw-32px))] p-2">
              <div className="px-3 py-2">
                <p className="label-caps text-[#6d5b4c]">Đổi vai trò & phân quyền</p>
                <p className="mt-1 text-xs text-[#4f4540]">Đang đăng nhập: {currentUser?.name || 'Reno team'}</p>
              </div>
              {Object.values(ROLE_PERMISSIONS).map((role) => (
                <button
                  key={role.role}
                  className={`w-full rounded-lg px-3 py-3 text-left transition ${
                    currentRole === role.role ? 'bg-[#f4dbc9] text-[#25160e]' : 'hover:bg-[#f6f3f2]'
                  }`}
                  onClick={() => {
                    setRole(role.role);
                    setShowRoles(false);
                  }}
                >
                  <p className="text-sm font-semibold">{role.label}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#4f4540]">{role.description}</p>
                  <p className="mt-2 rounded-lg bg-white/70 px-2 py-1.5 text-xs font-semibold text-[#25160e]">
                    Được phép: {allowedText(role.role)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
