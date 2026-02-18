'use client';

import { motion } from 'framer-motion';
import { Calculator, DollarSign, Clock, Calendar, TrendingUp, Briefcase, ArrowRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import FAQSection from '@/components/FAQSection';
import RelatedTools from '@/components/RelatedTools';

const faqs = [
  { question: 'How does the salary calculator work?', answer: 'Enter your salary amount and the pay period (hourly, weekly, monthly, etc.). The calculator instantly converts to all other periods and shows estimated take-home pay after federal tax estimates.' },
  { question: 'How accurate are the tax estimates?', answer: 'Tax estimates are based on simplified US federal tax brackets for 2026. Actual taxes vary by state, deductions, filing status, and other factors. Use this as a rough estimate — consult a tax professional for exact numbers.' },
  { question: 'What is "take-home pay"?', answer: 'Take-home pay (net pay) is what you actually receive after federal income tax, Social Security (6.2%), and Medicare (1.45%) deductions. State taxes, insurance, and 401k are not included in this estimate.' },
  { question: 'How is overtime calculated?', answer: 'Standard overtime is 1.5x your hourly rate for hours worked beyond 40 per week. Enter your weekly overtime hours to see the impact on your total earnings.' },
  { question: 'Can I use this for freelance/contractor income?', answer: 'Yes! Freelancers should note that self-employment tax is about 15.3% (double the employee rate for SS + Medicare). Toggle "Self-Employed" for more accurate estimates.' },
];

const CURRENCIES = [
  { symbol: '$', name: 'USD' },
  { symbol: '€', name: 'EUR' },
  { symbol: '£', name: 'GBP' },
  { symbol: '₹', name: 'INR' },
  { symbol: '¥', name: 'JPY' },
  { symbol: 'A$', name: 'AUD' },
  { symbol: 'C$', name: 'CAD' },
];

export default function SalaryCalculator() {
  const [amount, setAmount] = useState('50000');
  const [period, setPeriod] = useState<'hourly' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'>('yearly');
  const [hoursPerWeek, setHoursPerWeek] = useState('40');
  const [weeksPerYear, setWeeksPerYear] = useState('52');
  const [overtimeHours, setOvertimeHours] = useState('0');
  const [selfEmployed, setSelfEmployed] = useState(false);
  const [currency, setCurrency] = useState('$');

  const calc = useMemo(() => {
    const val = parseFloat(amount) || 0;
    const hpw = parseFloat(hoursPerWeek) || 40;
    const wpy = parseFloat(weeksPerYear) || 52;
    const ot = parseFloat(overtimeHours) || 0;

    // Convert to yearly
    let yearly = 0;
    switch (period) {
      case 'hourly': yearly = val * hpw * wpy; break;
      case 'daily': yearly = val * (wpy * (hpw / 8)); break;
      case 'weekly': yearly = val * wpy; break;
      case 'biweekly': yearly = val * (wpy / 2); break;
      case 'monthly': yearly = val * 12; break;
      case 'yearly': yearly = val; break;
    }

    const hourly = yearly / (hpw * wpy);
    const daily = hourly * 8;
    const weekly = hourly * hpw;
    const biweekly = weekly * 2;
    const monthly = yearly / 12;

    // Overtime
    const overtimePay = ot * hourly * 1.5 * wpy;
    const totalYearly = yearly + overtimePay;

    // Tax estimate (simplified US 2026 brackets)
    const taxableIncome = totalYearly;
    let federalTax = 0;
    if (taxableIncome <= 11600) federalTax = taxableIncome * 0.10;
    else if (taxableIncome <= 47150) federalTax = 1160 + (taxableIncome - 11600) * 0.12;
    else if (taxableIncome <= 100525) federalTax = 5426 + (taxableIncome - 47150) * 0.22;
    else if (taxableIncome <= 191950) federalTax = 17169 + (taxableIncome - 100525) * 0.24;
    else if (taxableIncome <= 243725) federalTax = 39111 + (taxableIncome - 191950) * 0.32;
    else if (taxableIncome <= 609350) federalTax = 55679 + (taxableIncome - 243725) * 0.35;
    else federalTax = 183648 + (taxableIncome - 609350) * 0.37;

    const ss = Math.min(totalYearly, 168600) * (selfEmployed ? 0.124 : 0.062);
    const medicare = totalYearly * (selfEmployed ? 0.029 : 0.0145);
    const selfEmploymentTax = selfEmployed ? (ss + medicare) * 0.5 : 0; // deductible half

    const totalTax = federalTax + ss + medicare;
    const takeHome = totalYearly - totalTax;
    const effectiveRate = totalYearly > 0 ? (totalTax / totalYearly) * 100 : 0;

    return {
      hourly, daily, weekly, biweekly, monthly, yearly,
      overtimePay, totalYearly,
      federalTax, ss, medicare, totalTax, takeHome, effectiveRate,
      takeHomeMonthly: takeHome / 12,
      takeHomeBiweekly: takeHome / 26,
      takeHomeWeekly: takeHome / 52,
      takeHomeHourly: takeHome / (hpw * wpy),
    };
  }, [amount, period, hoursPerWeek, weeksPerYear, overtimeHours, selfEmployed]);

  const fmt = (n: number) => `${currency}${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 text-sm font-medium text-green-500 dark:text-green-400">
              <Calculator className="w-4 h-4" /> Salary Calculator
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white">
              Know Your{' '}
              <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Real Pay
              </span>
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Convert between hourly, weekly, monthly, and yearly salary. See take-home pay 
              after taxes. Free, instant, no sign-up.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Input Section */}
        <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-5">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Amount */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">Salary Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency}</span>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-green-500/30" />
              </div>
            </div>

            {/* Period */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">Pay Period</label>
              <select value={period} onChange={e => setPeriod(e.target.value as typeof period)}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-green-500/30">
                <option value="hourly">Per Hour</option>
                <option value="daily">Per Day</option>
                <option value="weekly">Per Week</option>
                <option value="biweekly">Biweekly</option>
                <option value="monthly">Per Month</option>
                <option value="yearly">Per Year</option>
              </select>
            </div>

            {/* Currency */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-green-500/30">
                {CURRENCIES.map(c => <option key={c.symbol} value={c.symbol}>{c.symbol} {c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Advanced */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Hours/Week</label>
              <input type="number" value={hoursPerWeek} onChange={e => setHoursPerWeek(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30" />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Weeks/Year</label>
              <input type="number" value={weeksPerYear} onChange={e => setWeeksPerYear(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30" />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Overtime Hrs/Week</label>
              <input type="number" value={overtimeHours} onChange={e => setOvertimeHours(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30" />
            </div>
            <div className="flex items-end">
              <button onClick={() => setSelfEmployed(!selfEmployed)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                  selfEmployed ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'
                }`}>
                <Briefcase className="w-4 h-4 inline mr-1" />
                {selfEmployed ? 'Self-Employed ✓' : 'Self-Employed'}
              </button>
            </div>
          </div>
        </div>

        {/* Results — Gross */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Gross Pay (Before Tax)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Hourly', value: calc.hourly, icon: <Clock className="w-4 h-4" /> },
              { label: 'Daily', value: calc.daily, icon: <Calendar className="w-4 h-4" /> },
              { label: 'Weekly', value: calc.weekly, icon: <Calendar className="w-4 h-4" /> },
              { label: 'Biweekly', value: calc.biweekly, icon: <Calendar className="w-4 h-4" /> },
              { label: 'Monthly', value: calc.monthly, icon: <Calendar className="w-4 h-4" /> },
              { label: 'Yearly', value: calc.yearly, icon: <TrendingUp className="w-4 h-4" /> },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-2xl border transition-all ${
                  item.label.toLowerCase() === period 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/5'
                }`}>
                <div className="text-slate-500 dark:text-slate-400 text-xs mb-1 flex items-center gap-1">{item.icon} {item.label}</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">{fmt(item.value)}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Overtime */}
        {calc.overtimePay > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-3">
            <div className="text-2xl">⏰</div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Overtime Pay: {fmt(calc.overtimePay)}/year</div>
              <div className="text-xs text-slate-500">Total with overtime: {fmt(calc.totalYearly)}/year</div>
            </div>
          </motion.div>
        )}

        {/* Tax Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tax Estimate (US Federal)</h2>
          <div className="space-y-2">
            {[
              { label: 'Federal Income Tax', value: calc.federalTax, color: 'bg-red-500' },
              { label: `Social Security (${selfEmployed ? '12.4%' : '6.2%'})`, value: calc.ss, color: 'bg-blue-500' },
              { label: `Medicare (${selfEmployed ? '2.9%' : '1.45%'})`, value: calc.medicare, color: 'bg-purple-500' },
            ].map((tax, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${tax.color}`} />
                  <span className="text-slate-600 dark:text-slate-300">{tax.label}</span>
                </div>
                <span className="font-mono text-slate-900 dark:text-white">-{fmt(tax.value)}</span>
              </div>
            ))}
            <div className="border-t border-slate-200 dark:border-white/5 pt-2 flex items-center justify-between text-sm font-bold">
              <span className="text-slate-700 dark:text-slate-300">Total Tax ({calc.effectiveRate.toFixed(1)}% effective)</span>
              <span className="text-red-500">-{fmt(calc.totalTax)}</span>
            </div>
          </div>
        </div>

        {/* Take-Home Pay */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-green-500 uppercase tracking-wider flex items-center gap-2">
            💰 Take-Home Pay (After Tax)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Hourly', value: calc.takeHomeHourly },
              { label: 'Weekly', value: calc.takeHomeWeekly },
              { label: 'Monthly', value: calc.takeHomeMonthly },
              { label: 'Yearly', value: calc.takeHome },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-4 rounded-2xl bg-green-500/5 border border-green-500/10">
                <div className="text-xs text-green-600 dark:text-green-400 mb-1">{item.label}</div>
                <div className="text-xl font-bold text-green-600 dark:text-green-400">{fmt(item.value)}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Visual comparison */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/20">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">💡 Your Pay at a Glance</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-300">Gross Pay</span>
                <span className="font-bold">{fmt(calc.totalYearly)}/yr</span>
              </div>
              <div className="w-full h-6 rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-300">Take-Home</span>
                <span className="font-bold text-green-500">{fmt(calc.takeHome)}/yr</span>
              </div>
              <div className="w-full h-6 rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${calc.totalYearly > 0 ? (calc.takeHome / calc.totalYearly) * 100 : 0}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-300">Taxes</span>
                <span className="font-bold text-red-500">{fmt(calc.totalTax)}/yr</span>
              </div>
              <div className="w-full h-6 rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${calc.totalYearly > 0 ? (calc.totalTax / calc.totalYearly) * 100 : 0}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ & Related */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <FAQSection faqs={faqs} />
      </section>
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <RelatedTools tools={[{name:"Subscription Tracker",href:"/subscription-tracker",description:"Track subscriptions, see total spend.",icon:"💸"},{name:"Unit Converter",href:"/unit-converter",description:"Convert between 100+ units instantly.",icon:"🔄"},{name:"Invoice Generator",href:"/invoice-generator",description:"Create professional invoices.",icon:"🧾"},{name:"AI Resume Scorer",href:"/resume-scorer",description:"Get AI feedback on your resume.",icon:"📄"}]} />
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Salary Calculator",
        "description": "Convert salary between hourly, weekly, monthly, yearly. Calculate take-home pay after taxes.",
        "url": "https://sherutools.com/salary-calculator",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
      })}} />
    </div>
  );
}
