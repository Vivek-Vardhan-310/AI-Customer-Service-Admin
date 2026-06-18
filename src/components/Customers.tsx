import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Customer, CustomerPlan, CustomerStatus, TabType } from '../types';
import { Search, Filter, Shield, User, MapPin, Laptop, AlertCircle, X, Mail, Phone, ExternalLink } from 'lucide-react';

interface CustomersProps {
  customers: Customer[];
  setActiveTab: (tab: TabType) => void;
  setSearchTermInTickets?: (search: string) => void;
}

export default function Customers({ customers, setActiveTab, setSearchTermInTickets }: CustomersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlans, setSelectedPlans] = useState<CustomerPlan[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<CustomerStatus[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState('ALL');

  // Interactive details modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  const [isContacting, setIsContacting] = useState(false);

  // Plan Toggle
  const handlePlanToggle = (plan: CustomerPlan) => {
    setSelectedPlans(prev => 
      prev.includes(plan) ? prev.filter(p => p !== plan) : [...prev, plan]
    );
  };

  // Status Toggle
  const handleStatusToggle = (status: CustomerStatus) => {
    setSelectedStatus(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  // Industries list computed dynamically
  const industries = useMemo(() => {
    const list = customers.map(c => c.industry);
    return ['ALL', ...Array.from(new Set(list))];
  }, [customers]);

  // Filtering Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPlan = 
        selectedPlans.length === 0 || 
        selectedPlans.includes(customer.plan);

      const matchesStatus = 
        selectedStatus.length === 0 || 
        selectedStatus.includes(customer.status);

      const matchesIndustry = 
        selectedIndustry === 'ALL' || 
        customer.industry === selectedIndustry;

      return matchesSearch && matchesPlan && matchesStatus && matchesIndustry;
    });
  }, [customers, searchTerm, selectedPlans, selectedStatus, selectedIndustry]);

  const handleOpenTicketsClick = (customerName: string) => {
    if (setSearchTermInTickets) {
      setSearchTermInTickets(customerName);
    }
    setActiveTab('TICKETS');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      {/* 1. Filter Sidepane exactly like wireframe */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white border-2 border-black p-5"
      >
        <div className="flex items-center justify-between border-b border-black pb-2 mb-4">
          <h2 className="text-xs font-black font-mono uppercase tracking-tight text-neutral-950 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-2" />
            FILTER & SEARCH
          </h2>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedPlans([]);
              setSelectedStatus([]);
              setSelectedIndustry('ALL');
            }}
            className="text-[10px] font-mono hover:underline text-neutral-500"
          >
            RESET
          </button>
        </div>

        {/* Local Search */}
        <div className="space-y-1.5 mb-5">
          <label className="text-xs font-mono font-bold uppercase text-neutral-800">
            LOCAL SEARCH
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search Customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-50 font-mono text-xs border border-neutral-300 focus:border-black focus:outline-none p-2.5 pl-8"
            />
            <Search className="absolute left-2.5 top-3 w-3.5 h-3.5 text-neutral-400" />
          </div>
        </div>

        {/* Subscription Plan checks */}
        <div className="space-y-3 mb-5 border-t border-neutral-100 pt-4">
          <span className="text-xs font-mono font-bold uppercase text-neutral-800 block">
            SUBSCRIPTION PLAN
          </span>
          <div className="space-y-2 text-xs font-mono">
            {['PREMIUM', 'STANDARD', 'FREE'].map((plan) => {
              const isChecked = selectedPlans.includes(plan as CustomerPlan);
              return (
                <label key={plan} className="flex items-center space-x-2 cursor-pointer hover:text-black">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handlePlanToggle(plan as CustomerPlan)}
                    className="w-4 h-4 accent-black rounded-none border-neutral-300"
                  />
                  <span className={`${isChecked ? 'font-bold text-black' : ''}`}>{plan}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Industries dropdown list */}
        <div className="space-y-1.5 mb-5 border-t border-neutral-100 pt-4">
          <label className="text-xs font-mono font-bold uppercase text-neutral-800">
            INDUSTRY
          </label>
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="w-full bg-neutral-50 font-mono text-xs border border-neutral-300 p-2 focus:border-black focus:outline-none"
          >
            {industries.map(ind => (
              <option key={ind} value={ind}>{ind.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Status selection */}
        <div className="space-y-3 mb-5 border-t border-neutral-100 pt-4">
          <span className="text-xs font-mono font-bold uppercase text-neutral-800 block">
            STATUS
          </span>
          <div className="space-y-2 text-xs font-mono">
            {['ACTIVE', 'AT RISK', 'INACTIVE'].map((st) => {
              const isChecked = selectedStatus.includes(st as CustomerStatus);
              return (
                <label key={st} className="flex items-center space-x-2 cursor-pointer hover:text-black">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleStatusToggle(st as CustomerStatus)}
                    className="w-4 h-4 accent-black rounded-none border-neutral-300"
                  />
                  <span className={`${isChecked ? 'font-bold' : ''} ${st === 'AT RISK' && isChecked ? 'text-amber-600' : ''}`}>
                    {st}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Stats counter cards in left sidepane exactly like screenshot */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-200">
          <div className="border border-neutral-300 p-3 bg-neutral-50">
            <span className="text-[9px] font-mono font-bold text-neutral-400 block uppercase">TOTAL CUSTOMERS</span>
            <span className="text-2xl font-black font-mono text-black">{filteredCustomers.length}</span>
          </div>
          <div className="border border-neutral-300 p-3 bg-neutral-50 w-full">
            <span className="text-[9px] font-mono font-bold text-neutral-400 block uppercase">NEW THIS MONTH</span>
            <span className="text-2xl font-black font-mono text-black">10</span>
          </div>
        </div>
      </motion.div>

      {/* 2. Right Side: Table of customers */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-3 bg-white border-2 border-black p-5"
      >
        <div className="border-b border-black pb-3 mb-4 flex justify-between items-center">
          <h2 className="text-lg font-black font-sans uppercase text-neutral-900 tracking-tight">
            Customer List
          </h2>
          <span className="font-mono text-xs text-neutral-400">
            {filteredCustomers.length} ACTIVE PARTNERS OUT OF {customers.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-100 border-b border-black text-neutral-800 font-mono text-[10px] font-bold tracking-wider uppercase">
                <th className="py-3 px-3 w-28">CUSTOMER ID</th>
                <th className="py-3 px-3">NAME</th>
                <th className="py-3 px-3">CONTACT PERSON</th>
                <th className="py-3 px-3">LOCATION</th>
                <th className="py-2.5 px-3 w-32 text-center">PRODUCTS OWNED</th>
                <th className="py-2.5 px-3 w-36 text-center">SUPPORT HISTORY</th>
                <th className="py-2.5 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-neutral-900">
                    #{customer.id}
                  </td>
                  
                  <td className="py-3.5 px-3 font-bold text-neutral-900 font-sans">
                    <div>{customer.name}</div>
                    <div className="text-[10px] text-neutral-400 font-mono font-semibold uppercase mt-0.5">
                      {customer.industry} • {customer.plan} TIER
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-neutral-600 font-medium">
                    {customer.contactPerson}
                  </td>

                  <td className="py-3.5 px-3 text-neutral-600 font-mono">
                    {customer.location}
                  </td>

                  <td className="py-3.5 px-3 text-center font-bold font-mono">
                    {customer.productsOwned} Laptops
                  </td>

                  {/* Open Tickets support active button */}
                  <td className="py-3.5 px-3 text-center">
                    <button
                      onClick={() => handleOpenTicketsClick(customer.name)}
                      className={`font-mono text-[10px] font-bold py-1.5 px-2 px-2.5 border transition-all inline-flex items-center space-x-1 uppercase ${
                        customer.openTickets > 0
                          ? 'bg-black text-white border-black hover:bg-neutral-800'
                          : 'bg-neutral-50 text-neutral-400 border-neutral-200'
                      }`}
                    >
                      <span>{customer.openTickets} Open Tickets</span>
                    </button>
                  </td>

                  {/* Actions exactly like screenshots */}
                  <td className="py-3.5 px-3 text-right space-y-1">
                    <div className="flex flex-col sm:flex-row items-center sm:space-x-1 w-full justify-end">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="font-mono text-[9px] font-bold py-1 px-1.5 border border-black hover:bg-neutral-100 uppercase"
                      >
                        VIEW PROFILE
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsContacting(true);
                        }}
                        className="font-mono text-[9px] font-bold py-1 px-1.5 border border-black bg-black text-white hover:bg-neutral-800 uppercase mt-1 sm:mt-0"
                      >
                        CONTACT
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400 font-mono">
                    NO CUSTOMER PARTNERS FOUND MATCHING ACTIVE SEARCH CONDITIONS.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Profile Detail Slideover Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-4 border-black p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
                <span className="font-mono text-xs text-neutral-400">CUSTOMER CARD PROFILE</span>
                <button 
                  onClick={() => {
                    setSelectedCustomer(null);
                    setIsContacting(false);
                  }}
                  className="p-1 hover:bg-neutral-100 border border-neutral-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!isContacting ? (
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-3 bg-neutral-100 border border-black">
                      <Shield className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="text-base font-black font-sans uppercase">{selectedCustomer.name}</h3>
                      <p className="font-mono text-xs text-neutral-500 uppercase">{selectedCustomer.industry} CORP</p>
                    </div>
                  </div>

                  <div className="border border-neutral-200 p-4 space-y-3 font-mono text-[11px] bg-neutral-50">
                    <div className="flex justify-between border-b border-neutral-100 pb-2">
                      <span className="text-neutral-400">CUSTOMER ID:</span>
                      <span className="font-bold">#{selectedCustomer.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-2">
                      <span className="text-neutral-400">PLAN TIER:</span>
                      <span className={`font-bold uppercase ${selectedCustomer.plan === 'PREMIUM' ? 'text-red-600' : 'text-neutral-900'}`}>
                        {selectedCustomer.plan} CONTRACT
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-2">
                      <span className="text-neutral-400">CONTACT PERSON:</span>
                      <span className="font-bold">{selectedCustomer.contactPerson}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-2">
                      <span className="text-neutral-400">LOCATION:</span>
                      <span className="font-bold flex items-center"><MapPin className="w-3 h-3 mr-1" />{selectedCustomer.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">PRODUCTS LEASED:</span>
                      <span className="font-bold flex items-center"><Laptop className="w-3 h-3 mr-1 text-neutral-500" />{selectedCustomer.productsOwned} active models</span>
                    </div>
                  </div>

                  {selectedCustomer.status === 'AT RISK' && (
                    <div className="bg-red-50 text-red-800 border border-red-200 p-3 flex items-start space-x-2 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                      <div>
                        <span className="font-bold block uppercase font-mono">ACCOUNT CLASSIFIED: AT RISK</span>
                        <span>Client had multiple unresolved critical tickets last month. Monitor SLA performance.</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 pt-4 border-t border-neutral-200 justify-end">
                    <button
                      onClick={() => setIsContacting(true)}
                      className="px-4 py-2 bg-black text-white hover:bg-neutral-800 font-mono text-xs uppercase"
                    >
                      SEND MESSAGE
                    </button>
                    <button
                      onClick={() => handleOpenTicketsClick(selectedCustomer.name)}
                      className="px-4 py-2 border border-black hover:bg-neutral-50 font-mono text-xs uppercase flex items-center space-x-1"
                    >
                      <span>TRIAGE LIST</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-bold uppercase text-xs font-mono text-neutral-500">
                    Contacting {selectedCustomer.contactPerson} ({selectedCustomer.name})
                  </h4>

                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex items-center space-x-1.5 text-neutral-600">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-neutral-600">
                      <Phone className="w-3.5 h-3.5" />
                      <span>+1 (555) 794 - 100{selectedCustomer.id.slice(-1)}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase text-neutral-700">Write Message</label>
                    <textarea
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="e.g., Hello, we have scheduled dynamic technical hardware replacement dispatch for your ThinkPad models..."
                      className="w-full bg-neutral-50 text-xs border border-black p-2.5 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-4 border-t border-neutral-100 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsContacting(false)}
                      className="px-4 py-2 bg-white text-black border border-neutral-300 font-mono text-xs uppercase"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        alert(`Message dispatched securely via API gateway to ${selectedCustomer.email}`);
                        setContactMessage('');
                        setSelectedCustomer(null);
                        setIsContacting(false);
                      }}
                      className="px-4 py-2 bg-black text-white hover:bg-neutral-800 font-mono text-xs uppercase"
                    >
                      Send email
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
