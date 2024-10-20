import { Payment } from '../models';

export const mockSendNotification = (payment: Payment) => {
	console.log(`Notification sent for payment ID: ${payment.id}, Status: ${payment.status}`);
};
