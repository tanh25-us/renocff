import { create } from 'zustand';
import {
  Barista,
  BeanStock,
  CartItem,
  Customer,
  LoyaltyReward,
  LoyaltyPointEntry,
  Order,
  OrderStatus,
  Outlet,
  Recipe,
  RolePermission,
  Shift,
  SystemMessage,
} from '../types';
import { CustomerInput, customerService, normalizeCustomerPhone } from '../services/customer.service';
import { orderService } from '../services/order.service';

export const ROLE_PERMISSIONS: Record<Barista['role'], RolePermission> = {
  Manager: {
    role: 'Manager',
    label: 'Quản lý cửa hàng',
    description: 'Toàn quyền vận hành, theo dõi doanh thu, quản lý đơn hàng, thực đơn, khách hàng và chi nhánh.',
    permissions: {
      canManageRecipes: true,
      canManageInventory: true,
      canManageShifts: true,
      canManageOutlets: true,
      canManageOrders: true,
      canViewAnalytics: true,
      canManageCustomers: true,
    },
  },
  'Head Barista': {
    role: 'Head Barista',
    label: 'Trưởng ca pha chế',
    description: 'Điều phối quầy bar, cập nhật thực đơn, xử lý đơn hàng và xem các chỉ số ca trực.',
    permissions: {
      canManageRecipes: true,
      canManageInventory: true,
      canManageShifts: true,
      canManageOutlets: false,
      canManageOrders: true,
      canViewAnalytics: true,
      canManageCustomers: true,
    },
  },
  'Senior Barista': {
    role: 'Senior Barista',
    label: 'Barista cấp cao',
    description: 'Tập trung vận hành đơn hàng, công thức pha chế và chăm sóc khách quen.',
    permissions: {
      canManageRecipes: true,
      canManageInventory: false,
      canManageShifts: false,
      canManageOutlets: false,
      canManageOrders: true,
      canViewAnalytics: false,
      canManageCustomers: true,
    },
  },
  Roaster: {
    role: 'Roaster',
    label: 'Thợ rang cà phê',
    description: 'Quản lý kho hạt, lô rang và trạng thái nguyên liệu phục vụ thực đơn.',
    permissions: {
      canManageRecipes: false,
      canManageInventory: true,
      canManageShifts: false,
      canManageOutlets: false,
      canManageOrders: false,
      canViewAnalytics: false,
      canManageCustomers: false,
    },
  },
  Apprentice: {
    role: 'Apprentice',
    label: 'Nhân viên học việc',
    description: 'Theo dõi đơn hàng và hỗ trợ thao tác cơ bản tại quầy.',
    permissions: {
      canManageRecipes: false,
      canManageInventory: false,
      canManageShifts: false,
      canManageOutlets: false,
      canManageOrders: true,
      canViewAnalytics: false,
      canManageCustomers: false,
    },
  },
};

