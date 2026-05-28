import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Award, MapPin, Plus, Star, X } from 'lucide-react';
import { useStore } from '../store';
import { useCartStore } from '../store/useCartStore';
import { formatCurrency } from '../lib/utils';
import { PRODUCTS, PRODUCT_CATEGORIES } from '../lib/products';
import type { ProductCategory } from '../lib/products';
import BrandStory from '../components/common/BrandStory';
import SiteFooter from '../components/common/SiteFooter';

const MARQUEE_TEXT = "Reno Coffee · Nghệ thuật cà phê thủ công · Hạt rang tươi mỗi ngày · Giao tận nơi trong 30 phút · Reno Club tích điểm mỗi đơn ·";

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
          <p className="mt-1 text-sm text-[#dec1b3]/90">
            Vui lòng đăng nhập để bắt đầu đặt món và tích lũy điểm thưởng Reno Club!
          </p>
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
        <button onClick={onClose} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30">
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
    <div className="group overflow-hidden rounded-2xl border border-[#d3c3bd] bg-white transition hover:shadow-md">
      <div className="aspect-[4/3] overflow-hidden bg-[#f0eded]">
        <img src={product.image} alt={product.name}
          className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.05] ${!available ? 'opacity-60' : ''}`} />
      </div>
      <div className="space-y-3 p-4">
        <div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {!available && (
              <span className="rounded-full bg-[#f0eded] px-2 py-0.5 text-xs font-semibold text-[#81756f]">Hết hàng</span>
            )}
            {product.tags.slice(0, available ? 2 : 0).map((tag) => (
              <span key={tag} className="rounded-full bg-[#f4dbc9] px-2 py-0.5 text-xs font-semibold text-[#25160e]">{tag}</span>
            ))}
          </div>
          <h3 className="font-display text-base font-bold leading-snug">{product.name}</h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[#4f4540]">{product.description}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-lg font-bold">{formatCurrency(product.price)}</span>
          <button
            onClick={() => available && onAdd(product.id)}
            disabled={!available}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
              !available ? 'cursor-not-allowed bg-[#f0eded] text-[#81756f]'
              : added ? 'bg-[#dfeadc] text-[#26442f]'
              : 'bg-[#25160e] text-white hover:bg-[#3c2a21]'
            }`}>
            <Plus className="h-3.5 w-3.5" />
            {!available ? 'Hết hàng' : added ? 'Đã thêm' : 'Thêm'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── HomePage ───────────────────────────────────────────────────────────────
export default function HomePage() {
  const { outlets, currentCustomer, recipes } = useStore();
  const { addToCart } = useCartStore();
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [marqueePosition, setMarqueePosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setMarqueePosition((prev) => prev - 1), 50);
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

  const handleAdd = useCallback((id: string) => {
    if (!currentCustomer) { setShowLoginModal(true); return; }
    const product = PRODUCTS.find((p) => p.id === id);
    if (!product) return;
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.image });
    setAddedIds((prev) => new Set(prev).add(id));
    setTimeout(() => setAddedIds((prev) => { const s = new Set(prev); s.delete(id); return s; }), 900);
  }, [currentCustomer, addToCart]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-12">
      {/* ── HEADER MARQUEE ── */}
      <div className="relative h-10 bg-[#25160e] flex items-center overflow-hidden rounded-xl">
        <div className="absolute whitespace-nowrap text-xs font-semibold text-[#f4dbc9]"
          style={{ transform: `translateX(${marqueePosition}px)` }}>
          {MARQUEE_TEXT.repeat(3)}
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl bg-[#25160e] text-white shadow-[0px_8px_40px_rgba(37,22,14,0.25)]">
        <div className="grid md:grid-cols-[1fr_0.9fr]">
          <div className="flex flex-col justify-center p-8 md:p-12">
            <p className="label-caps text-[#dec1b3]">Reno Coffee · Hà Nội</p>
            <h1 className="font-display mt-3 text-4xl font-extrabold leading-tight md:text-5xl">
              Cà phê thủ công,<br />giao tận nơi.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/75">
              Đặt hàng online, tích điểm mỗi đơn và đổi ưu đãi hấp dẫn từ Reno Club.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {currentCustomer ? (
                <div className="flex items-center gap-2 rounded-xl bg-[#f4dbc9] px-4 py-2.5 text-sm font-bold text-[#25160e]">
                  <Award className="h-4 w-4" />
                  {currentCustomer.name.split(' ').pop()} · {currentCustomer.pointsBalance} điểm
                </div>
              ) : (
                <Link to="/login" className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#25160e] hover:bg-[#f4dbc9]">
                  Đăng nhập / Đăng ký
                </Link>
              )}
              <a href="#menu" className="rounded-xl border border-white/30 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10">
                Xem thực đơn ↓
              </a>
            </div>
          </div>
          <div className="hidden md:block">
            <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=90"
              alt="Reno Coffee" className="h-full w-full object-cover transition duration-700 hover:scale-[1.05]" style={{ minHeight: 280 }} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#d3c3bd] bg-gradient-to-r from-[#3c2a21] to-[#6d5b4c] p-6 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f4dbc9] text-[#25160e]">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-lg font-bold">Reno Club — Tích điểm mỗi đơn</p>
              <p className="mt-0.5 text-sm text-[#dec1b3]/90">Mỗi 10.000đ = 1 điểm · Đổi điểm lấy đồ uống miễn phí</p>
            </div>
          </div>
          {!currentCustomer && (
            <Link to="/login" className="shrink-0 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#25160e] hover:bg-[#f4dbc9]">
              Tham gia ngay
            </Link>
          )}
        </div>
      </section>

      <section>
        <p className="label-caps text-[#6d5b4c]">Chi nhánh Hà Nội</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {outlets.map((outlet) => (
            <div key={outlet.id} className="rounded-xl border border-[#d3c3bd] bg-white p-4 transition hover:border-[#6d5b4c] hover:shadow-md">
              <p className="text-sm font-bold">{outlet.name}</p>
              <p className="mt-1 flex items-start gap-1.5 text-xs text-[#4f4540]">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />{outlet.address}
              </p>
              <div className="mt-2 flex items-center gap-1 text-xs text-[#6d5b4c]">
                <Star className="h-3.5 w-3.5 fill-[#6d5b4c]" />
                {outlet.rating} · {outlet.hours}
              </div>
            </div>
          ))}
        </div>
      </section>

      <BrandStory />

      <section id="menu">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="label-caps text-[#6d5b4c]">Thực đơn</p>
            <h2 className="font-display mt-1 text-3xl font-bold">Chọn món yêu thích</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRODUCT_CATEGORIES.map(({ key, label }) => (
              <button key={key} onClick={() => setActiveCategory(key)}
                className={`min-h-9 rounded-full border px-4 text-sm font-semibold transition ${activeCategory === key ? 'border-[#25160e] bg-[#25160e] text-white' : 'border-[#d3c3bd] bg-white text-[#4f4540] hover:bg-[#f6f3f2]'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard product={product}
              onAdd={handleAdd}
              added={addedIds.has(product.id)}
              available={availabilityMap[product.name] !== false} />
          ))}
        </div>
      </section>

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      
      <SiteFooter />
    </div>
  );
}
