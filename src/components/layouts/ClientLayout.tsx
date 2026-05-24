import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Coffee, LogOut, Minus, Plus, ShoppingBag, Trash2, User, X } from 'lucide-react';
import { useStore } from '../../store';
import { useCartStore } from '../../store/useCartStore';
import { formatCurrency } from '../../lib/utils';
import type { PaymentMethod } from '../../types';

// ── Checkout Panel ─────────────────────────────────────────────────────────
type CheckoutStep = 'cart' | 'checkout' | 'success';

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: string; desc: string }[] = [
  { value: 'Cash',    label: 'Tiền mặt (COD)',         icon: '💵', desc: 'Thanh toán khi nhận hàng' },
  { value: 'Wallet',  label: 'Ví MoMo',                icon: '💜', desc: 'Quét mã QR để thanh toán' },
  { value: 'Banking', label: 'Chuyển khoản / VNPay',   icon: '🏦', desc: 'Quét mã QR ngân hàng' },
];

function CheckoutView({
  totalPrice, onBack, onSuccess, phone,
}: {
  totalPrice: number; onBack: () => void; onSuccess: () => void; phone: string;
}) {
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const showQR = method === 'Wallet' || method === 'Banking';

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex items-center gap-3 border-b border-[#d3c3bd] px-5 py-4">
        <button onClick={onBack} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-[#f6f3f2]">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="font-display text-xl font-bold">Thanh toán</h2>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        {/* Tổng tiền */}
        <div className="rounded-2xl bg-[#25160e] p-5 text-white">
          <p className="text-xs font-semibold text-[#dec1b3]">Tổng đơn hàng</p>
          <p className="font-display mt-1 text-3xl font-extrabold">{formatCurrency(totalPrice)}</p>
          <p className="mt-1 text-xs text-white/60">Đã bao gồm thuế và phí dịch vụ</p>
        </div>

        {/* Phương thức thanh toán */}
        <div>
          <p className="mb-3 text-sm font-bold text-[#1b1c1c]">Phương thức thanh toán</p>
          <div className="space-y-2">
            {PAYMENT_OPTIONS.map((opt) => (
              <label key={opt.value}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${method === opt.value ? 'border-[#25160e] bg-[#f4dbc9]' : 'border-[#d3c3bd] bg-white hover:bg-[#f6f3f2]'}`}>
                <input type="radio" name="payment" value={opt.value}
                  checked={method === opt.value}
                  onChange={() => setMethod(opt.value)}
                  className="sr-only" />
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

        {/* QR Code */}
        {showQR && (
          <div className="rounded-2xl border border-[#d3c3bd] bg-white p-5 text-center">
            <p className="mb-3 text-sm font-bold text-[#1b1c1c]">
              {method === 'Wallet' ? 'Quét mã MoMo' : 'Quét mã ngân hàng'}
            </p>
            <div className="mx-auto mb-4 h-48 w-48 overflow-hidden rounded-xl border border-[#d3c3bd] bg-[#f6f3f2]">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=RENO+COFFEE+PAYMENT&color=25160e&bgcolor=fcf9f8"
                alt="QR Code thanh toán"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="rounded-xl bg-[#f6f3f2] px-4 py-3 text-left">
              <p className="text-xs text-[#4f4540]">Vui lòng quét mã để thanh toán.</p>
              <p className="mt-1 text-xs font-bold text-[#25160e]">
                Nội dung chuyển khoản: RENO {phone}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-[#d3c3bd] p-5">
        <button onClick={onSuccess}
          className="w-full rounded-xl bg-[#25160e] py-3.5 text-sm font-bold text-white hover:bg-[#3c2a21]">
          Xác nhận đặt hàng
        </button>
      </div>
    </div>
  );
}

// ── Success View ───────────────────────────────────────────────────────────
function SuccessView({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#dfeadc]">
        <CheckCircle className="h-10 w-10 text-[#26442f]" />
      </div>
      <div>
        <h2 className="font-display text-2xl font-bold text-[#1b1c1c]">Đặt hàng thành công!</h2>
        <p className="mt-2 text-sm leading-6 text-[#4f4540]">
          Vui lòng chờ nhân viên xác nhận.<br />Điểm thưởng sẽ được cộng sau khi hoàn tất.
        </p>
      </div>
      <div className="w-full space-y-2">
        <button onClick={onClose}
          className="w-full rounded-xl bg-[#25160e] py-3 text-sm font-bold text-white hover:bg-[#3c2a21]">
          Về trang chủ
        </button>
      </div>
    </div>
  );
}

// ── ClientLayout ───────────────────────────────────────────────────────────
export default function ClientLayout() {
  const { currentCustomer, logoutCustomer, addOrder } = useStore();
  const { cartItems, totalItems, totalPrice, updateQuantity, clearCart } = useCartStore();
  const [cartOpen, setCartOpen] = useState(false);
  const [step, setStep] = useState<CheckoutStep>('cart');
  const navigate = useNavigate();

  const handleOpenCart = () => { setStep('cart'); setCartOpen(true); };
  const handleClose = () => { setCartOpen(false); setTimeout(() => setStep('cart'), 300); };

  const handleConfirmOrder = () => {
    if (!currentCustomer) return;
    addOrder({
      customerName: currentCustomer.name,
      customerPhone: currentCustomer.phone,
      customerEmail: currentCustomer.email,
      channel: 'Delivery',
      source: 'Website',
      items: cartItems.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
      status: 'Pending',
      total: totalPrice,
      outletId: 'out-1',
      paymentMethod: 'Banking',
    });
    clearCart();
    setStep('success');
  };

  return (
    <div className="min-h-screen bg-[#fcf9f8]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#d3c3bd] bg-[#fcf9f8]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#25160e]">
              <Coffee className="h-5 w-5 text-[#f4dbc9]" />
            </div>
            <span className="font-display text-lg font-extrabold text-[#25160e]">RENO</span>
          </Link>

          <div className="flex items-center gap-2">
            {currentCustomer ? (
              <div className="flex items-center gap-2">
                <Link to="/profile" className="flex items-center gap-2 rounded-full border border-[#d3c3bd] bg-white px-3 py-1.5 text-sm font-semibold text-[#25160e] hover:bg-[#f6f3f2]">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{currentCustomer.name.split(' ').pop()}</span>
                  <span className="rounded-full bg-[#f4dbc9] px-1.5 py-0.5 text-xs font-bold">{currentCustomer.pointsBalance} đ</span>
                </Link>
                <button onClick={logoutCustomer} className="grid h-9 w-9 place-items-center rounded-full border border-[#d3c3bd] text-[#81756f] hover:bg-[#f6f3f2]" title="Đăng xuất">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="rounded-full border border-[#d3c3bd] bg-white px-4 py-1.5 text-sm font-semibold text-[#25160e] hover:bg-[#f6f3f2]">
                Đăng nhập
              </Link>
            )}

            <button onClick={handleOpenCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#25160e] text-white">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ba1a1a] text-xs font-bold">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <Outlet />

      {/* Cart / Checkout Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button className="absolute inset-0 bg-black/40" onClick={handleClose} />
          <div className="relative flex w-full max-w-sm flex-col bg-white shadow-2xl">

            {/* ── Step: Cart ── */}
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
                      <p className="text-xs">Thêm món từ thực đơn để bắt đầu</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">{item.name}</p>
                            <p className="text-xs text-[#4f4540]">{formatCurrency(item.price)}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button className="grid h-8 w-8 place-items-center rounded-lg border border-[#d3c3bd]" onClick={() => updateQuantity(item.id, -1)}>
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                            <button className="grid h-8 w-8 place-items-center rounded-lg border border-[#d3c3bd]" onClick={() => updateQuantity(item.id, 1)}>
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {cartItems.length > 0 && (
                  <div className="space-y-3 border-t border-[#d3c3bd] p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#4f4540]">Tổng cộng</span>
                      <span className="font-display text-2xl font-bold">{formatCurrency(totalPrice)}</span>
                    </div>
                    <button
                      onClick={() => {
                        if (!currentCustomer) { handleClose(); navigate('/login'); return; }
                        setStep('checkout');
                      }}
                      className="w-full rounded-xl bg-[#25160e] py-3 text-sm font-bold text-white hover:bg-[#3c2a21]">
                      {currentCustomer ? 'Tiến hành thanh toán →' : 'Đăng nhập để đặt hàng'}
                    </button>
                    <button onClick={clearCart} className="flex w-full items-center justify-center gap-2 text-xs font-semibold text-[#93000a]">
                      <Trash2 className="h-3.5 w-3.5" /> Xóa giỏ
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ── Step: Checkout ── */}
            {step === 'checkout' && currentCustomer && (
              <CheckoutView
                totalPrice={totalPrice}
                phone={currentCustomer.phone}
                onBack={() => setStep('cart')}
                onSuccess={handleConfirmOrder}
              />
            )}

            {/* ── Step: Success ── */}
            {step === 'success' && (
              <SuccessView onClose={handleClose} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
