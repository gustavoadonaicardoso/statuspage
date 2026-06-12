"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  ENTRY_TYPE_LABELS,
  type Entry,
  type EntryType,
} from "@/lib/types"

const TYPE_BADGE_STYLES: Record<EntryType, string> = {
  update:
    "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10",
  fix: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10",
  instability:
    "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10",
}

interface AdminEntryListProps {
  entries: Entry[]
}

export function AdminEntryList({ entries }: AdminEntryListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [entryToDelete, setEntryToDelete] = React.useState<Entry | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  async function handleDelete() {
    if (!entryToDelete) return
    setDeleting(true)
    try {
      const response = await fetch("/api/entries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entryToDelete.id }),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error ?? "Não foi possível excluir a entrada.")
      }
      toast({
        title: "Entrada excluída",
        description: "O feed público já foi atualizado.",
      })
      setEntryToDelete(null)
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description:
          error instanceof Error ? error.message : "Tente novamente em instantes.",
      })
    } finally {
      setDeleting(false)
    }
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        Nenhuma entrada publicada ainda.
      </div>
    )
  }

  return (
    <>
      <ul className="divide-y rounded-xl border">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={TYPE_BADGE_STYLES[entry.type] ?? TYPE_BADGE_STYLES.update}
                >
                  {ENTRY_TYPE_LABELS[entry.type] ?? entry.type}
                </Badge>
                <span className="truncate text-sm font-medium">{entry.title}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(entry.created_at).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Excluir "${entry.title}"`}
              className="shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => setEntryToDelete(entry)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>

      <Dialog
        open={entryToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setEntryToDelete(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir entrada?</DialogTitle>
            <DialogDescription>
              A entrada{" "}
              <span className="font-medium text-foreground">
                “{entryToDelete?.title}”
              </span>{" "}
              será removida permanentemente do feed público. Essa ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEntryToDelete(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Excluindo…
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
