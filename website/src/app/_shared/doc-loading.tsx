import { Skeleton } from "@/components/ui/skeleton";

const LINE_WIDTHS = [
  "w-full",
  "w-11/12",
  "w-4/5",
  "w-full",
  "w-2/3",
  "w-11/12",
  "w-3/4",
  "w-1/2",
];

/** Skeleton compartilhado pelas páginas de documento (mesmo container/padding da página). */
export function DocLoading() {
  return (
    <div
      aria-busy="true"
      role="status"
      className="mx-auto max-w-4xl px-6 pt-4 pb-8 md:px-8 md:pt-5 md:pb-10"
    >
      <span className="sr-only">Carregando</span>
      <Skeleton className="h-9 w-2/3" />
      <div className="mt-8 space-y-3">
        {LINE_WIDTHS.map((w, i) => (
          <Skeleton key={i} className={`h-4 ${w}`} />
        ))}
      </div>
    </div>
  );
}
