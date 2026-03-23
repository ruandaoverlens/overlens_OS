import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  SmArrowBackIosNewLineIcon,
  SmArrowForwardIosLineIcon,
} from "@/components/icons";

interface PaginationItem {
  title: string;
  segments: string[];
}

export function DocPagination({
  prev,
  next,
  basePath = "/docs",
}: {
  prev: PaginationItem | null;
  next: PaginationItem | null;
  basePath?: string;
}) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-6">
      {prev ? (
        <Button variant="secondary" size="sm" asChild>
          <Link href={`${basePath}/${prev.segments.join("/")}`}>
            <SmArrowBackIosNewLineIcon />
            <span className="truncate hidden sm:inline">{prev.title}</span>
            <span className="sm:hidden">Voltar</span>
          </Link>
        </Button>
      ) : (
        <div />
      )}
      {next ? (
        <Button variant="secondary" size="sm" asChild>
          <Link href={`${basePath}/${next.segments.join("/")}`}>
            <span className="truncate hidden sm:inline">{next.title}</span>
            <span className="sm:hidden">Avançar</span>
            <SmArrowForwardIosLineIcon />
          </Link>
        </Button>
      ) : (
        <div />
      )}
    </nav>
  );
}
