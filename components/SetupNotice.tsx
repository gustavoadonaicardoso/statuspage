import { TriangleAlert } from "lucide-react"

import { Logo } from "@/components/Logo"

export function SetupNotice() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <Logo />
      <div className="w-full max-w-lg rounded-xl border border-amber-500/30 bg-amber-500/10 p-6">
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div className="space-y-2 text-sm">
            <p className="font-semibold">
              Configuração do Supabase pendente
            </p>
            <p className="text-muted-foreground">
              As variáveis de ambiente{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                NEXT_PUBLIC_SUPABASE_URL
              </code>{" "}
              e{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </code>{" "}
              não foram encontradas.
            </p>
            <p className="text-muted-foreground">
              Configure-as no ambiente de hospedagem (na Vercel: Settings →
              Environment Variables) e faça um novo deploy. Veja o README para
              o passo a passo completo.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
