////import { Router } from 'itty-router';
////import customerRouter from './customer-routes';

////const router = Router();

////router.all('/api/customers/*', customerRouter.handle);

////// Fallback for undefined routes
////router.all('*', () => new Response('Not Found', { status: 404 }));

////export default router;

//// src/routes.ts
//import { Router } from 'itty-router';
////import { createCustomer, getCustomers } from '../controllers';

//const customerRouter = Router();

////customerRouter.get('/', getCustomers);
////customerRouter.post('/', createCustomer);

////// Fallback route for invalid endpoints
////customerRouter.all('*', () => new Response('Not Found', { status: 404 }));

////export default customerRouter;

//customerRouter.get('/api/customeee', async (request) => {
//	console.log('Hit /api/customeee');
//	return new Response('Response for /api/customeee', { status: 200 });
//});

//customerRouter.all('*', () => {
//	console.log('Hit undefined route');
//	return new Response('Not Found', { status: 404 });
//});
