"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { Spinner } from "./spinner"
import { cva, type VariantProps } from "class-variance-authority"

const overlayVariants = cva(
  "fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-background/95 backdrop-blur-md",
        dark: "bg-black/80 backdrop-blur-md",
        light: "bg-white/95 backdrop-blur-md",
        transparent: "bg-black/50 backdrop-blur-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface LoadingOverlayProps extends VariantProps<typeof overlayVariants> {
  open: boolean
  message?: string
  description?: string
  showSpinner?: boolean
  spinnerClassName?: string
  className?: string
  containerClassName?: string
}

function LoadingOverlayContent({
  open,
  message,
  description,
  showSpinner = true,
  spinnerClassName = "size-16 text-primary",
  variant,
  className,
  containerClassName,
}: LoadingOverlayProps) {
  if (!open) return null

  return (
    <div 
      className={cn(
        overlayVariants({ variant }), 
        "animate-in fade-in duration-300",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={message || "Loading"}
    >
      {/* Content container */}
      <div 
        className={cn(
          "relative flex flex-col items-center justify-center gap-8 rounded-2xl p-12",
          "bg-card border-2 border-border/60 shadow-2xl",
          "animate-in zoom-in-95 duration-300",
          "min-w-[320px] max-w-[400px]",
          containerClassName
        )}
      >
        {showSpinner && (
          <div className="relative">
            {/* Glow effect behind spinner */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-40 rounded-full bg-primary/20 blur-3xl animate-pulse" />
            </div>
            {/* Spinner */}
            <Spinner className={cn("relative", spinnerClassName)} />
          </div>
        )}
        
        {/* Text content */}
        {(message || description) && (
          <div className="text-center space-y-3">
            {message && (
              <p className="text-xl font-semibold text-foreground">
                {message}
              </p>
            )}
            {description && (
              <p className="text-base text-muted-foreground max-w-[300px]">
                {description}
              </p>
            )}
          </div>
        )}
        
        {/* Progress dots */}
        <div className="flex justify-center items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

export function LoadingOverlay(props: LoadingOverlayProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Prevent body scroll when overlay is open
  React.useEffect(() => {
    if (props.open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [props.open])

  if (!mounted) return null

  return createPortal(
    <LoadingOverlayContent {...props} />,
    document.body
  )
}

// Inline loading component (non-overlay)
export interface InlineLoadingProps {
  message?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
}

export function InlineLoading({ message, size = "sm", className }: InlineLoadingProps) {
  return (
    <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
      <Spinner size={size} />
      {message && <span className="text-sm">{message}</span>}
    </div>
  )
}

// Full page loading (for initial page loads)
export interface PageLoadingProps {
  message?: string
  description?: string
}

export function PageLoading({ message = "Loading...", description }: PageLoadingProps) {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse">
            <div className="h-full w-full rounded-full bg-primary/20 blur-xl" />
          </div>
          <Spinner size="xl" className="relative" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-foreground">{message}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Skeleton loading for cards/content
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-lg border bg-card p-4", className)}>
      <div className="space-y-3">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="h-3 w-5/6 rounded bg-muted" />
      </div>
    </div>
  )
}

// Table row skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="animate-pulse border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <div className="h-4 rounded bg-muted" />
        </td>
      ))}
    </tr>
  )
}
