export type MenuCategory = 'Coffee' | 'Cold Brew' | 'Tea' | 'Pastry' | 'Retail';
export type AppRouteId = 'storefront' | 'dashboard' | 'orders' | 'menu' | 'customers' | 'branches';
export type OrderChannel = 'DineIn' | 'Pickup';
export type OrderStatus = 'Pending' | 'Brewing' | 'Ready' | 'Completed' | 'Cancelled';
export type PaymentMethod = 'Cash' | 'Card' | 'Banking' | 'Wallet';

export interface Outlet {
  id: string;
  name: string;
  address: string;
  image: string;
  baristaCount: number;
  stockLevel: number;
  activeOrdersCount: number;
  salesToday: number;
  liveOccupancy: number;
  phone: string;
  hours: string;
  rating: number;
}

export interface Recipe {
  id: string;
  name: string;
  type: MenuCategory;
  origin: string;
  description: string;
  image: string;
  price: number;
  roast: 'Light' | 'Medium' | 'Dark' | 'None';
  grindSetting: number;
  extractionTime: number;
  waterTemp: number;
  ratio: string;
  acidity: number;
  body: number;
  sweetness: number;
  bitterness: number;
  soldToday: number;
  available: boolean;
  tags: string[];
  instructions: string[];
}

export interface BeanStock {
  id: string;
  name: string;
  country: string;
  region: string;
  process: 'Washed' | 'Natural' | 'Honey' | 'Anaerobic';
  variety: string;
  quantityKg: number;
  status: 'Critical' | 'Optimal' | 'Surplus';
  lastRoastDate: string;
  elevation: string;
  notes: string;
}

export interface Barista {
  id: string;
  name: string;
  role: 'Manager' | 'Head Barista' | 'Senior Barista' | 'Roaster' | 'Apprentice';
  avatar: string;
  productivity: number;
  mood: 'Energetic' | 'Cozy' | 'Focused' | 'Calm' | 'Tired';
  skills: string[];
  activeOutletId: string;
}

export interface Shift {
  id: string;
  baristaId: string;
  outletId: string;
  date: string;
  startTime: string;
  endTime: string;
  role: string;
}

export interface OrderItem {
  id?: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone?: string;
  channel: OrderChannel;
  pickupTime?: string;
  items: OrderItem[];
  orderTime: string;
  status: OrderStatus;
  total: number;
  outletId: string;
  paymentMethod: PaymentMethod;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  spentValue: number;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  notes: string;
  joinedDate: string;
}

export interface SystemMessage {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success';
}

export interface RolePermission {
  role: Barista['role'];
  label: string;
  description: string;
  permissions: {
    canManageRecipes: boolean;
    canManageInventory: boolean;
    canManageShifts: boolean;
    canManageOutlets: boolean;
    canManageOrders: boolean;
    canViewAnalytics: boolean;
    canManageCustomers: boolean;
  };
}
