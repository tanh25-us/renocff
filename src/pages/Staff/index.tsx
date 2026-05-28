import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Search, Edit2, Trash2, X, Award, Phone, UserCheck } from 'lucide-react';
import PermissionGuard from '../../components/common/PermissionGuard';
import { Badge, Button, Card, CardContent, CardHeader, Field, Input, Select } from '../../components/ui';
import { useStore } from '../../store';
import { Barista } from '../../types';

const ROLE_LABELS: Record<Barista['role'], string> = {
  Manager: 'Quản lý cửa hàng',
  'Head Barista': 'Trưởng ca pha chế',
  'Senior Barista': 'Barista cấp cao',
  Roaster: 'Thợ rang cà phê',
  Apprentice: 'Nhân viên học việc'
};

interface ExtendedBarista extends Barista {
  code: string;
  gender: string;
  phone: string;
  status: 'Đang làm' | 'Nghỉ việc';
}

export default function StaffPage() {
  const { baristas, outlets, updateBaristaRole } = useStore();
  
  // Local list with extended fields to support ID code, gender, and phone number
  const [localBaristas, setLocalBaristas] = useState<ExtendedBarista[]>(() => {
    const defaultDetails: Record<string, { code: string; gender: string; phone: string; status: 'Đang làm' | 'Nghỉ việc' }> = {
      'bar-1': { code: 'NV-001', gender: 'Nam', phone: '0987654321', status: 'Đang làm' },
      'bar-2': { code: 'NV-002', gender: 'Nữ', phone: '0912345678', status: 'Đang làm' },
      'bar-3': { code: 'NV-003', gender: 'Nam', phone: '0909090909', status: 'Đang làm' },
      'bar-4': { code: 'NV-004', gender: 'Nam', phone: '0888888888', status: 'Đang làm' },
    };

    const safeBaristas = Array.isArray(baristas) ? baristas : [];
    return safeBaristas.map((b) => {
      const extra = defaultDetails[b.id] || { 
        code: `NV-${Math.floor(100 + Math.random() * 900)}`, 
        gender: 'Nam', 
        phone: '0901234567', 
        status: 'Đang làm' 
      };
      return {
        ...b,
        code: extra.code,
        gender: extra.gender,
        phone: extra.phone,
        status: extra.status,
      };
    });
  });

  const [query, setQuery] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  // Form states
  const [form, setForm] = useState({
    code: '',
    name: '',
    gender: 'Nam',
    phone: '',
    role: 'Apprentice' as Barista['role'],
    activeOutletId: 'out-1',
    status: 'Đang làm' as 'Đang làm' | 'Nghỉ việc',
  });

  const filteredStaff = useMemo(() => {
    const list = Array.isArray(localBaristas) ? localBaristas : [];
    return list.filter((b) => {
      const nameMatch = b.name.toLowerCase().includes(query.toLowerCase());
      const codeMatch = b.code.toLowerCase().includes(query.toLowerCase());
      const phoneMatch = b.phone.toLowerCase().includes(query.toLowerCase());
      return nameMatch || codeMatch || phoneMatch;
    });
  }, [localBaristas, query]);

  const openAddModal = () => {
    setModalMode('add');
    setSelectedStaffId(null);
    setForm({
      code: `NV-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      gender: 'Nam',
      phone: '',
      role: 'Apprentice',
      activeOutletId: outlets[0]?.id || 'out-1',
      status: 'Đang làm',
    });
    setShowModal(true);
  };

  const openEditModal = (staff: ExtendedBarista) => {
    setModalMode('edit');
    setSelectedStaffId(staff.id);
    setForm({
      code: staff.code,
      name: staff.name,
      gender: staff.gender,
      phone: staff.phone,
      role: staff.role,
      activeOutletId: staff.activeOutletId || 'out-1',
      status: staff.status,
    });
    setShowModal(true);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) return;

    if (modalMode === 'add') {
      const newId = `bar-${Date.now()}`;
      const newStaff: ExtendedBarista = {
        id: newId,
        code: form.code.trim(),
        name: form.name.trim(),
        gender: form.gender,
        phone: form.phone.trim() || '0901234567',
        role: form.role,
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
        productivity: 90,
        mood: 'Focused',
        skills: ['Pha chế', 'Phục vụ'],
        activeOutletId: form.activeOutletId,
        status: form.status,
      };
      setLocalBaristas((prev) => [...prev, newStaff]);
    } else if (modalMode === 'edit' && selectedStaffId) {
      setLocalBaristas((prev) =>
        prev.map((b) =>
          b.id === selectedStaffId
            ? { 
                ...b, 
                code: form.code.trim(),
                name: form.name.trim(), 
                gender: form.gender,
                phone: form.phone.trim(),
                role: form.role, 
                activeOutletId: form.activeOutletId,
                status: form.status
              }
            : b
        )
      );
      updateBaristaRole(selectedStaffId, form.role);
    }

    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa nhân viên này khỏi hệ thống?')) {
      setLocalBaristas((prev) => prev.filter((b) => b.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="label-caps text-[#6d5b4c]">Human Resources</p>
          <h1 className="font-display mt-2 text-4xl font-bold">Quản lý nhân sự</h1>
          <p className="mt-2 text-sm text-[#4f4540]">Quản lý thông tin chi tiết, giới tính, số điện thoại và vai trò nhân ca trực thuộc hệ thống.</p>
        </div>
        <PermissionGuard permission="canManageShifts" displayMode="hide">
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4" />
            Thêm nhân viên mới
          </Button>
        </PermissionGuard>
      </section>

      {/* Modal Popup Form for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#fcf9f8] shadow-2xl animate-fade-in border border-[#d3c3bd]">
            <div className="bg-[#25160e] p-6 text-white relative">
              <h2 className="font-display text-xl font-bold">
                {modalMode === 'add' ? 'Thêm nhân viên mới' : 'Chỉnh sửa nhân viên'}
              </h2>
              <p className="mt-1 text-xs text-[#dec1b3]">
                Điền đầy đủ thông tin nhân sự dưới đây để cập nhật hệ thống.
              </p>
              <button onClick={() => setShowModal(false)} className="absolute right-4 top-4 text-[#dec1b3] hover:text-white transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid gap-4 grid-cols-2">
                <Field label="Mã nhân viên">
                  <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="VD: NV-101" required />
                </Field>
                <Field label="Giới tính">
                  <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </Select>
                </Field>
              </div>

              <Field label="Họ và tên">
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ví dụ: Nguyễn Văn A" required />
              </Field>

              <Field label="Số điện thoại">
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Ví dụ: 0912 345 678" required />
              </Field>

              <div className="grid gap-4 grid-cols-2">
                <Field label="Vai trò">
                  <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })}>
                    <option value="Manager">Quản lý cửa hàng</option>
                    <option value="Head Barista">Trưởng ca pha chế</option>
                    <option value="Senior Barista">Barista cấp cao</option>
                    <option value="Roaster">Thợ rang cà phê</option>
                    <option value="Apprentice">Nhân viên học việc</option>
                  </Select>
                </Field>

                <Field label="Chi nhánh trực">
                  <Select value={form.activeOutletId} onChange={(e) => setForm({ ...form, activeOutletId: e.target.value })}>
                    {outlets.map((outlet) => (
                      <option key={outlet.id} value={outlet.id}>
                        {outlet.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field label="Trạng thái làm việc">
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
                  <option value="Đang làm">Đang làm việc</option>
                  <option value="Nghỉ việc">Đang tạm nghỉ / Nghỉ việc</option>
                </Select>
              </Field>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#d3c3bd]">
                <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Hủy</Button>
                <Button type="submit">Lưu lại</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Table Card */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-display text-xl font-bold">Danh sách nhân viên hệ thống</h2>
              <p className="mt-1 text-sm text-[#4f4540]">Tổng số {filteredStaff.length} nhân sự trực tuyến.</p>
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-[#81756f]" />
              <Input className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm bằng tên, mã hoặc SĐT..." />
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {filteredStaff && Array.isArray(filteredStaff) && filteredStaff.length > 0 ? (
            <table className="w-full border-collapse text-left text-sm text-[#4f4540]">
              <thead>
                <tr className="border-b border-[#d3c3bd] bg-[#f6f3f2] font-semibold text-[#25160e]">
                  <th className="px-4 py-3.5">Mã NV</th>
                  <th className="px-4 py-3.5">Họ tên</th>
                  <th className="px-4 py-3.5">Giới tính</th>
                  <th className="px-4 py-3.5">Số điện thoại</th>
                  <th className="px-4 py-3.5">Vai trò</th>
                  <th className="px-4 py-3.5">Chi nhánh trực thuộc</th>
                  <th className="px-4 py-3.5">Trạng thái</th>
                  <th className="px-4 py-3.5 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0eded]">
                {filteredStaff.map((staff) => {
                  const outlet = outlets.find((o) => o.id === staff.activeOutletId);
                  return (
                    <tr key={staff.id} className="hover:bg-[#fcf9f8] transition">
                      <td className="px-4 py-4 font-mono font-bold text-xs text-[#25160e]">{staff.code}</td>
                      <td className="px-4 py-4 font-bold text-[#25160e]">{staff.name}</td>
                      <td className="px-4 py-4 text-xs font-semibold text-[#4f4540]">{staff.gender}</td>
                      <td className="px-4 py-4 text-xs font-mono flex items-center gap-1 text-[#25160e] mt-1">
                        <Phone className="h-3 w-3 text-[#81756f]" />
                        <span>{staff.phone}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f4dbc9]/50 px-2.5 py-0.5 text-xs font-semibold text-[#25160e]">
                          <Award className="h-3.5 w-3.5 shrink-0" />
                          {ROLE_LABELS[staff.role] || staff.role}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs font-medium">
                        Reno Coffee - {outlet ? outlet.address.split(',')[0] : 'Trụ sở chính'}
                      </td>
                      <td className="px-4 py-4">
                        <Badge tone={staff.status === 'Đang làm' ? 'success' : 'danger'}>
                          {staff.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="secondary" size="sm" onClick={() => openEditModal(staff)}>
                            <Edit2 className="h-3.5 w-3.5" /> Sửa
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(staff.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10 text-[#81756f] font-semibold">
              Chưa có dữ liệu nhân viên.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
