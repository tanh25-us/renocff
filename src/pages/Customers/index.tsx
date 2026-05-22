import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Mail, Phone, Search, Trash2, UserPlus } from 'lucide-react';
import PermissionGuard from '../../components/common/PermissionGuard';
import { Badge } from '../../components/ui';
import { Button } from '../../components/ui';
import { Card, CardContent, CardHeader } from '../../components/ui';
import { Field, Input, Select, Textarea } from '../../components/ui';
import { formatCurrency } from '../../lib/utils';
import { useStore } from '../../store';
import { Customer } from '../../types';

const tiers: Array<'All' | Customer['loyaltyTier']> = ['All', 'Bronze', 'Silver', 'Gold', 'Diamond'];

export default function Customers() {
  const { customers, addCustomer, deleteCustomer } = useStore();
  const [query, setQuery] = useState('');
  const [tier, setTier] = useState<'All' | Customer['loyaltyTier']>('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    loyaltyTier: 'Bronze' as Customer['loyaltyTier'],
    notes: '',
  });

  const filtered = useMemo(() => {
    return customers.filter((customer) => {
      const text = `${customer.name} ${customer.phone} ${customer.email}`.toLowerCase();
      return (tier === 'All' || customer.loyaltyTier === tier) && text.includes(query.toLowerCase());
    });
  }, [customers, query, tier]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.phone) return;
    addCustomer({
      ...form,
      totalOrders: 0,
      spentValue: 0,
      notes: form.notes || 'Khách mới của Reno Club.',
    });
    setShowForm(false);
    setForm({ name: '', phone: '', email: '', loyaltyTier: 'Bronze', notes: '' });
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="label-caps text-[#6d5b4c]">Customer Relationship</p>
          <h1 className="font-display mt-2 text-4xl font-bold">Khách hàng Reno Club</h1>
          <p className="mt-2 text-sm text-[#4f4540]">Quản lý hạng thành viên, lịch sử chi tiêu và ghi chú khẩu vị.</p>
        </div>
        <PermissionGuard permission="canManageCustomers" displayMode="hide">
          <Button onClick={() => setShowForm((value) => !value)}>
            <UserPlus className="h-4 w-4" />
            {showForm ? 'Đóng form' : 'Thêm khách'}
          </Button>
        </PermissionGuard>
      </section>

      {showForm && (
        <Card>
          <CardHeader>
            <h2 className="font-display text-xl font-bold">Hồ sơ mới</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-4 lg:grid-cols-2">
              <Field label="Họ tên">
                <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              </Field>
              <Field label="Số điện thoại">
                <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
              </Field>
              <Field label="Email">
                <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </Field>
              <Field label="Hạng">
                <Select value={form.loyaltyTier} onChange={(event) => setForm({ ...form, loyaltyTier: event.target.value as Customer['loyaltyTier'] })}>
                  <option value="Bronze">Bronze</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Diamond">Diamond</option>
                </Select>
              </Field>
              <Field label="Ghi chú khẩu vị" className="lg:col-span-2">
                <Textarea rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
              </Field>
              <div className="lg:col-span-2">
                <Button type="submit">Lưu khách hàng</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-display text-xl font-bold">Danh sách thành viên</h2>
              <p className="mt-1 text-sm text-[#4f4540]">{filtered.length} hồ sơ phù hợp.</p>
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-[#81756f]" />
              <Input className="pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên, SĐT, email" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {tiers.map((item) => (
              <button
                key={item}
                onClick={() => setTier(item)}
                className={`min-h-10 rounded-full border px-4 text-sm font-semibold ${
                  tier === item
                    ? 'border-[#25160e] bg-[#25160e] text-white'
                    : 'border-[#d3c3bd] bg-white text-[#4f4540] hover:bg-[#f6f3f2]'
                }`}
              >
                {item === 'All' ? 'Tất cả' : item}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((customer) => (
              <article key={customer.id} className="rounded-2xl border border-[#d3c3bd] bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="label-caps text-[#81756f]">{customer.id}</p>
                    <h3 className="font-display mt-2 truncate text-xl font-bold">{customer.name}</h3>
                  </div>
                  <Badge tone={customer.loyaltyTier === 'Diamond' ? 'primary' : customer.loyaltyTier === 'Gold' ? 'warning' : 'neutral'}>
                    {customer.loyaltyTier}
                  </Badge>
                </div>

                <div className="mt-5 space-y-2 text-sm text-[#4f4540]">
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {customer.phone}
                  </p>
                  <p className="flex items-center gap-2 truncate">
                    <Mail className="h-4 w-4" />
                    {customer.email || 'Chưa có email'}
                  </p>
                </div>

                <div className="mt-5 rounded-xl bg-[#f6f3f2] p-4">
                  <p className="text-sm leading-6 text-[#4f4540]">{customer.notes}</p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#f0eded] pt-4">
                  <div>
                    <p className="label-caps text-[#81756f]">Số đơn</p>
                    <p className="mt-1 font-display text-xl font-bold">{customer.totalOrders}</p>
                  </div>
                  <div className="text-right">
                    <p className="label-caps text-[#81756f]">Chi tiêu</p>
                    <p className="mt-1 font-display text-xl font-bold">{formatCurrency(customer.spentValue)}</p>
                  </div>
                </div>

                <PermissionGuard permission="canManageCustomers" displayMode="hide">
                  <Button variant="danger" size="sm" className="mt-5 w-full" onClick={() => deleteCustomer(customer.id)}>
                    <Trash2 className="h-4 w-4" />
                    Xóa hồ sơ
                  </Button>
                </PermissionGuard>
              </article>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
