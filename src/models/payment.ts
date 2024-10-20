export interface Payment {
	id: string;
	invoiceId: string;
	customerId: string;
	amount: number;
	status: 'pending' | 'successful' | 'failed';
	paymentMethod: string;
	paymentDate: string;
}
