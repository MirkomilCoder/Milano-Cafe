"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, BarChart3, TrendingUp, Users, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalyticsStats } from "@/lib/types"

interface StatusPageProps {
    initialStats?: AnalyticsStats
}

export default function StatusPage() {
    const [stats, setStats] = useState<AnalyticsStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [days, setDays] = useState(30)

    useEffect(() => {
        fetchAnalytics()
    }, [days])

    const fetchAnalytics = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(`/api/admin/analytics/stats?days=${days}`)
            if (!response.ok) throw new Error("Failed to fetch analytics")
            const { data } = await response.json()
            setStats(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-40">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin">
                            <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-50">Sayt Statistikasi</h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Google Analytics va Vercel Status kabi statistika</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {[7, 30, 90].map((d) => (
                            <Button
                                key={d}
                                variant={days === d ? "default" : "outline"}
                                onClick={() => setDays(d)}
                                className={days === d ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}
                            >
                                {d} kun
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="p-6 lg:p-8">
                {error && (
                    <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4">
                        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="space-y-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : stats ? (
                    <div className="space-y-8">
                        {/* Summary Cards */}
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">Umumiy Statistika</h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Jami Tashrif</span>
                                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <p className="text-4xl font-bold text-blue-900 dark:text-blue-100">{stats.totalVisitors}</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-green-700 dark:text-green-300">Sahifa Ko'rishlar</span>
                                            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <p className="text-4xl font-bold text-green-900 dark:text-green-100">{stats.totalPageViews}</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Jami Click-lar</span>
                                            <Activity className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <p className="text-4xl font-bold text-amber-900 dark:text-amber-100">{stats.totalClicks}</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Jami Buyurtmalar</span>
                                            <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <p className="text-4xl font-bold text-purple-900 dark:text-purple-100">{stats.totalOrders}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Device Breakdown */}
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">Qurilma bo'yicha</h2>
                            <Card className="border-0">
                                <CardContent className="p-6">
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div className="rounded-lg bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 p-6">
                                            <p className="text-sm text-cyan-700 dark:text-cyan-300 mb-2">📱 Mobil</p>
                                            <p className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">{stats.deviceBreakdown.mobile}</p>
                                            <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-2">
                                                {((stats.deviceBreakdown.mobile / stats.totalPageViews) * 100 || 0).toFixed(1)}%
                                            </p>
                                        </div>

                                        <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 p-6">
                                            <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-2">💻 Desktop</p>
                                            <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">{stats.deviceBreakdown.desktop}</p>
                                            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">
                                                {((stats.deviceBreakdown.desktop / stats.totalPageViews) * 100 || 0).toFixed(1)}%
                                            </p>
                                        </div>

                                        <div className="rounded-lg bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 p-6">
                                            <p className="text-sm text-pink-700 dark:text-pink-300 mb-2">⌚ Tablet</p>
                                            <p className="text-3xl font-bold text-pink-900 dark:text-pink-100">{stats.deviceBreakdown.tablet}</p>
                                            <p className="text-xs text-pink-600 dark:text-pink-400 mt-2">
                                                {((stats.deviceBreakdown.tablet / stats.totalPageViews) * 100 || 0).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Top Searches */}
                        {stats.topSearches.length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">Eng ko'p izlangan</h2>
                                <Card className="border-0">
                                    <CardContent className="p-6">
                                        <div className="space-y-3">
                                            {stats.topSearches.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <span className="text-2xl font-bold text-slate-400 dark:text-slate-600">#{idx + 1}</span>
                                                        <span className="text-slate-900 dark:text-slate-50 font-medium truncate">{item.query}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
                                                                style={{
                                                                    width: `${(item.count / (stats.topSearches[0]?.count || 1)) * 100}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400 w-8 text-right">{item.count}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Top Pages */}
                        {stats.topPages.length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">Eng ko'p ko'rilgan sahifalar</h2>
                                <Card className="border-0">
                                    <CardContent className="p-6">
                                        <div className="space-y-3">
                                            {stats.topPages.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <span className="text-2xl font-bold text-slate-400 dark:text-slate-600">#{idx + 1}</span>
                                                        <span className="text-slate-900 dark:text-slate-50 font-medium truncate text-sm">{item.url}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-green-400 to-green-600"
                                                                style={{
                                                                    width: `${(item.views / (stats.topPages[0]?.views || 1)) * 100}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400 w-8 text-right">{item.views}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Visitor Trend */}
                        {stats.visitorsTrend.length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">Tashrif etuvchilar trendi</h2>
                                <Card className="border-0">
                                    <CardContent className="p-6">
                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                            {stats.visitorsTrend.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded">
                                                    <span className="text-sm text-slate-600 dark:text-slate-400 w-24">{new Date(item.date).toLocaleDateString("uz-UZ")}</span>
                                                    <div className="flex-1 mx-4 h-8 bg-slate-100 dark:bg-slate-800 rounded flex items-center">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded flex items-center justify-end pr-2 transition-all"
                                                            style={{
                                                                width: `${(item.count / (Math.max(...stats.visitorsTrend.map((v) => v.count), 1))) * 100}%`,
                                                            }}
                                                        >
                                                            <span className="text-xs font-bold text-white">{item.count > 0 ? item.count : ""}</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-50 w-8 text-right">{item.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                ) : null}
            </main>
        </div>
    )
}
