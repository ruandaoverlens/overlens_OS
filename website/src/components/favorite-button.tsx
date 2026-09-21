"use client";

import { SmStarSolidIcon, SmStarLineIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  isFavorite,
  onClick,
  className = "",
  iconClassName = "size-4",
}: {
  isFavorite: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  /** Tamanho do ícone — a topbar usa um ícone maior que o dos cards. */
  iconClassName?: string;
}) {
  return (
    <button
      type="button"
      aria-label={isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
      aria-pressed={isFavorite}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className={cn(
        "size-8 cursor-pointer rounded-full flex items-center justify-center transition-all outline-none focus-visible:ring-2 focus-visible:ring-foreground",
        isFavorite
          ? "bg-white text-black hover:bg-white/80"
          : "bg-black/50 text-white/70 hover:text-white hover:bg-black/70",
        className
      )}
    >
      {isFavorite ? (
        <SmStarSolidIcon className={iconClassName} />
      ) : (
        <SmStarLineIcon className={iconClassName} />
      )}
    </button>
  );
}
