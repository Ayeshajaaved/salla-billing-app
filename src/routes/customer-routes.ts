////// src/routes/customer-routes.ts
////import { Router } from 'itty-router';

////const customerRouter = Router();

////// Route to get customers
////customerRouter.get('/', async (request) => {
////	console.log('GET /api/customers called');
////	// Here you would normally fetch from your data source
////	const customers = [
////		{ id: 1, name: 'John Doe' },
////		{ id: 2, name: 'Jane Doe' },
////	];
////	return new Response(JSON.stringify(customers), { status: 200 });
////});

////// Fallback for undefined customer routes
////customerRouter.all('*', () => {
////	console.error('Customer route not found');
////	return new Response('Customer Not Found', { status: 404 });
////});

////export default customerRouter;

//// src/customer-routes.ts
//import { Router } from 'itty-router';
//import { createCustomer, getCustomers } from '../controllers/customer-controller';

//const customerRouter = Router();

//// Route for creating a customer
////customerRouter.post('/', async (request) => {
////  console.log("POST /api/customers called");
////  return createCustomer(request); // Call your createCustomer logic here
////});

////// Route for getting customers
////customerRouter.get('/', async (request) => {
////	console.log('GET /api/customers called');
////	const customers = [
////		{ id: 1, name: 'John Doe' },
////		{ id: 2, name: 'Jane Doe' },
////	];
////	return new Response(JSON.stringify(customers), { status: 200 });
////});

//customerRouter.get('/api/customeee', async (request) => {
//  try {
//      // Simulate an async operation, e.g., fetching data
//      const data = await fetchData(); // Replace with your actual async call
//      return new Response(JSON.stringify(data), { status: 200 });
//  } catch (error) {
//      console.error('Error fetching data:', error);
//      return new Response('Internal Server Error', { status: 500 });
//  }
//});


//export default customerRouter;
//function fetchData() {
//  throw new Error('Function not implemented.');
//}

