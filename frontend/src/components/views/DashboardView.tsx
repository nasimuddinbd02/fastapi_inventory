"use client"

import React, { useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchProducts } from '@/store/productsSlice'
import { fetchIntakeOrders } from '@/store/intakeSlice'
import { fetchDispatchOrders } from '@/store/dispatchSlice'
import { fetchCategories } from '@/store/categoriesSlice'
import { setActiveView, ViewKey } from '@/store/uiSlice'
import { selectSettings } from '@/store/settingsSlice'
import { getCurrencySymbol } from '@/hooks/use-settings'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Package,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  Truck,
  Clock
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts'

export default function DashboardView() {
  const dispatch = useAppDispatch()
  
  // Get settings from Redux store
  const settings = useAppSelector(selectSettings)
  const LOW_STOCK_THRESHOLD = settings.low_stock_threshold
  const showStockValue = settings.show_stock_value_in_dashboard
  const currency = settings.currency
  const currencySymbol = getCurrencySymbol(currency)

  const { items: products } = useAppSelector((state) => state.products)
  const { items: intakeOrders } = useAppSelector((state) => state.intake)
  const { items: dispatchOrders } = useAppSelector((state) => state.dispatch)
  const { items: categories } = useAppSelector((state) => state.categories)

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, pageSize: 100 }))
    dispatch(fetchIntakeOrders({ page: 1, pageSize: 100 }))
    dispatch(fetchDispatchOrders({ page: 1, pageSize: 100 }))
    dispatch(fetchCategories({ page: 1, pageSize: 100 }))
  }, [dispatch])

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalProducts = products.length
    const totalStockValue = products.reduce((sum, p) => sum + ((p.available_stock || 0) * (p.unit_price || 0)), 0)
    const lowStockItems = products.filter(p => (p.available_stock || 0) > 0 && (p.available_stock || 0) <= LOW_STOCK_THRESHOLD)
    const outOfStockItems = products.filter(p => !p.available_stock || p.available_stock === 0)

    const today = new Date().toISOString().split('T')[0]
    const todayIntakes = intakeOrders.filter(o => o.intake_date?.startsWith(today))
    const todayDispatches = dispatchOrders.filter(o => o.dispatch_date?.startsWith(today))

    const totalIntakeValue = intakeOrders.reduce((sum, o) => sum + (Number(o.total_cost) || 0), 0)
    const totalDispatchValue = dispatchOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)

    return {
      totalProducts,
      totalStockValue: Number.isNaN(totalStockValue) ? 0 : totalStockValue,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      lowStockItems,
      outOfStockItems,
      todayIntakesCount: todayIntakes.length,
      todayDispatchesCount: todayDispatches.length,
      totalIntakeValue: Number.isNaN(totalIntakeValue) ? 0 : totalIntakeValue,
      totalDispatchValue: Number.isNaN(totalDispatchValue) ? 0 : totalDispatchValue
    }
  }, [products, intakeOrders, dispatchOrders])

  // Recent activity (last 5 of each)
  const recentIntakes = useMemo(() => {
    return [...intakeOrders]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  }, [intakeOrders])

  const recentDispatches = useMemo(() => {
    return [...dispatchOrders]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  }, [dispatchOrders])

  // Stock by category for pie chart
  const stockByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>()
    products.forEach(p => {
      const categoryName = p.category?.category_name || 'Uncategorized'
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + p.available_stock)
    })
    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }))
  }, [products])

  // Top products by stock value
  const topProductsByValue = useMemo(() => {
    return [...products]
      .map(p => ({
        name: p.product_title.length > 15 ? p.product_title.substring(0, 15) + '...' : p.product_title,
        fullName: p.product_title,
        value: p.available_stock * p.unit_price,
        stock: p.available_stock
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [products])

  // Transaction trend (last 7 days mock data based on actual orders)
  const transactionTrend = useMemo(() => {
    const days: { name: string; intake: number; dispatch: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })

      const intakeCount = intakeOrders.filter(o => o.intake_date?.startsWith(dateStr)).length
      const dispatchCount = dispatchOrders.filter(o => o.dispatch_date?.startsWith(dateStr)).length

      days.push({ name: dayName, intake: intakeCount, dispatch: dispatchCount })
    }
    return days
  }, [intakeOrders, dispatchOrders])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658']

  const getStatusVariant = (status: string, type: 'intake' | 'dispatch'): 'default' | 'destructive' | 'secondary' => {
    if (type === 'intake') {
      if (status === 'confirmed') return 'default'
      if (status === 'cancelled') return 'destructive'
      return 'secondary'
    } else {
      if (status === 'completed') return 'default'
      if (status === 'cancelled') return 'destructive'
      return 'secondary'
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(value)
  }

  const navigateTo = (view: ViewKey) => {
    dispatch(setActiveView(view))
  }

  return (
    <div className="container pt-4 space-y-6">
      <p className="text-sm text-muted-foreground">
        Welcome to your inventory management hub. Monitor key metrics, track recent activity, and take quick actions.
      </p>

      {/* Key Metrics */}
      <div className={`grid gap-4 md:grid-cols-2 ${showStockValue ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {categories.length} categories
            </p>
          </CardContent>
        </Card>

        {showStockValue && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalStockValue)}</div>
              <p className="text-xs text-muted-foreground">
                Total inventory value
              </p>
            </CardContent>
          </Card>
        )}

        <Card className={metrics.lowStockCount > 0 ? "border-yellow-500" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${metrics.lowStockCount > 0 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.lowStockCount > 0 ? 'text-yellow-600' : ''}`}>
              {metrics.lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Below {LOW_STOCK_THRESHOLD} units
            </p>
          </CardContent>
        </Card>

        <Card className={metrics.outOfStockCount > 0 ? "border-red-500" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className={`h-4 w-4 ${metrics.outOfStockCount > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.outOfStockCount > 0 ? 'text-red-600' : ''}`}>
              {metrics.outOfStockCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Need immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigateTo('intake')} className="gap-2">
              <Plus className="h-4 w-4" />
              New Intake
            </Button>
            <Button onClick={() => navigateTo('dispatch')} variant="outline" className="gap-2">
              <Truck className="h-4 w-4" />
              New Dispatch
            </Button>
            <Button onClick={() => navigateTo('stock')} variant="outline" className="gap-2">
              <Eye className="h-4 w-4" />
              View Stock
            </Button>
            <Button onClick={() => navigateTo('masterdata.products')} variant="outline" className="gap-2">
              <Package className="h-4 w-4" />
              Manage Products
            </Button>
            <Button onClick={() => navigateTo('ai.insights')} variant="outline" className="gap-2">
              <Package className="h-4 w-4" />
              AI Insights
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Section */}
      {(metrics.lowStockCount > 0 || metrics.outOfStockCount > 0) && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.outOfStockItems.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.product_title}</span>
                  <Badge variant="destructive">Out of Stock</Badge>
                </div>
              ))}
              {metrics.lowStockItems.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.product_title}</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {item.available_stock} left
                  </Badge>
                </div>
              ))}
              {(metrics.lowStockCount + metrics.outOfStockCount) > 6 && (
                <Button
                  variant="link"
                  className="p-0 h-auto text-yellow-700"
                  onClick={() => navigateTo('stock')}
                >
                  View all {metrics.lowStockCount + metrics.outOfStockCount} items →
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Transaction Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transaction Trend (Last 7 Days)</CardTitle>
            <CardDescription>Daily intake vs dispatch orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={transactionTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="intake"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="Intake"
                  />
                  <Line
                    type="monotone"
                    dataKey="dispatch"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Dispatch"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Stock by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock Distribution by Category</CardTitle>
            <CardDescription>Units per category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {stockByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stockByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {stockByCategory.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No category data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Products by Stock Value</CardTitle>
          <CardDescription>Highest value inventory items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            {topProductsByValue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsByValue} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tickFormatter={(val) => formatCurrency(val)} className="text-xs" />
                  <YAxis type="category" dataKey="name" width={100} className="text-xs" />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                  />
                  <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No product data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Intakes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-green-500" />
              Recent Intakes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentIntakes.length > 0 ? (
              <div className="space-y-3">
                {recentIntakes.map(order => (
                  <div key={order.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                    <div>
                      <div className="font-medium">{order.intake_number}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.supplier_name || 'No supplier'} • {new Date(order.intake_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(order.total_cost)}</div>
                      <Badge variant={getStatusVariant(order.status, 'intake')}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="link" className="p-0 h-auto" onClick={() => navigateTo('intake')}>
                  View all intakes →
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No intake orders yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Dispatches */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-blue-500" />
              Recent Dispatches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentDispatches.length > 0 ? (
              <div className="space-y-3">
                {recentDispatches.map(order => (
                  <div key={order.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                    <div>
                      <div className="font-medium">{order.dispatch_number}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.customer_name || 'Walk-in'} • {new Date(order.dispatch_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(order.total_amount)}</div>
                      <Badge variant={getStatusVariant(order.status, 'dispatch')}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="link" className="p-0 h-auto" onClick={() => navigateTo('dispatch')}>
                  View all dispatches →
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No dispatch orders yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Today's Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="text-2xl font-bold text-green-600">{metrics.todayIntakesCount}</div>
              <div className="text-sm text-muted-foreground">Intakes Today</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="text-2xl font-bold text-blue-600">{metrics.todayDispatchesCount}</div>
              <div className="text-sm text-muted-foreground">Dispatches Today</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(metrics.totalIntakeValue)}</div>
              <div className="text-sm text-muted-foreground">Total Intake Value</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20">
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(metrics.totalDispatchValue)}</div>
              <div className="text-sm text-muted-foreground">Total Dispatch Value</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
