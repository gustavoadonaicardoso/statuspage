import { DemandForm } from "@/components/DemandForm"
import { EntryTimeline } from "@/components/EntryTimeline"
import { Logo } from "@/components/Logo"
import { SetupNotice } from "@/components/SetupNotice"
import { StatusBadge } from "@/components/StatusBadge"
import { ThemeToggle } from "@/components/ThemeToggle"
import { getSupabaseEnv } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"
import type { Entry, SystemStatus } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  if (!getSupabaseEnv()) {
    return <SetupNotice />
  }

  const supabase = await createClient()

  const [statusResult, entriesResult] = await Promise.all([
    supabase.from("system_status").select("status, updated_at").eq("id", 1).maybeSingle(),
    supabase
      .from("entries")
      .select("id, type, title, description, created_at")
      .order("created_at", { ascending: false }),
  ])

  const status = (statusResult.data?.status ?? "operational") as SystemStatus
  const updatedAt = statusResult.data?.updated_at ?? null
  const entries = (entriesResult.data ?? []) as Entry[]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <section aria-label="Feed de atualizações" className="space-y-6">
            <StatusBadge status={status} updatedAt={updatedAt} />
            <div>
              <h2 className="mb-4 text-lg font-semibold">Últimas atualizações</h2>
              <EntryTimeline entries={entries} />
            </div>
          </section>

          <aside aria-label="Registrar demanda">
            <div className="lg:sticky lg:top-20">
              <DemandForm />
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Vórtice Tecnologia Estratégia Comercial
          Ltda. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
