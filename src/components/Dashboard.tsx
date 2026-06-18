import { motion } from 'motion/react';
import { Ticket, Review, TabType } from '../types';
import { ArrowUpRight, CheckCircle, AlertTriangle, RefreshCw, Star, ArrowRight } from 'lucide-react';

interface DashboardProps {
  tickets: Ticket[];
  reviews: Review[];
  setActiveTab: (tab: TabType) => void;
  setSelectedPriorityFilter?: (priority: string) => void;
  setSelectedStatusFilter?: (status: string) => void;
}

export default function Dashboard({ tickets, reviews, setActiveTab, setSelectedPriorityFilter, setSelectedStatusFilter }: DashboardProps) {
  // Compute ticket stats dynamically from our real react state
  const total = tickets.length;
  const openCount = tickets.filter(t => t.status === 'OPEN').length;
  const pendingCount = tickets.filter(t => t.status === 'PENDING').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED').length;
  const escalatedCount = tickets.filter(t => t.status === 'ESCALATED').length;

  const escalatedTickets = tickets.filter(t => t.status === 'ESCALATED' || t.priority === 'CRITICAL');

  // Compute category counts
  const categoryCounts = {
    'Product Issue': tickets.filter(t => t.subject.toLowerCase().includes('issue') || t.subject.toLowerCase().includes('fault') || t.subject.toLowerCase().includes('keyboard') || t.subject.toLowerCase().includes('crash')).length,
    'Billing': tickets.filter(t => t.subject.toLowerCase().includes('bill') || t.subject.toLowerCase().includes('invoice') || t.department === 'Billing').length,
    'Migration/Fleet': tickets.filter(t => t.subject.toLowerCase().includes('fleet') || t.subject.toLowerCase().includes('firmware') || t.subject.toLowerCase().includes('config')).length,
    'Feature Request': tickets.filter(t => t.subject.toLowerCase().includes('feature') || t.subject.toLowerCase().includes('request')).length,
    'Escalation Request': tickets.filter(t => t.status === 'ESCALATED').length,
  };

  const totalCat = Object.values(categoryCounts).reduce((a, b) => a + b, 0) || 1;

  // Render variables for arc
  const arcDashOffset = 150; // out of total stroke dash array length helper

  const handleActionClick = (ticket: Ticket) => {
    if (setSelectedStatusFilter) setSelectedStatusFilter(ticket.status);
    setActiveTab('TICKETS');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Top Welcome Notification Widget */}
      <div className="bg-black text-white p-6 flex flex-col md:flex-row items-start md:items-center justify-between border-2 border-black">
        <div className="space-y-1 max-w-2xl">
          <h1 className="text-xl font-bold tracking-tight uppercase font-sans">
            Lenovo Enterprise Support Dashboard
          </h1>
          <p className="text-neutral-300 text-xs font-mono">
            LIVE TELEMETRY STATION • COMPLIES WITH LENOVO PREMIER SUPPORTS SLA REQUIREMENTS • ALL SYSTEMS FUNCTIONAL
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-neutral-900 border border-neutral-700 px-3 py-1 text-xs font-mono">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
            <span>SLA ACTIVE</span>
          </div>
          <button 
            onClick={() => setActiveTab('TICKETS')}
            className="bg-white text-black hover:bg-neutral-100 font-mono text-xs font-bold px-3 py-1.5 border border-white flex items-center space-x-1 uppercase"
          >
            <span>Triage Tickets</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Grid of Widgets matching exact screenshots */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Widget 1: Ticket Category Distribution (Donut style) */}
        <div className="bg-white border-2 border-black p-5 flex flex-col justify-between col-span-1 lg:col-span-1 min-h-[340px]">
          <div>
            <h2 className="text-sm font-black font-sans tracking-tight uppercase text-neutral-900 border-b border-black pb-2 mb-4">
              TICKET CATEGORY DISTRIBUTION
            </h2>
            <div className="relative w-full flex items-center justify-center my-4 h-40">
              {/* Animated Custom Semi-Doughnut SVG representing category weights */}
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  stroke="#efefef"
                  strokeWidth="14"
                  fill="transparent"
                />
                {/* Product Issues: Black Segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  stroke="#000000"
                  strokeWidth="14"
                  fill="transparent"
                  strokeDasharray="226"
                  strokeDashoffset={226 - (226 * (categoryCounts['Product Issue'] || 4) / totalCat)}
                  className="transition-all duration-1000"
                />
                {/* Billing: Gray Segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  stroke="#525252"
                  strokeWidth="14"
                  fill="transparent"
                  strokeDasharray="226"
                  strokeDashoffset={226 - (226 * (categoryCounts['Billing'] || 3) / totalCat)}
                  className="transition-all duration-1000 transform rotate-45"
                />
                {/* Feature Request: Light gray */}
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  stroke="#a3a3a3"
                  strokeWidth="14"
                  fill="transparent"
                  strokeDasharray="226"
                  strokeDashoffset={226 - (226 * (categoryCounts['Feature Request'] || 2) / totalCat)}
                  className="transition-all duration-1000 transform rotate-90"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black font-mono">{total}</span>
                <span className="text-[9px] font-mono font-bold text-neutral-400">TICKETS</span>
              </div>
            </div>
          </div>
          
          {/* Key / Legend below */}
          <div className="text-[10px] font-mono space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center"><span className="w-2.5 h-2.5 bg-black mr-1.5" />Product Issue</span>
              <span className="font-bold">{categoryCounts['Product Issue']}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center"><span className="w-2.5 h-2.5 bg-neutral-600 mr-1.5" />Billing</span>
              <span className="font-bold">{categoryCounts['Billing']}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center"><span className="w-2.5 h-2.5 bg-neutral-400 mr-1.5" />Feature Request</span>
              <span className="font-bold">{categoryCounts['Feature Request']}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center"><span className="w-2.5 h-2.5 bg-neutral-200 mr-1.5" />Escalations</span>
              <span className="font-bold">{categoryCounts['Escalation Request']}</span>
            </div>
          </div>
        </div>

        {/* Widget 2: Recent Escalations List */}
        <div className="bg-white border-2 border-black p-5 flex flex-col justify-between col-span-1 lg:col-span-1 min-h-[340px]">
          <div>
            <h2 className="text-sm font-black font-sans tracking-tight uppercase text-neutral-900 border-b border-black pb-2 mb-4">
              RECENT ESCALATIONS
            </h2>
            
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
              {escalatedTickets.slice(0, 4).map((ticket) => (
                <div 
                  key={ticket.id} 
                  onClick={() => handleActionClick(ticket)}
                  className="border-b border-neutral-200 pb-3 hover:bg-neutral-50 cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <span className="bg-neutral-100 text-black border border-black font-mono text-[9px] font-bold px-1 py-0.5">
                      {ticket.id}
                    </span>
                    <span className="flex items-center text-[10px] uppercase font-mono font-bold text-red-600">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      ESCALA.
                    </span>
                  </div>
                  <p className="text-[11px] font-bold mt-1 text-neutral-900 group-hover:underline line-clamp-1">
                    {ticket.customer}
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono mt-0.5 truncate">
                    Reason: {ticket.priority === 'CRITICAL' ? 'High Severity Bug' : 'SLA Breach Threat'}
                  </p>
                </div>
              ))}
              {escalatedTickets.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center py-8 text-neutral-400 font-mono">
                  <CheckCircle className="w-6 h-6 text-green-500 mb-1" />
                  <span className="text-xs font-bold">ALL STABLE</span>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setActiveTab('TICKETS')}
            className="w-full text-center py-2 text-xs font-mono font-bold hover:bg-neutral-50 border-t border-black uppercase flex items-center justify-center space-x-1"
          >
            <span>View Escalated Folders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Widget 3: CSAT Table Distribution Snapshot */}
        <div className="bg-white border-2 border-black p-5 flex flex-col justify-between col-span-1 lg:col-span-1 min-h-[340px]">
          <div>
            <h2 className="text-sm font-black font-sans tracking-tight uppercase text-neutral-900 border-b border-black pb-2 mb-4">
              STATUS OVERVIEW
            </h2>
            <div className="font-mono text-xs divide-y divide-neutral-200">
              <div className="py-2.5 flex justify-between font-bold text-neutral-400">
                <span>METRIC</span>
                <span>COUNT</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-neutral-700 font-bold">Open Tickets</span>
                <span className="bg-neutral-100 px-2 py-0.5 border border-black font-bold font-mono">{openCount}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-neutral-700">Pending Clarification</span>
                <span className="font-bold">{pendingCount}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-neutral-700">Resolved Customer</span>
                <span className="font-bold text-neutral-600">{resolvedCount}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-red-600 font-bold">Active Escalations</span>
                <span className="bg-red-50 text-red-600 border border-red-600 px-2 py-0.5 font-bold font-mono">{escalatedCount}</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-neutral-500 bg-neutral-50 border border-neutral-200 p-2 text-center">
            Updated instantly on agent work status.
          </div>
        </div>

        {/* Widget 4: CSAT Rating Progress Indicator */}
        <div className="bg-white border-2 border-black p-5 flex flex-col justify-between col-span-1 lg:col-span-1 min-h-[340px]">
          <div>
            <h2 className="text-sm font-black font-sans tracking-tight uppercase text-neutral-900 border-b border-black pb-2 mb-4">
              CSAT PERFORMANCE
            </h2>
            
            <div className="space-y-4 pt-1">
              {/* Excellent (5 stars) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex text-neutral-900 items-center">
                    <span className="font-bold mr-1.5">5★</span>
                    <span className="text-[10px] text-neutral-500 font-sans">Excellent</span>
                  </div>
                  <span className="font-bold font-mono text-neutral-900">54%</span>
                </div>
                <div className="w-full bg-neutral-100 h-2.5 rounded-none border border-black">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '54%' }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="bg-black h-full"
                  />
                </div>
              </div>

              {/* Good (4 stars) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex text-neutral-900 items-center">
                    <span className="font-bold mr-1.5">4★</span>
                    <span className="text-[10px] text-neutral-500 font-sans">Good</span>
                  </div>
                  <span className="font-bold font-mono text-neutral-900">30%</span>
                </div>
                <div className="w-full bg-neutral-100 h-2.5 rounded-none border border-neutral-300">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '30%' }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
                    className="bg-neutral-700 h-full"
                  />
                </div>
              </div>

              {/* Neutral (3 stars) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex text-neutral-900 items-center">
                    <span className="font-bold mr-1.5">3★</span>
                    <span className="text-[10px] text-neutral-500 font-sans">Neutral</span>
                  </div>
                  <span className="font-bold font-mono text-neutral-800">10%</span>
                </div>
                <div className="w-full bg-neutral-100 h-2.5 rounded-none border border-neutral-300">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '10%' }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    className="bg-neutral-500 h-full"
                  />
                </div>
              </div>

              {/* Poor (1 or 2 stars) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex text-neutral-900 items-center">
                    <span className="font-bold mr-1.5">1-2★</span>
                    <span className="text-[10px] text-neutral-500 font-sans">Poor</span>
                  </div>
                  <span className="font-bold font-mono text-red-600">6%</span>
                </div>
                <div className="w-full bg-neutral-100 h-2.5 rounded-none border border-neutral-300">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '6%' }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                    className="bg-red-500 h-full"
                  />
                </div>
              </div>

            </div>
          </div>
          
          <button
            onClick={() => setActiveTab('FEEDBACK')}
            className="w-full text-center py-2 text-xs font-mono font-bold hover:bg-neutral-50 border-t border-black uppercase flex items-center justify-center space-x-1 mt-2"
          >
            <span>Analyze Customer Sentiment</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Widget 5: SLA Compliance Semi-Circle Snapshot */}
        <div className="bg-white border-2 border-black p-5 flex flex-col justify-between col-span-1 lg:col-span-1 min-h-[340px]">
          <div>
            <h2 className="text-sm font-black font-sans tracking-tight uppercase text-neutral-900 border-b border-black pb-2 mb-4">
              SLA COMPLIANCE SNAPSHOT
            </h2>
            <div className="relative w-full flex flex-col items-center justify-center my-4 h-32">
              {/* Semi circle arc gauge */}
              <svg className="w-36 h-20" viewBox="0 0 100 50">
                {/* Background track */}
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="#efefef"
                  strokeWidth="12"
                  strokeLinecap="square"
                />
                {/* Gauge compliance line (98%) */}
                <motion.path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="12"
                  strokeLinecap="square"
                  strokeDasharray="126"
                  initial={{ strokeDashoffset: 126 }}
                  animate={{ strokeDashoffset: 126 - (126 * 0.98) }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </svg>
              <div className="text-center mt-2">
                <span className="text-3xl font-black font-mono tracking-tighter text-neutral-900">98%</span>
                <p className="text-[9px] font-mono font-bold text-neutral-400 mt-0.5 tracking-wider uppercase">
                  OVERALL SLA COMPLIANCE
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-mono text-neutral-600 bg-neutral-50 border border-neutral-200 p-2 text-center rounded-none line-clamp-2">
              Lenovo Premium Support tier rule is set to 95% threshold. Overall compliance is stable at 98%.
            </div>
            <button
              onClick={() => setActiveTab('ANALYTICS')}
              className="w-full text-center py-2 text-xs font-mono font-bold hover:bg-black hover:text-white bg-white text-black border border-black uppercase flex items-center justify-center space-x-1"
            >
              <span>Audit SLA details</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* Quick Access Grid / Actions for Lenovo support engineers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-black p-5 relative overflow-hidden group hover:shadow-md transition-shadow">
          <h3 className="font-mono text-xs font-bold text-neutral-400 uppercase">TIER 1 SUPPORT</h3>
          <h4 className="text-base font-bold font-sans mt-1">L1 Support Queue (ThinkPads)</h4>
          <p className="text-xs text-neutral-600 mt-2 font-sans line-clamp-2">
            Inspect fast-response hardware warranties, keyboard and power diagnostic ticket items. Current queue has {tickets.filter(t => t.department === 'L1 Support').length} active records.
          </p>
          <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-between items-center text-xs font-mono font-bold">
            <button onClick={() => setActiveTab('TICKETS')} className="hover:underline flex items-center">
              <span>View Queue</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </button>
            <span className="text-neutral-400">Target Time: 4h</span>
          </div>
        </div>

        <div className="bg-white border-2 border-black p-5 relative overflow-hidden group hover:shadow-md transition-shadow">
          <h3 className="font-mono text-xs font-bold text-neutral-400 uppercase">TIER 2 ENGINEERING</h3>
          <h4 className="text-base font-bold font-sans mt-1">L2 Technical Engineering (Legion & Yoga)</h4>
          <p className="text-xs text-neutral-600 mt-2 font-sans line-clamp-2">
            Handles complex motherboard, GPU, dual-screen drivers, and premium BIOS dispatching activities. Currently handling {tickets.filter(t => t.department === 'L2 Technical').length} cases.
          </p>
          <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-between items-center text-xs font-mono font-bold">
            <button onClick={() => setActiveTab('TICKETS')} className="hover:underline flex items-center">
              <span>Inspect Engineering</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </button>
            <span className="text-red-500 font-black">Escalation Priority</span>
          </div>
        </div>

        <div className="bg-white border-2 border-black p-5 relative overflow-hidden group hover:shadow-md transition-shadow">
          <h3 className="font-mono text-xs font-bold text-neutral-400 uppercase">PREMIER CONTRACTS</h3>
          <h4 className="text-base font-bold font-sans mt-1">SLA Contract Monitoring</h4>
          <p className="text-xs text-neutral-600 mt-2 font-sans line-clamp-2">
            Manage active Service Level Agreements (SLA) for enterprise divisions including Soylent, Globex and Acme. Auto alerts trigger notification.
          </p>
          <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-between items-center text-xs font-mono font-bold">
            <button onClick={() => setActiveTab('ADMIN & SETTINGS')} className="hover:underline flex items-center">
              <span>Review SLA Configuration</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </button>
            <span className="text-green-600">3 Rules Active</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
