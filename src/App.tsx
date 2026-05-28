import { useState } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';

import ClientLayout from './components/layouts/ClientLayout';
import Sidebar from './components/layouts/Sidebar';
import Navbar from './components/layouts/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import StoryPage from './pages/StoryPage';
import StoresPage from './pages/StoresPage';
import AccountPage from './pages/AccountPage';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Branches from './pages/Branches';
import MenuPage from './pages/Menu';
import StaffPage from './pages/Staff';

import { useStore } from './store';
import { AppRouteId } from './types';

const ADMIN_TABS: AppRouteId[] = ['dashboard', 'orders', 'menu', 'customers', 'branches', 'staff'];

function AdminApp() {
  const [currentTab, setCurrentTab] = useState<AppRouteId>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Redirect stale tabs (storefront/checkout) to dashboard
  const safeTab = ADMIN_TABS.includes(currentTab) ? currentTab : 'dashboard';

  return (
    <div className="reno-shell min-h-screen text-[#1b1c1c]">
      <div className="flex min-h-screen">
        <Sidebar currentTab={safeTab} setTab={setCurrentTab} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar currentTab={safeTab} onOpenSidebar={() => setIsSidebarOpen(true)} />
          <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={safeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {safeTab === 'dashboard' && <Dashboard />}
                {safeTab === 'orders'    && <Orders />}
                {safeTab === 'menu'      && <MenuPage />}
                {safeTab === 'customers' && <Customers />}
                {safeTab === 'branches'  && <Branches />}
                {safeTab === 'staff'     && <StaffPage />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { isLoggedIn } = useStore();

  return (
    <Routes>
      <Route element={<ClientLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/story" element={<StoryPage />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/order-success" element={
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="text-5xl">☕</div>
            <h2 className="font-display text-3xl font-bold">Đặt hàng thành công!</h2>
            <p className="text-[#4f4540]">Barista đang chuẩn bị đơn của bạn. Điểm thưởng đã được cộng vào tài khoản.</p>
            <Link to="/" className="mt-2 rounded-xl bg-[#25160e] px-6 py-3 text-sm font-bold text-white hover:bg-[#3c2a21]">Đặt thêm</Link>
          </div>
        } />
      </Route>

      <Route path="/login" element={<AuthPage />} />
      <Route path="/admin/login" element={<AuthPage />} />

      <Route path="/admin/*" element={
        <ProtectedRoute>
          <AdminApp />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to={isLoggedIn ? '/admin/dashboard' : '/'} replace />} />
    </Routes>
  );
}
