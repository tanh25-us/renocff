import { Order } from '../types';

const STORAGE_KEY = 'reno_orders_v2';

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'DH-1001',
    customerName: 'Phạm Minh Đức',
    customerPhone: '0912 345 678',
    channel: 'DineIn',
    items: [
      { id: 'rec-2', name: 'Phin sữa đá truyền thống', quantity: 2, price: 59000 },
      { id: 'rec-4', name: 'Croissant bơ Pháp', quantity: 1, price: 55000 },
    ],
    orderTime: '08:24',
    status: 'Completed',
    total: 173000,
    outletId: 'out-1',
    paymentMethod: 'Card',
  },
  {
    id: 'DH-1002',
    customerName: 'Nguyễn Hương Giang',
    customerPhone: '0988 765 432',
    channel: 'Pickup',
    pickupTime: '09:10',
    items: [{ id: 'rec-1', name: 'Cold Brew trái cây', quantity: 1, price: 69000 }],
    orderTime: '08:53',
    status: 'Brewing',
    total: 69000,
    outletId: 'out-1',
    paymentMethod: 'Wallet',
  },
  {
    id: 'DH-1003',
    customerName: 'Trần Hoàng Nam',
    customerPhone: '0356 999 888',
    channel: 'DineIn',
    items: [
      { id: 'rec-3', name: 'Latte hoa hồng', quantity: 1, price: 72000 },
      { id: 'rec-4', name: 'Croissant bơ Pháp', quantity: 2, price: 55000 },
    ],
    orderTime: '09:02',
    status: 'Ready',
    total: 182000,
    outletId: 'out-2',
    paymentMethod: 'Banking',
  },
  {
    id: 'DH-1004',
    customerName: 'Khách vãng lai',
    channel: 'Pickup',
    pickupTime: '09:30',
    items: [{ id: 'rec-5', name: 'Matcha espresso tonic', quantity: 1, price: 78000 }],
    orderTime: '09:09',
    status: 'Pending',
    total: 78000,
    outletId: 'out-3',
    paymentMethod: 'Cash',
  },
];

function readOrders(): Order[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ORDERS));
    return DEFAULT_ORDERS;
  }
  return JSON.parse(data);
}

export const orderService = {
  getOrders(): Order[] {
    return readOrders();
  },

  saveOrders(orders: Order[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  },

  addOrder(order: Omit<Order, 'id' | 'orderTime'>): Order {
    const orders = readOrders();
    const newOrder: Order = {
      ...order,
      id: `DH-${Math.floor(1000 + Math.random() * 9000)}`,
      orderTime: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    const nextOrders = [newOrder, ...orders];
    this.saveOrders(nextOrders);
    return newOrder;
  },

  updateOrderStatus(orderId: string, status: Order['status']): Order[] {
    const updated = readOrders().map((order) =>
      order.id === orderId ? { ...order, status } : order,
    );
    this.saveOrders(updated);
    return updated;
  },
};
