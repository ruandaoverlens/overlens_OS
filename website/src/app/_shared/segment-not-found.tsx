"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { BackButton } from "@/app/_shared/back-button";

/**
 * 404 de segmento: mantém o shell (sidebar/topbar) do módulo e oferece
 * voltar no histórico ou ir ao início do módulo.
 */
export function SegmentNotFound({
  basePath,
  label,
}: {
  basePath: string;
  label: string;
}) {
  return (
    <div className="flex min-h-[60svh] flex-1 items-center justify-center px-4 py-16">
      <EmptyState
        className="border-none"
        title="Página não encontrada"
        description={`Este endereço não existe em ${label}. O conteúdo pode ter mudado de lugar ou sido removido.`}
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <BackButton fallbackHref={basePath} />
            <Button asChild>
              <Link href={basePath}>Ir para {label}</Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}
