export interface Variant {
  variantId: string;
  productId: string;
  productTitle: string;
  variantTitle: string;
  sku: string | null;
  tracked: boolean;
  sellWhenEmpty: boolean;
  available: number;
  soldLast30Days: number;
}

export interface Finding {
  type: string;
  severity: "high" | "medium" | "low";
  variantId: string;
  message: string;
  fix: string;
}
