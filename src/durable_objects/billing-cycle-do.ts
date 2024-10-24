//import { Invoice } from '../models';
//import { InvoiceService } from '../services/invoice-service';

//export class BillingCycle {
//	state: DurableObjectState;
//	//env: Env;
//	//invoiceService: InvoiceService;
//	//data: any;

//	constructor(state: DurableObjectState, env: Env) {
//		this.state = state;
//		//this.env = env;
//		//this.invoiceService = new InvoiceService(env);
//		//this.data = {};
//	}

//	// Initialize billing cycle with customer details and next billing date
//	async initialize(customerId: string, subscriptionPlanId: string, nextBillingDate: string) {
//		try {
//			await this.state.storage.put('customerId', customerId);
//			await this.state.storage.put('subscriptionPlanId', subscriptionPlanId);
//			await this.state.storage.put('nextBillingDate', nextBillingDate);
//		} catch (error) {
//			return new Response(`Error initializing billing cycle DO: ${(error as Error).message}`, { status: 500 });
//		}
//	}

//	// Fetch the next billing date
//	async getNextBillingDate() {
//		try {
//			return await this.state.storage.get('nextBillingDate');
//		} catch (error) {
//			return new Response(`Error fetching nex billing date: ${(error as Error).message}`, { status: 500 });
//		}
//	}

//	// Update the next billing date after the cycle ends
//	async updateBillingCycle(nextBillingDate: string) {
//		await this.state.storage.put('nextBillingDate', nextBillingDate);
//	}

//	async processBillingCycle() {
//		const customerId = (await this.state.storage.get('customerId')) as string;
//		const subscriptionPlanId = (await this.state.storage.get('subscriptionPlanId')) as string;
//		const nextBillingDate = (await this.state.storage.get('nextBillingDate')) as string;
//		const currentDate = new Date();

//		if (nextBillingDate && new Date(nextBillingDate) <= currentDate) {
//			const invoice: Invoice = {
//				id: crypto.randomUUID(),
//				customerId,
//				amount: this.calculateInvoiceAmount(),
//				createdDate: currentDate.toISOString(),
//				paymentStatus: 'pending',
//				planId: subscriptionPlanId,
//				dueDate: this.calculateDueDate(30),
//			};

//			const createdInvoice = await this.invoiceService.generateInvoice(invoice);
//			const newBillingDate = this.calculateNextBillingDate();
//			await this.updateBillingCycle(newBillingDate);

//			return { success: true, message: `Invoice ${createdInvoice.id} generated for customer ${customerId}.` };
//		}

//		return { success: false, message: 'No billing needed.' };
//	}

//	private calculateNextBillingDate(): string {
//		const currentDate = new Date();
//		return new Date(currentDate.setMonth(currentDate.getMonth() + 1)).toISOString();
//	}

//	private calculateInvoiceAmount(): number {
//		// Logic to determine the invoice amount (fixed rate, based on usage, etc.)
//		return 100; // Example static amount
//	}

//	private calculateDueDate(billingCycleDays: number): string {
//		const currentDate = new Date();
//		const dueDate = new Date(currentDate);
//		dueDate.setDate(currentDate.getDate() + billingCycleDays);
//		return dueDate.toISOString();
//	}

//	async fetch(request: Request) {
//		const { method } = request;

//		if (method === 'POST') {
//			const body = await request.json();
//			await this.state.storage.put('billingCycle', body);
//			console.log('Stored Billing Cycle:', body);
//			return new Response(JSON.stringify({ success: true, data: body }), { status: 200 });
//		} else if (method === 'GET') {
//			const data = await this.state.storage.get('billingCycle'); // Retrieve data
//			return new Response(JSON.stringify(data || { message: 'No data available' }), { status: 200 });
//		} else {
//			return new Response('Method not allowed', { status: 405 });
//		}
//	}
//}

import { Invoice } from '../models';
import { InvoiceService } from '../services/invoice-service';
//import { Env } from '../types';

//interface Env {
//  BILLING_CYCLE: DurableObjectNamespace; // Update according to your needs
//}


//export async function handleSchedule(env: Env) {
//  const billingCycleInstance = new BillingCycle(env); // Pass env to the class

//  // Fetch active billing cycles
//  const billingCycles = await billingCycleInstance.getActiveBillingCycles();

//  for (const cycle of billingCycles) {
//    console.log('Processing Billing Cycle:', cycle);
//    await billingCycleInstance.generateInvoice(cycle); // Generate invoices
//  }
//}


export class BillingCycle {
	state: DurableObjectState;
	invoiceService: InvoiceService;
	env: Env;

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.env = env; // Store the environment to access it later
		this.invoiceService = new InvoiceService(env);
	}

	async fetch(request: Request) {
		const { method } = request;

		if (method === 'POST') {
			const body = await request.json();
			await this.state.storage.put('billingCycle', body);
			console.log('Stored Billing Cycle:', body);

			// Fetch the billing cycle immediately after storing it
			const storedData = await this.state.storage.get('billingCycle');
			console.log('Immediately Retrieved Billing Cycle Data:', storedData);

			return new Response(JSON.stringify({ success: true, data: storedData }), { status: 200 });
		} else if (method === 'GET') {
			const data = await this.state.storage.get('billingCycle');
			console.log('Retrieved Billing Cycle Data:', data);
			return new Response(JSON.stringify(data || { message: 'No data available' }), { status: 200 });
		} else {
			return new Response('Method not allowed', { status: 405 });
		}
	}

	async getActiveBillingCycles() {
		const billingCycles = await this.state.storage.list(); // List all items in storage
		const activeCycles: { key: string; value: unknown }[] = []; // Use unknown for value initially

		for (const [key, value] of billingCycles.entries()) {
			const billingCycle = value as { status: string }; // Type assertion for inline structure
			if (billingCycle.status === 'active') {
				activeCycles.push({ key, value }); // Add active cycles to the array
			}
		}

		console.log('Active Billing Cycles:', activeCycles);
		return activeCycles;
	}


//	async handleCronTrigger(event: ScheduledEvent, env: Env) {
//		const billingCycles = await this.getActiveBillingCycles(); 
//		//for (const cycle of billingCycles) {
//		//		console.log('Processing Billing Cycle via cron:', cycle);
//		//		// Generate invoice logic here
//		//}

//		for (const cycle of billingCycles) {
//			console.log('Processing Billing Cycle via cron:', cycle);
//			//const durableObjectId = this.env.BILLING_CYCLE.idFromString(cycle.key); // Use the cycle key to get the ID
//			//const billingCycleInstance = this.env.BILLING_CYCLE.get(durableObjectId);
//			// Generate invoice logic goes here
//	}
//}




//// This is your event listener for the cron trigger
//addEventListener('scheduled', (event) => {
//    event.waitUntil(handleCronTrigger(event, state, env)); // Pass the necessary arguments
//});


}
