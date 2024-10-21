export class SimpleDO {
    async fetch(req: Request) {
        return new Response('Hello from Durable Object!');
    }
}
