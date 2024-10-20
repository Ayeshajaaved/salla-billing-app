import { Customer } from '../models';
import { Context } from 'hono';

const createCustomer = async (c: Context) => {
	try {
		const kv = c.env.CUSTOMER_KV as KVNamespace;
		const customer: Customer = await c.req.json();
		customer.id = crypto.randomUUID();
		await kv.put(customer.id, JSON.stringify(customer));

		return c.json({ success: true, message: 'Customer created successfully', customer });
	} catch (error) {
		return new Response(`Error creating customer: ${(error as Error).message}`, { status: 500 });
	}
};

const getCustomer = async (c: Context) => {
	try {
		const kv = c.env.CUSTOMER_KV as KVNamespace;
		const customerId = c.req.param('id');

		const customerData = await kv.get(customerId);
		if (!customerData) {
			return c.json({ success: false, message: 'Customer not found' }, 404);
		}

		return c.json({ success: true, customer: JSON.parse(customerData) });
	} catch (error) {
		return new Response(`Error fetching customer: ${(error as Error).message}`, { status: 500 });
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

const updateCustomer = async (c: Context) => {
	try {
		const kv = c.env.CUSTOMER_KV as KVNamespace;
		const customerId = c.req.param('id');
		const updatedData: Partial<Customer> = await c.req.json();

		const existingCustomerData = await kv.get(customerId);
		if (!existingCustomerData) {
			return c.json({ success: false, message: 'Customer not found' }, 404);
		}

		const existingCustomer = JSON.parse(existingCustomerData);
		const updatedCustomer = { ...existingCustomer, ...updatedData };

		await kv.put(customerId, JSON.stringify(updatedCustomer));

		return c.json({ success: true, message: 'Customer updated successfully', customer: updatedCustomer });
	} catch (error) {
		return new Response(`Error updating customer: ${(error as Error).message}`, { status: 500 });
	}
};

//const deleteCustomer = async (c: Context) => {
//	try {
//			const kv = c.env.CUSTOMER_KV as KVNamespace;
//			const customerId = c.req.param('id');

//			const existingCustomerData = await kv.get(customerId);
//			if (!existingCustomerData) {
//					return c.json({ success: false, message: 'Customer not found' }, 404);
//			}

//			// Delete the customer data from KV
//			await kv.delete(customerId);

//			return c.json({ success: true, message: 'Customer deleted successfully' });
//	} catch (error) {
//			return new Response(`Error deleting customer: ${(error as Error).message}`, { status: 500 });
//	}
//};

export {
	createCustomer,
	getCustomer,
	getCustomers,
	updateCustomer,
	//deleteCustomer,
};
