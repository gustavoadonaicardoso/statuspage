export interface SupabaseEnv {
  url: string
  anonKey: string
}

// Retorna null quando as variáveis de ambiente do Supabase não estão
// configuradas, permitindo que as páginas exibam um aviso de setup em vez
// de quebrar com erro 500.
export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null
  return { url, anonKey }
}
