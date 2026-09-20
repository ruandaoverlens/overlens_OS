import { ListSkeleton } from "@/components/skeletons";

export default function FerramentasLoading() {
  return (
    <div
      aria-busy="true"
      role="status"
      className="mx-auto flex max-w-5xl flex-col gap-6 p-6"
    >
      <span className="sr-only">Carregando</span>
      <ListSkeleton rows={6} />
    </div>
  );
}
