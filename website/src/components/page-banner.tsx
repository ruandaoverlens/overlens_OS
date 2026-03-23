"use client";

import {
  Banner,
  BannerImage,
  BannerContent,
  BannerTitle,
  BannerDescription,
} from "@/components/ui/banner";

// ─── Gradient palette (light gradients to activate inverted mode) ───

const GRADIENTS = [
  "linear-gradient(135deg, #77C5D5 0%, #A8DDE8 50%, #D4F0F7 100%)",  // Atmos
  "linear-gradient(135deg, #D6A461 0%, #E8C98A 50%, #F5E6C4 100%)",  // Sahara
  "linear-gradient(135deg, #3A913F 0%, #6BBF6F 50%, #A8DFA9 100%)",  // Midori
  "linear-gradient(135deg, #8A3060 0%, #C47098 50%, #E8B0CC 100%)",  // Boreal
  "linear-gradient(135deg, #4A5FA8 0%, #7B8FCC 50%, #B4C0E8 100%)",  // Kobold
  "linear-gradient(135deg, #F87C56 0%, #FBA98A 50%, #FDD4C4 100%)",  // Carota
  "linear-gradient(135deg, #5A9B9B 0%, #88C4C4 50%, #C0E4E4 100%)",  // Bleu
  "linear-gradient(135deg, #E8D44D 0%, #F0E27A 50%, #F8F0B0 100%)",  // Cloro
  "linear-gradient(135deg, #DC625E 0%, #EB9290 50%, #F5C4C3 100%)",  // Khewra
  "linear-gradient(135deg, #F4C3CC 0%, #F8D8DE 50%, #FCF0F2 100%)",  // Calla
  "linear-gradient(135deg, #8BAF6A 0%, #B0CF96 50%, #D4E8C4 100%)",  // Azzay
  "linear-gradient(135deg, #FBDD7A 0%, #FCEAA3 50%, #FEF5D4 100%)",  // Nubia
] as const;

/** Deterministic gradient from a string hash. */
function getGradient(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

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
