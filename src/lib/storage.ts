'use client';

import { InvoiceData } from '@/types/invoice';

const INVOICES_KEY = 'sherutools_invoices';
const PRO_KEY = 'sherutools_pro';

export function getInvoices(): InvoiceData[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(INVOICES_KEY) || '[]');
  } catch { return []; }
}

export function saveInvoice(invoice: InvoiceData): void {
  const invoices = getInvoices();
  const idx = invoices.findIndex(i => i.id === invoice.id);
  if (idx >= 0) invoices[idx] = invoice;
  else invoices.unshift(invoice);
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
}

export function deleteInvoice(id: string): void {
  const invoices = getInvoices().filter(i => i.id !== id);
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
}

export function isPro(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(PRO_KEY) === 'true';
}

export function setPro(val: boolean): void {
  localStorage.setItem(PRO_KEY, val ? 'true' : 'false');
}
