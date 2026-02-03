"use client"

import { format, differenceInDays, differenceInHours } from "date-fns"
import { Check, Clock, Trash2, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Order } from "@/lib/types"

interface OrderTimelineProps {
  order: Order
}

const statuses = [
  { key: "pending", label: "Kutilmoqda", icon: Clock },
  { key: "confirmed", label: "Tasdiqlangan", icon: Check },
  { key: "preparing", label: "Tayyorlanmoqda", icon: Clock },
  { key: "ready", label: "Tayyor", icon: Check },
  { key: "completed", label: "Yakunlangan", icon: Check },
  { key: "cancelled", label: "Bekor qilingan", icon: AlertCircle },
]

export function OrderTimeline({ order }: OrderTimelineProps) {
  const currentStatusIndex = statuses.findIndex((s) => s.key === order.status)
  
  // Calculate days until auto-transition (if pending)
  let daysUntilTransition = null
  if (order.status === "pending" && order.auto_transition_at) {
    daysUntilTransition = differenceInDays(new Date(order.auto_transition_at), new Date())
  }

  // Calculate days until deletion
  let daysUntilDeletion = null
  if (order.scheduled_deletion && !order.deleted_at) {
    daysUntilDeletion = differenceInDays(new Date(order.scheduled_deletion), new Date())
  }

  // Calculate how long order has been in current status
  const statusDuration = order.status_changed_at
    ? differenceInDays(new Date(), new Date(order.status_changed_at))
    : 0

  return (
    <div className="space-y-6">
      {/* Timeline visualization */}
      <Card className="p-6">
        <h3 className="font-semibold mb-6">Buyurtma Rivojlanishi</h3>
        
        <div className="flex items-start gap-4">
          {statuses.map((status, index) => {
            const isCompleted = index < currentStatusIndex
            const isCurrent = index === currentStatusIndex
            const isDisabled = index > currentStatusIndex

            return (
              <div key={status.key} className="flex flex-col items-center flex-1">
                {/* Timeline circle */}
                <div className="mb-2 relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? "bg-green-500"
                        : isCurrent
                          ? "bg-amber-500 ring-2 ring-amber-300"
                          : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    <status.icon className={`w-5 h-5 ${isDisabled ? "text-slate-400" : "text-white"}`} />
                  </div>

                  {/* Timeline connector */}
                  {index < statuses.length - 1 && (
                    <div
                      className={`absolute top-1/2 left-[calc(100%+0.5rem)] w-[calc(100%-2.5rem)] h-1 -translate-y-1/2 transition-colors ${
                        index < currentStatusIndex ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    />
                  )}
                </div>

                {/* Label */}
                <div className="text-center mt-2">
                  <p className={`text-xs font-medium ${isCurrent ? "text-amber-600 dark:text-amber-400" : ""}`}>
                    {status.label}
                  </p>
                  {isCurrent && order.status_changed_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {statusDuration} kun
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Order timing information */}
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold">Vaqt Ma'lumotlari</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Created date */}
          <div>
            <p className="text-sm text-muted-foreground">Yaratilgan sana</p>
            <p className="font-medium">{format(new Date(order.created_at), "dd MMM yyyy HH:mm")}</p>
          </div>

          {/* Status changed */}
          {order.status_changed_at && (
            <div>
              <p className="text-sm text-muted-foreground">Status o'zgartirilgan</p>
              <p className="font-medium">
                {format(new Date(order.status_changed_at), "dd MMM yyyy HH:mm")}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                {statusDuration} kun oldin
              </p>
            </div>
          )}

          {/* Auto-transition countdown */}
          {order.status === "pending" && daysUntilTransition !== null && (
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Avtomatik o'tkazish
              </p>
              <p className="font-medium">
                {daysUntilTransition > 0 ? `${daysUntilTransition} kun qoldi` : "Bugun"}
              </p>
              {daysUntilTransition <= 1 && (
                <Badge variant="destructive" className="mt-2">
                  Tez bo'ladi!
                </Badge>
              )}
            </div>
          )}

          {/* Deletion countdown */}
          {daysUntilDeletion !== null && (
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Avtomatik o'chirish
              </p>
              <p className="font-medium">
                {daysUntilDeletion > 0 ? `${daysUntilDeletion} kun qoldi` : "Bugun"}
              </p>
              {daysUntilDeletion <= 3 && daysUntilDeletion > 0 && (
                <Badge variant="outline" className="mt-2 border-red-500 text-red-500">
                  Tez o'chiriladi!
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Status rules info */}
        {order.status === "cancelled" && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
            <p className="text-sm">
              <strong>Bekor qilingan buyurtma:</strong> 10 kundan keyin avtomatik o'chiriladi
            </p>
          </div>
        )}

        {order.status === "completed" && (
          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
            <p className="text-sm">
              <strong>Yakunlangan buyurtma:</strong> 30 kundan keyin avtomatik o'chiriladi
            </p>
          </div>
        )}

        {order.status === "pending" && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
            <p className="text-sm">
              <strong>Kutilmoqda:</strong> 5 kundan keyin avtomatik "Yakunlangan" statusiga o'tadi
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
