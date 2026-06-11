import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ENTRY_TYPE_LABELS,
  type Entry,
  type EntryType,
} from "@/lib/types"

const TYPE_STYLES: Record<EntryType, { badge: string; dot: string }> = {
  update: {
    badge:
      "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10",
    dot: "bg-blue-500",
  },
  fix: {
    badge:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10",
    dot: "bg-emerald-500",
  },
  instability: {
    badge:
      "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10",
    dot: "bg-amber-500",
  },
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface EntryTimelineProps {
  entries: Entry[]
}

export function EntryTimeline({ entries }: EntryTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        Nenhuma atualização publicada ainda.
      </div>
    )
  }

  return (
    <ol className="relative space-y-6 border-l border-border pl-6">
      {entries.map((entry) => {
        const styles = TYPE_STYLES[entry.type] ?? TYPE_STYLES.update
        return (
          <li key={entry.id} className="relative">
            <span
              className={cn(
                "absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-background",
                styles.dot
              )}
              aria-hidden
            />
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={styles.badge}>
                {ENTRY_TYPE_LABELS[entry.type] ?? entry.type}
              </Badge>
              <time
                dateTime={entry.created_at}
                className="text-xs text-muted-foreground"
              >
                {formatDateTime(entry.created_at)}
              </time>
            </div>
            <h3 className="mt-2 font-semibold leading-snug">{entry.title}</h3>
            <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
              {entry.description}
            </p>
          </li>
        )
      })}
    </ol>
  )
}
