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
import { BillingCycle } from './durable_objects/billing-do';
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

app.get('/test-do', async (c: Context) => {
	try {
			console.log('Available Environment:', c.env);
			const id = c.env.SIMPLE_DO.newUniqueId();
			const doInstance = c.env.SIMPLE_DO.get(id);
			const response = await doInstance.fetch(new Request(c.req.url, { method: c.req.method }));
			return response;
	} catch (error) {
			console.error(`Error fetching durable object: ${(error as Error).message}`);
			return new Response(`Error fetching durable object: ${(error as Error).message}`, { status: 500 });
	}
});



//app.post('/api/billing-cycles', async (c: Context) => {
//	try {
//		const requestData = await c.req.json();
//		const durableObjectId = c.env.BILLING_CYCLE.idFromName(requestData.customerId);
//		const durableObjectStub = c.env.BILLING_CYCLE.get(durableObjectId);
//		return await durableObjectStub.fetch(c.req);
//	} catch (error) {
//		return new Response(`Error creating billing cycle: ${(error as Error).message}`, { status: 500 });
//	}
//});

//app.post('/api/billing-cycles', async (c: Context) => {
//	try {
//		const { customerId } = await c.req.json(); // Extract customerId from the request body
//		const durableObjectId = c.env.BILLING_CYCLE.idFromName(customerId);
//		const durableObjectStub = c.env.BILLING_CYCLE.get(durableObjectId);

//		return await durableObjectStub.createBillingCycle(c.req);
//	} catch (error) {
//		return new Response(`Error creating billing cycle: ${(error as Error).message}`, { status: 500 });
//	}
//});

//app.post('/api/billing-cycles', async (c: Context) => {
//	try {
//		const { customerId } = await c.req.json();
//		console.log('customerId:', customerId);

//		console.log('Env:', c.env);
//    console.log('BILLING_CYCLE:', c.env.BILLING_CYCLE);

//		const durableObjectId = c.env.BILLING_CYCLE.idFromName(customerId);
//		const durableObjectStub = c.env.BILLING_CYCLE.get(durableObjectId);
		
//		return await durableObjectStub.fetch(c.req);
//	} catch (error) {
//		return new Response(`Error creating billing cycle: ${(error as Error).message}`, { status: 500 });
//	}
//});


//app.get('/api/billing-cycles', async (c: Context) => {
//	const customerId = c.req.query('customerId');
//	const durableObjectId = c.env.BILLING_CYCLE.idFromName(customerId);
//	const durableObjectStub = c.env.BILLING_CYCLE.get(durableObjectId);
//	return await durableObjectStub.fetch(c.req);
//});

app.all('*', (c) => {
	return c.text('The provided endpoint is not registered or does not exist.', { status: 404 });
});

export { SimpleDO, BillingCycle };

export default app;

// Fetch event
addEventListener('fetch', (event) => {
	event.respondWith(app.fetch(event.request));
});