interface RenoState {
  currentRole: Barista['role'];
  isLoggedIn: boolean;
  currentUser: Barista | null;
  outlets: Outlet[];
  recipes: Recipe[];
  beans: BeanStock[];
  baristas: Barista[];
  shifts: Shift[];
  orders: Order[];
  customers: Customer[];
  currentCustomer: Customer | null;
  customerCart: CartItem[];
  systemMessages: SystemMessage[];
  activeOutletId: string;
  setRole: (role: Barista['role']) => void;
  setActiveOutlet: (id: string) => void;
  login: (baristaId: string, role: Barista['role']) => void;
  logout: () => void;
  addOutlet: (outlet: Outlet) => void;
  updateOutlet: (outlet: Outlet) => void;
  addRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  toggleRecipeAvailability: (id: string) => void;
  addBeans: (bean: BeanStock) => void;
  updateBeanQty: (id: string, qtyDelta: number) => void;
  addShift: (shift: Shift) => void;
  deleteShift: (id: string) => void;
  updateBaristaRole: (baristaId: string, role: Barista['role']) => void;
  addOrder: (order: Omit<Order, 'id' | 'orderTime'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addCustomerCartItem: (recipeId: string) => void;
  updateCustomerCartItemQuantity: (id: string, qtyDelta: number) => void;
  clearCustomerCart: () => void;
  loginCustomer: (customer: { phone: string; name?: string; email?: string }) => Customer | null;
  logoutCustomer: () => void;
  redeemCustomerReward: (reward: LoyaltyReward, orderId?: string) => Customer | null;
  addCustomer: (customer: CustomerInput) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  dismissMessage: (id: string) => void;
  pushMessage: (title: string, message: string, type: SystemMessage['type']) => void;
}

const IMG = {
  hero: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1600&q=85',
  interior: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1400&q=85',
  bar: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?auto=format&fit=crop&w=1400&q=85',
  coldBrew: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=85',
  latte: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=900&q=85',
  phin: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=85',
  croissant: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=85',
  matcha: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=900&q=85',
  beans: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=85',
  branch: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1400&q=85',
};

const INITIAL_OUTLETS: Outlet[] = [
  {
    id: 'out-1',
    name: 'Reno Flagship Roastery',
    address: '18 Phạm Ngọc Thạch, Đống Đa, Hà Nội',
    image: IMG.interior,
    baristaCount: 8,
    stockLevel: 88,
    activeOrdersCount: 4,
    salesToday: 24500000,
    liveOccupancy: 72,
    phone: '024 3555 0190',
    hours: '06:30 - 22:00',
    rating: 4.9,
  },
  {
    id: 'out-2',
    name: 'Reno Espresso Bar',
    address: '56 Tố Hữu, Hà Đông, Hà Nội',
    image: IMG.branch,
    baristaCount: 5,
    stockLevel: 47,
    activeOrdersCount: 8,
    salesToday: 18250000,
    liveOccupancy: 91,
    phone: '024 3555 0122',
    hours: '07:00 - 21:00',
    rating: 4.7,
  },
  {
    id: 'out-3',
    name: 'Reno Garden Coffee',
    address: '12 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
    image: IMG.bar,
    baristaCount: 4,
    stockLevel: 94,
    activeOrdersCount: 2,
    salesToday: 11800000,
    liveOccupancy: 46,
    phone: '024 3555 0175',
    hours: '08:00 - 22:30',
    rating: 4.8,
  },
];

const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'rec-1',
    name: 'Cold Brew trái cây',
    type: 'Cold Brew',
    origin: 'Colombia Huila Anaerobic',
    description: 'Ủ lạnh 18 giờ, hậu vị trái cây nhiệt đới và mật ong nhẹ.',
    image: IMG.coldBrew,
    price: 69000,
    roast: 'Light',
    grindSetting: 8.5,
    extractionTime: 64800,
    waterTemp: 4,
    ratio: '1:10',
    acidity: 4,
    body: 3,
    sweetness: 5,
    bitterness: 1,
    soldToday: 65,
    available: true,
    tags: ['Best seller', 'Ít ngọt', 'Pickup'],
    instructions: ['Xay thô hạt Colombia.', 'Ủ lạnh trong bình kín 18 giờ.', 'Lọc hai lần, phục vụ cùng đá lớn và lát cam vàng.'],
  },
  {
    id: 'rec-2',
    name: 'Phin sữa đá truyền thống',
    type: 'Coffee',
    origin: 'Robusta Honey Đà Lạt',
    description: 'Gu Việt đậm, sữa đặc béo, cân bằng với đá viên tinh khiết.',
    image: IMG.phin,
    price: 59000,
    roast: 'Medium',
    grindSetting: 5.5,
    extractionTime: 360,
    waterTemp: 95,
    ratio: '1:4',
    acidity: 1,
    body: 5,
    sweetness: 4,
    bitterness: 4,
    soldToday: 98,
    available: true,
    tags: ['Signature', 'Dine-in'],
    instructions: ['Cho 20g bột Robusta vào phin.', 'Ủ nở bằng 20ml nước 95 độ C.', 'Châm nước, chờ nhỏ giọt hoàn tất rồi khuấy với sữa đặc.'],
  },
  {
    id: 'rec-3',
    name: 'Latte hoa hồng',
    type: 'Coffee',
    origin: 'Ethiopia Yirgacheffe Washed',
    description: 'Espresso rang sáng, sữa tươi microfoam và hương hoa hồng thanh.',
    image: IMG.latte,
    price: 72000,
    roast: 'Light',
    grindSetting: 2.2,
    extractionTime: 28,
    waterTemp: 93,
    ratio: '1:2',
    acidity: 4,
    body: 3,
    sweetness: 4,
    bitterness: 2,
    soldToday: 54,
    available: true,
    tags: ['Hot', 'Latte art'],
    instructions: ['Chiết xuất 36g espresso trong 28 giây.', 'Đánh sữa ở 62 độ C.', 'Rót Rosetta, hoàn thiện với syrup hoa hồng.'],
  },
  {
    id: 'rec-4',
    name: 'Espresso tonic',
    type: 'Coffee',
    origin: 'Ethiopia Yirgacheffe Natural',
    description: 'Espresso double shot trên nền tonic lạnh, vị chua sáng và bọt khí sảng khoái.',
    image: IMG.bar,
    price: 65000,
    roast: 'Light',
    grindSetting: 2.0,
    extractionTime: 26,
    waterTemp: 93,
    ratio: '1:2',
    acidity: 5,
    body: 2,
    sweetness: 3,
    bitterness: 2,
    soldToday: 38,
    available: true,
    tags: ['Sparkling', 'Iced'],
    instructions: ['Chiết xuất 40g espresso double shot.', 'Đổ 120ml tonic lạnh vào ly đá.', 'Rót espresso nhẹ lên trên để giữ phân tầng.'],
  },
  {
    id: 'rec-5',
    name: 'Matcha espresso tonic',
    type: 'Tea',
    origin: 'Uji Matcha & Espresso Blend',
    description: 'Matcha Nhật, tonic lạnh và espresso tạo lớp vị sáng, sạch.',
    image: IMG.matcha,
    price: 78000,
    roast: 'Medium',
    grindSetting: 2.4,
    extractionTime: 26,
    waterTemp: 92,
    ratio: '1:2',
    acidity: 3,
    body: 3,
    sweetness: 3,
    bitterness: 2,
    soldToday: 31,
    available: true,
    tags: ['New', 'Sparkling'],
    instructions: ['Khuấy matcha với 40ml nước ấm.', 'Đổ tonic lạnh vào ly đá.', 'Float espresso lên trên để tạo phân tầng.'],
  },
  {
    id: 'rec-6',
    name: 'Cà phê muối kem',
    type: 'Coffee',
    origin: 'Robusta Honey Đà Lạt',
    description: 'Cà phê đen đậm, lớp kem muối béo ngậy phủ trên, uống lạnh không khuấy.',
    image: IMG.coldBrew,
    price: 62000,
    roast: 'Medium',
    grindSetting: 5.0,
    extractionTime: 300,
    waterTemp: 95,
    ratio: '1:5',
    acidity: 1,
    body: 5,
    sweetness: 4,
    bitterness: 3,
    soldToday: 47,
    available: true,
    tags: ['Signature', 'Trending'],
    instructions: ['Pha cà phê phin đặc, để nguội.', 'Đánh kem tươi với muối hồng và đường.', 'Rót cà phê vào ly đá, múc kem phủ lên trên.'],
  },
];

