import Link from "next/link"

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="h-3 w-3 rounded-full bg-primary" aria-hidden />
      <span className="flex flex-col leading-none">
        <span className="text-lg font-bold tracking-tight">Vórtice</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Status
        </span>
      </span>
    </Link>
  )
}
