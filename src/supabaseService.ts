import { supabase } from './supabaseClient';
import type { Ticket, Customer, Product, Review, SlaRule, TicketStatus, CustomerStatus } from './types';

// ── Auth ─────────────────────────────────────────────────────

export async function adminLogin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: error.message };

  if (!data?.session) return { success: false, error: 'No session received' };

  // Verify admin role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    await supabase.auth.signOut();
    return { success: false, error: 'Access denied. Admin privileges required.' };
  }

  return { success: true };
}

export async function adminLogout(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getAdminSession(): Promise<{ email: string; userId: string } | null> {
  if (!supabase) return null;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profile?.role !== 'admin') return null;

  return { email: session.user.email || '', userId: session.user.id };
}

// ── Tickets ──────────────────────────────────────────────────

// Map DB status to admin panel status format
function mapTicketStatus(dbStatus: string): TicketStatus {
  const mapping: Record<string, TicketStatus> = {
    'Open': 'OPEN',
    'In Progress': 'PENDING',
    'Resolved': 'RESOLVED',
    'Closed': 'CLOSED',
  };
  return mapping[dbStatus] || 'OPEN';
}

// Map admin status back to DB format
function mapStatusToDB(adminStatus: TicketStatus): string {
  const mapping: Record<TicketStatus, string> = {
    'OPEN': 'Open',
    'PENDING': 'In Progress',
    'RESOLVED': 'Resolved',
    'CLOSED': 'Closed',
    'ESCALATED': 'Open', // No escalated status in DB, keep as Open
  };
  return mapping[adminStatus] || 'Open';
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export async function fetchAllTickets(): Promise<Ticket[]> {
  if (!supabase) return [];

  // Fetch tickets (no FK join to profiles — FK goes to auth.users, not profiles)
  const { data: ticketsData, error: ticketsError } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (ticketsError) {
    console.error('fetchAllTickets error:', ticketsError);
    return [];
  }

  // Fetch all user profiles to map user_id → name/email
  const userIds = [...new Set((ticketsData || []).map((t: any) => t.user_id).filter(Boolean))];
  let profilesMap: Record<string, { full_name: string; email: string }> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds);

    (profiles || []).forEach((p: any) => {
      profilesMap[p.id] = { full_name: p.full_name || '', email: p.email || '' };
    });
  }

  return (ticketsData || []).map((t: any) => {
    const profile = profilesMap[t.user_id];
    return {
      id: t.id,
      subject: t.title,
      customer: profile?.full_name || profile?.email || 'Unknown',
      status: mapTicketStatus(t.status),
      priority: categorizeTicketPriority(t.category, t.status),
      lastUpdated: formatTimeAgo(t.updated_at),
      department: categorizeTicketDepartment(t.category),
      date: new Date(t.created_at).toISOString().split('T')[0],
    };
  });
}

function categorizeTicketPriority(category: string | null, status: string): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  if (status === 'Open') return 'HIGH';
  if (status === 'In Progress') return 'MEDIUM';
  if (category?.toLowerCase().includes('battery') || category?.toLowerCase().includes('hardware')) return 'HIGH';
  return 'LOW';
}

function categorizeTicketDepartment(category: string | null): string {
  if (!category) return 'L1 Support';
  const cat = category.toLowerCase();
  if (cat.includes('billing') || cat.includes('warranty') || cat.includes('amc')) return 'Billing';
  if (cat.includes('network') || cat.includes('software') || cat.includes('driver')) return 'L2 Technical';
  return 'L1 Support';
}

export async function updateTicketStatus(id: string, status: TicketStatus): Promise<boolean> {
  if (!supabase) return false;

  const dbStatus = mapStatusToDB(status);
  const { error } = await supabase
    .from('tickets')
    .update({ status: dbStatus })
    .eq('id', id);

  if (error) {
    console.error('updateTicketStatus error:', error);
    return false;
  }

  // Also update the timeline
  if (dbStatus === 'Resolved' || dbStatus === 'Closed') {
    const stepName = dbStatus;
    await supabase
      .from('ticket_timeline')
      .update({ is_done: true, step_date: new Date().toISOString() })
      .eq('ticket_id', id)
      .eq('step_name', stepName);
  }

  return true;
}