const INITIAL_BEANS: BeanStock[] = [
  {
    id: 'bean-1',
    name: 'Yirgacheffe Kochere Bloom',
    country: 'Ethiopia',
    region: 'Gedeo, Kochere',
    process: 'Washed',
    variety: 'Heirloom',
    quantityKg: 125,
    status: 'Optimal',
    lastRoastDate: '2026-05-18',
    elevation: '1,900 - 2,100m',
    notes: 'Hương nhài, vỏ chanh và hậu vị trà đen sạch.',
  },
  {
    id: 'bean-2',
    name: 'Gesha Golden Nectar',
    country: 'Colombia',
    region: 'Huila',
    process: 'Anaerobic',
    variety: 'Gesha',
    quantityKg: 18,
    status: 'Critical',
    lastRoastDate: '2026-05-20',
    elevation: '1,750m',
    notes: 'Chanh leo, xoài chín, mật ong và gia vị nhẹ.',
  },
  {
    id: 'bean-3',
    name: 'Robusta Lâm Đồng Honey',
    country: 'Việt Nam',
    region: 'Đà Lạt',
    process: 'Honey',
    variety: 'Robusta 133',
    quantityKg: 340,
    status: 'Surplus',
    lastRoastDate: '2026-05-15',
    elevation: '1,050m',
    notes: 'Cacao, hạt mắc ca rang, crema dày cho phin và espresso milk.',
  },
  {
    id: 'bean-4',
    name: 'Tarrazú Red Apple',
    country: 'Costa Rica',
    region: 'San Marcos',
    process: 'Honey',
    variety: 'Caturra & Catuai',
    quantityKg: 85,
    status: 'Optimal',
    lastRoastDate: '2026-05-19',
    elevation: '1,600m',
    notes: 'Táo đỏ, mật mía, hậu vị nho trắng.',
  },
];

