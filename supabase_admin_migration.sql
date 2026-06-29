-- ============================================================
-- AI Customer Service — Admin Panel Migration
-- Run this ENTIRE script in the Supabase SQL Editor
-- after the main schema has been applied.
-- ============================================================

-- ============================================================
-- 1. ADD ADMIN ROLE TO PROFILES
-- ============================================================

-- Add role column (safe if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- ============================================================
-- 2. SLA RULES TABLE (admin-only config)
-- ============================================================

CREATE TABLE IF NOT EXISTS sla_rules (
  id TEXT PRIMARY KEY,
  rule_name TEXT NOT NULL,
  department TEXT NOT NULL,
  condition TEXT NOT NULL DEFAULT 'Resolution Time',
  priority TEXT NOT NULL CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  resolution_time TEXT NOT NULL DEFAULT '24h',
  notification TEXT NOT NULL DEFAULT '[Notify L1 Team]',
  status TEXT NOT NULL DEFAULT 'ENABLED' CHECK (status IN ('ENABLED', 'DISABLED')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sla_rules ENABLE ROW LEVEL SECURITY;

-- Only admins can CRUD SLA rules
CREATE POLICY "Admins can manage SLA rules"
  ON sla_rules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================================
-- 3. ADMIN RLS POLICIES (allow admins to read/write all data)
-- ============================================================

-- Helper: All admin policies use this pattern:
--   USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))

-- ── Profiles: Admin can view ALL profiles ──
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ── Products: Admin can view ALL products ──
CREATE POLICY "Admins can view all products"
  ON products FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ── Tickets: Admin can view and update ALL tickets ──
CREATE POLICY "Admins can view all tickets"
  ON tickets FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can update all tickets"
  ON tickets FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ── Ticket Timeline: Admin can view and update ALL ──
CREATE POLICY "Admins can view all ticket timelines"
  ON ticket_timeline FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can update all ticket timelines"
  ON ticket_timeline FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can insert ticket timelines"
  ON ticket_timeline FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ── Ticket Updates: Admin can view and insert ALL ──
CREATE POLICY "Admins can view all ticket updates"
  ON ticket_updates FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can insert ticket updates"
  ON ticket_updates FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ── Feedback: Admin can view ALL feedback ──
CREATE POLICY "Admins can view all feedback"
  ON feedback FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ── Attachments: Admin can view ALL attachments ──
CREATE POLICY "Admins can view all attachments"
  ON attachments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ── FAQ Categories: Admin can CRUD ──
CREATE POLICY "Admins can insert FAQ categories"
  ON faq_categories FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can update FAQ categories"
  ON faq_categories FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can delete FAQ categories"
  ON faq_categories FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ── FAQ Articles: Admin can CRUD ──
CREATE POLICY "Admins can insert FAQ articles"
  ON faq_articles FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can update FAQ articles"
  ON faq_articles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can delete FAQ articles"
  ON faq_articles FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ── Issue Categories: Admin can CRUD ──
CREATE POLICY "Admins can insert issue categories"
  ON issue_categories FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can update issue categories"
  ON issue_categories FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can delete issue categories"
  ON issue_categories FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ============================================================
-- 4. SEED DEFAULT SLA RULES
-- ============================================================

INSERT INTO sla_rules (id, rule_name, department, condition, priority, resolution_time, notification, status) VALUES
  ('SLA-001', 'L1 Initial Support Response Time SLA',       'L1 Support',    'Resolution Time', 'CRITICAL', '4h',  '[Notify L1 Team]',  'ENABLED'),
  ('SLA-002', 'L2 Complex Issue Resolution Timeline',       'L2 Technical',  'Resolution Time', 'CRITICAL', '4h',  '[Notify L1 Team]',  'ENABLED'),
  ('SLA-003', 'General L2 Normal Flow Escalation',          'L2 Technical',  'Resolution Time', 'HIGH',     '24h', '[Notify L1 Team]',  'ENABLED'),
  ('SLA-004', 'L1 High Severity Escalate To Lead',          'L1 Support',    'Resolution Time', 'HIGH',     '24h', '[Notify L2 Team]',  'ENABLED'),
  ('SLA-005', 'Billing Disputes Settlement Standard',       'Billing',       'Resolution Time', 'MEDIUM',   '48h', '[Notify L2 Team]',  'DISABLED'),
  ('SLA-006', 'Billing General Query Answering Time',       'Billing',       'Resolution Time', 'MEDIUM',   '48h', '[Notify Billing]',  'DISABLED'),
  ('SLA-007', 'Enterprise VIP Accounts SLA Response Cover', 'Billing',       'Resolution Time', 'MEDIUM',   '48h', '[Notify Billing]',  'DISABLED'),
  ('SLA-008', 'Enterprise Technical Incident Standard SLA', 'Billing',       'Resolution Time', 'MEDIUM',   '48h', '[Notify Billing]',  'DISABLED')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. DATABASE FUNCTION: Get customer aggregates for admin
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_admin_customers()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  products_owned BIGINT,
  open_tickets BIGINT,
  total_tickets BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.email,
    p.phone,
    p.role,
    p.created_at,
    COUNT(DISTINCT pr.id) AS products_owned,
    COUNT(DISTINCT CASE WHEN t.status IN ('Open', 'In Progress') THEN t.id END) AS open_tickets,
    COUNT(DISTINCT t.id) AS total_tickets
  FROM profiles p
  LEFT JOIN products pr ON pr.user_id = p.id
  LEFT JOIN tickets t ON t.user_id = p.id
  WHERE p.role = 'user'
  GROUP BY p.id, p.full_name, p.email, p.phone, p.role, p.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 6. DATABASE FUNCTION: Get admin dashboard stats
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_tickets', (SELECT COUNT(*) FROM tickets),
    'open_tickets', (SELECT COUNT(*) FROM tickets WHERE status = 'Open'),
    'in_progress_tickets', (SELECT COUNT(*) FROM tickets WHERE status = 'In Progress'),
    'resolved_tickets', (SELECT COUNT(*) FROM tickets WHERE status = 'Resolved'),
    'closed_tickets', (SELECT COUNT(*) FROM tickets WHERE status = 'Closed'),
    'total_customers', (SELECT COUNT(*) FROM profiles WHERE role = 'user'),
    'total_products', (SELECT COUNT(*) FROM products),
    'total_feedback', (SELECT COUNT(*) FROM feedback),
    'avg_rating', (SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0) FROM feedback)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 7. UPDATE handle_new_user TO INCLUDE ROLE
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- DONE! After running this migration:
-- 1. Set your admin user's role:
--    UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
-- 2. Restart the admin panel.
-- ============================================================
