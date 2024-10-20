export interface SubscriptionPlan {
	id: string;
	name: string;
	billingCycle: 'daily' | 'weekly' | 'monthly' | 'yearly';
	price: number;
	status: 'active' | 'inactive';
	createdAt: string;
	updatedAt?: string;
}
