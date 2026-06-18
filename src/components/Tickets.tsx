import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, TicketStatus, TicketPriority } from '../types';
import { Search, Plus, Filter, RefreshCw, Download, ChevronLeft, ChevronRight, X, Calendar, CheckSquare, Edit3 } from 'lucide-react';

interface TicketsProps {
  tickets: Ticket[];
  onAddTicket: (ticket: Ticket) => void;
  onUpdateTicketStatus: (id: string, status: TicketStatus) => void;
  initialSearchTerm?: string;
  onClearInitialSearchTerm?: () => void;
}

export default function Tickets({
  tickets,
  onAddTicket,
  onUpdateTicketStatus,
  initialSearchTerm = '',
  onClearInitialSearchTerm,
}: TicketsProps) {
  // Filters State
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  React.useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  const [selectedStatuses, setSelectedStatuses] = useState<TicketStatus[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<TicketPriority[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  
  // Date inputs
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // New Ticket Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newCustomer, setNewCustomer] = useState('Acme Corp');
  const [newStatus, setNewStatus] = useState<TicketStatus>('OPEN');
  const [newPriority, setNewPriority] = useState<TicketPriority>('HIGH');
  const [newDept, setNewDept] = useState('L1 Support');

  // Selected Ticket details (interactive)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Status toggle handler
  const handleStatusToggle = (status: TicketStatus) => {
    setSelectedStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
    setCurrentPage(1);
  };

  // Priority toggle handler
  const handlePriorityToggle = (priority: TicketPriority) => {
    setSelectedPriorities(prev => 
      prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
    );
    setCurrentPage(1);
  };

  // Filter the actual ticket array
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // Search Box match (subject or customer name or ID)
      const matchesSearch = 
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase());

      // Status checkbox match
      const matchesStatus = 
        selectedStatuses.length === 0 || 
        selectedStatuses.includes(ticket.status);

      // Priority checkbox match
      const matchesPriority = 
        selectedPriorities.length === 0 || 
        selectedPriorities.includes(ticket.priority);

      // Department selection match
      const matchesDept = 
        selectedDepartment === 'ALL' || 
        ticket.department === selectedDepartment;

      // Date Range match
      let matchesDate = true;
      if (dateFrom && ticket.date < dateFrom) matchesDate = false;
      if (dateTo && ticket.date > dateTo) matchesDate = false;

      return matchesSearch && matchesStatus && matchesPriority && matchesDept && matchesDate;
    });
  }, [tickets, searchTerm, selectedStatuses, selectedPriorities, selectedDepartment, dateFrom, dateTo]);

  // Compute pagination
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTickets.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTickets, currentPage]);

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage) || 1;

  // New ticket submit
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    const randomId = `TK-${Math.floor(9000 + Math.random() * 1000)}`;
    const created: Ticket = {
      id: randomId,
      subject: newSubject,
      customer: newCustomer,
      status: newStatus,
      priority: newPriority,
      lastUpdated: '1m ago',
      department: newDept,
      date: new Date().toISOString().split('T')[0],
    };

    onAddTicket(created);
    
    // Clear & close
    setNewSubject('');
    setIsModalOpen(false);
  };

  // CSV Export trigger
  const handleCsvExport = () => {
    const headers = ['Ticket ID', 'Subject', 'Customer', 'Status', 'Priority', 'Last Updated', 'Date', 'Department'];
    const rows = filteredTickets.map(t => [
      t.id, t.subject, t.customer, t.status, t.priority, t.lastUpdated, t.date, t.department
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lenovo_support_tickets_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      {/* 1. Left Side: FILTER & SEARCH Panel */}
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white border-2 border-black p-5"
      >
        <div className="flex items-center justify-between border-b border-black pb-2 mb-4">
          <h2 className="text-sm font-black font-sans uppercase tracking-tight text-neutral-950 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-2" />
            FILTER & SEARCH
          </h2>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedStatuses([]);
              setSelectedPriorities([]);
              setSelectedDepartment('ALL');
              setDateFrom('');
              setDateTo('');
              if (onClearInitialSearchTerm) {
                onClearInitialSearchTerm();
              }
            }}
            className="text-[10px] font-mono hover:underline text-neutral-600"
          >
            RESET
          </button>
        </div>

        {/* Section: Search Tickets Input */}
        <div className="space-y-1.5 mb-5">
          <label className="text-xs font-mono font-bold uppercase tracking-tight text-neutral-800">
            SEARCH TICKETS
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search Subject or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-50 font-mono text-xs border border-neutral-300 pointer-events-auto cursor-text focus:border-black focus:outline-none p-2.5 pl-8"
            />
            <Search className="absolute left-2.5 top-3 w-3.5 h-3.5 text-neutral-400" />
          </div>
        </div>

        {/* Section: STATUS Checkboxes */}
        <div className="space-y-4 mb-5 border-t border-neutral-100 pt-4">
          <span className="text-xs font-mono font-bold uppercase tracking-tight block text-neutral-800">
            STATUS
          </span>
          <div className="space-y-2.5 text-xs text-neutral-700 font-mono">
            {(['OPEN', 'PENDING', 'RESOLVED', 'CLOSED', 'ESCALATED'] as TicketStatus[]).map((status) => {
              const isChecked = selectedStatuses.includes(status);
              return (
                <label key={status} className="flex items-center space-x-2 cursor-pointer hover:text-black">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleStatusToggle(status)}
                    className="w-4 h-4 accent-black rounded-none border-neutral-300"
                  />
                  <span className={`${isChecked ? 'font-bold text-black' : ''}`}>{status}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Section: PRIORITY Checkboxes */}
        <div className="space-y-4 mb-5 border-t border-neutral-100 pt-4">
          <span className="text-xs font-mono font-bold uppercase tracking-tight block text-neutral-800">
            PRIORITY
          </span>
          <div className="space-y-2.5 text-xs text-neutral-700 font-mono">
            {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as TicketPriority[]).map((priority) => {
              const isChecked = selectedPriorities.includes(priority);
              return (
                <label key={priority} className="flex items-center space-x-2 cursor-pointer hover:text-black">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handlePriorityToggle(priority)}
                    className="w-4 h-4 accent-black rounded-none border-neutral-300"
                  />
                  <span className={`${isChecked ? 'font-bold text-red-600' : ''}`}>{priority}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Section: DEPARTMENT Dropdown */}
        <div className="space-y-1.5 mb-5 border-t border-neutral-100 pt-4">
          <label className="text-xs font-mono font-bold uppercase tracking-tight text-neutral-800">
            DEPARTMENT
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full bg-neutral-50 font-mono text-xs border border-neutral-300 p-2 focus:border-black focus:outline-none"
          >
            <option value="ALL">ALL DEPARTMENTS</option>
            <option value="L1 Support">L1 Support</option>
            <option value="L2 Technical">L2 Technical</option>
            <option value="Billing">Billing</option>
            <option value="Enterprise">Enterprise Support</option>
          </select>
        </div>

        {/* Section: DATE RANGE */}
        <div className="space-y-3 border-t border-neutral-100 pt-4">
          <span className="text-xs font-mono font-bold uppercase tracking-right block text-neutral-800 flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            DATE RANGE
          </span>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] w-7 font-mono text-neutral-400">FROM</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full font-mono text-[11px] border border-neutral-300 p-1.5 bg-neutral-50 focus:border-black focus:outline-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] w-7 font-mono text-neutral-400">TO</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full font-mono text-[11px] border border-neutral-300 p-1.5 bg-neutral-50 focus:border-black focus:outline-none"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Right Side: Ticket List Table Container */}
      <motion.div
        initial={{ opacity: 0, x: 15 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-3 bg-white border-2 border-black p-5"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-black pb-3 mb-4 gap-3">
          <div className="space-y-0.5">
            <h2 className="text-lg font-black font-sans uppercase text-neutral-900 tracking-tight">
              Ticket List
            </h2>
            <span className="font-mono text-[10px] text-neutral-400">
              {filteredTickets.length} of {tickets.length} RECORDS COMPLYING WITH SEARCH FILTER
            </span>
          </div>

          {/* Action Row */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-black hover:bg-neutral-800 text-white font-mono text-[11px] font-bold px-3 py-2 border border-black flex items-center space-x-1.5 uppercase transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Ticket</span>
            </button>

            <button
              onClick={handleCsvExport}
              className="bg-white hover:bg-neutral-50 text-black font-mono text-[11px] font-bold px-3 py-2 border border-black flex items-center space-x-1.5 uppercase transition-all"
              title="Download CSV report"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export (CSV)</span>
            </button>

            <button
              onClick={() => {
                alert('Triage connection synchronized. Fetched latest server tickets.');
              }}
              className="bg-white hover:bg-neutral-50 text-neutral-700 p-2 border border-neutral-300"
              title="Force sync ticket telemetry logs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Results Queue Table exactly like second image */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-100 border-b border-black text-neutral-800 font-mono text-[10px] font-bold tracking-wider uppercase">
                <th className="py-3 px-3 w-20">TICKET ID</th>
                <th className="py-3 px-3">SUBJECT</th>
                <th className="py-3 px-3 w-28">CUSTOMER</th>
                <th className="py-3 px-3 w-24">STATUS</th>
                <th className="py-3 px-3 w-20">PRIORITY</th>
                <th className="py-3 px-3 w-24">LAST UPDATED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {paginatedTickets.map((ticket) => (
                <tr 
                  key={ticket.id} 
                  onClick={() => setSelectedTicket(ticket)}
                  className="hover:bg-neutral-50 cursor-pointer group transition-colors"
                >
                  {/* Ticket ID */}
                  <td className="py-3 px-3 font-mono font-bold text-neutral-900">
                    #{ticket.id}
                  </td>
                  
                  {/* Subject */}
                  <td className="py-3 px-3 font-sans font-medium text-neutral-900 group-hover:underline">
                    <div className="line-clamp-1">{ticket.subject}</div>
                    <div className="text-[10px] text-neutral-400 font-mono mt-0.5 uppercase">
                      {ticket.department} • {ticket.date}
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="py-3 px-3 font-semibold text-neutral-700">
                    {ticket.customer}
                  </td>

                  {/* Status badge */}
                  <td className="py-3 px-3">
                    <span className={`inline-block font-mono text-[9px] font-bold px-1.5 py-0.5 border ${
                      ticket.status === 'OPEN' ? 'border-green-600 text-green-700 bg-green-50' :
                      ticket.status === 'PENDING' ? 'border-amber-500 text-amber-700 bg-amber-50' :
                      ticket.status === 'RESOLVED' ? 'border-neutral-400 text-neutral-500 bg-neutral-50' :
                      ticket.status === 'ESCALATED' ? 'border-red-600 text-red-700 bg-red-50' :
                      'border-black text-black'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>

                  {/* Priority badge */}
                  <td className="py-3 px-3">
                    <span className={`inline-block font-mono text-[9px] font-bold px-1.5 py-0.5 border ${
                      ticket.priority === 'CRITICAL' ? 'border-red-700 text-white bg-red-700' :
                      ticket.priority === 'HIGH' ? 'border-black text-white bg-black' :
                      ticket.priority === 'MEDIUM' ? 'border-neutral-300 text-neutral-800 bg-neutral-100' :
                      'border-neutral-200 text-neutral-400'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>

                  {/* Last Updated */}
                  <td className="py-3 px-3 font-mono text-neutral-500">
                    {ticket.lastUpdated}
                  </td>
                </tr>
              ))}
              {paginatedTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400 font-mono">
                    NO TICKETS MATCHING SPECIFIED CRITERIA FOUND.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar exactly like screenshots */}
        <div className="flex items-center justify-between border-t border-black pt-4 mt-4 text-xs font-mono">
          <span className="text-neutral-500">
            Showing {filteredTickets.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredTickets.length)} of {filteredTickets.length} Tickets
          </span>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-neutral-300 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-white"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 py-1 bg-neutral-100 border border-neutral-300 font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-neutral-300 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-white"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* 3. New Ticket Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-4 border-black p-6 w-full max-w-lg shadow-xl"
            >
              <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
                <h3 className="text-base font-black font-sans uppercase">Create New Support Ticket</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-neutral-100 border border-neutral-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4 font-sans text-xs">
                {/* Subject Description */}
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold block uppercase text-neutral-700">Subject Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ThinkPad keyboard keys not registering"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full bg-neutral-50 border border-black focus:outline-none p-2 font-medium"
                  />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Customer Selection */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold block uppercase text-neutral-700">Customer Client</label>
                    <select
                      value={newCustomer}
                      onChange={(e) => setNewCustomer(e.target.value)}
                      className="w-full bg-neutral-50 border border-black p-2 font-mono"
                    >
                      <option value="Acme Corp">Acme Corp</option>
                      <option value="Globex Inc">Globex Inc</option>
                      <option value="Soylent Corp">Soylent Corp</option>
                      <option value="Inotech">Inotech</option>
                      <option value="Vertex Group">Vertex Group</option>
                      <option value="TechNova">TechNova</option>
                    </select>
                  </div>

                  {/* Priority level */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold block uppercase text-neutral-700">Priority Tier</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                      className="w-full bg-neutral-50 border border-black p-2 font-mono"
                    >
                      <option value="CRITICAL">🔥 CRITICAL</option>
                      <option value="HIGH">⚡ HIGH</option>
                      <option value="MEDIUM">⚖️ MEDIUM</option>
                      <option value="LOW">💬 LOW</option>
                    </select>
                  </div>
                </div>

                {/* Grid 2 */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Status */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold block uppercase text-neutral-700">Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
                      className="w-full bg-neutral-50 border border-black p-2 font-mono"
                    >
                      <option value="OPEN">OPEN (Triage)</option>
                      <option value="PENDING">PENDING</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>
                  </div>

                  {/* Department */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold block uppercase text-neutral-700">Department</label>
                    <select
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="w-full bg-neutral-50 border border-black p-2 font-mono"
                    >
                      <option value="L1 Support">L1 Support (Standard)</option>
                      <option value="L2 Technical">L2 Technical (Specialist)</option>
                      <option value="Billing">Billing Team</option>
                      <option value="Enterprise">Enterprise Elite</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4 justify-end border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-white text-black border border-neutral-300 hover:bg-neutral-50 font-mono uppercase text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white border border-black hover:bg-neutral-800 font-mono uppercase text-xs flex items-center space-x-1"
                  >
                    <CheckSquare className="w-4 h-4 mr-1" />
                    <span>Create Ticket</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Ticket Interactive Detail Slideover */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white w-full max-w-md border-l-4 border-black h-full p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b pb-3 mb-4">
                  <div className="space-y-0.5">
                    <span className="font-mono text-xs text-neutral-400">TICKET VIEW</span>
                    <h3 className="text-base font-black font-sans uppercase">#{selectedTicket.id}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedTicket(null)}
                    className="p-1 hover:bg-neutral-100 border border-neutral-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-5 text-neutral-800 text-xs font-sans">
                  {/* Subject Details */}
                  <div className="space-y-1 bg-neutral-50 p-3 border border-neutral-200">
                    <span className="font-mono font-bold text-neutral-400 uppercase text-[10px]">Client Subject</span>
                    <p className="text-sm font-bold text-black">{selectedTicket.subject}</p>
                  </div>

                  {/* Customer & Department details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-mono font-bold text-neutral-400 uppercase text-[10px]">Customer Client</span>
                      <p className="text-xs font-semibold text-neutral-900 mt-1">{selectedTicket.customer}</p>
                    </div>
                    <div>
                      <span className="font-mono font-bold text-neutral-400 uppercase text-[10px]">Work Department</span>
                      <p className="text-xs font-semibold text-neutral-900 mt-1">{selectedTicket.department}</p>
                    </div>
                  </div>

                  {/* Date details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-mono font-bold text-neutral-400 uppercase text-[10px]">Creation Date</span>
                      <p className="text-xs font-mono text-neutral-700 mt-1">{selectedTicket.date}</p>
                    </div>
                    <div>
                      <span className="font-mono font-bold text-neutral-400 uppercase text-[10px]">Last Updated Activity</span>
                      <p className="text-xs font-mono text-neutral-700 mt-1">{selectedTicket.lastUpdated}</p>
                    </div>
                  </div>

                  {/* Current Status Modifiers */}
                  <div className="space-y-2 pt-2 border-t border-neutral-100">
                    <span className="font-mono font-bold text-neutral-400 uppercase text-[10px]">Modify Work Status Level</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(['OPEN', 'PENDING', 'RESOLVED', 'CLOSED', 'ESCALATED'] as TicketStatus[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => {
                            onUpdateTicketStatus(selectedTicket.id, st);
                            setSelectedTicket(prev => prev ? { ...prev, status: st } : null);
                          }}
                          className={`font-mono text-[10px] font-bold px-2 py-1.5 border transition-all ${
                            selectedTicket.status === st 
                              ? 'bg-black text-white border-black' 
                              : 'bg-white text-neutral-700 hover:bg-neutral-50 border-neutral-300'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Simulation info */}
                  <div className="p-3 bg-sans bg-amber-50 text-amber-900 border border-amber-200 mt-6 rounded-none space-y-1">
                    <span className="font-bold text-[10px] tracking-wide uppercase font-mono block">Premier Support Auto SLA</span>
                    <p className="text-[11px]">Any ticket marked as ESCALATED or PENDING triggers immediate client notifications based on SLA rule configuration standards.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between font-mono text-xs">
                <span className="text-neutral-400">Lenovo Support System</span>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold uppercase transition-all"
                >
                  Close View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
