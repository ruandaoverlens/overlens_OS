import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton de grade de cards (2/3/4 colunas) usado por Assets e Mycelium. */
export function CardGridLoading({ count = 8 }: { count?: number }) {
  return (
    <div aria-busy="true" role="status" className="flex h-full flex-col">
      <span className="sr-only">Carregando</span>
      <div className="container-content flex items-center gap-2 pt-4 pb-3">
        <Skeleton className="h-8 flex-1 rounded-full" />
      </div>
      <div className="container-content pb-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: count }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
