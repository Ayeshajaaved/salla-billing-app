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

const getAllCustomers = async (c: Context) => {
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

const deleteCustomer = async (c: Context) => {
	try {
		const kv = c.env.CUSTOMER_KV as KVNamespace;
		const plansKv = c.env.SUBSCRIPTION_PLAN_KV as KVNamespace;
		const invoicesKv = c.env.INVOICE_KV as KVNamespace;

		const customerId = c.req.param('id');

		// Check if the customer exists
		const customerData = await kv.get(customerId);
		if (!customerData) {
			return c.json({ success: false, message: 'Customer not found' }, 404);
		}

		// Delete associated subscription plans
		const plansList = await plansKv.list();
		await Promise.all(
			plansList.keys.filter((plan: { name: string }) => plan.name.startsWith(customerId)).map((plan) => plansKv.delete(plan.name))
		);

		// Delete associated invoices
		const invoicesList = await invoicesKv.list();
		await Promise.all(
			invoicesList.keys
				.filter((invoice: { name: string }) => invoice.name.startsWith(customerId))
				.map((invoice) => invoicesKv.delete(invoice.name))
		);

		// Delete the customer
		await kv.delete(customerId);

		return c.json({ success: true, message: 'Customer and associated data has been deleted successfully!' });
	} catch (error) {
		return new Response(`Error deleting customer: ${(error as Error).message}`, { status: 500 });
	}
};

const assignSubscriptionPlanToCustomer = async (c: Context) => {
	try {
		const kv = c.env.SUBSCRIPTION_PLAN_KV as KVNamespace;
		const customerKv = c.env.CUSTOMER_KV as KVNamespace;

		const customerId = c.req.param('customerId');
		if (!customerId) {
			return new Response('CustomerId could not be extracted.', { status: 400 });
		}

		const { subscriptionPlanId } = await c.req.json();
		if (!subscriptionPlanId) {
			return new Response('SubscriptionPlanId is missing or invalid.', { status: 400 });
		}

		const customerData = await customerKv.get(customerId);
		if (!customerData) {
			return c.json({ success: false, message: 'Customer not found' }, 404);
		}

		

		const customer: Customer = JSON.parse(customerData);

		const subscriptionPlanData = await kv.get(subscriptionPlanId);
		if (!subscriptionPlanData) {
			return c.json({ success: false, message: 'Subscription plan not found' }, 404);
		}

		// Update the customer's subscription details
		customer.currentSubscriptionPlanId = subscriptionPlanId;
		customer.subscriptionStatus = 'active';

		// Save the updated customer back to KV
		await customerKv.put(customerId, JSON.stringify(customer));

		return c.json({ success: true, message: 'Subscription plan assigned to customer successfully!', customer });
	} catch (error) {
		return new Response(`Error assigning subscription plan: ${(error as Error).message}`, { status: 500 });
	}
};

export {
	createCustomer,
	getCustomer,
	getAllCustomers,
	updateCustomer,
	assignSubscriptionPlanToCustomer,
	//deleteCustomer,
};
