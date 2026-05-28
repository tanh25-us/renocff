import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Minus, Plus, ShoppingBag, Trash2, X, MapPin, Award } from 'lucide-react';
import { useStore } from '../../store';
import { useCartStore } from '../../store/useCartStore';
import { formatCurrency } from '../../lib/utils';
import type { Customer, PaymentMethod, LoyaltyReward } from '../../types';
import SiteHeader from './SiteHeader';

type CheckoutStep = 'cart' | 'checkout' | 'success';

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: string; desc: string }[] = [
  { value: 'Cash',    label: 'Thanh toán tiền mặt (COD)', icon: '💵', desc: 'Thanh toán khi nhận hàng hoặc tại quầy' },
  { value: 'Banking', label: 'Chuyển khoản ngân hàng',    icon: '🏦', desc: 'Quét mã QR chuyển khoản ngân hàng' },
];

function CheckoutView({ totalPrice, onBack, onSuccess, customer }: {
  totalPrice: number; onBack: () => void; onSuccess: (info: { name: string; phone: string; address: string; method: PaymentMethod }, pointsToRedeem?: number) => void; customer: Customer;
}) {
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [name, setName] = useState(customer.name || '');
  const [phone, setPhone] = useState(customer.phone || '');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  
  const [usePoints, setUsePoints] = useState(false);

  // Quy đổi: Cứ 20 điểm = Giảm 10.000 VNĐ. Tương đương 1 điểm = 500 VNĐ.
  const maxPointsMultipleOf20 = Math.floor(customer.pointsBalance / 20) * 20;
  const maxPriceReductionPoints = Math.floor(totalPrice / 500);
  const maxPointsToRedeem = Math.min(maxPointsMultipleOf20, maxPriceReductionPoints);
  
  const discountAmount = usePoints ? maxPointsToRedeem * 500 : 0;
  const finalPrice = Math.max(0, totalPrice - discountAmount);
  const canRedeem = customer.pointsBalance >= 20 && maxPointsToRedeem >= 20;

  const showQR = method === 'Banking';

  const handleSubmit = () => {
    setError('');
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError('Vui lòng điền đầy đủ Tên, Số điện thoại và Địa chỉ giao hàng.');
      return;
    }
    onSuccess({ name, phone, address, method }, usePoints ? maxPointsToRedeem : undefined);
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex items-center gap-3 border-b border-[#d3c3bd] px-5 py-4 shrink-0">
        <button onClick={onBack} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-[#f6f3f2]">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="font-display text-xl font-bold">Thanh toán</h2>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        
        {/* Account & Delivery Info */}
        <div>
          <p className="mb-3 text-sm font-bold text-[#1b1c1c]">Thông tin nhận hàng</p>
          <div className="space-y-3">
            <input type="text" placeholder="Họ và tên" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[#d3c3bd] px-4 py-3 text-sm outline-none focus:border-[#6d5b4c]" />
            <input type="text" placeholder="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-[#d3c3bd] px-4 py-3 text-sm outline-none focus:border-[#6d5b4c]" />
            <textarea placeholder="Địa chỉ giao hàng chi tiết" value={address} onChange={(e) => setAddress(e.target.value)} rows={2}
              className="w-full rounded-xl border border-[#d3c3bd] px-4 py-3 text-sm outline-none focus:border-[#6d5b4c] resize-none" />
          </div>
          {error && <p className="mt-2 text-xs font-semibold text-[#93000a]">{error}</p>}
        </div>

        {/* Reward Points */}
        <div className="rounded-xl border border-[#f4dbc9] bg-[#fff8f4] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-4 w-4 text-[#25160e]" />
            <p className="text-sm font-bold text-[#25160e]">Reno Club - Điểm tích lũy</p>
          </div>
          <p className="text-xs text-[#6d5b4c] mb-3">Bạn đang có <strong>{customer.pointsBalance}</strong> điểm.</p>
          <label className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition ${!canRedeem ? 'opacity-50' : usePoints ? 'border-[#25160e] bg-white' : 'border-[#d3c3bd] bg-white'}`}>
            <div>
              <p className="text-sm font-bold">Sử dụng điểm tích lũy</p>
              <p className="text-xs text-[#81756f]">Quy đổi: {maxPointsToRedeem} điểm = -{formatCurrency(maxPointsToRedeem * 500)}</p>
            </div>
            <input type="checkbox" disabled={!canRedeem} checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} className="h-4 w-4 accent-[#25160e]" />
          </label>
          <p className="text-[10px] text-[#81756f] mt-2">*Tỷ lệ quy đổi: Cứ 20 điểm giảm 10.000 VNĐ.</p>
        </div>

        <div className="rounded-2xl bg-[#25160e] p-5 text-white">
          <p className="text-xs font-semibold text-[#dec1b3]">Tổng đơn hàng</p>
          <p className="font-display mt-1 text-3xl font-extrabold">{formatCurrency(finalPrice)}</p>
          {usePoints && <p className="text-xs text-[#f4dbc9] mt-1 line-through">{formatCurrency(totalPrice)}</p>}
        </div>
        <div>
          <p className="mb-3 text-sm font-bold text-[#1b1c1c]">Phương thức thanh toán</p>
          <div className="space-y-2">
            {PAYMENT_OPTIONS.map((opt) => (
              <label key={opt.value}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${method === opt.value ? 'border-[#25160e] bg-[#f4dbc9]' : 'border-[#d3c3bd] bg-white hover:bg-[#f6f3f2]'}`}>
                <input type="radio" name="payment" value={opt.value} checked={method === opt.value}
                  onChange={() => setMethod(opt.value)} className="sr-only" />
                <span className="text-xl">{opt.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold">{opt.label}</p>
                  <p className="text-xs text-[#4f4540]">{opt.desc}</p>
                </div>
                <div className={`h-4 w-4 rounded-full border-2 transition ${method === opt.value ? 'border-[#25160e] bg-[#25160e]' : 'border-[#d3c3bd]'}`} />
              </label>
            ))}
          </div>
        </div>
        {showQR && (
          <div className="rounded-2xl border border-[#d3c3bd] bg-white p-5 text-center">
            <p className="mb-3 text-sm font-bold">Quét mã ngân hàng</p>
            <div className="mx-auto mb-4 h-48 w-48 overflow-hidden rounded-xl border border-[#d3c3bd]">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=RENO+COFFEE+${phone}&color=25160e&bgcolor=fcf9f8`}
                alt="QR Code" className="h-full w-full object-cover" />
            </div>
            <div className="rounded-xl bg-[#f6f3f2] px-4 py-3 text-left">
              <p className="text-xs text-[#4f4540]">Vui lòng quét mã để chuyển khoản ngân hàng.</p>
              <p className="mt-1 text-xs font-bold text-[#25160e]">Nội dung: RENO {phone}</p>
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-[#d3c3bd] p-5 shrink-0 bg-white z-10">
        <button onClick={handleSubmit} className="w-full rounded-xl bg-[#25160e] py-3.5 text-sm font-bold text-white hover:bg-[#3c2a21]">
          Xác nhận đặt hàng
        </button>
      </div>
    </div>
  );
}

function SuccessView({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#dfeadc]">
        <CheckCircle className="h-10 w-10 text-[#26442f]" />
      </div>
      <div>
        <h2 className="font-display text-2xl font-bold">Đặt hàng thành công!</h2>
        <p className="mt-2 text-sm leading-6 text-[#4f4540]">Vui lòng chờ nhân viên xác nhận.<br />Điểm thưởng sẽ được cộng sau khi hoàn tất.</p>
      </div>
      <button onClick={onClose} className="w-full rounded-xl bg-[#25160e] py-3 text-sm font-bold text-white hover:bg-[#3c2a21]">
        Về trang chủ
      </button>
    </div>
  );
}

export default function ClientLayout() {
  const { currentCustomer, activeOutletId, addOrder, updateCustomer } = useStore();
  const { cartItems, totalItems, totalPrice, updateQuantity, clearCart } = useCartStore();
  const [cartOpen, setCartOpen] = useState(false);
  const [step, setStep] = useState<CheckoutStep>('cart');
  const navigate = useNavigate();

  const handleClose = () => { setCartOpen(false); setTimeout(() => setStep('cart'), 300); };

  const handleConfirmOrder = (info: { name: string; phone: string; address: string; method: PaymentMethod }, pointsToRedeem?: number) => {
    if (!currentCustomer) return;
    const discount = pointsToRedeem ? pointsToRedeem * 500 : 0;
    const finalTotal = Math.max(0, totalPrice - discount);
    const order = addOrder({
      customerName: info.name,
      customerPhone: info.phone,
      customerEmail: currentCustomer.email,
      channel: 'Delivery',
      source: 'Website',
      deliveryAddress: info.address,
      items: cartItems.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
      status: 'Pending',
      total: finalTotal,
      outletId: activeOutletId,
      paymentMethod: info.method,
      redeemedReward: pointsToRedeem ? { id: 'pts-use', name: `Giảm giá tích lũy ${pointsToRedeem} điểm`, points: pointsToRedeem, description: `Giảm giá trực tiếp` } : undefined,
    });
    if (pointsToRedeem) {
      const balanceAfter = currentCustomer.pointsBalance - pointsToRedeem;
      const updated: Customer = {
        ...currentCustomer,
        pointsBalance: balanceAfter,
        pointHistory: [
          {
            id: `pts-use-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            description: `Sử dụng ${pointsToRedeem} điểm giảm giá đơn ${order.id}`,
            orderId: order.id,
            type: 'Redeemed',
            points: pointsToRedeem,
            balanceAfter,
          },
          ...currentCustomer.pointHistory,
        ],
      };
      updateCustomer(updated);
    }
    clearCart();
    setStep('success');
  };

  return (
    <div className="min-h-screen bg-[#fcf9f8]">
      <SiteHeader onCartOpen={() => { setStep('cart'); setCartOpen(true); }} />
      <Outlet />

      {cartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <button className="absolute inset-0 bg-black/40" onClick={handleClose} />
          <div className="relative flex w-full max-w-sm flex-col bg-white shadow-2xl animate-slide-left">
            {step === 'cart' && (
              <>
                <div className="flex items-center justify-between border-b border-[#d3c3bd] px-5 py-4">
                  <div>
                    <h2 className="font-display text-xl font-bold">Giỏ hàng</h2>
                    {totalItems > 0 && <p className="text-xs text-[#81756f]">{totalItems} món</p>}
                  </div>
                  <button onClick={handleClose} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[#f6f3f2]">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                  {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-[#81756f]">
                      <ShoppingBag className="h-12 w-12 opacity-30" />
                      <p className="text-sm font-semibold">Giỏ hàng trống</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover border border-[#d3c3bd]" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-[#1b1c1c]">{item.name}</p>
                            <p className="text-xs font-semibold text-[#6d5b4c]">{formatCurrency(item.price)}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button className="grid h-8 w-8 place-items-center rounded-lg border border-[#d3c3bd] bg-white text-[#4f4540] hover:bg-[#f6f3f2]" onClick={() => updateQuantity(item.id, -1)}>
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-[#1b1c1c]">{item.quantity}</span>
                            <button className="grid h-8 w-8 place-items-center rounded-lg border border-[#d3c3bd] bg-white text-[#4f4540] hover:bg-[#f6f3f2]" onClick={() => updateQuantity(item.id, 1)}>
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {cartItems.length > 0 && (
                  <div className="space-y-3 border-t border-[#d3c3bd] p-5 shrink-0 bg-[#fcf9f8]">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-sm font-semibold text-[#4f4540]">Tổng cộng</span>
                      <span className="font-display text-2xl font-bold text-[#25160e]">{formatCurrency(totalPrice)}</span>
                    </div>
                    <button onClick={() => { if (!currentCustomer) { handleClose(); navigate('/login'); return; } setStep('checkout'); }}
                      className="w-full rounded-xl bg-[#25160e] py-3.5 text-sm font-bold text-white hover:bg-[#3c2a21] shadow-lg">
                      {currentCustomer ? 'Tiến hành thanh toán →' : 'Đăng nhập để đặt hàng'}
                    </button>
                    <button onClick={clearCart} className="flex w-full items-center justify-center gap-2 text-xs font-bold text-[#93000a] hover:underline">
                      <Trash2 className="h-3.5 w-3.5" /> Xóa toàn bộ giỏ
                    </button>
                  </div>
                )}
              </>
            )}
            {step === 'checkout' && currentCustomer && (
              <CheckoutView totalPrice={totalPrice} customer={currentCustomer}
                onBack={() => setStep('cart')} onSuccess={handleConfirmOrder} />
            )}
            {step === 'success' && <SuccessView onClose={handleClose} />}
          </div>
        </div>
      )}
    </div>
  );
}
