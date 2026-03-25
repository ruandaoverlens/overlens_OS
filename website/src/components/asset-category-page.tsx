"use client";

import Link from "next/link";
import type { AssetCategory } from "@/lib/assets";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  SmHomeSolidIcon,
  SmFavoriteLineIcon,
  SmHistoryLineIcon,
  SmFolderLineIcon,
  SmDocLineIcon,
  SmAsteriskLineIcon,
  SmContrastLineIcon,
  SmAppsLineIcon,
  SmCognitionLineIcon,
  SmInvoiceLineIcon,
  SmGraphicEqLineIcon,
  SmImageLineIcon,
  SmPlaySolidIcon,
} from "@/components/icons";
import { AssetPageShell } from "@/components/asset-page-shell";
import { VideoBank } from "@/components/video-bank";
import { MusicBank } from "@/components/music-bank";
import { LogosBank, LOGOS } from "@/components/logos-bank";
import { ColorBank } from "@/components/color-bank";
import { TypographyBank } from "@/components/typography-bank";
import { ImageBank, getAllImageTags } from "@/components/image-bank";
import { IconGallery } from "@/components/icons/icon-gallery";
import { FavoritesPage } from "@/components/favorites-page";
import { useState, useCallback } from "react";
import { useAuth, canDelete } from "@/lib/auth";
import { useHiddenAssets } from "@/lib/hidden-assets";
import { AdminAssetTabs } from "@/components/admin-asset-tabs";

function ImageBankPage() {
  const { user } = useAuth();
  const isAdmin = user && canDelete(user.role);
  const [showHidden, setShowHidden] = useState(false);
  const [counts, setCounts] = useState({ visible: 0, hidden: 0 });

  const handleCountChange = useCallback((visible: number, hidden: number) => {
    setCounts({ visible, hidden });
  }, []);

  return (
    <AssetPageShell
      slug="banco-de-imagens"
      title="Banco de imagens"
      searchPlaceholder="Buscar imagens..."
      tags={getAllImageTags()}
      contentClassName="flex-1 overflow-y-auto px-1 pt-[40px] max-w-[1920px] mx-auto w-full"
      gradient="linear-gradient(135deg, #4A5FA8 0%, #7B8FCC 50%, #B4C0E8 100%)"
      headerSlot={isAdmin ? <AdminAssetTabs showHidden={showHidden} onShowHiddenChange={setShowHidden} totalCount={counts.visible} hiddenCount={counts.hidden} /> : undefined}
    >
      <ImageBank showHidden={showHidden} onCountChange={handleCountChange} />
    </AssetPageShell>
  );
}

function LogosBankPage() {
  const { user } = useAuth();
  const isAdmin = user && canDelete(user.role);
  const [showHidden, setShowHidden] = useState(false);
  const { hiddenKeys } = useHiddenAssets("logo");

  return (
    <AssetPageShell
      slug="simbolos-e-logotipos"
      title="Símbolos e logotipos"
      searchPlaceholder="Buscar logos..."
      headerSlot={isAdmin ? <AdminAssetTabs showHidden={showHidden} onShowHiddenChange={setShowHidden} totalCount={LOGOS.length - hiddenKeys.size} hiddenCount={hiddenKeys.size} /> : undefined}
    >
      <LogosBank showHidden={showHidden} />
    </AssetPageShell>
  );
}

