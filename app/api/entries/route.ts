import { NextResponse } from "next/server"

import { getSupabaseEnv } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"
import { ENTRY_TYPE_VALUES, type EntryType } from "@/lib/types"

export const dynamic = "force-dynamic"

// GET público: lista as entradas do feed em ordem decrescente.
export async function GET() {
  if (!getSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase não configurado no servidor." },
      { status: 503 }
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("entries")
    .select("id, type, title, description, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível carregar o feed." },
      { status: 500 }
    )
  }

  return NextResponse.json({ entries: data })
}

// POST autenticado: publica uma nova entrada no feed.
export async function POST(request: Request) {
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

  let body: { type?: string; title?: string; description?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 })
  }

  const type = body.type ?? ""
  const title = body.title?.trim() ?? ""
  const description = body.description?.trim() ?? ""

  if (!ENTRY_TYPE_VALUES.includes(type as EntryType)) {
    return NextResponse.json({ error: "Tipo de entrada inválido." }, { status: 400 })
  }
  if (!title) {
    return NextResponse.json({ error: "Informe um título." }, { status: 400 })
  }
  if (!description) {
    return NextResponse.json({ error: "Informe uma descrição." }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("entries")
    .insert({ type, title, description })
    .select("id, type, title, description, created_at")
    .single()

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível publicar a entrada." },
      { status: 500 }
    )
  }

  return NextResponse.json({ entry: data }, { status: 201 })
}
