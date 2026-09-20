import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  SmUploadLineIcon,
  SmDocSolidIcon,
  SmOpenFolderLineIcon,
  SmCloseSolidIcon,
  SmAlertSolidIcon,
} from "@/components/icons"
import { inputGroupVariants } from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"

import { cn } from "@/lib/utils"

/** Root container for the upload compound component. */
function Upload({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="upload"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

/**
 * Botão focável (estilo de campo) que aciona um input de arquivo oculto.
 * `aria-describedby` vai para o botão (ex.: id da mensagem de formatos aceitos).
 * `aria-invalid` vira `data-invalid` no botão: o ARIA não define `aria-invalid`
 * para `role=button`, e o botão é o próprio container (o seletor `has-[…]` do
 * inputGroupVariants espera um descendente), então o estado de erro é estilizado
 * por atributo de dado.
 */
function UploadTrigger({
  className,
  accept,
  multiple,
  onChange,
  children,
  disabled,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: Omit<React.ComponentProps<"div">, "onChange"> & {
  accept?: string
  multiple?: boolean
  disabled?: boolean
  onChange?: (files: FileList | null) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <div data-slot="upload-trigger" className={cn("relative", className)} {...props}>
      <button
        type="button"
        disabled={disabled}
        aria-describedby={ariaDescribedBy}
        data-invalid={ariaInvalid === true || ariaInvalid === "true" ? "true" : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        onClick={() => inputRef.current?.click()}
        className={cn(
          inputGroupVariants(),
          "cursor-pointer justify-center gap-2 text-sm font-medium text-muted-foreground",
          "focus-visible:border-foreground/60 focus-visible:ring-2 focus-visible:ring-foreground/70",
          "data-[invalid=true]:border-destructive data-[invalid=true]:ring-2 data-[invalid=true]:ring-destructive/40",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <SmUploadLineIcon className="size-5 shrink-0" aria-hidden="true" />
        <span>{children ?? "Carregar arquivos"}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          onChange?.(e.target.files)
          // Permite selecionar o mesmo arquivo de novo após remoção.
          e.target.value = ""
        }}
      />
    </div>
  )
}

const uploadMessageVariants = cva(
  "flex items-center gap-2 pl-2 text-sm font-medium",
  {
    variants: {
      variant: {
        error:
          "[&_[data-slot=upload-message-icon]]:text-destructive text-muted-foreground",
        warning:
          "[&_[data-slot=upload-message-icon]]:text-warning text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "error",
    },
  }
)

/** Status/error message displayed below the trigger. */
function UploadMessage({
  className,
  variant,
  children,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof uploadMessageVariants>) {
  return (
    <div
      data-slot="upload-message"
      className={cn(uploadMessageVariants({ variant }), className)}
      {...props}
    >
      <span data-slot="upload-message-icon" className="shrink-0">
        {variant === "warning" ? (
          <SmAlertSolidIcon className="size-5" />
        ) : (
          <SmCloseSolidIcon className="size-5" />
        )}
      </span>
      <span>{children}</span>
    </div>
  )
}

/** Single file row with doc icon, filename, and remove button. */
function UploadFile({
  className,
  name,
  onRemove,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  name: string
  onRemove?: () => void
}) {
  return (
    <div
      data-slot="upload-file"
      className={cn(
        "flex items-center gap-2 py-1 text-sm text-surface-300",
        className
      )}
      {...props}
    >
      <SmDocSolidIcon className="size-6 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="truncate">{name}</span>
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Remover arquivo ${name}`}
          onClick={onRemove}
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          <SmCloseSolidIcon className="size-5" />
        </Button>
      )}
    </div>
  )
}

/** Summary toggle that shows file count and expands/collapses the file list via Collapsible. */
function UploadSummary({
  className,
  count,
  defaultOpen = false,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  count: number
  defaultOpen?: boolean
  children?: React.ReactNode
}) {
  return (
    <Collapsible data-slot="upload-summary" defaultOpen={defaultOpen} className={cn("flex flex-col gap-2", className)} {...props}>
      <CollapsibleTrigger className="inline-flex items-center gap-1.5 pl-2 py-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <SmOpenFolderLineIcon className="size-5 shrink-0 text-brand-sahara" aria-hidden="true" />
        <span>Ver todos (+{count})</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div
          data-slot="upload-file-list"
          className="rounded-field bg-input/30 px-4 py-3 flex flex-col"
        >
          <span className="text-xs font-mono uppercase tracking-wide text-muted-foreground pt-1 pb-4">
            Arquivos carregados
          </span>
          <div className="flex flex-col divide-y divide-surface-200/10 max-h-40 overflow-y-auto pr-3 scrollbar-thin [&_[data-slot=upload-file]]:pb-2">
            {children}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

/** Expanded list of uploaded files with a title header, inside a card-like container. Standalone usage. */
function UploadFileList({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="upload-file-list"
      className={cn(
        "rounded-field bg-input/30 px-4 py-3 flex flex-col",
        className
      )}
      {...props}
    >
      <span className="text-xs font-mono uppercase tracking-wide text-muted-foreground pb-1">
        Arquivos carregados
      </span>
      <div className="flex flex-col divide-y divide-surface-200/10">
        {children}
      </div>
    </div>
  )
}

export {
  Upload,
  UploadTrigger,
  UploadMessage,
  UploadFile,
  UploadFileList,
  UploadSummary,
  uploadMessageVariants,
}
