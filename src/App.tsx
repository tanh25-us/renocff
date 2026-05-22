import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Sidebar from './components/layouts/Sidebar';
import Navbar from './components/layouts/Navbar';
import LoginPage from './components/LoginPage';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Branches from './pages/Branches';
import MenuPage from './pages/Menu';
import Storefront from './pages/Storefront';
import { useStore } from './store';
import { AppRouteId } from './types';

export default function App() {
  const { isLoggedIn } = useStore();
  const [currentTab, setCurrentTab] = useState<AppRouteId>('storefront');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isLoggedIn) return <LoginPage />;

  return (
    <div className="reno-shell min-h-screen text-[#1b1c1c]">
      <div className="flex min-h-screen">
        <Sidebar
          currentTab={currentTab}
          setTab={setCurrentTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar currentTab={currentTab} onOpenSidebar={() => setIsSidebarOpen(true)} />

          <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {currentTab === 'storefront' && <Storefront />}
                {currentTab === 'dashboard' && <Dashboard />}
                {currentTab === 'orders' && <Orders />}
                {currentTab === 'menu' && <MenuPage />}
                {currentTab === 'customers' && <Customers />}
                {currentTab === 'branches' && <Branches />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
