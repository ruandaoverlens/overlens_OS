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
      <BannerImage gradient={getGradient(title)} />
      <BannerContent>
        <BannerTitle>{title}</BannerTitle>
        {description && (
          <BannerDescription>{description}</BannerDescription>
        )}
      </BannerContent>
    </Banner>
  );
}
