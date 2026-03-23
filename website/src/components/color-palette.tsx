"use client"

import { useEffect, useState } from "react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

interface BrandColor {
  name: string
  oklch: string
  cssVar: string
  family: string
  description: string
  cmyk: string
  pantone: string
}

interface ColorGroup {
  title: string
  description: string
  colors: BrandColor[]
  columns?: string
}

const COLOR_GROUPS: ColorGroup[] = [
  {
    title: "Primary",
    description:
      "A Primary Color é a cor principal da marca, utilizada para elementos de maior destaque, reconhecimento e direção visual, como ações principais, pontos de foco e elementos que definem o caráter do produto.",
    colors: [
      { name: "Atmos", oklch: "oklch(0.779 0.08 212.201)", cssVar: "--brand-atmos", family: "Azul Gelo", description: "Clareza, racionalidade, profundidade analítica", cmyk: "44 / 8 / 0 / 16", pantone: "551 C" },
    ],
  },
  {
    title: "Secondary",
    description:
      "Secondary Colors funcionam como suporte estratégico à primária. Elas ampliam a capacidade de composição visual, permitindo variações, hierarquia e diferenciação sem comprometer a consistência do sistema. São ideais para complementar interfaces, criar contraste contextual e enriquecer a linguagem visual mantendo coerência.",
    colors: [
      { name: "Kobold", oklch: "oklch(0.477 0.116 243.133)", cssVar: "--brand-kobold", family: "Púrpura Profundo", description: "Mistério, conhecimento oculto, profundidade", cmyk: "68 / 38 / 0 / 37", pantone: "7685 C" },
      { name: "Midori", oklch: "oklch(0.585 0.145 144.414)", cssVar: "--brand-midori", family: "Verde Musgo", description: "Natureza, estabilidade, equilíbrio", cmyk: "60 / 0 / 57 / 43", pantone: "7740 C" },
      { name: "Sahara", oklch: "oklch(0.751 0.103 73.232)", cssVar: "--brand-sahara", family: "Âmbar", description: "Faísca, energia, atenção pontual", cmyk: "0 / 23 / 55 / 16", pantone: "7407 C" },
      { name: "Boreal", oklch: "oklch(0.462 0.126 352.763)", cssVar: "--brand-boreal", family: "Bordô", description: "Seriedade, ética, alerta intenso", cmyk: "0 / 62 / 18 / 46", pantone: "7649 C" },
    ],
  },
  {
    title: "Tertiary",
    description:
      "As Tertiary Colors são cores de apoio utilizadas para ampliar o repertório visual, principalmente em situações de categorização, ilustrações, gráficos ou composições mais ricas. Elas não devem ser usadas como base dominante da interface e não é recomendado harmonizar tertiary com tertiary, pois isso pode gerar ruído visual e perda de hierarquia. O uso mais consistente acontece quando as cores terciárias são combinadas com secondary colors, criando equilíbrio cromático e mantendo clareza estrutural no layout.",
    colors: [
      { name: "Bleu", oklch: "oklch(0.622 0.066 217.111)", cssVar: "--brand-bleu", family: "Azul Médio", description: "Equilíbrio entre razão e sensibilidade", cmyk: "36 / 9 / 0 / 32", pantone: "5503 C" },
      { name: "Cotta", oklch: "oklch(0.42 0.133 24.432)", cssVar: "--brand-cotta", family: "Vermelho Escuro", description: "Gravidade, profundidade, alerta ético", cmyk: "0 / 65 / 73 / 46", pantone: "7622 C" },
      { name: "Antar", oklch: "oklch(0.893 0.04 216.4)", cssVar: "--brand-antar", family: "Azul Claro", description: "Leveza, abertura, respiro visual", cmyk: "14 / 3 / 0 / 13", pantone: "5523 C" },
      { name: "Azzay", oklch: "oklch(0.605 0.042 130.689)", cssVar: "--brand-azzay", family: "Sage", description: "Sutileza, maturidade, equilíbrio discreto", cmyk: "13 / 0 / 26 / 43", pantone: "5773 C" },
      { name: "Cloro", oklch: "oklch(0.911 0.098 112.581)", cssVar: "--brand-cloro", family: "Amarelo Claro", description: "Luminosidade, clareza, energia sutil", cmyk: "0 / 5 / 60 / 10", pantone: "611 C" },
      { name: "Arena", oklch: "oklch(0.944 0.065 94.953)", cssVar: "--brand-arena", family: "Creme", description: "Base neutra, contenção, respiro", cmyk: "0 / 7 / 31 / 4", pantone: "7402 C" },
      { name: "Carota", oklch: "oklch(0.722 0.161 37.732)", cssVar: "--brand-carota", family: "Laranja", description: "Impulso criativo, ação, calor expressivo", cmyk: "0 / 50 / 65 / 3", pantone: "1645 C" },
      { name: "Nubia", oklch: "oklch(0.902 0.123 92.922)", cssVar: "--brand-nubia", family: "Amarelo Dourado", description: "Riqueza, capital simbólico, valor", cmyk: "0 / 12 / 51 / 2", pantone: "127 C" },
      { name: "Calla", oklch: "oklch(0.863 0.057 6.005)", cssVar: "--brand-calla", family: "Malva", description: "Delicadeza, sensibilidade, nuance", cmyk: "0 / 20 / 16 / 4", pantone: "691 C" },
    ],
  },
  {
    title: "Acessibilidade",
    description:
      "As cores de Acessibilidade são cores funcionais utilizadas para comunicar feedbacks e estados da interface como sucesso, aviso, erro e informações; priorizando contraste, legibilidade e reconhecimento imediato. Seu papel é garantir clareza na comunicação do sistema e apoio à usabilidade, devendo ser aplicadas apenas em contextos de feedback e status, e não como elementos decorativos ou de identidade visual.",
    colors: [
      { name: "Midori", oklch: "oklch(0.585 0.145 144.414)", cssVar: "--brand-midori", family: "Success", description: "Confirmação, conclusão positiva, estado válido", cmyk: "60 / 0 / 57 / 43", pantone: "7740 C" },
      { name: "Sahara", oklch: "oklch(0.751 0.103 73.232)", cssVar: "--brand-sahara", family: "Warning", description: "Atenção, alerta não-crítico, cuidado", cmyk: "0 / 23 / 55 / 16", pantone: "7407 C" },
      { name: "Atmos", oklch: "oklch(0.779 0.08 212.201)", cssVar: "--brand-atmos", family: "Info", description: "Informação contextual, orientação, dica", cmyk: "44 / 8 / 0 / 16", pantone: "551 C" },
      { name: "Khewra", oklch: "oklch(0.646 0.154 24.222)", cssVar: "--brand-khewra", family: "Destructive", description: "Erro, falha, ação destrutiva, urgência", cmyk: "0 / 55 / 57 / 14", pantone: "7418 C" },
    ],
  },
]

