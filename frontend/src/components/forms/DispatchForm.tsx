'use client'

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { createDispatchOrder, updateDispatchOrder } from '@/store/dispatchSlice'
import { fetchProducts } from '@/store/productsSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Combobox } from '@/components/ui/combobox'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus, Trash2, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import axios from 'axios'
import { buildApiUrl, API_ENDPOINTS } from '@/config/api'
import type { DispatchOrder } from '@/store/dispatchSlice'

type DispatchFormProps = {
  isOpen: boolean
  onClose: () => void
  editingId: number | null
}

type FormItem = {
  product_id: number
  product_title?: string
  quantity: number
  unit_price: number
  available_stock?: number
}

export default function DispatchForm({ isOpen, onClose, editingId }: DispatchFormProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const { items: products } = useAppSelector((state) => state.products)
  const { items: dispatchOrders } = useAppSelector((state) => state.dispatch)

  const [loading, setLoading] = useState(false)
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split('T')[0])
  const [customerName, setCustomerName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [taxRate, setTaxRate] = useState(10)
  const [items, setItems] = useState<FormItem[]>([])
  const [currentOrder, setCurrentOrder] = useState<DispatchOrder | null>(null)
  const [productStocks, setProductStocks] = useState<Record<number, number>>({})

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, pageSize: 1000 }))
    loadProductStocks()
  }, [dispatch])

  useEffect(() => {
    console.log('DispatchForm - Products loaded:', products.length)
    console.log('DispatchForm - Product stocks loaded:', Object.keys(productStocks).length)
  }, [products, productStocks])

  useEffect(() => {
    if (editingId) {
      const order = dispatchOrders.find((o) => o.id === editingId)
      if (order) {
        setCurrentOrder(order)
        setDispatchDate(order.dispatch_date.split('T')[0])
        setCustomerName(order.customer_name || '')
        setPaymentMethod(order.payment_method || '')
        setNotes(order.notes || '')
        setItems(
          order.items.map((item) => ({
            product_id: item.product_id,
            product_title: item.product_title,
            quantity: item.quantity,
            unit_price: item.unit_price,
          }))
        )
      }
    } else {
      resetForm()
    }
  }, [editingId, dispatchOrders])

  const loadProductStocks = async () => {
    try {
      const token = typeof window !== 'undefined' ? window.sessionStorage.getItem('token') : null
      const response = await axios.get(buildApiUrl(API_ENDPOINTS.INVENTORY), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params: { page: 1, page_size: 1000 }
      })
      const stocks: Record<number, number> = {}
      response.data.items.forEach((inv: any) => {
        stocks[inv.product_id] = inv.quantity_in_stock
      })
      setProductStocks(stocks)
    } catch (error) {
      console.error('Failed to load product stocks:', error)
    }
  }

  const resetForm = () => {
    setDispatchDate(new Date().toISOString().split('T')[0])
    setCustomerName('')
    setPaymentMethod('')
    setNotes('')
    setTaxRate(10)
    setItems([])
    setCurrentOrder(null)
  }

  const addItem = () => {
    setItems([...items, { product_id: 0, quantity: 1, unit_price: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof FormItem, value: any) => {
    const newItems = [...items]
    if (field === 'product_id') {
      const product = products.find((p) => p.id === Number(value))
      const stock = productStocks[Number(value)] || 0
      newItems[index] = {
        ...newItems[index],
        product_id: Number(value),
        product_title: product?.product_title,
        unit_price: product?.unit_price || 0,
        available_stock: stock,
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value }
    }
    setItems(newItems)
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  }

  const calculateTax = () => {
    return (calculateSubtotal() * taxRate) / 100
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const validateStock = () => {
    for (const item of items) {
      const availableStock = productStocks[item.product_id] || 0
      if (item.quantity > availableStock) {
        return {
          valid: false,
          message: `Insufficient stock for ${item.product_title}. Available: ${availableStock}, Requested: ${item.quantity}`,
        }
      }
    }
    return { valid: true, message: '' }
  }

  const handleSubmit = async (status: 'draft' | 'completed') => {
    if (items.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one item',
        variant: 'destructive',
      })
      return
    }

    if (items.some((item) => !item.product_id || item.quantity <= 0 || item.unit_price < 0)) {
      toast({
        title: 'Error',
        description: 'Please fill all item fields correctly',
        variant: 'destructive',
      })
      return
    }

    if (status === 'completed') {
      const stockValidation = validateStock()
      if (!stockValidation.valid) {
        toast({
          title: 'Insufficient Stock',
          description: stockValidation.message,
          variant: 'destructive',
        })
        return
      }
    }

    setLoading(true)
    try {
      const data = {
        dispatch_date: dispatchDate,
        customer_name: customerName || null,
        payment_method: paymentMethod || null,
        notes: notes || null,
        status,
        tax_rate: taxRate,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      }

      if (editingId) {
        await dispatch(updateDispatchOrder({ id: editingId, data }))
        toast({ title: 'Success', description: 'Dispatch order updated successfully' })
      } else {
        await dispatch(createDispatchOrder(data))
        toast({ title: 'Success', description: 'Dispatch order created successfully' })
      }

      onClose()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to save dispatch order',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const canComplete = currentOrder?.status === 'draft' || !editingId

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editingId ? 'Edit Dispatch Order' : 'New Dispatch Order'}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="space-y-2 w-auto">
              <Label htmlFor="dispatch-date">Dispatch Date</Label>
              <Input
                id="dispatch-date"
                type="date"
                value={dispatchDate}
                onChange={(e) => setDispatchDate(e.target.value)}
                disabled={currentOrder?.status === 'completed'}
                className="w-auto"
              />
            </div>

            <div className="space-y-2 flex-1">
              <Label htmlFor="customer">Customer Name (Optional)</Label>
              <Input
                id="customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                disabled={currentOrder?.status === 'completed'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment">Payment Method</Label>
              <Select
                value={paymentMethod || 'none'}
                onValueChange={(value) => setPaymentMethod(value === 'none' ? '' : value)}
                disabled={currentOrder?.status === 'completed'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-rate">Tax Rate (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                disabled={currentOrder?.status === 'completed'}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              disabled={currentOrder?.status === 'completed'}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Items</Label>
              {currentOrder?.status !== 'completed' && (
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              )}
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              {items.map((item, index) => {
                const availableStock = item.available_stock || 0
                const insufficientStock = item.quantity > availableStock

                return (
                  <div key={index} className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5 space-y-2">
                        <Label className="text-xs">Product</Label>
                        <Combobox
                          options={products.map((p) => ({ value: p.id.toString(), label: p.product_title }))}
                          value={item.product_id > 0 ? item.product_id.toString() : undefined}
                          onValueChange={(value) => updateItem(index, 'product_id', value)}
                          placeholder="Select product"
                          searchPlaceholder="Search products..."
                          emptyText="No product found."
                          disabled={currentOrder?.status === 'completed'}
                        />
                      </div>

                      <div className="col-span-2 space-y-2">
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                          disabled={currentOrder?.status === 'completed'}
                          className={insufficientStock ? 'border-red-500' : ''}
                        />
                      </div>

                      <div className="col-span-2 space-y-2">
                        <Label className="text-xs">Unit Price</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                          disabled={currentOrder?.status === 'completed'}
                        />
                      </div>

                      <div className="col-span-2 space-y-2">
                        <Label className="text-xs">Total</Label>
                        <Input
                          type="text"
                          value={`$${(item.quantity * item.unit_price).toFixed(2)}`}
                          disabled
                        />
                      </div>

                      {currentOrder?.status !== 'completed' && (
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {item.product_id > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          Available stock: {availableStock}
                        </span>
                        {insufficientStock && (
                          <span className="flex items-center gap-1 text-red-500">
                            <AlertCircle className="h-4 w-4" />
                            Insufficient stock
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {items.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No items added. Click "Add Item" to start.
                </p>
              )}
            </div>

            <div className="space-y-1 border-t pt-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax ({taxRate}%):</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <div className="space-x-2">
            {currentOrder?.status !== 'completed' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleSubmit('draft')}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save as Draft
                </Button>
                {canComplete && (
                  <Button onClick={() => handleSubmit('completed')} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Complete & Update Inventory
                  </Button>
                )}
              </>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
