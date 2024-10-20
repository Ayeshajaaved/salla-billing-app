import { Payment } from '../models';

const calculateProratedAmount = (currentPlanPrice: number, newPlanPrice: number, daysUsed: number, totalDaysInCycle: number): number => {
	const dailyCurrentPlanRate = currentPlanPrice / totalDaysInCycle;
	const dailyNewPlanRate = newPlanPrice / totalDaysInCycle;

	// Amount used from the current plan
	const amountUsed = dailyCurrentPlanRate * daysUsed;

	// Remaining days in the cycle
	const remainingDays = totalDaysInCycle - daysUsed;

	// New plan amount for the remaining days
	const newPlanAmount = dailyNewPlanRate * remainingDays;

	// Calculate the final prorated amount
	return newPlanAmount - amountUsed;
};

export const processPayment = async (payment: Payment): Promise<{ success: boolean; message: string; statusCode: number }> => {
	return mockProcessPayment(payment);
};

const mockProcessPayment = async (payment: Payment): Promise<{ success: boolean; message: string; statusCode: number }> => {
	// Simulate random payment processing behavior
	const randomOutcome = Math.random();

	if (randomOutcome < 0.7) {
		// 70% chance of success
		return { success: true, message: 'Payment has been successful.', statusCode: 200 };
	} else if (randomOutcome < 0.9) {
		// 20% chance of failure
		return { success: false, message: 'Payment failed due to insufficient funds.', statusCode: 402 };
	} else {
		// 10% chance requires additional action
		return { success: false, message: 'Payment requires additional authentication.', statusCode: 401 };
	}
};
