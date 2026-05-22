import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Clock, MapPin, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui';
import { Card } from '../../components/ui';
import { Badge } from '../../components/ui';
import { Field, Input, Select } from '../../components/ui';
import { formatCurrency } from '../../lib/utils';
import { useStore } from '../../store';
import { OrderChannel, OrderItem, PaymentMethod } from '../../types';

type CartItem = OrderItem & { id: string };

export default function Storefront() {
  const { recipes, outlets, activeOutletId, setActiveOutlet, addOrder } = useStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [channel, setChannel] = useState<OrderChannel>('DineIn');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Banking');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupTime, setPickupTime] = useState('09:30');
  const [confirmedOrder, setConfirmedOrder] = useState('');

  const activeOutlet = outlets.find((outlet) => outlet.id === activeOutletId) || outlets[0];
  const featured = recipes.filter((recipe) => recipe.available).slice(0, 4);
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

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

  const submitOrder = (event: FormEvent) => {
    event.preventDefault();
    if (!cart.length) return;

    const order = addOrder({
      customerName: customerName || 'Khách vãng lai',
      customerPhone: customerPhone || undefined,
      channel,
      pickupTime: channel === 'Pickup' ? pickupTime : undefined,
      items: cart,
      status: 'Pending',
      total,
      outletId: activeOutletId,
      paymentMethod,
    });

    setConfirmedOrder(order.id);
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
  };

  return (
    <div className="space-y-12">
      <section className="grid min-h-[540px] overflow-hidden rounded-2xl border border-[#d3c3bd] bg-[#25160e] md:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-between p-7 text-white sm:p-10 lg:p-12">
          <div>
            <p className="label-caps text-[#dec1b3]">Reno Coffee</p>
            <h1 className="font-display mt-5 max-w-xl text-4xl font-extrabold leading-tight sm:text-5xl">
              Nghệ thuật cà phê thủ công trong từng đơn đặt.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#f3f0ef]/80">
              Đặt uống tại quán hoặc chọn giờ lấy món. Mỗi ly được pha theo profile rang và công thức vận hành chuẩn Reno.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                className="bg-white text-[#25160e] hover:bg-[#f4dbc9]"
                onClick={() => document.getElementById('order-panel')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Đặt món
              </Button>
              <Button
                variant="secondary"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Xem thực đơn
              </Button>
            </div>
          </div>

          <div className="mt-10 grid gap-3 text-sm text-[#dec1b3] sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
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
            alt="Ly latte Reno Coffee"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#25160e]/35 to-transparent" />
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="min-h-[360px] overflow-hidden rounded-2xl border border-[#d3c3bd]">
          <img
            src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1400&q=90"
            alt="Không gian quầy Reno Coffee"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex items-center">
          <div className="max-w-xl">
            <p className="label-caps text-[#6d5b4c]">Artisanal Management</p>
            <h2 className="font-display mt-3 text-3xl font-bold leading-tight">Từ quầy bar đến dashboard trong cùng một trải nghiệm.</h2>
            <p className="mt-4 text-sm leading-7 text-[#4f4540]">
              Reno kết hợp trải nghiệm mua cà phê cao cấp với vận hành chính xác: thực đơn, đơn pickup, doanh thu và tồn kho đều được cập nhật trong một hệ thống.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ['342+', 'đơn/tuần'],
                ['4.9/5', 'đánh giá'],
                ['18h', 'cold brew'],
              ].map(([value, label]) => (
                <div key={label} className="reno-panel p-4">
                  <p className="font-display text-2xl font-bold">{value}</p>
                  <p className="label-caps mt-2 text-[#6d5b4c]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="menu-section" className="space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="label-caps text-[#6d5b4c]">Featured Products</p>
            <h2 className="font-display mt-2 text-3xl font-bold">Thực đơn nổi bật</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {outlets.map((outlet) => (
              <button
                key={outlet.id}
                className={`min-h-10 rounded-full border px-4 text-sm font-semibold ${
                  outlet.id === activeOutletId
                    ? 'border-[#25160e] bg-[#25160e] text-white'
                    : 'border-[#d3c3bd] bg-white text-[#4f4540] hover:bg-[#f6f3f2]'
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
              <div className="aspect-[4/3] overflow-hidden bg-[#f0eded]">
                <img src={recipe.image} alt={recipe.name} className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]" />
              </div>
              <div className="space-y-4 p-4">
                <div>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {recipe.tags.slice(0, 2).map((tag) => <Badge key={tag} tone="primary">{tag}</Badge>)}
                  </div>
                  <h3 className="font-display text-lg font-bold">{recipe.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#4f4540]">{recipe.description}</p>
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

      <section id="order-panel" className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <Card className="p-6">
          <p className="label-caps text-[#6d5b4c]">Order Queue</p>
          <h2 className="font-display mt-2 text-3xl font-bold">Đặt hàng trực tiếp hoặc lấy tại quán</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#4f4540]">
            Chọn chi nhánh, thêm món vào giỏ và gửi đơn vào hàng chờ pha chế của Reno.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recipes.filter((recipe) => recipe.available).map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => addToCart(recipe.id)}
                className="flex min-h-[96px] items-center gap-3 rounded-xl border border-[#d3c3bd] bg-white p-3 text-left transition hover:border-[#81756f] hover:bg-[#f6f3f2]"
              >
                <img src={recipe.image} alt={recipe.name} className="h-16 w-16 rounded-lg object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{recipe.name}</span>
                  <span className="mt-1 block text-xs text-[#4f4540]">{formatCurrency(recipe.price)}</span>
                </span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="self-start p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="label-caps text-[#6d5b4c]">Giỏ hàng</p>
              <h3 className="font-display mt-1 text-xl font-bold">Hóa đơn tạm</h3>
            </div>
            <ShoppingBag className="h-6 w-6 text-[#25160e]" />
          </div>

          <form onSubmit={submitOrder} className="mt-5 space-y-5">
            <div className="grid grid-cols-2 rounded-xl border border-[#d3c3bd] bg-[#f6f3f2] p-1">
              {[
                ['DineIn', 'Uống tại quán'],
                ['Pickup', 'Lấy tại quán'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setChannel(key as OrderChannel)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    channel === key ? 'bg-white text-[#25160e] shadow-sm' : 'text-[#4f4540]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#d3c3bd] p-6 text-center text-sm text-[#81756f]">Chưa có món trong giỏ.</div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 border-b border-[#f0eded] pb-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{item.name}</p>
                      <p className="mt-1 text-xs text-[#4f4540]">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" className="grid h-9 w-9 place-items-center rounded-lg border border-[#d3c3bd]" onClick={() => changeQty(item.id, -1)}>
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                      <button type="button" className="grid h-9 w-9 place-items-center rounded-lg border border-[#d3c3bd]" onClick={() => changeQty(item.id, 1)}>
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
              <Field label="Tên khách">
                <Input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Nguyễn Văn A" />
              </Field>
              <Field label="Số điện thoại">
                <Input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="09xx xxx xxx" />
              </Field>
              {channel === 'Pickup' && (
                <Field label="Giờ lấy món">
                  <Input type="time" value={pickupTime} onChange={(event) => setPickupTime(event.target.value)} />
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

            <div className="rounded-xl bg-[#f6f3f2] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#4f4540]">Tổng thanh toán</span>
                <span className="font-display text-2xl font-bold">{formatCurrency(total)}</span>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={!cart.length}>
              Gửi đơn vào quầy
            </Button>

            {confirmedOrder && (
              <div className="rounded-xl border border-[#b7cdb8] bg-[#dfeadc] p-3 text-sm font-semibold text-[#26442f]">
                Đã tạo đơn {confirmedOrder}. Barista sẽ xử lý ngay.
              </div>
            )}
          </form>
        </Card>
      </section>
    </div>
  );
}
