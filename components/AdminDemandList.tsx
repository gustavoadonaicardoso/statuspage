"use client"

import * as React from "react"

import { AdminDemandCard } from "@/components/AdminDemandCard"
import { Badge } from "@/components/ui/badge"
import type { Demand, DemandStatus } from "@/lib/types"

interface AdminDemandListProps {
  demands: Demand[]
}

export function AdminDemandList({ demands }: AdminDemandListProps) {
  const [statuses, setStatuses] = React.useState<Record<string, DemandStatus>>(
    () => Object.fromEntries(demands.map((d) => [d.id, d.status]))
  )

  const openCount = demands.filter(
    (d) => (statuses[d.id] ?? d.status) === "open"
  ).length

  function handleStatusChange(id: string, status: DemandStatus) {
    setStatuses((prev) => ({ ...prev, [id]: status }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
        >
          {openCount} {openCount === 1 ? "demanda aberta" : "demandas abertas"}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {demands.length} no total
        </span>
      </div>

      {demands.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nenhuma demanda recebida até o momento.
        </div>
      ) : (
        <div className="space-y-4">
          {demands.map((demand) => (
            <AdminDemandCard
              key={demand.id}
              demand={demand}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
