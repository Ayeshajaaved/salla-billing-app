//import { InvoiceData } from "../models/invoice";

//export class Invoice {
//  private data: InvoiceData;

//  constructor(customerId: string, subscriptionId: string, amount: number) {
//      this.data = {
//          id: this.generateId(),
//          customerId,
//          subscriptionId,
//          amount,
//          status: 'pending',
//          createdAt: new Date(),
//      };
//  }

//  private generateId(): string {
//      return crypto.randomUUID(); // Generates a unique ID for the invoice
//  }

//  public getInvoiceData(): InvoiceData {
//      return this.data;
//  }

//  public markAsPaid() {
//      this.data.status = 'paid';
//  }

//  public markAsFailed() {
//      this.data.status = 'failed';
//  }
//}
