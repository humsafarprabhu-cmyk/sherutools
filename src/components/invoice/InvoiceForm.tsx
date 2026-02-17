'use client';

import { InvoiceData, LineItem, CURRENCIES, TemplateType } from '@/types/invoice';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, FileText, Sparkles, Layout } from 'lucide-react';

interface Props {
  invoice: InvoiceData;
  onChange: (invoice: InvoiceData) => void;
}

function Input({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
      <motion.input
        whileFocus={{ scale: 1.01 }}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm resize-none"
      />
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl space-y-4"
    >
      <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
        {icon}
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

const templates: { id: TemplateType; name: string; desc: string }[] = [
  { id: 'modern', name: 'Modern', desc: 'Clean & bold' },
  { id: 'classic', name: 'Classic', desc: 'Timeless & formal' },
  { id: 'minimal', name: 'Minimal', desc: 'Simple & elegant' },
];

export default function InvoiceForm({ invoice, onChange }: Props) {
  const set = <K extends keyof InvoiceData>(key: K, val: InvoiceData[K]) =>
    onChange({ ...invoice, [key]: val });

  const updateItem = (id: string, field: keyof LineItem, val: string | number) => {
    set('lineItems', invoice.lineItems.map(item =>
      item.id === id ? { ...item, [field]: val } : item
    ));
  };

  const addItem = () => {
    set('lineItems', [...invoice.lineItems, { id: Date.now().toString(), description: '', quantity: 1, rate: 0 }]);
  };

  const removeItem = (id: string) => {
    if (invoice.lineItems.length <= 1) return;
    set('lineItems', invoice.lineItems.filter(i => i.id !== id));
  };

  return (
    <div className="space-y-5">
      <Section title="Template" icon={<Layout className="w-4 h-4 text-blue-400" />}>
        <div className="grid grid-cols-3 gap-3">
          {templates.map(t => (
            <motion.button
              key={t.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => set('template', t.id)}
              className={`p-3 rounded-xl border text-center transition-all ${
                invoice.template === t.id
                  ? 'border-blue-500 bg-blue-500/10 text-white'
                  : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20'
              }`}
            >
              <div className="text-sm font-medium">{t.name}</div>
              <div className="text-[10px] mt-0.5 opacity-60">{t.desc}</div>
            </motion.button>
          ))}
        </div>
      </Section>

      <Section title="Invoice Details" icon={<FileText className="w-4 h-4 text-blue-400" />}>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Invoice #" value={invoice.invoiceNumber} onChange={v => set('invoiceNumber', v)} />
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Currency</label>
            <select
              value={invoice.currency}
              onChange={e => set('currency', e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
            >
              {CURRENCIES.map(c => <option key={c.code} value={c.code} className="bg-slate-900">{c.symbol} {c.code}</option>)}
            </select>
          </div>
          <Input label="Date" value={invoice.date} onChange={v => set('date', v)} type="date" />
          <Input label="Due Date" value={invoice.dueDate} onChange={v => set('dueDate', v)} type="date" />
        </div>
      </Section>

      <Section title="Your Business" icon={<Sparkles className="w-4 h-4 text-emerald-400" />}>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Business Name" value={invoice.businessName} onChange={v => set('businessName', v)} placeholder="Acme Inc." />
          <Input label="Email" value={invoice.businessEmail} onChange={v => set('businessEmail', v)} placeholder="you@company.com" />
        </div>
        <Input label="Address" value={invoice.businessAddress} onChange={v => set('businessAddress', v)} placeholder="123 Main St, City" />
        <Input label="Phone" value={invoice.businessPhone} onChange={v => set('businessPhone', v)} placeholder="+1 234 567 890" />
      </Section>

      <Section title="Client Details" icon={<FileText className="w-4 h-4 text-purple-400" />}>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Client Name" value={invoice.clientName} onChange={v => set('clientName', v)} placeholder="Client Corp" />
          <Input label="Email" value={invoice.clientEmail} onChange={v => set('clientEmail', v)} placeholder="client@email.com" />
        </div>
        <Input label="Address" value={invoice.clientAddress} onChange={v => set('clientAddress', v)} placeholder="456 Oak Ave, Town" />
      </Section>

      <Section title="Line Items" icon={<FileText className="w-4 h-4 text-orange-400" />}>
        <AnimatePresence mode="popLayout">
          {invoice.lineItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 items-end"
            >
              <div className="flex-1">
                <Input label={idx === 0 ? 'Description' : ''} value={item.description} onChange={v => updateItem(item.id, 'description', v)} placeholder="Service/Product" />
              </div>
              <div className="w-16">
                <Input label={idx === 0 ? 'Qty' : ''} value={item.quantity} onChange={v => updateItem(item.id, 'quantity', Number(v) || 0)} type="number" />
              </div>
              <div className="w-24">
                <Input label={idx === 0 ? 'Rate' : ''} value={item.rate} onChange={v => updateItem(item.id, 'rate', Number(v) || 0)} type="number" />
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => removeItem(item.id)}
                className="p-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors mb-0.5"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addItem}
          className="w-full py-2.5 border border-dashed border-white/20 rounded-xl text-sm text-slate-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Item
        </motion.button>
      </Section>

      <Section title="Totals & Notes" icon={<FileText className="w-4 h-4 text-cyan-400" />}>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Tax Rate (%)" value={invoice.taxRate} onChange={v => set('taxRate', Number(v) || 0)} type="number" />
          <Input label="Discount (flat)" value={invoice.discount} onChange={v => set('discount', Number(v) || 0)} type="number" />
        </div>
        <Input label="Payment Terms" value={invoice.paymentTerms} onChange={v => set('paymentTerms', v)} placeholder="Net 30" />
        <TextArea label="Notes" value={invoice.notes} onChange={v => set('notes', v)} placeholder="Thank you for your business!" />
      </Section>
    </div>
  );
}
