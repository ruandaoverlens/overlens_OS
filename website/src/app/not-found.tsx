import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { BackButton } from "@/app/_shared/back-button";

export const metadata: Metadata = {
  title: "Página não encontrada",
};

export default function NotFound() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex min-h-svh items-center justify-center bg-background px-4"
    >
      <Empty className="border-none">
        <EmptyHeader>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Erro 404
          </p>
          <EmptyTitle>Página não encontrada</EmptyTitle>
          <EmptyDescription>
            O endereço pode ter mudado, sido removido ou nunca ter existido.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <BackButton fallbackHref="/docs" />
            <Button asChild>
              <Link href="/docs">Brand System</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/chat/new">Conversas</Link>
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </main>
  );
}
