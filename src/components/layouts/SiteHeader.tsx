import { Coffee, LogOut, Menu, ShoppingBag, X, MapPin, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useStore } from '../../store';
import { useCartStore } from '../../store/useCartStore';

const MARQUEE_TEXT = "Reno Coffee · Nghệ thuật cà phê thủ công · Hạt rang tươi mỗi ngày · Giao tận nơi trong 30 phút · Reno Club tích điểm mỗi đơn ·";

export default function SiteHeader({ onCartOpen }: { onCartOpen?: () => void }) {
  const { currentCustomer, logoutCustomer, outlets, activeOutletId, setActiveOutlet } = useStore();
  const { totalItems } = useCartStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [marqueePosition, setMarqueePosition] = useState(0);
  const [showBranches, setShowBranches] = useState(false);

  const activeOutlet = outlets.find((o) => o.id === activeOutletId) || outlets[0];

  useEffect(() => {
    const interval = setInterval(() => {
      setMarqueePosition((prev) => prev - 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { label: 'Sản phẩm', to: '/' },
    { label: 'Câu chuyện', to: '/story' },
    { label: 'Cửa hàng', to: '/stores' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#fcf9f8]/95 backdrop-blur-md border-b border-[#d3c3bd]/60 overflow-visible">
      <div className="relative h-8 bg-[#25160e] flex items-center overflow-hidden">
        <div className="absolute whitespace-nowrap text-xs font-semibold text-[#f4dbc9]"
          style={{ transform: `translateX(${marqueePosition}px)` }}>
          {MARQUEE_TEXT.repeat(3)}
        </div>
      </div>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#25160e] transition-transform group-hover:rotate-6">
            <Coffee className="h-5 w-5 text-[#f4dbc9]" />
          </div>
          <span className="hidden sm:inline font-display text-lg font-extrabold tracking-tight text-[#25160e] group-hover:text-[#6d5b4c] transition">RENO COFFEE</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}
              className="relative text-sm font-semibold text-[#4f4540] transition hover:text-[#25160e] after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-[#25160e] after:transition-all after:hover:w-full">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Branch Selector */}
          <div className="relative">
            <button onClick={() => setShowBranches(!showBranches)} 
              className="flex items-center gap-1.5 rounded-full border border-[#d3c3bd] bg-white px-3 py-1.5 text-xs font-bold text-[#25160e] hover:bg-[#f6f3f2] transition">
              <MapPin className="h-3.5 w-3.5 text-[#6d5b4c]" />
              <span className="max-w-[100px] truncate sm:max-w-[160px]">{activeOutlet.name}</span>
              <ChevronDown className="h-3.5 w-3.5 text-[#81756f]" />
            </button>
            {showBranches && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[#d3c3bd] bg-white p-2 shadow-xl animate-slide-down z-50">
                <p className="px-3 pb-2 pt-1 text-xs font-semibold text-[#81756f]">Chọn chi nhánh mua hàng</p>
                {outlets.map((outlet) => (
                  <button key={outlet.id} onClick={() => { setActiveOutlet(outlet.id); setShowBranches(false); }} 
                    className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-bold transition ${outlet.id === activeOutletId ? 'bg-[#25160e] text-white' : 'text-[#4f4540] hover:bg-[#f6f3f2]'}`}>
                    {outlet.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {currentCustomer ? (
            <div className="flex items-center gap-2">
              <Link to="/account" className="hidden items-center gap-1.5 rounded-full bg-[#f4dbc9] px-3 py-1.5 sm:flex transition hover:scale-105 active:scale-95">
                <span className="text-xs font-bold text-[#25160e]">
                  👤 {currentCustomer.name.split(' ').pop()} · {currentCustomer.pointsBalance} pts
                </span>
              </Link>
              <button onClick={logoutCustomer}
                className="flex h-9 items-center gap-1.5 rounded-full bg-[#ffdad6] px-3 text-xs font-bold text-[#93000a] transition hover:bg-[#ffb4ab]"
                title="Đăng xuất">
                <span className="hidden sm:inline">Đăng xuất</span>
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Link to="/login"
              className="hidden rounded-full bg-[#25160e] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#3c2a21] sm:block">
              Đăng nhập
            </Link>
          )}

          <button onClick={onCartOpen}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#25160e] text-white transition hover:shadow-lg hover:scale-105 active:scale-95">
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ba1a1a] text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {totalItems}
              </span>
            )}
          </button>

          <button className="grid h-9 w-9 place-items-center rounded-lg md:hidden" onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#d3c3bd]/60 bg-[#fcf9f8] px-4 py-4 md:hidden animate-slide-down">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                className="text-sm font-semibold text-[#4f4540] transition-all hover:translate-x-2">
                {link.label}
              </Link>
            ))}
            {!currentCustomer && (
              <Link to="/login" onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-xl bg-[#25160e] py-2.5 text-center text-sm font-bold text-white transition hover:bg-[#3c2a21]">
                Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
