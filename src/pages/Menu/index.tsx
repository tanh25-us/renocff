import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Coffee, Flame, Plus, Search, Trash2 } from 'lucide-react';
import PermissionGuard from '../../components/common/PermissionGuard';
import { Badge, Button, Card, CardContent, CardHeader, Field, Input, Select, Textarea } from '../../components/ui';
import { formatCurrency } from '../../lib/utils';
import { PRODUCTS, PRODUCT_CATEGORIES } from '../../lib/products';
import type { ProductCategory } from '../../lib/products';
import { useStore } from '../../store';
import { Recipe } from '../../types';

export default function MenuPage() {
  const { recipes, beans, addRecipe, deleteRecipe, toggleRecipeAvailability, updateBeanQty } = useStore();
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', price: '65000', description: '',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80',
  });

  // Merge PRODUCTS (client data) với availability từ store
  const mergedProducts = useMemo(() => {
    const availMap: Record<string, boolean> = {};
    recipes.forEach((r) => { availMap[r.name] = r.available; });
    return PRODUCTS.map((p) => ({
      ...p,
      available: availMap[p.name] !== false,
      // Tìm recipe tương ứng để lấy soldToday
      soldToday: recipes.find((r) => r.name === p.name)?.soldToday ?? 0,
      recipeId: recipes.find((r) => r.name === p.name)?.id,
    }));
  }, [recipes]);

  const filtered = useMemo(() => {
    return mergedProducts.filter((p) => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchQuery = !query || `${p.name} ${p.description}`.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [activeCategory, query, mergedProducts]);

  const createRecipe = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    const recipe: Recipe = {
      id: `rec-${Date.now()}`,
      name: form.name,
      type: 'Coffee',
      origin: 'Reno House Blend',
      description: form.description || 'Món mới trong bộ thực đơn Reno.',
      image: form.image,
      price: Number(form.price) || 0,
      roast: 'Medium',
      grindSetting: 3,
      extractionTime: 30,
      waterTemp: 93,
      ratio: '1:2',
      acidity: 3, body: 3, sweetness: 3, bitterness: 2,
      soldToday: 0,
      available: true,
      tags: ['New'],
      instructions: ['Chuẩn bị nguyên liệu theo định lượng Reno.', 'Kiểm tra hương vị trước khi phục vụ.'],
    };
    addRecipe(recipe);
    setShowForm(false);
    setForm((c) => ({ ...c, name: '', description: '' }));
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="label-caps text-[#6d5b4c]">Menu Management</p>
          <h1 className="font-display mt-2 text-4xl font-bold">Thực đơn quán cà phê</h1>
          <p className="mt-2 text-sm text-[#4f4540]">Quản lý trạng thái bán và tồn kho hạt.</p>
        </div>
        <PermissionGuard permission="canManageRecipes" displayMode="hide">
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" />
            {showForm ? 'Đóng form' : 'Thêm món'}
          </Button>
        </PermissionGuard>
      </section>

      {showForm && (
        <Card>
          <CardHeader><h2 className="font-display text-xl font-bold">Món mới</h2></CardHeader>
          <CardContent>
            <form onSubmit={createRecipe} className="grid gap-4 lg:grid-cols-3">
              <Field label="Tên món">
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên đồ uống" required />
              </Field>
              <Field label="Giá VND">
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </Field>
              <Field label="Ảnh sản phẩm">
                <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              </Field>
              <Field label="Mô tả" className="lg:col-span-3">
                <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field>
              <div className="lg:col-span-3"><Button type="submit">Lưu món</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-display text-xl font-bold">Danh sách món</h2>
              <p className="mt-1 text-sm text-[#4f4540]">{filtered.length} món · Click badge để bật/tắt bán</p>
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-[#81756f]" />
              <Input className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm tên món" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRODUCT_CATEGORIES.map(({ key, label }) => (
              <button key={key} onClick={() => setActiveCategory(key)}
                className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition ${activeCategory === key ? 'border-[#25160e] bg-[#25160e] text-white' : 'border-[#d3c3bd] bg-white text-[#4f4540] hover:bg-[#f6f3f2]'}`}>
                {label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product) => (
              <article key={product.id} className="overflow-hidden rounded-2xl border border-[#d3c3bd] bg-white">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#f0eded]">
                  <img src={product.image} alt={product.name}
                    className={`h-full w-full object-cover transition-opacity duration-300 ${product.available ? 'opacity-100' : 'opacity-50'}`} />
                  {!product.available && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">Hết hàng</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-1.5">
                        <PermissionGuard permission="canManageRecipes" displayMode="hide">
                          <button
                            onClick={() => product.recipeId && toggleRecipeAvailability(product.recipeId)}
                            title={product.available ? 'Click để đặt Hết hàng' : 'Click để Bật bán'}
                            className="focus:outline-none"
                          >
                            <Badge tone={product.available ? 'success' : 'danger'}>
                              {product.available ? '● Đang bán' : '○ Hết hàng'}
                            </Badge>
                          </button>
                        </PermissionGuard>
                        <Badge tone="neutral">{product.category}</Badge>
                      </div>
                      <h3 className="font-display text-lg font-bold">{product.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#4f4540]">{product.description}</p>
                    </div>
                    <p className="shrink-0 font-display text-lg font-bold">{formatCurrency(product.price)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#f6f3f2] p-3 text-center">
                    <div>
                      <p className="label-caps text-[#81756f]">Đã bán hôm nay</p>
                      <p className="text-sm font-bold">{product.soldToday} ly</p>
                    </div>
                    <div>
                      <p className="label-caps text-[#81756f]">Nhóm</p>
                      <p className="truncate text-sm font-bold capitalize">{product.category}</p>
                    </div>
                  </div>

                  <PermissionGuard permission="canManageRecipes" displayMode="hide">
                    {product.recipeId && (
                      <Button variant="danger" size="sm" onClick={() => deleteRecipe(product.recipeId!)}>
                        <Trash2 className="h-4 w-4" /> Xóa
                      </Button>
                    )}
                  </PermissionGuard>
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
