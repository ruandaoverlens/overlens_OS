import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div
      aria-busy="true"
      role="status"
      className="mx-auto flex max-w-5xl flex-col gap-6 p-6"
    >
      <span className="sr-only">Carregando</span>
      <Skeleton className="h-8 w-1/3" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}
