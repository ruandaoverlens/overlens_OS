import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  SmUploadLineIcon,
  SmDocSolidIcon,
  SmOpenFolderLineIcon,
  SmCloseSolidIcon,
  SmAlertSolidIcon,
} from "@/components/icons"
import { InputGroup } from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
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

/** Trigger that uses InputGroup with a hidden file input. */
function UploadTrigger({
  className,
  accept,
  multiple,
  onChange,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "onChange"> & {
  accept?: string
  multiple?: boolean
  onChange?: (files: FileList | null) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <InputGroup
      data-slot="upload-trigger"
      className={cn("cursor-pointer", className)}
      onClick={() => inputRef.current?.click()}
      {...props}
    >
      <div className="flex flex-1 items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
        <SmUploadLineIcon className="size-5 shrink-0" />
        <span>{children ?? "Carregar arquivos"}</span>
      </div>
      <Input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => onChange?.(e.target.files)}
      />
    </InputGroup>
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
        "flex items-center gap-1.5 py-1 text-sm text-[var(--surface-300)]",
        className
      )}
      {...props}
    >
      <SmDocSolidIcon className="size-6 shrink-0 text-muted-foreground" />
      <span className="truncate">{name}</span>
      {onRemove && (
        <button
          type="button"
          aria-label={`Remover ${name}`}
          onClick={onRemove}
          className="inline-flex items-center justify-center size-6 shrink-0 text-muted-foreground opacity-70 hover:opacity-100 transition-opacity"
        >
          <SmCloseSolidIcon className="size-5" />
        </button>
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
        <SmOpenFolderLineIcon className="size-5 shrink-0 text-[var(--brand-sahara)]" />
        <span>Ver todos (+{count})</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div
          data-slot="upload-file-list"
          className="rounded-[12px] bg-input/30 px-4 py-3 flex flex-col"
        >
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground pt-1 pb-4">
            Arquivos carregados
          </span>
          <div className="flex flex-col divide-y divide-[var(--surface-200)]/10 max-h-40 overflow-y-auto pr-3 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/80 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-foreground/30 [&_[data-slot=upload-file]]:pb-2">
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
        "rounded-[12px] bg-input/30 px-4 py-3 flex flex-col",
        className
      )}
      {...props}
    >
      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground pb-1">
        Arquivos carregados
      </span>
      <div className="flex flex-col divide-y divide-[var(--surface-200)]/10">
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
