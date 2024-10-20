import { Context, Hono } from 'hono';
import {
	createCustomer,
	getCustomer,
	getCustomers,
	updateCustomer,
	createSubscriptionPlan,
	getSubscriptionPlans,
	getSubscriptionPlan,
	updateSubscriptionPlan,
	//deleteSubscriptionPlan,
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
app.get('/api/customers', getCustomers);
app.post('/api/customers', createCustomer);
app.get('/api/customers/:id', getCustomer);
app.put('/api/customers/:id', updateCustomer);

// Subscription Plan APIs
app.get('/api/subscriptions', getSubscriptionPlans);
app.post('/api/subscriptions', createSubscriptionPlan);
app.get('/api/subscriptions/:id', getSubscriptionPlan);
app.put('/api/subscriptions/:id', updateSubscriptionPlan);

app.all('*', (c) => {
	return c.text('The provided endpoint is not registered or does not exist.', { status: 404 });
});

export default app;

// Fetch event
addEventListener('fetch', (event) => {
	event.respondWith(app.fetch(event.request));
});
