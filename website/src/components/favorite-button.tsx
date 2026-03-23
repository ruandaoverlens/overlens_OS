"use client";

import { SmStarSolidIcon, SmStarLineIcon } from "@/components/icons";

export function FavoriteButton({
  isFavorite,
  onClick,
  className = "",
}: {
  isFavorite: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className={`size-8 rounded-full flex items-center justify-center transition-all ${
        isFavorite
          ? "bg-white text-black hover:bg-white/80"
          : "bg-black/50 text-white/40 hover:text-white/70 hover:bg-black/70"
      } ${className}`}
    >
      {isFavorite ? (
        <SmStarSolidIcon className="size-4" />
      ) : (
        <SmStarLineIcon className="size-4" />
      )}
    </button>
  );
}
