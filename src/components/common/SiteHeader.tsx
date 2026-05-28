import { Coffee, LogOut, Menu, ShoppingBag, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useStore } from '../../store';
import { useCartStore } from '../../store/useCartStore';

const MARQUEE_TEXT = "Reno Coffee · Nghệ thuật cà phê thủ công · Hạt rang tươi mỗi ngày · Giao tận nơi trong 30 phút · Reno Club tích điểm mỗi đơn ·";

export default function SiteHeader() {
  const { currentCustomer, logoutCustomer } = useStore();
  const { totalItems } = useCartStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [marqueePosition, setMarqueePosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMarqueePosition((prev) => prev - 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { label: 'Sản phẩm', href: '#menu' },
    { label: 'Câu chuyện', href: '#story' },
    { label: 'Cửa hàng', href: '#branches' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#fcf9f8]/95 backdrop-blur-md border-b border-[#d3c3bd]/60 overflow-hidden">
      <div className="relative h-8 bg-[#25160e] flex items-center">
        <div className="absolute whitespace-nowrap text-xs font-semibold text-[#f4dbc9] animate-marquee"
          style={{ transform: `translateX(${marqueePosition}px)` }}>
          {MARQUEE_TEXT.repeat(3)}
        </div>
      </div>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#25160e] transition-transform group-hover:rotate-6">
            <Coffee className="h-5 w-5 text-[#f4dbc9]" />
          </div>
          <span className="font-display text-lg font-extrabold tracking-tight text-[#25160e] group-hover:text-[#6d5b4c] transition">RENO COFFEE</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}
              className="relative text-sm font-semibold text-[#4f4540] transition hover:text-[#25160e] after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-[#25160e] after:transition-all after:hover:w-full">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {currentCustomer ? (
            <>
              <div className="hidden items-center gap-1.5 rounded-full border border-[#d3c3bd] bg-gradient-to-r from-[#f4dbc9] to-[#e8d2c6] px-3 py-1.5 sm:flex">
                <span className="text-xs font-bold text-[#25160e]">
                  {currentCustomer.name.split(' ').pop()} · {currentCustomer.pointsBalance} đ
                </span>
              </div>
              <button onClick={logoutCustomer}
                className="grid h-9 w-9 place-items-center rounded-full border border-[#d3c3bd] text-[#81756f] transition hover:bg-[#f6f3f2]"
                title="Đăng xuất">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link to="/login"
              className="hidden rounded-full border border-[#d3c3bd] bg-white px-4 py-1.5 text-sm font-semibold text-[#25160e] transition hover:bg-[#f6f3f2] sm:block">
              Đăng nhập
            </Link>
          )}

          <button onClick={() => navigate('/#menu')}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#25160e] to-[#3c2a21] text-white transition hover:shadow-lg">
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold animate-pulse">
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
              <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className="text-sm font-semibold text-[#4f4540] transition-all hover:translate-x-2">
                {link.label}
              </a>
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
