
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

// Precise 11-tier urgency labels as requested
export const URGENCY_LABELS = {
  PO_1Y_DUE: 'PO 1Y Due',
  PO_8M_DUE: 'PO 8M Due',
  PO_6M_DUE: 'PO 6M Due',
  PO_4M_DUE_ACTIONS: 'PO 4M Due Actions',
  PO_3M_DUE_ACTION: 'PO 3M Due Action',
  PO_1_5M_DUE_ACTION_MEDIUM: 'PO 1.5M Due Action Medium',
  OVERDUE: 'Overdue',
  DUE: 'Due',
  MEDIUM_DUE: 'Medium Due',
  LATEST: 'Latest',
  NEW: 'New'
};

export const URGENCY_COLORS: Record<string, string> = {
  [URGENCY_LABELS.PO_1Y_DUE]: 'bg-slate-900 text-white border-slate-950 shadow-inner',
  [URGENCY_LABELS.PO_8M_DUE]: 'bg-rose-950 text-white border-rose-950',
  [URGENCY_LABELS.PO_6M_DUE]: 'bg-rose-800 text-white border-rose-900',
  [URGENCY_LABELS.PO_4M_DUE_ACTIONS]: 'bg-rose-600 text-white border-rose-700',
  [URGENCY_LABELS.PO_3M_DUE_ACTION]: 'bg-orange-500 text-white border-orange-600',
  [URGENCY_LABELS.PO_1_5M_DUE_ACTION_MEDIUM]: 'bg-amber-400 text-amber-950 border-amber-500',
  [URGENCY_LABELS.OVERDUE]: 'bg-rose-100 text-rose-700 border-rose-200',
  [URGENCY_LABELS.DUE]: 'bg-amber-100 text-amber-700 border-amber-200',
  [URGENCY_LABELS.MEDIUM_DUE]: 'bg-blue-100 text-blue-700 border-blue-200',
  [URGENCY_LABELS.LATEST]: 'bg-teal-100 text-teal-700 border-teal-200',
  [URGENCY_LABELS.NEW]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};
