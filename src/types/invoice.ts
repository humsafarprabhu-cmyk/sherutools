export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  businessName: string;
  businessEmail: string;
  businessAddress: string;
  businessPhone: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  lineItems: LineItem[];
  taxRate: number;
  discount: number;
  currency: string;
  notes: string;
  paymentTerms: string;
  template: 'modern' | 'classic' | 'minimal';
  createdAt: string;
}

export type TemplateType = InvoiceData['template'];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find(c => c.code === code)?.symbol || '$';
}

export function calculateSubtotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
}

export function calculateTax(subtotal: number, taxRate: number): number {
  return subtotal * (taxRate / 100);
}

export function calculateTotal(subtotal: number, tax: number, discount: number): number {
  return subtotal + tax - discount;
}

export function newInvoiceData(): InvoiceData {
  return {
    id: crypto.randomUUID?.() || Date.now().toString(),
    invoiceNumber: `INV-${String(Date.now()).slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    businessName: '',
    businessEmail: '',
    businessAddress: '',
    businessPhone: '',
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    lineItems: [{ id: '1', description: '', quantity: 1, rate: 0 }],
    taxRate: 0,
    discount: 0,
    currency: 'USD',
    notes: '',
    paymentTerms: 'Net 30',
    template: 'modern',
    createdAt: new Date().toISOString(),
  };
}
