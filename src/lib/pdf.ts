'use client';

import { InvoiceData, calculateSubtotal, calculateTax, calculateTotal, getCurrencySymbol } from '@/types/invoice';

export async function generatePDF(invoice: InvoiceData, isProUser: boolean): Promise<void> {
  const jsPDF = (await import('jspdf')).default;
  const doc = new jsPDF('p', 'mm', 'a4');
  const sym = getCurrencySymbol(invoice.currency);
  const subtotal = calculateSubtotal(invoice.lineItems);
  const tax = calculateTax(subtotal, invoice.taxRate);
  const total = calculateTotal(subtotal, tax, invoice.discount);
  const fmt = (n: number) => `${sym}${n.toFixed(2)}`;

  const colors: Record<string, { primary: number[]; accent: number[] }> = {
    modern: { primary: [15, 23, 42], accent: [59, 130, 246] },
    classic: { primary: [30, 30, 30], accent: [100, 100, 100] },
    minimal: { primary: [50, 50, 50], accent: [120, 120, 120] },
  };
  const c = colors[invoice.template] || colors.modern;

  if (invoice.template === 'modern') {
    doc.setFillColor(c.primary[0], c.primary[1], c.primary[2]);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 20, 25);
    doc.setFontSize(11);
    doc.text(invoice.invoiceNumber, 20, 35);
  } else if (invoice.template === 'classic') {
    doc.setDrawColor(30, 30, 30);
    doc.setLineWidth(0.8);
    doc.line(20, 30, 190, 30);
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(24);
    doc.setFont('times', 'bold');
    doc.text('INVOICE', 20, 22);
    doc.setFontSize(10);
    doc.text(invoice.invoiceNumber, 150, 22);
  } else {
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'normal');
    doc.text('Invoice', 20, 22);
    doc.setFontSize(9);
    doc.text(invoice.invoiceNumber, 160, 22);
  }

  doc.setTextColor(c.primary[0], c.primary[1], c.primary[2]);
  let y = invoice.template === 'modern' ? 60 : 45;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('From:', 20, y);
  doc.text('Bill To:', 120, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const bLines = [invoice.businessName, invoice.businessEmail, invoice.businessAddress, invoice.businessPhone].filter(Boolean);
  const cLines = [invoice.clientName, invoice.clientEmail, invoice.clientAddress].filter(Boolean);
  bLines.forEach((l, i) => doc.text(l, 20, y + i * 5));
  cLines.forEach((l, i) => doc.text(l, 120, y + i * 5));
  y += Math.max(bLines.length, cLines.length) * 5 + 5;

  doc.text(`Date: ${invoice.date}`, 20, y);
  doc.text(`Due: ${invoice.dueDate}`, 120, y);
  y += 10;

  doc.setFillColor(c.accent[0], c.accent[1], c.accent[2]);
  doc.rect(20, y - 4, 170, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 22, y + 1);
  doc.text('Qty', 120, y + 1);
  doc.text('Rate', 140, y + 1);
  doc.text('Amount', 165, y + 1);
  y += 8;

  doc.setTextColor(c.primary[0], c.primary[1], c.primary[2]);
  doc.setFont('helvetica', 'normal');
  invoice.lineItems.forEach((item) => {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.text(item.description || '—', 22, y + 1);
    doc.text(String(item.quantity), 120, y + 1);
    doc.text(fmt(item.rate), 140, y + 1);
    doc.text(fmt(item.quantity * item.rate), 165, y + 1);
    doc.setDrawColor(220, 220, 220);
    doc.line(20, y + 3, 190, y + 3);
    y += 7;
  });

  y += 5;
  const totals = [
    ['Subtotal', fmt(subtotal)],
    [`Tax (${invoice.taxRate}%)`, fmt(tax)],
    ['Discount', `-${fmt(invoice.discount)}`],
    ['Total', fmt(total)],
  ];
  totals.forEach(([label, val], i) => {
    if (i === 3) doc.setFont('helvetica', 'bold');
    doc.text(label, 140, y);
    doc.text(val, 175, y, { align: 'right' });
    y += 6;
  });

  if (invoice.notes || invoice.paymentTerms) {
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    if (invoice.paymentTerms) doc.text(`Payment Terms: ${invoice.paymentTerms}`, 20, y);
    if (invoice.notes) { y += 5; doc.text(`Notes: ${invoice.notes}`, 20, y); }
  }

  if (!isProUser) {
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text('Made with SheruTools — sherutools.com', 105, 290, { align: 'center' });
  }

  doc.save(`${invoice.invoiceNumber}.pdf`);
}
