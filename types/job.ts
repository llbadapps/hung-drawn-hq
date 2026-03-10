export type JobStatus = 'quote' | 'in_progress' | 'completed' | 'invoiced' | 'paid';
export type PricingType = 'hourly' | 'fixed';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface Job {
  id: string;
  clientId: string;
  clientName: string; // Denormalized for easy display
  title: string;
  description: string;
  status: JobStatus;
  pricingType: PricingType;
  hourlyRate?: number;
  hoursWorked?: number;
  fixedPrice?: number;
  lineItems: LineItem[];
  startDate: Date;
  dueDate?: Date;
  completedDate?: Date;
  invoiceNumber?: string;
  invoiceDate?: Date;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paidAmount: number;
  totalAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export type JobFormData = Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'clientName' | 'totalAmount'>;
