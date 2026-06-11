export type SystemStatus = "operational" | "instability" | "outage" | "maintenance"

export type EntryType = "update" | "fix" | "instability"

export type DemandStatus = "open" | "analyzing" | "resolved" | "wontfix"

export interface Entry {
  id: string
  type: EntryType
  title: string
  description: string
  created_at: string
}

export interface Demand {
  id: string
  name: string
  email: string
  phone: string
  description: string
  file_url: string
  file_name: string
  status: DemandStatus
  created_at: string
}

export const SYSTEM_STATUS_VALUES: SystemStatus[] = [
  "operational",
  "instability",
  "outage",
  "maintenance",
]

export const ENTRY_TYPE_VALUES: EntryType[] = ["update", "fix", "instability"]

export const DEMAND_STATUS_VALUES: DemandStatus[] = [
  "open",
  "analyzing",
  "resolved",
  "wontfix",
]

export const SYSTEM_STATUS_LABELS: Record<SystemStatus, string> = {
  operational: "Todos os sistemas operacionais",
  instability: "Instabilidade detectada",
  outage: "Sistema indisponível",
  maintenance: "Em manutenção",
}

export const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  update: "Atualização",
  fix: "Correção",
  instability: "Instabilidade",
}

export const DEMAND_STATUS_LABELS: Record<DemandStatus, string> = {
  open: "Em aberto",
  analyzing: "Analisando",
  resolved: "Resolvido",
  wontfix: "Não replicado",
}

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
