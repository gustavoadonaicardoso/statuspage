"use client"

import * as React from "react"
import { CheckCircle2, FileVideo, ImageIcon, Loader2, UploadCloud, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { MAX_FILE_SIZE } from "@/lib/types"
import { cn } from "@/lib/utils"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  description?: string
  file?: string
}

function validateFile(file: File): string | undefined {
  const isMedia =
    file.type.startsWith("image/") || file.type.startsWith("video/")
  if (!isMedia) {
    return "O arquivo deve ser uma imagem ou um vídeo."
  }
  if (file.size > MAX_FILE_SIZE) {
    return "O arquivo deve ter no máximo 50MB."
  }
  return undefined
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DemandForm() {
  const { toast } = useToast()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [file, setFile] = React.useState<File | null>(null)
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [isDragging, setIsDragging] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)

  function validate(): FormErrors {
    const next: FormErrors = {}
    if (!name.trim()) next.name = "Informe seu nome completo."
    if (!email.trim()) next.email = "Informe seu e-mail."
    else if (!EMAIL_REGEX.test(email.trim()))
      next.email = "Informe um e-mail válido."
    if (!phone.trim()) next.phone = "Informe seu telefone / WhatsApp."
    if (!description.trim()) next.description = "Descreva o problema."
    else if (description.trim().length < 20)
      next.description = "A descrição deve ter pelo menos 20 caracteres."
    if (!file) next.file = "Anexe um arquivo de evidência (imagem ou vídeo)."
    else {
      const fileError = validateFile(file)
      if (fileError) next.file = fileError
    }
    return next
  }

  function handleFileSelected(selected: File | null) {
    if (!selected) return
    const fileError = validateFile(selected)
    if (fileError) {
      setErrors((prev) => ({ ...prev, file: fileError }))
      toast({
        variant: "destructive",
        title: "Arquivo inválido",
        description: fileError,
      })
      return
    }
    setFile(selected)
    setErrors((prev) => ({ ...prev, file: undefined }))
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    handleFileSelected(event.dataTransfer.files?.[0] ?? null)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validation = validate()
    setErrors(validation)
    if (Object.keys(validation).length > 0 || !file) {
      toast({
        variant: "destructive",
        title: "Verifique o formulário",
        description: "Todos os campos são obrigatórios.",
      })
      return
    }

    setSubmitting(true)
    try {
      const supabase = createClient()

      // Upload client-side direto para o Storage (evita limite de body em API Routes)
      const extension = file.name.includes(".")
        ? file.name.slice(file.name.lastIndexOf("."))
        : ""
      const path = `${crypto.randomUUID()}${extension}`
      const { error: uploadError } = await supabase.storage
        .from("demand-files")
        .upload(path, file, { contentType: file.type })

      if (uploadError) {
        throw new Error(`Falha ao enviar o arquivo: ${uploadError.message}`)
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("demand-files").getPublicUrl(path)

      const response = await fetch("/api/demands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          description: description.trim(),
          file_url: publicUrl,
          file_name: file.name,
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error ?? "Não foi possível registrar a demanda.")
      }

      setSubmitted(true)
      toast({
        title: "Demanda registrada!",
        description: "Recebemos sua solicitação e entraremos em contato.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar demanda",
        description:
          error instanceof Error ? error.message : "Tente novamente em instantes.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setName("")
    setEmail("")
    setPhone("")
    setDescription("")
    setFile(null)
    setErrors({})
    setSubmitted(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <CheckCircle2 className="h-14 w-14 text-emerald-500" />
          <div>
            <h3 className="text-lg font-semibold">Demanda enviada com sucesso!</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Nossa equipe vai analisar sua solicitação e entrar em contato pelo
              e-mail ou WhatsApp informados.
            </p>
          </div>
          <Button onClick={resetForm} variant="outline">
            Enviar outra demanda
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Registrar demanda</CardTitle>
        <CardDescription>
          Encontrou um problema? Preencha os campos abaixo com uma evidência em
          imagem ou vídeo. Todos os campos são obrigatórios.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="voce@empresa.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone / WhatsApp</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição do problema</Label>
            <Textarea
              id="description"
              placeholder="Descreva o problema com o máximo de detalhes (mínimo 20 caracteres)"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={20}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Arquivo de evidência (imagem ou vídeo)</Label>
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50 hover:bg-accent/50"
              )}
            >
              {file ? (
                <div className="flex w-full items-center justify-between gap-3 text-left">
                  <div className="flex min-w-0 items-center gap-3">
                    {file.type.startsWith("video/") ? (
                      <FileVideo className="h-8 w-8 shrink-0 text-primary" />
                    ) : (
                      <ImageIcon className="h-8 w-8 shrink-0 text-primary" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remover arquivo"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ""
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <UploadCloud className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Arraste o arquivo aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Imagens e vídeos de até 50MB
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                id="file"
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
              />
            </div>
            {errors.file && (
              <p className="text-xs text-destructive">{errors.file}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando…
              </>
            ) : (
              "Enviar demanda"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
