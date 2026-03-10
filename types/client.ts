export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string; // Links client to the authenticated user
}

export type ClientFormData = Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;
