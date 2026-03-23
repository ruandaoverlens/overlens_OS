import type { AssetUploadConfig } from "@/lib/asset-upload-types"
import { identityAssetConfigs } from "./identity-assets"
import { mediaAssetConfigs } from "./media-assets"
import { audioTypeAssetConfigs } from "./audio-type-assets"
import { contentAssetConfigs } from "./content-assets"

/** All upload configs, indexed by asset category slug */
const allConfigs: AssetUploadConfig[] = [
  ...identityAssetConfigs,
  ...mediaAssetConfigs,
  ...audioTypeAssetConfigs,
  ...contentAssetConfigs,
]

const configMap = new Map<string, AssetUploadConfig>(
  allConfigs.map((c) => [c.slug, c])
)

/** Get the upload config for a given asset category slug */
export function getUploadConfig(slug: string): AssetUploadConfig | undefined {
  return configMap.get(slug)
}

/** Check if a slug has an upload config */
export function hasUploadConfig(slug: string): boolean {
  return configMap.has(slug)
}

export { allConfigs }
