import { Customer } from '../types';

const STORAGE_KEY = 'reno_customers_v2';

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'kh-001',
    name: 'Phạm Minh Đức',
    phone: '0912 345 678',
    email: 'duc.pham@gmail.com',
    totalOrders: 42,
    spentValue: 8400000,
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
    loyaltyTier: 'Bronze',
    notes: 'Thanh toán qua ví điện tử, thích đồ uống ít đá.',
    joinedDate: '2026-02-01',
  },
];

function readCustomers(): Customer[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CUSTOMERS));
    return DEFAULT_CUSTOMERS;
  }
  return JSON.parse(data);
}

export const customerService = {
  getCustomers(): Customer[] {
    return readCustomers();
  },

  saveCustomers(customers: Customer[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  },

  addCustomer(customer: Omit<Customer, 'id' | 'joinedDate'>): Customer {
    const customers = readCustomers();
    const newCustomer: Customer = {
      ...customer,
      id: `kh-${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    customers.unshift(newCustomer);
    this.saveCustomers(customers);
    return newCustomer;
  },

  updateCustomer(updated: Customer): Customer {
    const customers = readCustomers().map((customer) =>
      customer.id === updated.id ? updated : customer,
    );
    this.saveCustomers(customers);
    return updated;
  },

  deleteCustomer(id: string): void {
    this.saveCustomers(readCustomers().filter((customer) => customer.id !== id));
  },
};
