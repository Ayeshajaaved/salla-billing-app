export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  status: 'successful' | 'failed';
  paymentMethod: string;
  paymentDate: string;
}
