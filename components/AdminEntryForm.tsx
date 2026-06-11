"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  ENTRY_TYPE_LABELS,
  ENTRY_TYPE_VALUES,
  type EntryType,
} from "@/lib/types"

export function AdminEntryForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [type, setType] = React.useState<EntryType | "">("")
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!type || !title.trim() || !description.trim()) {
      toast({
        variant: "destructive",
        title: "Preencha todos os campos",
        description: "Tipo, título e descrição são obrigatórios.",
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: title.trim(),
          description: description.trim(),
        }),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error ?? "Não foi possível publicar a entrada.")
      }

      setType("")
      setTitle("")
      setDescription("")
      toast({
        title: "Entrada publicada",
        description: "O feed público já foi atualizado.",
      })
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao publicar",
        description:
          error instanceof Error ? error.message : "Tente novamente em instantes.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
        <div className="space-y-2">
          <Label htmlFor="entry-type">Tipo</Label>
          <Select
            value={type}
            onValueChange={(value) => setType(value as EntryType)}
          >
            <SelectTrigger id="entry-type">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {ENTRY_TYPE_VALUES.map((value) => (
                <SelectItem key={value} value={value}>
                  {ENTRY_TYPE_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="entry-title">Título</Label>
          <Input
            id="entry-title"
            placeholder="Ex.: Nova versão do módulo de relatórios"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="entry-description">Descrição</Label>
        <Textarea
          id="entry-description"
          placeholder="Detalhe o que mudou, o que foi corrigido ou o que está instável"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Publicando…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Publicar
          </>
        )}
      </Button>
    </form>
  )
}
