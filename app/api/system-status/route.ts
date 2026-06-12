import { NextResponse } from "next/server"

import { getSupabaseEnv } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"
import { SYSTEM_STATUS_VALUES, type SystemStatus } from "@/lib/types"

export const dynamic = "force-dynamic"

// GET público: retorna o status global do sistema.
export async function GET() {
  if (!getSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase não configurado no servidor." },
      { status: 503 }
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("system_status")
    .select("status, updated_at")
    .eq("id", 1)
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível carregar o status." },
      { status: 500 }
    )
  }

  return NextResponse.json({
    status: data?.status ?? "operational",
    updated_at: data?.updated_at ?? null,
  })
}

// PATCH autenticado: altera o status global do sistema.
export async function PATCH(request: Request) {
  if (!getSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase não configurado no servidor." },
      { status: 503 }
    )
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }

  let body: { status?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 })
  }

  const status = body.status ?? ""
  if (!SYSTEM_STATUS_VALUES.includes(status as SystemStatus)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 })
  }

  const { error } = await supabase
    .from("system_status")
    .upsert({ id: 1, status, updated_at: new Date().toISOString() })

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível atualizar o status." },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
