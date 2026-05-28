import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Coffee, Flame, Plus, Search, Trash2, Edit2, X } from 'lucide-react';
import PermissionGuard from '../../components/common/PermissionGuard';
import { Badge, Button, Card, CardContent, CardHeader, Field, Input, Select, Textarea } from '../../components/ui';
import { formatCurrency } from '../../lib/utils';
import { PRODUCT_CATEGORIES } from '../../lib/products';
import type { ProductCategory } from '../../lib/products';
import { useStore } from '../../store';
import { Recipe } from '../../types';

// Hardcoded Mock Data to prevent whitescreen render errors
const HARDCODED_MOCK_RECIPES: Recipe[] = [
  {
    id: 'rec-1',
    name: 'Phin đen đá',
    type: 'Coffee',
    origin: 'Robusta Honey Đà Lạt',
    description: 'Robusta Đà Lạt rang mộc, đen đậm, uống lạnh với đá viên.',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=85',
    price: 35000,
    roast: 'Medium',
    grindSetting: 5.0,
    extractionTime: 300,
    waterTemp: 95,
    ratio: '1:5',
    acidity: 1, body: 5, sweetness: 3, bitterness: 4,
    soldToday: 42,
    available: true,
    tags: ['Signature', 'Đậm vị'],
    instructions: ['Cho 20g bột Robusta vào phin.', 'Ủ nở trong 30 giây.', 'Châm nước sôi và chờ chiết xuất.'],
    availableOutlets: ['out-1', 'out-2', 'out-3']
  },
  {
    id: 'rec-2',
    name: 'Phin sữa đá',
    type: 'Coffee',
    origin: 'Robusta Honey Đà Lạt',
    description: 'Phin Robusta đậm, sữa đặc béo ngậy, đá viên — cốc cà phê sáng quen thuộc.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=85',
    price: 45000,
    roast: 'Medium',
    grindSetting: 5.0,
    extractionTime: 300,
    waterTemp: 95,
    ratio: '1:4',
    acidity: 1, body: 5, sweetness: 4, bitterness: 4,
    soldToday: 88,
    available: true,
    tags: ['Best Seller', 'Đậm vị'],
    instructions: ['Cho sữa đặc vào ly trước.', 'Chiết xuất cà phê phin trực tiếp lên sữa đặc.', 'Khuấy đều và thêm đá.'],
    availableOutlets: ['out-1', 'out-2', 'out-3']
  },
  {
    id: 'rec-3',
    name: 'Bạc xỉu',
    type: 'Coffee',
    origin: 'Robusta Blend',
    description: 'Sữa nhiều hơn cà phê, vị thanh dịu — lựa chọn của những ai mới uống cà phê.',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=85',
    price: 45000,
    roast: 'Medium',
    grindSetting: 4.5,
    extractionTime: 25,
    waterTemp: 93,
    ratio: '1:2',
    acidity: 2, body: 3, sweetness: 5, bitterness: 2,
    soldToday: 51,
    available: true,
    tags: ['Classic', 'Ngọt nhẹ'],
    instructions: ['Rót sữa tươi và sữa đặc vào ly.', 'Đánh tạo bọt nhẹ.', 'Rót 1 shot espresso lên bề mặt.'],
    availableOutlets: ['out-1', 'out-2', 'out-3']
  },
  {
    id: 'rec-4',
    name: 'Cold Brew Truyền thống',
    type: 'Cold Brew',
    origin: 'Colombia Huila Anaerobic',
    description: 'Ủ lạnh 18 giờ với hạt Colombia, vị trái cây nhẹ, hậu vị mật ong.',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=85',
    price: 65000,
    roast: 'Light',
    grindSetting: 8.5,
    extractionTime: 64800,
    waterTemp: 4,
    ratio: '1:10',
    acidity: 4, body: 3, sweetness: 5, bitterness: 1,
    soldToday: 22,
    available: true,
    tags: ['Best Seller', 'Ít ngọt'],
    instructions: ['Xay thô hạt Colombia.', 'Ủ lạnh trong bình kín 18 giờ.', 'Lọc bã và phục vụ lạnh.'],
    availableOutlets: ['out-1', 'out-3']
  }
];

