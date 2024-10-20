import { Context } from 'hono';

const createSubscriptionPlan = async (c: Context) => {
	try {
		const kv = c.env.SUBSCRIPTION_KV as KVNamespace;
		const plan = await c.req.json();
		plan.id = crypto.randomUUID();

		await kv.put(plan.id, JSON.stringify(plan));

		return c.json({ success: true, message: 'Subscription plan created successfully', plan });
	} catch (error) {
		return new Response(`Error creating subscription plan: ${(error as Error).message}`, { status: 500 });
	}
};

const getSubscriptionPlans = async (c: Context) => {
	try {
		const kv = c.env.SUBSCRIPTION_KV as KVNamespace;
		const plansList = await kv.list();

		// Fetch the values based on the keys
		const plansData = await Promise.all(
			plansList.keys.map(async (plan: { name: string }) => {
				const value = await kv.get(plan.name);
				return { key: plan.name, value: JSON.parse(value || '{}') };
			})
		);

		return c.json({ success: true, plans: plansData });
	} catch (error) {
		return new Response(`Error fetching subscription plans: ${(error as Error).message}`, { status: 500 });
	}
};

const getSubscriptionPlan = async (c: Context) => {
	try {
		const kv = c.env.SUBSCRIPTION_KV as KVNamespace;
		const planId = c.req.param('id');

		const planData = await kv.get(planId);
		if (!planData) {
			return c.json({ success: false, message: 'Plan not found' }, 404);
		}

		return c.json({ success: true, plan: JSON.parse(planData) });
	} catch (error) {
		return new Response(`Error fetching subscription plan: ${(error as Error).message}`, { status: 500 });
	}
};

const updateSubscriptionPlan = async (c: Context) => {
	try {
		const kv = c.env.SUBSCRIPTION_KV as KVNamespace;
		const planId = c.req.param('id');
		const existingPlanData = await kv.get(planId);

		if (!existingPlanData) {
			return c.json({ success: false, message: 'Plan not found' }, 404);
		}

		const updatedData = await c.req.json();
		const updatedPlan = { ...JSON.parse(existingPlanData), ...updatedData }; // Merge existing and new data

		await kv.put(planId, JSON.stringify(updatedPlan));

		return c.json({ success: true, plan: updatedPlan });
	} catch (error) {
		return new Response(`Error updating subscription plan: ${(error as Error).message}`, { status: 500 });
	}
};

const deleteSubscriptionPlan = async (c: Context) => {
	try {
		const kv = c.env.SUBSCRIPTION_KV as KVNamespace;
		const planId = c.req.param('id');

		const planData = await kv.get(planId);
		if (!planData) {
			return c.json({ success: false, message: 'Plan not found' }, 404);
		}

		await kv.delete(planId);

		return c.json({ success: true, message: 'Plan deleted successfully' });
	} catch (error) {
		return new Response(`Error deleting subscription plan: ${(error as Error).message}`, { status: 500 });
	}
};

export { createSubscriptionPlan, getSubscriptionPlans, getSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan };
