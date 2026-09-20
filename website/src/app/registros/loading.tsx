import { Skeleton } from "@/components/ui/skeleton";

export default function RegistrosLoading() {
  return (
    <div
      aria-busy="true"
      role="status"
      className="mx-auto flex max-w-5xl flex-col gap-6 p-6"
    >
      <span className="sr-only">Carregando</span>
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-56 w-full rounded-lg" />
    </div>
  );
}
