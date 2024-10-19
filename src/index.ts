import { Context, Hono } from 'hono';
import { createCustomer, getCustomers } from './controllers';

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

app.get('/api/customers', getCustomers);
app.post('/api/customers', createCustomer);

app.all('*', (c) => {
	return c.text('Not Found', { status: 404 });
});

export default app;

// Fetch event
addEventListener('fetch', (event) => {
	event.respondWith(app.fetch(event.request));
});
