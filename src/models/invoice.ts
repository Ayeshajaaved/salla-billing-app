export interface Invoice {
  id: string;
  customerId: string;
  amount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentDate: string;
  dueDate: string;
}
