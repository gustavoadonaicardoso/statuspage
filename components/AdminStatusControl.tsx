"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  SYSTEM_STATUS_VALUES,
  type SystemStatus,
} from "@/lib/types"
import { cn } from "@/lib/utils"

const BUTTON_LABELS: Record<SystemStatus, string> = {
  operational: "Operacional",
  instability: "Instabilidade",
  outage: "Indisponível",
  maintenance: "Manutenção",
}

const ACTIVE_STYLES: Record<SystemStatus, string> = {
  operational: "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  instability: "border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400",
  outage: "border-red-500 bg-red-500/15 text-red-600 dark:text-red-400",
  maintenance: "border-blue-500 bg-blue-500/15 text-blue-600 dark:text-blue-400",
}

interface AdminStatusControlProps {
  initialStatus: SystemStatus
  initialUpdatedAt: string | null
}

export function AdminStatusControl({
  initialStatus,
  initialUpdatedAt,
}: AdminStatusControlProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [status, setStatus] = React.useState<SystemStatus>(initialStatus)
  const [updatedAt, setUpdatedAt] = React.useState<string | null>(initialUpdatedAt)
  const [pending, setPending] = React.useState<SystemStatus | null>(null)

  async function changeStatus(next: SystemStatus) {
    if (next === status || pending) return
    setPending(next)
    try {
      const response = await fetch("/api/system-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error ?? "Não foi possível atualizar o status.")
      }
      setStatus(next)
      setUpdatedAt(new Date().toISOString())
      toast({
        title: "Status atualizado",
        description: `O sistema agora está como "${BUTTON_LABELS[next]}".`,
      })
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description:
          error instanceof Error ? error.message : "Tente novamente em instantes.",
      })
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="space-y-4">
      <StatusBadge status={status} updatedAt={updatedAt} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SYSTEM_STATUS_VALUES.map((value) => (
          <Button
            key={value}
            variant="outline"
            disabled={pending !== null}
            onClick={() => changeStatus(value)}
            className={cn(status === value && ACTIVE_STYLES[value])}
          >
            {pending === value ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              BUTTON_LABELS[value]
            )}
          </Button>
        ))}
      </div>
    </div>
  )
}
