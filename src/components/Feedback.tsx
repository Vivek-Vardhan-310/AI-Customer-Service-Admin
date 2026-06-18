import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Review, TicketStatus, Ticket } from '../types';
import { Search, Star, ThumbsUp, ThumbsDown, MessageSquare, ShieldAlert, ArrowRight, X, Mail } from 'lucide-react';

interface FeedbackProps {
  reviews: Review[];
  tickets: Ticket[];
  onEscalateTicket: (ticketId: string, escalate: boolean) => void;
  onContactCustomer: (customerName: string, message: string) => void;
}

export default function Feedback({ reviews, tickets, onEscalateTicket, onContactCustomer }: FeedbackProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal for contacting customer
  const [activeContactReview, setActiveContactReview] = useState<Review | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  // Rating Distribution breakdown
  const ratingStats = useMemo(() => {
    const total = reviews.length;
    return {
      '5-Star': { count: reviews.filter(r => r.rating === 5).length, pct: 54 },
      '4-Star': { count: reviews.filter(r => r.rating === 4).length, pct: 30 },
      '3-Star': { count: reviews.filter(r => r.rating === 3).length, pct: 10 },
      '2-Star': { count: reviews.filter(r => r.rating === 2).length, pct: 4 },
      '1-Star': { count: reviews.filter(r => r.rating === 1).length, pct: 2 },
    };
  }, [reviews]);

  // Handle Escalating related Ticket ID
  const handleEscalate = (review: Review) => {
    onEscalateTicket(review.ticketId, true);
    alert(`Success: Ticket ID #${review.ticketId} escalated based on dissatisfied customer feedback.`);
  };

  // Filter Reviews via search term
  const filteredReviews = useMemo(() => {
    return reviews.filter(rev => {
      return (
        rev.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rev.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rev.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rev.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [reviews, searchTerm]);

  // Standard Star renderer
  const renderStars = (rating: number) => {
    return (
      <div className="flex text-black space-x-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3.5 h-3.5 ${s <= rating ? 'fill-black text-black' : 'text-neutral-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* 1. Header & Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Average Rating */}
        <div className="bg-white border-2 border-black p-5 flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">AVERAGE RATING</span>
          <div className="my-2 flex items-baseline space-x-2">
            <span className="text-4.5xl font-black font-mono tracking-tight text-neutral-900">4.2</span>
            {renderStars(4)}
          </div>
          <span className="text-[10px] font-mono text-neutral-500 uppercase mt-1">Based on 1,500 surveys</span>
        </div>

        {/* Total Reviews */}
        <div className="bg-white border-2 border-black p-5 flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">TOTAL REVIEWS</span>
          <div className="my-2">
            <span className="text-4.5xl font-black font-mono tracking-tight text-neutral-900">1,500</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-500 uppercase">100% Verified client accounts</span>
        </div>

        {/* Positive reviews percentage */}
        <div className="bg-white border-2 border-black p-5 flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">POSITIVE REVIEWS</span>
          <div className="my-2 flex items-center space-x-2">
            <span className="text-4.5xl font-black font-mono tracking-tight text-neutral-900">88%</span>
            <div className="bg-neutral-100 p-1.5 border border-black">
              <ThumbsUp className="w-5 h-5 text-black" />
            </div>
          </div>
          <span className="text-[10px] font-mono text-neutral-500 uppercase">Excellent or Good ratings</span>
        </div>

        {/* Negative reviews percentage */}
        <div className="bg-white border-2 border-black p-5 flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">NEGATIVE RATIOS</span>
          <div className="my-2 flex items-center space-x-2">
            <span className="text-4.5xl font-black font-mono tracking-tight text-red-600">12%</span>
            <div className="bg-red-50 p-1.5 border border-red-200">
              <ThumbsDown className="w-5 h-5 text-red-600 animate-bounce" />
            </div>
          </div>
          <span className="text-[10px] font-mono text-red-400 uppercase">Under 3★. Requires action.</span>
        </div>
      </div>

      {/* 2. Rating distribution bar chart & average-rating trend lines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <div className="bg-white border-2 border-black p-5 flex flex-col justify-between min-h-[320px]">
          <div>
            <div className="flex items-center justify-between border-b border-black pb-2 mb-4">
              <h2 className="text-xs font-black font-mono uppercase tracking-tight text-neutral-900">
                RATING DISTRIBUTION
              </h2>
              <span className="text-[10px] font-mono text-neutral-400">BAR CHART INDEX %</span>
            </div>

            {/* Custom SVG/HTML Bar graph */}
            <div className="flex items-end justify-between h-44 pt-5 px-4 font-mono text-xs">
              {/* 1-star */}
              <div className="flex flex-col items-center space-y-2 w-10">
                <span className="font-bold text-neutral-500">2%</span>
                <div className="w-6 bg-neutral-100 border border-neutral-300 h-10 flex items-end">
                  <motion.div initial={{ height: 0 }} animate={{ height: '3%' }} transition={{ duration: 0.8 }} className="bg-neutral-500 w-full" />
                </div>
                <span className="text-[10px] text-neutral-400">1-Star</span>
              </div>

              {/* 2-star */}
              <div className="flex flex-col items-center space-y-2 w-10">
                <span className="font-bold text-neutral-500 font-mono">4%</span>
                <div className="w-6 bg-neutral-100 border border-neutral-300 h-12 flex items-end">
                  <motion.div initial={{ height: 0 }} animate={{ height: '7%' }} transition={{ duration: 0.8, delay: 0.05 }} className="bg-neutral-500 w-full" />
                </div>
                <span className="text-[10px] text-neutral-400">2-Star</span>
              </div>

              {/* 3-star */}
              <div className="flex flex-col items-center space-y-2 w-10">
                <span className="font-bold text-neutral-600">10%</span>
                <div className="w-6 bg-neutral-100 border border-neutral-300 h-16 flex items-end">
                  <motion.div initial={{ height: 0 }} animate={{ height: '18%' }} transition={{ duration: 0.8, delay: 0.1 }} className="bg-neutral-600 w-full" />
                </div>
                <span className="text-[10px] text-neutral-400">3-Star</span>
              </div>

              {/* 4-star */}
              <div className="flex flex-col items-center space-y-2 w-10">
                <span className="font-bold text-neutral-700">30%</span>
                <div className="w-6 bg-neutral-100 border border-black h-28 flex items-end">
                  <motion.div initial={{ height: 0 }} animate={{ height: '55%' }} transition={{ duration: 0.8, delay: 0.15 }} className="bg-neutral-800 w-full" />
                </div>
                <span className="text-[10px] text-neutral-850">4-Star</span>
              </div>

              {/* 5-star */}
              <div className="flex flex-col items-center space-y-2 w-10">
                <span className="font-black text-black">54%</span>
                <div className="w-6 bg-neutral-200 border-2 border-black h-36 flex items-end">
                  <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} transition={{ duration: 0.8, delay: 0.2 }} className="bg-black w-full" />
                </div>
                <span className="text-[10px] text-black font-extrabold">5-Star</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-neutral-400 mt-2 text-center">
            Excellent & Good tiers constitute 84% of entire feedback channels.
          </div>
        </div>

        {/* Trend line chart */}
        <div className="bg-white border-2 border-black p-5 flex flex-col justify-between min-h-[320px]">
          <div>
            <div className="flex items-center justify-between border-b border-black pb-2 mb-4">
              <h2 className="text-xs font-black font-mono uppercase tracking-tight text-neutral-900">
                TREND OF AVERAGE CSAT RATING
              </h2>
              <span className="text-[10px] font-mono text-neutral-400">LAST 30 DAYS FLOW</span>
            </div>

            {/* Custom SVG line drawing */}
            <div className="w-full relative h-40 flex items-center justify-center pt-3">
              <svg className="w-full h-full" viewBox="0 0 300 120">
                {/* Horizontal reference dashed lines */}
                <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="60" x2="300" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="300" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />

                {/* Line path connection */}
                <motion.path
                  d="M 10 90 L 50 65 L 100 85 L 150 40 L 200 50 L 250 80 L 290 20"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
                />

                {/* Circles over keys */}
                <circle cx="10" cy="90" r="4" fill="white" stroke="black" strokeWidth="1.5" />
                <circle cx="50" cy="65" r="4" fill="white" stroke="black" strokeWidth="1.5" />
                <circle cx="100" cy="85" r="4" fill="white" stroke="black" strokeWidth="1.5" />
                <circle cx="150" cy="40" r="4" fill="white" stroke="black" strokeWidth="1.5" />
                <circle cx="200" cy="50" r="4" fill="white" stroke="black" strokeWidth="1.5" />
                <circle cx="250" cy="80" r="4" fill="white" stroke="black" strokeWidth="1.5" />
                <circle cx="290" cy="20" r="5" fill="black" />
              </svg>

              {/* Data points overlays */}
              <div className="absolute top-2 right-4 font-mono text-[9px] bg-black text-white px-1.5 py-0.5 border">
                TODAY: 4.5★
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-neutral-400 text-center">
            Critical updates to ThinkPad carbon keyboard drivers resolved active complaints. Rating is on rapid positive trajectory.
          </div>
        </div>
      </div>

      {/* 3. Review Details list */}
      <div className="bg-white border-2 border-black p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-black pb-3 mb-4 gap-3">
          <div className="space-y-0.5">
            <h2 className="text-base font-black font-sans uppercase text-neutral-900 tracking-tight">
              REVIEW DETAILS
            </h2>
            <p className="font-mono text-[10px] text-neutral-400 uppercase">
              Browse individual client survey logs
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search Reviews Comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-50 font-mono text-xs border border-neutral-300 focus:border-black focus:outline-none p-2 pl-7"
            />
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-100 border-b border-black text-neutral-800 font-mono text-[10px] font-bold tracking-wider uppercase">
                <th className="py-2.5 px-3 w-24">REVIEW ID</th>
                <th className="py-2.5 px-3">CUSTOMER</th>
                <th className="py-2.5 px-3 w-24">TICKET ID</th>
                <th className="py-2.5 px-3 w-28">RATING</th>
                <th className="py-2.5 px-3">COMMENT</th>
                <th className="py-2.5 px-3 w-24">DATE</th>
                <th className="py-2.5 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredReviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-neutral-50 transition-colors">
                  {/* ID */}
                  <td className="py-3 px-3 font-mono font-bold text-neutral-900">
                    #{rev.id}
                  </td>

                  {/* Customer */}
                  <td className="py-3 px-3 font-bold text-neutral-800">
                    {rev.customer}
                  </td>

                  {/* Ticket ID link */}
                  <td className="py-3 px-3 font-mono text-neutral-700 font-medium">
                    #{rev.ticketId}
                  </td>

                  {/* Stars rating */}
                  <td className="py-3 px-3">
                    {renderStars(rev.rating)}
                  </td>

                  {/* Comment */}
                  <td className="py-3 px-3 font-medium text-neutral-600 leading-relaxed pr-6">
                    "{rev.comment}"
                  </td>

                  {/* Date */}
                  <td className="py-3 px-3 font-mono text-neutral-550">
                    {rev.date}
                  </td>

                  {/* Review Actions exactly like images */}
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex space-x-1.5 justify-end">
                      <button
                        onClick={() => setActiveContactReview(rev)}
                        className="font-mono text-[9px] font-bold py-1 px-2 border border-black bg-white hover:bg-neutral-100 uppercase"
                      >
                        CONTACT
                      </button>
                      
                      {rev.rating <= 2 ? (
                        <button
                          onClick={() => handleEscalate(rev)}
                          className="font-mono text-[9px] font-bold py-1 px-2 border border-red-650 bg-red-600 text-white hover:bg-red-700 uppercase"
                        >
                          ESCALATE
                        </button>
                      ) : (
                        <button
                          disabled
                          className="font-mono text-[9px] font-bold py-1 px-2 border border-neutral-200 text-neutral-400 bg-neutral-50 uppercase cursor-not-allowed"
                        >
                          STABLE
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReviews.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400 font-mono">
                    NO SURVEY LOGS SATISFY CURRENT LOOKUP MATCHES.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reply/Contact modal from review row */}
      <AnimatePresence>
        {activeContactReview && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-4 border-black p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
                <span className="font-mono text-xs text-neutral-400">DISPATCH RESOLUTION CONSOLE</span>
                <button 
                  onClick={() => setActiveContactReview(null)}
                  className="p-1 hover:bg-neutral-100 border border-neutral-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-neutral-50 p-3 border border-neutral-200">
                  <span className="font-mono text-[9px] text-neutral-400 uppercase">Review Feedback</span>
                  <p className="text-xs italic text-neutral-600 mt-1">"{activeContactReview.comment}"</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-800 tracking-wide">Reply Message</label>
                  <textarea
                    rows={4}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Hello. We have reviewed your complaint ID #FR-5003 regarding response time. We would like to configure premier dispatch updates..."
                    className="w-full bg-neutral-50 border border-black focus:outline-none p-2.5 text-xs font-mono"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t border-neutral-150 justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveContactReview(null)}
                    className="px-4 py-2 bg-white text-black border border-neutral-300 font-mono text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onContactCustomer(activeContactReview.customer, replyMessage);
                      alert(`Message triggered dynamically via customer notification channel.`);
                      setReplyMessage('');
                      setActiveContactReview(null);
                    }}
                    className="px-4 py-2 bg-black text-white hover:bg-neutral-800 font-mono text-xs uppercase"
                  >
                    DISPATCH EMAIL
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
