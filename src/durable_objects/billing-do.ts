import { Context } from 'hono';
import { InvoiceService } from '../services/invoice-service';
import { Invoice } from '../models'; // Import your Invoice model

export class BillingCycle {
	state: DurableObjectState;
	env: Env;
	invoiceService: InvoiceService;

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.env = env;
		this.invoiceService = new InvoiceService(env); // Instantiate the InvoiceService
	}

	// Initialize billing cycle with customer details and next billing date
	async initialize(customerId: string, nextBillingDate: string) {
		await this.state.storage.put('customerId', customerId);
		await this.state.storage.put('nextBillingDate', nextBillingDate);
	}

	// Fetch the next billing date
	async getNextBillingDate() {
		const nextBillingDate = await this.state.storage.get('nextBillingDate');
		return nextBillingDate;
	}

	// Update the next billing date after the cycle ends
	async updateBillingCycle(nextBillingDate: string) {
		await this.state.storage.put('nextBillingDate', nextBillingDate);
	}

	// Trigger invoice generation and manage billing
	async processBillingCycle() {
		const customerId = (await this.state.storage.get('customerId')) as string;
		const nextBillingDate = (await this.state.storage.get('nextBillingDate')) as string;
		const currentDate = new Date();

		if (nextBillingDate && typeof nextBillingDate === 'string' && new Date(nextBillingDate) <= currentDate) {
			// Logic for generating the invoice
			const invoice: Invoice = {
				id: crypto.randomUUID(),
				customerId: customerId,
				amount: this.calculateInvoiceAmount(), // Logic to calculate the invoice amount
				createdDate: currentDate.toISOString(),
				paymentStatus: 'pending',
				planId: (await this.state.storage.get('subscriptionPlanId')) as string,
				dueDate: this.calculateDueDate(30), // Logic to calculate the due date
			};

			const createdInvoice = await this.invoiceService.generateInvoice(invoice); // Use the service to generate invoice

			// Update the billing cycle for the next period
			const newBillingDate = this.calculateNextBillingDate();
			await this.updateBillingCycle(newBillingDate);

			return { success: true, message: `Invoice ${createdInvoice.id} generated for customer ${customerId}.` };
		}

		return { success: false, message: 'No billing needed.' };
	}

	// Calculate next billing date based on your billing cycle
	private calculateNextBillingDate(): string {
		const currentDate = new Date();
		return new Date(currentDate.setMonth(currentDate.getMonth() + 1)).toISOString(); // Monthly example
	}

	// Placeholder for calculating invoice amount
	private calculateInvoiceAmount(): number {
		// Logic to determine the invoice amount (fixed rate, based on usage, etc.)
		return 100; // Example static amount
	}

	private calculateDueDate(billingCycleDays: number): string {
		const currentDate = new Date();
		const dueDate = new Date(currentDate); // Create a new date instance
		dueDate.setDate(currentDate.getDate() + billingCycleDays); // Set due date based on billing cycle days
		return dueDate.toISOString(); // Return in ISO string format
	}

	// Handle incoming requests
	async fetch(request: Request) {
		const response = await this.processBillingCycle();
		return new Response(JSON.stringify(response), { status: response.success ? 200 : 400 });
	}
}