const INITIAL_BARISTAS: Barista[] = [
  {
    id: 'bar-1',
    name: 'Phạm Minh Đức',
    role: 'Manager',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    productivity: 98,
    mood: 'Focused',
    skills: ['Quản lý ca', 'Doanh thu', 'Sensory', 'Khách VIP'],
    activeOutletId: 'out-1',
  },
  {
    id: 'bar-2',
    name: 'Lê Hoàng Giang',
    role: 'Head Barista',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    productivity: 92,
    mood: 'Energetic',
    skills: ['Latte art', 'Dial-in', 'Đào tạo', 'POS'],
    activeOutletId: 'out-2',
  },
  {
    id: 'bar-3',
    name: 'Trần Minh Hải',
    role: 'Roaster',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    productivity: 95,
    mood: 'Calm',
    skills: ['Rang hạt', 'Cropster', 'Cupping', 'Kho'],
    activeOutletId: 'out-1',
  },
  {
    id: 'bar-4',
    name: 'Nguyễn Duy Anh',
    role: 'Apprentice',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    productivity: 84,
    mood: 'Cozy',
    skills: ['Chuẩn bị quầy', 'Hỗ trợ order', 'Vệ sinh máy', 'Phục vụ'],
    activeOutletId: 'out-3',
  },
];

const INITIAL_SHIFTS: Shift[] = [
  { id: 'sft-1', baristaId: 'bar-1', outletId: 'out-1', date: '2026-05-23', startTime: '06:00', endTime: '14:00', role: 'Quản lý ca sáng' },
  { id: 'sft-2', baristaId: 'bar-2', outletId: 'out-2', date: '2026-05-23', startTime: '07:00', endTime: '15:00', role: 'Trưởng quầy espresso' },
  { id: 'sft-3', baristaId: 'bar-3', outletId: 'out-1', date: '2026-05-23', startTime: '08:00', endTime: '16:00', role: 'Rang mẻ house blend' },
  { id: 'sft-4', baristaId: 'bar-4', outletId: 'out-3', date: '2026-05-23', startTime: '09:00', endTime: '17:00', role: 'Hỗ trợ pickup' },
];

const INITIAL_MESSAGES: SystemMessage[] = [
  {
    id: 'msg-1',
    title: 'Kho Gesha gần ngưỡng cảnh báo',
    message: 'Lô Gesha Golden Nectar còn 18kg. Nên lên kế hoạch nhập hạt cho cuối tuần.',
    time: '20 phút trước',
    type: 'warning',
  },
  {
    id: 'msg-2',
    title: 'Mẻ house blend hoàn tất',
    message: 'Roaster đã cập nhật mẻ Reno House Blend mới, sẵn sàng phân phối cho các chi nhánh.',
    time: '1 giờ trước',
    type: 'success',
  },
  {
    id: 'msg-3',
    title: 'Pickup tăng trong khung 8-10h',
    message: 'Đơn lấy tại quán tăng 18% so với trung bình tuần trước.',
    time: '2 giờ trước',
    type: 'info',
  },
];

function tierFromSpent(spent: number): Customer['loyaltyTier'] {
  if (spent >= 8000000) return 'Diamond';
  if (spent >= 4000000) return 'Gold';
  if (spent >= 1500000) return 'Silver';
  return 'Bronze';
}

function pointsFromOrder(total: number): number {
  return Math.floor(total / 10000);
}

