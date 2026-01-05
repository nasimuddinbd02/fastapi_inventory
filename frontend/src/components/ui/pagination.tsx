import * as React from 'react'
import { cn } from '@/lib/utils'

type PaginationProps = React.ComponentPropsWithoutRef<'nav'>

export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      role="navigation"
      aria-label="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  )
)
Pagination.displayName = 'Pagination'

type PaginationContentProps = React.ComponentPropsWithoutRef<'ul'>

export const PaginationContent = React.forwardRef<HTMLUListElement, PaginationContentProps>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn('flex items-center gap-1', className)}
      {...props}
    />
  )
)
PaginationContent.displayName = 'PaginationContent'

type PaginationItemProps = React.ComponentPropsWithoutRef<'li'>

export const PaginationItem = React.forwardRef<HTMLLIElement, PaginationItemProps>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      className={cn('list-none', className)}
      {...props}
    />
  )
)
PaginationItem.displayName = 'PaginationItem'

type PaginationLinkProps = React.ComponentPropsWithoutRef<'button'> & {
  isActive?: boolean
}

const baseLinkClasses = 'inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-md border border-input bg-background px-2 text-[0.7rem] font-medium transition-colors'
const activeLinkClasses = 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
const inactiveLinkClasses = 'hover:bg-muted hover:text-foreground'

export const PaginationLink = React.forwardRef<HTMLButtonElement, PaginationLinkProps>(
  ({ className, isActive, disabled, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      className={cn(
        baseLinkClasses,
        isActive ? activeLinkClasses : inactiveLinkClasses,
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
)
PaginationLink.displayName = 'PaginationLink'

type PaginationNavButtonProps = React.ComponentPropsWithoutRef<'button'>

const navButtonClasses = 'inline-flex h-7 items-center justify-center rounded-md border border-input bg-background px-1.5 text-[0.7rem] font-medium transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

export const PaginationPrevious = React.forwardRef<HTMLButtonElement, PaginationNavButtonProps>(
  ({ className, children = 'Prev', ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(navButtonClasses, className)}
      {...props}
    >
      {children}
    </button>
  )
)
PaginationPrevious.displayName = 'PaginationPrevious'

export const PaginationNext = React.forwardRef<HTMLButtonElement, PaginationNavButtonProps>(
  ({ className, children = 'Next', ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(navButtonClasses, className)}
      {...props}
    >
      {children}
    </button>
  )
)
PaginationNext.displayName = 'PaginationNext'

type PaginationEllipsisProps = React.ComponentPropsWithoutRef<'span'>

export const PaginationEllipsis = React.forwardRef<HTMLSpanElement, PaginationEllipsisProps>(
  ({ className, children = '...', ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn('inline-flex h-7 items-center justify-center px-2 text-[0.7rem] font-medium text-muted-foreground', className)}
      {...props}
    >
      {children}
    </span>
  )
)
PaginationEllipsis.displayName = 'PaginationEllipsis'
