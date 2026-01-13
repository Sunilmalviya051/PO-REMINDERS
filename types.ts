
export enum POStatus {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  APPROVED = 'Approved',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  OVERDUE = 'Overdue',
  CANCELLED = 'Cancelled'
}

export enum POPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface PurchaseOrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  creationDate: string; // Order Date
  approveDate?: string; 
  deliveryDate: string;
  status: POStatus;
  priority: POPriority; 
  items: PurchaseOrderItem[];
  totalAmount: number;
  notes?: string;
  // New fields requested
  itemCode?: string;
  unitPrice?: number;
  currency?: string;
  quantity?: number;
  uom?: string;
  itemDescription?: string;
  pendingQuantity?: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface POAppNotification {
  id: string;
  poId: string;
  poNumber: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info';
  timestamp: number;
  isRead: boolean;
}
