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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import axios from 'axios'
import { buildApiUrl, API_ENDPOINTS } from '@/config/api'
import type { IntakeOrder, IntakeItem } from '@/store/intakeSlice'

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
}

export default function IntakeForm({ isOpen, onClose, editingId }: IntakeFormProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
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
          order.items.map((item) => ({
            product_id: item.product_id,
            product_title: item.product_title,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
          }))
        )
      }
    } else {
      resetForm()
    }
  }, [editingId, intakeOrders])

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
      newItems[index] = {
        ...newItems[index],
        product_id: Number(value),
        product_title: product?.product_title,
        unit_cost: product?.unit_price || 0,
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
      toast({
        title: 'Error',
        description: 'Please add at least one item',
        variant: 'destructive',
      })
      return
    }

    if (items.some((item) => !item.product_id || item.quantity <= 0 || item.unit_cost < 0)) {
      toast({
        title: 'Error',
        description: 'Please fill all item fields correctly',
        variant: 'destructive',
      })
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
        toast({ title: 'Success', description: 'Intake order updated successfully' })
      } else {
        await dispatch(createIntakeOrder(data))
        toast({ title: 'Success', description: 'Intake order created successfully' })
      }

      onClose()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to save intake order',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const canConfirm = currentOrder?.status === 'draft' || !editingId

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editingId ? 'Edit Intake Order' : 'New Intake Order'}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="space-y-2 w-auto">
              <Label htmlFor="intake-date">Intake Date</Label>
              <Input
                id="intake-date"
                type="date"
                value={intakeDate}
                onChange={(e) => setIntakeDate(e.target.value)}
                disabled={currentOrder?.status === 'confirmed'}
                className="w-auto"
              />
            </div>

            <div className="space-y-2 flex-1">
              <Label htmlFor="supplier">Supplier (Optional)</Label>
              <Combobox
                options={[
                  { value: 'none', label: 'None' },
                  ...suppliers.map((s) => ({ value: s.id.toString(), label: s.supplier_name }))
                ]}
                value={supplierId?.toString() || 'none'}
                onValueChange={(value) => setSupplierId(value === 'none' ? null : Number(value))}
                placeholder="Select supplier"
                searchPlaceholder="Search suppliers..."
                emptyText="No supplier found."
                disabled={currentOrder?.status === 'confirmed'}
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
              disabled={currentOrder?.status === 'confirmed'}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Items</Label>
              {currentOrder?.status !== 'confirmed' && (
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              )}
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5 space-y-2">
                    <Label className="text-xs">Product</Label>
                    <Combobox
                      options={products.map((p) => ({ value: p.id.toString(), label: p.product_title }))}
                      value={item.product_id > 0 ? item.product_id.toString() : undefined}
                      onValueChange={(value) => updateItem(index, 'product_id', value)}
                      placeholder="Select product"
                      searchPlaceholder="Search products..."
                      emptyText="No product found."
                      disabled={currentOrder?.status === 'confirmed'}
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                      disabled={currentOrder?.status === 'confirmed'}
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label className="text-xs">Unit Cost</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_cost}
                      onChange={(e) => updateItem(index, 'unit_cost', Number(e.target.value))}
                      disabled={currentOrder?.status === 'confirmed'}
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label className="text-xs">Total</Label>
                    <Input
                      type="text"
                      value={`$${(item.quantity * item.unit_cost).toFixed(2)}`}
                      disabled
                    />
                  </div>

                  {currentOrder?.status !== 'confirmed' && (
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
              ))}

              {items.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No items added. Click "Add Item" to start.
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <div className="text-lg font-semibold">
                Total Cost: ${calculateTotal().toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <div className="space-x-2">
            {currentOrder?.status !== 'confirmed' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleSubmit('draft')}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save as Draft
                </Button>
                {canConfirm && (
                  <Button onClick={() => handleSubmit('confirmed')} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm & Update Inventory
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
