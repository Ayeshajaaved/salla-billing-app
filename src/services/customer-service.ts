import { Customer } from '../models';
import { KVNamespace } from '@cloudflare/workers-types';

export const createCustomerInKV = async (kv: KVNamespace, customer: Customer) => {
	await kv.put(`customer:${customer.id}`, JSON.stringify(customer));
};

export const getCustomerFromKV = async (kv: KVNamespace, customerId: string): Promise<Customer | null> => {
	try {
		const customerData = await kv.get(`customer:${customerId}`);

		if (!customerData) {
			return null; // Return null if no customer is found
		}

		return JSON.parse(customerData) as Customer; // Parse and return the customer data
	} catch (error) {
		if (error instanceof Error) {
			console.error(`Error fetching customer: ${error.message}`);
		} else {
			console.error('Error fetching customer: Unknown error');
		}
		throw new Error('Could not retrieve customer data');
	}
};
