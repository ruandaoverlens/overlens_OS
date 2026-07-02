import * as React from "react"

import { cn } from "@/lib/utils"
import { useNotificationBar } from "@/components/ui/notification-bar"
import {
  SmProfileLineIcon,
  SmChatSolidIcon,
  SmDocSolidIcon,
  SmFavoriteSolidIcon,
  SmCrownSolidIcon,
  SmNotificationSolidIcon,
} from "@/components/icons"

type NotificationCardVariant =
  | "follow"
  | "comment"
  | "post"
  | "like"
  | "mention"
  | "achievement"
  | "system"

const variantIconMap: Record<NotificationCardVariant, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  follow: SmProfileLineIcon,
  comment: SmChatSolidIcon,
  post: SmDocSolidIcon,
  like: SmFavoriteSolidIcon,
  mention: SmProfileLineIcon,
  achievement: SmCrownSolidIcon,
  system: SmNotificationSolidIcon,
}

const NotificationCardContext = React.createContext<{
  isUnread: boolean
  variant: NotificationCardVariant
}>({ isUnread: false, variant: "system" })

/**
 * NotificationCard - Card de notificacao do sistema.
 *
 * Conteudo configuravel pelo usuario ou sistema:
 * - **cover**: imagem de capa (opcional) - definida pelo criador da notificacao
 * - **title**: titulo da notificacao - definido pelo sistema ou criador
 * - **description**: texto descritivo - definido pelo sistema ou criador
 * - **time**: timestamp relativo calculado automaticamente pelo sistema:
 *   - Hoje: exibe hora (ex: "08:32")
 *   - Ontem: "Ontem"
 *   - Esta semana: dia da semana (ex: "Segunda-feira")
 *   - Mais antigo: data curta (ex: "03/02/26")
 * - **actions**: botoes de acao contextuais (ex: Aceitar/Recusar)
 */
function NotificationCard({
  className,
  unread = false,
  variant = "system",
  id,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  unread?: boolean
  variant?: NotificationCardVariant
  id?: string
}) {
  const { allRead, registerUnread, markAsRead } = useNotificationBar()
  const [read, setRead] = React.useState(false)
  const generatedId = React.useId()
  const cardId = id ?? generatedId
  const isUnread = unread && !read && !allRead

  React.useEffect(() => {
    if (unread) registerUnread(cardId)
  }, [unread, cardId, registerUnread])

  return (
    <div
      data-slot="notification-card"
      data-unread={isUnread ? "" : undefined}
      className={cn(
        "relative flex shrink-0 cursor-pointer flex-col gap-2 rounded-[12px] bg-white/3 p-2 transition-all hover:bg-foreground/10",
        className
      )}
      onPointerEnter={() => {
        if (isUnread) {
          setRead(true)
          markAsRead(cardId)
        }
      }}
      {...props}
    >
      {isUnread && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[12px]"
        >
          <span className="absolute inset-0 [animation:border-travel_3s_linear_infinite] [background:conic-gradient(from_var(--border-angle),transparent_25%,var(--surface-600)_50%,transparent_75%)]" />
          <span className="absolute inset-px rounded-[11px] bg-[var(--surface-950)]" /><span className="absolute inset-px rounded-[11px] bg-gradient-to-b from-white/7 to-transparent" />
        </span>
      )}
      <NotificationCardContext.Provider value={{ isUnread, variant }}>
        <span className="relative z-10 flex flex-col gap-2">{children}</span>
      </NotificationCardContext.Provider>
    </div>
  )
}

/**
 * Imagem de capa da notificacao (opcional).
 * Aceita `src` para exibir uma imagem ou pode ser usado como div com bg customizado.
 * Definida pelo criador da notificacao ou pelo sistema.
 */
function NotificationCardCover({
  className,
  src,
  alt = "",
  ...props
}: React.ComponentProps<"div"> & {
  src?: string
  alt?: string
}) {
  return (
    <div
      data-slot="notification-card-cover"
      className={cn(
        "relative h-24 w-full shrink-0 overflow-hidden rounded-[6px] bg-muted",
        className
      )}
      {...props}
    >
      {src && (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  )
}

/** Header row containing the title and timestamp of a notification card. */
function NotificationCardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="notification-card-header"
      className={cn("flex items-center justify-between gap-5", className)}
      {...props}
    />
  )
}

