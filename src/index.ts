import { Context, Hono } from 'hono';
import {
	createCustomer,
	getCustomer,
	getAllCustomers,
	updateCustomer,
	assignSubscriptionPlanToCustomer,
	createSubscriptionPlan,
	getAllSubscriptionPlans,
	getSubscriptionPlan,
	updateSubscriptionPlan,
	//deleteSubscriptionPlan,
	generateInvoice,
	getAllInvoices,
	listInvoicesByCustomer,
	createPayment,
	getPayment,
	//createCustomerBillingCycle,
	//listPaymentsByCustomer,
} from './controllers';

import { SimpleDO } from './durable_objects/simple-object';
import { BillingCycle } from './durable_objects/billing-cycle-do';
//import { Env } from './types';
import cronHandler from './cron';

const app = new Hono();

app.get('/test', (c: Context) => {
	console.log('Available Environment:', JSON.stringify(c.env, null, 2));
	return c.json({ success: true, binding: c.env.CUSTOMER_KV !== undefined });
});

// Customer APIs
app.post('/api/customers', createCustomer);
app.get('/api/customers/:id', getCustomer);
app.get('/api/customers', getAllCustomers);
app.put('/api/customers/:id', updateCustomer);
app.post('api/customers/:customerId/assign-subscription', assignSubscriptionPlanToCustomer);

// Subscription Plan APIs
app.post('/api/subscription-plans', createSubscriptionPlan);
app.get('/api/subscription-plans/:id', getSubscriptionPlan);
app.get('/api/subscription-plans', getAllSubscriptionPlans);
app.put('/api/subscription-plans/:id', updateSubscriptionPlan);

// Invoice APIs
app.post('/api/invoices', generateInvoice);
app.get('/api/invoices', getAllInvoices);
app.get('/api/invoices/customer/:customerId', listInvoicesByCustomer);

// Payment APIs
app.post('/api/payments', createPayment);
app.get('/api/payments/:id', getPayment);

app.post('/test-scheduled', async (c) => {
	const testEvent = { cron: '*/1 * * * *' }; // Simulate the cron you want to test
	await scheduled(testEvent as ScheduledEvent); // Call the scheduled function manually
	return c.text('Test scheduled job executed.');
});

app.post('/test-do', async (c: Context) => {
	try {
		console.log('Available Environment:', c.env);

		const billingCycleId = c.env.BILLING_CYCLE.newUniqueId();
		console.log('Billing Cycle ID POST:', billingCycleId.toString());

		const billingCycleInstance = c.env.BILLING_CYCLE.get(billingCycleId);
		console.log('Billing Cycle Instance:', billingCycleInstance.toString());

		const response = await billingCycleInstance.fetch(
			new Request(c.req.url, { method: 'POST', body: JSON.stringify({ name: 'Monthly Plan', price: 10 }) })
		);

		const responseData = await response.text();
		console.log('Response:', responseData);

		return new Response('Billing cycle created', { status: 200 });
	} catch (error) {
		console.error(`Error creating billing cycle: ${(error as Error).message}`);
		return new Response(`Error: ${(error as Error).message}`, { status: 500 });
	}
});

app.get('/test-do/:id', async (c: Context) => {
	try {
		const billingCycleId = c.req.param('id'); // Get ID from request parameters
		console.log('Billing Cycle ID GET:', billingCycleId);

		// Convert string ID into a DurableObjectId
		const durableObjectId = c.env.BILLING_CYCLE.idFromString(billingCycleId);

		// Retrieve the Durable Object using the ID
		const billingCycleInstance = c.env.BILLING_CYCLE.get(durableObjectId);

		// Fetch data from the Durable Object
		const response = await billingCycleInstance.fetch(c.req.url);
		const data = await response.json();

		console.log('Retrieved Billing Cycle Data:', data);

		return new Response(JSON.stringify(data), { status: 200 });
	} catch (error) {
		console.error(`Error fetching billing cycle: ${(error as Error).message}`);
		return new Response(`Error fetching billing cycle: ${(error as Error).message}`, { status: 500 });
	}
});

app.all('*', (c) => {
	return c.text('The provided endpoint is not registered or does not exist.', { status: 404 });
});

// Fetch event
addEventListener('fetch', (event) => {
	event.respondWith(app.fetch(event.request));
});

export const scheduled = async (event: ScheduledEvent) => {
	console.log(`Scheduled event triggered: ${event.cron}`);

	switch (event.cron) {
		case '*/1 * * * *':
			console.log('Cron job processed');
			break;
		//case '0 0 * * *':
		//		await fetchCustomers();
		//		break;
		//case '0 0 */2 * *':
		//		await logTask();
		//		break;
		default:
			console.warn(`No scheduled job found for: ${event.cron}`);
	}
};

export { SimpleDO, BillingCycle };
export default app;
