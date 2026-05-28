import { useMemo, useState } from 'react';
import { Clock, Minus, Plus, ReceiptText, Search, ShoppingBag, Trash2, Wifi, Store } from 'lucide-react';
import PermissionGuard from '../../components/common/PermissionGuard';
import { Button, Badge, Card, CardContent, CardHeader, Field, Input, Select } from '../../components/ui';
import { formatCurrency } from '../../lib/utils';
import { PRODUCTS, PRODUCT_CATEGORIES } from '../../lib/products';
import type { ProductCategory } from '../../lib/products';
import { useStore } from '../../store';
import { OrderChannel, OrderStatus, PaymentMethod } from '../../types';

// ── Helpers ────────────────────────────────────────────────────────────────
const STATUS_LABEL: Record<OrderStatus, string> = {
  Pending: 'Mới nhận', Brewing: 'Đang pha', Ready: 'Sẵn sàng', Completed: 'Hoàn tất', Cancelled: 'Đã hủy',
};
const STATUS_NEXT: Partial<Record<OrderStatus, { label: string; next: OrderStatus }>> = {
  Pending:  { label: 'Bắt đầu pha', next: 'Brewing' },
  Brewing:  { label: 'Hoàn thành',  next: 'Ready' },
  Ready:    { label: 'Giao xong',   next: 'Completed' },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const tone = status === 'Completed' ? 'success' : status === 'Brewing' ? 'warning' : status === 'Cancelled' ? 'danger' : status === 'Ready' ? 'primary' : 'neutral';
  return <Badge tone={tone}>{STATUS_LABEL[status]}</Badge>;
}

type PosCartItem = { id: string; name: string; price: number; quantity: number; image: string };

