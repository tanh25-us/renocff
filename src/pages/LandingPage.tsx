import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Award, Plus, X } from 'lucide-react';
import { useStore } from '../store';
import { useCartStore } from '../store/useCartStore';
import { formatCurrency } from '../lib/utils';
import { PRODUCTS, PRODUCT_CATEGORIES } from '../lib/products';
import type { ProductCategory } from '../lib/products';
import BrandStory from '../components/common/BrandStory';
import BranchesSection from '../components/common/BranchesSection';
import SiteFooter from '../components/common/SiteFooter';

const MARQUEE_TEXT = "Reno Coffee · Nghệ thuật cà phê thủ công · Hạt rang tươi mỗi ngày · Giao tận nơi trong 30 phút · Reno Club tích điểm mỗi đơn ·";
const PAGE_SIZE = 8;

// ── Login Modal ────────────────────────────────────────────────────────────
function LoginModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-[#25160e] p-6 text-white">
          <div className="mb-3 text-3xl">☕</div>
          <h2 className="font-display text-xl font-bold">Đăng nhập để đặt món</h2>
          <p className="mt-1 text-sm text-[#dec1b3]/90">Vui lòng đăng nhập để đặt món và tích lũy điểm thưởng Reno Club!</p>
        </div>
        <div className="space-y-3 p-5">
          <button onClick={() => { onClose(); navigate('/login'); }}
            className="w-full rounded-xl bg-[#25160e] py-3 text-sm font-bold text-white hover:bg-[#3c2a21]">
            Đăng nhập ngay
          </button>
          <button onClick={onClose}
            className="w-full rounded-xl border border-[#d3c3bd] py-3 text-sm font-semibold text-[#4f4540] hover:bg-[#f6f3f2]">
            Để sau
          </button>
        </div>
        <button onClick={onClose} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/20 text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Product Card ───────────────────────────────────────────────────────────
function ProductCard({ product, onAdd, added, available }: {
  product: typeof PRODUCTS[0]; onAdd: (id: string) => void; added: boolean; available: boolean;
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-[#d3c3bd] bg-white shadow-[0px_4px_20px_rgba(60,42,33,0.04)] transition hover:shadow-[0px_8px_32px_rgba(60,42,33,0.10)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f0eded]">
        <img src={product.image} alt={product.name}
          className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.05] ${!available ? 'opacity-60' : ''}`} />
        {product.tags[0] && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-[#25160e] backdrop-blur-sm">
            {product.tags[0]}
          </span>
        )}
        {!available && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">Hết hàng</span>
          </div>
        )}
      </div>
      <div className="space-y-3 p-4">
        <div>
          <h3 className="font-display text-sm font-bold leading-snug text-[#1b1c1c]">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#81756f]">{product.description}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-base font-bold text-[#25160e]">{formatCurrency(product.price)}</span>
          <button onClick={() => available && onAdd(product.id)} disabled={!available}
            className={`flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold transition ${
              !available ? 'cursor-not-allowed bg-[#f0eded] text-[#81756f]'
              : added ? 'bg-[#dfeadc] text-[#26442f]'
              : 'bg-[#25160e] text-white hover:bg-[#3c2a21]'
            }`}>
            <Plus className="h-3.5 w-3.5" />
            {!available ? 'Hết' : added ? 'Đã thêm' : 'Thêm'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Landing Page ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const { currentCustomer, recipes } = useStore();
  const { addToCart } = useCartStore();
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [marqueePosition, setMarqueePosition] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setMarqueePosition((prev) => prev - 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const availabilityMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    recipes.forEach((r) => { map[r.name] = r.available; });
    return map;
  }, [recipes]);

  const filtered = useMemo(() =>
    activeCategory === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeCategory),
    [activeCategory],
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleAdd = useCallback((id: string) => {
    if (!currentCustomer) { setShowLoginModal(true); return; }
    const product = PRODUCTS.find((p) => p.id === id);
    if (!product) return;
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.image });
    setAddedIds((prev) => new Set(prev).add(id));
    setTimeout(() => setAddedIds((prev) => { const s = new Set(prev); s.delete(id); return s; }), 900);
  }, [currentCustomer, addToCart]);

useEffect(() => { setCurrentPage(1); }, [activeCategory]);

  return (
    <div className="bg-[#fcf9f8]">
      <div className="relative h-10 bg-[#25160e] flex items-center overflow-hidden">
        <div className="absolute whitespace-nowrap text-xs font-semibold text-[#f4dbc9]"
          style={{ transform: `translateX(${marqueePosition}px)` }}>
          {MARQUEE_TEXT.repeat(3)}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-[#25160e] text-white shadow-[0px_8px_40px_rgba(37,22,14,0.25)]">
          <div className="grid min-h-[460px] md:grid-cols-[1fr_0.8fr]">
            <div className="flex flex-col justify-center p-8 md:p-14">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#dec1b3] backdrop-blur-sm">
                <Award className="h-3.5 w-3.5" /> Reno Club — Tích điểm mỗi đơn
              </span>
              <h1 className="font-display mt-5 text-4xl font-extrabold leading-tight md:text-5xl lg:text-[3.5rem]">
                Cà phê thủ công,<br />giao tận nơi.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/65">
                Đặt hàng online, tích điểm mỗi đơn và đổi ưu đãi hấp dẫn từ Reno Club. Mỗi ly được pha theo công thức chuẩn barista.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#menu" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#25160e] transition hover:bg-[#f4dbc9] hover:shadow-lg">
                  Xem thực đơn
                </a>
                {currentCustomer ? (
                  <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold">
                    <Award className="h-4 w-4 text-[#f4dbc9]" />
                    {currentCustomer.name.split(' ').pop()} · {currentCustomer.pointsBalance} điểm
                  </div>
                ) : (
                  <Link to="/login" className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                    Đăng nhập / Đăng ký
                  </Link>
                )}
              </div>
            </div>
            <div className="hidden md:block">
              <img src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=90"
                alt="Reno Coffee" className="h-full w-full object-cover transition duration-700 hover:scale-[1.05]" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#d3c3bd] bg-gradient-to-r from-[#3c2a21] to-[#6d5b4c] px-6 py-5 text-white sm:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f4dbc9] text-[#25160e]">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-base font-bold">Reno Club — Tích điểm mỗi đơn hàng</p>
              <p className="mt-0.5 text-sm text-[#dec1b3]/80">Mỗi 10.000đ = 1 điểm · Đổi điểm lấy đồ uống miễn phí</p>
            </div>
          </div>
          {!currentCustomer && (
            <Link to="/login" className="shrink-0 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#25160e] transition hover:bg-[#f4dbc9]">
              Tham gia ngay
            </Link>
          )}
        </div>
      </section>

      <BrandStory />

      <BranchesSection />

      <section id="menu" className="bg-[#f0eded] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="label-caps text-[#6d5b4c]">Thực đơn</p>
              <h2 className="font-display mt-2 text-3xl font-bold text-[#25160e] md:text-4xl">Chọn món yêu thích</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_CATEGORIES.map(({ key, label }) => (
                <button key={key} onClick={() => setActiveCategory(key)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    activeCategory === key
                      ? 'border-[#25160e] bg-[#25160e] text-white'
                      : 'border-[#d3c3bd] bg-white text-[#4f4540] hover:bg-[#fcf9f8]'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {paginatedProducts.map((product) => (
              <ProductCard product={product}
                onAdd={handleAdd} added={addedIds.has(product.id)}
                available={availabilityMap[product.name] !== false} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`h-10 w-10 rounded-xl text-sm font-bold transition ${
                    currentPage === page
                      ? 'bg-[#25160e] text-white'
                      : 'border border-[#d3c3bd] bg-white text-[#4f4540] hover:bg-[#f6f3f2]'
                  }`}>
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </div>
  );
}
