import { redirect } from "next/navigation"
import { Activity, Inbox, Megaphone } from "lucide-react"

import { AdminDemandList } from "@/components/AdminDemandList"
import { AdminEntryForm } from "@/components/AdminEntryForm"
import { AdminEntryList } from "@/components/AdminEntryList"
import { AdminLogoutButton } from "@/components/AdminLogoutButton"
import { AdminStatusControl } from "@/components/AdminStatusControl"
import { Logo } from "@/components/Logo"
import { SetupNotice } from "@/components/SetupNotice"
import { ThemeToggle } from "@/components/ThemeToggle"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSupabaseEnv } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"
import type { Demand, Entry, SystemStatus } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  if (!getSupabaseEnv()) {
    return <SetupNotice />
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/admin/login")
  }

  const [statusResult, demandsResult, entriesResult] = await Promise.all([
    supabase.from("system_status").select("status, updated_at").eq("id", 1).maybeSingle(),
    supabase
      .from("demands")
      .select("id, name, email, phone, description, file_url, file_name, status, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("entries")
      .select("id, type, title, description, created_at")
      .order("created_at", { ascending: false }),
  ])

  const status = (statusResult.data?.status ?? "operational") as SystemStatus
  const updatedAt = statusResult.data?.updated_at ?? null
  const demands = (demandsResult.data ?? []) as Demand[]
  const entries = (entriesResult.data ?? []) as Entry[]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="hidden text-xs text-muted-foreground sm:block">
              {user.email}
            </span>
            <ThemeToggle />
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              Status do sistema
            </CardTitle>
            <CardDescription>
              Altere o status global exibido na página pública.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminStatusControl
              initialStatus={status}
              initialUpdatedAt={updatedAt}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Megaphone className="h-5 w-5 text-primary" />
              Publicar entrada
            </CardTitle>
            <CardDescription>
              Publique atualizações, correções ou avisos de instabilidade no
              feed público.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <AdminEntryForm />
            <div>
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                Entradas publicadas
              </h3>
              <AdminEntryList entries={entries} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Inbox className="h-5 w-5 text-primary" />
              Demandas recebidas
            </CardTitle>
            <CardDescription>
              Acompanhe e atualize o status das demandas enviadas pelos
              usuários.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminDemandList demands={demands} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
