-- Add new columns to orders table for lifecycle management
-- This migration adds order status tracking and automatic deletion support

-- Add columns to orders table if they don't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS scheduled_deletion TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS auto_transition_at TIMESTAMPTZ;

-- Create index for faster queries on lifecycle management
CREATE INDEX IF NOT EXISTS idx_orders_scheduled_deletion ON orders(scheduled_deletion) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_orders_auto_transition ON orders(auto_transition_at) 
WHERE status = 'pending' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_orders_deleted_at ON orders(deleted_at);
CREATE INDEX IF NOT EXISTS idx_orders_status_changed_at ON orders(status_changed_at);

-- Create audit_log table for order history tracking
CREATE TABLE IF NOT EXISTS order_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- 'created', 'status_changed', 'deleted', 'auto_transitioned'
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for audit log queries
CREATE INDEX IF NOT EXISTS idx_order_audit_log_order_id ON order_audit_log(order_id);
CREATE INDEX IF NOT EXISTS idx_order_audit_log_created_at ON order_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_order_audit_log_action ON order_audit_log(action);

-- Enable RLS on audit_log
ALTER TABLE order_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can view all audit logs
CREATE POLICY "admins_can_view_audit_logs" ON order_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.user_metadata->>'is_admin' = 'true'
    )
  );

-- System can insert audit logs
CREATE POLICY "system_can_insert_audit_logs" ON order_audit_log
  FOR INSERT WITH CHECK (true);

-- Create function to automatically set scheduled_deletion and auto_transition_at when order is created or status changed
CREATE OR REPLACE FUNCTION set_order_lifecycle_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Update status_changed_at
  NEW.status_changed_at = now();
  
  -- Set auto_transition_at if order is pending (5 days)
  IF NEW.status = 'pending' THEN
    NEW.auto_transition_at = now() + INTERVAL '5 days';
  ELSE
    NEW.auto_transition_at = NULL;
  END IF;
  
  -- Set scheduled_deletion based on status
  IF NEW.status = 'cancelled' THEN
    -- Delete cancelled orders after 10 days
    NEW.scheduled_deletion = now() + INTERVAL '10 days';
  ELSIF NEW.status = 'completed' THEN
    -- Delete completed orders after 30 days
    NEW.scheduled_deletion = now() + INTERVAL '30 days';
  ELSE
    NEW.scheduled_deletion = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for lifecycle timestamps
DROP TRIGGER IF EXISTS order_lifecycle_timestamps ON orders;
CREATE TRIGGER order_lifecycle_timestamps
BEFORE INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION set_order_lifecycle_timestamps();

-- Create function to log order changes
CREATE OR REPLACE FUNCTION log_order_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO order_audit_log (order_id, action, new_status, created_at)
    VALUES (NEW.id, 'created', NEW.status, now());
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO order_audit_log (order_id, action, old_status, new_status, created_at)
    VALUES (NEW.id, 'status_changed', OLD.status, NEW.status, now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS order_audit_trigger ON orders;
CREATE TRIGGER order_audit_trigger
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION log_order_changes();

-- Create function to handle automatic order deletion
CREATE OR REPLACE FUNCTION cleanup_expired_orders()
RETURNS TABLE(deleted_count INT) AS $$
DECLARE
  v_deleted_count INT := 0;
BEGIN
  -- Update orders that should be deleted (soft delete)
  UPDATE orders
  SET deleted_at = now()
  WHERE deleted_at IS NULL
    AND scheduled_deletion IS NOT NULL
    AND scheduled_deletion <= now();
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN QUERY SELECT v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle automatic status transition (5 days pending -> completed)
CREATE OR REPLACE FUNCTION auto_transition_pending_orders()
RETURNS TABLE(transitioned_count INT) AS $$
DECLARE
  v_transitioned_count INT := 0;
BEGIN
  -- Update orders pending longer than 5 days to completed
  UPDATE orders
  SET status = 'completed'
  WHERE status = 'pending'
    AND deleted_at IS NULL
    AND auto_transition_at IS NOT NULL
    AND auto_transition_at <= now();
  
  GET DIAGNOSTICS v_transitioned_count = ROW_COUNT;
  
  RETURN QUERY SELECT v_transitioned_count;
END;
$$ LANGUAGE plpgsql;

-- Create a view for active orders (not deleted)
CREATE OR REPLACE VIEW active_orders AS
SELECT * FROM orders
WHERE deleted_at IS NULL;

-- Create a view for order statistics
CREATE OR REPLACE VIEW order_statistics AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_count,
  COUNT(*) FILTER (WHERE status = 'preparing') as preparing_count,
  COUNT(*) FILTER (WHERE status = 'ready') as ready_count,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count,
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted_count,
  COUNT(*) as total_count
FROM orders;
