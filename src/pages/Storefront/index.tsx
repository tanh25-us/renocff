import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Clock,
  Gift,
  Globe2,
  History,
  LogIn,
  LogOut,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Smartphone,
  Trash2,
  Truck,
  UserRound,
} from 'lucide-react';
import { Badge, Button, Card, Field, Input, Select } from '../../components/ui';
import { formatCurrency } from '../../lib/utils';
import { useStore } from '../../store';
import { OrderChannel, OrderItem, OrderSource, PaymentMethod } from '../../types';

type CartItem = OrderItem & { id: string };

const channelOptions: Array<{ id: OrderChannel; label: string; icon: typeof ShoppingBag }> = [
  { id: 'Pickup', label: 'Nhận tại quán', icon: ShoppingBag },
  { id: 'Delivery', label: 'Giao hàng', icon: Truck },
];

const sourceOptions: Array<{ id: OrderSource; label: string; icon: typeof Globe2 }> = [
  { id: 'Website', label: 'Website', icon: Globe2 },
  { id: 'MobileApp', label: 'Mobile app', icon: Smartphone },
];

export default function Storefront() {
  const {
    recipes,
    outlets,
    activeOutletId,
    setActiveOutlet,
    addOrder,
    currentCustomer,
    loginCustomer,
    logoutCustomer,
  } = useStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [channel, setChannel] = useState<OrderChannel>('Pickup');
  const [source, setSource] = useState<OrderSource>('Website');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Banking');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [pickupTime, setPickupTime] = useState('09:30');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [authError, setAuthError] = useState('');
  const [formError, setFormError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState('');

  const activeOutlet = outlets.find((outlet) => outlet.id === activeOutletId) || outlets[0];
  const availableRecipes = recipes.filter((recipe) => recipe.available);
  const featured = availableRecipes.slice(0, 4);
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const pendingPoints = Math.floor(total / 10000);

  useEffect(() => {
    if (!currentCustomer) return;
    setCustomerName(currentCustomer.name);
    setCustomerPhone(currentCustomer.phone);
    setCustomerEmail(currentCustomer.email || '');
  }, [currentCustomer]);

  const addToCart = (id: string) => {
    const recipe = recipes.find((item) => item.id === id);
    if (!recipe || !recipe.available) return;
    setCart((items) => {
      const current = items.find((item) => item.id === recipe.id);
      if (current) {
        return items.map((item) => (item.id === recipe.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...items, { id: recipe.id, name: recipe.name, price: recipe.price, quantity: 1 }];
    });
  };

  const changeQty = (id: string, delta: number) => {
    setCart((items) =>
      items
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0),
    );
  };

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
      return;
    }

    setConfirmedOrder('');
  };

  const submitOrder = (event: FormEvent) => {
    event.preventDefault();
    setFormError('');
    setConfirmedOrder('');

    const name = customerName.trim();
    const phone = customerPhone.trim();
    const email = customerEmail.trim();
    const address = deliveryAddress.trim();

    if (!cart.length) {
      setFormError('Giỏ hàng đang trống.');
      return;
    }

    if (!name || !phone) {
      setFormError('Cần có họ tên và số điện thoại khách hàng trước khi đặt.');
      return;
    }

    if (channel === 'Delivery' && !address) {
      setFormError('Đơn giao hàng cần có địa chỉ nhận hàng.');
      return;
    }

    if (!currentCustomer) {
      const customer = loginCustomer({ phone, name, email });
      if (!customer) {
        setFormError('Không thể tạo hồ sơ khách hàng từ thông tin hiện tại.');
        return;
      }
    }

    try {
      const order = addOrder({
        customerName: name,
        customerPhone: phone,
        customerEmail: email || undefined,
        channel,
        pickupTime: channel === 'Pickup' ? pickupTime : undefined,
        deliveryAddress: channel === 'Delivery' ? address : undefined,
        source,
        items: cart,
        status: 'Pending',
        total,
        outletId: activeOutletId,
        paymentMethod,
      });

      setConfirmedOrder(order.id);
      setCart([]);
      if (channel === 'Delivery') setDeliveryAddress('');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Không thể tạo đơn hàng.');
    }
  };

  return (
    <div className="space-y-8">
      <section className="grid overflow-hidden rounded-2xl border border-[#cbd5d1] bg-[#10201f] text-white lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex min-h-[440px] flex-col justify-between p-6 sm:p-9 lg:p-11">
          <div>
            <p className="label-caps text-[#9fd6cd]">Reno Online Ordering</p>
            <h1 className="font-display mt-4 max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
              Đặt món trên website hoặc ứng dụng, tích điểm theo từng đơn.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/80">
              Hồ sơ khách hàng được dùng để lưu lịch sử điểm, đồng bộ đơn pickup và đơn giao hàng trong hệ thống Reno.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                className="bg-white text-[#10201f] hover:bg-[#d8f3ee]"
                onClick={() => document.getElementById('order-panel')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <ShoppingBag className="h-4 w-4" />
                Đặt hàng
              </Button>
              <Button
                variant="secondary"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => document.getElementById('customer-panel')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <UserRound className="h-4 w-4" />
                Tài khoản khách
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
              <p className="label-caps text-[#0f766e]">Customer Login</p>
              <h2 className="font-display mt-2 text-2xl font-bold">Tài khoản khách hàng</h2>
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
              <p className="label-caps text-[#0f766e]">Loyalty</p>
              <h2 className="font-display mt-2 text-2xl font-bold">Lịch sử tích điểm</h2>
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
              Đăng nhập bằng số điện thoại để xem điểm và lịch sử của bạn.
            </div>
          )}
        </Card>
      </section>

      <section id="menu-section" className="space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="label-caps text-[#0f766e]">Online Menu</p>
            <h2 className="font-display mt-2 text-3xl font-bold">Thực đơn đang bán</h2>
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
          {featured.map((recipe) => (
            <Card key={recipe.id} className="overflow-hidden">
              <div className="aspect-[4/3] overflow-hidden bg-[#edf2f0]">
                <img src={recipe.image} alt={recipe.name} className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]" />
              </div>
              <div className="space-y-4 p-4">
                <div>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {recipe.tags.slice(0, 2).map((tag) => <Badge key={tag} tone="primary">{tag}</Badge>)}
                  </div>
                  <h3 className="font-display text-lg font-bold">{recipe.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#4f5b58]">{recipe.description}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-lg font-bold">{formatCurrency(recipe.price)}</span>
                  <Button size="sm" onClick={() => addToCart(recipe.id)}>
                    <Plus className="h-4 w-4" />
                    Thêm
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section id="order-panel" className="grid gap-6 lg:grid-cols-[1fr_430px]">
        <Card className="p-6">
          <p className="label-caps text-[#0f766e]">Order</p>
          <h2 className="font-display mt-2 text-3xl font-bold">Chọn món</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#4f5b58]">
            Đơn hàng sẽ được ghi vào hồ sơ khách để cập nhật chi tiêu, hạng thành viên và điểm thưởng.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {availableRecipes.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => addToCart(recipe.id)}
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
              <p className="label-caps text-[#0f766e]">Checkout</p>
              <h3 className="font-display mt-1 text-xl font-bold">Giỏ hàng</h3>
            </div>
            <ShoppingBag className="h-6 w-6 text-[#10201f]" />
          </div>

          <form onSubmit={submitOrder} className="mt-5 space-y-5">
            <div className="grid grid-cols-2 rounded-xl border border-[#cbd5d1] bg-[#f8fbfa] p-1">
              {channelOptions.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setChannel(item.id)}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      channel === item.id ? 'bg-white text-[#10201f] shadow-sm' : 'text-[#4f5b58]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 rounded-xl border border-[#cbd5d1] bg-[#f8fbfa] p-1">
              {sourceOptions.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSource(item.id)}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      source === item.id ? 'bg-white text-[#10201f] shadow-sm' : 'text-[#4f5b58]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#cbd5d1] p-6 text-center text-sm text-[#64716d]">Chưa có món trong giỏ.</div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 border-b border-[#edf2f0] pb-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{item.name}</p>
                      <p className="mt-1 text-xs text-[#4f5b58]">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" className="grid h-9 w-9 place-items-center rounded-lg border border-[#cbd5d1]" onClick={() => changeQty(item.id, -1)}>
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                      <button type="button" className="grid h-9 w-9 place-items-center rounded-lg border border-[#cbd5d1]" onClick={() => changeQty(item.id, 1)}>
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <button type="button" className="inline-flex min-h-9 items-center gap-2 text-xs font-semibold text-[#93000a]" onClick={() => setCart([])}>
                <Trash2 className="h-4 w-4" />
                Xóa giỏ
              </button>
            )}

            <div className="grid gap-3">
              <Field label="Họ tên khách">
                <Input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Nguyễn Văn A" required />
              </Field>
              <Field label="Số điện thoại">
                <Input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="09xx xxx xxx" required />
              </Field>
              <Field label="Email">
                <Input type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} placeholder="name@email.com" />
              </Field>
              {channel === 'Pickup' && (
                <Field label="Giờ lấy món">
                  <Input type="time" value={pickupTime} onChange={(event) => setPickupTime(event.target.value)} />
                </Field>
              )}
              {channel === 'Delivery' && (
                <Field label="Địa chỉ nhận hàng">
                  <Input value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} placeholder="Số nhà, đường, phường/xã" required />
                </Field>
              )}
              <Field label="Thanh toán">
                <Select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
                  <option value="Banking">Chuyển khoản</option>
                  <option value="Wallet">Ví điện tử</option>
                  <option value="Card">Thẻ</option>
                  <option value="Cash">Tiền mặt</option>
                </Select>
              </Field>
            </div>

            <div className="rounded-xl bg-[#f8fbfa] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#4f5b58]">Tổng thanh toán</span>
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

            {formError && <div className="rounded-xl bg-[#ffdad6] p-3 text-sm font-semibold text-[#93000a]">{formError}</div>}

            <Button
              type="submit"
              className="w-full"
              disabled={!cart.length || !customerName.trim() || !customerPhone.trim() || (channel === 'Delivery' && !deliveryAddress.trim())}
            >
              Gửi đơn hàng
            </Button>

            {confirmedOrder && (
              <div className="rounded-xl border border-[#b7cdb8] bg-[#dfeadc] p-3 text-sm font-semibold text-[#26442f]">
                Đã tạo đơn {confirmedOrder}. Điểm thưởng đã được ghi vào hồ sơ khách.
              </div>
            )}
          </form>
        </Card>
      </section>
    </div>
  );
}
