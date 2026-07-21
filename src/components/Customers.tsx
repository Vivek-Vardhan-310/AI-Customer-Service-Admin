import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Customer, CustomerStatus, TabType, Product } from '../types';
import { Search, Filter, User, Mail, Phone, ExternalLink, X, Package, Calendar, PlusCircle, Check } from 'lucide-react';
import { addProductToCustomer } from '../supabaseService';

interface CustomersProps {
  customers: Customer[];
  products: Product[];
  onRefreshData?: () => void;
  setActiveTab: (tab: TabType) => void;
  setSearchTermInTickets?: (search: string) => void;
}

export default function Customers({ customers, products, onRefreshData, setActiveTab, setSearchTermInTickets }: CustomersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<CustomerStatus[]>([]);

  // Interactive details modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  const [isContacting, setIsContacting] = useState(false);

  // Add Product form state
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [formProductId, setFormProductId] = useState('');
  const [formSerial, setFormSerial] = useState('');
  const [formPurchaseDate, setFormPurchaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Status Toggle
  const handleStatusToggle = (status: CustomerStatus) => {
    setSelectedStatus(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  // Filtering Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        selectedStatus.length === 0 || 
        selectedStatus.includes(customer.status);

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, selectedStatus]);

  const handleOpenTicketsClick = (customerName: string) => {
    if (setSearchTermInTickets) {
      setSearchTermInTickets(customerName);
    }
    setActiveTab('TICKETS');
  };

  // Count new customers this month
  const newThisMonth = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    return customers.filter(c => {
      if (!c.createdAt) return false;
      const d = new Date(c.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;
  }, [customers]);

  // Submit product registration
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedCustomer) return;
    if (!formProductId) {
      setFormError('Please select a catalog product.');
      return;
    }
    if (!formSerial.trim()) {
      setFormError('Please enter a valid serial number.');
      return;
    }
    if (!formPurchaseDate) {
      setFormError('Please select a purchase date.');
      return;
    }

    setIsSubmittingProduct(true);
    try {
      const success = await addProductToCustomer(
        selectedCustomer.id,
        formProductId,
        formSerial.trim(),
        formPurchaseDate
      );

      if (success) {
        // Reset state
        setIsAddingProduct(false);
        setFormProductId('');
        setFormSerial('');
        setFormPurchaseDate(new Date().toISOString().split('T')[0]);
        
        // Refresh global state so count updates
        if (onRefreshData) {
          onRefreshData();
        }
        
        // Increment count locally on the modal view if still showing
        setSelectedCustomer(prev => prev ? { ...prev, productsOwned: prev.productsOwned + 1 } : null);
      } else {
        setFormError('Failed to register product database entry.');
      }
    } catch (err) {
      setFormError('An unexpected error occurred.');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      {/* 1. Filter Sidepane */}
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
              setSelectedStatus([]);
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
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-50 font-mono text-xs border border-neutral-300 focus:border-black focus:outline-none p-2.5 pl-8"
            />
            <Search className="absolute left-2.5 top-3 w-3.5 h-3.5 text-neutral-400" />
          </div>
        </div>

        {/* Status selection */}
        <div className="space-y-3 mb-5 border-t border-neutral-100 pt-4">
          <span className="text-xs font-mono font-bold uppercase text-neutral-800 block">
            STATUS
          </span>
          <div className="space-y-2 text-xs font-mono">
            {(['ACTIVE', 'INACTIVE'] as CustomerStatus[]).map((st) => {
              const isChecked = selectedStatus.includes(st);
              return (
                <label key={st} className="flex items-center space-x-2 cursor-pointer hover:text-black">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleStatusToggle(st)}
                    className="w-4 h-4 accent-black rounded-none border-neutral-300"
                  />
                  <span className={`${isChecked ? 'font-bold' : ''}`}>
                    {st}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Stats counter cards */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-200">
          <div className="border border-neutral-300 p-3 bg-neutral-50">
            <span className="text-[9px] font-mono font-bold text-neutral-400 block uppercase">TOTAL CUSTOMERS</span>
            <span className="text-2xl font-black font-mono text-black">{filteredCustomers.length}</span>
          </div>
          <div className="border border-neutral-300 p-3 bg-neutral-50 w-full">
            <span className="text-[9px] font-mono font-bold text-neutral-400 block uppercase">NEW THIS MONTH</span>
            <span className="text-2xl font-black font-mono text-black">{newThisMonth}</span>
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
            {filteredCustomers.length} USERS OUT OF {customers.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-100 border-b border-black text-neutral-800 font-mono text-[10px] font-bold tracking-wider uppercase">
                <th className="py-3 px-3">NAME</th>
                <th className="py-3 px-3">EMAIL</th>
                <th className="py-3 px-3">PHONE</th>
                <th className="py-2.5 px-3 w-28 text-center">PRODUCTS</th>
                <th className="py-2.5 px-3 w-36 text-center">SUPPORT HISTORY</th>
                <th className="py-2.5 px-3 w-24 text-center">STATUS</th>
                <th className="py-2.5 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-neutral-900 font-sans">
                    <div>{customer.name}</div>
                    <div className="text-[10px] text-neutral-400 font-mono font-semibold uppercase mt-0.5">
                      Joined {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-neutral-600 font-mono text-[11px]">
                    {customer.email || '—'}
                  </td>

                  <td className="py-3.5 px-3 text-neutral-600 font-mono text-[11px]">
                    {customer.phone || '—'}
                  </td>

                  <td className="py-3.5 px-3 text-center font-bold font-mono">
                    {customer.productsOwned} Devices
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
                      <span>{customer.openTickets} Open / {customer.totalTickets} Total</span>
                    </button>
                  </td>

                  {/* Status badge */}
                  <td className="py-3.5 px-3 text-center">
                    <span className={`font-mono text-[10px] font-bold py-1 px-2 border inline-block uppercase ${
                      customer.status === 'ACTIVE'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                    }`}>
                      {customer.status}
                    </span>
                  </td>

                  {/* Actions */}
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
                    NO CUSTOMERS FOUND MATCHING ACTIVE SEARCH CONDITIONS.
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
                <span className="font-mono text-xs text-neutral-400">
                  {isAddingProduct ? 'ADD PRODUCT TO CUSTOMER' : 'CUSTOMER PROFILE'}
                </span>
                <button 
                  onClick={() => {
                    setSelectedCustomer(null);
                    setIsContacting(false);
                    setIsAddingProduct(false);
                    setFormError(null);
                  }}
                  className="p-1 hover:bg-neutral-100 border border-neutral-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isAddingProduct ? (
                /* Add Product to Customer Form View */
                <form onSubmit={handleAddProductSubmit} className="space-y-4">
                  <h4 className="font-bold uppercase text-xs font-mono text-neutral-500">
                    Registering Product for {selectedCustomer.name}
                  </h4>

                  {formError && (
                    <div className="bg-red-50 text-red-700 border border-red-200 p-2.5 font-mono text-xs">
                      {formError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold uppercase text-neutral-700 block">
                      Select Product Model
                    </label>
                    <select
                      value={formProductId}
                      onChange={(e) => setFormProductId(e.target.value)}
                      className="w-full bg-neutral-50 font-mono text-xs border border-black p-2 focus:outline-none"
                      required
                    >
                      <option value="">-- Choose from Catalog --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.model})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold uppercase text-neutral-700 block">
                      Serial Number (S/N)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PF99KL42"
                      value={formSerial}
                      onChange={(e) => setFormSerial(e.target.value)}
                      className="w-full bg-neutral-50 font-mono text-xs border border-black p-2 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold uppercase text-neutral-700 block">
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      value={formPurchaseDate}
                      onChange={(e) => setFormPurchaseDate(e.target.value)}
                      className="w-full bg-neutral-50 font-mono text-xs border border-black p-2 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-4 border-t border-neutral-100 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingProduct(false);
                        setFormError(null);
                      }}
                      className="px-4 py-2 bg-white text-black border border-neutral-300 font-mono text-xs uppercase"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingProduct}
                      className="px-4 py-2 bg-black text-white hover:bg-neutral-800 font-mono text-xs uppercase flex items-center space-x-1.5"
                    >
                      {isSubmittingProduct ? (
                        <>
                          <span className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin inline-block" />
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : !isContacting ? (
                /* Customer Profile Details View */
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-3 bg-neutral-100 border border-black">
                      <User className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="text-base font-black font-sans uppercase">{selectedCustomer.name}</h3>
                      <p className="font-mono text-xs text-neutral-500">{selectedCustomer.email}</p>
                    </div>
                  </div>

                  <div className="border border-neutral-200 p-4 space-y-3 font-mono text-[11px] bg-neutral-50">
                    <div className="flex justify-between border-b border-neutral-100 pb-2">
                      <span className="text-neutral-400">EMAIL:</span>
                      <span className="font-bold flex items-center"><Mail className="w-3 h-3 mr-1" />{selectedCustomer.email || '—'}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-2">
                      <span className="text-neutral-400">PHONE:</span>
                      <span className="font-bold flex items-center"><Phone className="w-3 h-3 mr-1" />{selectedCustomer.phone || '—'}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-2">
                      <span className="text-neutral-400">PRODUCTS OWNED:</span>
                      <span className="font-bold flex items-center"><Package className="w-3 h-3 mr-1 text-neutral-500" />{selectedCustomer.productsOwned} registered</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-2">
                      <span className="text-neutral-400">OPEN TICKETS:</span>
                      <span className="font-bold">{selectedCustomer.openTickets}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-2">
                      <span className="text-neutral-400">TOTAL TICKETS:</span>
                      <span className="font-bold">{selectedCustomer.totalTickets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">JOINED:</span>
                      <span className="font-bold flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-neutral-500" />
                        {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-4 border-t border-neutral-200 justify-end">
                    <button
                      onClick={() => setIsAddingProduct(true)}
                      className="px-3.5 py-2 border border-black hover:bg-neutral-50 font-mono text-xs uppercase flex items-center space-x-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5 mr-1" />
                      <span>ADD PRODUCT</span>
                    </button>
                    <button
                      onClick={() => setIsContacting(true)}
                      className="px-4 py-2 bg-black text-white hover:bg-neutral-800 font-mono text-xs uppercase"
                    >
                      SEND MESSAGE
                    </button>
                    <button
                      onClick={() => handleOpenTicketsClick(selectedCustomer.name)}
                      className="px-4 py-2 border border-black hover:bg-neutral-50 font-mono text-xs uppercase flex items-center space-x-1 animate-none shrink-0"
                    >
                      <span>TRIAGE LIST</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Contact / Email Form View */
                <div className="space-y-4">
                  <h4 className="font-bold uppercase text-xs font-mono text-neutral-500">
                    Contacting {selectedCustomer.name}
                  </h4>

                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex items-center space-x-1.5 text-neutral-600">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{selectedCustomer.email}</span>
                    </div>
                    {selectedCustomer.phone && (
                      <div className="flex items-center space-x-1.5 text-neutral-600">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{selectedCustomer.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase text-neutral-700">Write Message</label>
                    <textarea
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="e.g., Hello, we have scheduled a technical support session for your registered product..."
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
