"use client"

import * as React from "react"
import { Loader2, Mail, Paperclip, Phone } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  DEMAND_STATUS_LABELS,
  DEMAND_STATUS_VALUES,
  type Demand,
  type DemandStatus,
} from "@/lib/types"
import { cn } from "@/lib/utils"

const STATUS_BADGE_STYLES: Record<DemandStatus, string> = {
  open: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10",
  analyzing:
    "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10",
  resolved:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10",
  wontfix:
    "border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-500/10",
}

interface AdminDemandCardProps {
  demand: Demand
  onStatusChange?: (id: string, status: DemandStatus) => void
}

export function AdminDemandCard({ demand, onStatusChange }: AdminDemandCardProps) {
  const { toast } = useToast()
  const [status, setStatus] = React.useState<DemandStatus>(demand.status)
  const [updating, setUpdating] = React.useState(false)

  async function changeStatus(next: DemandStatus) {
    if (next === status) return
    const previous = status
    setStatus(next)
    setUpdating(true)
    try {
      const response = await fetch("/api/demands", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: demand.id, status: next }),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error ?? "Não foi possível atualizar a demanda.")
      }
      onStatusChange?.(demand.id, next)
      toast({
        title: "Demanda atualizada",
        description: `Status alterado para "${DEMAND_STATUS_LABELS[next]}".`,
      })
    } catch (error) {
      setStatus(previous)
      toast({
        variant: "destructive",
        title: "Erro ao atualizar demanda",
        description:
          error instanceof Error ? error.message : "Tente novamente em instantes.",
      })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{demand.name}</h3>
              <Badge variant="outline" className={STATUS_BADGE_STYLES[status]}>
                {DEMAND_STATUS_LABELS[status]}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Recebida em{" "}
              {new Date(demand.created_at).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {updating && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <Select
              value={status}
              onValueChange={(value) => changeStatus(value as DemandStatus)}
              disabled={updating}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEMAND_STATUS_VALUES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {DEMAND_STATUS_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
          <a
            href={`mailto:${demand.email}`}
            className="inline-flex items-center gap-1.5 hover:text-foreground"
          >
            <Mail className="h-3.5 w-3.5" />
            {demand.email}
          </a>
          <a
            href={`tel:${demand.phone}`}
            className="inline-flex items-center gap-1.5 hover:text-foreground"
          >
            <Phone className="h-3.5 w-3.5" />
            {demand.phone}
          </a>
        </div>

        <p
          className={cn(
            "whitespace-pre-line rounded-md bg-muted/60 p-3 text-sm",
            status === "resolved" && "opacity-70"
          )}
        >
          {demand.description}
        </p>

        <a
          href={demand.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <Paperclip className="h-3.5 w-3.5" />
          {demand.file_name}
        </a>
      </CardContent>
    </Card>
  )
}
