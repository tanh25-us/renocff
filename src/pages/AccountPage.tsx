import { Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Award, Clock, Coins, ShieldCheck, Ticket, User, ArrowLeft, ArrowUpRight, CheckCircle } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../lib/utils';
import SiteFooter from '../components/common/SiteFooter';

const MOCK_REWARDS = [
  { id: 'rew-1', name: 'Đồ uống Miễn phí (Bất kỳ)', points: 50, desc: 'Đổi 50 điểm lấy 1 ly nước bất kỳ.' },
  { id: 'rew-2', name: 'Bánh Ngọt tự chọn', points: 30, desc: 'Đổi 30 điểm lấy 1 phần Croissant hoặc bánh ngọt.' },
  { id: 'rew-3', name: 'Combo Ăn sáng', points: 70, desc: 'Đổi 70 điểm lấy 1 ly Cà phê phin và 1 bánh mì.' }
];

export default function AccountPage() {
  const { currentCustomer, redeemCustomerReward } = useStore();

  if (!currentCustomer) {
    return <Navigate to="/login" replace />;
  }

  // Next tier progress logic
  const tierProgress = {
    Bronze: { min: 0, max: 1500000, next: 'Silver' },
    Silver: { min: 1500000, max: 4000000, next: 'Gold' },
    Gold: { min: 4000000, max: 8000000, next: 'Diamond' },
    Diamond: { min: 8000000, max: 8000000, next: 'Tối đa' }
  }[currentCustomer.loyaltyTier];

  const pct = tierProgress.max === tierProgress.min 
    ? 100 
    : Math.min(100, ((currentCustomer.spentValue - tierProgress.min) / (tierProgress.max - tierProgress.min)) * 100);

  const handleRedeemItem = (reward: typeof MOCK_REWARDS[0]) => {
    if (currentCustomer.pointsBalance < reward.points) return;
    redeemCustomerReward({
      id: reward.id,
      name: reward.name,
      points: reward.points,
      description: reward.desc
    });
  };

  return (
    <div className="bg-[#fcf9f8] min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
        
        {/* Header Profile Section */}
        <section className="bg-gradient-to-br from-[#25160e] to-[#3c2a21] rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex gap-4 items-center">
            <div className="h-16 w-16 rounded-full bg-[#f4dbc9] flex items-center justify-center text-[#25160e]">
              <User className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h1 className="font-display text-2xl font-extrabold">{currentCustomer.name}</h1>
              <p className="text-xs text-[#dec1b3]">{currentCustomer.phone} · Gia nhập: {currentCustomer.joinedDate || '28/05/2026'}</p>
              <div className="flex gap-2 pt-1.5">
                <span className="rounded-full bg-[#f4dbc9]/20 border border-[#f4dbc9]/30 px-3 py-0.5 text-xs font-bold text-[#f4dbc9]">
                  Hạng {currentCustomer.loyaltyTier}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-2xl p-4 shrink-0 w-full md:w-auto text-center md:text-right border border-white/10">
            <p className="text-xs text-[#dec1b3] font-semibold">Điểm tích lũy hiện có</p>
            <p className="font-display text-4xl font-extrabold text-[#f4dbc9] mt-1">
              {currentCustomer.pointsBalance} <span className="text-sm font-semibold text-white">điểm</span>
            </p>
            <p className="text-[11px] text-[#dec1b3]/80 mt-1">Quy đổi: {formatCurrency(currentCustomer.pointsBalance * 500)} VNĐ</p>
          </div>
        </section>

        {/* Tier Progress */}
        <section className="bg-white rounded-2xl border border-[#d3c3bd] p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-bold text-base text-[#25160e]">Hành trình tích điểm thăng hạng</h3>
            <span className="text-xs text-[#81756f]">Tổng chi tiêu: <strong>{formatCurrency(currentCustomer.spentValue)}</strong></span>
          </div>
          <div className="w-full bg-[#f0eded] h-3 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8 }}
              className="bg-[#6d5b4c] h-full rounded-full"
            />
          </div>
          <div className="flex justify-between text-xs text-[#81756f]">
            <span>Hạng hiện tại: {currentCustomer.loyaltyTier}</span>
            {tierProgress.next !== 'Tối đa' && (
              <span>Cần thêm {formatCurrency(tierProgress.max - currentCustomer.spentValue)} để lên {tierProgress.next}</span>
            )}
          </div>
        </section>

        {/* Two Columns Grid */}
        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
          
          {/* Left Column: Reward Catalog & point history */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#d3c3bd] p-6 shadow-sm space-y-5">
              <h3 className="font-display font-bold text-lg text-[#25160e] flex items-center gap-2">
                <Ticket className="h-5 w-5 text-[#6d5b4c]" />
                <span>Cửa hàng đổi quà Reno Club</span>
              </h3>
              <p className="text-xs text-[#4f4540]">Sử dụng điểm tích lũy của bạn để đổi các phần quà đặc sắc hoặc đồ uống miễn phí:</p>
              
              <div className="space-y-3">
                {MOCK_REWARDS.map((rew) => {
                  const canRedeem = currentCustomer.pointsBalance >= rew.points;
                  return (
                    <div key={rew.id} className="rounded-xl border border-[#d3c3bd] bg-white p-4 flex justify-between items-center gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-[#25160e]">{rew.name}</p>
                        <p className="text-xs text-[#4f4540]">{rew.desc}</p>
                        <p className="text-[11px] font-bold text-[#6d5b4c]">{rew.points} điểm</p>
                      </div>
                      <button
                        disabled={!canRedeem}
                        onClick={() => handleRedeemItem(rew)}
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition shrink-0 ${
                          canRedeem
                            ? 'bg-[#25160e] text-white hover:bg-[#3c2a21]'
                            : 'bg-[#f0eded] text-[#81756f] cursor-not-allowed'
                        }`}
                      >
                        Đổi quà
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Point History */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#d3c3bd] p-6 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-lg text-[#25160e] flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#6d5b4c]" />
                <span>Lịch sử tích/đổi điểm</span>
              </h3>
              
              {currentCustomer.pointHistory && currentCustomer.pointHistory.length > 0 ? (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {currentCustomer.pointHistory.map((item) => (
                    <div key={item.id} className="border-b border-[#f6f3f2] pb-3 last:border-0 last:pb-0 flex justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-[#25160e]">{item.description}</p>
                        <p className="text-[10px] text-[#81756f] mt-0.5">{item.date}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs font-bold ${
                          item.type === 'Earned' ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {item.type === 'Earned' ? '+' : '-'}{item.points} pts
                        </span>
                        <p className="text-[9px] text-[#81756f] mt-0.5">Số dư: {item.balanceAfter}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#81756f] text-center py-10">Chưa có lịch sử giao dịch tích điểm.</p>
              )}
            </div>
          </div>

        </div>

      </div>
      <SiteFooter />
    </div>
  );
}
