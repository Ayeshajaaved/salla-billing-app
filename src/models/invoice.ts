export interface Invoice {
	id: string;
	customerId: string;
	amount: number;
	//paymentId: string;
	planId: string;
	paymentStatus: 'pending' | 'paid' | 'failed';
	paymentDate?: string;
	dueDate: string;
	proratedAmount?: number; // Amount for prorated charges
	previousPlanId?: string; // ID of the previous plan if upgraded or downgraded
	createdDate: string;
}
