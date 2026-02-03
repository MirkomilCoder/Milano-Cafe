'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ChefHat,
  Clock,
  TrendingUp,
  ShoppingCart,
  AlertCircle,
  Users,
  Zap,
  Activity,
  Flame,
  BarChart3,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Progress } from '@/components/ui/progress'

const supabase = createClient()

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  completedToday: number
  activeChefs: number
  avgPrepTime: number
  kitchenLoad: number
  activeCustomers: number
  revenue: number
}

interface KitchenTask {
  id: string
  orderId: string
  itemName: string
  status: 'pending' | 'preparing' | 'ready' | 'completed'
  startedAt?: string
  estimatedTime: number
  priority: 'low' | 'medium' | 'high'
}

interface ChefStatus {
  id: string
  name: string
  status: 'idle' | 'working' | 'break'
  currentTask?: string
  itemsCompleted: number
}

export function EnhancedAdminDashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedToday: 0,
    activeChefs: 0,
    avgPrepTime: 0,
    kitchenLoad: 0,
    activeCustomers: 0,
    revenue: 0,
  })

  const [kitchenTasks, setKitchenTasks] = useState<KitchenTask[]>([])
  const [chefStatuses, setChefStatuses] = useState<ChefStatus[]>([])
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch orders
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('id, status, total, created_at')

        if (ordersError) throw ordersError

        const ordersArray = orders || []
        const pending = ordersArray.filter((o: any) => o.status !== 'completed').length
        const completed = ordersArray.filter((o: any) => o.status === 'completed' && new Date(o.created_at).toDateString() === new Date().toDateString()).length
        const todayRevenue = ordersArray
          .filter((o: any) => new Date(o.created_at).toDateString() === new Date().toDateString())
          .reduce((sum: number, o: any) => sum + (o.total || 0), 0)

        // Fetch kitchen tasks
        const { data: tasks, error: tasksError } = await supabase
          .from('kitchen_tasks')
          .select('*')
          .order('priority', { ascending: false })

        if (!tasksError && tasks) {
          setKitchenTasks(
            tasks.map((t: any) => ({
              id: t.id,
              orderId: t.order_id,
              itemName: t.item_name,
              status: t.status,
              startedAt: t.started_at,
              estimatedTime: t.estimated_time || 15,
              priority: t.priority || 'medium',
            }))
          )
        }

        // Fetch chef statuses
        const { data: chefs, error: chefsError } = await supabase
          .from('chef_status')
          .select('*')

        if (!chefsError && chefs) {
          setChefStatuses(
            chefs.map((c: any) => ({
              id: c.id,
              name: c.name,
              status: c.status,
              currentTask: c.current_task,
              itemsCompleted: c.items_completed || 0,
            }))
          )
        }

        setStats({
          totalOrders: ordersArray.length,
          pendingOrders: pending,
          completedToday: completed,
          activeChefs: chefs?.filter((c: any) => c.status === 'working').length || 0,
          avgPrepTime: 18,
          kitchenLoad: Math.min(100, (pending * 20)),
          activeCustomers: ordersArray.filter((o: any) => o.status === 'preparing').length,
          revenue: todayRevenue,
        })
      } catch (error) {
        console.error('[v0] Error fetching dashboard data:', error)
      } finally {
        setLoadingStats(false)
      }
    }

    fetchDashboardData()

    // Subscribe to real-time updates
    const orderSub = supabase
      .channel('dashboard_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchDashboardData)
      .subscribe()

    const taskSub = supabase
      .channel('dashboard_tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kitchen_tasks' }, fetchDashboardData)
      .subscribe()

    return () => {
      orderSub.unsubscribe()
      taskSub.unsubscribe()
    }
  }, [])

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    preparing: 'bg-blue-100 text-blue-800',
    ready: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
  }

  const chefStatusColors: Record<string, string> = {
    idle: 'bg-gray-100 text-gray-800',
    working: 'bg-green-100 text-green-800',
    break: 'bg-orange-100 text-orange-800',
  }

  return (
    <div className="w-full space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Active Chefs */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Chefs</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeChefs}</p>
              </div>
              <ChefHat className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Today's Revenue */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Revenue</p>
                <p className="text-2xl font-bold">${stats.revenue.toFixed(0)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kitchen Load & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Kitchen Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Load</span>
                <span className="font-semibold">{Math.round(stats.kitchenLoad)}%</span>
              </div>
              <Progress value={stats.kitchenLoad} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {stats.kitchenLoad < 50 && 'Low load - Normal operations'}
                {stats.kitchenLoad >= 50 && stats.kitchenLoad < 80 && 'Medium load - Slightly busy'}
                {stats.kitchenLoad >= 80 && 'High load - Very busy'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Avg Prep Time</span>
                  <span className="font-semibold">{stats.avgPrepTime} min</span>
                </div>
                <Progress value={(stats.avgPrepTime / 30) * 100} className="h-2" />
              </div>
              <div className="text-sm pt-2 border-t">
                <p className="text-muted-foreground">Completed Today: <span className="font-semibold text-foreground">{stats.completedToday}</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kitchen Tasks & Chef Status Tabs */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks">Kitchen Queue</TabsTrigger>
          <TabsTrigger value="chefs">Chef Status</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ChefHat className="w-4 h-4" />
                Active Kitchen Tasks ({kitchenTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {kitchenTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No active tasks</p>
                ) : (
                  kitchenTasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-3 hover:bg-accent transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm">{task.itemName}</p>
                          <p className="text-xs text-muted-foreground">Order #{task.orderId.slice(0, 8)}</p>
                        </div>
                        <div className="flex gap-1">
                          <Badge variant="outline" className={`text-xs ${statusColors[task.status]}`}>
                            {task.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Est. Time: {task.estimatedTime} min</span>
                        <span>Started: {task.startedAt ? new Date(task.startedAt).toLocaleTimeString() : 'Not started'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chefs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chef Status & Workload</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {chefStatuses.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No chefs online</p>
                ) : (
                  chefStatuses.map((chef) => (
                    <div key={chef.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm">{chef.name}</p>
                          <p className="text-xs text-muted-foreground">{chef.currentTask || 'Idle'}</p>
                        </div>
                        <Badge variant="outline" className={`text-xs ${chefStatusColors[chef.status]}`}>
                          {chef.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Items Completed: {chef.itemsCompleted}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
