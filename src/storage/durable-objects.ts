export class MyDurableObject {
	state: DurableObjectState;
	env: Env;

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.env = env;
	}

	async fetch(request: Request) {
		// Handle incoming requests
		const url = new URL(request.url);
		if (url.pathname === '/initialize') {
			const body: any = await request.json();

			const { customerId, nextBillingDate } = body;

			if (!customerId || !nextBillingDate) {
				return new Response('Missing customerId or nextBillingDate', { status: 400 });
			}

			await this.initialize(customerId, nextBillingDate);
			return new Response('Initialized', { status: 200 });
		}
		return new Response('Not Found', { status: 404 });
	}

	async initialize(customerId: string, nextBillingDate: string) {
		// Logic to initialize state
		await this.state.storage.put('customerId', customerId);
		await this.state.storage.put('nextBillingDate', nextBillingDate);
	}
}