function createPointHistoryEntry(order: Order, balanceAfter: number): LoyaltyPointEntry {
  const points = pointsFromOrder(order.total);
  return {
    id: `pts-${order.id}-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    description: `Tích điểm từ đơn ${order.id}`,
    orderId: order.id,
    type: 'Earned',
    points,
    balanceAfter,
  };
}

function createRewardHistoryEntry(reward: LoyaltyReward, balanceAfter: number, orderId?: string): LoyaltyPointEntry {
  return {
    id: `pts-reward-${reward.id}-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    description: `Đổi ${reward.points} điểm lấy ${reward.name}`,
    orderId,
    type: 'Redeemed',
    points: -reward.points,
    balanceAfter,
  };
}

export const useStore = create<RenoState>((set, get) => ({
  currentRole: 'Manager',
  isLoggedIn: true,
  currentUser: INITIAL_BARISTAS[0],
  outlets: INITIAL_OUTLETS,
  recipes: INITIAL_RECIPES,
  beans: INITIAL_BEANS,
  baristas: INITIAL_BARISTAS,
  shifts: INITIAL_SHIFTS,
  orders: orderService.getOrders(),
  customers: customerService.getCustomers(),
  currentCustomer: null,
  customerCart: [],
  systemMessages: INITIAL_MESSAGES,
  activeOutletId: 'out-1',

  login: (baristaId, role) => {
    const barista = get().baristas.find((item) => item.id === baristaId) || null;
    set({ isLoggedIn: true, currentUser: barista, currentRole: role });
    get().pushMessage('Đăng nhập thành công', `Chào ${barista?.name || 'Reno team'}, ca làm đã sẵn sàng.`, 'success');
  },

  logout: () => set({ isLoggedIn: false, currentUser: null }),

  setRole: (role) => {
    set({ currentRole: role });
    get().pushMessage('Đã đổi vai trò', `Giao diện đang áp dụng quyền của ${ROLE_PERMISSIONS[role].label}.`, 'info');
  },

  setActiveOutlet: (id) => set({ activeOutletId: id }),

  addOutlet: (outlet) => {
    set((state) => ({ outlets: [outlet, ...state.outlets] }));
    get().pushMessage('Đã thêm chi nhánh', `${outlet.name} đã được đưa vào hệ thống.`, 'success');
  },

  updateOutlet: (updated) =>
    set((state) => ({ outlets: state.outlets.map((outlet) => (outlet.id === updated.id ? updated : outlet)) })),

  addRecipe: (recipe) => {
    set((state) => ({ recipes: [recipe, ...state.recipes] }));
    get().pushMessage('Đã thêm món mới', `${recipe.name} đã xuất hiện trong thực đơn.`, 'success');
  },

  deleteRecipe: (id) => set((state) => ({ recipes: state.recipes.filter((recipe) => recipe.id !== id) })),

  toggleRecipeAvailability: (id) =>
    set((state) => ({
      recipes: state.recipes.map((recipe) =>
        recipe.id === id ? { ...recipe, available: !recipe.available } : recipe,
      ),
    })),

  addBeans: (bean) => {
    set((state) => ({ beans: [bean, ...state.beans] }));
    get().pushMessage('Đã thêm hạt mới', `${bean.name} đã được ghi vào kho hạt.`, 'success');
  },

  updateBeanQty: (id, qtyDelta) =>
    set((state) => ({
      beans: state.beans.map((bean) => {
        if (bean.id !== id) return bean;
        const nextQty = Math.max(0, bean.quantityKg + qtyDelta);
        return {
          ...bean,
          quantityKg: nextQty,
          status: nextQty < 35 ? 'Critical' : nextQty > 255 ? 'Surplus' : 'Optimal',
        };
      }),
    })),

  addShift: (shift) => set((state) => ({ shifts: [...state.shifts, shift] })),
  deleteShift: (id) => set((state) => ({ shifts: state.shifts.filter((shift) => shift.id !== id) })),
  updateBaristaRole: (baristaId, role) =>
    set((state) => ({
      baristas: state.baristas.map((barista) => (barista.id === baristaId ? { ...barista, role } : barista)),
    })),

  addOrder: (newOrder) => {
    const customerName = newOrder.customerName.trim();
    const customerPhone = normalizeCustomerPhone(newOrder.customerPhone);

    if (!customerName || !customerPhone) {
      throw new Error('Đơn hàng cần có họ tên và số điện thoại khách hàng.');
    }

    const added = orderService.addOrder({
      ...newOrder,
      customerName,
      customerPhone: newOrder.customerPhone,
      source: newOrder.source || 'POS',
    });
    set((state) => ({
      orders: [added, ...state.orders],
      outlets: state.outlets.map((outlet) =>
        outlet.id === added.outletId
          ? {
              ...outlet,
              salesToday: outlet.salesToday + added.total,
              activeOrdersCount: outlet.activeOrdersCount + 1,
            }
          : outlet,
      ),
      recipes: state.recipes.map((recipe) => {
        const item = added.items.find((orderItem) => orderItem.id === recipe.id || orderItem.name === recipe.name);
        return item ? { ...recipe, soldToday: recipe.soldToday + item.quantity } : recipe;
      }),
    }));

    const customers = get().customers;
    const matched = customers.find((customer) => normalizeCustomerPhone(customer.phone) === customerPhone);
    const earnedPoints = pointsFromOrder(added.total);

    if (matched) {
      let refreshedCustomer: Customer | null = null;
      const nextCustomers = customers.map((customer) => {
        if (customer.id !== matched.id) return customer;
        const spentValue = customer.spentValue + added.total;
        const pointsBalance = customer.pointsBalance + earnedPoints;
        refreshedCustomer = {
          ...customer,
          name: added.customerName,
          phone: added.customerPhone || customer.phone,
          email: added.customerEmail || customer.email,
          spentValue,
          pointsBalance,
          pointHistory: [createPointHistoryEntry(added, pointsBalance), ...customer.pointHistory],
          totalOrders: customer.totalOrders + 1,
          loyaltyTier: tierFromSpent(spentValue),
        };
        return refreshedCustomer;
      });
      const currentCustomer = get().currentCustomer;
      const shouldRefreshSession = currentCustomer && normalizeCustomerPhone(currentCustomer.phone) === customerPhone;

      set({
        customers: nextCustomers,
        currentCustomer: shouldRefreshSession ? refreshedCustomer : currentCustomer,
      });
      customerService.saveCustomers(nextCustomers);
    } else {
      const created = customerService.addCustomer({
        name: added.customerName,
        phone: added.customerPhone || '',
        email: added.customerEmail || '',
        totalOrders: 1,
        spentValue: added.total,
        pointsBalance: earnedPoints,
        pointHistory: [createPointHistoryEntry(added, earnedPoints)],
        loyaltyTier: tierFromSpent(added.total),
        notes: added.source === 'MobileApp' ? 'Khách đăng ký từ ứng dụng di động.' : 'Khách đăng ký từ website đặt hàng.',
      });
      const currentCustomer = get().currentCustomer;
      const shouldRefreshSession = currentCustomer && normalizeCustomerPhone(currentCustomer.phone) === customerPhone;

      set((state) => ({
        customers: [created, ...state.customers],
        currentCustomer: shouldRefreshSession ? created : state.currentCustomer,
      }));
    }

    get().pushMessage('Đơn hàng mới', `${added.id} đã được gửi tới quầy pha chế.`, 'success');
    return added;
  },

  updateOrderStatus: (orderId, status) => {
    const before = get().orders.find((order) => order.id === orderId);
    const updated = orderService.updateOrderStatus(orderId, status);
    set((state) => ({
      orders: updated,
      outlets: state.outlets.map((outlet) => {
        if (outlet.id !== before?.outletId) return outlet;
        const becameClosed = before.status !== 'Completed' && before.status !== 'Cancelled' && (status === 'Completed' || status === 'Cancelled');
        return becameClosed ? { ...outlet, activeOrdersCount: Math.max(0, outlet.activeOrdersCount - 1) } : outlet;
      }),
    }));
    get().pushMessage('Cập nhật đơn hàng', `${orderId} chuyển sang trạng thái ${status}.`, status === 'Completed' ? 'success' : 'info');
  },

  addCustomerCartItem: (recipeId) => {
    const recipe = get().recipes.find((item) => item.id === recipeId);
    if (!recipe || !recipe.available) return;

    set((state) => {
      const current = state.customerCart.find((item) => item.id === recipe.id);
      if (current) {
        return {
          customerCart: state.customerCart.map((item) =>
            item.id === recipe.id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        };
      }

      return {
        customerCart: [
          ...state.customerCart,
          { id: recipe.id, name: recipe.name, price: recipe.price, quantity: 1 },
        ],
      };
    });
  },

  updateCustomerCartItemQuantity: (id, qtyDelta) =>
    set((state) => ({
      customerCart: state.customerCart
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + qtyDelta } : item))
        .filter((item) => item.quantity > 0),
    })),

  clearCustomerCart: () => set({ customerCart: [] }),

  loginCustomer: ({ phone, name, email }) => {
    const normalizedPhone = normalizeCustomerPhone(phone);
    if (!normalizedPhone) return null;

    const customers = get().customers;
    const matched = customers.find((customer) => normalizeCustomerPhone(customer.phone) === normalizedPhone);

    if (matched) {
      const nextCustomer = {
        ...matched,
        name: name?.trim() || matched.name,
        email: email?.trim() || matched.email,
      };

      if (nextCustomer.name !== matched.name || nextCustomer.email !== matched.email) {
        customerService.updateCustomer(nextCustomer);
        set((state) => ({
          customers: state.customers.map((customer) => (customer.id === nextCustomer.id ? nextCustomer : customer)),
          currentCustomer: nextCustomer,
        }));
      } else {
        set({ currentCustomer: matched });
      }

      return nextCustomer;
    }

    if (!name?.trim()) return null;

    const created = customerService.addCustomer({
      name: name.trim(),
      phone,
      email: email?.trim() || '',
      totalOrders: 0,
      spentValue: 0,
      loyaltyTier: 'Bronze',
      notes: 'Khách đăng ký từ giao diện đặt hàng.',
    });

    set((state) => ({
      customers: [created, ...state.customers],
      currentCustomer: created,
    }));

    return created;
  },

  logoutCustomer: () => set({ currentCustomer: null }),

  redeemCustomerReward: (reward, orderId) => {
    const customer = get().currentCustomer;
    if (!customer || customer.pointsBalance < reward.points) return null;

    const pointsBalance = customer.pointsBalance - reward.points;
    const updated: Customer = {
      ...customer,
      pointsBalance,
      pointHistory: [createRewardHistoryEntry(reward, pointsBalance, orderId), ...customer.pointHistory],
    };

    customerService.updateCustomer(updated);
    set((state) => ({
      customers: state.customers.map((item) => (item.id === updated.id ? updated : item)),
      currentCustomer: updated,
    }));
    get().pushMessage('Đã đổi điểm', `${customer.name} đã đổi ${reward.points} điểm lấy ${reward.name}.`, 'success');

    return updated;
  },

  addCustomer: (customerData) => {
    const added = customerService.addCustomer(customerData);
    set((state) => ({ customers: [added, ...state.customers] }));
    get().pushMessage('Đã thêm khách hàng', `${added.name} đã được ghi danh vào Reno Club.`, 'success');
  },

  updateCustomer: (updated) => {
    const saved = customerService.updateCustomer(updated);
    set((state) => ({
      customers: state.customers.map((customer) => (customer.id === saved.id ? saved : customer)),
      currentCustomer: state.currentCustomer?.id === saved.id ? saved : state.currentCustomer,
    }));
  },

  deleteCustomer: (id) => {
    customerService.deleteCustomer(id);
    set((state) => ({
      customers: state.customers.filter((customer) => customer.id !== id),
      currentCustomer: state.currentCustomer?.id === id ? null : state.currentCustomer,
    }));
    get().pushMessage('Đã xóa khách hàng', `Hồ sơ ${id} đã được loại khỏi Reno Club.`, 'warning');
  },

  dismissMessage: (id) =>
    set((state) => ({ systemMessages: state.systemMessages.filter((message) => message.id !== id) })),

  pushMessage: (title, message, type) =>
    set((state) => ({
      systemMessages: [
        {
          id: `msg-${Date.now()}`,
          title,
          message,
          time: 'Vừa xong',
          type,
        },
        ...state.systemMessages,
      ].slice(0, 8),
    })),
}));
