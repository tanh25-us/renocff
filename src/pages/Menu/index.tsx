import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Coffee, Flame, Plus, Power, Search, Trash2 } from 'lucide-react';
import PermissionGuard from '../../components/common/PermissionGuard';
import { Badge } from '../../components/ui';
import { Button } from '../../components/ui';
import { Card, CardContent, CardHeader } from '../../components/ui';
import { Field, Input, Select, Textarea } from '../../components/ui';
import { formatCurrency } from '../../lib/utils';
import { useStore } from '../../store';
import { MenuCategory, Recipe } from '../../types';

const categories: Array<'All' | MenuCategory> = ['All', 'Coffee', 'Cold Brew', 'Tea', 'Pastry', 'Retail'];

export default function MenuPage() {
  const { recipes, beans, addRecipe, deleteRecipe, toggleRecipeAvailability, updateBeanQty } = useStore();
  const [activeCategory, setActiveCategory] = useState<'All' | MenuCategory>('All');
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'Coffee' as MenuCategory,
    price: '65000',
    origin: 'Reno House Blend',
    description: '',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80',
  });

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesCategory = activeCategory === 'All' || recipe.type === activeCategory;
      const text = `${recipe.name} ${recipe.origin} ${recipe.description}`.toLowerCase();
      return matchesCategory && text.includes(query.toLowerCase());
    });
  }, [activeCategory, query, recipes]);

  const createRecipe = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    const recipe: Recipe = {
      id: `rec-${Date.now()}`,
      name: form.name,
      type: form.type,
      origin: form.origin,
      description: form.description || 'Món mới trong bộ thực đơn Reno.',
      image: form.image,
      price: Number(form.price) || 0,
      roast: form.type === 'Pastry' || form.type === 'Retail' ? 'None' : 'Medium',
      grindSetting: form.type === 'Pastry' || form.type === 'Retail' ? 0 : 3,
      extractionTime: form.type === 'Cold Brew' ? 64800 : 30,
      waterTemp: form.type === 'Cold Brew' ? 4 : 93,
      ratio: form.type === 'Cold Brew' ? '1:10' : '1:2',
      acidity: 3,
      body: 3,
      sweetness: 3,
      bitterness: 2,
      soldToday: 0,
      available: true,
      tags: ['New'],
      instructions: ['Chuẩn bị nguyên liệu theo định lượng Reno.', 'Kiểm tra hương vị trước khi phục vụ.', 'Ghi nhận phản hồi trong ca.'],
    };
    addRecipe(recipe);
    setShowForm(false);
    setForm((current) => ({ ...current, name: '', description: '' }));
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="label-caps text-[#6d5b4c]">Menu Management</p>
          <h1 className="font-display mt-2 text-4xl font-bold">Thực đơn quán cà phê</h1>
          <p className="mt-2 text-sm text-[#4f4540]">Quản lý món bán, giá, công thức pha và tồn kho hạt.</p>
        </div>
        <PermissionGuard permission="canManageRecipes" displayMode="hide">
          <Button onClick={() => setShowForm((value) => !value)}>
            <Plus className="h-4 w-4" />
            {showForm ? 'Đóng form' : 'Thêm món'}
          </Button>
        </PermissionGuard>
      </section>

      {showForm && (
        <Card>
          <CardHeader>
            <h2 className="font-display text-xl font-bold">Món mới</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={createRecipe} className="grid gap-4 lg:grid-cols-3">
              <Field label="Tên món">
                <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Espresso cam mật ong" required />
              </Field>
              <Field label="Nhóm">
                <Select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as MenuCategory })}>
                  <option value="Coffee">Coffee</option>
                  <option value="Cold Brew">Cold Brew</option>
                  <option value="Tea">Tea</option>
                  <option value="Pastry">Pastry</option>
                  <option value="Retail">Retail</option>
                </Select>
              </Field>
              <Field label="Giá VND">
                <Input type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
              </Field>
              <Field label="Nguồn gốc">
                <Input value={form.origin} onChange={(event) => setForm({ ...form, origin: event.target.value })} />
              </Field>
              <Field label="Ảnh sản phẩm">
                <Input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} />
              </Field>
              <Field label="Mô tả" className="lg:col-span-3">
                <Textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
              </Field>
              <div className="lg:col-span-3">
                <Button type="submit">Lưu món</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-display text-xl font-bold">Danh sách món</h2>
              <p className="mt-1 text-sm text-[#4f4540]">{filteredRecipes.length} món phù hợp.</p>
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-[#81756f]" />
              <Input className="pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm món, hạt, mô tả" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`min-h-10 rounded-full border px-4 text-sm font-semibold ${
                  activeCategory === category
                    ? 'border-[#25160e] bg-[#25160e] text-white'
                    : 'border-[#d3c3bd] bg-white text-[#4f4540] hover:bg-[#f6f3f2]'
                }`}
              >
                {category === 'All' ? 'Tất cả' : category}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredRecipes.map((recipe) => (
              <article key={recipe.id} className="overflow-hidden rounded-2xl border border-[#d3c3bd] bg-white">
                <div className="aspect-[4/3] overflow-hidden bg-[#f0eded]">
                  <img src={recipe.image} alt={recipe.name} className="h-full w-full object-cover" />
                </div>
                <div className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        <Badge tone={recipe.available ? 'success' : 'danger'}>{recipe.available ? 'Đang bán' : 'Tạm ẩn'}</Badge>
                        <Badge tone="neutral">{recipe.type}</Badge>
                      </div>
                      <h3 className="font-display text-lg font-bold">{recipe.name}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#4f4540]">{recipe.description}</p>
                    </div>
                    <p className="shrink-0 font-display text-lg font-bold">{formatCurrency(recipe.price)}</p>
                  </div>

                  <div className="grid grid-cols-4 gap-2 rounded-xl bg-[#f6f3f2] p-3 text-center">
                    <div>
                      <p className="label-caps text-[#81756f]">Xay</p>
                      <p className="text-sm font-bold">{recipe.grindSetting || '-'}</p>
                    </div>
                    <div>
                      <p className="label-caps text-[#81756f]">Nhiệt</p>
                      <p className="text-sm font-bold">{recipe.waterTemp || '-'}°</p>
                    </div>
                    <div>
                      <p className="label-caps text-[#81756f]">Tỷ lệ</p>
                      <p className="truncate text-sm font-bold">{recipe.ratio}</p>
                    </div>
                    <div>
                      <p className="label-caps text-[#81756f]">Bán</p>
                      <p className="text-sm font-bold">{recipe.soldToday}</p>
                    </div>
                  </div>

                  <div>
                    <p className="label-caps text-[#6d5b4c]">Nguồn gốc</p>
                    <p className="mt-1 text-sm font-semibold">{recipe.origin}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <PermissionGuard permission="canManageRecipes" displayMode="hide">
                      <Button variant="secondary" size="sm" onClick={() => toggleRecipeAvailability(recipe.id)}>
                        <Power className="h-4 w-4" />
                        {recipe.available ? 'Tạm ẩn' : 'Bật bán'}
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => deleteRecipe(recipe.id)}>
                        <Trash2 className="h-4 w-4" />
                        Xóa
                      </Button>
                    </PermissionGuard>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <h2 className="font-display text-xl font-bold">Kho hạt</h2>
            <p className="mt-1 text-sm text-[#4f4540]">Theo dõi lô hạt dùng cho thực đơn.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {beans.map((bean) => (
              <div key={bean.id} className="rounded-xl border border-[#d3c3bd] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-bold">{bean.name}</p>
                    <p className="mt-1 text-sm text-[#4f4540]">{bean.region}, {bean.country} · {bean.process}</p>
                  </div>
                  <Badge tone={bean.status === 'Critical' ? 'danger' : bean.status === 'Surplus' ? 'primary' : 'success'}>
                    {bean.quantityKg}kg
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#4f4540]">{bean.notes}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold">Nhật ký rang nhanh</h2>
              <p className="mt-1 text-sm text-[#4f4540]">Cập nhật tồn kho sau mỗi mẻ rang.</p>
            </div>
            <Flame className="h-5 w-5 text-[#25160e]" />
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {beans.map((bean) => (
              <div key={bean.id} className="reno-panel p-4">
                <div className="flex items-center gap-3">
                  <Coffee className="h-5 w-5 text-[#6d5b4c]" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{bean.name}</p>
                    <p className="mt-1 text-xs text-[#4f4540]">Rang gần nhất {bean.lastRoastDate}</p>
                  </div>
                </div>
                <PermissionGuard permission="canManageInventory" displayMode="hide">
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => updateBeanQty(bean.id, -5)}>-5kg</Button>
                    <Button size="sm" onClick={() => updateBeanQty(bean.id, 12)}>+12kg mẻ rang</Button>
                  </div>
                </PermissionGuard>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
