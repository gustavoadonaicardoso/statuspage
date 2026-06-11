import { cn } from "@/lib/utils"
import {
  SYSTEM_STATUS_LABELS,
  type SystemStatus,
} from "@/lib/types"

const STATUS_STYLES: Record<
  SystemStatus,
  { dot: string; container: string; pulse: boolean }
> = {
  operational: {
    dot: "bg-emerald-500",
    container:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    pulse: false,
  },
  instability: {
    dot: "bg-amber-500",
    container:
      "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    pulse: true,
  },
  outage: {
    dot: "bg-red-500",
    container: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
    pulse: true,
  },
  maintenance: {
    dot: "bg-blue-500",
    container:
      "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    pulse: false,
  },
}

interface StatusBadgeProps {
  status: SystemStatus
  updatedAt?: string | null
  className?: string
}

export function StatusBadge({ status, updatedAt, className }: StatusBadgeProps) {
  const styles = STATUS_STYLES[status]

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border px-4 py-3",
        styles.container,
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          {styles.pulse && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                styles.dot
              )}
            />
          )}
          <span
            className={cn(
              "relative inline-flex h-3 w-3 rounded-full",
              styles.dot,
              styles.pulse && "animate-pulse"
            )}
          />
        </span>
        <span className="text-sm font-semibold">
          {SYSTEM_STATUS_LABELS[status]}
        </span>
      </div>
      {updatedAt && (
        <span className="hidden text-xs text-muted-foreground sm:block">
          Atualizado em{" "}
          {new Date(updatedAt).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
    </div>
  )
}
