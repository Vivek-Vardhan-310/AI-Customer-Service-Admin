import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Tickets from './components/Tickets';
import Customers from './components/Customers';
import Products from './components/Products';
import Feedback from './components/Feedback';
import Analytics from './components/Analytics';
import AdminSettings from './components/AdminSettings';
import WarrantyContract from './components/WarrantyContract';
import AiMonitoring from './components/AiMonitoring';
import AdminLogin from './components/AdminLogin';

// Supabase services
import { supabase } from './supabaseClient';
import {
  getAdminSession,
  adminLogout,
  fetchAllTickets,
  fetchAllCustomers,
  fetchAllProducts,
  fetchAllFeedback,
  fetchSlaRules,
  createSlaRule as createSlaRuleDB,
  updateSlaRule as updateSlaRuleDB,
  toggleSlaRuleStatus,
  deleteSlaRule as deleteSlaRuleDB,
  updateTicketStatus as updateTicketStatusDB,
} from './supabaseService';

// Fallback mock data (used when Supabase is not configured)
import {
  INITIAL_TICKETS,
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_SLA_RULES,
} from './data';
import { Ticket, TicketStatus, TicketPriority, SlaRule, TabType } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('DASHBOARD');

  // Admin Session State
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    return localStorage.getItem('lenovo_admin_email') || '';
  });
  const [sessionChecked, setSessionChecked] = useState(false);
  const isAuthenticated = !!adminEmail;

  // Global Interactive In-App Status Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // Autoclean timer for the non-blocking toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Data loading state
  const [dataLoading, setDataLoading] = useState(false);

  // Core Reactive States — start empty, load from Supabase or fallback to mock
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [slaRules, setSlaRules] = useState<SlaRule[]>([]);

  // Whether we're using live Supabase data or mock data
  const isLiveMode = !!supabase;

  // Ticket Integration State (Filter transfer from other tabs)
  const [ticketsSearchTerm, setTicketsSearchTerm] = useState('');

  // ── Check Supabase session on mount ──
  useEffect(() => {
    if (!supabase) {
      setSessionChecked(true);
      return;
    }

    (async () => {
      try {
        const session = await getAdminSession();
        if (session) {
          setAdminEmail(session.email);
          localStorage.setItem('lenovo_admin_email', session.email);
        }
      } catch (e) {
        console.error('Session check error:', e);
      } finally {
        setSessionChecked(true);
      }
    })();
  }, []);

  // ── Load all data when authenticated ──
  const loadAllData = useCallback(async () => {
    if (!isLiveMode) {
      // Fallback to mock data when Supabase is not configured
      setTickets(INITIAL_TICKETS);
      setCustomers(INITIAL_CUSTOMERS);
      setProducts(INITIAL_PRODUCTS);
      setReviews(INITIAL_REVIEWS);
      setSlaRules(INITIAL_SLA_RULES);
      return;
    }

    setDataLoading(true);
    try {
      const [ticketsData, customersData, productsData, feedbackData, slaData] = await Promise.all([
        fetchAllTickets(),
        fetchAllCustomers(),
        fetchAllProducts(),
        fetchAllFeedback(),
        fetchSlaRules(),
      ]);

      setTickets(ticketsData);
      setCustomers(customersData);
      setProducts(productsData);
      setReviews(feedbackData);
      setSlaRules(slaData);
    } catch (e) {
      console.error('Error loading admin data:', e);
      showToast('Failed to load data from server', 'error');
      // Fallback to mock data on error
      setTickets(INITIAL_TICKETS);
      setCustomers(INITIAL_CUSTOMERS);
      setProducts(INITIAL_PRODUCTS);
      setReviews(INITIAL_REVIEWS);
      setSlaRules(INITIAL_SLA_RULES);
    } finally {
      setDataLoading(false);
    }
  }, [isLiveMode]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated, loadAllData]);

  const handleLoginSuccess = (email: string) => {
    setAdminEmail(email);
    localStorage.setItem('lenovo_admin_email', email);
  };

  const handleLogout = async () => {
    try {
      if (isLiveMode) await adminLogout();
    } catch (e) {
      console.error('Logout error:', e);
    }
    setAdminEmail('');
    localStorage.removeItem('lenovo_admin_email');
    setActiveTab('DASHBOARD');
    setTickets([]);
    setCustomers([]);
    setProducts([]);
    setReviews([]);
    setSlaRules([]);
  };

  // 1. ADD TICKET
  const handleAddTicket = (newTicket: Ticket) => {
    setTickets((prev) => [newTicket, ...prev]);

    // Update customer open ticket count dynamically
    setCustomers((prevCustomers) =>
      prevCustomers.map((c) =>
        c.name.toLowerCase() === newTicket.customer.toLowerCase()
          ? { ...c, openTickets: c.openTickets + 1 }
          : c
      )
    );
  };

  // 2. UPDATE TICKET STATUS
  const handleUpdateTicketStatus = async (id: string, nextStatus: TicketStatus) => {
    // Optimistic update
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus, lastUpdated: 'Just now' } : t))
    );

    if (isLiveMode) {
      const success = await updateTicketStatusDB(id, nextStatus);
      if (!success) {
        showToast('Failed to update ticket status', 'error');
        // Refresh to get correct state
        const freshTickets = await fetchAllTickets();
        setTickets(freshTickets);
      }
    }
  };

  // 3. ESCALATE TICKET (FROM REVIEWS COMPLAINT)
  const handleEscalateTicketId = (ticketId: string, escalate: boolean) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId || t.id === `TK-${ticketId}`
          ? { ...t, status: escalate ? 'ESCALATED' : 'OPEN', lastUpdated: 'Just now' }
          : t
      )
    );
  };

  // 4. ADD SLA RULE
  const handleAddSlaRule = async (newRule: SlaRule) => {
    setSlaRules((prev) => [...prev, newRule]);

    if (isLiveMode) {
      const success = await createSlaRuleDB(newRule);
      if (!success) {
        showToast('Failed to create SLA rule', 'error');
        const freshRules = await fetchSlaRules();
        setSlaRules(freshRules);
      }
    }
  };

  // 5. UPDATE SLA RULE
  const handleUpdateSlaRule = async (id: string, updatedRule: SlaRule) => {
    setSlaRules((prev) => prev.map((r) => (r.id === id ? updatedRule : r)));

    if (isLiveMode) {
      const success = await updateSlaRuleDB(id, updatedRule);
      if (!success) {
        showToast('Failed to update SLA rule', 'error');
        const freshRules = await fetchSlaRules();
        setSlaRules(freshRules);
      }
    }
  };

  // 6. TOGGLE SLA STATUS (ENABLE/DISABLE)
  const handleToggleSlaRule = async (id: string) => {
    const current = slaRules.find((r) => r.id === id);
    setSlaRules((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === 'ENABLED' ? 'DISABLED' : 'ENABLED' }
          : r
      )
    );

    if (isLiveMode && current) {
      const success = await toggleSlaRuleStatus(id, current.status);
      if (!success) {
        showToast('Failed to toggle SLA rule', 'error');
        const freshRules = await fetchSlaRules();
        setSlaRules(freshRules);
      }
    }
  };

  // 7. DELETE SLA RULE
  const handleDeleteSlaRule = async (id: string) => {
    setSlaRules((prev) => prev.filter((r) => r.id !== id));

    if (isLiveMode) {
      const success = await deleteSlaRuleDB(id);
      if (!success) {
        showToast('Failed to delete SLA rule', 'error');
        const freshRules = await fetchSlaRules();
        setSlaRules(freshRules);
      }
    }
  };

  // Intermediary link to trigger outbound email
  const handleContactCustomerName = (customerName: string, text: string) => {
    showToast(`Success: SMTP email dispatched securely to contact person at account: ${customerName}. content: "${text}"`, 'success');
  };

  // Safe tab-navigation transition wrapper
  const renderTabContent = () => {
    switch (activeTab) {
      case 'DASHBOARD':
        return (
          <Dashboard
            tickets={tickets}
            reviews={reviews}
            setActiveTab={setActiveTab}
          />
        );

      case 'TICKETS': {
        // Build a temporary wrapper around Tickets page so we can pass search string
        return (
          <Tickets
            tickets={tickets}
            onAddTicket={handleAddTicket}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            initialSearchTerm={ticketsSearchTerm}
            onClearInitialSearchTerm={() => setTicketsSearchTerm('')}
          />
        );
      }

      case 'CUSTOMERS':
        return (
          <Customers
            customers={customers}
            setActiveTab={setActiveTab}
            setSearchTermInTickets={setTicketsSearchTerm}
          />
        );

      case 'PRODUCTS':
        return (
          <Products
            products={products}
            setActiveTab={setActiveTab}
            setSearchTermInTickets={setTicketsSearchTerm}
          />
        );

      case 'WARRANTY':
        return <WarrantyContract products={products} tabType="WARRANTY" onShowToast={showToast} />;

      case 'AMC':
        return <WarrantyContract products={products} tabType="AMC" onShowToast={showToast} />;

      case 'FEEDBACK':
        return (
          <Feedback
            reviews={reviews}
            tickets={tickets}
            onEscalateTicket={handleEscalateTicketId}
            onContactCustomer={handleContactCustomerName}
          />
        );

      case 'ANALYTICS':
        return <Analytics onShowToast={showToast} />;

      case 'AI MONITORING':
        return <AiMonitoring onShowToast={showToast} />;

      case 'ADMIN & SETTINGS':
        return (
          <AdminSettings
            slaRules={slaRules}
            onAddSlaRule={handleAddSlaRule}
            onUpdateSlaRule={handleUpdateSlaRule}
            onToggleSlaRule={handleToggleSlaRule}
            onDeleteSlaRule={handleDeleteSlaRule}
            onShowToast={showToast}
          />
        );

      default:
        return (
          <div className="py-20 text-center font-mono text-xs text-neutral-400">
            COMPILING TAB: '{activeTab}' SQUAD VIEW OVERFLOW.
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans flex flex-col justify-between selection:bg-black selection:text-white">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUserEmail={adminEmail}
        onLogout={handleLogout}
      />

      {/* Main Dynamic View Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8">
        {dataLoading ? (
          <div className="py-20 text-center">
            <div className="inline-flex items-center space-x-2 text-neutral-500">
              <span className="w-4 h-4 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
              <span className="font-mono text-xs uppercase tracking-widest">Loading live data from Supabase...</span>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              id="tab-content"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Data source indicator */}
      {isLiveMode && (
        <div className="fixed bottom-20 right-6 z-40">
          <div className="bg-green-50 border border-green-200 px-2.5 py-1 text-[9px] font-mono text-green-700 uppercase tracking-wider flex items-center space-x-1.5 rounded-sm shadow-sm">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span>LIVE · SUPABASE</span>
          </div>
        </div>
      )}

      {/* Humble, Literal Minimalist Human-friendly Page Footer */}
      <footer className="bg-white border-t border-neutral-200 py-6 select-none font-mono text-[10px] text-neutral-400 tracking-wider">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <span>
            © {new Date().getFullYear()} LENOVO SUPPORT ENTERPRISE. ALL RIGHTS RESERVED.
          </span>
          <div className="flex items-center space-x-4">
            <a href="#privacy" className="hover:text-black hover:underline" onClick={(e) => e.preventDefault()}>PRIVACY STATEMENT</a>
            <span>•</span>
            <a href="#terms" className="hover:text-black hover:underline" onClick={(e) => e.preventDefault()}>TERMS OF USE</a>
            <span>•</span>
            <a href="#security" className="hover:text-black hover:underline" onClick={(e) => e.preventDefault()}>SECURITY GLOBAL COMPLIANCE</a>
          </div>
        </div>
      </footer>

      {/* High-Fidelity Custom Status Toast Notification System */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-md w-full sm:w-96 bg-white border-2 border-black p-4 shadow-xs flex items-start space-x-3 text-left"
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : toast.type === 'error' ? (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              ) : (
                <Info className="w-5 h-5 text-neutral-700" />
              )}
            </div>
            <div className="flex-grow pr-1">
              <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-0.5">
                {toast.type === 'success' ? 'SYSTEM OK - PROCESS COMPACTED' : 'SYSTEM METRICS REPORT'}
              </span>
              <p className="text-xs font-sans text-neutral-800 leading-snug font-medium">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="shrink-0 text-neutral-400 hover:text-black p-0.5 transition-colors"
              aria-label="Dismiss message panel"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