// ── POS Menu ───────────────────────────────────────────────────────────────
function PosMenu({ onAdd }: { onAdd: (item: Omit<PosCartItem, 'quantity'>) => void }) {
  const { recipes } = useStore();
  const [cat, setCat] = useState<ProductCategory>('all');

  // Lấy availability từ store (đồng bộ với admin toggle)
  const availMap = useMemo(() => {
    const m: Record<string, boolean> = {};
    recipes.forEach((r) => { m[r.name] = r.available; });
    return m;
  }, [recipes]);

  const filtered = useMemo(() =>
    (cat === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.category === cat))
      .filter((p) => availMap[p.name] !== false),
    [cat, availMap],
  );

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Thực đơn POS</h2>
            <p className="mt-1 text-sm text-[#4f4540]">Click món để thêm vào biên lai.</p>
          </div>
          <Badge tone="primary">{filtered.length} món đang bán</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_CATEGORIES.map(({ key, label }) => (
            <button key={key} onClick={() => setCat(key)}
              className={`min-h-9 rounded-full border px-3 text-xs font-semibold transition ${cat === key ? 'border-[#25160e] bg-[#25160e] text-white' : 'border-[#d3c3bd] bg-white text-[#4f4540] hover:bg-[#f6f3f2]'}`}>
              {label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <button key={p.id} onClick={() => onAdd({ id: p.id, name: p.name, price: p.price, image: p.image })}
              className="flex items-center gap-3 rounded-xl border border-[#d3c3bd] bg-white p-3 text-left transition hover:border-[#81756f] hover:bg-[#f6f3f2]">
              <img src={p.image} alt={p.name} className="h-14 w-14 rounded-lg object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{p.name}</span>
                <span className="mt-1 block font-display text-sm font-bold text-[#25160e]">{formatCurrency(p.price)}</span>
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Order Queue (Kanban) ───────────────────────────────────────────────────
function OrderQueue() {
  const { orders, activeOutletId, updateOrderStatus } = useStore();
  const [query, setQuery] = useState('');

  const visible = orders.filter((o) => {
    const sameOutlet = o.outletId === activeOutletId;
    const sameQuery = !query || [o.id, o.customerName, o.customerPhone || ''].join(' ').toLowerCase().includes(query.toLowerCase());
    return sameOutlet && sameQuery;
  });

  const columns: { title: string; statuses: OrderStatus[]; nextStatus?: OrderStatus }[] = [
    { title: 'ĐANG CHỜ', statuses: ['Pending'], nextStatus: 'Brewing' },
    { title: 'ĐANG PHA CHẾ', statuses: ['Brewing'], nextStatus: 'Completed' },
    { title: 'HOÀN THÀNH', statuses: ['Ready', 'Completed'] },
  ];

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="space-y-4 shrink-0">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-display text-xl font-bold">Hàng chờ đơn hàng</h2>
            <p className="mt-1 text-sm text-[#4f4540]">Cập nhật trạng thái theo quy trình (Kanban).</p>
          </div>
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-[#81756f]" />
            <Input className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm mã đơn, tên, SĐT" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {columns.map(col => {
            const colOrders = visible.filter(o => col.statuses.includes(o.status));
            return (
              <div key={col.title} className="flex flex-col rounded-2xl bg-[#f6f3f2] border border-[#d3c3bd] p-4 h-[600px]">
                <div className="mb-4 flex items-center justify-between px-1">
                  <h3 className="font-display text-base font-bold text-[#25160e]">{col.title}</h3>
                  <Badge tone="neutral">{colOrders.length}</Badge>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {colOrders.length === 0 ? (
                    <div className="text-center text-xs text-[#81756f] mt-4">Không có đơn hàng</div>
                  ) : colOrders.map(order => {
                    const isOnline = order.source === 'Website' || order.source === 'MobileApp';
                    return (
                      <div key={order.id} className="rounded-xl border border-[#d3c3bd] bg-white p-4 shadow-sm transition hover:border-[#6d5b4c]">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <p className="font-display text-base font-bold text-[#25160e]">{order.id}</p>
                          <Badge tone={isOnline ? 'primary' : 'neutral'}>
                            {isOnline ? <><Wifi className="mr-1 inline h-3 w-3" />Online</> : <><Store className="mr-1 inline h-3 w-3" />Tại quán</>}
                          </Badge>
                        </div>
                        <p className="text-sm font-bold text-[#1b1c1c]">{order.customerName}</p>
                        {order.customerPhone && <p className="text-xs text-[#81756f]">{order.customerPhone}</p>}
                        <div className="my-3 border-t border-dashed border-[#d3c3bd] pt-3">
                          <p className="text-xs leading-5 text-[#4f4540]">
                            {order.items.map(i => `${i.name} x${i.quantity}`).join(' · ')}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-[#25160e]">{formatCurrency(order.total)}</span>
                          {col.nextStatus && (
                            <PermissionGuard permission="canManageOrders" displayMode="overlay">
                              <Button size="sm" onClick={() => updateOrderStatus(order.id, col.nextStatus!)} className="h-8 px-3 text-xs">
                                Chuyển →
                              </Button>
                            </PermissionGuard>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Orders Page ────────────────────────────────────────────────────────────
export default function Orders() {
  const { customers, outlets, activeOutletId, addOrder } = useStore();
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [channel, setChannel] = useState<OrderChannel>('DineIn');
  const [pickupTime, setPickupTime] = useState('10:00');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [receiptId, setReceiptId] = useState('');
  const [formError, setFormError] = useState('');

  const activeOutlet = outlets.find((o) => o.id === activeOutletId) || outlets[0];
  const total = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);

  const addToCart = (item: Omit<PosCartItem, 'quantity'>) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const changeQty = (id: string, delta: number) => {
    setCart((prev) => prev.map((c) => c.id === id ? { ...c, quantity: c.quantity + delta } : c).filter((c) => c.quantity > 0));
  };

  const submitOrder = () => {
    setFormError('');
    if (!cart.length) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      setFormError('Cần có họ tên và số điện thoại để tạo đơn.');
      return;
    }
    try {
      const order = addOrder({
        customerName,
        customerPhone,
        channel,
        pickupTime: channel === 'Pickup' ? pickupTime : undefined,
        source: 'POS',
        items: cart.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
        status: 'Pending',
        total,
        outletId: activeOutletId,
        paymentMethod,
      });
      setReceiptId(order.id);
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Không thể tạo đơn.');
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <p className="label-caps text-[#6d5b4c]">POS Orders</p>
        <h1 className="font-display mt-2 text-4xl font-bold">Đặt hàng và điều phối quầy</h1>
        <p className="mt-2 text-sm text-[#4f4540]">{activeOutlet.name} · {activeOutlet.address}</p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* Left: POS Menu + Order Queue */}
        <div className="space-y-6">
          <PosMenu onAdd={addToCart} />
          <OrderQueue />
        </div>

        {/* Right: POS Cart / Receipt */}
        <aside>
          <Card className="sticky top-24 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="label-caps text-[#6d5b4c]">Biên lai POS</p>
                <h2 className="font-display mt-1 text-2xl font-bold">Tạo đơn mới</h2>
              </div>
              <ReceiptText className="h-6 w-6 text-[#25160e]" />
            </div>

            {/* Channel toggle */}
            <div className="mt-5 grid grid-cols-2 rounded-xl border border-[#d3c3bd] bg-[#f6f3f2] p-1">
              {[['DineIn', 'Tại quán'], ['Pickup', 'Pickup']].map(([key, label]) => (
                <button key={key} type="button"
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${channel === key ? 'bg-white text-[#25160e] shadow-sm' : 'text-[#4f4540]'}`}
                  onClick={() => setChannel(key as OrderChannel)}>
                  {label}
                </button>
              ))}
            </div>

            {/* Cart items */}
            <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#d3c3bd] p-5 text-center text-sm text-[#81756f]">
                  <ShoppingBag className="mx-auto mb-2 h-7 w-7 opacity-40" />
                  Giỏ đang trống
                </div>
              ) : cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 border-b border-[#f0eded] pb-3">
                  <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{item.name}</p>
                    <p className="text-xs text-[#4f4540]">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="grid h-8 w-8 place-items-center rounded-lg border border-[#d3c3bd]" onClick={() => changeQty(item.id, -1)}>
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                    <button className="grid h-8 w-8 place-items-center rounded-lg border border-[#d3c3bd]" onClick={() => changeQty(item.id, 1)}>
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <button className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#93000a]" onClick={() => setCart([])}>
                <Trash2 className="h-3.5 w-3.5" /> Xóa giỏ
              </button>
            )}

            {/* Customer info */}
            <div className="mt-4 space-y-3">
              <Field label="Khách quen">
                <Select value="" onChange={(e) => {
                  const c = customers.find((x) => x.phone === e.target.value);
                  if (c) { setCustomerName(c.name); setCustomerPhone(c.phone); }
                }}>
                  <option value="">Chọn nhanh</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.phone}>{c.name} · {c.loyaltyTier}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Tên khách">
                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Tên khách" />
              </Field>
              <Field label="Số điện thoại">
                <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="09xx xxx xxx" />
              </Field>
              {channel === 'Pickup' && (
                <Field label="Giờ lấy">
                  <Input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} />
                </Field>
              )}
              <Field label="Thanh toán">
                <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
                  <option value="Cash">Tiền mặt</option>
                  <option value="Card">Thẻ POS</option>
                  <option value="Banking">Chuyển khoản</option>
                  <option value="Wallet">Ví điện tử</option>
                </Select>
              </Field>
            </div>

            {/* Total */}
            <div className="mt-4 rounded-xl bg-[#f6f3f2] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#4f4540]">Tổng</span>
                <span className="font-display text-2xl font-bold">{formatCurrency(total)}</span>
              </div>
            </div>

            {formError && <p className="mt-3 rounded-xl bg-[#ffdad6] px-3 py-2 text-sm font-semibold text-[#93000a]">{formError}</p>}

            <PermissionGuard permission="canManageOrders" displayMode="inline-alert">
              <Button className="mt-4 w-full" disabled={!cart.length || !customerName.trim() || !customerPhone.trim()} onClick={submitOrder}>
                Xuất biên lai
              </Button>
            </PermissionGuard>

            {receiptId && (
              <div className="mt-3 rounded-xl border border-[#b7cdb8] bg-[#dfeadc] p-3 text-sm font-semibold text-[#26442f]">
                ✓ Đơn {receiptId} đã vào hàng chờ.
              </div>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
