'use client'

import { useState } from 'react'
import { useKitchenTasks } from '@/hooks/use-kitchen-tasks'
import { EnhancedAdminDashboard } from '@/components/enhanced-admin-dashboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, AlertCircle, CheckCircle2, ChefHat } from 'lucide-react'

export default function KitchenPage() {
  const { tasks, loading } = useKitchenTasks()
  const [selectedStatus, setSelectedStatus] = useState<string>('pending')

  const pendingTasks = tasks.filter((t) => t.status === 'pending')
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress')
  const completedTasks = tasks.filter((t) => t.status === 'completed')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'urgent':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />
      case 'urgent':
        return <AlertCircle className="h-4 w-4" />
      case 'in_progress':
        return <Clock className="h-4 w-4" />
      default:
        return <ChefHat className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kitchen Operations</h1>
        <p className="text-muted-foreground mt-1">Manage kitchen tasks and monitor preparation progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <ChefHat className="h-4 w-4 mr-2" />
              Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Waiting to start</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Being prepared</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready to serve</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Urgent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {tasks.filter((t) => t.priority === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {pendingTasks.length > 5 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            High number of pending tasks. Consider assigning more chefs or accelerating preparation.
          </AlertDescription>
        </Alert>
      )}

      {/* Kitchen Tasks Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Kitchen Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="w-full">
            <TabsList>
              <TabsTrigger value="pending">
                Pending {pendingTasks.length > 0 && `(${pendingTasks.length})`}
              </TabsTrigger>
              <TabsTrigger value="in_progress">
                In Progress {inProgressTasks.length > 0 && `(${inProgressTasks.length})`}
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed {completedTasks.length > 0 && `(${completedTasks.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-3 mt-4">
              {pendingTasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending tasks</p>
              ) : (
                pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{task.dish_name}</h3>
                      <p className="text-sm text-muted-foreground">Order #{task.order_id?.slice(0, 8)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(task.status)}>
                        {getStatusIcon(task.status)}
                        <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
                      </Badge>
                      <Button size="sm" variant="outline">
                        Start
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="in_progress" className="space-y-3 mt-4">
              {inProgressTasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No tasks in progress</p>
              ) : (
                inProgressTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{task.dish_name}</h3>
                      <p className="text-sm text-muted-foreground">Started {task.created_at && new Date(task.created_at).toLocaleTimeString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(task.status)}>
                        {getStatusIcon(task.status)}
                        <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
                      </Badge>
                      <Button size="sm">
                        Mark Done
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-3 mt-4">
              {completedTasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No completed tasks</p>
              ) : (
                completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{task.dish_name}</h3>
                      <p className="text-sm text-muted-foreground">Completed at {task.created_at && new Date(task.created_at).toLocaleTimeString()}</p>
                    </div>
                    <Badge className={getStatusColor(task.status)}>
                      {getStatusIcon(task.status)}
                      <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Full Dashboard */}
      <EnhancedAdminDashboard />
    </div>
  )
}
