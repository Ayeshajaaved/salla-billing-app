import { Context, Hono } from 'hono';
import {
	createCustomer,
	getCustomer,
	getAllCustomers,
	updateCustomer,
	createSubscriptionPlan,
	getAllSubscriptionPlans,
	getSubscriptionPlan,
	updateSubscriptionPlan,
	//deleteSubscriptionPlan,
	generateInvoice,
	getAllInvoices,
	listInvoicesByCustomer,
} from './controllers';
const app = new Hono();

//app.get('/', (c) => c.text('Hono!'));

//app.get('/test', (c: Context) => {
//	console.log(c.env); // Log the environment to see available bindings
//	return c.json({ success: true, binding: c.env.CUSTOMER_KV !== undefined });
//});

//app.get('/test', (c) => {
//	console.log('Request received at /test');
//	console.log('Available Environment:', c.env);
//	return c.json({ success: true });
//});

app.get('/test', (c: Context) => {
	console.log('Available Environment:', JSON.stringify(c.env, null, 2));
	return c.json({ success: true, binding: c.env.CUSTOMER_KV !== undefined });
});

// Customer APIs
app.post('/api/customers', createCustomer);
app.get('/api/customers/:id', getCustomer);
app.get('/api/customers', getAllCustomers);
app.put('/api/customers/:id', updateCustomer);

// Subscription Plan APIs
app.post('/api/subscriptions', createSubscriptionPlan);
app.get('/api/subscriptions/:id', getSubscriptionPlan);
app.get('/api/subscriptions', getAllSubscriptionPlans);
app.put('/api/subscriptions/:id', updateSubscriptionPlan);

// Invoice APIs
app.post('/api/invoices', generateInvoice);
app.get('/api/invoices', getAllInvoices);
app.get('/api/invoices/customer/:customerId', listInvoicesByCustomer);

app.all('*', (c) => {
	return c.text('The provided endpoint is not registered or does not exist.', { status: 404 });
});

export default app;

// Fetch event
addEventListener('fetch', (event) => {
	event.respondWith(app.fetch(event.request));
});