export default function MenuPage() {
  const { recipes, beans, addRecipe, updateRecipe, deleteRecipe, toggleRecipeAvailability, updateBeanQty } = useStore();
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');
  const [query, setQuery] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: '',
    price: '65000',
    description: '',
    type: 'Coffee' as Recipe['type'],
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80',
  });

  // Ensure recipes is safe array
  const safeRecipes = useMemo(() => {
    return Array.isArray(recipes) && recipes.length > 0 ? recipes : HARDCODED_MOCK_RECIPES;
  }, [recipes]);



  // Merge items dynamic with the store's recipes
  const mergedProducts = useMemo(() => {
    const list = Array.isArray(safeRecipes) ? safeRecipes : [];
    return list.map((r) => ({
      id: r.id || `rec-${Date.now()}`,
      name: r.name || 'Không tên',
      price: r.price || 0,
      description: r.description || '',
      category: r.type || 'Coffee',
      image: r.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80',
      available: r.available !== false,
      soldToday: r.soldToday ?? 0,
      recipeId: r.id,
    }));
  }, [safeRecipes]);

  const filtered = useMemo(() => {
    const safeFiltered = Array.isArray(mergedProducts) ? mergedProducts : [];
    return safeFiltered.filter((p) => {
      // Map menu category to standard ProductCategory key with safe fallbacks
      const catKey = (p.category || 'Coffee').toString().toLowerCase().replace(/\s+/g, '') as ProductCategory;
      const matchCat = activeCategory === 'all' || catKey === activeCategory;
      const nameStr = p.name || '';
      const descStr = p.description || '';
      const matchQuery = !query || `${nameStr} ${descStr}`.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [activeCategory, query, mergedProducts]);

  const openAddModal = () => {
    setModalMode('add');
    setSelectedRecipeId(null);
    setForm({
      name: '',
      price: '65000',
      description: 'Món mới thơm ngon của nhà Reno.',
      type: 'Coffee',
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80',
    });
    setShowModal(true);
  };

  const openEditModal = (recipe: Recipe) => {
    setModalMode('edit');
    setSelectedRecipeId(recipe.id);
    setForm({
      name: recipe.name || '',
      price: String(recipe.price || 0),
      description: recipe.description || '',
      type: recipe.type || 'Coffee',
      image: recipe.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80',
    });
    setShowModal(true);
  };

  const handleSave = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    if (modalMode === 'add') {
      const newRecipe: Recipe = {
        id: `rec-${Date.now()}`,
        name: form.name,
        type: form.type,
        origin: 'Reno Specialty Crop',
        description: form.description || 'Đồ uống ngon tuyệt từ Reno Coffee.',
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
        instructions: ['Pha chế theo định lượng Reno Coffee.'],
        availableOutlets: ['out-1', 'out-2', 'out-3']
      };
      addRecipe(newRecipe);
    } else if (modalMode === 'edit' && selectedRecipeId) {
      const current = safeRecipes.find(r => r.id === selectedRecipeId);
      if (current) {
        const updatedRecipe: Recipe = {
          ...current,
          name: form.name,
          price: Number(form.price) || 0,
          description: form.description,
          type: form.type,
          image: form.image,
        };
        updateRecipe(updatedRecipe);
      }
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="label-caps text-[#6d5b4c]">Menu Management</p>
          <h1 className="font-display mt-2 text-4xl font-bold">Thực đơn quán cà phê</h1>
          <p className="mt-2 text-sm text-[#4f4540]">Quản lý trạng thái bán, thêm/sửa món ăn và tồn kho hạt của hệ thống.</p>
        </div>
        <PermissionGuard permission="canManageRecipes" displayMode="hide">
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4" />
            Thêm sản phẩm mới
          </Button>
        </PermissionGuard>
      </section>

      {/* Modal Popup Form (Add/Edit) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#fcf9f8] shadow-2xl animate-fade-in border border-[#d3c3bd]">
            <div className="bg-[#25160e] p-6 text-white relative">
              <h2 className="font-display text-xl font-bold">
                {modalMode === 'add' ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}
              </h2>
              <p className="mt-1 text-xs text-[#dec1b3]">
                Điền đầy đủ thông tin chi tiết của món dưới đây để lưu vào thực đơn.
              </p>
              <button onClick={() => setShowModal(false)} className="absolute right-4 top-4 text-[#dec1b3] hover:text-white transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <Field label="Tên đồ uống / món ăn">
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ví dụ: Cà phê cốt dừa" required />
              </Field>
              
              <div className="grid gap-4 grid-cols-2">
                <Field label="Giá bán VND">
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                </Field>
                <Field label="Phân loại">
                  <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })}>
                    <option value="Coffee">Cà phê (Coffee)</option>
                    <option value="Cold Brew">Cold Brew</option>
                    <option value="Tea">Trà (Tea)</option>
                    <option value="Pastry">Bánh ngọt (Pastry)</option>
                    <option value="Retail">Sản phẩm bán lẻ (Retail)</option>
                  </Select>
                </Field>
              </div>

              <Field label="Ảnh sản phẩm (URL)">
                <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} required />
              </Field>
              
              <Field label="Mô tả ngắn">
                <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#d3c3bd]">
                <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Hủy bỏ</Button>
                <Button type="submit">Lưu lại</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-display text-xl font-bold">Danh sách đồ uống & bánh</h2>
              <p className="mt-1 text-sm text-[#4f4540]">{filtered.length} món · Click gạt nút gạt bên dưới để thay đổi trạng thái bán nhanh</p>
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
            {filtered && Array.isArray(filtered) ? (
              filtered.map((product) => {
                const fullRecipe = safeRecipes.find(r => r.id === product.recipeId);
                return (
                  <article key={product.id} className="overflow-hidden rounded-2xl border border-[#d3c3bd] bg-white shadow-sm flex flex-col justify-between animate-fade-in">
                    <div>
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#f0eded]">
                        <img src={product.image} alt={product.name}
                          className={`h-full w-full object-cover transition-opacity duration-300 ${product.available ? 'opacity-100' : 'opacity-50'}`} />
                        {!product.available && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-md">Hết hàng</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="mb-2 flex flex-wrap items-center gap-1.5">
                              <Badge tone={product.available ? 'success' : 'danger'}>
                                {product.available ? '● Đang bán' : '○ Hết hàng'}
                              </Badge>
                              <Badge tone="neutral">{product.category}</Badge>
                            </div>
                            <h3 className="font-display text-lg font-bold truncate text-[#25160e]">{product.name}</h3>
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#4f4540]">{product.description}</p>
                          </div>
                          <p className="shrink-0 font-display text-base font-bold text-[#25160e]">{formatCurrency(product.price)}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#f6f3f2] p-3 text-center text-xs">
                          <div>
                            <p className="label-caps text-[#81756f]">Đã bán</p>
                            <p className="text-sm font-bold mt-0.5">{product.soldToday} ly</p>
                          </div>
                          <div>
                            <p className="label-caps text-[#81756f]">Nhóm</p>
                            <p className="truncate text-sm font-bold mt-0.5">{product.category}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-[#f0eded] space-y-3 shrink-0">
                      {/* Toggle Trạng Thái Nhanh */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#4f4540]">Còn hàng / Mở bán</span>
                        <button
                          type="button"
                          onClick={() => product.recipeId && toggleRecipeAvailability(product.recipeId)}
                          className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            product.available ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              product.available ? 'translate-x-5.5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <PermissionGuard permission="canManageRecipes" displayMode="hide">
                          <Button variant="secondary" size="sm" className="flex-1 gap-1.5" onClick={() => fullRecipe && openEditModal(fullRecipe)}>
                            <Edit2 className="h-3.5 w-3.5" /> Sửa
                          </Button>
                          {product.recipeId && (
                            <Button variant="danger" size="sm" onClick={() => deleteRecipe(product.recipeId!)}>
                              <Trash2 className="h-3.5 w-3.5" /> Xóa
                            </Button>
                          )}
                        </PermissionGuard>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="col-span-full text-center py-10 text-[#81756f] font-semibold bg-white rounded-2xl border border-[#d3c3bd]">
                Chưa có dữ liệu thực đơn.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
