import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Clock,
  Gift,
  History,
  LogIn,
  LogOut,
  MapPin,
  Phone,
  Plus,
  ShoppingBag,
  UserRound,
} from 'lucide-react';
import { Badge, Button, Card, Field, Input } from '../../components/ui';
import { formatCurrency } from '../../lib/utils';
import { useStore } from '../../store';

interface StorefrontProps {
  onCheckout: () => void;
}

export default function Storefront({ onCheckout }: StorefrontProps) {
  const {
    recipes,
    outlets,
    activeOutletId,
    setActiveOutlet,
    currentCustomer,
    loginCustomer,
    logoutCustomer,
    customerCart,
    addCustomerCartItem,
  } = useStore();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [authError, setAuthError] = useState('');

  const activeOutlet = outlets.find((outlet) => outlet.id === activeOutletId) || outlets[0];
  const availableRecipes = recipes.filter((recipe) => recipe.available);
  const featured = availableRecipes.slice(0, 4);
  const cartCount = useMemo(() => customerCart.reduce((sum, item) => sum + item.quantity, 0), [customerCart]);
  const total = useMemo(() => customerCart.reduce((sum, item) => sum + item.price * item.quantity, 0), [customerCart]);
  const pendingPoints = Math.floor(total / 10000);

  useEffect(() => {
    if (!currentCustomer) return;
    setCustomerName(currentCustomer.name);
    setCustomerPhone(currentCustomer.phone);
    setCustomerEmail(currentCustomer.email || '');
  }, [currentCustomer]);

  const handleCustomerLogin = (event: FormEvent) => {
    event.preventDefault();
    setAuthError('');
    const customer = loginCustomer({
      phone: customerPhone,
      name: customerName,
      email: customerEmail,
    });

    if (!customer) {
      setAuthError('Nhập số điện thoại đã đăng ký, hoặc nhập thêm họ tên để tạo hồ sơ mới.');
    }
  };

  return (
    <div className="space-y-8">
      <section className="grid overflow-hidden rounded-2xl border border-[#cbd5d1] bg-[#10201f] text-white lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex min-h-[440px] flex-col justify-between p-6 sm:p-9 lg:p-11">
          <div>
            <p className="label-caps text-[#9fd6cd]">Đặt hàng online</p>
            <h1 className="font-display mt-4 max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
              Khách hàng chọn món trên website, tích điểm và thanh toán trong giỏ riêng.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/80">
              Hồ sơ khách hàng lưu lịch sử điểm, đơn pickup, đơn giao hàng và quà đã đổi trong Reno Club.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                className="bg-white text-[#10201f] hover:bg-[#d8f3ee]"
                onClick={() => document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <ShoppingBag className="h-4 w-4" />
                Chọn món
              </Button>
              <Button
                variant="secondary"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={onCheckout}
              >
                <ShoppingBag className="h-4 w-4" />
                Thanh toán giỏ {cartCount > 0 ? `(${cartCount})` : ''}
              </Button>
            </div>
          </div>

          <div className="mt-10 grid gap-3 text-sm text-[#d8f3ee] sm:grid-cols-2">
            <div className="flex min-w-0 items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{activeOutlet.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{activeOutlet.hours}</span>
            </div>
          </div>
        </div>
        <div className="relative min-h-[360px]">
          <img
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=90"
            alt="Ly cà phê đặt online tại Reno"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#10201f]/45 to-transparent" />
        </div>
      </section>

      <section id="customer-panel" className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label-caps text-[#0f766e]">Tài khoản</p>
              <h2 className="font-display mt-2 text-2xl font-bold">Hồ sơ khách hàng</h2>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-full bg-[#d8f3ee] text-[#0f766e]">
              <UserRound className="h-5 w-5" />
            </div>
          </div>

          {currentCustomer ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-[#cbd5d1] bg-[#f8fbfa] p-4">
                <p className="text-sm font-semibold text-[#4f5b58]">Xin chào</p>
                <h3 className="font-display mt-1 text-2xl font-bold">{currentCustomer.name}</h3>
                <p className="mt-2 flex items-center gap-2 text-sm text-[#4f5b58]">
                  <Phone className="h-4 w-4" />
                  {currentCustomer.phone}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-[#eef8f5] p-4">
                  <p className="label-caps text-[#0f766e]">Điểm hiện có</p>
                  <p className="font-display mt-2 text-3xl font-bold">{currentCustomer.pointsBalance}</p>
                </div>
                <div className="rounded-xl bg-[#f4f7fb] p-4">
                  <p className="label-caps text-[#475569]">Số đơn</p>
                  <p className="font-display mt-2 text-3xl font-bold">{currentCustomer.totalOrders}</p>
                </div>
                <div className="rounded-xl bg-[#fff7ed] p-4">
                  <p className="label-caps text-[#9a5a12]">Hạng</p>
                  <p className="font-display mt-2 text-3xl font-bold">{currentCustomer.loyaltyTier}</p>
                </div>
              </div>

              <Button variant="secondary" className="w-full" onClick={logoutCustomer}>
                <LogOut className="h-4 w-4" />
                Đăng xuất khách
              </Button>
            </div>
          ) : (
            <form onSubmit={handleCustomerLogin} className="mt-5 space-y-4">
              <Field label="Họ tên">
                <Input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Nguyễn Văn A" />
              </Field>
              <Field label="Số điện thoại">
                <Input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="09xx xxx xxx" required />
              </Field>
              <Field label="Email">
                <Input type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} placeholder="name@email.com" />
              </Field>
              {authError && <p className="rounded-lg bg-[#ffdad6] px-3 py-2 text-sm font-semibold text-[#93000a]">{authError}</p>}
              <Button type="submit" className="w-full">
                <LogIn className="h-4 w-4" />
                Đăng nhập / tạo hồ sơ
              </Button>
            </form>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label-caps text-[#0f766e]">Điểm thưởng</p>
              <h2 className="font-display mt-2 text-2xl font-bold">Lịch sử loyalty</h2>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-full bg-[#d8f3ee] text-[#0f766e]">
              <History className="h-5 w-5" />
            </div>
          </div>

          {currentCustomer ? (
            <div className="mt-5 space-y-3">
              {currentCustomer.pointHistory.slice(0, 6).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between gap-4 rounded-xl border border-[#e2e8e5] bg-white p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{entry.description}</p>
                    <p className="mt-1 text-xs text-[#64716d]">{entry.date} {entry.orderId ? `· ${entry.orderId}` : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-display text-lg font-bold ${entry.points >= 0 ? 'text-[#0f766e]' : 'text-[#93000a]'}`}>
                      {entry.points >= 0 ? '+' : ''}{entry.points}
                    </p>
                    <p className="text-xs text-[#64716d]">Còn {entry.balanceAfter}</p>
                  </div>
                </div>
              ))}
              {currentCustomer.pointHistory.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#cbd5d1] p-8 text-center text-sm text-[#64716d]">
                  Chưa có giao dịch điểm.
                </div>
              )}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-[#cbd5d1] p-8 text-center text-sm text-[#64716d]">
              Đăng nhập bằng số điện thoại để xem điểm và đổi quà tại trang thanh toán.
            </div>
          )}
        </Card>
      </section>

      <section id="menu-section" className="space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="label-caps text-[#0f766e]">Thực đơn online</p>
            <h2 className="font-display mt-2 text-3xl font-bold">Món nổi bật</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {outlets.map((outlet) => (
              <button
                key={outlet.id}
                className={`min-h-10 rounded-full border px-4 text-sm font-semibold ${
                  outlet.id === activeOutletId
                    ? 'border-[#10201f] bg-[#10201f] text-white'
                    : 'border-[#cbd5d1] bg-white text-[#4f5b58] hover:bg-[#f8fbfa]'
                }`}
                onClick={() => setActiveOutlet(outlet.id)}
              >
                {outlet.name.replace('Reno ', '')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featured.map((recipe) => {
            const quantity = customerCart.find((item) => item.id === recipe.id)?.quantity || 0;

            return (
              <Card key={recipe.id} className="overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden bg-[#edf2f0]">
                  <img src={recipe.image} alt={recipe.name} className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]" />
                </div>
                <div className="space-y-4 p-4">
                  <div>
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {recipe.tags.slice(0, 2).map((tag) => <Badge key={tag} tone="primary">{tag}</Badge>)}
                      {quantity > 0 && <Badge tone="success">Trong giỏ x{quantity}</Badge>}
                    </div>
                    <h3 className="font-display text-lg font-bold">{recipe.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#4f5b58]">{recipe.description}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-lg font-bold">{formatCurrency(recipe.price)}</span>
                    <Button size="sm" onClick={() => addCustomerCartItem(recipe.id)}>
                      <Plus className="h-4 w-4" />
                      Thêm
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_430px]">
        <Card className="p-6">
          <p className="label-caps text-[#0f766e]">Đặt món</p>
          <h2 className="font-display mt-2 text-3xl font-bold">Thực đơn đang bán</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#4f5b58]">
            Khách chọn món tại đây, sau đó sang trang thanh toán để nhập thông tin nhận hàng và đổi điểm lấy quà.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {availableRecipes.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => addCustomerCartItem(recipe.id)}
                className="flex min-h-[96px] items-center gap-3 rounded-xl border border-[#cbd5d1] bg-white p-3 text-left transition hover:border-[#0f766e] hover:bg-[#f8fbfa]"
              >
                <img src={recipe.image} alt={recipe.name} className="h-16 w-16 rounded-lg object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{recipe.name}</span>
                  <span className="mt-1 block text-xs text-[#4f5b58]">{formatCurrency(recipe.price)}</span>
                </span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="self-start p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="label-caps text-[#0f766e]">Giỏ khách</p>
              <h3 className="font-display mt-1 text-xl font-bold">Tóm tắt giỏ hàng</h3>
            </div>
            <ShoppingBag className="h-6 w-6 text-[#10201f]" />
          </div>

          <div className="mt-5 space-y-3">
            {customerCart.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#cbd5d1] p-6 text-center text-sm text-[#64716d]">
                Chưa có món trong giỏ.
              </div>
            ) : (
              customerCart.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 border-b border-[#edf2f0] pb-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{item.name}</p>
                    <p className="mt-1 text-xs text-[#4f5b58]">{formatCurrency(item.price)}</p>
                  </div>
                  <span className="rounded-full bg-[#eef8f5] px-3 py-1 text-sm font-bold text-[#0f766e]">x{item.quantity}</span>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 rounded-xl bg-[#f8fbfa] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#4f5b58]">Tạm tính</span>
              <span className="font-display text-2xl font-bold">{formatCurrency(total)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-[#0f766e]">
              <span className="inline-flex items-center gap-2 font-semibold">
                <Gift className="h-4 w-4" />
                Điểm dự kiến
              </span>
              <span className="font-bold">+{pendingPoints}</span>
            </div>
          </div>

          <Button className="mt-5 w-full" onClick={onCheckout}>
            <ShoppingBag className="h-4 w-4" />
            Đến trang thanh toán
          </Button>
        </Card>
      </section>
    </div>
  );
}
