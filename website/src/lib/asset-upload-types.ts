// ─── Asset Upload Type System ───────────────────────────────────

export type UploadFieldType =
  | "text"
  | "textarea"
  | "select"
  | "tags"
  | "switch"
  | "number"

export interface SelectOption {
  value: string
  label: string
}

export interface UploadFieldConfig {
  name: string
  label: string
  type: UploadFieldType
  required?: boolean
  placeholder?: string
  options?: SelectOption[]
  helperText?: string
}

export interface AssetUploadConfig {
  /** Must match the asset category slug */
  slug: string
  /** Modal title */
  title: string
  /** Modal description */
  description: string
  /** File input accept attribute (e.g. ".svg,.png,.ai") */
  accept: string
  /** Max file size in MB */
  maxSizeMB: number
  /** Allow multiple files */
  multiple: boolean
  /** Metadata fields specific to this asset type */
  fields: UploadFieldConfig[]
}

/** Form values collected from upload modal */
export type UploadFormValues = Record<string, string | string[] | boolean | number>

/** Payload sent on submit */
export interface UploadPayload {
  files: File[]
  metadata: UploadFormValues
  assetType: string
  uploadedBy: {
    id: string
    name: string
    email: string
  }
  uploadedAt: string
}
