import { useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, ReceiptText, ShoppingBag, TrendingUp } from 'lucide-react';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useStore } from '../../store';
import { formatCompactCurrency, formatCurrency } from '../../lib/utils';
import { WEEKLY_REVENUE, TOP_PRODUCTS } from '../../lib/constants';

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, change, icon }: {
  label: string; value: string; change: number; icon: React.ReactNode;
}) {
  const positive = change >= 0;
  return (
    <div className="rounded-2xl border border-[#d3c3bd] bg-white p-6 shadow-[0px_4px_20px_rgba(60,42,33,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#6d5b4c]">{label}</p>
          <p className="font-display mt-3 text-3xl font-bold text-[#1b1c1c]">{value}</p>
          <div className={`mt-3 flex items-center gap-1 text-xs font-semibold ${positive ? 'text-[#26442f]' : 'text-[#81756f]'}`}>
            {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {positive ? '+' : ''}{change}% so với hôm qua
          </div>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f0eded] text-[#25160e]">
          {icon}
        </div>
      </div>
    </div>
  );
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#d3c3bd] bg-white px-4 py-3 shadow-lg">
      <p className="text-xs font-bold text-[#6d5b4c]">{label}</p>
      <p className="font-display mt-1 text-lg font-bold text-[#25160e]">{formatCompactCurrency(payload[0].value)}</p>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { orders, outlets } = useStore();

  const stats = useMemo(() => {
    const dailyRevenue = outlets.reduce((s, o) => s + o.salesToday, 0);
    const orderCount = orders.length;
    const avgTicket = orderCount ? Math.round(orders.reduce((s, o) => s + o.total, 0) / orderCount) : 0;
    return { dailyRevenue, orderCount, avgTicket };
  }, [orders, outlets]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#6d5b4c]">Tổng quan kinh doanh</p>
        <h1 className="font-display mt-2 text-3xl font-bold text-[#1b1c1c]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#81756f]">Doanh thu và hiệu suất hôm nay.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Doanh thu hôm nay" value={formatCurrency(stats.dailyRevenue)} change={12.5} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Số lượng đơn" value={String(stats.orderCount)} change={8.2} icon={<ShoppingBag className="h-5 w-5" />} />
        <StatCard label="Giá trị TB / Đơn" value={formatCurrency(stats.avgTicket)} change={-2.1} icon={<ReceiptText className="h-5 w-5" />} />
      </div>

      {/* Chart + Top Products */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Area Chart */}
        <div className="rounded-2xl border border-[#d3c3bd] bg-white p-6 shadow-[0px_4px_20px_rgba(60,42,33,0.04)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-[#1b1c1c]">Doanh thu 7 ngày</h2>
              <p className="mt-1 text-xs text-[#81756f]">Dữ liệu mô phỏng theo ngày trong tuần</p>
            </div>
            <select className="rounded-lg border border-[#d3c3bd] bg-white px-3 py-2 text-xs font-semibold text-[#25160e] focus:outline-none">
              <option>Tuần này</option>
              <option>Tuần trước</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={WEEKLY_REVENUE} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#25160e" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#25160e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 6" stroke="#d3c3bd" strokeOpacity={0.6} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#81756f', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#81756f' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}tr`} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#d3c3bd', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="revenue" stroke="#25160e" strokeWidth={2.5}
                fill="url(#revenueGrad)" dot={{ r: 4, fill: '#fcf9f8', stroke: '#25160e', strokeWidth: 2.5 }}
                activeDot={{ r: 6, fill: '#25160e' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="rounded-2xl border border-[#d3c3bd] bg-white p-6 shadow-[0px_4px_20px_rgba(60,42,33,0.04)]">
          <h2 className="font-display text-lg font-bold text-[#1b1c1c]">Sản phẩm bán chạy</h2>
          <p className="mt-1 text-xs text-[#81756f]">Top 5 theo số đơn hôm nay</p>
          <div className="mt-6 space-y-4">
            {TOP_PRODUCTS.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#f0eded] font-display text-sm font-bold text-[#25160e]">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#1b1c1c]">{item.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f0eded]">
                      <div className="h-full rounded-full bg-[#25160e]"
                        style={{ width: `${Math.round((item.orders / TOP_PRODUCTS[0].orders) * 100)}%` }} />
                    </div>
                    <span className="shrink-0 text-xs text-[#81756f]">{item.orders} đơn</span>
                  </div>
                </div>
                <p className="shrink-0 font-display text-sm font-bold text-[#25160e]">{formatCompactCurrency(item.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
