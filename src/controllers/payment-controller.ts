import { Context } from 'hono';
import { Payment } from '../models';
import { processWithPaymentProcessor } from '../services/billing-service';

const createPayment = async (c: Context) => {
	try {
		const kv = c.env.PAYMENT_KV as KVNamespace;
		const payment: Payment = await c.req.json();

		// Payment can only be made against a generated invoice
		if (!payment.invoiceId || !payment.customerId || payment.amount <= 0) {
			return new Response('Missing mandatory fields: Invoice ID, Customer ID, and Amount must be provided and valid.', { status: 400 });
		}

		payment.id = crypto.randomUUID();
		payment.status = 'pending';
		payment.paymentDate = new Date().toISOString();

		// Save payment in KV store with 'pending' status first as we don't know if the payment will be successful
		await kv.put(payment.id, JSON.stringify(payment));

		// Process the payment [mocked]
		const { success, message, statusCode, transactionId } = await processWithPaymentProcessor(payment);

		return c.json(
			{
				success: success,
				message: message,
				payment,
				transactionId: success ? transactionId : null,
			},
			{ status: statusCode }
		);
	} catch (error) {
		return new Response(`Error creating payment: ${(error as Error).message}`, { status: 500 });
	}
};

const getPayment = async (c: Context) => {
	try {
		const kv = c.env.PAYMENT_KV as KVNamespace;
		const queryParams = c.req.query();
		const paymentId = queryParams.paymentId;

		const paymentValue = await kv.get(paymentId);
		if (!paymentValue) {
			return new Response('Payment not found', { status: 404 });
		}

		const payment = JSON.parse(paymentValue);
		return c.json({ success: true, payment });
	} catch (error) {
		return new Response(`Error fetching payment: ${(error as Error).message}`, { status: 500 });
	}
};

const listPaymentsByCustomer = async (c: Context) => {
	try {
		const kv = c.env.PAYMENT_KV as KVNamespace;
		const queryParams = c.req.query();
		const customerId = queryParams.customerId;

		const paymentsList = await kv.list();
		const customerPayments = paymentsList.keys.filter(async (key) => {
			const value = await kv.get(key.name);
			const payment = JSON.parse(value || '{}');
			return payment.customerId === customerId;
		});

		return c.json({ success: true, payments: customerPayments });
	} catch (error) {
		return new Response(`Error listing payments: ${(error as Error).message}`, { status: 500 });
	}
};

//// Update a payment status (e.g., mark as successful or failed)
//updatePaymentStatus: async (c: Context) => {
//	try {
//		const kv = c.env.PAYMENT_KV as KVNamespace;
//		const paymentId = c.req.query.paymentId;
//		const { status } = await c.req.json(); // Assume status is sent in the request body

//		const paymentValue = await kv.get(paymentId);
//		if (!paymentValue) {
//			return new Response('Payment not found', { status: 404 });
//		}

//		const payment = JSON.parse(paymentValue);
//		payment.status = status; // Update status
//		await kv.put(paymentId, JSON.stringify(payment)); // Save updated payment

//		return c.json({ success: true, message: 'Payment status updated successfully', payment });
//	} catch (error) {
//		return new Response(`Error updating payment status: ${(error as Error).message}`, { status: 500 });
//	}
//},

export {
	createPayment,
	getPayment,
	//listPaymentsByCustomer
};
