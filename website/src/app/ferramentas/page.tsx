"use client";

import Image from "next/image";
import { QrCode, FileVideo, ImageDown, Palette, ArrowLeftRight, Sparkles, Clock, Link2 } from "lucide-react";
import type { ComponentType } from "react";

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
    status: "em-breve",
  },
  {
    name: "Otimizador de Imagens",
    description: "Comprima e redimensione imagens sem perder qualidade.",
    href: "/ferramentas/otimizador-imagens",
    icon: ImageDown,
    image: "/ferramentas/otimizador-imagens.jpg",
    status: "em-breve",
  },
  {
    name: "Conversor de Cores",
    description: "Converta entre HEX, RGB, HSL e outros formatos de cor.",
    href: "/ferramentas/conversor-cores",
    icon: Palette,
    image: "/ferramentas/conversor-cores.jpg",
    status: "em-breve",
  },
  {
    name: "Conversor de Formato",
    description: "Converta imagens entre PNG, JPG, WebP e outros formatos.",
    href: "/ferramentas/conversor-formato",
    icon: ArrowLeftRight,
    image: "/ferramentas/conversor-formato.jpg",
    status: "em-breve",
  },
  {
    name: "Otimizador de Prompts",
    description: "Estruture e melhore seus prompts para IA generativa.",
    href: "/ferramentas/otimizador-prompts",
    icon: Sparkles,
    image: "/ferramentas/otimizador-prompts.jpg",
    status: "em-breve",
  },
  {
    name: "Calculadora de Tempo",
    description: "Estime quanto tempo um projeto ou tarefa vai levar.",
    href: "/ferramentas/calculadora-tempo",
    icon: Clock,
    image: "/ferramentas/calculadora-tempo.jpg",
    status: "em-breve",
  },
  {
    name: "Transcritor de Video",
    description: "Transcreva videos automaticamente para texto editavel.",
    href: "/ferramentas/transcritor",
    icon: FileVideo,
    image: "/ferramentas/transcritor.jpg",
    status: "em-breve",
  },
  {
    name: "Encurtador de Links",
    description: "Encurte e rastreie links para suas campanhas.",
    href: "/ferramentas/encurtador",
    icon: Link2,
    image: "/ferramentas/encurtador.jpg",
    status: "em-breve",
  },
];

export default function FerramentasPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Botoes Magicos</h1>
        <p className="mt-2 text-muted-foreground">
          Micro-ferramentas para o dia a dia do criador. Rapidas, praticas e direto ao ponto.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon;

          return (
            <div
              key={tool.name}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:border-border hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20"
            >
              {/* Image hero area */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={tool.image}
                  alt={tool.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Icon centered */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="size-8 text-white drop-shadow-md" />
                  </div>
                </div>

                {/* Em breve badge */}
                <span className="absolute top-3 right-3 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
                  Em breve
                </span>
              </div>

              {/* Info area */}
              <div className="flex flex-1 flex-col gap-1.5 p-5">
                <h3 className="text-base font-semibold leading-tight">{tool.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
