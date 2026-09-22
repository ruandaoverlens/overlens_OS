"use client";

import Link from "next/link";
import { Suspense, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import type { AssetCategory } from "@/lib/assets";
import { EmptyState } from "@/components/empty-state";
import { HeadingTitle } from "@/components/ui/heading";
import { ListSkeleton } from "@/components/skeletons";
import {
  SmHomeSolidIcon,
  SmFavoriteLineIcon,
  SmDocLineIcon,
  SmAsteriskLineIcon,
  SmContrastLineIcon,
  SmAppsLineIcon,
  SmCognitionLineIcon,
  SmInvoiceLineIcon,
  SmGraphicEqLineIcon,
  SmImageLineIcon,
  SmPlaySolidIcon,
  SmChartLineIcon,
} from "@/components/icons";
import { AssetPageShell, useAssetFilters } from "@/components/asset-page-shell";
import { VideoBank } from "@/components/video-bank";
import { AdBank } from "@/components/ad-bank";
import { MusicBank } from "@/components/music-bank";
import { LogosBank, LOGOS, LOGO_TYPES } from "@/components/logos-bank";
import { ColorBank, getAllColorTags } from "@/components/color-bank";
import { TypographyBank } from "@/components/typography-bank";
import { ImageBank, getAllImageTags } from "@/components/image-bank";
import { IconGallery } from "@/components/icons/icon-gallery";
import { FavoritesPage } from "@/components/favorites-page";
import { ContentBank } from "@/components/content-bank";
import { useAuth, canDelete } from "@/lib/auth";
import { useHiddenAssets } from "@/lib/hidden-assets";
import { AdminAssetTabs } from "@/components/admin-asset-tabs";

function ImageBankPage() {
  const { user } = useAuth();
  const isAdmin = user && canDelete(user.role);
  const [counts, setCounts] = useState({ visible: 0, hidden: 0 });
  const filters = useAssetFilters();

  const handleCountChange = useCallback((visible: number, hidden: number) => {
    setCounts({ visible, hidden });
  }, []);

  return (
    <AssetPageShell
      slug="banco-de-imagens"
      title="Banco de imagens"
      searchPlaceholder="Buscar imagens…"
      tags={getAllImageTags()}
      search={filters.search}
      onSearchChange={filters.setSearch}
      activeTags={filters.activeTags}
      onTagToggle={filters.toggleTag}
      count={counts.visible}
      countLabel="imagens"
      contentClassName="container-content flex-1 overflow-y-auto pt-10"
      headerSlot={isAdmin ? <AdminAssetTabs showHidden={filters.showHidden} onShowHiddenChange={filters.setShowHidden} totalCount={counts.visible} hiddenCount={counts.hidden} /> : undefined}
    >
      <ImageBank
        showHidden={filters.showHidden}
        onCountChange={handleCountChange}
        search={filters.q}
        searching={filters.search !== filters.q}
        activeTags={filters.activeTags}
        onClearFilters={filters.clearFilters}
      />
    </AssetPageShell>
  );
}

function LogosBankPage() {
  const { user } = useAuth();
  const isAdmin = user && canDelete(user.role);
  const { hiddenKeys } = useHiddenAssets("logo");
  const filters = useAssetFilters();
  const [visibleCount, setVisibleCount] = useState<number>();

  return (
    <AssetPageShell
      slug="simbolos-e-logotipos"
      title="Símbolos e logotipos"
      searchPlaceholder="Buscar logos…"
      tags={LOGO_TYPES}
      search={filters.search}
      onSearchChange={filters.setSearch}
      activeTags={filters.activeTags}
      onTagToggle={filters.toggleTag}
      count={visibleCount}
      countLabel="logos"
      headerSlot={isAdmin ? <AdminAssetTabs showHidden={filters.showHidden} onShowHiddenChange={filters.setShowHidden} totalCount={LOGOS.length - hiddenKeys.size} hiddenCount={hiddenKeys.size} /> : undefined}
    >
      <LogosBank
        showHidden={filters.showHidden}
        search={filters.q}
        activeTags={filters.activeTags}
        onClearFilters={filters.clearFilters}
        onCountChange={setVisibleCount}
      />
    </AssetPageShell>
  );
}

function ColorBankPage() {
  const filters = useAssetFilters();
  const [visibleCount, setVisibleCount] = useState<number>();
  return (
    <AssetPageShell
      slug="ativos-de-cor"
      title="Ativos de cor"
      searchPlaceholder="Buscar cores…"
      tags={getAllColorTags()}
      search={filters.search}
      onSearchChange={filters.setSearch}
      activeTags={filters.activeTags}
      onTagToggle={filters.toggleTag}
      count={visibleCount}
      countLabel="cores"
    >
      <ColorBank
        search={filters.q}
        activeTags={filters.activeTags}
        onClearFilters={filters.clearFilters}
        onCountChange={setVisibleCount}
      />
    </AssetPageShell>
  );
}

function TypographyBankPage() {
  const filters = useAssetFilters();
  const [visibleCount, setVisibleCount] = useState<number>();
  return (
    <AssetPageShell
      slug="ativos-de-tipografia"
      title="Ativos de tipografia"
      searchPlaceholder="Buscar fontes…"
      search={filters.search}
      onSearchChange={filters.setSearch}
      count={visibleCount}
      countLabel="fontes"
    >
      <TypographyBank
        search={filters.q}
        onClearFilters={filters.clearFilters}
        onCountChange={setVisibleCount}
      />
    </AssetPageShell>
  );
}

function ContentBankPage({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const filters = useAssetFilters();
  const [visibleCount, setVisibleCount] = useState<number>();
  return (
    <AssetPageShell
      slug={slug}
      title={title}
      searchPlaceholder={`Buscar em ${title.toLowerCase()}…`}
      search={filters.search}
      onSearchChange={filters.setSearch}
      count={visibleCount}
      countLabel="itens"
    >
      <ContentBank
        slug={slug}
        search={filters.q}
        searching={filters.search !== filters.q}
        onClearFilters={filters.clearFilters}
        onCountChange={setVisibleCount}
      />
    </AssetPageShell>
  );
}

function IconsPage() {
  const filters = useAssetFilters();
  const [visibleCount, setVisibleCount] = useState<number>();
  return (
    <AssetPageShell
      slug="biblioteca-de-icones"
      title="Biblioteca de ícones"
      searchPlaceholder="Buscar ícones…"
      search={filters.search}
      onSearchChange={filters.setSearch}
      count={visibleCount}
      countLabel="ícones"
    >
      <IconGallery
        syncUrl
        externalSearch={filters.q}
        onClearSearch={filters.clearFilters}
        onCountChange={setVisibleCount}
      />
    </AssetPageShell>
  );
}

const iconMap: Record<string, React.ReactNode> = {
  "visao-geral": <SmHomeSolidIcon className="size-6" />,
  "favoritos": <SmFavoriteLineIcon className="size-6" />,
  "simbolos-e-logotipos": <SmAsteriskLineIcon className="size-6" />,
  "ativos-de-cor": <SmContrastLineIcon className="size-6" />,
  "ativos-de-tipografia": <SmDocLineIcon className="size-6" />,
  "biblioteca-de-icones": <SmAppsLineIcon className="size-6" />,
  "grafismos-e-patterns": <SmCognitionLineIcon className="size-6" />,
  "templates-e-layouts": <SmInvoiceLineIcon className="size-6" />,
  "sons-e-audios": <SmGraphicEqLineIcon className="size-6" />,
  "banco-de-imagens": <SmImageLineIcon className="size-6" />,
  "banco-de-videos": <SmPlaySolidIcon className="size-6" />,
  "banco-de-anuncios": <SmChartLineIcon className="size-6" />,
  "objetos-3d": <SmCognitionLineIcon className="size-6" />,
};

function CategoryEmpty({ category }: { category: AssetCategory }) {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <EmptyState
        icon={iconMap[category.slug]}
        title={category.title}
        description={category.emptyMessage}
        className="border-none"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/assets/visao-geral">Ver categorias disponíveis</Link>
          </Button>
        }
      />
    </div>
  );
}

function OverviewPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Mesma medida de leitura das páginas de documento (`max-w-4xl` + calha). */}
      <div className="mx-auto max-w-4xl px-6 py-10 md:px-8 space-y-8">
        <div className="space-y-8">
          <HeadingTitle as="h1" size="xl" className="leading-none text-balance">
            Assets da Marca
          </HeadingTitle>
          <p className="text-sm text-surface-500 leading-relaxed">
            Este é o repositório central de todos os ativos visuais, sonoros e documentais da Overlens. Aqui você encontra tudo o que precisa para criar, comunicar e representar a marca com consistência.
          </p>
        </div>

        <div className="space-y-4">
          <HeadingTitle as="h2" size="eyebrow">Como funciona</HeadingTitle>
          <div className="space-y-3 text-sm text-surface-500 leading-relaxed">
            <p>
              Os assets estão organizados por categoria no menu lateral. Cada seção contém os arquivos originais prontos para uso; logotipos em SVG, paletas de cor com códigos hexadecimais, fontes tipográficas, ícones do design system, grafismos, templates, sons e imagens.
            </p>
            <p>
              Utilize a busca dentro de cada categoria para localizar ativos específicos. Itens que você usa com frequência podem ser marcados como favoritos para acesso rápido.
            </p>
            <p>
              Todos os assets seguem as diretrizes documentadas no Brand System. Em caso de dúvida sobre aplicação, consulte a seção correspondente na documentação da marca antes de utilizar qualquer ativo.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <HeadingTitle as="h2" size="eyebrow">Categorias disponíveis</HeadingTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { title: "Símbolos e logotipos", desc: "Símbolo, logotipo e sub-marcas em todas as variantes", slug: "simbolos-e-logotipos" },
              { title: "Ativos de cor", desc: "Paleta completa com códigos e tokens de cor", slug: "ativos-de-cor" },
              { title: "Ativos de tipografia", desc: "Fontes do sistema com pesos e diretrizes de uso", slug: "ativos-de-tipografia" },
              { title: "Biblioteca de ícones", desc: "Set completo de ícones em três escalas", slug: "biblioteca-de-icones" },
              { title: "Sons e áudios", desc: "Trilhas, efeitos e referências sonoras da marca", slug: "sons-e-audios" },
              { title: "Banco de imagens", desc: "Fotografias, texturas e imagens aprovadas", slug: "banco-de-imagens" },
              { title: "Banco de vídeos", desc: "Material audiovisual da marca", slug: "banco-de-videos" },
              { title: "Banco de anúncios", desc: "Anúncios pagos com métricas de performance", slug: "banco-de-anuncios" },
            ].map((item) => (
              <Link
                key={item.slug}
                href={`/assets/${item.slug}`}
                className="rounded-lg border border-border bg-surface-950 px-4 py-3 transition-all duration-200 hover:border-foreground/25 hover:bg-surface-900 outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              >
                <p className="text-sm font-medium text-surface-200">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <p className="text-xs text-muted-foreground leading-relaxed">
            O acesso aos assets é restrito a membros com permissão de Staff ou Administrador. Para solicitar acesso ou reportar um ativo ausente, entre em contato com a equipe de marca.
          </p>
        </div>
      </div>
    </div>
  );
}