function oklchToHex(oklchValue: string): string {
  try {
    const canvas = document.createElement("canvas")
    canvas.width = canvas.height = 1
    const ctx = canvas.getContext("2d")
    if (!ctx) return ""
    ctx.fillStyle = oklchValue
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase()
  } catch {
    return ""
  }
}

function ColorValue({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="flex w-full items-center justify-between rounded-md bg-accent/30 px-2.5 py-1.5 text-xs transition-colors hover:bg-accent/50 cursor-copy"
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-foreground">
        {copied ? "Copiado!" : value}
      </span>
    </button>
  )
}

function ColorCard({ color }: { color: BrandColor }) {
  const [hex, setHex] = useState("")

  useEffect(() => {
    setHex(oklchToHex(color.oklch))
  }, [color.oklch])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="group flex flex-col overflow-hidden rounded-xl border border-border/40 bg-accent/20 transition-all hover:bg-accent/40 hover:border-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-left">
          <div
            className="h-32 w-full transition-transform group-hover:scale-[1.02]"
            style={{ backgroundColor: `var(${color.cssVar})` }}
          />
          <div className="px-3 py-2.5">
            <span className="block text-sm font-medium text-foreground">
              {color.name}
            </span>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72" side="top" sideOffset={8}>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 shrink-0 rounded-lg border border-border/30"
              style={{ backgroundColor: `var(${color.cssVar})` }}
            />
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                {color.name}
              </h4>
              <p className="text-xs text-muted-foreground">{color.family}</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {color.description}
          </p>
          <div className="space-y-1.5">
            {hex && <ColorValue label="HEX" value={hex} />}
            <ColorValue label="OKLCh" value={color.oklch} />
            <ColorValue label="CSS" value={`var(${color.cssVar})`} />
            <ColorValue label="CMYK" value={color.cmyk} />
            <ColorValue label="Pantone" value={color.pantone} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ColorSection({ group }: { group: ColorGroup }) {
  const gridClass = group.columns ?? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <h3 className="font-body text-lg font-medium text-foreground">
          {group.title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {group.description}
        </p>
      </div>
      <div className={`grid gap-3 ${gridClass}`}>
        {group.colors.map((color) => (
          <ColorCard key={`${group.title}-${color.name}`} color={color} />
        ))}
      </div>
    </div>
  )
}

export function ColorPalette() {
  return (
    <div className="space-y-10">
      {COLOR_GROUPS.map((group) => (
        <ColorSection key={group.title} group={group} />
      ))}
    </div>
  )
}
