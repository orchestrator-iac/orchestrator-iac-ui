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

export const POLICY_CATEGORY_DESCRIPTIONS: Record<string, string> = {
  encryption:
    "Checks for missing encryption controls, weak defaults, or unsafe storage configuration.",
  "public-exposure":
    "Flags resources or policies that may expose data, services, or network surfaces publicly.",
  tagging:
    "Looks for missing ownership, cost, environment, or lifecycle tags that support governance.",
  naming:
    "Validates naming patterns so resources stay consistent, searchable, and automation-friendly.",
  other: "Additional advisory checks that do not fit one of the core categories.",
};

export const POLICY_CATEGORY_KEYS = Object.keys(POLICY_CATEGORY_LABELS).filter(
  (key) => key !== "other",
);

export const policyCategoryLabel = (category?: string): string =>
  POLICY_CATEGORY_LABELS[category || "other"] || "Other";

export const policyCategoryDescription = (category?: string): string =>
  POLICY_CATEGORY_DESCRIPTIONS[category || "other"] || POLICY_CATEGORY_DESCRIPTIONS.other;