function AssetCategoryContent({ category }: { category: AssetCategory }) {
  // Overview page
  if (category.slug === "visao-geral") {
    return <OverviewPage />;
  }

  // Favorites page
  if (category.slug === "favoritos") {
    return <FavoritesPage />;
  }

  // Full custom pages (have their own banner/search/tags)
  if (category.slug === "banco-de-videos") {
    return <VideoBank />;
  }

  if (category.slug === "banco-de-anuncios") {
    return <AdBank />;
  }

  if (category.slug === "sons-e-audios") {
    return <MusicBank />;
  }

  // Pages with content inside the shell
  if (category.slug === "simbolos-e-logotipos") {
    return <LogosBankPage />;
  }

  if (category.slug === "ativos-de-cor") {
    return <ColorBankPage />;
  }

  if (category.slug === "ativos-de-tipografia") {
    return <TypographyBankPage />;
  }

  if (category.slug === "biblioteca-de-icones") {
    return <IconsPage />;
  }

  if (category.slug === "banco-de-imagens") {
    return <ImageBankPage />;
  }

  // Content categories with file + link uploads
  if (
    category.slug === "templates-e-layouts" ||
    category.slug === "documentacao" ||
    category.slug === "objetos-3d"
  ) {
    return <ContentBankPage slug={category.slug} title={category.title} />;
  }

  // Empty pages with shell (grafismos, etc.)
  return (
    <AssetPageShell slug={category.slug} title={category.title}>
      <CategoryEmpty category={category} />
    </AssetPageShell>
  );
}

export function AssetCategoryPage({ category }: { category: AssetCategory }) {
  // As páginas de assets são pré-renderizadas; `useSearchParams` (via useUrlState)
  // exige um Suspense acima para não bloquear o build.
  return (
    <Suspense fallback={<ListSkeleton className="container-content pt-10" />}>
      <AssetCategoryContent category={category} />
    </Suspense>
  );
}