function IconsPage() {
  const [search, setSearch] = useState("");
  return (
    <AssetPageShell
      slug="biblioteca-de-icones"
      title="Biblioteca de ícones"
      searchPlaceholder="Buscar ícones..."
      search={search}
      onSearchChange={setSearch}
    >
      <IconGallery externalSearch={search} />
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
  "objetos-3d": <SmCognitionLineIcon className="size-6" />,
};

function EmptyState({ category }: { category: AssetCategory }) {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <Empty className="border-none">
        <EmptyHeader>
          <EmptyMedia contained>
            {iconMap[category.slug]}
          </EmptyMedia>
          <EmptyTitle>{category.title}</EmptyTitle>
          <EmptyDescription>{category.emptyMessage}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}

function OverviewPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <div className="space-y-8">
          <h1 className="font-heading text-[40px] font-normal uppercase tracking-normal leading-none text-balance">Assets da Marca</h1>
          <p className="text-sm text-white/60 leading-relaxed">
            Este é o repositório central de todos os ativos visuais, sonoros e documentais da Overlens. Aqui você encontra tudo o que precisa para criar, comunicar e representar a marca com consistência.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs text-white/40 uppercase tracking-wider">Como funciona</h2>
          <div className="space-y-3 text-sm text-white/60 leading-relaxed">
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
          <h2 className="text-xs text-white/40 uppercase tracking-wider">Categorias disponíveis</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { title: "Símbolos e logotipos", desc: "Símbolo, logotipo e sub-marcas em todas as variantes", slug: "simbolos-e-logotipos" },
              { title: "Ativos de cor", desc: "Paleta completa com códigos e tokens de cor", slug: "ativos-de-cor" },
              { title: "Ativos de tipografia", desc: "Fontes do sistema com pesos e diretrizes de uso", slug: "ativos-de-tipografia" },
              { title: "Biblioteca de ícones", desc: "Set completo de ícones em três escalas", slug: "biblioteca-de-icones" },
              { title: "Sons e áudios", desc: "Trilhas, efeitos e referências sonoras da marca", slug: "sons-e-audios" },
              { title: "Banco de imagens", desc: "Fotografias, texturas e imagens aprovadas", slug: "banco-de-imagens" },
              { title: "Banco de vídeos", desc: "Material audiovisual da marca", slug: "banco-de-videos" },
            ].map((item) => (
              <Link
                key={item.slug}
                href={`/assets/${item.slug}`}
                className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 transition-all duration-200 hover:border-white/15 hover:bg-white/[0.05]"
              >
                <p className="text-sm font-medium text-white/80">{item.title}</p>
                <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 pt-6">
          <p className="text-xs text-white/30 leading-relaxed">
            O acesso aos assets é restrito a membros com permissão de Staff ou Administrador. Para solicitar acesso ou reportar um ativo ausente, entre em contato com a equipe de marca.
          </p>
        </div>
      </div>
    </div>
  );
}

export function AssetCategoryPage({ category }: { category: AssetCategory }) {
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

  if (category.slug === "sons-e-audios") {
    return <MusicBank />;
  }

  // Pages with content inside the shell
  if (category.slug === "simbolos-e-logotipos") {
    return <LogosBankPage />;
  }

  if (category.slug === "ativos-de-cor") {
    return (
      <AssetPageShell
        slug="ativos-de-cor"
        title="Ativos de cor"
        searchPlaceholder="Buscar cores..."
        tags={["primary", "secondary", "tertiary"]}
        gradient="linear-gradient(135deg, #8A3060 0%, #C47098 50%, #E8B0CC 100%)"
      >
        <ColorBank />
      </AssetPageShell>
    );
  }

  if (category.slug === "ativos-de-tipografia") {
    return (
      <AssetPageShell
        slug="ativos-de-tipografia"
        title="Ativos de tipografia"
        searchPlaceholder="Buscar fontes..."
      >
        <TypographyBank />
      </AssetPageShell>
    );
  }

  if (category.slug === "biblioteca-de-icones") {
    return <IconsPage />;
  }

  if (category.slug === "banco-de-imagens") {
    return <ImageBankPage />;
  }

  // Empty pages with shell (grafismos, templates, docs, 3d, etc.)
  return (
    <AssetPageShell
      slug={category.slug}
      title={category.title}
      searchPlaceholder={`Buscar em ${category.title.toLowerCase()}...`}
    >
      <EmptyState category={category} />
    </AssetPageShell>
  );
}
