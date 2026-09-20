"use client";

import Image from "next/image";
import Link from "next/link";
// Ícones lucide mantidos: não há equivalente em @/components/icons para
// QrCode, Palette (paleta), ArrowLeftRight (conversão), Sparkles (IA) e
// FileVideo (transcrição). Ver src/components/icons/lucide-mapping.ts.
import { QrCode, Palette, ArrowLeftRight, Sparkles, FileVideo } from "lucide-react";
import type { ComponentType } from "react";
import { MdImageLineIcon, MdClockLineIcon, MdLink2LineIcon } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { HeadingTitle } from "@/components/ui/heading";

interface Tool {
  name: string;
  description: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  image: string;
  status: "disponivel" | "em-breve";
}

const tools: Tool[] = [
  {
    name: "Gerador de QR Code",
    description: "Crie QR Codes personalizados com cores e logo da marca.",
    href: "/ferramentas/qr-code",
    icon: QrCode,
    image: "/ferramentas/qr-code.jpg",
    status: "disponivel",
  },
  {
    name: "Otimizador de Imagens",
    description: "Comprima e redimensione imagens sem perder qualidade.",
    href: "/ferramentas/otimizador-imagens",
    icon: MdImageLineIcon,
    image: "/ferramentas/otimizador-imagens.jpg",
    status: "disponivel",
  },
  {
    name: "Conversor de Cores",
    description: "Converta entre HEX, RGB, HSL e outros formatos de cor.",
    href: "/ferramentas/conversor-cores",
    icon: Palette,
    image: "/ferramentas/conversor-cores.jpg",
    status: "disponivel",
  },
  {
    name: "Conversor de Formato",
    description: "Converta imagens entre PNG, JPG, WebP e outros formatos.",
    href: "/ferramentas/conversor-formato",
    icon: ArrowLeftRight,
    image: "/ferramentas/conversor-formato.jpg",
    status: "disponivel",
  },
  {
    name: "Otimizador de Prompts",
    description: "Estruture e melhore seus prompts para IA generativa.",
    href: "/ferramentas/otimizador-prompts",
    icon: Sparkles,
    image: "/ferramentas/otimizador-prompts.jpg",
    status: "disponivel",
  },
  {
    name: "Calculadora de Tempo",
    description: "Estime quanto tempo um projeto ou tarefa vai levar.",
    href: "/ferramentas/calculadora-tempo",
    icon: MdClockLineIcon,
    image: "/ferramentas/calculadora-tempo.jpg",
    status: "disponivel",
  },
  {
    name: "Transcritor de Vídeo",
    description: "Transcreva vídeos automaticamente para texto editável.",
    href: "/ferramentas/transcritor",
    icon: FileVideo,
    image: "/ferramentas/transcritor.jpg",
    status: "em-breve",
  },
  {
    name: "Encurtador de Links",
    description: "Encurte e rastreie links para suas campanhas.",
    href: "/ferramentas/encurtador",
    icon: MdLink2LineIcon,
    image: "/ferramentas/encurtador.jpg",
    status: "em-breve",
  },
];

const cardClassName =
  "group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:border-border hover:shadow-lg hover:shadow-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function FerramentasPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader
        title="Botões Mágicos"
        description="Micro-ferramentas para o dia a dia de quem cria. Rápidas, práticas e direto ao ponto."
        className="mb-6"
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          const available = tool.status === "disponivel";

          const content = (
            <>
              {/* Image hero area */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={tool.image}
                  alt=""
                  fill
                  // Os 3 primeiros cards ficam acima da dobra (candidatos a LCP).
                  priority={index < 3}
                  className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Icon centered */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 transition-transform duration-300 motion-safe:group-hover:scale-110">
                    <Icon className="size-8 text-white drop-shadow-md" aria-hidden="true" />
                  </div>
                </div>

                {!available && (
                  <span className="absolute top-3 right-3 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
                    Em breve
                  </span>
                )}
              </div>

              {/* Info area */}
              <div className="flex flex-1 flex-col gap-1.5 p-5">
                <HeadingTitle as="h2" size="sm" className="text-base leading-tight">{tool.name}</HeadingTitle>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </>
          );

          return available ? (
            <Link key={tool.name} href={tool.href} className={cardClassName}>
              {content}
            </Link>
          ) : (
            <div key={tool.name} className={cardClassName} aria-disabled="true">
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
