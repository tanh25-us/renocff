import { useMemo } from 'react';
import { ArrowUpRight, Coffee, ReceiptText, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { Badge, Card, CardContent, CardHeader, MetricCard } from '../../components/ui';
import { formatCompactCurrency, formatCurrency, percent } from '../../lib/utils';
import { useStore } from '../../store';

export default function Dashboard() {
  const { outlets, customers, orders, recipes } = useStore();
  const stats = useMemo(() => {
    const dailyRevenue = outlets.reduce((sum, outlet) => sum + outlet.salesToday, 0);
    const weeklyRevenue = Math.round(dailyRevenue * 6.7);
    const itemSales = new Map<string, { name: string; quantity: number; revenue: number }>();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const current = itemSales.get(item.name) || { name: item.name, quantity: 0, revenue: 0 };
        current.quantity += item.quantity;
        current.revenue += item.quantity * item.price;
        itemSales.set(item.name, current);
      });
    });

    return {
      dailyRevenue,
      weeklyRevenue,
      orderCount: orders.length,
      activeOrders: orders.filter((order) => !['Completed', 'Cancelled'].includes(order.status)).length,
      pickupOrders: orders.filter((order) => order.channel === 'Pickup').length,
      completedOrders: orders.filter((order) => order.status === 'Completed').length,
      avgTicket: orders.length ? Math.round(orders.reduce((sum, order) => sum + order.total, 0) / orders.length) : 0,
      bestSellers: Array.from(itemSales.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 4),
      weeklySeries: [0.62, 0.71, 0.77, 0.74, 0.86, 0.91, 1].map((ratio, index) => ({
        label: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][index],
        value: Math.round((weeklyRevenue * ratio) / 7),
      })),
      productMix: recipes.slice().sort((a, b) => b.soldToday - a.soldToday).slice(0, 5),
    };
  }, [orders, outlets, recipes]);

  const maxValue = Math.max(...stats.weeklySeries.map((item) => item.value), 1);
  const points = stats.weeklySeries.map((item, index) => ({
    ...item,
    x: 24 + index * 76,
    y: 170 - (item.value / maxValue) * 130,
  }));
  const path = points.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <div className="space-y-6">
      <section>
        <p className="label-caps text-[#6d5b4c]">Tổng quan kinh doanh</p>
        <div className="mt-2 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">Dashboard doanh thu Reno</h1>
            <p className="mt-2 text-sm text-[#4f4540]">Doanh thu hôm nay, doanh thu tuần, đơn hàng và sản phẩm bán chạy.</p>
          </div>
          <Badge tone="primary">Đồng bộ POS · Live</Badge>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <MetricCard
          label="Tổng doanh thu hôm nay"
          value={formatCurrency(stats.dailyRevenue)}
          helper={<span className="inline-flex items-center gap-1 text-[#26442f]"><ArrowUpRight className="h-3.5 w-3.5" />+12.5% so với hôm qua</span>}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <MetricCard label="Tổng số đơn hàng" value={stats.orderCount} helper={`${stats.activeOrders} đơn đang xử lý`} icon={<ShoppingBag className="h-5 w-5" />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-xl font-bold">Biểu đồ doanh thu 7 ngày</h2>
              <p className="mt-1 text-sm text-[#4f4540]">Dữ liệu mô phỏng theo ngày trong tuần.</p>
            </div>
            <select className="min-h-10 rounded-lg border border-[#d3c3bd] bg-white px-3 text-sm font-semibold text-[#25160e]">
              <option>Tuần này</option>
              <option>Tuần trước</option>
            </select>
          </CardHeader>
          <CardContent>
            <div className="relative h-[290px] w-full">
              <svg viewBox="0 0 520 220" className="h-full w-full overflow-visible">
                <defs>
                  <linearGradient id="renoArea" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#6d5b4c" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#6d5b4c" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[40, 85, 130, 175].map((y) => (
                  <line key={y} x1="24" y1={y} x2="480" y2={y} stroke="#d3c3bd" strokeDasharray="4 6" strokeOpacity="0.7" />
                ))}
                <polygon points={`24,190 ${path} 480,190`} fill="url(#renoArea)" />
                <polyline points={path} fill="none" stroke="#25160e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                {points.map((point) => (
                  <g key={point.label}>
                    <circle cx={point.x} cy={point.y} r="5" fill="#fcf9f8" stroke="#25160e" strokeWidth="2.5" />
                    <text x={point.x} y="211" textAnchor="middle" className="fill-[#4f4540] text-[11px] font-semibold">{point.label}</text>
                  </g>
                ))}
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold">Sản phẩm bán chạy</h2>
              <p className="mt-1 text-sm text-[#4f4540]">Tính theo đơn đang lưu trong POS.</p>
            </div>
            <Coffee className="h-5 w-5 text-[#25160e]" />
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.bestSellers.map((item, index) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#f0eded] font-display font-bold text-[#25160e]">{index + 1}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{item.name}</p>
                  <p className="mt-1 text-xs text-[#4f4540]">{item.quantity} đơn · {formatCompactCurrency(item.revenue)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <h2 className="font-display text-xl font-bold">Hiệu suất chi nhánh</h2>
            <p className="mt-1 text-sm text-[#4f4540]">Doanh thu, lượng khách và tồn kho hạt trong ngày.</p>
          </CardHeader>
          <CardContent className="space-y-5">
            {outlets.map((outlet) => {
              const share = percent(outlet.salesToday, stats.dailyRevenue);
              return (
                <div key={outlet.id} className="grid gap-3 md:grid-cols-[180px_1fr_120px] md:items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-bold">Reno Coffee</p>
                    <p className="mt-1 text-xs text-[#4f4540] truncate">Reno Coffee - {outlet.address}</p>
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between text-xs font-semibold text-[#4f4540]">
                      <span>{share}% doanh thu</span>
                      <span>Kho {outlet.stockLevel}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#f0eded]">
                      <div className="h-2 rounded-full bg-[#25160e]" style={{ width: `${share}%` }} />
                    </div>
                  </div>
                  <p className="text-right font-display text-lg font-bold">{formatCompactCurrency(outlet.salesToday)}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-48">
            <img
              src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=80"
              alt="Hạt cà phê Reno"
              className="h-full w-full object-cover"
            />
          </div>
          <CardContent>
            <p className="label-caps text-[#6d5b4c]">Product mix</p>
            <div className="mt-4 space-y-3">
              {stats.productMix.map((recipe) => (
                <div key={recipe.id} className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-semibold">{recipe.name}</span>
                  <Badge tone={recipe.available ? 'success' : 'danger'}>{recipe.soldToday} ly</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
