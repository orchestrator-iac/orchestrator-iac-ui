/**
 * Curated policy-as-code categories, shared between the findings dialog and
 * the policy scan settings picker in the orchestrator menu. Keys must match
 * the backend's CURATED_POLICY_CATEGORIES keys exactly
 * (orchestrator-iac-backend/src/utils/curated_policy_checks.py).
 */
export const POLICY_CATEGORY_LABELS: Record<string, string> = {
  encryption: "Encryption",
  "public-exposure": "Public exposure",
  tagging: "Tagging",
  naming: "Naming",
  other: "Other",
};

export const POLICY_CATEGORY_KEYS = Object.keys(POLICY_CATEGORY_LABELS).filter(
  (key) => key !== "other",
);

export const policyCategoryLabel = (category?: string): string =>
  POLICY_CATEGORY_LABELS[category || "other"] || "Other";
