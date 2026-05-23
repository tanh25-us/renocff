import { Customer, LoyaltyPointEntry } from '../types';

const STORAGE_KEY = 'reno_customers_v2';

export type CustomerInput = Omit<Customer, 'id' | 'joinedDate' | 'pointsBalance' | 'pointHistory'> &
  Partial<Pick<Customer, 'pointsBalance' | 'pointHistory'>>;

export function normalizeCustomerPhone(phone = ''): string {
  return phone.replace(/\D/g, '');
}

function pointEntry(
  customerId: string,
  date: string,
  description: string,
  points: number,
  balanceAfter: number,
  orderId?: string,
): LoyaltyPointEntry {
  return {
    id: `pts-${customerId}-${date}-${Math.abs(points)}`,
    date,
    description,
    orderId,
    type: points >= 0 ? 'Earned' : 'Redeemed',
    points,
    balanceAfter,
  };
}

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'kh-001',
    name: 'Phạm Minh Đức',
    phone: '0912 345 678',
    email: 'duc.pham@gmail.com',
    totalOrders: 42,
    spentValue: 8400000,
    pointsBalance: 840,
    pointHistory: [
      pointEntry('kh-001', '2026-05-20', 'Tích điểm từ đơn DH-1001', 17, 840, 'DH-1001'),
      pointEntry('kh-001', '2026-05-12', 'Tích điểm đơn đặt qua website', 24, 823),
      pointEntry('kh-001', '2026-05-01', 'Đổi 50 điểm lấy ưu đãi thành viên', -50, 799),
    ],
    loyaltyTier: 'Diamond',
    notes: 'Ưu tiên Phin sữa đá ít đường, thích hạt Robusta Honey rang vừa.',
    joinedDate: '2025-01-15',
  },
  {
    id: 'kh-002',
    name: 'Nguyễn Hương Giang',
    phone: '0988 765 432',
    email: 'giang.huong@yahoo.com',
    totalOrders: 28,
    spentValue: 4760000,
    pointsBalance: 476,
    pointHistory: [
      pointEntry('kh-002', '2026-05-21', 'Tích điểm từ đơn DH-1002', 6, 476, 'DH-1002'),
      pointEntry('kh-002', '2026-05-15', 'Tích điểm đơn pickup trên mobile app', 12, 470),
      pointEntry('kh-002', '2026-04-28', 'Thưởng hạng Gold', 30, 458),
    ],
    loyaltyTier: 'Gold',
    notes: 'Hay đặt Cold Brew Nitro, thường chọn nhận tại quán sau 15 phút.',
    joinedDate: '2025-03-20',
  },
  {
    id: 'kh-003',
    name: 'Trần Hoàng Nam',
    phone: '0356 999 888',
    email: 'nam.tran@techcorp.vn',
    totalOrders: 15,
    spentValue: 2250000,
    pointsBalance: 225,
    pointHistory: [
      pointEntry('kh-003', '2026-05-18', 'Tích điểm từ đơn DH-1003', 18, 225, 'DH-1003'),
      pointEntry('kh-003', '2026-05-06', 'Tích điểm đơn giao hàng', 14, 207),
    ],
    loyaltyTier: 'Silver',
    notes: 'Thích Latte nóng kèm croissant bơ Pháp.',
    joinedDate: '2025-05-10',
  },
  {
    id: 'kh-004',
    name: 'Lê Thanh Thảo',
    phone: '0904 111 222',
    email: 'thao.le@fashionvn.com',
    totalOrders: 6,
    spentValue: 720000,
    pointsBalance: 72,
    pointHistory: [
      pointEntry('kh-004', '2026-05-16', 'Tích điểm đơn thanh toán ví điện tử', 8, 72),
      pointEntry('kh-004', '2026-04-29', 'Tích điểm đơn đầu tiên', 6, 64),
    ],
    loyaltyTier: 'Bronze',
    notes: 'Thanh toán qua ví điện tử, thích đồ uống ít đá.',
    joinedDate: '2026-02-01',
  },
];

function withLoyalty(customer: Customer): Customer {
  const pointsBalance =
    typeof customer.pointsBalance === 'number'
      ? customer.pointsBalance
      : Math.floor((customer.spentValue || 0) / 10000);

  const pointHistory: LoyaltyPointEntry[] = Array.isArray(customer.pointHistory)
    ? customer.pointHistory
    : pointsBalance > 0
      ? [
          {
            id: `pts-${customer.id}-initial`,
            date: customer.joinedDate || new Date().toISOString().split('T')[0],
            description: 'Số dư tích lũy ban đầu',
            type: 'Adjusted' as const,
            points: pointsBalance,
            balanceAfter: pointsBalance,
          },
        ]
      : [];

  return {
    ...customer,
    pointsBalance,
    pointHistory,
  };
}

function readCustomers(): Customer[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CUSTOMERS));
    return DEFAULT_CUSTOMERS;
  }

  try {
    const customers = (JSON.parse(data) as Customer[]).map(withLoyalty);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    return customers;
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CUSTOMERS));
    return DEFAULT_CUSTOMERS;
  }
}

export const customerService = {
  getCustomers(): Customer[] {
    return readCustomers();
  },

  saveCustomers(customers: Customer[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers.map(withLoyalty)));
  },

  addCustomer(customer: CustomerInput): Customer {
    const customers = readCustomers();
    const newCustomer: Customer = withLoyalty({
      ...customer,
      id: `kh-${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0],
      pointsBalance: customer.pointsBalance || 0,
      pointHistory: customer.pointHistory || [],
    });
    customers.unshift(newCustomer);
    this.saveCustomers(customers);
    return newCustomer;
  },

  updateCustomer(updated: Customer): Customer {
    const saved = withLoyalty(updated);
    const customers = readCustomers().map((customer) =>
      customer.id === saved.id ? saved : customer,
    );
    this.saveCustomers(customers);
    return saved;
  },

  deleteCustomer(id: string): void {
    this.saveCustomers(readCustomers().filter((customer) => customer.id !== id));
  },
};
