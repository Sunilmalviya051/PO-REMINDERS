
import { PurchaseOrder, POStatus, POPriority } from './types';

export const MOCK_POS: PurchaseOrder[] = [
  {
    id: '1',
    poNumber: 'PO-2023-001',
    vendor: 'Global Tech Solutions',
    creationDate: '2024-01-01',
    approveDate: '2024-01-05',
    deliveryDate: '2024-02-15',
    status: POStatus.DELIVERED,
    priority: POPriority.HIGH,
    totalAmount: 4500.00,
    items: [],
    itemCode: 'LAP-001',
    unitPrice: 1500,
    currency: 'USD',
    quantity: 3,
    uom: 'PCS',
    itemDescription: 'High-end developer laptops',
    pendingQuantity: 0
  },
  {
    id: '2',
    poNumber: 'PO-2023-002',
    vendor: 'Office Depot Prime',
    creationDate: '2024-02-10',
    approveDate: '2024-02-12',
    deliveryDate: '2024-03-25',
    status: POStatus.SHIPPED,
    priority: POPriority.MEDIUM,
    totalAmount: 1200.50,
    items: [],
    itemCode: 'CHR-442',
    unitPrice: 240.10,
    currency: 'USD',
    quantity: 5,
    uom: 'PCS',
    itemDescription: 'Ergonomic task chairs',
    pendingQuantity: 2
  }
];

export const STATUS_COLORS: Record<POStatus, string> = {
  [POStatus.DRAFT]: 'bg-gray-100 text-gray-700',
  [POStatus.PENDING]: 'bg-yellow-100 text-yellow-700',
  [POStatus.APPROVED]: 'bg-blue-100 text-blue-700',
  [POStatus.SHIPPED]: 'bg-purple-100 text-purple-700',
  [POStatus.DELIVERED]: 'bg-green-100 text-green-700',
  [POStatus.OVERDUE]: 'bg-red-100 text-red-700',
  [POStatus.CANCELLED]: 'bg-red-200 text-red-900',
};

// Updated 8-tier urgency logic
export const URGENCY_LABELS = {
  THREE_ACTION: 'Three Action',   // > 180 days (6 months)
  DOUBLE_ACTION: 'Double Action', // > 90 days (3 months)
  ACTION: 'Action',               // > 60 days (2 months)
  OVERDUE: 'Overdue',             // > 30 days
  DUE: 'Due',                     // 21 - 30 days
  MEDIUM_DUE: 'Medium Due',       // 11 - 20 days
  LATEST: 'Latest',               // 9 - 10 days
  NEW: 'New'                      // 0 - 8 days
};

export const URGENCY_COLORS: Record<string, string> = {
  [URGENCY_LABELS.THREE_ACTION]: 'bg-slate-900 text-white border-slate-950 shadow-inner',
  [URGENCY_LABELS.DOUBLE_ACTION]: 'bg-rose-900 text-white border-rose-950',
  [URGENCY_LABELS.ACTION]: 'bg-rose-600 text-white border-rose-700',
  [URGENCY_LABELS.OVERDUE]: 'bg-rose-100 text-rose-700 border-rose-200',
  [URGENCY_LABELS.DUE]: 'bg-amber-100 text-amber-700 border-amber-200',
  [URGENCY_LABELS.MEDIUM_DUE]: 'bg-blue-100 text-blue-700 border-blue-200',
  [URGENCY_LABELS.LATEST]: 'bg-purple-100 text-purple-700 border-purple-200',
  [URGENCY_LABELS.NEW]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};
