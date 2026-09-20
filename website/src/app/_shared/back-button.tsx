"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SmArrowBackLineIcon } from "@/components/icons";

/** "Voltar" via histórico do navegador; cai em `fallbackHref` sem histórico. */
export function BackButton({
  fallbackHref = "/docs",
  variant = "outline",
}: {
  fallbackHref?: string;
  variant?: "outline" | "secondary" | "ghost";
}) {
  const router = useRouter();
  return (
    <Button
      type="button"
      variant={variant}
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallbackHref);
      }}
    >
      <SmArrowBackLineIcon aria-hidden="true" />
      Voltar
    </Button>
  );
}
