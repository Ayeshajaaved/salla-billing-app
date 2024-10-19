import { Router } from 'itty-router';
//import { subscriptionRouter } from './routes/subscriptions';

const router = Router();

//router.all('/subscriptions/*', subscriptionRouter.handle);

addEventListener('fetch', (event) => {
    event.respondWith(router.handle(event.request));
});



export default {
  async fetch(request: Request): Promise<Response> {
    return new Response("Hello, world!", { status: 200 });
  },
};