/**
 * Titulo da notificacao. Definido pelo criador ou sistema.
 * Aceita icon como children junto ao texto.
 * Textos longos são truncados com ellipsis; hover exibe o texto completo via title nativo.
 */
function NotificationCardTitle({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [titleText, setTitleText] = React.useState<string | undefined>(undefined)

  React.useEffect(() => {
    const el = ref.current
    if (el && el.scrollWidth > el.clientWidth) {
      setTitleText(el.textContent ?? undefined)
    } else {
      setTitleText(undefined)
    }
  }, [children])

  return (
    <div
      ref={ref}
      data-slot="notification-card-title"
      title={titleText}
      className={cn(
        "flex min-w-0 items-center gap-1 pl-0.5 text-sm font-medium text-foreground truncate",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Timestamp relativo da notificacao. Calculado pelo sistema:
 * - Hoje -> hora (ex: "08:32")
 * - Ontem -> "Ontem"
 * - Esta semana -> dia da semana (ex: "Segunda-feira")
 * - Mais antigo -> data curta (ex: "03/02/26")
 *
 * Aceita `date` para calculo automatico ou `children` para texto manual.
 */
function NotificationCardTime({
  className,
  date,
  children,
  ...props
}: React.ComponentProps<"span"> & {
  date?: Date
}) {
  const label = children ?? (date ? formatRelativeTime(date) : undefined)

  return (
    <span
      data-slot="notification-card-time"
      className={cn(
        "shrink-0 text-xs font-medium text-muted-foreground",
        className
      )}
      {...props}
    >
      {label}
    </span>
  )
}

/** Read status badge or date for the notification card. */
function NotificationCardStatus({
  className,
  date,
  ...props
}: React.ComponentProps<"span"> & { date?: Date }) {
  const { isUnread } = React.useContext(NotificationCardContext)
  const timeLabel = date ? formatRelativeTime(date) : undefined

  return (
    <span
      data-slot="notification-card-status"
      className={cn(
        "shrink-0 flex items-center gap-1.5 text-xs font-medium",
        isUnread ? "text-foreground" : "text-muted-foreground",
        className
      )}
      {...props}
    >
      {isUnread ? (
        <>
          Não lida
          <span className="h-2 w-2 rounded-full bg-[var(--brand-atmos)]" />
        </>
      ) : (
        timeLabel
      )}
    </span>
  )
}

/**
 * Descricao da notificacao com data inline.
 * Trunca em 2 linhas por padrão; hover expande para ler completamente.
 */
function NotificationCardDescription({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="notification-card-description"
      className={cn(
        "pl-1 text-sm leading-relaxed text-foreground/60 line-clamp-2 hover:line-clamp-none",
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}

/** Container for contextual action buttons on a notification card. */
function NotificationCardActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="notification-card-actions"
      className={cn("flex gap-1", className)}
      {...props}
    />
  )
}

/** Layout slot for an avatar image. Place inside NotificationCardHeader before the title. */
function NotificationCardAvatar({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="notification-card-avatar"
      className={cn("shrink-0", className)}
      {...props}
    />
  )
}

/** Renders the variant icon from context. Place inside NotificationCardTitle. */
function NotificationCardIcon({
  className,
  ...props
}: React.ComponentProps<"svg">) {
  const { variant } = React.useContext(NotificationCardContext)
  const Icon = variantIconMap[variant]
  return <Icon data-slot="notification-card-icon" className={cn("size-6 shrink-0", className)} {...props} />
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.floor(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays === 0) {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (diffDays === 1) {
    return "Ontem"
  }

  if (diffDays < 7) {
    return date.toLocaleDateString("pt-BR", { weekday: "long" })
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  })
}

export {
  NotificationCard,
  NotificationCardCover,
  NotificationCardHeader,
  NotificationCardAvatar,
  NotificationCardTitle,
  NotificationCardTime,
  NotificationCardStatus,
  NotificationCardDescription,
  NotificationCardActions,
  NotificationCardIcon,
}

export type { NotificationCardVariant }
