interface Env {
  BILLING_CYCLE: DurableObjectNamespace;
}

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ) {
    console.log("Cron job processed");
    
    // Example logic to fetch and generate invoices
    const billingCycleId = env.BILLING_CYCLE.newUniqueId();
    const billingCycleInstance = env.BILLING_CYCLE.get(billingCycleId);
    await billingCycleInstance.fetch(new Request("https://example.com/invoice"));
  },
};
