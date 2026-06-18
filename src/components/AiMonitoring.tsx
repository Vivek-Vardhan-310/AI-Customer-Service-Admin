import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Search, CheckCircle2, ShieldAlert, Play, Sliders, RefreshCw, Send, ArrowRight } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  clientEmail: string;
  issueSnippet: string;
  predictedDept: string;
  confidence: number; // e.g. 0.94
  status: 'ROUTED' | 'HEURISTIC' | 'HUMAN_REVIEW';
}

interface AiMonitoringProps {
  onShowToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export default function AiMonitoring({ onShowToast }: AiMonitoringProps = {}) {
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.8);
  const [testEmail, setTestEmail] = useState('');
  const [isClassifying, setIsClassifying] = useState(false);

  // Initial Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'AI-485',
      timestamp: '10:14:02',
      clientEmail: 'admin@acme.com',
      issueSnippet: 'ThinkPad X1 keyboard keyboard controller keys not responding after BIOS v1.12 update',
      predictedDept: 'L2 Technical',
      confidence: 0.96,
      status: 'ROUTED',
    },
    {
      id: 'AI-484',
      timestamp: '10:11:50',
      clientEmail: 'billing@globex.org',
      issueSnippet: 'Request tax invoice refund for excess premium Premier warranty onsite renewal billing dispatch',
      predictedDept: 'Billing',
      confidence: 0.98,
      status: 'ROUTED',
    },
    {
      id: 'AI-483',
      timestamp: '10:05:14',
      clientEmail: 'fanatic@legiongamers.cf',
      issueSnippet: 'BIOS overclocking toggle option locked out in Vantage control module. Seeking standard patch.',
      predictedDept: 'L2 Technical',
      confidence: 0.92,
      status: 'ROUTED',
    },
    {
      id: 'AI-482',
      timestamp: '09:55:00',
      clientEmail: 'lgreen@soylent.co',
      issueSnippet: 'Motherboard PXE boot cyclic redundancy checks failed on ThinkCentre workstation fleet',
      predictedDept: 'L1 Support',
      confidence: 0.74,
      status: 'HUMAN_REVIEW', // Below threshold
    },
    {
      id: 'AI-481',
      timestamp: '09:41:12',
      clientEmail: 'info@technova.io',
      issueSnippet: 'General warranty quote request for battery replacements on older ThinkPad T14 laptops',
      predictedDept: 'L1 Support',
      confidence: 0.88,
      status: 'ROUTED',
    }
  ]);

  // Simulate incoming logs randomly over time
  useEffect(() => {
    const snippets = [
      { text: "Lenovo Vantage software suite crashes immediately upon clicking system diagnostics panel", dept: "L2 Technical", email: "tech@initech.com" },
      { text: "Incorrect item dispatch billing discrepancy regarding standard computer docking stations invoice", dept: "Billing", email: "procure@bostonconsulting.com" },
      { text: "My desktop ThinkCentre fan is emitting a clicking noise. Onsite dispatch warranty needed", dept: "L1 Support", email: "office@hooli.xyz" },
    ];

    const interval = setInterval(() => {
      const pick = snippets[Math.floor(Math.random() * snippets.length)];
      const confidence = parseFloat((0.6 + Math.random() * 0.38).toFixed(2));
      const status = confidence >= confidenceThreshold ? 'ROUTED' : 'HUMAN_REVIEW';
      
      const newEntry: LogEntry = {
        id: `AI-${Math.floor(486 + Math.random() * 100)}`,
        timestamp: new Date().toTimeString().split(' ')[0],
        clientEmail: pick.email,
        issueSnippet: pick.text,
        predictedDept: pick.dept,
        confidence,
        status,
      };

      setLogs(prev => [newEntry, ...prev.slice(0, 9)]);
    }, 15000); // add new entry every 15s

    return () => clearInterval(interval);
  }, [confidenceThreshold]);

  // Handle custom manual query testing
  const handleTestClassifier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.trim()) return;

    setIsClassifying(true);
    setTimeout(() => {
      const text = testEmail.toLowerCase();
      let predicted = 'L1 Support';
      if (text.includes('bill') || text.includes('invoice') || text.includes('payment') || text.includes('pricing')) {
        predicted = 'Billing';
      } else if (text.includes('bios') || text.includes('overclock') || text.includes('driver') || text.includes('firmware') || text.includes('motherboard')) {
        predicted = 'L2 Technical';
      }

      const conf = parseFloat((0.75 + Math.random() * 0.23).toFixed(2));
      const status = conf >= confidenceThreshold ? 'ROUTED' : 'HUMAN_REVIEW';

      const userEntry: LogEntry = {
        id: `AI-USR-${Math.floor(10 + Math.random() * 90)}`,
        timestamp: new Date().toTimeString().split(' ')[0],
        clientEmail: 'interactive.test@lenovo.com',
        issueSnippet: testEmail,
        predictedDept: predicted,
        confidence: conf,
        status,
      };

      setLogs(prev => [userEntry, ...prev]);
      setTestEmail('');
      setIsClassifying(false);
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start font-sans">
      {/* 1. Left Sidepane: Configuration and controls */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white border-2 border-black p-5 space-y-5"
      >
        <div className="border-b border-black pb-2 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-black" />
          <h2 className="text-xs font-black font-mono uppercase tracking-tight text-neutral-950">
            AUTO-ROUTING AGENT CONTROLS
          </h2>
        </div>

        {/* Confidence threshold modifier slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="font-bold text-neutral-800 uppercase">ROUTER CONFIDENCE</span>
            <span className="bg-black text-white px-1.5 py-0.5 border text-[10px] font-bold">
              {(confidenceThreshold * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-[10px] font-sans text-neutral-400">
            Classification requests with confidence score under this threshold are placed in human review.
          </p>
          <input
            type="range"
            min="0.5"
            max="0.95"
            step="0.05"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
            className="w-full accent-black cursor-pointer"
          />
        </div>

        {/* System telemetry settings */}
        <div className="border border-neutral-300 p-3 bg-neutral-50 text-[10px] font-mono space-y-1.5">
          <span className="font-bold block text-neutral-500 uppercase">SYS TELEMETRY STATUS</span>
          <div className="flex justify-between">
            <span>MODEL:</span>
            <span className="font-bold text-black font-sans uppercase">LLM_ROUTER_V3_PRECISE</span>
          </div>
          <div className="flex justify-between">
            <span>LATENCY AVG:</span>
            <span className="font-bold">42ms</span>
          </div>
          <div className="flex justify-between">
            <span>ACCURACY RATE:</span>
            <span className="font-bold text-green-600">97.8%</span>
          </div>
          <div className="flex justify-between">
            <span>DISPATCH MODE:</span>
            <span className="font-bold bg-neutral-200 text-black px-1">AUTO_INLINE</span>
          </div>
        </div>

        {/* Test Classification Form */}
        <form onSubmit={handleTestClassifier} className="space-y-2 border-t border-neutral-100 pt-4">
          <span className="text-xs font-mono font-bold uppercase text-neutral-800 block">
            CLASSIFICATION TEST BENCH
          </span>
          <textarea
            required
            rows={3}
            placeholder="Type sample client query and watch the AI route it instantly..."
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="w-full bg-neutral-50 font-mono text-[11px] border border-neutral-300 p-2 focus:border-black focus:outline-none"
          />
          <button
            type="submit"
            disabled={isClassifying}
            className="w-full bg-black text-white font-mono text-xs font-bold py-2 hover:bg-neutral-800 uppercase flex items-center justify-center space-x-1 border border-black disabled:bg-neutral-400"
          >
            {isClassifying ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Send className="w-3 h-3 mr-1" />
                <span>ROUTE TEST INPUT</span>
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* 2. Right Side: Real-time Live Log entries */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-3 bg-white border-2 border-black p-5"
      >
        <div className="border-b border-black pb-3 mb-4 flex justify-between items-center">
          <div className="space-y-0.5 animate-pulse">
            <h2 className="text-lg font-black font-sans uppercase text-neutral-900 tracking-tight flex items-center">
              <span className="w-2.5 h-2.5 bg-red-600 rounded-full mr-2.5" />
              Live AI Routing Stream
            </h2>
            <span className="font-mono text-[10px] text-neutral-400 uppercase">
              RECOGNIZING CLIENT EMAILS AND AUTO-TIERING WORKLOADS VIA LENOVO PREMIER AGENTS
            </span>
          </div>

          <button
            onClick={() => {
              if (onShowToast) {
                onShowToast('Logs cleared successfully.', 'success');
              } else {
                alert('Logs cleared successfully.');
              }
              setLogs([]);
            }}
            className="text-[10px] hover:underline font-mono text-neutral-500 uppercase px-2 py-1 bg-neutral-50 border border-neutral-200"
          >
            Clear Screen
          </button>
        </div>

        {/* Live Entries listing */}
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="border border-black p-4 relative group hover:shadow-xs transition-shadow bg-white"
              >
                {/* Meta details header line */}
                <div className="flex items-center justify-between font-mono text-[10px] border-b border-neutral-100 pb-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold bg-neutral-100 text-black px-1.5 py-0.5 border border-black">
                      #{log.id}
                    </span>
                    <span className="text-neutral-400 font-medium">TIMESTAMP: {log.timestamp}</span>
                    <span className="text-neutral-300">|</span>
                    <span className="text-neutral-500 font-semibold uppercase">{log.clientEmail}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span className="text-neutral-400 uppercase">CONFIDENCE:</span>
                    <span className={`font-bold font-sans ${log.confidence >= confidenceThreshold ? 'text-green-600' : 'text-amber-600'}`}>
                      {(log.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Main description paragraph */}
                <p className="text-xs text-neutral-800 leading-relaxed font-medium font-sans pr-4 pr-12 text-justify select-text">
                  "{log.issueSnippet}"
                </p>

                {/* Routing Action indicators at bottom */}
                <div className="mt-3.5 pt-2.5 border-t border-dotted border-neutral-200 flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center space-x-1 text-[11px]">
                    <span className="text-neutral-400">DECISION:</span>
                    <span className="font-bold text-neutral-900 uppercase">CLASSIFY TO</span>
                    <ArrowRight className="w-3 h-3 text-neutral-400 mx-1" />
                    <span className="bg-black text-white px-2 py-0.5 font-bold">{log.predictedDept}</span>
                  </div>

                  {/* Status Badge */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 border ${
                    log.status === 'ROUTED'
                      ? 'border-green-600 text-green-700 bg-green-50'
                      : 'border-amber-500 text-amber-700 bg-amber-50 animate-pulse'
                  }`}>
                    {log.status === 'ROUTED' ? '✓ AGENT_ROUTED' : '⚡ HUMAN_REVIEW_REQ'}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {logs.length === 0 && (
            <div className="py-20 text-center text-neutral-400 font-mono flex flex-col items-center justify-center space-y-2">
              <Cpu className="w-8 h-8 text-neutral-200 animate-spin" />
              <span className="text-xs block">INITIALIZING AUTO-ROUTER STREAM... EXECUTING DIAGNOSTIC TRACE.</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
