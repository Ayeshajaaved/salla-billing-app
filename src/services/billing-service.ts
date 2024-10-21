import { Payment } from '../models';

export const processWithPaymentProcessor = async (
	payment: Payment
): Promise<{ success: boolean; message: string; statusCode: number; transactionId?: string }> => {
	// Here you would integrate with the payment processor API (e.g., Stripe, PayPal)
	// This is just a simulation
	const randomOutcome = Math.random();

	if (randomOutcome < 0.7) {
		// 70% chance of success
		return { success: true, message: 'Payment has been successful.', statusCode: 200, transactionId: crypto.randomUUID() };
	} else if (randomOutcome < 0.9) {
		// 20% chance of failure
		return { success: false, message: 'Payment failed due to insufficient funds.', statusCode: 402 };
	} else {
		// 10% chance requires additional action
		return { success: false, message: 'Payment requires additional authentication.', statusCode: 401 };
	}
};

function calculateProratedAmount(
	currentPrice: number,
	currentBillingCycleDays: number,
	planStartDate: Date,
	newPrice: number,
	newBillingCycleDays: number
): number {
	// Calculate the number of days used since the plan was created
	const today = new Date();
	const timeDiff = today.getTime() - planStartDate.getTime();
	const daysUsed = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

	// Calculate remaining days in the current billing cycle
	const daysRemaining = currentBillingCycleDays - daysUsed;

	if (daysRemaining < 0) {
		throw new Error('The current billing cycle has already ended.');
	}

	// Calculate the daily rate for the current plan
	const currentDailyRate = currentPrice / currentBillingCycleDays;

	// Calculate the prorated amount for the remaining days on the current plan
	const currentPlanRemainingAmount = currentDailyRate * daysRemaining;

	// Calculate the full amount for the new plan's billing cycle
	const newPlanAmount = newPrice;

	// Calculate the prorated change
	const proratedChange = newPlanAmount - currentPlanRemainingAmount;

	return proratedChange;
}
