import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div
      aria-busy="true"
      role="status"
      className="flex h-full min-h-0 w-full flex-col"
    >
      <span className="sr-only">Carregando</span>
      <div className="mx-auto flex w-full max-w-[780px] flex-1 flex-col gap-6 px-4 py-8">
        <Skeleton className="ml-auto h-12 w-3/5 rounded-2xl" />
        <Skeleton className="h-28 w-4/5 rounded-2xl" />
        <Skeleton className="ml-auto h-10 w-2/5 rounded-2xl" />
      </div>
    </div>
  );
}
