export interface Customer {
	id: string;
	name: string;
	email: string;
	currentSubscriptionPlanId?: string;
	previousSubscriptionPlanId?: string;
	subscriptionStatus: 'active' | 'cancelled';
}
