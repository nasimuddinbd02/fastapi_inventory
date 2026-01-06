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
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormSection, FormField, FormRow } from '@/components/ui/form-section'
import { Loader2, Plus, Trash2, AlertCircle, ArrowUpCircle, Calendar, User, CreditCard, FileText, Package, Eye, Percent } from 'lucide-react'
import { toastSuccess, toastError, toastValidation, toastWarning } from '@/lib/toast-messages'
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

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, pageSize: 1000 }))
  }, [dispatch])

  useEffect(() => {
    console.log('DispatchForm - Products loaded:', products.length)
  }, [products])

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
          order.items.map((item) => {
            // Find product to get available stock
            const product = products.find((p) => p.id === item.product_id)
            return {
              product_id: item.product_id,
              product_title: item.product_title,
              quantity: item.quantity,
              unit_price: item.unit_price,
              available_stock: product?.available_stock || 0,
            }
          })
        )
      }
    } else {
      resetForm()
    }
  }, [editingId, dispatchOrders, products])

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
      const stock = product?.available_stock || 0
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
      const availableStock = item.available_stock || 0
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
      toastValidation.custom('Items Required', 'Please add at least one item')
      return
    }

    if (items.some((item) => !item.product_id || item.quantity <= 0 || item.unit_price < 0)) {
      toastValidation.custom('Invalid Items', 'Please fill all item fields correctly')
      return
    }

    if (status === 'completed') {
      const stockValidation = validateStock()
      if (!stockValidation.valid) {
        toastWarning.lowStock(stockValidation.message)
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
        const result = await dispatch(updateDispatchOrder({ id: editingId, data }))
        if (updateDispatchOrder.fulfilled.match(result)) {
          toastSuccess.updated('Dispatch order')
          onClose()
        } else {
          throw new Error(result.error?.message || 'Failed to update dispatch order')
        }
      } else {
        const result = await dispatch(createDispatchOrder(data))
        if (createDispatchOrder.fulfilled.match(result)) {
          toastSuccess.created('Dispatch order')
          onClose()
        } else {
          throw new Error(result.error?.message || 'Failed to create dispatch order')
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save dispatch order'
      toastError.saveFailed(message)
    } finally {
      setLoading(false)
    }
  }

  const canComplete = currentOrder?.status === 'draft' || !editingId
  const isReadOnly = currentOrder?.status === 'completed'

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto p-0">
        <div className="p-6 pb-0">
          <SheetHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                {isReadOnly ? (
                  <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                ) : (
                  <ArrowUpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <SheetTitle>
                    {editingId 
                      ? isReadOnly
                        ? 'View Dispatch Order' 
                        : 'Edit Dispatch Order'
                      : 'New Dispatch Order'
                    }
                  </SheetTitle>
                  {currentOrder?.status && (
                    <Badge variant={currentOrder.status === 'completed' ? 'default' : currentOrder.status === 'cancelled' ? 'destructive' : 'secondary'}>
                      {currentOrder.status}
                    </Badge>
                  )}
                </div>
                <SheetDescription>
                  {isReadOnly 
                    ? 'This order has been completed and cannot be modified'
                    : editingId 
                      ? 'Update the dispatch order details below' 
                      : 'Process outgoing inventory to customer'
                  }
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>
        
        <Separator />

        <div className="p-6 space-y-6">
          <FormSection title="Order Details" icon={<Calendar className="h-4 w-4" />}>
            <FormRow>
              <FormField>
                <Label htmlFor="dispatch-date" className="text-sm font-medium">Dispatch Date</Label>
                <Input
                  id="dispatch-date"
                  type="date"
                  value={dispatchDate}
                  onChange={(e) => setDispatchDate(e.target.value)}
                  disabled={isReadOnly}
                  className="h-10"
                />
              </FormField>

              <FormField>
                <Label htmlFor="customer" className="text-sm font-medium">
                  <span className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Customer Name
                  </span>
                </Label>
                <Input
                  id="customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g., John Smith, ABC Company"
                  disabled={isReadOnly}
                  className="h-10"
                />
              </FormField>
            </FormRow>

            <FormRow>
              <FormField>
                <Label htmlFor="payment" className="text-sm font-medium">
                  <span className="flex items-center gap-2">
                    <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                    Payment Method
                  </span>
                </Label>
                <Select
                  value={paymentMethod || 'none'}
                  onValueChange={(value) => setPaymentMethod(value === 'none' ? '' : value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
                    <SelectItem value="cash">💵 Cash</SelectItem>
                    <SelectItem value="credit_card">💳 Credit Card</SelectItem>
                    <SelectItem value="bank_transfer">🏦 Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField>
                <Label htmlFor="tax-rate" className="text-sm font-medium">
                  <span className="flex items-center gap-2">
                    <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                    Tax Rate
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="tax-rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    disabled={isReadOnly}
                    className="h-10 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
              </FormField>
            </FormRow>

            <FormField>
              <Label htmlFor="notes" className="text-sm font-medium">
                <span className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  Notes
                </span>
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes about this dispatch..."
                disabled={isReadOnly}
                rows={2}
                className="resize-none"
              />
            </FormField>
          </FormSection>

          <FormSection 
            title="Line Items" 
            icon={<Package className="h-4 w-4" />}
            description="Add products to this dispatch order"
          >
            <div className="space-y-3">
              {/* Header Row */}
              <div className="hidden sm:grid grid-cols-12 gap-2 px-3 py-2 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground">
                <div className="col-span-5">Product</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2">Unit Price</div>
                <div className="col-span-2">Total</div>
                <div className="col-span-1"></div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {items.map((item, index) => {
                  const availableStock = item.available_stock || 0
                  const insufficientStock = !isReadOnly && item.quantity > availableStock

                  return (
                    <div key={index} className={`rounded-lg border bg-card p-3 space-y-3 ${insufficientStock ? 'border-red-300 dark:border-red-800' : ''}`}>
                      <div className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-12 sm:col-span-5 space-y-1">
                          <Label className="text-xs sm:hidden">Product</Label>
                          <Combobox
                            options={products.map((p) => ({ value: p.id.toString(), label: p.product_title }))}
                            value={item.product_id > 0 ? item.product_id.toString() : undefined}
                            onValueChange={(value) => updateItem(index, 'product_id', value)}
                            placeholder="Select product"
                            searchPlaceholder="Search products..."
                            emptyText="No product found."
                            disabled={isReadOnly}
                          />
                        </div>

                        <div className="col-span-4 sm:col-span-2 space-y-1">
                          <Label className="text-xs sm:hidden">Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                            disabled={isReadOnly}
                            className={`h-10 ${insufficientStock ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          />
                        </div>

                        <div className="col-span-4 sm:col-span-2 space-y-1">
                          <Label className="text-xs sm:hidden">Unit Price</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                              disabled={isReadOnly}
                              className="h-10 pl-7"
                            />
                          </div>
                        </div>

                        <div className="col-span-3 sm:col-span-2 space-y-1">
                          <Label className="text-xs sm:hidden">Total</Label>
                          <div className="h-10 flex items-center px-3 bg-muted rounded-md font-medium">
                            ${(item.quantity * item.unit_price).toFixed(2)}
                          </div>
                        </div>

                        {!isReadOnly && (
                          <div className="col-span-1 flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                              className="h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {item.product_id > 0 && !isReadOnly && (
                        <div className="flex items-center gap-3 text-xs px-1 pt-1 border-t">
                          <span className={insufficientStock ? 'text-red-500' : 'text-muted-foreground'}>
                            📦 Available: <span className="font-medium">{availableStock}</span>
                          </span>
                          {insufficientStock && (
                            <span className="flex items-center gap-1 text-red-500">
                              <AlertCircle className="h-3.5 w-3.5" />
                              Insufficient stock! Need {item.quantity - availableStock} more
                            </span>
                          )}
                          {!insufficientStock && (
                            <>
                              <span className="text-muted-foreground">→</span>
                              <span className="text-blue-600 dark:text-blue-400 font-medium">
                                After dispatch: {availableStock - item.quantity}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {items.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <Package className="h-10 w-10 mx-auto text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No items added yet
                  </p>
                  {!isReadOnly && (
                    <Button type="button" variant="outline" size="sm" onClick={addItem} className="mt-3">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Item
                    </Button>
                  )}
                </div>
              )}

              {!isReadOnly && items.length > 0 && (
                <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Item
                </Button>
              )}
            </div>
          </FormSection>

          {/* Order Summary */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total Items:</span>
              <span>{items.length}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Tax ({taxRate}%):</span>
              <span>${calculateTax().toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-medium">Order Total:</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="p-6 bg-muted/30">
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              {isReadOnly ? 'Close' : 'Cancel'}
            </Button>
            {!isReadOnly && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleSubmit('draft')}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save as Draft
                </Button>
                {canComplete && (
                  <Button 
                    onClick={() => handleSubmit('completed')} 
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Complete & Dispatch
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
