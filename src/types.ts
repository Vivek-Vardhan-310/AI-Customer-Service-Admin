export type TicketStatus = 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED' | 'ESCALATED';
export type TicketPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Ticket {
  id: string;
  subject: string;
  customer: string;
  status: TicketStatus;
  priority: TicketPriority;
  lastUpdated: string; // e.g. "3m ago"
  department: string; // e.g. "L1 Support", "L2 Technical", "Billing", "Enterprise"
  date: string; // YYYY-MM-DD
}

export type CustomerStatus = 'ACTIVE' | 'INACTIVE';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  productsOwned: number;
  openTickets: number;
  totalTickets: number;
  status: CustomerStatus;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  model: string;
  description: string | null;
  imageUrl: string | null;
  baseWarrantyDays: number;
  activeCustomers: number;
  warrantyCoverage: number;
  amcCoverage: number;
  createdAt: string;
}

export interface Review {
  id: string;
  customer: string;
  ticketId: string;
  rating: number; // 1-5
  comment: string;
  date: string; // YYYY-MM-DD
}

export interface SlaRule {
  id: string;
  ruleName: string;
  department: string;
  condition: string;
  priority: TicketPriority;
  resolutionTime: string; // e.g. "4h", "24h", "48h"
  notification: string; // e.g. "[Notify L1 Team]"
  status: 'ENABLED' | 'DISABLED';
}

export type TabType =
  | 'DASHBOARD'
  | 'TICKETS'
  | 'ESCALATIONS'
  | 'CUSTOMERS'
  | 'PRODUCTS'
  | 'WARRANTY'
  | 'AMC'
  | 'FEEDBACK'
  | 'ANALYTICS'
  | 'AI MONITORING'
  | 'ADMIN & SETTINGS';
