import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Clock, Minus, Plus, ReceiptText, Search, ShoppingBag, Trash2 } from 'lucide-react';
import PermissionGuard from '../../components/common/PermissionGuard';
import { Button } from '../../components/ui';
import { Badge } from '../../components/ui';
import { Card, CardContent, CardHeader } from '../../components/ui';
import { Field, Input, Select } from '../../components/ui';
import { formatCurrency, nextOrderStatus } from '../../lib/utils';
import { useStore } from '../../store';
import { OrderChannel, OrderItem, OrderStatus, PaymentMethod } from '../../types';

type CartItem = OrderItem & { id: string };

const statusFilters: Array<'All' | OrderStatus> = ['All', 'Pending', 'Brewing', 'Ready', 'Completed'];

function StatusBadge({ status }: { status: OrderStatus }) {
  const label: Record<OrderStatus, string> = {
    Pending: 'Mới nhận',
    Brewing: 'Đang pha',
    Ready: 'Sẵn sàng',
    Completed: 'Hoàn tất',
    Cancelled: 'Đã hủy',
  };
  const tone = status === 'Completed' ? 'success' : status === 'Brewing' ? 'warning' : status === 'Cancelled' ? 'danger' : status === 'Ready' ? 'primary' : 'neutral';
  return <Badge tone={tone}>{label[status]}</Badge>;
}

