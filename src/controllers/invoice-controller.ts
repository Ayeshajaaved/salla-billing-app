import { Context } from 'hono';
import { Invoice } from '../models';
import { InvoiceService } from '../services/invoice-service';

const generateInvoice = async (c: Context) => {
	const invoiceService = new InvoiceService(c.env);
	try {
		const invoice: Invoice = await c.req.json();
		const createdInvoice = await invoiceService.generateInvoice(invoice);
		return c.json({ success: true, message: 'Invoice created successfully', invoice: createdInvoice });
	} catch (error) {
		return new Response(`Error generating invoice: ${(error as Error).message}`, { status: 500 });
	}
};

const getAllInvoices = async (c: Context) => {
	try {
		const kv = c.env.INVOICE_KV as KVNamespace;
		const invoicesList = await kv.list(); // List all invoices

		// Fetch the values based on the keys
		const invoicesData = await Promise.all(
			invoicesList.keys.map(async (invoice: { name: string }) => {
				const invoiceId = invoice.name;
				const value = await kv.get(invoiceId);
				const invoiceData: Invoice = JSON.parse(value || '{}');

				return invoiceData;
			})
		);

		return c.json({ success: true, invoices: invoicesData });
	} catch (error) {
		return new Response(`Error fetching invoices: ${(error as Error).message}`, { status: 500 });
	}
};

const listInvoicesByCustomer = async (c: Context) => {
	try {
		const kv = c.env.INVOICE_KV as KVNamespace;
		const customerId = c.req.param('customerId');

		const invoicesList = await kv.list();

		// Filter invoices by customerId
		const customerInvoices = await Promise.all(
			invoicesList.keys.map(async (invoice: { name: string }) => {
				const invoiceData = await kv.get(invoice.name);
				const parsedInvoice = JSON.parse(invoiceData || '{}');

				// Check if the invoice belongs to the specified customer
				if (parsedInvoice.customerId === customerId) {
					return { key: invoice.name, value: parsedInvoice };
				}
			})
		);

		// Filter out undefined values (in case some invoices don't match)
		const filteredInvoices = customerInvoices.filter((invoice) => invoice !== undefined);

		return c.json({ success: true, invoices: filteredInvoices });
	} catch (error) {
		return new Response(`Error fetching invoices for customer: ${(error as Error).message}`, { status: 500 });
	}
};

export { generateInvoice, getAllInvoices, listInvoicesByCustomer };