// ── Customers ────────────────────────────────────────────────

export async function fetchAllCustomers(): Promise<Customer[]> {
  if (!supabase) return [];

  // Fetch all user profiles with aggregated product and ticket counts
  const { data: allProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profilesError) {
    console.error('fetchAllCustomers error:', profilesError);
    return [];
  }

  // Filter out admin users in JS to handle NULL or alternative roles gracefully
  const profiles = (allProfiles || []).filter((p: any) => p.role !== 'admin');

  // For each profile, get product and ticket counts
  const customers: Customer[] = await Promise.all(
    (profiles || []).map(async (p: any) => {
      // Get product count
      const { count: productsCount } = await supabase!
        .from('user_products')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', p.id);

      // Get open ticket count
      const { count: openTicketsCount } = await supabase!
        .from('tickets')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', p.id)
        .in('status', ['Open', 'In Progress']);

      // Get total ticket count
      const { count: totalTicketsCount } = await supabase!
        .from('tickets')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', p.id);

      const openTix = openTicketsCount || 0;
      const status: CustomerStatus = openTix > 0 ? 'ACTIVE' : (totalTicketsCount || 0) > 0 ? 'ACTIVE' : 'INACTIVE';

      return {
        id: p.id,
        name: p.full_name || p.email?.split('@')[0] || 'Unknown User',
        email: p.email || '',
        phone: p.phone || '',
        productsOwned: productsCount || 0,
        openTickets: openTix,
        totalTickets: totalTicketsCount || 0,
        status,
        createdAt: p.created_at,
      };
    })
  );

  return customers;
}

export async function addProductToCustomer(
  userId: string,
  productId: string,
  serialNumber: string,
  purchaseDate: string
): Promise<boolean> {
  if (!supabase) return true; // Mock success in offline mode

  try {
    // 1. Fetch base warranty days from product_catalog
    const { data: catItem, error: catError } = await supabase
      .from('product_catalog')
      .select('base_warranty_days')
      .eq('id', productId)
      .single();

    const baseWarrantyDays = catItem?.base_warranty_days || 365;

    // 2. Calculate warranty end date
    const purchase = new Date(purchaseDate);
    const warrantyEnd = new Date(purchase.getTime() + baseWarrantyDays * 24 * 60 * 60 * 1000);
    const warrantyEndStr = warrantyEnd.toISOString().split('T')[0];

    // 3. Insert into user_products
    const { error: insertError } = await supabase
      .from('user_products')
      .insert({
        user_id: userId,
        product_id: productId,
        serial_number: serialNumber,
        purchase_date: purchaseDate,
        warranty_end: warrantyEndStr,
        warranty_total_days: baseWarrantyDays,
        amc_status: 'Inactive',
        amc_total_days: 365,
      });

    if (insertError) {
      console.error('Error inserting user product:', insertError);
      return false;
    }

    return true;
  } catch (err) {
    console.error('addProductToCustomer catch error:', err);
    return false;
  }
}

// ── Products (individual product instances from DB) ──────────

export async function fetchAllProducts(): Promise<Product[]> {
  if (!supabase) return [];

  // Fetch catalog products with their user_products instances for aggregation
  const { data, error } = await supabase
    .from('product_catalog')
    .select('*, instances:user_products(id, warranty_end, amc_status)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchAllProducts error:', error);
    return [];
  }

  const today = new Date();

  return (data || []).map((p: any) => {
    const instances = p.instances || [];
    const count = instances.length;
    const warrantyActive = instances.filter((i: any) => {
      const end = i.warranty_end ? new Date(i.warranty_end) : null;
      return end && end > today;
    }).length;
    const amcActive = instances.filter((i: any) => i.amc_status === 'Active').length;

    return {
      id: p.id,
      name: p.name,
      model: p.model || '',
      description: p.description || null,
      imageUrl: p.image_url || null,
      baseWarrantyDays: p.base_warranty_days || 365,
      activeCustomers: count,
      warrantyCoverage: count > 0 ? Math.round((warrantyActive / count) * 100) : 0,
      amcCoverage: count > 0 ? Math.round((amcActive / count) * 100) : 0,
      createdAt: p.created_at,
    };
  });
}

