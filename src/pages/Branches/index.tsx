import { useState } from 'react';
import type { FormEvent } from 'react';
import { Clock, MapPin, Phone, Plus, Star, Target, Users } from 'lucide-react';
import PermissionGuard from '../../components/common/PermissionGuard';
import { Badge } from '../../components/ui';
import { Button } from '../../components/ui';
import { Card, CardContent, CardHeader } from '../../components/ui';
import { Field, Input } from '../../components/ui';
import { formatCurrency } from '../../lib/utils';
import { useStore } from '../../store';
import { Outlet } from '../../types';

export default function Branches() {
  const { outlets, activeOutletId, setActiveOutlet, addOutlet, baristas } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    hours: '07:00 - 22:00',
    image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80',
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.address) return;
    const outlet: Outlet = {
      id: `out-${Date.now()}`,
      name: form.name,
      address: form.address,
      phone: form.phone || '024 3555 0000',
      hours: form.hours,
      image: form.image,
      baristaCount: 0,
      stockLevel: 100,
      activeOrdersCount: 0,
      salesToday: 0,
      liveOccupancy: 24,
      rating: 5,
    };
    addOutlet(outlet);
    setShowForm(false);
    setForm({ ...form, name: '', address: '', phone: '' });
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="label-caps text-[#6d5b4c]">Branch Operations</p>
          <h1 className="font-display mt-2 text-4xl font-bold">Chi nhánh Reno Coffee</h1>
          <p className="mt-2 text-sm text-[#4f4540]">Theo dõi doanh thu, lưu lượng khách, tồn kho và nhân sự từng điểm bán.</p>
        </div>
        <PermissionGuard permission="canManageOutlets" displayMode="hide">
          <Button onClick={() => setShowForm((value) => !value)}>
            <Plus className="h-4 w-4" />
            {showForm ? 'Đóng form' : 'Thêm chi nhánh'}
          </Button>
        </PermissionGuard>
      </section>

      {showForm && (
        <Card>
          <CardHeader>
            <h2 className="font-display text-xl font-bold">Chi nhánh mới</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-4 lg:grid-cols-2">
              <Field label="Tên chi nhánh">
                <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              </Field>
              <Field label="Điện thoại">
                <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              </Field>
              <Field label="Địa chỉ" className="lg:col-span-2">
                <Input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} required />
              </Field>
              <Field label="Giờ mở cửa">
                <Input value={form.hours} onChange={(event) => setForm({ ...form, hours: event.target.value })} />
              </Field>
              <Field label="Ảnh chi nhánh">
                <Input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} />
              </Field>
              <div className="lg:col-span-2">
                <Button type="submit">Lưu chi nhánh</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {outlets.map((outlet) => {
          const active = outlet.id === activeOutletId;
          const staff = baristas.filter((barista) => barista.activeOutletId === outlet.id);
          return (
            <Card key={outlet.id} className={`overflow-hidden ${active ? 'ring-2 ring-[#25160e]' : ''}`}>
              <div className="relative h-52">
                <img src={outlet.image} alt={outlet.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#25160e]/82 via-[#25160e]/15 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 text-sm text-[#f4dbc9]">
                    <Star className="h-4 w-4 fill-[#f4dbc9]" />
                    {outlet.rating.toFixed(1)}
                  </div>
                  <h2 className="font-display mt-2 text-2xl font-bold">{outlet.name}</h2>
                </div>
                {active && (
                  <div className="absolute right-4 top-4">
                    <Badge tone="primary" className="gap-1">
                      <Target className="h-3.5 w-3.5" />
                      Đang trực
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="space-y-5">
                <div className="space-y-3 text-sm text-[#4f4540]">
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{outlet.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {outlet.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {outlet.hours}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 rounded-xl bg-[#f6f3f2] p-4 text-center">
                  <div>
                    <p className="label-caps text-[#81756f]">Doanh thu</p>
                    <p className="mt-1 font-display text-lg font-bold">{formatCurrency(outlet.salesToday)}</p>
                  </div>
                  <div>
                    <p className="label-caps text-[#81756f]">Đơn mở</p>
                    <p className="mt-1 font-display text-lg font-bold">{outlet.activeOrdersCount}</p>
                  </div>
                  <div>
                    <p className="label-caps text-[#81756f]">Kho</p>
                    <p className="mt-1 font-display text-lg font-bold">{outlet.stockLevel}%</p>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#4f4540]">
                    <span>Lưu lượng khách</span>
                    <span>{outlet.liveOccupancy}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#f0eded]">
                    <div className="h-2 rounded-full bg-[#25160e]" style={{ width: `${outlet.liveOccupancy}%` }} />
                  </div>
                </div>

                <div>
                  <p className="label-caps text-[#6d5b4c]">Nhân sự trực</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {staff.length ? (
                      staff.map((barista) => (
                        <span key={barista.id} className="inline-flex items-center gap-2 rounded-full border border-[#d3c3bd] bg-white px-3 py-1.5 text-xs font-semibold">
                          <Users className="h-3.5 w-3.5" />
                          {barista.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-[#81756f]">Chưa phân ca.</span>
                    )}
                  </div>
                </div>

                {!active && (
                  <Button variant="secondary" className="w-full" onClick={() => setActiveOutlet(outlet.id)}>
                    Chọn chi nhánh trực
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
