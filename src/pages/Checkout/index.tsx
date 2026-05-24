import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  CheckCircle2,
  Gift,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  UserRound,
} from 'lucide-react';
import { Badge, Button, Card, Field, Input, Select } from '../../components/ui';
import { formatCurrency } from '../../lib/utils';
import { normalizeCustomerPhone } from '../../services/customer.service';
import { useStore } from '../../store';
import { LoyaltyReward, OrderChannel, PaymentMethod } from '../../types';

const REWARD_OPTIONS: LoyaltyReward[] = [
  {
    id: 'reward-cookie',
    name: 'Cookie hạnh nhân',
    points: 80,
    description: 'Một phần cookie tặng kèm đơn hàng.',
  },
  {
    id: 'reward-cold-brew',
    name: 'Cold Brew mini',
    points: 140,
    description: 'Một chai Cold Brew 250ml.',
  },
  {
    id: 'reward-tumbler',
    name: 'Ly giữ nhiệt Reno',
    points: 320,
    description: 'Quà thành viên số lượng giới hạn.',
  },
];

const channelOptions: Array<{ id: OrderChannel; label: string; icon: typeof ShoppingBag }> = [
  { id: 'Pickup', label: 'Nhận tại quán', icon: ShoppingBag },
  { id: 'Delivery', label: 'Giao hàng', icon: Truck },
];

