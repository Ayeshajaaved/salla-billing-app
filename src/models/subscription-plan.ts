export interface SubscriptionPlan {
	id: string;
	customerId: string;
	name: string;
	billingCycle: 'monthly' | 'yearly';
	price: number;
	status: 'active' | 'inactive';
	previousPlanId?: string;
	createdAt: string;
	updatedAt?: string;
}
