"use client"

import { useEffect, useState, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchProducts, setPage, setPageSize } from '@/store/productsSlice'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Loader2, BarChart3, Table as TableIcon } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function StockView() {
  const dispatch = useAppDispatch()
  const { items: products, loading, total, page, pageSize } = useAppSelector((state) => state.products)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    dispatch(fetchProducts({ page, pageSize, search: searchQuery }))
  }, [dispatch, page, pageSize])

  const handleSearch = () => {
    dispatch(setPage(1))
    dispatch(fetchProducts({ page: 1, pageSize, search: searchQuery }))
  }

  // Prepare chart data
  const chartData = useMemo(() => {
    return products.map((product) => ({
      name: product.product_title.length > 20 
        ? product.product_title.substring(0, 20) + '...' 
        : product.product_title,
      stock: product.available_stock,
      price: product.unit_price,
      category: product.category?.category_name || 'Uncategorized'
    }))
  }, [products])

  // Group by category for category chart
  const categoryData = useMemo(() => {
    const grouped = products.reduce((acc, product) => {
      const category = product.category?.category_name || 'Uncategorized'
      if (!acc[category]) {
        acc[category] = { category, totalStock: 0, products: 0 }
      }
      acc[category].totalStock += product.available_stock
      acc[category].products += 1
      return acc
    }, {} as Record<string, { category: string; totalStock: number; products: number }>)

    return Object.values(grouped)
  }, [products])

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    } else if (stock < 10) {
      return <Badge variant="outline" className="border-orange-500 text-orange-600">Low Stock</Badge>
    }
    return <Badge variant="default" className="bg-green-600">In Stock</Badge>
  }

  return (
    <div className="space-y-4 pt-4">
      <p className="text-sm text-muted-foreground">View real-time inventory levels across all products. Monitor stock status, identify low inventory items, and analyze stock distribution by category.</p>
      
      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="table">
            <TableIcon className="h-4 w-4 mr-2" />
            Table View
          </TabsTrigger>
          <TabsTrigger value="charts">
            <BarChart3 className="h-4 w-4 mr-2" />
            Charts
          </TabsTrigger>
        </TabsList>

            {/* Table View */}
            <TabsContent value="table" className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by product name, category, supplier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-8"
                  />
                </div>
                <Button onClick={handleSearch}>Search</Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead className="text-right">Stock</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              {searchQuery ? 'No products match your search' : 'No products found'}
                            </TableCell>
                          </TableRow>
                        ) : (
                          products.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium">{product.product_title}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {product.product_description || '-'}
                              </TableCell>
                              <TableCell>{product.category?.category_name || '-'}</TableCell>
                              <TableCell>{product.supplier?.supplier_name || '-'}</TableCell>
                              <TableCell className="text-right">
                                <span
                                  className={
                                    product.available_stock === 0
                                      ? 'text-red-600 font-bold'
                                      : product.available_stock < 10
                                      ? 'text-orange-600 font-semibold'
                                      : 'text-green-600 font-semibold'
                                  }
                                >
                                  {product.available_stock.toFixed(2)}
                                </span>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                ${product.unit_price.toFixed(2)}
                              </TableCell>
                              <TableCell>{getStockBadge(product.available_stock)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {products.length} of {total} products
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => dispatch(setPage(page - 1))}
                      >
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {page} of {Math.ceil(total / pageSize) || 1}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= Math.ceil(total / pageSize)}
                        onClick={() => dispatch(setPage(page + 1))}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Charts View */}
            <TabsContent value="charts" className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {/* Product Stock Bar Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Stock Levels by Product</CardTitle>
                      <CardDescription>Current stock quantity for each product</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData.slice(0, 10)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="stock" fill="#16a34a" name="Stock Quantity" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Category Stock Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Stock by Category</CardTitle>
                      <CardDescription>Total stock grouped by product category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={categoryData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="totalStock" fill="#2563eb" name="Total Stock" />
                          <Bar dataKey="products" fill="#f59e0b" name="Product Count" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Stock Value Line Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Stock Levels Trend</CardTitle>
                      <CardDescription>Product stock levels visualization</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={chartData.slice(0, 15)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="stock" stroke="#16a34a" strokeWidth={2} name="Stock Quantity" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
    </div>
  )
}