export default function Checkout() {
  const {
    outlets,
    activeOutletId,
    customerCart,
    updateCustomerCartItemQuantity,
    clearCustomerCart,
    currentCustomer,
    loginCustomer,
    addOrder,
    redeemCustomerReward,
  } = useStore();
  const [channel, setChannel] = useState<OrderChannel>('Pickup');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Banking');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [pickupTime, setPickupTime] = useState('09:30');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedRewardId, setSelectedRewardId] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState('');

  const activeOutlet = outlets.find((outlet) => outlet.id === activeOutletId) || outlets[0];
  const subtotal = useMemo(
    () => customerCart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [customerCart],
  );
  const cartCount = useMemo(() => customerCart.reduce((sum, item) => sum + item.quantity, 0), [customerCart]);
  const pendingPoints = Math.floor(subtotal / 10000);
  const selectedReward = REWARD_OPTIONS.find((reward) => reward.id === selectedRewardId);
  const normalizedInputPhone = normalizeCustomerPhone(customerPhone);
  const hasMatchingCustomerSession =
    !!currentCustomer && normalizeCustomerPhone(currentCustomer.phone) === normalizedInputPhone;
  const canRedeemSelectedReward =
    !!currentCustomer && !!selectedReward && currentCustomer.pointsBalance >= selectedReward.points;

  useEffect(() => {
    if (!currentCustomer) return;
    setCustomerName(currentCustomer.name);
    setCustomerPhone(currentCustomer.phone);
    setCustomerEmail(currentCustomer.email || '');
  }, [currentCustomer]);

  useEffect(() => {
    if (!selectedReward) return;
    if (!currentCustomer || currentCustomer.pointsBalance < selectedReward.points) {
      setSelectedRewardId('');
    }
  }, [currentCustomer, selectedReward]);

  const identifyCustomer = () => {
    setCustomerMessage('');
    setFormError('');

    const customer = loginCustomer({
      phone: customerPhone,
      name: customerName,
      email: customerEmail,
    });

    if (!customer) {
      setFormError('Nhập số điện thoại đã đăng ký, hoặc nhập thêm họ tên để tạo hồ sơ khách hàng mới.');
      return;
    }

    setCustomerMessage(`Đã nhận diện hồ sơ ${customer.name}. Điểm hiện có: ${customer.pointsBalance}.`);
  };

  const submitOrder = (event: FormEvent) => {
    event.preventDefault();
    setFormError('');
    setConfirmedOrder('');
    setCustomerMessage('');

    const name = customerName.trim();
    const phone = customerPhone.trim();
    const email = customerEmail.trim();
    const address = deliveryAddress.trim();

    if (!customerCart.length) {
      setFormError('Giỏ hàng đang trống. Vui lòng chọn món trước khi thanh toán.');
      return;
    }

    if (!name || !phone) {
      setFormError('Cần có họ tên và số điện thoại khách hàng trước khi đặt hàng.');
      return;
    }

    if (!normalizedInputPhone) {
      setFormError('Số điện thoại khách hàng chưa hợp lệ.');
      return;
    }

    if (channel === 'Delivery' && !address) {
      setFormError('Đơn giao hàng cần có địa chỉ nhận hàng.');
      return;
    }

    let customerForOrder = currentCustomer;
    if (!hasMatchingCustomerSession) {
      customerForOrder = loginCustomer({ phone, name, email });
      if (!customerForOrder) {
        setFormError('Không thể tạo hồ sơ khách hàng từ thông tin hiện tại.');
        return;
      }
    }

    if (selectedReward && customerForOrder.pointsBalance < selectedReward.points) {
      setFormError('Điểm loyalty hiện có không đủ để đổi quà đã chọn.');
      return;
    }

    try {
      const orderItems = selectedReward
        ? [
            ...customerCart,
            {
              id: selectedReward.id,
              name: `${selectedReward.name} (quà đổi điểm)`,
              price: 0,
              quantity: 1,
            },
          ]
        : customerCart;

      const order = addOrder({
        customerName: name,
        customerPhone: phone,
        customerEmail: email || undefined,
        channel,
        pickupTime: channel === 'Pickup' ? pickupTime : undefined,
        deliveryAddress: channel === 'Delivery' ? address : undefined,
        source: 'Website',
        items: orderItems,
        status: 'Pending',
        total: subtotal,
        outletId: activeOutletId,
        paymentMethod,
        redeemedReward: selectedReward,
      });

      if (selectedReward) {
        redeemCustomerReward(selectedReward, order.id);
      }

      clearCustomerCart();
      setSelectedRewardId('');
      setConfirmedOrder(order.id);
      if (channel === 'Delivery') setDeliveryAddress('');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Không thể tạo đơn hàng.');
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="label-caps text-[#0f766e]">Thanh toán online</p>
          <h1 className="font-display mt-2 text-4xl font-bold">Thanh toán giỏ hàng cho khách</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[#4f5b58]">
            Khách hàng có thể đặt hàng trên website, chọn nhận tại quán hoặc giao hàng, thanh toán và dùng điểm loyalty để đổi quà.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="primary">{cartCount} món trong giỏ</Badge>
          <Badge tone="success">Nguồn: Website</Badge>
        </div>
      </section>

      <form onSubmit={submitOrder} className="grid gap-6 xl:grid-cols-[1fr_430px]">
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label-caps text-[#0f766e]">Thông tin khách</p>
                <h2 className="font-display mt-2 text-2xl font-bold">Người đặt hàng</h2>
              </div>
              <UserRound className="h-6 w-6 text-[#10201f]" />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <Field label="Họ tên khách">
                <Input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Nguyễn Văn A" required />
              </Field>
              <Field label="Số điện thoại">
                <Input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="09xx xxx xxx" required />
              </Field>
              <Field label="Email">
                <Input type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} placeholder="name@email.com" />
              </Field>
              <div className="flex items-end">
                <Button type="button" variant="secondary" className="w-full" onClick={identifyCustomer}>
                  <Phone className="h-4 w-4" />
                  Kiểm tra điểm
                </Button>
              </div>
            </div>

            {currentCustomer && hasMatchingCustomerSession && (
              <div className="mt-5 grid gap-3 rounded-xl border border-[#cbd5d1] bg-[#f8fbfa] p-4 sm:grid-cols-3">
                <div>
                  <p className="label-caps text-[#0f766e]">Khách hàng</p>
                  <p className="mt-1 truncate text-sm font-bold">{currentCustomer.name}</p>
                </div>
                <div>
                  <p className="label-caps text-[#0f766e]">Điểm loyalty</p>
                  <p className="mt-1 text-sm font-bold">{currentCustomer.pointsBalance}</p>
                </div>
                <div>
                  <p className="label-caps text-[#0f766e]">Hạng</p>
                  <p className="mt-1 text-sm font-bold">{currentCustomer.loyaltyTier}</p>
                </div>
              </div>
            )}

            {customerMessage && (
              <div className="mt-4 rounded-xl border border-[#b7cdb8] bg-[#dfeadc] p-3 text-sm font-semibold text-[#26442f]">
                {customerMessage}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label-caps text-[#0f766e]">Nhận hàng</p>
                <h2 className="font-display mt-2 text-2xl font-bold">Phương thức nhận đơn</h2>
              </div>
              <MapPin className="h-6 w-6 text-[#10201f]" />
            </div>

            <div className="mt-5 grid grid-cols-2 rounded-xl border border-[#cbd5d1] bg-[#f8fbfa] p-1">
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

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <Field label="Chi nhánh xử lý">
                <Input value={`${activeOutlet.name} - ${activeOutlet.address}`} readOnly />
              </Field>
              {channel === 'Pickup' && (
                <Field label="Giờ lấy món">
                  <Input type="time" value={pickupTime} onChange={(event) => setPickupTime(event.target.value)} />
                </Field>
              )}
              {channel === 'Delivery' && (
                <Field label="Địa chỉ nhận hàng" className="lg:col-span-2">
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
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label-caps text-[#0f766e]">Đổi điểm loyalty</p>
                <h2 className="font-display mt-2 text-2xl font-bold">Chọn quà tặng</h2>
              </div>
              <Gift className="h-6 w-6 text-[#10201f]" />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {REWARD_OPTIONS.map((reward) => {
                const disabled = !currentCustomer || currentCustomer.pointsBalance < reward.points;
                const selected = selectedRewardId === reward.id;

                return (
                  <button
                    key={reward.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedRewardId(selected ? '' : reward.id)}
                    className={`min-h-[142px] rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${
                      selected
                        ? 'border-[#0f766e] bg-[#eef8f5] text-[#10201f]'
                        : 'border-[#cbd5d1] bg-white hover:border-[#0f766e] hover:bg-[#f8fbfa]'
                    }`}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span>
                        <span className="block text-sm font-bold">{reward.name}</span>
                        <span className="mt-2 block text-xs leading-5 text-[#4f5b58]">{reward.description}</span>
                      </span>
                      {selected && <CheckCircle2 className="h-5 w-5 shrink-0 text-[#0f766e]" />}
                    </span>
                    <span className="mt-4 inline-flex rounded-full bg-[#f4f7fb] px-3 py-1 text-xs font-bold text-[#475569]">
                      {reward.points} điểm
                    </span>
                  </button>
                );
              })}
            </div>

            {!currentCustomer && (
              <p className="mt-4 text-sm text-[#64716d]">
                Nhập số điện thoại rồi bấm kiểm tra điểm để đổi quà bằng điểm loyalty.
              </p>
            )}
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="sticky top-24 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="label-caps text-[#0f766e]">Giỏ hàng</p>
                <h2 className="font-display mt-1 text-2xl font-bold">Xác nhận đơn</h2>
              </div>
              <ShoppingBag className="h-6 w-6 text-[#10201f]" />
            </div>

            <div className="mt-5 max-h-72 space-y-3 overflow-y-auto pr-1">
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
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="grid h-9 w-9 place-items-center rounded-lg border border-[#cbd5d1]"
                        onClick={() => updateCustomerCartItemQuantity(item.id, -1)}
                        aria-label={`Giảm ${item.name}`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        type="button"
                        className="grid h-9 w-9 place-items-center rounded-lg border border-[#cbd5d1]"
                        onClick={() => updateCustomerCartItemQuantity(item.id, 1)}
                        aria-label={`Tăng ${item.name}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {customerCart.length > 0 && (
              <button type="button" className="mt-3 inline-flex min-h-9 items-center gap-2 text-xs font-semibold text-[#93000a]" onClick={clearCustomerCart}>
                <Trash2 className="h-4 w-4" />
                Xóa giỏ
              </button>
            )}

            {selectedReward && (
              <div className="mt-4 rounded-xl border border-[#cbd5d1] bg-[#f8fbfa] p-3">
                <p className="text-sm font-bold">Quà đổi điểm</p>
                <p className="mt-1 text-xs text-[#4f5b58]">{selectedReward.name} · -{selectedReward.points} điểm</p>
              </div>
            )}

            <div className="mt-5 rounded-xl bg-[#f8fbfa] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#4f5b58]">Tổng thanh toán</span>
                <span className="font-display text-2xl font-bold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-[#0f766e]">
                <span className="font-semibold">Điểm nhận sau đơn</span>
                <span className="font-bold">+{pendingPoints}</span>
              </div>
              {selectedReward && (
                <div className="mt-2 flex items-center justify-between text-sm text-[#93000a]">
                  <span className="font-semibold">Điểm dùng đổi quà</span>
                  <span className="font-bold">-{selectedReward.points}</span>
                </div>
              )}
            </div>

            {formError && <div className="mt-4 rounded-xl bg-[#ffdad6] p-3 text-sm font-semibold text-[#93000a]">{formError}</div>}

            <Button
              type="submit"
              className="mt-5 w-full"
              disabled={
                !customerCart.length ||
                !customerName.trim() ||
                !customerPhone.trim() ||
                (channel === 'Delivery' && !deliveryAddress.trim()) ||
                (!!selectedReward && !canRedeemSelectedReward)
              }
            >
              Gửi đơn hàng
            </Button>

            {confirmedOrder && (
              <div className="mt-4 rounded-xl border border-[#b7cdb8] bg-[#dfeadc] p-3 text-sm font-semibold text-[#26442f]">
                Đã tạo đơn {confirmedOrder}. Đơn đã vào hàng chờ và điểm loyalty đã được cập nhật.
              </div>
            )}
          </Card>
        </aside>
      </form>
    </div>
  );
}
