/*
  Product schema definition for vendor‑added products.
  This file lives in `ui/types/product.ts` and can be imported wherever a product
  shape is needed (e.g., API payloads, Zustand stores, form validation).
*/

/**
 * TypeScript interface representing a product.
 */
export interface Product {
  /** Unique identifier for the product */
  id: string;
  /** Human‑readable name of the product */
  name: string;
  /** Detailed description (optional) */
  description?: string;
  /** Price in the smallest currency unit (e.g., cents) */
  priceCents: number;
  /** Currency code, e.g., "USD" */
  currency: string;
  /** Array of image URLs for the product */
  images: string[];
  /** Category identifiers the product belongs to */
  categoryIds: string[];
  /** SKU or reference code (optional) */
  sku?: string;
  /** Current stock quantity */
  stock: number;
  /** Indicates whether the product is active/visible */
  isActive: boolean;
  /** Identifier of the vendor that owns the product */
  vendorId: string;
  /** Timestamp of creation (ISO string) */
  createdAt: string;
  /** Timestamp of last update (ISO string) */
  updatedAt: string;
}

/**
 * JSON‑Schema (draft‑07) version of the product shape. Useful for server‑side
 * validation, OpenAPI specs, or runtime schema checks.
 */
export const productJsonSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Product",
  type: "object",
  required: [
    "id",
    "name",
    "priceCents",
    "currency",
    "images",
    "categoryIds",
    "stock",
    "isActive",
    "vendorId",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string", minLength: 1 },
    description: { type: "string" },
    priceCents: { type: "integer", minimum: 0 },
    currency: { type: "string", minLength: 3, maxLength: 3 },
    images: { type: "array", items: { type: "string", format: "uri" } },
    categoryIds: { type: "array", items: { type: "string" } },
    sku: { type: "string" },
    stock: { type: "integer", minimum: 0 },
    isActive: { type: "boolean" },
    vendorId: { type: "string", format: "uuid" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
  additionalProperties: false,
} as const;
