import { cn } from "@/lib/utils"

interface SpinnerProps extends React.ComponentProps<"svg"> {
  label?: string
}

function Spinner({ className, label, ...props }: SpinnerProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", className)}
      aria-label={label || "Loading"}
      role="status"
      {...props}
    >
      <path d="M42 24a18 18 0 1 1-12.438-17.12" />
    </svg>
  )
}

export { Spinner }
