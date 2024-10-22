import { Invoice } from '../models';

export class InvoiceService {
	private kv: KVNamespace;

	constructor(env: any) {
		this.kv = env.INVOICE_KV as KVNamespace;
	}

	async generateInvoice(invoice: Invoice): Promise<Invoice> {
		invoice.id = crypto.randomUUID();
		await this.kv.put(invoice.id, JSON.stringify(invoice));
		return invoice;
	}

	async getAllInvoices() {
		const invoicesList = await this.kv.list();
		const invoicesData = await Promise.all(
			invoicesList.keys.map(async (invoice: { name: string }) => {
				const value = await this.kv.get(invoice.name);
				return JSON.parse(value || '{}');
			})
		);
		return invoicesData;
	}

	async listInvoicesByCustomer(customerId: string) {
		const invoicesList = await this.kv.list();
		const customerInvoices = await Promise.all(
			invoicesList.keys.map(async (invoice: { name: string }) => {
				const invoiceData = await this.kv.get(invoice.name);
				const parsedInvoice = JSON.parse(invoiceData || '{}');

				if (parsedInvoice.customerId === customerId) {
					return { key: invoice.name, value: parsedInvoice };
				}
			})
		);

		return customerInvoices.filter((invoice) => invoice !== undefined);
	}
}