// ── Feedback / Reviews ───────────────────────────────────────

export async function fetchAllFeedback(): Promise<Review[]> {
  if (!supabase) return [];

  // Fetch feedback (no FK join to profiles — FK goes to auth.users)
  const { data: feedbackData, error: feedbackError } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false });

  if (feedbackError) {
    console.error('fetchAllFeedback error:', feedbackError);
    return [];
  }

  // Fetch profiles for feedback authors
  const userIds = [...new Set((feedbackData || []).map((f: any) => f.user_id).filter(Boolean))];
  let profilesMap: Record<string, { full_name: string; email: string }> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds);

    (profiles || []).forEach((p: any) => {
      profilesMap[p.id] = { full_name: p.full_name || '', email: p.email || '' };
    });
  }

  return (feedbackData || []).map((f: any) => {
    const profile = profilesMap[f.user_id];
    return {
      id: f.id,
      customer: profile?.full_name || profile?.email || 'Anonymous',
      ticketId: f.ticket_id || '',
      rating: f.rating,
      comment: f.comment || 'No comment provided.',
      date: new Date(f.created_at).toISOString().split('T')[0],
    };
  });
}

// ── SLA Rules ────────────────────────────────────────────────

export async function fetchSlaRules(): Promise<SlaRule[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('sla_rules')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('fetchSlaRules error:', error);
    return [];
  }

  return (data || []).map((r: any) => ({
    id: r.id,
    ruleName: r.rule_name,
    department: r.department,
    condition: r.condition,
    priority: r.priority,
    resolutionTime: r.resolution_time,
    notification: r.notification,
    status: r.status,
  }));
}

export async function createSlaRule(rule: SlaRule): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from('sla_rules')
    .insert({
      id: rule.id,
      rule_name: rule.ruleName,
      department: rule.department,
      condition: rule.condition,
      priority: rule.priority,
      resolution_time: rule.resolutionTime,
      notification: rule.notification,
      status: rule.status,
    });

  if (error) {
    console.error('createSlaRule error:', error);
    return false;
  }
  return true;
}

export async function updateSlaRule(id: string, rule: SlaRule): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from('sla_rules')
    .update({
      rule_name: rule.ruleName,
      department: rule.department,
      condition: rule.condition,
      priority: rule.priority,
      resolution_time: rule.resolutionTime,
      notification: rule.notification,
      status: rule.status,
    })
    .eq('id', id);

  if (error) {
    console.error('updateSlaRule error:', error);
    return false;
  }
  return true;
}

export async function toggleSlaRuleStatus(id: string, currentStatus: string): Promise<boolean> {
  if (!supabase) return false;

  const newStatus = currentStatus === 'ENABLED' ? 'DISABLED' : 'ENABLED';
  const { error } = await supabase
    .from('sla_rules')
    .update({ status: newStatus })
    .eq('id', id);

  if (error) {
    console.error('toggleSlaRuleStatus error:', error);
    return false;
  }
  return true;
}

export async function deleteSlaRule(id: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from('sla_rules')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('deleteSlaRule error:', error);
    return false;
  }
  return true;
}

// ── Dashboard Stats ──────────────────────────────────────────

export async function fetchDashboardStats(): Promise<Record<string, number> | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.rpc('get_admin_dashboard_stats');

  if (error) {
    console.error('fetchDashboardStats error:', error);
    return null;
  }

  return data;
}
