import { BillingCycle } from '../durable_objects/billing-cycle-do';
import { Customer } from '../models';
import { Context } from 'hono';
import { isValidCustomer } from '../services/customer-service';

const createCustomer = async (c: Context) => {
	try {
		const kv = c.env.CUSTOMER_KV as KVNamespace;
		const customer: Customer = await c.req.json();

		if (!isValidCustomer(customer)) {
			return new Response('Failed to create a new customer: Invalid/Incomplete customer data.', { status: 400 });
		}

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
		const subscriptionPlanKv = c.env.SUBSCRIPTION_PLAN_KV as KVNamespace;

		const customerId = c.req.param('customerId');
		if (!customerId) {
			return new Response('CustomerId could not be extracted.', { status: 400 });
		}

		const { subscriptionPlanId } = await c.req.json();
		if (!subscriptionPlanId) {
			return new Response('SubscriptionPlanId is missing or invalid.', { status: 400 });
		}

		const [customerData, subscriptionPlanData] = await Promise.all([customerKv.get(customerId), kv.get(subscriptionPlanId)]);

		if (!customerData || !subscriptionPlanData) {
			throw new Error('Customer or subscription plan not found');
		}

		const customer: Customer = JSON.parse(customerData);
		customer.currentSubscriptionPlanId = subscriptionPlanId;
		customer.subscriptionStatus = 'active';
		await customerKv.put(customerId, JSON.stringify(customer));

		console.log('Updated Customer:', customer);

		console.log('Available Billing Environment:', c.env.BILLING_CYCLE);

		//const billingCycleId = c.env.BILLING_CYCLE.idFromString(subscriptionPlanId);
		//console.log('Billing Cycle ID:', billingCycleId);

		//const billingCycleInstance = c.env.BILLING_CYCLE.get(billingCycleId);
		//console.log('Billing Cycle Instance:', billingCycleInstance);

		//const billingCycleId = c.env.BILLING_CYCLE.newUniqueId();
		//console.log('Billing Cycle ID:', billingCycleId);

		//await c.env.SUBSCRIPTION_PLAN_KV.put(subscriptionPlanId, billingCycleId.toString());

		//// Create or update the billing cycle in Durable Object
		//const response = await billingCycleInstance.fetch(
		//	new Request(c.req.url, { method: 'POST', body: JSON.stringify({ subscriptionPlanId, customerId }) })
		//);
		//const billingCycleData = await response.json();

		//if (!billingCycleData.ok) {
		//	throw new Error('Failed to initialize billing cycle');
		//}

		/// Generate a new Billing Cycle ID and store it in the KV with the subscriptionPlanId as the key
		const billingCycleId = c.env.BILLING_CYCLE.newUniqueId();
		await subscriptionPlanKv.put(subscriptionPlanId, billingCycleId.toString());

		// Fetch the Durable Object instance using the stored Billing Cycle ID
		const billingCycleInstance = c.env.BILLING_CYCLE.get(billingCycleId);

		// Create or update the billing cycle in Durable Object
		const response = await billingCycleInstance.fetch(
			new Request(c.req.url, { method: 'POST', body: JSON.stringify({ subscriptionPlanId, customerId }) })
		);
		const billingCycleData = await response.json();

		if (!billingCycleData.success) {
			throw new Error('Failed to initialize billing cycle');
		}

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
