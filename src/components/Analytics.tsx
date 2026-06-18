import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BarChart, TrendingUp, Clock, AlertTriangle, ShieldCheck, HeartHandshake, FileText, ChevronDown, Calendar } from 'lucide-react';

interface AnalyticsProps {
  onShowToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export default function Analytics({ onShowToast }: AnalyticsProps) {
  const [dateFrom, setDateFrom] = useState('2024-03-05');
  const [dateTo, setDateTo] = useState('2024-03-13');

  const handleExportPDF = () => {
    if (onShowToast) {
      onShowToast('PDF report compiled successfully. Downloading lenovo_quarterly_support_audit.pdf', 'success');
    } else {
      alert('PDF report compiled successfully. Downloading lenovo_quarterly_support_audit.pdf');
    }
  };

  const handleExportCSV = () => {
    if (onShowToast) {
      onShowToast('Data array serialized as CSV. Downloading lenovo_support_analytics_export.csv', 'success');
    } else {
      alert('Data array serialized as CSV. Downloading lenovo_support_analytics_export.csv');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* 1. Six Top Metrics Row exactly like screenshot */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {/* Metric 1: Resolution Time */}
        <div className="bg-white border-2 border-black p-4 flex flex-col justify-between h-28">
          <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase">RESOLUTION TIME</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-black font-mono">4.2h</span>
          </div>
          {/* Sparkline simulation */}
          <div className="w-full h-4 mt-1 bg-neutral-50 border border-neutral-200 overflow-hidden flex items-end">
            <svg className="w-full h-full" viewBox="0 0 100 20">
              <path d="M0 15 L20 18 L40 10 L60 14 L80 8 L100 3" fill="none" stroke="black" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Metric 2: First Contact Resolution */}
        <div className="bg-white border-2 border-black p-4 flex flex-col justify-between h-28">
          <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase">FIRST RESOLUTION</span>
          <div>
            <span className="text-3xl font-black font-mono text-black">78%</span>
            <div className="text-[9px] font-mono text-neutral-400 mt-1 uppercase">Target: 75% | Stable</div>
          </div>
          <div className="w-full bg-neutral-100 h-1.5 border border-black rounded-none">
            <div className="bg-black h-full w-[78%]" />
          </div>
        </div>

        {/* Metric 3: Escalation Rate */}
        <div className="bg-white border-2 border-black p-4 flex flex-col justify-between h-28">
          <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase font-mono">ESCALATION RATE</span>
          <div>
            <span className="text-3xl font-black font-mono text-neutral-900">12%</span>
            <span className="text-[9px] font-mono font-bold text-neutral-500 block uppercase">Historical: 15%</span>
          </div>
          <div className="text-[9px] font-mono text-green-600 font-bold">▼ -3% FROM Q1</div>
        </div>

        {/* Metric 4: SLA Compliance */}
        <div className="bg-white border-2 border-black p-4 flex flex-col justify-between h-28">
          <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase">SLA COMPLIANCE</span>
          <div className="flex items-center space-x-1.5">
            <svg className="w-8 h-4 shrink-0" viewBox="0 0 40 20">
              <path d="M5 20 A15 15 0 0 1 35 20" fill="none" stroke="#e5e7eb" strokeWidth="4" />
              <path d="M5 20 A15 15 0 0 1 35 20" fill="none" stroke="#22c55e" strokeWidth="4" strokeDasharray="47" strokeDashoffset="2" />
            </svg>
            <span className="text-xl font-black font-mono text-black">98%</span>
          </div>
          <div className="text-[9px] font-mono text-neutral-400 uppercase">TIER 1 TARGET COMPLIED</div>
        </div>

        {/* Metric 5: CSAT Trend */}
        <div className="bg-white border-2 border-black p-4 flex flex-col justify-between h-28">
          <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase">CSAT TREND</span>
          <div>
            <span className="text-3xl font-black font-mono text-black">94%</span>
            <span className="text-xs text-green-600 font-mono font-bold ml-1">▲</span>
          </div>
          <div className="text-[9px] font-mono text-neutral-400 uppercase">SURVEY SATISFACTION INDEX</div>
        </div>

        {/* Metric 6: Ticket Growth */}
        <div className="bg-white border-2 border-black p-4 flex flex-col justify-between h-28">
          <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase">TICKET CAPACITY</span>
          <div className="my-0.5">
            <span className="text-2xl font-black font-mono text-black">2,500</span>
            <span className="text-[9px] font-mono text-neutral-500 font-bold block">+5% Growth YoY</span>
          </div>
          {/* sparkline */}
          <div className="w-full h-3">
            <svg className="w-full h-full" viewBox="0 0 100 15">
              <path d="M0 13 L20 10 L40 12 L60 7 L80 5 L100 2" fill="none" stroke="black" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>

      {/* 2. Charts Row 1: Ticket Volume line & Resolution time by team grouped bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Widget 2a: Ticket Volume Line */}
        <div className="bg-white border-2 border-black p-5">
          <div className="flex justify-between items-center border-b border-black pb-2 mb-4">
            <div className="space-y-0.5">
              <h3 className="text-xs font-black font-sans uppercase text-neutral-900 tracking-tight">TICKET VOLUME</h3>
              <p className="text-[10px] font-mono text-neutral-400">Open, In Progress, and Closed</p>
            </div>
            <div className="border border-neutral-300 font-mono text-[10px] px-2 py-1 bg-white flex items-center">
              <span>Last 7 Days</span>
              <ChevronDown className="w-3 h-3 ml-1" />
            </div>
          </div>

          <div className="relative h-48 w-full pt-4">
            {/* Custom SVG line plot */}
            <svg className="w-full h-full" viewBox="0 0 500 160">
              {/* Lines representing different ticket states as shown in wireframe */}
              {/* Reference Grid */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4 4" />

              {/* Line 1: Open Tickets (Deep Black) */}
              <motion.path
                d="M 10 130 L 80 110 L 160 30 L 240 100 L 320 50 L 400 110 L 480 30"
                fill="none"
                stroke="#000000"
                strokeWidth="2.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
              />
              {/* Dot on crucial peaks */}
              <circle cx="160" cy="30" r="4.5" fill="black" />
              <circle cx="480" cy="30" r="5" fill="black" />

              {/* Line 2: In Progress (Gray line) */}
              <motion.path
                d="M 10 145 L 80 130 L 160 80 L 240 110 L 320 70 L 400 120 L 480 70"
                fill="none"
                stroke="#6b7280"
                strokeWidth="2"
                strokeDasharray="2 2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              />
              <circle cx="160" cy="80" r="3.5" fill="#6b7280" />
              <circle cx="480" cy="70" r="3.5" fill="#6b7280" />

              {/* Line 3: Closed (Light gray) */}
              <motion.path
                d="M 10 150 L 80 140 L 160 130 L 240 120 L 320 110 L 400 100 L 480 90"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
              />
              <circle cx="480" cy="90" r="3.5" fill="#9ca3af" />
            </svg>

            {/* Labels Legend */}
            <div className="absolute bottom-2 left-2 flex space-x-4 font-mono text-[9px] uppercase">
              <span className="flex items-center"><span className="w-2.5 h-2.5 bg-black mr-1" />Open</span>
              <span className="flex items-center"><span className="w-2.5 h-1 bg-gray-500 mr-1" />In Progress</span>
              <span className="flex items-center"><span className="w-2.5 h-0.5 bg-gray-300 mr-1" />Closed</span>
            </div>
          </div>
        </div>

        {/* Widget 2b: Resolution Time by Team (Grouped Columns) */}
        <div className="bg-white border-2 border-black p-5">
          <div className="flex justify-between items-center border-b border-black pb-2 mb-4">
            <div className="space-y-0.5">
              <h3 className="text-xs font-black font-sans uppercase text-neutral-900 tracking-tight">RESOLUTION TIME BY TEAM</h3>
              <p className="text-[10px] font-mono text-neutral-400">Team efficiency SLA tracking comparison</p>
            </div>
            <div className="border border-neutral-300 font-mono text-[10px] px-2 py-1 bg-white">
              <span>Grouped Bar Chart</span>
            </div>
          </div>

          {/* Grouped Bar Graphic */}
          <div className="h-48 w-full pt-4 pr-2 flex items-end justify-between font-mono text-xs">
            {/* L1 Team */}
            <div className="flex flex-col items-center space-y-1.5 w-20">
              <div className="flex items-end space-x-1 h-32">
                <div className="w-4 bg-black h-[70%]" title="Target" />
                <div className="w-4 bg-neutral-400 h-[50%]" title="Actual" />
              </div>
              <span className="text-[10px] font-bold text-neutral-800">L1 SUPP</span>
            </div>

            {/* L2 Team */}
            <div className="flex flex-col items-center space-y-1.5 w-20">
              <div className="flex items-end space-x-1 h-32">
                <div className="w-4 bg-black h-[85%]" title="Target" />
                <div className="w-4 bg-neutral-400 h-[75%]" title="Actual" />
              </div>
              <span className="text-[10px] font-bold text-neutral-800">L2 TECH</span>
            </div>

            {/* Billing */}
            <div className="flex flex-col items-center space-y-1.5 w-20">
              <div className="flex items-end space-x-1 h-32">
                <div className="w-4 bg-black h-[55%]" title="Target" />
                <div className="w-4 bg-neutral-400 h-[65%]" title="Actual" />
              </div>
              <span className="text-[10px] font-bold text-neutral-800">BILLING</span>
            </div>

            {/* Enterprise support */}
            <div className="flex flex-col items-center space-y-1.5 w-20">
              <div className="flex items-end space-x-1 h-32">
                <div className="w-4 bg-black h-[95%]" title="Target" />
                <div className="w-4 bg-neutral-400 h-[80%]" title="Actual" />
              </div>
              <span className="text-[10px] font-bold text-neutral-800">ENTERP</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Charts Row 2: Shaded Area CSAT trend over time */}
      <div className="bg-white border-2 border-black p-5">
        <div className="flex justify-between items-center border-b border-black pb-2 mb-4">
          <div className="space-y-0.5">
            <h3 className="text-xs font-black font-sans uppercase text-neutral-900 tracking-tight">CSAT TREND OVER TIME</h3>
            <p className="text-[10px] font-mono text-neutral-400">Tracing client satisfaction indices securely over last 30 days workload</p>
          </div>
          <div className="border border-neutral-300 font-mono text-[10px] px-2 py-1 bg-white">
            <span>Last 30 Days</span>
          </div>
        </div>

        {/* Shaded Area Chart */}
        <div className="relative h-44 w-full">
          <svg className="w-full h-full" viewBox="0 0 1000 140" preserveAspectRatio="none">
            {/* Shaded bottom gradient */}
            <path
              d="M 10 100 Q 150 80 300 105 T 600 60 T 900 45 L 1000 40 L 1000 140 L 0 140 Z"
              fill="#f3f4f6"
            />
            {/* Curve outline */}
            <motion.path
              d="M 10 100 Q 150 80 300 105 T 600 60 T 900 45 L 1000 40"
              fill="none"
              stroke="#000000"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
            {/* Dots */}
            <circle cx="150" cy="90" r="4.5" fill="white" stroke="black" strokeWidth="2" />
            <circle cx="300" cy="105" r="4.5" fill="white" stroke="black" strokeWidth="2" />
            <circle cx="600" cy="60" r="4.5" fill="white" stroke="black" strokeWidth="2" />
            <circle cx="900" cy="45" r="4.5" fill="white" stroke="black" strokeWidth="2" />
            <circle cx="1000" cy="40" r="5" fill="black" />
          </svg>
        </div>
      </div>

      {/* 4. Bottom row metrics grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Escalation Rate by Department */}
        <div className="bg-white border-2 border-black p-5">
          <h3 className="text-xs font-black font-mono uppercase text-neutral-900 border-b border-black pb-2 mb-4">
            ESCALATION RATE BY DEPT
          </h3>
          <div className="space-y-4 font-mono text-xs pt-1">
            {/* L1 support */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span>L1 SLA Escalations</span>
                <span>8%</span>
              </div>
              <div className="w-full bg-neutral-100 h-2 border border-black rounded-none">
                <div className="bg-black h-full w-[8%]" />
              </div>
            </div>

            {/* L2 Tech */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span>L2 Technical Complex</span>
                <span>15%</span>
              </div>
              <div className="w-full bg-neutral-100 h-2 border border-black rounded-none">
                <div className="bg-black h-full w-[15%]" />
              </div>
            </div>

            {/* Billing */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span>Billing Invoices</span>
                <span>5%</span>
              </div>
              <div className="w-full bg-neutral-100 h-2 border border-black rounded-none">
                <div className="bg-black h-full w-[5%]" />
              </div>
            </div>

            {/* Enterprise Support */}
            <div className="space-y-1 border-t border-neutral-100 pt-3">
              <div className="flex justify-between font-bold text-red-600">
                <span>Enterprise Gold SLA</span>
                <span>20%</span>
              </div>
              <div className="w-full bg-neutral-100 h-2 border border-red-650 rounded-none">
                <div className="bg-red-500 h-full w-[20%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Department Performance (Stacked bars representation) */}
        <div className="bg-white border-2 border-black p-5">
          <h3 className="text-xs font-black font-sans uppercase text-neutral-900 border-b border-black pb-2 mb-4">
            DEPARTMENT PRODUCTIVITY
          </h3>
          <div className="space-y-2.5 font-mono text-xs pt-1">
            <p className="text-[10px] text-neutral-400 mb-4 font-mono">Relative work capacity breakdown by operational squad:</p>
            {/* Bar representation */}
            <div className="space-y-3.5">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Squad L1-A Alpha</span>
                  <span className="font-bold">92% Productivity</span>
                </div>
                <div className="flex h-3 border border-black">
                  <div className="bg-black w-[60%]" title="Hard issues" />
                  <div className="bg-neutral-600 w-[20%]" title="Medium issues" />
                  <div className="bg-neutral-300 w-[12%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Squad L2-BIOS Beta</span>
                  <span className="font-bold">88% Productivity</span>
                </div>
                <div className="flex h-3 border border-black">
                  <div className="bg-black w-[45%]" />
                  <div className="bg-neutral-600 w-[30%]" />
                  <div className="bg-neutral-300 w-[13%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Squad Billing-C Charlie</span>
                  <span className="font-bold text-neutral-500">76% Productivity</span>
                </div>
                <div className="flex h-3 border border-neutral-300">
                  <div className="bg-neutral-900 w-[30%]" />
                  <div className="bg-neutral-600 w-[30%]" />
                  <div className="bg-neutral-200 w-[16%]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLA Priorities Compliance arc */}
        <div className="bg-white border-2 border-black p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black font-mono uppercase text-neutral-900 border-b border-black pb-2 mb-4">
              SLA PRIORITIES SNAPSHOT
            </h3>
            <div className="relative w-full flex flex-col items-center justify-center h-24">
              <svg className="w-32 h-16" viewBox="0 0 100 50">
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="black" strokeWidth="8" strokeDasharray="126" strokeDashoffset="5" />
              </svg>
              <div className="text-center">
                <span className="text-xl font-bold font-mono">98% COMPLIURE</span>
              </div>
            </div>
          </div>
          <div className="text-[10px] font-mono text-center text-neutral-400 uppercase mt-2">
            Priority-1 Ticket SLA is fully resolved. Zero current breaches.
          </div>
        </div>
      </div>

      {/* 5. Date Range & Reporting Controls at bottom */}
      <div className="bg-neutral-50 border-2 border-black p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center space-x-3 text-xs font-mono">
          <span className="font-bold flex items-center text-neutral-800">
            <Calendar className="w-4 h-4 mr-1.5 text-black" />
            DATE RANGE SELECT:
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-neutral-400 text-[10px]">FROM</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-white border border-neutral-300 p-1.5 focus:border-black focus:outline-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-neutral-400 text-[10px]">TO</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-white border border-neutral-300 p-1.5 focus:border-black focus:outline-none"
            />
          </div>
        </div>

        {/* Dispatch Action Buttons */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={handleExportPDF}
            className="bg-black text-white hover:bg-neutral-800 font-mono font-bold text-xs uppercase px-4 py-2.5 border border-black flex items-center space-x-1 transition-all"
          >
            <FileText className="w-3.5 h-3.5 mr-1" />
            <span>[Export PDF]</span>
          </button>
          
          <button
            onClick={handleExportCSV}
            className="bg-white text-black hover:bg-neutral-50 font-mono font-bold text-xs uppercase px-4 py-2.5 border border-black flex items-center space-x-1 transition-all"
          >
            <span>[Export CSV]</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
