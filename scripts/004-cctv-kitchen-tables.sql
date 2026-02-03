-- Create CCTV Cameras Table
CREATE TABLE IF NOT EXISTS cctv_cameras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  is_online BOOLEAN DEFAULT false,
  resolution VARCHAR(50) DEFAULT '1080p',
  stream_url VARCHAR(500),
  last_seen TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create CCTV Recordings Table
CREATE TABLE IF NOT EXISTS cctv_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camera_id UUID NOT NULL REFERENCES cctv_cameras(id) ON DELETE CASCADE,
  started_at TIMESTAMP DEFAULT now(),
  ended_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  file_url VARCHAR(500),
  duration_minutes INTEGER,
  file_size_mb INTEGER,
  created_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (camera_id) REFERENCES cctv_cameras(id)
);

-- Create Kitchen Tasks Table
CREATE TABLE IF NOT EXISTS kitchen_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'medium',
  estimated_time INTEGER DEFAULT 15,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  assigned_to_chef UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create Chef Status Table
CREATE TABLE IF NOT EXISTS chef_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'idle',
  current_task UUID REFERENCES kitchen_tasks(id),
  items_completed INTEGER DEFAULT 0,
  shift_start TIMESTAMP,
  shift_end TIMESTAMP,
  last_updated TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);

-- Create Kitchen Activity Log Table
CREATE TABLE IF NOT EXISTS kitchen_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id UUID REFERENCES chef_status(id),
  task_id UUID REFERENCES kitchen_tasks(id),
  activity_type VARCHAR(100),
  description TEXT,
  timestamp TIMESTAMP DEFAULT now()
);

-- Create Restaurant Alerts Table
CREATE TABLE IF NOT EXISTS restaurant_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type VARCHAR(100),
  severity VARCHAR(50) DEFAULT 'info',
  message TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id)
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_cctv_cameras_is_online ON cctv_cameras(is_online);
CREATE INDEX IF NOT EXISTS idx_kitchen_tasks_status ON kitchen_tasks(status);
CREATE INDEX IF NOT EXISTS idx_kitchen_tasks_order_id ON kitchen_tasks(order_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_tasks_priority ON kitchen_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_chef_status_status ON chef_status(status);
CREATE INDEX IF NOT EXISTS idx_cctv_recordings_camera_id ON cctv_recordings(camera_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_activity_chef_id ON kitchen_activity_log(chef_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_alerts_resolved ON restaurant_alerts(resolved);

-- Enable RLS for CCTV Cameras
ALTER TABLE cctv_cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE kitchen_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chef_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE cctv_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE kitchen_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_alerts ENABLE ROW LEVEL SECURITY;

-- CCTV Cameras Policies
CREATE POLICY "admin_can_view_all_cameras" ON cctv_cameras
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "admin_can_manage_cameras" ON cctv_cameras
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Kitchen Tasks Policies
CREATE POLICY "kitchen_staff_can_view_tasks" ON kitchen_tasks
  FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('admin', 'chef', 'kitchen_staff'));

CREATE POLICY "chefs_can_update_own_tasks" ON kitchen_tasks
  FOR UPDATE
  USING (assigned_to_chef = auth.uid());

CREATE POLICY "admin_can_manage_tasks" ON kitchen_tasks
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Chef Status Policies
CREATE POLICY "admin_can_view_chef_status" ON chef_status
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "chefs_can_update_own_status" ON chef_status
  FOR UPDATE
  USING (user_id = auth.uid());

-- Kitchen Activity Log Policies
CREATE POLICY "admin_can_view_activity_log" ON kitchen_activity_log
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Restaurant Alerts Policies
CREATE POLICY "admin_can_manage_alerts" ON restaurant_alerts
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "staff_can_view_alerts" ON restaurant_alerts
  FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('admin', 'chef', 'kitchen_staff', 'staff'));
