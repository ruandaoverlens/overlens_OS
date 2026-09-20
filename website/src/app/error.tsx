"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  // Volta para a página anterior quando há histórico; senão vai para o início.
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/docs");
    }
  };

  return (
    <div className="flex min-h-[60svh] flex-1 items-center justify-center px-4 py-16">
      <EmptyState
        variant="error"
        title="Algo deu errado"
        description="Não foi possível carregar esta página. Você pode tentar novamente ou voltar."
        onRetry={reset}
        className="border-none"
        action={
          <>
            <Button type="button" variant="link" onClick={goBack}>
              Voltar
            </Button>
            {error.digest && (
              <p className="font-mono text-caption text-muted-foreground">
                Código: {error.digest}
              </p>
            )}
          </>
        }
      />
    </div>
  );
}
