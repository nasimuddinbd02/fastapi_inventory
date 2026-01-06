"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  icon?: React.ReactNode
}

const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({ className, title, description, icon, children, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-4", className)} {...props}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <div className="flex items-center gap-2">
              {icon && <span className="text-muted-foreground">{icon}</span>}
              <h4 className="text-sm font-medium leading-none">{title}</h4>
            </div>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
)
FormSection.displayName = "FormSection"

interface FormRowProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4
}

const FormRow = React.forwardRef<HTMLDivElement, FormRowProps>(
  ({ className, cols = 2, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "grid gap-4",
        cols === 1 && "grid-cols-1",
        cols === 2 && "grid-cols-1 sm:grid-cols-2",
        cols === 3 && "grid-cols-1 sm:grid-cols-3",
        cols === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
FormRow.displayName = "FormRow"

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  fullWidth?: boolean
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, fullWidth, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-2", fullWidth && "sm:col-span-full", className)}
      {...props}
    >
      {children}
    </div>
  )
)
FormField.displayName = "FormField"

interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  sticky?: boolean
}

const FormActions = React.forwardRef<HTMLDivElement, FormActionsProps>(
  ({ className, sticky, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-end gap-3 pt-6",
        sticky && "sticky bottom-0 bg-background py-4 border-t -mx-6 px-6 mt-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
FormActions.displayName = "FormActions"

interface RequiredLabelProps extends React.HTMLAttributes<HTMLSpanElement> {}

const RequiredMark = React.forwardRef<HTMLSpanElement, RequiredLabelProps>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn("text-red-500 ml-1", className)} {...props}>
      *
    </span>
  )
)
RequiredMark.displayName = "RequiredMark"

export { FormSection, FormRow, FormField, FormActions, RequiredMark }
