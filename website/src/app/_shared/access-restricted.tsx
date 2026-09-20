import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

/** Usuário logado sem permissão para o módulo — em vez de um 404 mudo. */
export function AccessRestricted({ label }: { label: string }) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex min-h-svh items-center justify-center bg-background px-4"
    >
      <EmptyState
        className="border-none"
        title="Acesso restrito"
        description={`${label} é exclusivo da equipe Overlens. Se você acha que deveria ter acesso, fale com um administrador.`}
        action={
          <Button asChild>
            <Link href="/docs">Ir para o Brand System</Link>
          </Button>
        }
      />
    </main>
  );
}
