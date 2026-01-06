'use client'

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { createIntakeOrder, updateIntakeOrder } from '@/store/intakeSlice'
import { fetchSuppliers } from '@/store/suppliersSlice'
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
import { FormSection, FormField, FormRow } from '@/components/ui/form-section'
import { Loader2, Plus, Trash2, ArrowDownCircle, Calendar, Building2, FileText, Package, Eye } from 'lucide-react'
import { toastSuccess, toastError, toastValidation } from '@/lib/toast-messages'
import type { IntakeOrder } from '@/store/intakeSlice'

type IntakeFormProps = {
  isOpen: boolean
  onClose: () => void
  editingId: number | null
}

type FormItem = {
  product_id: number
  product_title?: string
  quantity: number
  unit_cost: number
  available_stock?: number
}

export default function IntakeForm({ isOpen, onClose, editingId }: IntakeFormProps) {
  const dispatch = useAppDispatch()
  const { items: suppliers } = useAppSelector((state) => state.suppliers)
  const { items: products } = useAppSelector((state) => state.products)
  const { items: intakeOrders } = useAppSelector((state) => state.intake)

  const [loading, setLoading] = useState(false)
  const [intakeDate, setIntakeDate] = useState(new Date().toISOString().split('T')[0])
  const [supplierId, setSupplierId] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<FormItem[]>([])
  const [currentOrder, setCurrentOrder] = useState<IntakeOrder | null>(null)

  useEffect(() => {
    dispatch(fetchSuppliers({ page: 1, pageSize: 1000 }))
    dispatch(fetchProducts({ page: 1, pageSize: 1000 }))
  }, [dispatch])
  useEffect(() => {
    console.log('IntakeForm - Suppliers loaded:', suppliers.length)
    console.log('IntakeForm - Products loaded:', products.length)
  }, [suppliers, products])
  useEffect(() => {
    if (editingId) {
      const order = intakeOrders.find((o) => o.id === editingId)
      if (order) {
        setCurrentOrder(order)
        setIntakeDate(order.intake_date.split('T')[0])
        setSupplierId(order.supplier_id || null)
        setNotes(order.notes || '')
        setItems(
          order.items.map((item) => {
            // Find product to get available stock
            const product = products.find((p) => p.id === item.product_id)
            return {
              product_id: item.product_id,
              product_title: item.product_title,
              quantity: item.quantity,
              unit_cost: item.unit_cost,
              available_stock: product?.available_stock || 0,
            }
          })
        )
      }
    } else {
      resetForm()
    }
  }, [editingId, intakeOrders, products])

  const resetForm = () => {
    setIntakeDate(new Date().toISOString().split('T')[0])
    setSupplierId(null)
    setNotes('')
    setItems([])
    setCurrentOrder(null)
  }

  const addItem = () => {
    setItems([...items, { product_id: 0, quantity: 1, unit_cost: 0 }])
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
        unit_cost: product?.unit_price || 0,
        available_stock: stock,
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value }
    }
    setItems(newItems)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unit_cost, 0)
  }

  const handleSubmit = async (status: 'draft' | 'confirmed') => {
    if (items.length === 0) {
      toastValidation.custom('Items Required', 'Please add at least one item')
      return
    }

    if (items.some((item) => !item.product_id || item.quantity <= 0 || item.unit_cost < 0)) {
      toastValidation.custom('Invalid Items', 'Please fill all item fields correctly')
      return
    }

    setLoading(true)
    try {
      const data = {
        intake_date: intakeDate,
        supplier_id: supplierId,
        notes: notes || null,
        status,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
        })),
      }

      if (editingId) {
        await dispatch(updateIntakeOrder({ id: editingId, data }))
        toastSuccess.updated('Intake order')
      } else {
        await dispatch(createIntakeOrder(data))
        toastSuccess.created('Intake order')
      }

      onClose()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save intake order'
      toastError.saveFailed(message)
    } finally {
      setLoading(false)
    }
  }

  const canConfirm = currentOrder?.status === 'draft' || !editingId
  const isReadOnly = currentOrder?.status === 'confirmed'

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto p-0">
        <div className="p-6 pb-0">
          <SheetHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                {isReadOnly ? (
                  <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <ArrowDownCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <SheetTitle>
                    {editingId 
                      ? isReadOnly
                        ? 'View Intake Order' 
                        : 'Edit Intake Order'
                      : 'New Intake Order'
                    }
                  </SheetTitle>
                  {currentOrder?.status && (
                    <Badge variant={currentOrder.status === 'confirmed' ? 'default' : currentOrder.status === 'cancelled' ? 'destructive' : 'secondary'}>
                      {currentOrder.status}
                    </Badge>
                  )}
                </div>
                <SheetDescription>
                  {isReadOnly 
                    ? 'This order has been confirmed and cannot be modified'
                    : editingId 
                      ? 'Update the intake order details below' 
                      : 'Record incoming inventory from supplier'
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
                <Label htmlFor="intake-date" className="text-sm font-medium">Intake Date</Label>
                <Input
                  id="intake-date"
                  type="date"
                  value={intakeDate}
                  onChange={(e) => setIntakeDate(e.target.value)}
                  disabled={isReadOnly}
                  className="h-10"
                />
              </FormField>

              <FormField>
                <Label htmlFor="supplier" className="text-sm font-medium">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    Supplier
                  </span>
                </Label>
                <Combobox
                  options={[
                    { value: 'none', label: 'None (Direct Purchase)' },
                    ...suppliers.map((s) => ({ value: s.id.toString(), label: s.supplier_name }))
                  ]}
                  value={supplierId?.toString() || 'none'}
                  onValueChange={(value) => setSupplierId(value === 'none' ? null : Number(value))}
                  placeholder="Select supplier"
                  searchPlaceholder="Search suppliers..."
                  emptyText="No supplier found."
                  disabled={isReadOnly}
                />
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
                placeholder="Add any additional notes about this intake..."
                disabled={isReadOnly}
                rows={2}
                className="resize-none"
              />
            </FormField>
          </FormSection>

          <FormSection 
            title="Line Items" 
            icon={<Package className="h-4 w-4" />}
            description="Add products to this intake order"
          >
            <div className="space-y-3">
              {/* Header Row */}
              <div className="hidden sm:grid grid-cols-12 gap-2 px-3 py-2 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground">
                <div className="col-span-5">Product</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2">Unit Cost</div>
                <div className="col-span-2">Total</div>
                <div className="col-span-1"></div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {items.map((item, index) => {
                  const availableStock = item.available_stock || 0
                  return (
                    <div key={index} className="rounded-lg border bg-card p-3 space-y-3">
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
                            className="h-10"
                          />
                        </div>

                        <div className="col-span-4 sm:col-span-2 space-y-1">
                          <Label className="text-xs sm:hidden">Unit Cost</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_cost}
                              onChange={(e) => updateItem(index, 'unit_cost', Number(e.target.value))}
                              disabled={isReadOnly}
                              className="h-10 pl-7"
                            />
                          </div>
                        </div>

                        <div className="col-span-3 sm:col-span-2 space-y-1">
                          <Label className="text-xs sm:hidden">Total</Label>
                          <div className="h-10 flex items-center px-3 bg-muted rounded-md font-medium">
                            ${(item.quantity * item.unit_cost).toFixed(2)}
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
                      
                      {item.product_id > 0 && (
                        <div className="flex items-center gap-3 text-xs px-1 pt-1 border-t">
                          <span className="text-muted-foreground">
                            📦 Current stock: <span className="font-medium">{availableStock}</span>
                          </span>
                          {!isReadOnly && (
                            <>
                              <span className="text-muted-foreground">→</span>
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                After intake: {availableStock + item.quantity}
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

          {/* Order Total */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Items: {items.length}</span>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Order Total</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${calculateTotal().toFixed(2)}
                </div>
              </div>
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
                {canConfirm && (
                  <Button 
                    onClick={() => handleSubmit('confirmed')} 
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm & Update Stock
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
