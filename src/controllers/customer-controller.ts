import { createCustomerInKV, getCustomerFromKV } from '../services/customer-service';
import { Customer } from '../models';
import { Context } from 'hono';

const createCustomer = async (c: Context) => {
	try {
		const customer: Customer = await c.req.json();
		const kv = c.env.CUSTOMER_KV as KVNamespace;
		console.log('Customer data to be saved:', customer);

		await createCustomerInKV(kv, customer);

		return c.json({ success: true, message: 'Customer created successfully!' }, 201);
	} catch (error) {
		return new Response('Error creating customer', { status: 500 });
	}
};

const getCustomers = async (c: Context) => {
	try {
		const kv = c.env.CUSTOMER_KV as KVNamespace;

		console.log('Available Environment:', c.env);
		console.log('kv', kv);

		const customersList = await kv.list();

		// Fetch the values based on the keys
		const customerData = await Promise.all(
			customersList.keys.map(async (customer: { name: string }) => {
				const value = await kv.get(customer.name);
				return { key: customer.name, value };
			})
		);

		return c.json({ success: true, customers: customerData });
	} catch (error) {
		return new Response(`Error fetching customers: ${(error as Error).message}`, { status: 500 });
	}
};

export { createCustomer, getCustomers };
