"use client";

import {
  Banner,
  BannerImage,
  BannerContent,
  BannerTitle,
  BannerDescription,
} from "@/components/ui/banner";
import { getGradient } from "@/lib/brand-gradients";

export function PageBanner({ title, description }: { title: string; description?: string | null }) {
  return (
    <Banner size="md">
      {/* Os gradientes de marca terminam num pastel quase branco. No tema
          claro esse canto se dissolve no fundo da página, então uma borda
          fina (herdada do tema) mantém o recorte do banner visível. */}
      <BannerImage gradient={getGradient(title)} className="border border-border" />
      <BannerContent>
        <BannerTitle>{title}</BannerTitle>
        {description && (
          <BannerDescription>{description}</BannerDescription>
        )}
      </BannerContent>
    </Banner>
  );
}
