"use client"

import * as React from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { notify } from "@/lib/notifications/toast"

export interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  /**
   * Ação executada ao confirmar. Enquanto a promise não resolve o diálogo
   * permanece aberto com o botão em `loading`; só então `confirm()` resolve
   * `true`. Se a ação lançar, mostra `notify.fromError` e resolve `false`.
   */
  onConfirm?: () => Promise<void> | void
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>

const ConfirmContext = React.createContext<ConfirmFn | null>(null)

interface PendingConfirm {
  opts: ConfirmOptions
  resolve: (value: boolean) => void
}

/**
 * Provider global de confirmação. Monte uma vez (no root layout) e use `useConfirm()`
 * em qualquer client component para abrir um AlertDialog e aguardar a resposta.
 */
function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = React.useState<PendingConfirm | null>(null)
  const [loading, setLoading] = React.useState(false)
  const cancelRef = React.useRef<HTMLButtonElement>(null)

  const confirm = React.useCallback<ConfirmFn>((opts) => {
    return new Promise<boolean>((resolve) => {
      // Se já houver um diálogo aberto, resolve o anterior como cancelado.
      setPending((prev) => {
        prev?.resolve(false)
        return { opts, resolve }
      })
    })
  }, [])

  const settle = React.useCallback(
    (value: boolean) => {
      setLoading(false)
      setPending((prev) => {
        prev?.resolve(value)
        return null
      })
    },
    []
  )

  const opts = pending?.opts

  const handleConfirm = React.useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!opts?.onConfirm) {
        settle(true)
        return
      }
      // Impede o Radix de fechar o diálogo antes da ação terminar.
      e.preventDefault()
      setLoading(true)
      try {
        await opts.onConfirm()
        settle(true)
      } catch (err) {
        notify.fromError(err, "Não foi possível concluir a ação")
        settle(false)
      }
    },
    [opts, settle]
  )

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => {
          // Enquanto a ação roda, Esc/overlay não fecham o diálogo.
          if (!open && !loading) settle(false)
        }}
      >
        {opts && (
          <AlertDialogContent
            size="sm"
            onOpenAutoFocus={(e) => {
              // Ações destrutivas: o foco inicial vai para "Cancelar".
              if (opts.destructive && cancelRef.current) {
                e.preventDefault()
                cancelRef.current.focus()
              }
            }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>{opts.title}</AlertDialogTitle>
            </AlertDialogHeader>
            {opts.description && (
              <AlertDialogBody>
                <AlertDialogDescription>{opts.description}</AlertDialogDescription>
              </AlertDialogBody>
            )}
            <AlertDialogFooter>
              <AlertDialogAction
                variant={opts.destructive ? "destructive" : "default"}
                loading={loading}
                onClick={handleConfirm}
              >
                {opts.confirmLabel ?? "Confirmar"}
              </AlertDialogAction>
              <AlertDialogCancel
                ref={cancelRef}
                disabled={loading}
                onClick={() => settle(false)}
              >
                {opts.cancelLabel ?? "Cancelar"}
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </ConfirmContext.Provider>
  )
}

/**
 * Retorna uma função que abre um diálogo de confirmação e resolve com `true`
 * (confirmou) ou `false` (cancelou / fechou / a ação falhou).
 *
 * ```tsx
 * const confirm = useConfirm()
 * if (await confirm({ title: "Excluir item?", destructive: true })) { ... }
 * // Com ação assíncrona (diálogo fica aberto com loading até resolver):
 * const ok = await confirm({ title: "Excluir item?", destructive: true, onConfirm: () => api.delete(id) })
 * ```
 */
function useConfirm(): ConfirmFn {
  const ctx = React.useContext(ConfirmContext)
  if (!ctx) {
    throw new Error("useConfirm deve ser usado dentro de <ConfirmProvider>.")
  }
  return ctx
}

export { ConfirmProvider, useConfirm }
