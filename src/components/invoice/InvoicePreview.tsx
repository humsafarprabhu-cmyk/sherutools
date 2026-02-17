'use client';

import { InvoiceData, calculateSubtotal, calculateTax, calculateTotal, getCurrencySymbol } from '@/types/invoice';
import { motion } from 'framer-motion';

interface Props {
  invoice: InvoiceData;
}

export default function InvoicePreview({ invoice }: Props) {
  const sym = getCurrencySymbol(invoice.currency);
  const subtotal = calculateSubtotal(invoice.lineItems);
  const tax = calculateTax(subtotal, invoice.taxRate);
  const total = calculateTotal(subtotal, tax, invoice.discount);
  const fmt = (n: number) => `${sym}${n.toFixed(2)}`;

  const isModern = invoice.template === 'modern';
  const isClassic = invoice.template === 'classic';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-2xl shadow-black/30 overflow-hidden text-gray-900 max-w-[600px] mx-auto"
      style={{ minHeight: 700 }}
    >
      {isModern && (
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 px-8 py-7 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">INVOICE</h1>
              <p className="text-blue-300 text-sm mt-1">{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right text-sm text-blue-200">
              <p>{invoice.date}</p>
              <p className="text-xs mt-1 opacity-70">Due: {invoice.dueDate}</p>
            </div>
          </div>
        </div>
      )}
      {isClassic && (
        <div className="px-8 pt-7 pb-4 border-b-2 border-gray-900">
          <div className="flex justify-between items-baseline">
            <h1 className="text-2xl font-serif font-bold">INVOICE</h1>
            <span className="text-sm text-gray-500">{invoice.invoiceNumber}</span>
          </div>
        </div>
      )}
      {!isModern && !isClassic && (
        <div className="px-8 pt-7 pb-4">
          <div className="flex justify-between items-baseline">
            <h1 className="text-xl font-light text-gray-700 tracking-widest">Invoice</h1>
            <span className="text-xs text-gray-400">{invoice.invoiceNumber}</span>
          </div>
        </div>
      )}

      <div className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">From</p>
            <p className="font-semibold text-sm">{invoice.businessName || 'Your Business'}</p>
            <p className="text-xs text-gray-500">{invoice.businessEmail}</p>
            <p className="text-xs text-gray-500">{invoice.businessAddress}</p>
            <p className="text-xs text-gray-500">{invoice.businessPhone}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Bill To</p>
            <p className="font-semibold text-sm">{invoice.clientName || 'Client Name'}</p>
            <p className="text-xs text-gray-500">{invoice.clientEmail}</p>
            <p className="text-xs text-gray-500">{invoice.clientAddress}</p>
          </div>
        </div>

        {!isModern && (
          <div className="flex gap-6 text-xs text-gray-500">
            <p>Date: {invoice.date}</p>
            <p>Due: {invoice.dueDate}</p>
          </div>
        )}

        <div>
          <div className={`grid grid-cols-[1fr_60px_80px_80px] text-[10px] uppercase tracking-widest py-2 border-b ${
            isModern ? 'text-blue-600 border-blue-100 bg-blue-50/50 px-3 rounded-lg' :
            isClassic ? 'text-gray-600 border-gray-300' :
            'text-gray-400 border-gray-200'
          }`}>
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Rate</span>
            <span className="text-right">Amount</span>
          </div>
          {invoice.lineItems.map(item => (
            <div key={item.id} className="grid grid-cols-[1fr_60px_80px_80px] text-sm py-2.5 border-b border-gray-100">
              <span className="text-gray-800">{item.description || '—'}</span>
              <span className="text-right text-gray-600">{item.quantity}</span>
              <span className="text-right text-gray-600">{fmt(item.rate)}</span>
              <span className="text-right font-medium">{fmt(item.quantity * item.rate)}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <div className="w-56 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div className="flex justify-between text-sm text-gray-600"><span>Tax ({invoice.taxRate}%)</span><span>{fmt(tax)}</span></div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-sm text-gray-600"><span>Discount</span><span>-{fmt(invoice.discount)}</span></div>
            )}
            <div className={`flex justify-between text-lg font-bold pt-2 border-t ${
              isModern ? 'text-blue-900 border-blue-200' : 'text-gray-900 border-gray-300'
            }`}>
              <span>Total</span><span>{fmt(total)}</span>
            </div>
          </div>
        </div>

        {(invoice.paymentTerms || invoice.notes) && (
          <div className="pt-4 border-t border-gray-100 space-y-1">
            {invoice.paymentTerms && <p className="text-xs text-gray-500"><strong>Payment Terms:</strong> {invoice.paymentTerms}</p>}
            {invoice.notes && <p className="text-xs text-gray-500"><strong>Notes:</strong> {invoice.notes}</p>}
          </div>
        )}
      </div>
    </motion.div>
  );
}
