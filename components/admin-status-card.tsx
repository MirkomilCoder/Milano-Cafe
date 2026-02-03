"use client"

import { useEffect, useState } from "react"
import { Activity, TrendingUp, Users, BarChart3, Smartphone, Monitor } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AnalyticsStats } from "@/lib/types"

interface AdminStatusCardProps {
    stats?: AnalyticsStats
    loading?: boolean
    error?: string
}

export function AdminStatusCard({ stats, loading = false, error }: AdminStatusCardProps) {
    return (
        <Card className="shadow-card border-0 overflow-hidden bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-purple-900/30">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-slate-50 to-white p-6 dark:from-slate-800 dark:to-slate-700">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-200 to-purple-100 dark:from-purple-900 dark:to-purple-800">
                        <Activity className="h-6 w-6 text-purple-700 dark:text-purple-300" />
                    </div>
                    <CardTitle className="text-slate-900 font-serif text-xl dark:text-slate-50">Sayt Statistikasi</CardTitle>
                </div>
                <Link href="/admin/status">
                    <Button variant="ghost" size="sm" className="text-purple-700 hover:text-purple-900 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20">
                        Batafsil
                    </Button>
                </Link>
            </CardHeader>

            {error && (
                <div className="p-6 text-sm text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {loading ? (
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </CardContent>
            ) : stats ? (
                <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {/* Total Visitors */}
                        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Tashrif etuvchilar</span>
                                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalVisitors}</p>
                        </div>

                        {/* Page Views */}
                        <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4 border border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-green-700 dark:text-green-300">Sahifa ko'rishlar</span>
                                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.totalPageViews}</p>
                        </div>

                        {/* Total Clicks */}
                        <div className="rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 p-4 border border-amber-200 dark:border-amber-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">Click-lar</span>
                                <BarChart3 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stats.totalClicks}</p>
                        </div>

                        {/* Total Searches */}
                        <div className="rounded-lg bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900 p-4 border border-rose-200 dark:border-rose-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">Qidiruvlar</span>
                                <Activity className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                            </div>
                            <p className="text-2xl font-bold text-rose-900 dark:text-rose-100">{stats.totalSearches}</p>
                        </div>

                        {/* Mobile Visits */}
                        <div className="rounded-lg bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 p-4 border border-cyan-200 dark:border-cyan-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">Mobil</span>
                                <Smartphone className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <p className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">{stats.deviceBreakdown.mobile}</p>
                        </div>

                        {/* Desktop Visits */}
                        <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 p-4 border border-indigo-200 dark:border-indigo-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Desktop</span>
                                <Monitor className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{stats.deviceBreakdown.desktop}</p>
                        </div>

                        {/* Logins */}
                        <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 p-4 border border-emerald-200 dark:border-emerald-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Kirish</span>
                                <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{stats.totalLogins}</p>
                        </div>

                        {/* Orders */}
                        <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 p-4 border border-orange-200 dark:border-orange-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">Buyurtmalar</span>
                                <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.totalOrders}</p>
                        </div>
                    </div>
                </CardContent>
            ) : (
                <CardContent className="pt-6">
                    <p className="text-center text-slate-500 dark:text-slate-400">Ma'lumot topilmadi</p>
                </CardContent>
            )}
        </Card>
    )
}
