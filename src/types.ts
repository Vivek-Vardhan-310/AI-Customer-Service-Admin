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

export type CustomerPlan = 'PREMIUM' | 'STANDARD' | 'FREE';
export type CustomerStatus = 'ACTIVE' | 'AT RISK' | 'INACTIVE';

export interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  location: string;
  productsOwned: number;
  openTickets: number; // Support History
  plan: CustomerPlan;
  industry: string;
  status: CustomerStatus;
  email: string;
}

export type ProductCategory = 'Appliance' | 'Electronics' | 'Software' | 'Services';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  activeCustomers: number;
  warrantyCoverage: number; // e.g., 85
  amcCoverage: number; // e.g., 60
  modelSeries: string;
  releaseYear: number;
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