export default function Orders() {
  const { recipes, orders, customers, outlets, activeOutletId, addOrder, updateOrderStatus } = useStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [channel, setChannel] = useState<OrderChannel>('DineIn');
  const [pickupTime, setPickupTime] = useState('10:00');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');
  const [filter, setFilter] = useState<'All' | OrderStatus>('All');
  const [query, setQuery] = useState('');
  const [receiptId, setReceiptId] = useState('');

  const activeOutlet = outlets.find((outlet) => outlet.id === activeOutletId) || outlets[0];
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const visibleOrders = orders.filter((order) => {
    const sameOutlet = order.outletId === activeOutletId;
    const sameStatus = filter === 'All' || order.status === filter;
    const sameQuery = !query || [order.id, order.customerName, order.customerPhone || ''].join(' ').toLowerCase().includes(query.toLowerCase());
    return sameOutlet && sameStatus && sameQuery;
  });

  const addToCart = (recipeId: string) => {
    const recipe = recipes.find((item) => item.id === recipeId);
    if (!recipe || !recipe.available) return;
    setCart((items) => {
      const current = items.find((item) => item.id === recipe.id);
      if (current) return items.map((item) => (item.id === recipe.id ? { ...item, quantity: item.quantity + 1 } : item));
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

  const chooseCustomer = (phone: string) => {
    const customer = customers.find((item) => item.phone === phone);
    if (!customer) return;
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
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
    setReceiptId(order.id);
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <div className="space-y-6">
        <section>
          <p className="label-caps text-[#6d5b4c]">POS Orders</p>
          <h1 className="font-display mt-2 text-4xl font-bold">Đặt hàng và điều phối quầy</h1>
          <p className="mt-2 text-sm text-[#4f4540]">{activeOutlet.name} · {activeOutlet.address}</p>
        </section>

        <Card>
          <CardHeader className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-xl font-bold">Thực đơn POS</h2>
              <p className="mt-1 text-sm text-[#4f4540]">Chọn món để tạo hóa đơn tại quầy.</p>
            </div>
            <Badge tone="primary">{recipes.filter((item) => item.available).length} món đang bán</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe) => (
                <button
                  key={recipe.id}
                  onClick={() => addToCart(recipe.id)}
                  disabled={!recipe.available}
                  className="flex min-h-[104px] items-center gap-3 rounded-xl border border-[#d3c3bd] bg-white p-3 text-left transition hover:border-[#81756f] hover:bg-[#f6f3f2] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <img src={recipe.image} alt={recipe.name} className="h-16 w-16 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{recipe.name}</span>
                    <span className="mt-1 block text-xs text-[#4f4540]">{recipe.type}</span>
                    <span className="mt-2 block font-display text-sm font-bold">{formatCurrency(recipe.price)}</span>
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div>
                <h2 className="font-display text-xl font-bold">Hàng chờ đơn hàng</h2>
                <p className="mt-1 text-sm text-[#4f4540]">Cập nhật trạng thái từ mới nhận đến hoàn tất.</p>
              </div>
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-[#81756f]" />
                <Input className="pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm mã đơn, tên, SĐT" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`min-h-10 rounded-full border px-4 text-sm font-semibold ${
                    filter === status ? 'border-[#25160e] bg-[#25160e] text-white' : 'border-[#d3c3bd] bg-white text-[#4f4540] hover:bg-[#f6f3f2]'
                  }`}
                >
                  {status === 'All' ? 'Tất cả' : status}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {visibleOrders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#d3c3bd] p-8 text-center text-sm text-[#81756f]">Không có đơn phù hợp.</div>
            ) : (
              visibleOrders.map((order) => (
                <div key={order.id} className="rounded-xl border border-[#d3c3bd] bg-white p-4">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-lg font-bold">{order.id}</p>
                        <StatusBadge status={order.status} />
                        <Badge tone={order.channel === 'Pickup' ? 'primary' : 'neutral'}>
                          {order.channel === 'Pickup' ? `Pickup ${order.pickupTime || ''}` : 'Uống tại quán'}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm font-semibold">{order.customerName}</p>
                      <p className="mt-1 text-xs leading-5 text-[#4f4540]">
                        {order.items.map((item) => `${item.name} x${item.quantity}`).join(' · ')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 md:justify-end">
                      <div className="text-right">
                        <p className="font-display text-lg font-bold">{formatCurrency(order.total)}</p>
                        <p className="mt-1 flex items-center justify-end gap-1 text-xs text-[#4f4540]">
                          <Clock className="h-3.5 w-3.5" />
                          {order.orderTime}
                        </p>
                      </div>
                      {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                        <PermissionGuard permission="canManageOrders" displayMode="overlay">
                          <Button
                            onClick={() => updateOrderStatus(order.id, nextOrderStatus(order.status) as OrderStatus)}
                            className="whitespace-nowrap"
                          >
                            Cập nhật
                          </Button>
                        </PermissionGuard>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-6">
        <Card className="sticky top-24 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="label-caps text-[#6d5b4c]">Biên lai</p>
              <h2 className="font-display mt-1 text-2xl font-bold">Tạo đơn mới</h2>
            </div>
            <ReceiptText className="h-6 w-6 text-[#25160e]" />
          </div>

          <form onSubmit={submitOrder} className="mt-5 space-y-5">
            <div className="grid grid-cols-2 rounded-xl border border-[#d3c3bd] bg-[#f6f3f2] p-1">
              {[
                ['DineIn', 'Tại quán'],
                ['Pickup', 'Pickup'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                    channel === key ? 'bg-white text-[#25160e] shadow-sm' : 'text-[#4f4540]'
                  }`}
                  onClick={() => setChannel(key as OrderChannel)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#d3c3bd] p-6 text-center text-sm text-[#81756f]">
                  <ShoppingBag className="mx-auto mb-2 h-8 w-8" />
                  Giỏ đang trống.
                </div>
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
              <Field label="Khách quen">
                <Select value="" onChange={(event) => chooseCustomer(event.target.value)}>
                  <option value="">Chọn nhanh</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.phone}>{customer.name} · {customer.loyaltyTier}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Tên khách">
                <Input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Tên khách" />
              </Field>
              <Field label="Số điện thoại">
                <Input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="09xx xxx xxx" />
              </Field>
              {channel === 'Pickup' && (
                <Field label="Giờ lấy">
                  <Input type="time" value={pickupTime} onChange={(event) => setPickupTime(event.target.value)} />
                </Field>
              )}
              <Field label="Thanh toán">
                <Select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
                  <option value="Card">Thẻ POS</option>
                  <option value="Banking">Chuyển khoản</option>
                  <option value="Wallet">Ví điện tử</option>
                  <option value="Cash">Tiền mặt</option>
                </Select>
              </Field>
            </div>

            <div className="rounded-xl bg-[#f6f3f2] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#4f4540]">Tổng</span>
                <span className="font-display text-2xl font-bold">{formatCurrency(total)}</span>
              </div>
            </div>

            <PermissionGuard permission="canManageOrders" displayMode="inline-alert">
              <Button type="submit" className="w-full" disabled={!cart.length}>
                Xuất biên lai
              </Button>
            </PermissionGuard>

            {receiptId && (
              <div className="rounded-xl border border-[#b7cdb8] bg-[#dfeadc] p-3 text-sm font-semibold text-[#26442f]">
                Đơn {receiptId} đã vào hàng chờ.
              </div>
            )}
          </form>
        </Card>
      </aside>
    </div>
  );
}
