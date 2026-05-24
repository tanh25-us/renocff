export type ProductCategory = 'all' | 'coffee' | 'coldbrew' | 'tea' | 'matcha';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: ProductCategory;
  tags: string[];
  image: string;
}

export const PRODUCTS: Product[] = [
  { id: 'p-1',  name: 'Phin đen đá',           price: 35000, category: 'coffee',   tags: ['Signature', 'Đậm vị'],     description: 'Robusta Đà Lạt rang mộc, đen đậm, uống lạnh với đá viên.',                        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=85' },
  { id: 'p-2',  name: 'Phin sữa đá',           price: 45000, category: 'coffee',   tags: ['Best Seller', 'Đậm vị'],   description: 'Phin Robusta đậm, sữa đặc béo ngậy, đá viên — cốc cà phê sáng quen thuộc.',        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=85' },
  { id: 'p-3',  name: 'Bạc xỉu',               price: 45000, category: 'coffee',   tags: ['Classic', 'Ngọt nhẹ'],    description: 'Sữa nhiều hơn cà phê, vị thanh dịu — lựa chọn của những ai mới uống cà phê.',      image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=85' },
  { id: 'p-4',  name: 'Cafe Latte',             price: 65000, category: 'coffee',   tags: ['Latte art', 'Hot'],        description: 'Espresso chiết xuất chuẩn, sữa tươi microfoam mịn — vị cân bằng, thơm dịu.',       image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=600&q=85' },
  { id: 'p-5',  name: 'Cappuccino',             price: 65000, category: 'coffee',   tags: ['Classic', 'Hot'],          description: 'Tỷ lệ vàng espresso — sữa — foam, lớp bọt mịn dày — chuẩn vị Ý.',                image: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?auto=format&fit=crop&w=600&q=85' },
  { id: 'p-6',  name: 'Americano',              price: 55000, category: 'coffee',   tags: ['Ít ngọt', 'Iced'],         description: 'Espresso pha loãng với nước lạnh, giữ nguyên body và hậu vị đắng nhẹ dễ chịu.',    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=85' },
  { id: 'p-7',  name: 'Cold Brew Truyền thống', price: 65000, category: 'coldbrew', tags: ['Best Seller', 'Ít ngọt'],  description: 'Ủ lạnh 18 giờ với hạt Colombia, vị trái cây nhẹ, hậu vị mật ong.',                image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=85' },
  { id: 'p-8',  name: 'Cold Brew Cam Sả',       price: 72000, category: 'coldbrew', tags: ['New', 'Sparkling'],        description: 'Cold brew pha cam tươi và sả — thanh mát, thơm dịu, giải nhiệt tốt.',             image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=85' },
  { id: 'p-9',  name: 'Cold Brew Macchiato',    price: 75000, category: 'coldbrew', tags: ['Trending', 'Béo ngậy'],    description: 'Cold brew đậm, lớp sữa tươi đổ nhẹ lên trên — phân tầng đẹp mắt, vị béo mịn.',    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=85' },
  { id: 'p-10', name: 'Trà Đào Cam Sả',         price: 55000, category: 'tea',      tags: ['Best Seller', 'Mát lạnh'], description: 'Trà đào thơm, cam tươi và sả — thức uống giải nhiệt số 1 mùa hè.',              image: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=600&q=85' },
  { id: 'p-11', name: 'Trà Vải Lài',            price: 55000, category: 'tea',      tags: ['New', 'Thơm dịu'],         description: 'Vải tươi ngọt, hương lài thanh — vị trà nhẹ nhàng, dễ uống.',                    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=85' },
  { id: 'p-12', name: 'Trà Ô Long Sen',         price: 60000, category: 'tea',      tags: ['Premium', 'Ít ngọt'],      description: 'Ô long Đài Loan ủ đậm, hương sen thanh khiết — vị trà tinh tế, hậu vị ngọt.',    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=85' },
  { id: 'p-13', name: 'Matcha Latte',           price: 72000, category: 'matcha',   tags: ['Hot', 'Thơm dịu'],         description: 'Matcha Uji Nhật Bản, sữa tươi microfoam — vị đắng nhẹ, thơm cỏ xanh đặc trưng.', image: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=600&q=85' },
  { id: 'p-14', name: 'Trà Xanh Đá Xay',       price: 69000, category: 'matcha',   tags: ['Iced', 'Trending'],        description: 'Matcha xay nhuyễn với đá và sữa — mịn lạnh, ngọt thanh, giải nhiệt tức thì.',     image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=85' },
  { id: 'p-15', name: 'Cacao Đá Xay',          price: 65000, category: 'matcha',   tags: ['Ngọt nhẹ', 'Iced'],        description: 'Cacao nguyên chất xay với đá và sữa tươi — béo ngậy, thơm chocolate, dễ uống.',   image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=85' },
];

export const PRODUCT_CATEGORIES: { key: ProductCategory; label: string }[] = [
  { key: 'all',      label: 'Tất cả' },
  { key: 'coffee',   label: 'Coffee' },
  { key: 'coldbrew', label: 'Cold Brew' },
  { key: 'tea',      label: 'Trà' },
  { key: 'matcha',   label: 'Matcha & Đá xay' },
];
