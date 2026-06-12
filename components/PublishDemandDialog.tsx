"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, Megaphone } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  type Demand,
  type EntryType,
} from "@/lib/types"

interface PublishDemandDialogProps {
  demand: Demand
}

export function PublishDemandDialog({ demand }: PublishDemandDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = React.useState(false)
  const [type, setType] = React.useState<EntryType>("instability")
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState(demand.description)
  const [submitting, setSubmitting] = React.useState(false)

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) {
      // Pré-preenche com o conteúdo da demanda a cada abertura
      setType("instability")
      setTitle("")
      setDescription(demand.description)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim() || !description.trim()) {
      toast({
        variant: "destructive",
        title: "Preencha todos os campos",
        description: "Título e descrição são obrigatórios.",
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

      toast({
        title: "Publicada no feed",
        description: "A demanda agora aparece na página principal.",
      })
      setOpen(false)
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Megaphone className="h-4 w-4" />
          Publicar no feed
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publicar demanda no feed</DialogTitle>
          <DialogDescription>
            Cria uma entrada na página principal a partir da demanda de{" "}
            <span className="font-medium text-foreground">{demand.name}</span>.
            Os dados pessoais do usuário não são publicados — revise o texto
            antes de enviar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`publish-type-${demand.id}`}>Tipo</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as EntryType)}
            >
              <SelectTrigger id={`publish-type-${demand.id}`}>
                <SelectValue />
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
            <Label htmlFor={`publish-title-${demand.id}`}>Título</Label>
            <Input
              id={`publish-title-${demand.id}`}
              placeholder="Ex.: Instabilidade no módulo de relatórios"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`publish-description-${demand.id}`}>Descrição</Label>
            <Textarea
              id={`publish-description-${demand.id}`}
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publicando…
                </>
              ) : (
                "Publicar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
