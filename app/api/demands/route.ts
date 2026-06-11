import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { DEMAND_STATUS_VALUES, type DemandStatus } from "@/lib/types"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// POST público: cria uma demanda. O arquivo já foi enviado ao Storage
// pelo client; aqui validamos e persistimos os metadados.
export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 })
  }

  const name = typeof body.name === "string" ? body.name.trim() : ""
  const email = typeof body.email === "string" ? body.email.trim() : ""
  const phone = typeof body.phone === "string" ? body.phone.trim() : ""
  const description =
    typeof body.description === "string" ? body.description.trim() : ""
  const fileUrl = typeof body.file_url === "string" ? body.file_url.trim() : ""
  const fileName = typeof body.file_name === "string" ? body.file_name.trim() : ""

  if (!name) {
    return NextResponse.json({ error: "Informe seu nome completo." }, { status: 400 })
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 })
  }
  if (!phone) {
    return NextResponse.json(
      { error: "Informe seu telefone / WhatsApp." },
      { status: 400 }
    )
  }
  if (!description || description.length < 20) {
    return NextResponse.json(
      { error: "A descrição deve ter pelo menos 20 caracteres." },
      { status: 400 }
    )
  }
  if (!fileUrl || !fileName) {
    return NextResponse.json(
      { error: "Anexe um arquivo de evidência." },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const { error } = await supabase.from("demands").insert({
    name,
    email,
    phone,
    description,
    file_url: fileUrl,
    file_name: fileName,
  })

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível registrar a demanda." },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}

// PATCH autenticado: atualiza o status de uma demanda.
export async function PATCH(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }

  let body: { id?: string; status?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 })
  }

  const { id, status } = body
  if (!id || !status || !DEMAND_STATUS_VALUES.includes(status as DemandStatus)) {
    return NextResponse.json(
      { error: "Informe um id e um status válidos." },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from("demands")
    .update({ status })
    .eq("id", id)

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível atualizar a demanda." },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
